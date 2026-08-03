import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

export const projectRoot = process.cwd()
export const HOME = process.env.HOME || process.env.USERPROFILE || "~"

/** Shared memory directory (agent-agnostic) */
export const MEMORY_DIR = join(projectRoot, ".toon-memory", "memory")

/**
 * Directory containing the running CLI bundle.
 * Derived from import.meta.url (NOT process.argv[1], which the entry points
 * overwrite with "toon-memory" — that made the paths resolve relative to the
 * hook's CWD). Every CLI bundle lives in dist/cli/, so this resolves to an
 * absolute path in the installed package.
 */
const scriptDir = dirname(fileURLToPath(import.meta.url))

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

## When asked to see the memory graph
- Call memory_visualize() to open the interactive graph viewer inline.

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

Memory auto-injects via .opencode/instructions/memory-autoload.md; use memory_recall only as fallback.
When the user asks to see the memory graph, call memory_visualize().
`
