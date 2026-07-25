import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import type { Agent } from "./types"
import { projectRoot } from "./constants"
import { dumpMemoryMarkdown } from "./memory"

/**
 * OpenCode plugin source with PASSIVE memory injection. OpenCode 1.17+ delivers
 * hooks via plugins (not a top-level `hooks` config key), so `init` writes this
 * file into `.opencode/plugins/`.
 */
export function opencodePluginContent(): string {
  return `import * as fs from "fs"

export const ToonMemory = async ({ $, directory, worktree }) => {
  const root = worktree || directory
  const INS = root + "/.opencode/instructions"
  const OUT = INS + "/memory-autoload.md"
  const dump = async () => {
    return await $\`npx -y toon-memory dump\`.cwd(root).text()
  }
  const write = (text) => {
    fs.mkdirSync(INS, { recursive: true })
    fs.writeFileSync(OUT, text)
  }
  return {
    "session.created": async () => {
      try {
        const out = await dump()
        write(out)
      } catch {}
    },
    "experimental.session.compacting": async ({ output }) => {
      try {
        const out = await dump()
        if (Array.isArray(output?.context)) output.context.push(out)
      } catch {}
    },
    "tool.execute.after": async (input) => {
      if (!process.env.TOON_MEMORY_CAPTURE) return
      const cap = directory + "/bin/cli/capture.js"
      try {
        const payload = JSON.stringify({
          session_id: input?.session?.id ?? "",
          tool_name: input?.tool ?? "",
          tool_input: input?.args ?? {},
        })
        await $\`node \${cap} opencode\`.stdin(payload).quiet()
      } catch {}
    },
  }
}
`
}

/**
 * Install the toon-memory OpenCode plugin and remove any stale `hooks` key.
 */
export function installOpenCodePlugin(agent: Agent): void {
  const pluginsDir = join(projectRoot, ".opencode", "plugins")
  if (!existsSync(pluginsDir)) mkdirSync(pluginsDir, { recursive: true })

  const dest = join(pluginsDir, "toon-memory.ts")
  writeFileSync(dest, opencodePluginContent())
  console.log(`  Plugin created at ${dest}`)

  const instrDir = join(projectRoot, ".opencode", "instructions")
  if (!existsSync(instrDir)) mkdirSync(instrDir, { recursive: true })
  const instrFile = join(instrDir, "memory-autoload.md")
  writeFileSync(instrFile, dumpMemoryMarkdown())
  console.log(`  Seeded ${instrFile}`)

  const configPath = agent.local || agent.global
  if (configPath && existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, "utf-8"))
      if (config.hooks) {
        delete config.hooks
        writeFileSync(configPath, JSON.stringify(config, null, 2))
        console.log(`  Removed stale "hooks" key from ${configPath}`)
      }
    } catch {}
  }
}
