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

  const recall = async (query, opts = {}) => {
    try {
      const args = { query, mode: "flat", budget: opts.budget || "tiny", path_scope: opts.path_scope || "" }
      if (opts.category) args.category = opts.category
      const result = await $\`npx -y toon-memory mcp\`.cwd(root)
        .stdin(JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: { name: "memory_recall", arguments: args }
        }))
        .text()
      const parsed = JSON.parse(result)
      return parsed?.result?.content?.[0]?.text || ""
    } catch { return "" }
  }

  // Pre-edit risk surfacing: warning-category entries scoped to a file path.
  // Injected as a distinct block so the agent sees known risks before it edits.
  const risks = async (filePath) => {
    return await recall(filePath, { budget: "tiny", path_scope: filePath, category: "warning" })
  }

  const write = (text) => {
    fs.mkdirSync(INS, { recursive: true })
    fs.writeFileSync(OUT, text)
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

  const inject = (ctx, key, text) => {
    if (!text || text.includes("(empty)") || text.includes("No results")) return
    if (typeof ctx?.setContext === "function") ctx.setContext(key, text)
  }

  // Edit/write-ish tools are where known risks matter most.
  const isEditTool = (name) => {
    if (!name) return false
    return name === "edit" || name === "write" || name === "apply-patch" ||
      name.includes("edit") || name.includes("write") || name.includes("patch")
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
    "tool.execute.before": async (input, output) => {
      // Pre-edit risk surfacing: for edit/write tools, surface known
      // warning entries for the target file BEFORE the tool runs.
      try {
        const toolName = input?.tool || ""
        if (!isEditTool(toolName)) return
        const args = output?.args || input?.args || {}
        const filePath = pickPath(args)
        if (!filePath) return
        const text = await risks(filePath)
        inject(input, "toon-memory:risks:" + filePath, "⚠ KNOWN RISKS for " + filePath + ":\\n" + text)
      } catch {}
    },
    "tool.execute.after": async (input) => {
      // Intelligent auto-loading: extract file path from tool result,
      // recall only memory relevant to that file, inject as context.
      // Also proactively recalls entries scoped to the matched paths.
      try {
        const toolName = input?.tool || ""
        const args = input?.args || {}

        // Extract file path from tool arguments or output
        let filePath = pickPath(args)

        // Also try to extract from tool output text
        if (!filePath && input?.output) {
          const outputText = typeof input.output === "string" ? input.output : ""
          const fileMatch = outputText.match(/(?:file|path|source):\s*([\\w/.\\-]+)/i)
          if (fileMatch) filePath = fileMatch[1]
        }

        if (filePath) {
          // Build recall query from file path components
          const query = buildQuery(filePath)
          const text = await recall(query, { budget: "tiny", path_scope: filePath })
          inject(input, "toon-memory:" + filePath, text)

          // Pre-edit risk block for edit/write tools (same key as the before
          // hook — setContext overwrites, so no duplication when both fire).
          if (isEditTool(toolName)) {
            const riskText = await risks(filePath)
            inject(input, "toon-memory:risks:" + filePath, "⚠ KNOWN RISKS for " + filePath + ":\\n" + riskText)
          }
        }

        // Proactive recall: if no file was found, try tool-name-based recall
        // for common tool patterns that may have relevant memory entries
        if (!filePath && toolName) {
          const toolKeywords = toolName
            .replace(/^memory_/, "")
            .replace(/^context_/, "")
            .replace(/^file_/, "")
            .replace(/^text_document_/, "")
            .split("_")
            .filter(Boolean)
            .join(" ")

          if (toolKeywords.length > 3) {
            const text = await recall(toolKeywords, { budget: "tiny" })
            inject(input, "toon-memory:" + toolName, text)
          }
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
