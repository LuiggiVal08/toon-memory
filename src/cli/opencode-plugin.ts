import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import type { Agent } from "./types"
import { projectRoot } from "./constants"

/**
 * OpenCode plugin source with AMBIENT memory: a compact handoff brief is
 * pushed into the system prompt on every turn, and signals are recorded
 * automatically from user directives, tool errors and edits. Promotion to
 * durable memory is deterministic and runs once at session idle.
 *
 * OpenCode 1.17+ delivers hooks via plugins. Only supported hooks are used:
 * event, experimental.chat.system.transform, experimental.session.compacting,
 * chat.message, tool.execute.before, tool.execute.after.
 */
export function opencodePluginContent(): string {
  return `import * as path from "path"

export const ToonMemory = async ({ $, directory, worktree }) => {
  const root = worktree || directory
  let cachedBrief = ""
  let cachedTask = ""
  let cachedAt = 0
  let lastTask = ""
  let promoted = false
  let dynamic = []

  const run = async (cmd) => {
    try { return (await cmd.cwd(root).text()).trim() } catch { return "" }
  }

  const brief = async () => {
    const task = (lastTask || "").replace(/[\`$"]/g, " ").trim().slice(0, 200)
    const now = Date.now()
    if (cachedBrief && cachedTask === task && now - cachedAt < 5 * 60 * 1000) return cachedBrief
    cachedBrief = task
      ? await run(\`TOON_MEMORY_TASK=\${JSON.stringify(task)} npx -y toon-memory brief\`)
      : await run(\`npx -y toon-memory brief\`)
    cachedTask = task
    cachedAt = now
    return cachedBrief
  }

  const recall = async (query, opts = {}) => {
    try {
      const args = { query, mode: "flat", budget: "tiny", limit: 3, path_scope: opts.path_scope || "" }
      if (opts.category) args.category = opts.category
      const result = await run($\`npx -y toon-memory mcp\`.stdin(JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "memory_recall", arguments: args }
      })))
      const parsed = JSON.parse(result)
      return parsed?.result?.content?.[0]?.text || ""
    } catch { return "" }
  }

  const record = async (type, summary, file, session) => {
    if (!summary) return
    await run($\`npx -y toon-memory signal --type \${type} --summary \${summary} --file \${file || ""} --session \${session || "opencode"}\`)
  }

  const inject = (key, text) => {
    if (!text || text.includes("(empty)") || text.includes("No results")) return
    dynamic = dynamic.filter((d) => d.key !== key)
    dynamic.push({ key, text: text.slice(0, 400) })
    if (dynamic.length > 2) dynamic.shift()
  }

  const pickPath = (args) => {
    if (!args) return ""
    if (args.file) return args.file
    if (args.path) return args.path
    if (args.filePath) return args.filePath
    if (args.target) return args.target
    return ""
  }

  const buildQuery = (filePath) => {
    const basename = path.basename(filePath, path.extname(filePath))
    const dirParts = path.dirname(filePath).split(path.sep).filter(Boolean)
    return [basename, ...dirParts.slice(-2)].join(" ")
  }

  const extractPath = (text) => {
    const match = text.match(/(?:file|path|source):\\s*([\\w/.\\-]+)/i)
    return match ? match[1] : ""
  }

  const isEditTool = (name) => {
    if (!name) return false
    return name === "edit" || name === "write" || name === "apply-patch" ||
      name.includes("edit") || name.includes("write") || name.includes("patch")
  }

  const isDirective = (text) =>
    /recuerda|siempre|nunca|no hagas|importante|ten cuidado|decidimos|must not|always|never/i.test(text)

  return {
    event: async ({ event }) => {
      const type = event?.type || ""
      if (type === "session.created" || type === "session.updated") {
        cachedBrief = ""
        cachedTask = ""
        cachedAt = 0
        lastTask = ""
        dynamic = []
        promoted = false
      }
      if (type === "session.idle" && !promoted) {
        promoted = true
        await run($\`npx -y toon-memory promote\`)
      }
    },

    "experimental.chat.system.transform": async (input, output) => {
      const text = await brief()
      if (text) output.system.push(text)
      for (const d of dynamic) output.system.push(d.text)
    },

    "experimental.session.compacting": async (input, output) => {
      const text = await brief()
      if (text && Array.isArray(output?.context)) output.context.push(text)
    },

    "chat.message": async (input) => {
      const parts = input?.parts || input?.message?.parts || []
      const text = parts.map((p) => typeof p?.text === "string" ? p.text : "").join(" ")
      lastTask = text.replace(/\s+/g, " ").trim().slice(0, 200)
      if (isDirective(text)) {
        await record("user_directive", text.replace(/\\s+/g, " ").slice(0, 280), "", input?.sessionID)
      }
    },

    "tool.execute.before": async (input, output) => {
      try {
        const toolName = input?.tool || ""
        if (!isEditTool(toolName)) return
        const filePath = pickPath(output?.args || input?.args || {})
        if (!filePath) return
        const text = await recall(filePath, { category: "warning" })
        inject("risks:" + filePath, "⚠ KNOWN RISKS for " + filePath + ":\\n" + text)
      } catch {}
    },

    "tool.execute.after": async (input, output) => {
      try {
        const toolName = input?.tool || ""
        const args = output?.args || input?.args || {}
        const resultText = typeof output?.output === "string" ? output.output : ""
        const filePath = pickPath(args) || extractPath(resultText)

        if (filePath) {
          const text = await recall(buildQuery(filePath), { path_scope: filePath })
          inject("memory:" + filePath, text)
          if (isEditTool(toolName)) {
            await record("diff_pattern", "Edited " + filePath + " while implementing a change", filePath, input?.sessionID)
          }
        }

        if (/error|failed|exception|fatal/i.test(resultText)) {
          const line = resultText.split("\\n").find((l) => /error|failed|exception|fatal/i.test(l)) || ""
          const signature = line.replace(/\\s+/g, " ").slice(0, 180)
          inject("error:" + toolName, "⚠ Tool error: " + signature)
          await record("error_fix", "Tool " + toolName + " failed: " + signature, filePath, input?.sessionID)
        }
      } catch {}
    },
  }
}
`
}

/**
 * Install the toon-memory OpenCode plugin and remove any stale `hooks` key.
 * No 87 KB markdown dump: the brief is injected live through system.transform.
 */
export function installOpenCodePlugin(agent: Agent): void {
  const pluginsDir = join(projectRoot, ".opencode", "plugins")
  if (!existsSync(pluginsDir)) mkdirSync(pluginsDir, { recursive: true })

  const dest = join(pluginsDir, "toon-memory.ts")
  writeFileSync(dest, opencodePluginContent())
  console.log(`  Plugin created at ${dest}`)

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
