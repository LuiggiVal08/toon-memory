import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { heartbeat, coordinationView, resolveSessionId, currentBranch, SESSION_TTL_MS } from "../lib/sessions"
import { parseToonLine } from "../lib/utils"

/**
 * SessionStart hook for toon-memory.
 *
 * Runs once when an agent session begins. It:
 *  1. Registers this session's heartbeat (so parallel sessions can see it).
 *  2. Prints a short reminder listing OTHER active sessions, their branches,
 *     and any soft file conflicts — so the agent doesn't clobber sibling work.
 *  3. Injects the system primer (top memories by importance) so the agent
 *     starts with context without having to call memory_recall.
 *
 * No network, no LLM. Exits 0 always (a failing hook must never block the
 * agent from starting).
 */

const MEMORY_DIR = join(process.cwd(), ".toon-memory", "memory")
const MEMORY_FILE = join(MEMORY_DIR, "data.toon")

/** Minimal system primer: top 5 memories by importance. ~50-100 tokens. */
function systemPrimer(): string {
  if (!existsSync(MEMORY_FILE)) return ""
  try {
    const data = readFileSync(MEMORY_FILE, "utf-8")
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
    if (lines.length === 0) return ""

    // Parse entries and sort by importance (accessed + recency)
    const entries = lines
      .map((l) => {
        const p = parseToonLine(l)
        if (p.length < 7) return null
        const accessed = p.length > 8 ? parseInt(p[8]) || 0 : 0
        const daysSince = (Date.now() - new Date(`${p[6]}T00:00:00`).getTime()) / 86400000
        const recency = daysSince < 7 ? 3 : daysSince < 30 ? 2 : daysSince < 90 ? 1 : 0
        return { key: p[2], content: p[3], category: p[1], tags: p[5] || "", importance: accessed + recency }
      })
      .filter(Boolean)
      .sort((a, b) => b!.importance - a!.importance)
      .slice(0, 5)

    if (entries.length === 0) return ""

    const lines2 = ["  Top memories:"]
    for (const e of entries) {
      lines2.push(`    [${e!.category}] ${e!.key}: ${e!.content.slice(0, 100)}`)
    }
    return lines2.join("\n")
  } catch {
    return ""
  }
}

function main(): void {
  const agent = process.argv[2] || "agent"

  let payload: Record<string, unknown> = {}
  try {
    const raw = readFileSync(0, "utf-8")
    if (raw.trim()) payload = JSON.parse(raw)
  } catch {
    // no/empty payload is fine
  }

  const sessionId = resolveSessionId(payload)
  try {
    heartbeat(agent, sessionId)
  } catch {
    // never block session start
  }

  let view: ReturnType<typeof coordinationView>
  try {
    view = coordinationView(sessionId)
  } catch {
    process.exit(0)
  }

  const others = view.active.filter((s) => s.id !== sessionId && !s.ended)
  const lines: string[] = []
  lines.push("toon-memory:")
  lines.push(`  This session: ${agent} @ ${currentBranch()} (window ${Math.round(SESSION_TTL_MS / 60000)} min)`)

  if (others.length > 0) {
    lines.push(`  Other active sessions (${others.length}):`)
    for (const s of others) {
      const files = Object.keys(s.files).slice(0, 5).join(", ") || "—"
      lines.push(`    • ${s.agent} @ ${s.branch} — ${files}`)
    }
  } else {
    lines.push("  No other active sessions.")
  }

  if (view.conflicts.length > 0) {
    lines.push(`  ⚠️ Soft conflicts (${view.conflicts.length}): use memory_sessions for details.`)
    for (const c of view.conflicts) {
      lines.push(`    • ${c.file}`)
    }
  } else {
    lines.push("  No file conflicts detected.")
  }

  // Inject system primer (top memories) — automatic context at session start
  const primer = systemPrimer()
  if (primer) {
    lines.push(primer)
  }

  lines.push("  Use memory_recall before reading files and memory_sessions to coordinate.")
  console.log(lines.join("\n"))
  process.exit(0)
}

main()
