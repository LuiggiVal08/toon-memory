import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { dirname } from "path"
import type { Agent } from "./types"
import { MEMORY_DIR, CAPTURE_CONFIG } from "./constants"

/**
 * Read an existing JSON config file.
 * Returns {} when the file is missing, or null when it exists but cannot be
 * parsed — callers MUST skip (never overwrite) on null to avoid wiping the
 * user's other settings.
 */
function loadJSON(file: string): Record<string, any> | null {
  if (!existsSync(file)) return {}
  try {
    return JSON.parse(readFileSync(file, "utf-8"))
  } catch {
    return null
  }
}

/** Navigate (or create) a nested object path like "amp.mcpServers". */
function nested(obj: Record<string, any>, key: string): Record<string, any> {
  return key.split(".").reduce((acc: Record<string, any>, part) => {
    if (typeof acc[part] !== "object" || acc[part] === null) acc[part] = {}
    return acc[part]
  }, obj)
}

/**
 * Install MCP server configuration for a JSON-format agent.
 */
export function installJSONConfig(agent: Agent, scope: string): void {
  const configPath = scope === "global" ? agent.global : agent.local

  if (!configPath) {
    console.log(`  No ${scope} config path for ${agent.name}`)
    return
  }

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  const config = loadJSON(configPath)
  if (config === null) {
    console.log(`  ⚠️ Skipping ${configPath}: existing file is not valid JSON — fix it manually, then re-run.`)
    return
  }

  const mcpKey = agent.mcpKey || "mcpServers"
  const servers = nested(config, mcpKey)

  if (agent.name === "opencode") {
    servers["toon-memory"] = {
      enabled: true,
      type: "local",
      command: ["npx", "-y", "toon-memory", "mcp"]
    }
  } else if (agent.name === "kilocode") {
    servers["toon-memory"] = {
      type: "local",
      command: ["npx", "-y", "toon-memory", "mcp"]
    }
  } else {
    servers["toon-memory"] = {
      command: "npx",
      args: ["-y", "toon-memory", "mcp"]
    }
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP server configuration for a TOML-format agent (Codex / Grok).
 * The table name comes from agent.mcpKey so Grok's `mcp_servers` works too.
 * Appends to an existing file instead of overwriting user settings.
 */
export function installTOMLConfig(agent: Agent, scope: string): void {
  const configPath = scope === "global" ? agent.global : agent.local
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  const table = agent.mcpKey || "mcpServers"
  const block = `[${table}.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
`

  let content = ""
  if (existsSync(configPath)) {
    content = readFileSync(configPath, "utf-8")
    if (content.includes(`[${table}.toon-memory]`)) {
      console.log(`  MCP server already registered in ${configPath}`)
      return
    }
    if (content && !content.endsWith("\n")) content += "\n"
  }

  writeFileSync(configPath, content + block)
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP server configuration for Goose (YAML format).
 * Configures a stdio extension under the top-level `extensions` key.
 */
export function installYAMLConfig(agent: Agent, scope: string): void {
  const configPath = scope === "global" ? agent.global : agent.local
  if (!configPath) {
    console.log(`  No ${scope} config path for ${agent.name}`)
    return
  }

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  const entry = `  toon-memory:
    type: stdio
    cmd: npx
    args: ["-y", "toon-memory", "mcp"]
`

  let content = ""
  if (existsSync(configPath)) {
    content = readFileSync(configPath, "utf-8")
    if (content.includes("toon-memory")) {
      console.log(`  MCP server already registered in ${configPath}`)
      return
    }
  }

  if (!content) {
    content = `extensions:\n${entry}`
  } else if (/^extensions:\s*$/m.test(content)) {
    content = content.replace(/^extensions:\s*$/m, `extensions:\n${entry}`)
  } else {
    if (!content.endsWith("\n")) content += "\n"
    content += `extensions:\n${entry}`
  }

  writeFileSync(configPath, content)
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP server configuration for Zed (JSONC format).
 */
export function installZedConfig(agent: Agent): void {
  const configPath = agent.global
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  let config: Record<string, any> | null = {}
  if (existsSync(configPath)) {
    try {
      const raw = readFileSync(configPath, "utf-8")
      const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
      config = JSON.parse(stripped)
    } catch {
      config = null
    }
  }

  if (config === null) {
    console.log(`  ⚠️ Skipping ${configPath}: existing file is not valid JSON — fix it manually, then re-run.`)
    return
  }

  if (!config.context_servers) config.context_servers = {}

  config.context_servers["toon-memory"] = {
    command: "npx",
    args: ["-y", "toon-memory", "mcp"],
    source: "custom"
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP server configuration for Continue (array-based format).
 * Uses experimental.modelContextProtocolServers with name/command/args array.
 */
export function installContinueConfig(agent: Agent): void {
  const configPath = agent.local
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  const config = loadJSON(configPath)
  if (config === null) {
    console.log(`  ⚠️ Skipping ${configPath}: existing file is not valid JSON — fix it manually, then re-run.`)
    return
  }

  if (!config.experimental) config.experimental = {}
  if (!config.experimental.modelContextProtocolServers) {
    config.experimental.modelContextProtocolServers = []
  }

  const servers = config.experimental.modelContextProtocolServers
  const existing = servers.findIndex(
    (s: any) => s.name === "toon-memory"
  )
  const entry = {
    name: "toon-memory",
    command: "npx",
    args: ["-y", "toon-memory", "mcp"]
  }

  if (existing >= 0) {
    servers[existing] = entry
  } else {
    servers.push(entry)
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP server configuration for OpenClaw (nested mcp.servers format).
 */
export function installOpenClawConfig(agent: Agent): void {
  const configPath = agent.global
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  const config = loadJSON(configPath)
  if (config === null) {
    console.log(`  ⚠️ Skipping ${configPath}: existing file is not valid JSON — fix it manually, then re-run.`)
    return
  }

  if (!config.mcp) config.mcp = {}
  if (!config.mcp.servers) config.mcp.servers = {}

  config.mcp.servers["toon-memory"] = {
    command: "npx",
    args: ["-y", "toon-memory", "mcp"],
    enabled: true
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Install MCP server configuration for an agent based on its format.
 */
export function installMCPConfig(agent: Agent, scope: string): void {
  if (agent.format === "none") {
    console.log(`  ${agent.name}: instructions only (no MCP)`)
    return
  }

  if (agent.format === "toml") {
    installTOMLConfig(agent, scope)
  } else if (agent.format === "yaml") {
    installYAMLConfig(agent, scope)
  } else if (agent.format === "jsonc") {
    installZedConfig(agent)
  } else if (agent.format === "continue") {
    installContinueConfig(agent)
  } else if (agent.format === "openclaw") {
    installOpenClawConfig(agent)
  } else {
    installJSONConfig(agent, scope)
  }
}

/**
 * Read/write the shared memory config.json, preserving unknown keys.
 */
export function updateMemoryConfig(patch: Record<string, any>): void {
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
