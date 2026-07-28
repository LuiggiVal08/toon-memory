import { existsSync, readFileSync } from "fs"
import { dirname, join } from "path"
import type { Agent } from "./types"
import { HOME, projectRoot } from "./constants"

/**
 * Resolve this package's package.json by walking up from the module location.
 * Setup logic may run from dist/cli/setup.js, so a fixed relative path is wrong.
 */
export function resolvePackageJson(): string | null {
  let dir = dirname(process.argv[1] || ".")
  while (true) {
    const candidate = join(dir, "package.json")
    if (existsSync(candidate)) {
      try {
        const p = JSON.parse(readFileSync(candidate, "utf-8"))
        if (p && p.name === "toon-memory") return candidate
      } catch {
        // ignore and keep walking
      }
    }
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/**
 * Detect all supported AI coding agents on the system.
 *
 * Scans for configuration files in both global (~/.config/) and local
 * (.opencode/, .vscode/, etc.) locations.
 */
export function detectAgents(): Agent[] {
  const agents: Agent[] = []

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

  agents.push({
    name: "vscode/copilot",
    local: join(projectRoot, ".vscode", "mcp.json"),
    mcpKey: "servers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  agents.push({
    name: "claude",
    global: join(HOME, ".claude", "settings.json"),
    local: join(projectRoot, ".mcp.json"),
    hookPath: join(projectRoot, ".claude", "settings.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: true,
    needsInstructions: true,
    instructionFile: join(projectRoot, ".claude", "AGENTS.md"),
    captureJson: ["PostToolUse", "Stop"]
  })

  agents.push({
    name: "cursor",
    local: join(projectRoot, ".cursor", "mcp.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: true,
    needsInstructions: false,
    captureJson: ["PostToolUse", "Stop"]
  })

  agents.push({
    name: "windsurf",
    global: join(HOME, ".codeium", "windsurf", "mcp_config.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: true,
    needsInstructions: false,
    captureJson: ["PostToolUse", "Stop"]
  })

  agents.push({
    name: "cline",
    local: join(projectRoot, ".cline", "mcp.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: false,
    needsInstructions: false
  })

  agents.push({
    name: "continue",
    local: join(projectRoot, ".continue", "config.json"),
    mcpKey: "experimental.modelContextProtocolServers",
    format: "continue",
    needsHooks: false,
    needsInstructions: false
  })

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

  agents.push({
    name: "gemini",
    local: join(projectRoot, ".gemini", "settings.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: true,
    needsInstructions: true,
    instructionFile: join(projectRoot, ".gemini", "GEMINI.md"),
    captureJson: ["PostToolUse", "Stop"]
  })

  agents.push({
    name: "zed",
    global: join(HOME, ".config", "zed", "settings.json"),
    mcpKey: "context_servers",
    format: "jsonc",
    needsHooks: false,
    needsInstructions: false
  })

  agents.push({
    name: "antigravity",
    local: join(projectRoot, ".agents", "mcp_config.json"),
    mcpKey: "mcpServers",
    format: "json",
    needsHooks: true,
    needsInstructions: true,
    instructionFile: join(projectRoot, "antigravity-cli", "AGENTS.md")
  })

  agents.push({
    name: "aider",
    mcpKey: "",
    format: "none",
    needsHooks: false,
    needsInstructions: true,
    instructionFile: join(projectRoot, "CONVENTIONS.md")
  })

  agents.push({
    name: "kilocode",
    global: join(HOME, ".kilocode", "mcp_settings.json"),
    mcpKey: "mcp",
    format: "json",
    needsHooks: false,
    needsInstructions: true,
    instructionFile: join(HOME, ".kilocode", "rules", "toon-memory.md")
  })

  agents.push({
    name: "openclaw",
    global: join(HOME, ".openclaw", "openclaw.json"),
    mcpKey: "mcp.servers",
    format: "openclaw",
    needsHooks: false,
    needsInstructions: false
  })

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
