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
const INSTRUCTION_CONTENT_BASE = `# toon-memory

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

/** Marker used to keep injected instructions idempotent without matching unrelated prose. */
export const INSTRUCTION_MARKER = "<!-- toon-memory:instructions -->"

const ACTIVE_RULES = `
## Memory loop
- A compact brief is auto-injected at session start; when a task is known it is a context_compile packet with directives, constraints and retrieve/hydrate keys.
- Call memory_compile(task=...) at task start for a fresh packet; follow its Retrieval plan and hydrate only the keys you need.
- Use memory_recall BEFORE the first read/grep when the task may already be solved in memory.
- Before editing a file, check the warnings in the brief; run memory_recall(query=<path>) for file-specific traps.
- When a recalled entry was useful or wrong, call memory_feedback(key=..., signal=...) to train future ranking.
- When you learn a directive, decision or fix, save it with memory_remember — or let the ambient hooks capture it.
- When the user asks to see the memory graph, call memory_visualize().
`

export const OPENCODE_PASSIVE_INSTRUCTION = `${INSTRUCTION_MARKER}
# toon-memory
${ACTIVE_RULES}`

export const INSTRUCTION_CONTENT = `${INSTRUCTION_MARKER}
${INSTRUCTION_CONTENT_BASE}${ACTIVE_RULES}`
