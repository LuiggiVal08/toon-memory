/** Config format: "json" | "toml" | "jsonc" | "none" (instructions only) */
export type AgentFormat = "json" | "toml" | "jsonc" | "none"

/** Supported AI coding agent configuration */
export interface Agent {
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

/** Watch mode options */
export interface WatchOptions {
  interval: number
  maxBackups: number
  compress: boolean
  logFile: boolean
  logPath: string
}
