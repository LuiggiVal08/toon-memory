import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs"
import { dirname, join } from "path"

export const projectRoot = process.cwd()
export const HOME = process.env.HOME || process.env.USERPROFILE || "~"

/** Shared memory directory (agent-agnostic) */
export const MEMORY_DIR = join(projectRoot, ".toon-memory", "memory")

/**
 * Directory containing the running CLI script.
 * Derived from process.argv[1] — avoids __dirname / import.meta.url issues
 * in ESM bundles with top-level await.
 */
const scriptDir = dirname(process.argv[1] || process.cwd())

/** Path to the compiled capture script (dist/cli/capture.js) */
export const CAPTURE_JS = join(scriptDir, "capture.js")

/** Path to the compiled session-start reminder script (dist/cli/session-start.js) */
export const SESSION_START_JS = join(scriptDir, "session-start.js")

/** Config file that holds the opt-in capture flag */
export const CAPTURE_CONFIG = join(MEMORY_DIR, "config.json")

export const ANTIGRAVITY_HOOK_NAME = "toon-memory"

/** Base instruction content for agents */
export const INSTRUCTION_CONTENT = `# toon-memory

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
 * Passive instruction note for OpenCode. Unlike other agents, OpenCode gets its
 * memory auto-injected via `.opencode/instructions/memory-autoload.md` (written
 * by the plugin on session.created), so the agent should NOT be told to actively
 * run memory_recall — that would duplicate context. memory_recall is only a
 * fallback for deep/semantic queries beyond the auto-loaded dump.
 */
export const OPENCODE_PASSIVE_INSTRUCTION = `# toon-memory

La memoria se auto-inyecta vía .opencode/instructions/memory-autoload.md; usa memory_recall solo como fallback.
`
