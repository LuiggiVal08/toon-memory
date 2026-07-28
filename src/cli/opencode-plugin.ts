import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import type { Agent } from "./types"
import { projectRoot } from "./constants"
import { dumpMemoryMarkdown } from "./memory"

/**
 * OpenCode plugin source with INTELLIGENT memory injection. OpenCode 1.17+
 * delivers hooks via plugins (not a top-level `hooks` config key), so `init`
 * writes this file into `.opencode/plugins/`.
 *
 * Two injection modes:
 *   1. Session start → full dump (seeded in instructions/)
 *   2. Tool execution → targeted recall by file path (injected via output.context)
 */
export function opencodePluginContent(): string {
  return `import * as fs from "fs"
import * as path from "path"

export const ToonMemory = async ({ $, directory, worktree }) => {
  const root = worktree || directory
  const INS = root + "/.opencode/instructions"
  const OUT = INS + "/memory-autoload.md"

  const dump = async () => {
    return await $\`npx -y toon-memory dump\`.cwd(root).text()
  }

  const recall = async (query) => {
    try {
      const result = await $\`npx -y toon-memory mcp\`.cwd(root)
        .stdin(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: { name: "memory_recall", arguments: { query, mode: "flat", compact: true } }
        }))
        .text()
      const parsed = JSON.parse(result)
      return parsed?.result?.content?.[0]?.text || ""
    } catch { return "" }
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
      // Intelligent auto-loading: extract file path from tool result,
      // recall only memory relevant to that file, inject as context.
      try {
        const toolName = input?.tool || ""
        const args = input?.args || {}

        // Extract file path from tool arguments or output
        let filePath = ""
        if (args.file) filePath = args.file
        else if (args.path) filePath = args.path
        else if (args.filePath) filePath = args.filePath

        // Also try to extract from tool output text
        if (!filePath && input?.output) {
          const outputText = typeof input.output === "string" ? input.output : ""
          const fileMatch = outputText.match(/(?:file|path|source):\s*([\\w/.\\-]+)/i)
          if (fileMatch) filePath = fileMatch[1]
        }

        if (!filePath) return

        // Build recall query from file path components
        const basename = path.basename(filePath, path.extname(filePath))
        const dirParts = path.dirname(filePath).split(path.sep).filter(Boolean)
        const query = [basename, ...dirParts.slice(-2)].join(" ")

        const text = await recall(query)
        if (!text || text.includes("(empty)") || text.includes("No results")) return

        // Inject as context for the next agent turn
        if (typeof input?.setContext === "function") {
          input.setContext("toon-memory:" + filePath, text)
        }
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
