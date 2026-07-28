import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { dirname } from "path"
import type { Agent } from "./types"
import { MEMORY_DIR, CAPTURE_CONFIG } from "./constants"

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
  } else if (agent.name === "kilocode") {
    config[mcpKey]["toon-memory"] = {
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
 */
export function installTOMLConfig(agent: Agent): void {
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
 */
export function installZedConfig(agent: Agent): void {
  const configPath = agent.global
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  let config: Record<string, any> = {}
  if (existsSync(configPath)) {
    try {
      const raw = readFileSync(configPath, "utf-8")
      const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
      config = JSON.parse(stripped)
    } catch {
      config = {}
    }
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

  let config: Record<string, any> = {}
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"))
    } catch {
      config = {}
    }
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

  let config: Record<string, any> = {}
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"))
    } catch {
      config = {}
    }
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
    installTOMLConfig(agent)
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
