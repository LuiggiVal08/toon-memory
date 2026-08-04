/** Config format: "json" | "toml" | "jsonc" | "yaml" | "continue" | "openclaw" | "none" (instructions only) */
export type AgentFormat = "json" | "toml" | "jsonc" | "yaml" | "continue" | "openclaw" | "none"

/** Supported AI coding agent configuration */
export interface Agent {
  name: string
  global?: string
  local?: string
  /** Separate path for hook registration (when it differs from the MCP config path) */
  hookPath?: string
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

/** Watch mode options */
export interface WatchOptions {
  interval: number
  maxBackups: number
  compress: boolean
  logFile: boolean
  logPath: string
}
