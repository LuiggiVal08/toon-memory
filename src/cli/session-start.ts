import { readFileSync } from "fs"
import { heartbeat, coordinationView, resolveSessionId, currentBranch, SESSION_TTL_MS } from "../lib/sessions"

/**
 * SessionStart hook for toon-memory.
 *
 * Runs once when an agent session begins. It:
 *  1. Registers this session's heartbeat (so parallel sessions can see it).
 *  2. Prints a short reminder listing OTHER active sessions, their branches,
 *     and any soft file conflicts — so the agent doesn't clobber sibling work.
 *
 * No network, no LLM. Exits 0 always (a failing hook must never block the
 * agent from starting).
 */

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
  lines.push(`  Esta sesión: ${agent} @ ${currentBranch()} (ventana ${Math.round(SESSION_TTL_MS / 60000)} min)`)

  if (others.length > 0) {
    lines.push(`  Otras sesiones activas (${others.length}):`)
    for (const s of others) {
      const files = Object.keys(s.files).slice(0, 5).join(", ") || "—"
      lines.push(`    • ${s.agent} @ ${s.branch} — ${files}`)
    }
  } else {
    lines.push("  Sin otras sesiones activas.")
  }

  if (view.conflicts.length > 0) {
    lines.push(`  ⚠️ Conflictos suaves (${view.conflicts.length}): usa memory_sessions para ver detalle.`)
    for (const c of view.conflicts) {
      lines.push(`    • ${c.file}`)
    }
  } else {
    lines.push("  Sin conflictos de archivos detectados.")
  }

  lines.push("  Usa memory_recall antes de leer archivos y memory_sessions para coordinar.")
  console.log(lines.join("\n"))
  process.exit(0)
}

main()
