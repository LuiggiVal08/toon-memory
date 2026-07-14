import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, unlinkSync, readdirSync, statSync, chmodSync, rmSync } from "fs"
import { basename, dirname, join } from "path"
import { fileURLToPath } from "url"
import { createInterface, emitKeypressEvents, type Key } from "readline"
import { gzipSync, gunzipSync } from "zlib"
import { extractProjectDeps } from "../lib/vocab"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = process.cwd()
const sourceDir = join(__dirname, "..", "..", "src")
const HOME = process.env.HOME || process.env.USERPROFILE || "~"

/** Shared memory directory (agent-agnostic) */
const MEMORY_DIR = join(projectRoot, ".toon-memory", "memory")

/** Config format: "json" | "toml" | "jsonc" | "none" (instructions only) */
type AgentFormat = "json" | "toml" | "jsonc" | "none"

/** Supported AI coding agent configuration */
interface Agent {
  name: string
  global?: string
  local?: string
  mcpKey: string
  format: AgentFormat
  needsHooks: boolean
  needsInstructions: boolean
  instructionFile?: string
  /** Claude Code-style hook events for activity capture (e.g. PostToolUse, Stop) */
  captureJson?: string[]
  /** Codex TOML hook events for activity capture (e.g. post_tool_use, stop) */
  captureToml?: string[]
  /** OpenCode: install the toon-memory plugin instead of a `hooks` config key */
  needsPlugin?: boolean
}

/** Path to the compiled capture script (dist/cli/capture.js) */
const CAPTURE_JS = join(__dirname, "capture.js")

/** Path to the compiled session-start reminder script (dist/cli/session-start.js) */
const SESSION_START_JS = join(__dirname, "session-start.js")

/** Hook script content for SessionStart reminder (prints active sessions + conflicts) */
function sessionStartHookContent(agentName: string): string {
  return `#!/bin/bash
node "${SESSION_START_JS}" ${agentName}
exit 0
`
}

/** Config file that holds the opt-in capture flag */
const CAPTURE_CONFIG = join(MEMORY_DIR, "config.json")

/**
 * Hook script content for activity capture. It is a no-op unless capture is
 * explicitly enabled (env TOON_MEMORY_CAPTURE or config.json `"capture": true`),
 * so registering it costs almost nothing when disabled.
 */
function captureHookContent(agentName: string): string {
  return `#!/bin/bash
CFG="${CAPTURE_CONFIG}"
if [ -z "$TOON_MEMORY_CAPTURE" ]; then
  if [ ! -f "$CFG" ]; then exit 0; fi
  grep -q '"capture"[[:space:]]*:[[:space:]]*true' "$CFG" 2>/dev/null || exit 0
fi
node "${CAPTURE_JS}" ${agentName}
exit 0
`
}

/** Base instruction content for agents */
const INSTRUCTION_CONTENT = `# toon-memory

Persistent memory for this project. Use it to avoid re-investigating things.

## At the START of every session
1. Run memory_stats to see what's in memory.
2. If the user asks something that might be in memory, run memory_recall BEFORE reading files.

## When making decisions
- Before implementing a non-trivial change: memory_remember(category='decision')
- When you resolve a complex bug: memory_remember(category='bug')
- When you observe a code pattern: memory_remember(category='pattern')

## At the END of every session
- Save important decisions, bugs resolved, and patterns observed.
`

/**
 * Detect all supported AI coding agents on the system.
 *
 * Scans for configuration files in both global (~/.config/) and local
 * (.opencode/, .vscode/, etc.) locations.
 *
 * @returns Array of detected agent configurations
 */
function detectAgents(): Agent[] {
  const agents: Agent[] = []

  // OpenCode
  agents.push({
    name: "opencode",
    global: join(HOME, ".config", "opencode", "opencode.json"),
    local: join(projectRoot, ".opencode", "opencode.json"),
    mcpKey: "mcp",
    format: "json",
    needsHooks: false,
    needsPlugin: true,
    needsInstructions: true,
    instructionFile: join(projectRoot, "AGENTS.md")
  })

  // VS Code / GitHub Copilot
  agents.push({
    name: "vscode/copilot",
    local: join(projectRoot, ".vscode", "mcp.json"),
    mcpKey: "servers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  // Claude Code
  agents.push({
    name: "claude",
    global: join(HOME, ".claude", "settings.json"),
    local: join(projectRoot, ".claude", "settings.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: true,
    needsInstructions: true,
    instructionFile: join(projectRoot, ".claude", "AGENTS.md"),
    captureJson: ["PostToolUse", "Stop"]
  })

  // Cursor
  agents.push({
    name: "cursor",
    local: join(projectRoot, ".cursor", "mcp.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  // Windsurf
  agents.push({
    name: "windsurf",
    global: join(HOME, ".codeium", "windsurf", "mcp_config.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  // Cline
  agents.push({
    name: "cline",
    local: join(projectRoot, ".cline", "mcp.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  // Continue
  agents.push({
    name: "continue",
    local: join(projectRoot, ".continue", "config.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  // Codex CLI
  agents.push({
    name: "codex",
    local: join(projectRoot, ".codex", "config.toml"),
    mcpKey: "mcpServers",
    format: "toml",
    needsHooks: true,
    needsInstructions: true,
    instructionFile: join(projectRoot, ".codex", "AGENTS.md"),
    captureToml: ["PostToolUse", "Stop"]
  })

  // Gemini CLI
  agents.push({
    name: "gemini",
    local: join(projectRoot, ".gemini", "settings.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: true,
    needsInstructions: true,
    instructionFile: join(projectRoot, ".gemini", "GEMINI.md")
  })

  // Zed
  agents.push({
    name: "zed",
    global: join(HOME, ".config", "zed", "settings.json"),
    mcpKey: "mcp_servers",
    format: "jsonc",
    needsHooks: false,
    needsInstructions: false
  })

  // Antigravity
  agents.push({
    name: "antigravity",
    local: join(projectRoot, ".gemini", "config", "mcp_config.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: true,
    needsInstructions: true,
    instructionFile: join(projectRoot, "antigravity-cli", "AGENTS.md")
  })

  // Aider (instructions only, no MCP)
  agents.push({
    name: "aider",
    mcpKey: "",
    format: "none",
    needsHooks: false,
    needsInstructions: true,
    instructionFile: join(projectRoot, "CONVENTIONS.md")
  })

  // KiloCode
  agents.push({
    name: "kilocode",
    global: join(HOME, ".kilocode", "mcp_settings.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: false,
    needsInstructions: true,
    instructionFile: join(HOME, ".kilocode", "rules", "toon-memory.md")
  })

  // OpenClaw
  agents.push({
    name: "openclaw",
    local: join(projectRoot, ".openclaw.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  // Kiro
  agents.push({
    name: "kiro",
    local: join(projectRoot, ".kiro", "settings", "mcp.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  return agents
}

/**
 * Install memory directory and initial data file.
 *
 * Creates `.toon-memory/memory/` directory and initial `data.toon` if needed.
 * The MCP server handles all memory operations.
 */
function installMemoryDir(): void {
  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })

  if (!existsSync(memoryFile)) {
    writeFileSync(memoryFile, "version: 1\n[0|]\n")
    console.log("  Created .toon-memory/memory/data.toon")
  }
}

/**
 * Add `.toon-memory/memory/` to `.gitignore` if not already present.
 */
function ensureGitignore(): void {
  const gitignorePath = join(projectRoot, ".gitignore")
  const entry = ".toon-memory/memory/"

  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, `${entry}\n`)
    console.log("  Created .gitignore with memory exclusion")
    return
  }

  const content = readFileSync(gitignorePath, "utf-8")
  if (!content.includes(entry)) {
    writeFileSync(gitignorePath, `${content.trim()}\n${entry}\n`)
    console.log("  Added .toon-memory/memory/ to .gitignore")
  }
}

/**
 * Install MCP server configuration for a JSON-format agent.
 *
 * Adds the `toon-memory` MCP server entry to the agent's config file.
 * OpenCode uses a different format than other agents.
 */
function installJSONConfig(agent: Agent, scope: string): void {
  const configPath = scope === "global" ? agent.global : agent.local

  if (!configPath) {
    console.log(`  No ${scope} config path for ${agent.name}`)
    return
  }

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  let config: Record<string, any> = {}
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"))
    } catch {
      config = {}
    }
  }

  const mcpKey = agent.mcpKey || "mcpServers"
  if (!config[mcpKey]) config[mcpKey] = {}

  if (agent.name === "opencode") {
    config[mcpKey]["toon-memory"] = {
      enabled: true,
      type: "local",
      command: ["npx", "-y", "toon-memory", "mcp"]
    }
  } else {
    config[mcpKey]["toon-memory"] = {
      command: "npx",
      args: ["-y", "toon-memory", "mcp"]
    }
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP server configuration for Codex CLI (TOML format).
 *
 * Writes a clean config.toml with the MCP server entry.
 * If the file exists, it is overwritten.
 */
function installTOMLConfig(agent: Agent): void {
  const configPath = agent.local
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  const toml = `[mcpServers.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
`

  writeFileSync(configPath, toml)
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP server configuration for Zed (JSONC format).
 *
 * Writes valid JSON to Zed's settings.json. If the file exists
 * with comments, the user must merge manually.
 */
function installZedConfig(agent: Agent): void {
  const configPath = agent.global
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  let config: Record<string, any> = {}
  if (existsSync(configPath)) {
    try {
      // Strip JSONC comments before parsing
      const raw = readFileSync(configPath, "utf-8")
      const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
      config = JSON.parse(stripped)
    } catch {
      config = {}
    }
  }

  if (!config.mcp_servers) config.mcp_servers = {}

  config.mcp_servers["toon-memory"] = {
    command: "npx",
    args: ["-y", "toon-memory", "mcp"]
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP config for an agent based on its format.
 */
function installMCPConfig(agent: Agent, scope: string): void {
  if (agent.format === "none") {
    console.log(`  ${agent.name}: instructions only (no MCP)`)
    return
  }

  if (agent.format === "toml") {
    installTOMLConfig(agent)
  } else if (agent.format === "jsonc") {
    installZedConfig(agent)
  } else {
    installJSONConfig(agent, scope)
  }
}

/**
 * Install instruction files for an agent.
 *
 * Creates AGENTS.md, GEMINI.md, CONVENTIONS.md, etc. with
 * reminders to use toon-memory tools.
 */
function installInstructions(agent: Agent): void {
  if (!agent.needsInstructions || !agent.instructionFile) return

  const filePath = agent.instructionFile
  const fileDir = dirname(filePath)

  if (!existsSync(fileDir)) mkdirSync(fileDir, { recursive: true })

  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, "utf-8")
    if (existing.includes("toon-memory") || existing.includes("memory_recall")) {
      console.log(`  Instructions already present in ${filePath}`)
      return
    }
    // Append to existing file
    writeFileSync(filePath, `${existing.trim()}\n\n${INSTRUCTION_CONTENT}`)
    console.log(`  Appended toon-memory instructions to ${filePath}`)
  } else {
    writeFileSync(filePath, INSTRUCTION_CONTENT)
    console.log(`  Created ${filePath}`)
  }
}

/**
 * Install SessionStart hook for agents that support it.
 *
 * Creates a shell script that reminds the agent to use memory tools,
 * then registers it in the agent's config.
 */
function installHooks(agent: Agent): void {
  if (!agent.needsHooks) return

  const hookDir = join(projectRoot, ".toon-memory", "hooks")
  if (!existsSync(hookDir)) mkdirSync(hookDir, { recursive: true })

  const hookPath = join(hookDir, `session-start-${agent.name}.sh`)
  writeFileSync(hookPath, sessionStartHookContent(agent.name))
  chmodSync(hookPath, 0o755)
  console.log(`  Hook script created at ${hookPath}`)

  // Register hook in agent config
  if (agent.format === "toml" && agent.local) {
    registerHookTOML(agent, hookPath)
  } else if (agent.format === "json" || agent.format === "jsonc") {
    registerHookJSON(agent, hookPath)
  }

  // Activity capture hooks (opt-in, no-op unless explicitly enabled)
  if (agent.captureJson && agent.format === "json") {
    const capPath = join(hookDir, `capture-${agent.name}.sh`)
    writeFileSync(capPath, captureHookContent(agent.name))
    chmodSync(capPath, 0o755)
    console.log(`  Capture hook created at ${capPath}`)
    registerCaptureHookJSON(agent, capPath)
  }
  if (agent.captureToml && agent.format === "toml" && agent.local) {
    const capPath = join(hookDir, `capture-${agent.name}.sh`)
    writeFileSync(capPath, captureHookContent(agent.name))
    chmodSync(capPath, 0o755)
    console.log(`  Capture hook created at ${capPath}`)
    registerCaptureHookTOML(agent, capPath)
  }
}

/** Register activity-capture hooks (PostToolUse/Stop) in a JSON agent config. */
function registerCaptureHookJSON(agent: Agent, scriptPath: string): void {
  const configPath = agent.local || agent.global
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  let config: Record<string, any> = {}
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"))
    } catch {
      config = {}
    }
  }

  if (!config.hooks) config.hooks = {}
  for (const event of agent.captureJson || []) {
    if (!config.hooks[event]) config.hooks[event] = []
    if (!config.hooks[event].some((h: any) => h.command === scriptPath)) {
      config.hooks[event].push({ command: scriptPath })
    }
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  Capture hooks registered in ${configPath}`)
}

/** Register activity-capture hooks (PostToolUse/Stop) in a Codex TOML config. */
function registerCaptureHookTOML(agent: Agent, scriptPath: string): void {
  const configPath = agent.local
  if (!configPath || !existsSync(configPath)) return

  let content = readFileSync(configPath, "utf-8")
  for (const event of agent.captureToml || []) {
    if (content.includes(`event = "${event}"`)) continue
    content += `\n[[hooks]]\nevent = "${event}"\ncommand = "${scriptPath}"\n`
  }

  writeFileSync(configPath, content)
  console.log(`  Capture hooks registered in ${configPath}`)
}

/** Register SessionStart hook in TOML config (Codex CLI, stable [[hooks]] format). */
function registerHookTOML(agent: Agent, hookPath: string): void {
  const configPath = agent.local
  if (!configPath || !existsSync(configPath)) return

  let content = readFileSync(configPath, "utf-8")
  if (content.includes('event = "SessionStart"')) {
    console.log(`  Hook already registered in ${configPath}`)
    return
  }

  content += `\n[[hooks]]\nevent = "SessionStart"\ncommand = "${hookPath}"\n`
  writeFileSync(configPath, content)
  console.log(`  Hook registered in ${configPath}`)
}

/**
 * OpenCode plugin source (hooks only). OpenCode 1.17+ delivers hooks via
 * plugins, not a top-level `hooks` config key, so `init` writes this file into
 * `.opencode/plugins/`. It reuses the compiled CLI commands for the actual logic.
 */
function opencodePluginContent(): string {
  return `export const ToonMemory = async ({ $, directory }) => {
  const ss = directory + "/bin/cli/session-start.js"
  const cap = directory + "/bin/cli/capture.js"
  return {
    "session.created": async () => {
      try { await $\`node \${ss} opencode\`.quiet() } catch {}
    },
    "tool.execute.after": async (input) => {
      if (!process.env.TOON_MEMORY_CAPTURE) return
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
 * Install the toon-memory OpenCode plugin (auto-capture via hooks) and remove
 * any stale top-level `hooks` key left by older versions.
 */
function installOpenCodePlugin(agent: Agent): void {
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

/**
  * Install Antigravity hooks. Antigravity keeps hooks in a separate `hooks.json`
  * (under .gemini/config/). The official schema maps arbitrary hook NAMES to
  * event configs; each event wraps handlers in `hooks: [{ type, command }]`.
  * Supported events: PreToolUse, PostToolUse, PreInvocation, PostInvocation, Stop.
  * There is no SessionStart event (issue #180 open), so the session-start
  * reminder runs on PreInvocation (fires before the model is called).
  */
const ANTIGRAVITY_HOOK_NAME = "toon-memory"
function registerAntigravityHooks(agent: Agent): void {
  const hookDir = join(projectRoot, ".toon-memory", "hooks")
  if (!existsSync(hookDir)) mkdirSync(hookDir, { recursive: true })

  const sessionPath = join(hookDir, "session-start-antigravity.sh")
  writeFileSync(sessionPath, sessionStartHookContent("antigravity"))
  chmodSync(sessionPath, 0o755)
  console.log(`  Hook script created at ${sessionPath}`)

  const capPath = join(hookDir, "capture-antigravity.sh")
  writeFileSync(capPath, captureHookContent("antigravity"))
  chmodSync(capPath, 0o755)
  console.log(`  Capture hook created at ${capPath}`)

  const base = agent.local ? dirname(agent.local) : projectRoot
  const hooksFile = join(base, "hooks.json")
  mkdirSync(base, { recursive: true })

  let cfg: Record<string, any> = {}
  if (existsSync(hooksFile)) {
    try {
      cfg = JSON.parse(readFileSync(hooksFile, "utf-8"))
    } catch {
      cfg = {}
    }
  }

  cfg[ANTIGRAVITY_HOOK_NAME] = {
    PreInvocation: [{ type: "command", command: sessionPath }],
    PostToolUse: [{ matcher: "*", hooks: [{ type: "command", command: capPath }] }],
    Stop: [{ type: "command", command: capPath }],
  }

  writeFileSync(hooksFile, JSON.stringify(cfg, null, 2))
  console.log(`  Antigravity hooks registered in ${hooksFile}`)
}

/** Register SessionStart hook in JSON config */
function registerHookJSON(agent: Agent, hookPath: string): void {
  const configPath = agent.format === "jsonc" ? agent.global : (agent.local || agent.global)
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  let config: Record<string, any> = {}
  if (existsSync(configPath)) {
    try {
      if (agent.format === "jsonc") {
        const raw = readFileSync(configPath, "utf-8")
        const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
        config = JSON.parse(stripped)
      } else {
        config = JSON.parse(readFileSync(configPath, "utf-8"))
      }
    } catch {
      config = {}
    }
  }

  // Claude Code / Gemini CLI format: `hooks.SessionStart` object
  // (OpenCode uses a plugin instead; Antigravity uses its own hooks.json)
  if (agent.name === "claude" || agent.name === "gemini") {
    if (!config.hooks) config.hooks = {}
    if (!config.hooks.SessionStart) config.hooks.SessionStart = []
    if (!config.hooks.SessionStart.some((h: any) => h.command === hookPath)) {
      config.hooks.SessionStart.push({ command: hookPath })
      writeFileSync(configPath, JSON.stringify(config, null, 2))
      console.log(`  Hook registered in ${configPath}`)
    }
    return
  }
}

/**
 * Install everything for a single agent.
 */
function installForAgent(agent: Agent, scope: string): void {
  console.log(`${agent.name}:`)
  installMCPConfig(agent, scope)
  installInstructions(agent)
  if (agent.needsPlugin) installOpenCodePlugin(agent)
  else if (agent.name === "antigravity") registerAntigravityHooks(agent)
  else installHooks(agent)
}

/**
 * Read/write the shared memory config.json, preserving unknown keys
 * (e.g. `encrypted`, `capture`) so we never clobber sibling settings.
 */
function updateMemoryConfig(patch: Record<string, any>): void {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })
  let cfg: Record<string, any> = {}
  if (existsSync(CAPTURE_CONFIG)) {
    try {
      cfg = JSON.parse(readFileSync(CAPTURE_CONFIG, "utf-8"))
    } catch {
      cfg = {}
    }
  }
  Object.assign(cfg, patch)
  writeFileSync(CAPTURE_CONFIG, JSON.stringify(cfg, null, 2))
}

/**
 * Initialize toon-memory for all detected agents (non-interactive).
 *
 * Installs MCP server configs, creates memory directory, discovers project
 * dependencies for tag inference, and updates `.gitignore`.
 */
function init(scope: string = "local"): void {
  console.log("\n🧠 toon-memory init\n")

  installMemoryDir()

  // Hito 7 (B): derive a project-specific tag vocabulary from dependencies.
  const deps = extractProjectDeps(projectRoot)
  const depCount = Object.keys(deps).length
  if (depCount > 0) {
    updateMemoryConfig({ vocab: deps })
    console.log(`  Detected ${depCount} dependencies → auto-tag vocabulary written to config.json`)
  }

  const agents = detectAgents()
  for (const agent of agents) {
    installForAgent(agent, scope)
    console.log("")
  }

  ensureGitignore()

  console.log("Done! Restart your agent to use memory tools.\n")
}

/**
 * Uninstall toon-memory from all detected agents.
 *
 * Removes MCP server configurations, instruction files, and hooks.
 */
function uninstall(): void {
  console.log("\n🧠 toon-memory uninstaller\n")

  const agents = detectAgents()

  for (const agent of agents) {
    // Remove MCP config from JSON files
    if (agent.format === "json" || agent.format === "jsonc") {
      const configs = [agent.global, agent.local].filter(Boolean) as string[]

      for (const configPath of configs) {
        if (!existsSync(configPath)) continue

        try {
          let config: Record<string, any>
          if (agent.format === "jsonc") {
            const raw = readFileSync(configPath, "utf-8")
            const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
            config = JSON.parse(stripped)
          } else {
            config = JSON.parse(readFileSync(configPath, "utf-8"))
          }

          const mcpKey = agent.mcpKey || "mcpServers"

          if (config[mcpKey]?.["toon-memory"]) {
            delete config[mcpKey]["toon-memory"]
            writeFileSync(configPath, JSON.stringify(config, null, 2))
            console.log(`  Removed MCP from ${agent.name} (${configPath})`)
          }
        } catch {}
      }
    }

    // Remove TOML config
    if (agent.format === "toml" && agent.local && existsSync(agent.local)) {
      try {
        let content = readFileSync(agent.local, "utf-8")
        content = content.replace(/\[mcpServers\.toon-memory\][\s\S]*?(?=\n\[|$)/, "").trim() + "\n"
        writeFileSync(agent.local, content)
        console.log(`  Removed MCP from ${agent.name} (${agent.local})`)
      } catch {}
    }
  }

  // Remove instruction files
  for (const agent of agents) {
    if (agent.instructionFile && existsSync(agent.instructionFile)) {
      try {
        const content = readFileSync(agent.instructionFile, "utf-8")
        // Only remove if it's purely toon-memory instructions
        if (content.includes(INSTRUCTION_CONTENT.trim()) && content.length < INSTRUCTION_CONTENT.length + 100) {
          unlinkSync(agent.instructionFile)
          console.log(`  Removed ${agent.instructionFile}`)
        }
      } catch {}
    }
  }

  // Remove hook scripts
  const hookDir = join(projectRoot, ".toon-memory", "hooks")
  if (existsSync(hookDir)) {
    rmSync(hookDir, { recursive: true, force: true })
    console.log("  Removed .toon-memory/hooks/")
  }

  // Remove legacy .opencode/tools/ if exists
  const toolsFile = join(projectRoot, ".opencode", "tools", "memory.ts")
  if (existsSync(toolsFile)) {
    unlinkSync(toolsFile)
    console.log("  Removed .opencode/tools/memory.ts")
  }

  // Remove OpenCode plugin
  const ocPlugin = join(projectRoot, ".opencode", "plugins", "toon-memory.ts")
  if (existsSync(ocPlugin)) {
    unlinkSync(ocPlugin)
    console.log("  Removed .opencode/plugins/toon-memory.ts")
  }

  // Remove toon-memory hook from Antigravity hooks.json (leave other hooks intact)
  const agyHooks = join(projectRoot, ".gemini", "config", "hooks.json")
  if (existsSync(agyHooks)) {
    try {
      const agyCfg = JSON.parse(readFileSync(agyHooks, "utf-8"))
      if (agyCfg[ANTIGRAVITY_HOOK_NAME]) {
        delete agyCfg[ANTIGRAVITY_HOOK_NAME]
        if (Object.keys(agyCfg).length === 0) {
          unlinkSync(agyHooks)
          console.log("  Removed .gemini/config/hooks.json")
        } else {
          writeFileSync(agyHooks, JSON.stringify(agyCfg, null, 2))
          console.log("  Removed toon-memory hook from .gemini/config/hooks.json")
        }
      }
    } catch {
      unlinkSync(agyHooks)
      console.log("  Removed .gemini/config/hooks.json")
    }
  }

  console.log("\n✅ toon-memory uninstalled from all agents\n")
}

/**
 * Show toon-memory installation status.
 *
 * Displays version, memory entry count, and agent configuration status.
 */
function status(): void {
  console.log("\n🧠 toon-memory status\n")

  // Check npm package
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"))
    console.log(`Version: ${pkg.version}`)
  } catch {
    console.log("Version: unknown")
  }

  // Check memory file
  const memoryFile = join(MEMORY_DIR, "data.toon")
  if (existsSync(memoryFile)) {
    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n").filter((l: string) => l.startsWith("  ") && l.includes("|"))
    console.log(`Memory: ${lines.length} entries`)
  } else {
    console.log("Memory: not initialized")
  }

  // Capture status
  let capture = false
  if (process.env.TOON_MEMORY_CAPTURE) capture = true
  else if (existsSync(CAPTURE_CONFIG)) {
    try {
      const c = JSON.parse(readFileSync(CAPTURE_CONFIG, "utf-8"))
      if (c.capture) capture = true
    } catch {}
  }
  console.log(`Capture: ${capture ? "enabled" : "disabled (opt-in)"}`)

  // Check agent configs
  const agents = detectAgents()
  console.log("\nAgent configs:")

  for (const agent of agents) {
    let configured = false

    // Check MCP config
    if (agent.format === "json" || agent.format === "jsonc") {
      const configs = [agent.global, agent.local].filter(Boolean) as string[]

      for (const configPath of configs) {
        if (!existsSync(configPath)) continue

        try {
          let config: Record<string, any>
          if (agent.format === "jsonc") {
            const raw = readFileSync(configPath, "utf-8")
            const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
            config = JSON.parse(stripped)
          } else {
            config = JSON.parse(readFileSync(configPath, "utf-8"))
          }

          if (config[agent.mcpKey]?.["toon-memory"]) {
            configured = true
          }
        } catch {}
      }
    }

    // Check TOML
    if (agent.format === "toml" && agent.local && existsSync(agent.local)) {
      const content = readFileSync(agent.local, "utf-8")
      if (content.includes("toon-memory")) configured = true
    }

    // Check instructions
    const hasInstructions = agent.instructionFile ? existsSync(agent.instructionFile) : false

    // Check hooks / plugin
    const hookPath = join(projectRoot, ".toon-memory", "hooks", `session-start-${agent.name}.sh`)
    let hasHooks = existsSync(hookPath)
    if (agent.needsPlugin) {
      hasHooks = existsSync(join(projectRoot, ".opencode", "plugins", "toon-memory.ts"))
    }

    if (agent.format === "none") {
      console.log(`  ${hasInstructions ? "✅" : "❌"} ${agent.name} (instructions only)`)
    } else {
      const mcpStatus = configured ? "✅" : "❌"
      const instrStatus = agent.needsInstructions ? (hasInstructions ? " 📝" : "") : ""
      const hookStatus = (agent.needsHooks || agent.needsPlugin) ? (hasHooks ? " 🪝" : "") : ""
      console.log(`  ${mcpStatus} ${agent.name}${instrStatus}${hookStatus}`)
    }
  }

  console.log("")
}

/**
 * Upgrade toon-memory to the latest version.
 */
function upgrade(): void {
  console.log("\n🧠 toon-memory upgrade\n")

  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"))
    const currentVersion = pkg.version

    console.log(`Current version: ${currentVersion}`)
    console.log("\nTo upgrade, run:")
    console.log("  npm install -g toon-memory@latest")
    console.log("\nThen restart your agent.\n")
  } catch {
    console.log("To upgrade, run:")
    console.log("  npm install -g toon-memory@latest")
    console.log("\nThen restart your agent.\n")
  }
}

/**
 * Display memory statistics.
 */
function stats(): void {
  console.log("\n🧠 toon-memory stats\n")

  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(memoryFile)) {
    console.log("Memory not initialized. Run 'npx toon-memory init' first.\n")
    return
  }

  const data = readFileSync(memoryFile, "utf-8")
  const lines = data.split("\n").filter((l: string) => l.startsWith("  ") && l.includes("|"))

  const categories: Record<string, number> = {}
  let latestDate = ""

  for (const line of lines) {
    const parts = line.trim().split("|")
    if (parts.length >= 7) {
      const category = parts[1]
      const date = parts[6]
      categories[category] = (categories[category] || 0) + 1
      if (date > latestDate) latestDate = date
    }
  }

  console.log("📊 Memory Stats")
  console.log("━".repeat(20))
  console.log(`Total entries: ${lines.length}`)

  for (const [cat, count] of Object.entries(categories)) {
    console.log(`├── ${cat}: ${count}`)
  }

  console.log(`Last updated: ${latestDate || "never"}`)

  const fileSize = Buffer.byteLength(data, "utf-8")
  console.log(`File size: ${(fileSize / 1024).toFixed(1)} KB`)
  console.log("")
}

/**
 * Export memory to JSON format.
 */
function exportMemory(): void {
  console.log("\n🧠 toon-memory export\n")

  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(memoryFile)) {
    console.log("Memory not initialized. Run 'npx toon-memory init' first.\n")
    return
  }

  const data = readFileSync(memoryFile, "utf-8")
  const lines = data.split("\n").filter((l: string) => l.startsWith("  ") && l.includes("|"))

  const entries = lines.map((line: string) => {
    const parts = line.trim().split("|")
    return {
      id: parts[0],
      category: parts[1],
      key: parts[2],
      content: parts[3],
      file: parts[4],
      tags: parts[5] ? parts[5].split(";") : [],
      date: parts[6]
    }
  })

  const exportData = {
    project: basename(projectRoot),
    exported_at: new Date().toISOString(),
    entries,
    summaries: {}
  }

  const outputPath = join(projectRoot, "toon-memory-export.json")
  writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

  console.log(`Exported ${entries.length} entries to:`)
  console.log(`  ${outputPath}\n`)
}

/**
 * Import memory from JSON file.
 */
function importMemory(): void {
  console.log("\n🧠 toon-memory import\n")

  const importFile = process.argv[3]

  if (!importFile) {
    console.log("Usage: npx toon-memory import <file.json>\n")
    return
  }

  const importPath = importFile.startsWith("/") ? importFile : join(projectRoot, importFile)

  if (!existsSync(importPath)) {
    console.log(`File not found: ${importPath}\n`)
    return
  }

  let importData: any
  try {
    importData = JSON.parse(readFileSync(importPath, "utf-8"))
  } catch {
    console.log("Invalid JSON file\n")
    return
  }

  if (!importData.entries || !Array.isArray(importData.entries)) {
    console.log("Invalid format: missing 'entries' array\n")
    return
  }

  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })

  let existingKeys: string[] = []
  if (existsSync(memoryFile)) {
    const existing = readFileSync(memoryFile, "utf-8")
    existingKeys = existing.split("\n")
      .filter((l: string) => l.startsWith("  ") && l.includes("|"))
      .map((l: string) => l.trim().split("|")[2])
  }

  const newEntries = importData.entries.filter((e: any) => !existingKeys.includes(e.key))

  if (newEntries.length === 0) {
    console.log("No new entries to import (all keys already exist)\n")
    return
  }

  const newLines = newEntries.map((e: any) => {
    const tags = Array.isArray(e.tags) ? e.tags.join(";") : (e.tags || "")
    return `  ${e.id}|${e.category}|${e.key}|${e.content}|${e.file}|${tags}|${e.date}`
  }).join("\n")

  if (existsSync(memoryFile)) {
    const existing = readFileSync(memoryFile, "utf-8")
    const existingCount = existing.split("\n")
      .filter((l: string) => l.startsWith("  ") && l.includes("|")).length
    const updated = existing.replace(
      /entries\[\d+\|]/,
      `entries[${existingCount + newEntries.length}|]`
    ) + "\n" + newLines
    writeFileSync(memoryFile, updated)
  } else {
    writeFileSync(memoryFile, `version: 1\nentries[${newEntries.length}|]{id|category|key|content|file|tags|date}:\n${newLines}\n`)
  }

  console.log(`Imported ${newEntries.length} new entries`)
  console.log(`Skipped ${importData.entries.length - newEntries.length} duplicates\n`)
}

/** Watch mode options */
interface WatchOptions {
  interval: number
  maxBackups: number
  compress: boolean
  logFile: boolean
  logPath: string
}

/** Parse watch CLI arguments into WatchOptions */
function parseWatchOptions(args: string[]): WatchOptions {
  const opts: WatchOptions = {
    interval: 5,
    maxBackups: 10,
    compress: false,
    logFile: false,
    logPath: ""
  }

  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--compress" || arg === "-c") {
      opts.compress = true
    } else if (arg === "--log" || arg === "-l") {
      opts.logFile = true
      opts.logPath = args[++i] || join(MEMORY_DIR, "watch.log")
    } else if (arg === "--max-backups" || arg === "-m") {
      opts.maxBackups = parseInt(args[++i]) || 10
    } else if (!arg.startsWith("-")) {
      opts.interval = parseInt(arg) || 5
    }
  }

  return opts
}

/** Write a line to the watch log file */
function writeWatchLog(logPath: string, message: string): void {
  if (!logPath) return
  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] ${message}\n`
  writeFileSync(logPath, logLine, { flag: "a" })
}

/** Get list of backup files sorted by creation time (oldest first) */
function getBackupFiles(backupDir: string): string[] {
  if (!existsSync(backupDir)) return []

  return readdirSync(backupDir)
    .filter(f => f.startsWith("backup-") && (f.endsWith(".toon") || f.endsWith(".gz")))
    .map(f => join(backupDir, f))
    .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs)
}

/** Remove oldest backups if we exceed maxBackups */
function pruneBackups(backupDir: string, maxBackups: number): number {
  if (maxBackups <= 0) return 0

  const files = getBackupFiles(backupDir)
  const excess = files.length - maxBackups

  if (excess <= 0) return 0

  for (let i = 0; i < excess; i++) {
    unlinkSync(files[i])
  }

  return excess
}

/** Compress content with gzip */
function compressData(data: string): Buffer {
  return gzipSync(Buffer.from(data, "utf-8"))
}

/**
 * Watch mode - backup memory every N minutes
 */
function watch(): void {
  console.log("\n🧠 toon-memory watch\n")

  const memoryFile = join(MEMORY_DIR, "data.toon")
  const backupDir = join(MEMORY_DIR, "backups")

  if (!existsSync(memoryFile)) {
    console.log("Memory not initialized. Run 'npx toon-memory init' first.\n")
    return
  }

  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true })

  const opts = parseWatchOptions(args)

  if (opts.logFile) {
    const logDir = dirname(opts.logPath)
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })
  }

  console.log(`Watching memory file every ${opts.interval} minutes...`)
  console.log(`Max backups: ${opts.maxBackups === 0 ? "unlimited" : opts.maxBackups}`)
  console.log(`Compression: ${opts.compress ? "enabled" : "disabled"}`)
  console.log(`Logging: ${opts.logFile ? `enabled (${opts.logPath})` : "disabled"}`)
  console.log(`Press Ctrl+C to stop\n`)

  let lastContent = readFileSync(memoryFile, "utf-8")
  let lastHash = hashContent(lastContent)
  let backupCount = 0

  if (opts.logFile) writeWatchLog(opts.logPath, "Watch started")

  const backup = () => {
    try {
      const currentContent = readFileSync(memoryFile, "utf-8")
      const currentHash = hashContent(currentContent)

      if (currentHash !== lastHash) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        const ext = opts.compress ? ".toon.gz" : ".toon"
        const backupFile = join(backupDir, `backup-${timestamp}${ext}`)

        if (opts.compress) {
          writeFileSync(backupFile, compressData(currentContent))
        } else {
          writeFileSync(backupFile, currentContent)
        }

        backupCount++
        console.log(`📦 Backup #${backupCount} created: ${timestamp}`)
        if (opts.logFile) writeWatchLog(opts.logPath, `Backup #${backupCount}: ${timestamp}`)

        lastContent = currentContent
        lastHash = currentHash

        const pruned = pruneBackups(backupDir, opts.maxBackups)
        if (pruned > 0) {
          console.log(`🗑️  Pruned ${pruned} old backup(s)`)
          if (opts.logFile) writeWatchLog(opts.logPath, `Pruned ${pruned} old backup(s)`)
        }
      }
    } catch (err) {
      const msg = `Error creating backup: ${(err as Error).message}`
      console.error(`❌ ${msg}`)
      if (opts.logFile) writeWatchLog(opts.logPath, msg)
    }
  }

  /** Simple hash for change detection (not cryptographic) */
  function hashContent(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  backup()
  const interval = setInterval(backup, opts.interval * 60 * 1000)

  process.on("SIGINT", () => {
    clearInterval(interval)
    console.log(`\n✅ Watch stopped. ${backupCount} backups created.\n`)
    if (opts.logFile) writeWatchLog(opts.logPath, `Watch stopped. ${backupCount} backups created.`)
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    clearInterval(interval)
    process.exit(0)
  })
}

/**
 * Enable or disable activity capture (the opt-in hook log).
 */
function captureToggle(enable: boolean): void {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })

  let config: Record<string, any> = {}
  if (existsSync(CAPTURE_CONFIG)) {
    try {
      config = JSON.parse(readFileSync(CAPTURE_CONFIG, "utf-8"))
    } catch {
      config = {}
    }
  }

  config.capture = enable
  writeFileSync(CAPTURE_CONFIG, JSON.stringify(config, null, 2))

  if (enable) {
    console.log("\n🔴 Captura de actividad HABILITADA.")
    console.log("Los hooks grabarán observaciones en .toon-memory/memory/observations.toon.")
    console.log("Revisa con `memory_captured` y promuévelas con `memory_remember`.\n")
  } else {
    console.log("\n⚪ Captura de actividad DESHABILITADA.\n")
  }
}

// Main
const args = process.argv.slice(2)

if (args[0] === "capture") {
  captureToggle(args[1] === "on")
  process.exit(0)
}

if (args[0] === "uninstall") {
  uninstall()
  process.exit(0)
}

if (args[0] === "init") {
  init(args[1] || "local")
  process.exit(0)
}

if (args[0] === "status") {
  status()
  process.exit(0)
}

if (args[0] === "upgrade") {
  upgrade()
  process.exit(0)
}

if (args[0] === "stats") {
  stats()
  process.exit(0)
}

if (args[0] === "export") {
  exportMemory()
  process.exit(0)
}

if (args[0] === "import") {
  importMemory()
  process.exit(0)
}

if (args[0] === "watch") {
  watch()
  process.exit(0)
}

// Interactive installer when no command is given; otherwise report unknown command.
if (args.length === 0) {
  await interactiveInstall()
  process.exit(0)
}

console.log(`Comando desconocido: '${args[0]}'\n`)
printUsage()
process.exit(1)

/** Minimal usage string for unknown commands (full help lives in the entry point). */
function printUsage(): void {
  console.log(`Uso: toon-memory <comando> [alcance]
Comandos: init, status, stats, export, import, watch, uninstall, capture, upgrade, mcp
Opciones: -v/--version, -h/--help
Sin argumentos inicia el instalador interactivo.`)
}

/** Promise wrapper around readline question. */
function ask(rl: ReturnType<typeof createInterface>, prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve))
}

/**
 * Guided interactive installer: pick agents, choose local vs global scope,
 * confirm, then install. Requires a TTY; otherwise prints a non-interactive hint.
 */
async function interactiveInstall(): Promise<void> {
  if (!process.stdin.isTTY) {
    console.log("\n🧠 toon-memory — la instalación interactiva requiere una terminal.")
    console.log("Ejecuta 'toon-memory init [local|global]' para instalación no interactiva.\n")
    return
  }

  const agents = detectAgents()
  const selected = await runAgentChecklist(agents)
  if (selected === null) {
    console.log("\nInstalación cancelada.\n")
    return
  }

  if (selected.length === 0) {
    console.log("\nNo se seleccionaron agentes. Nada instalado.\n")
    return
  }

  console.log(`\nSeleccionados: ${selected.map((a) => a.name).join(", ")}\n`)

  const rl = createInterface({ input: process.stdin, output: process.stdout })

  // 2) Scope
  let scope = "local"
  while (true) {
    const scopeAnswer = (await ask(rl, "Alcance — (1) Local (proyecto) o (2) Global (~home)? [1/2]: ")).trim()
    if (scopeAnswer === "" || scopeAnswer === "1") {
      scope = "local"
      break
    }
    if (scopeAnswer === "2") {
      scope = "global"
      break
    }
    console.log("Escribe 1 (local) o 2 (global).\n")
  }

  // 3) Confirmation summary
  console.log("\nSe instalará:")
  for (const a of selected) {
    const resolved = scope === "global" && a.global ? "global" : "local"
    const parts: string[] = []
    if (a.format !== "none") parts.push("MCP")
    if (a.needsPlugin) parts.push("plugin")
    else if (a.needsHooks) parts.push("hooks")
    if (a.needsInstructions) parts.push("instrucciones")
    const target = resolved === "global" && a.global ? a.global : a.local || "(instrucciones)"
    console.log(`  • ${a.name} [${resolved}] → ${target}${parts.length ? ` (${parts.join(", ")})` : ""}`)
  }

  const confirm = (await ask(rl, "\n¿Proceder? [Y/n]: ")).trim().toLowerCase()
  if (confirm === "n" || confirm === "no") {
    console.log("\nInstalación cancelada.\n")
    rl.close()
    return
  }

  console.log(`\nInstalando (${scope})...\n`)
  installMemoryDir()

  const deps = extractProjectDeps(projectRoot)
  if (Object.keys(deps).length > 0) {
    updateMemoryConfig({ vocab: deps })
    console.log(`  Detected ${Object.keys(deps).length} dependencies → auto-tag vocabulary written to config.json`)
  }

  for (const agent of selected) {
    installForAgent(agent, scope)
    console.log("")
  }

  ensureGitignore()

  console.log("Done! Restart your agent to use memory tools.")
  console.log("Run 'npx toon-memory uninstall' to remove.\n")
  rl.close()
}

/**
 * Navigable multi-select checklist rendered in the terminal (no dependencies).
 * ↑/↓ (or k/j) move the cursor, space toggles a selection, 'a' toggles all,
 * Enter confirms, 'q'/'c'/Ctrl-C aborts. Requires a TTY.
 */
async function runAgentChecklist(agents: Agent[]): Promise<Agent[] | null> {
  const n = agents.length
  let cursor = 0
  const selected = new Set<number>()
  let prevLines = 0

  const render = (): void => {
    let out = ""
    if (prevLines > 0) out += `\x1b[${prevLines}A\x1b[J`
    const lines: string[] = []
    lines.push("\n🧠 toon-memory installer")
    lines.push("")
    lines.push("Agentes detectados:")
    agents.forEach((a: Agent, i: number) => {
      const isCursor = i === cursor
      const isSel = selected.has(i)
      const box = isSel ? "[x]" : "[ ]"
      const cur = isCursor ? ">" : " "
      const hasConfig = a.format !== "none" && ((a.local && existsSync(a.local)) || (a.global && existsSync(a.global)))
      const indicator = hasConfig ? "✓" : "·"
      const scopeNote = a.format === "none" ? "(instrucciones)" : a.global ? "(local/global)" : "(solo local)"
      lines.push(`  ${cur} ${box} ${indicator} ${i + 1}. ${a.name} ${scopeNote}`)
    })
    lines.push("")
    lines.push("  ↑/↓ mover · espacio marcar · 'a' todos · Enter confirmar · 'q' salir")
    process.stdout.write(out + lines.join("\n") + "\n")
    prevLines = lines.length
  }

  return new Promise<Agent[] | null>((resolve) => {
    emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    process.stdin.resume()

    const finish = (result: Agent[] | null): void => {
      process.stdin.setRawMode(false)
      process.stdin.removeListener("keypress", onKey)
      process.stdout.write("\n")
      resolve(result)
    }

    const onKey = (_str: string, key: Key | undefined): void => {
      if (!key) return
      if (key.ctrl && key.name === "c") {
        finish(null)
        return
      }
      switch (key.name) {
        case "up":
        case "k":
          cursor = (cursor - 1 + n) % n
          break
        case "down":
        case "j":
          cursor = (cursor + 1) % n
          break
        case "space":
          if (selected.has(cursor)) selected.delete(cursor)
          else selected.add(cursor)
          break
        case "a":
          if (selected.size === n) selected.clear()
          else for (let i = 0; i < n; i++) selected.add(i)
          break
        case "return":
          finish(agents.filter((_: Agent, i: number) => selected.has(i)))
          return
        case "q":
        case "c":
          finish(null)
          return
        default:
          render()
          return
      }
      render()
    }

    process.stdin.on("keypress", onKey)
    render()
  })
}
