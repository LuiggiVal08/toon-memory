import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync, statSync } from "fs"
import { join } from "path"

/**
 * File-based multi-session coordination — no server, no network, no LLM.
 *
 * Each agent session owns exactly one heartbeat file under
 * `.toon-memory/memory/sessions/<id>.json`. Every process only ever writes
 * its OWN file (lock-free). Reads across files give other sessions a shared,
 * eventually-consistent view so parallel sessions (e.g. several OpenCode
 * windows) can see each other, their git branch, and which files they touch
 * — and avoid stepping on each other.
 *
 * A session is "active" while its last heartbeat is within SESSION_TTL_MS.
 * Dead sessions (pid no longer alive + stale heartbeat) are pruned lazily.
 */

/** A session is considered active if it sent a heartbeat within this window. */
export const SESSION_TTL_MS = 10 * 60 * 1000

/** How stale a dead session must be before we delete its file. */
export const PRUNE_STALE_MS = 10 * 60 * 1000

export interface SessionRecord {
  id: string
  agent: string
  pid: number
  branch: string
  startedAt: string
  lastSeen: string
  ended: boolean
  files: Record<string, string> // path -> lastTouch ISO
}

function isAlive(pid: number): boolean {
  if (!pid || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function sessionDir(): string {
  return join(process.cwd(), ".toon-memory", "memory", "sessions")
}

function sessionPath(id: string): string {
  return join(sessionDir(), `${id}.json`)
}

function ensureSessionDir(): void {
  const dir = sessionDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

/** Resolve a stable session id: agent payload first, then env override. */
export function resolveSessionId(payload: Record<string, unknown> = {}): string {
  const fromPayload =
    (payload.session_id as string) ||
    (payload.sessionId as string) ||
    (payload.session_id_untruncated as string)
  if (fromPayload && fromPayload.trim()) return fromPayload.trim()

  if (process.env.TOON_MEMORY_SESSION_ID && process.env.TOON_MEMORY_SESSION_ID.trim()) {
    return process.env.TOON_MEMORY_SESSION_ID.trim()
  }

  // Fallback: a per-process random id. Coordination is best-effort in this
  // case (no stable session across hook invocations), but the file still
  // records presence for the lifetime of the calling process.
  return `proc-${process.pid}-${Math.random().toString(36).slice(2, 10)}`
}

/** Detect the current git branch by reading .git/HEAD directly (no shell). */
export function currentBranch(): string {
  if (process.env.TOON_MEMORY_BRANCH && process.env.TOON_MEMORY_BRANCH.trim()) {
    return process.env.TOON_MEMORY_BRANCH.trim()
  }
  try {
    let gitDir = join(process.cwd(), ".git")
    // .git may be a file pointing at the real git dir (worktrees).
    if (existsSync(gitDir) && !statSync(gitDir).isDirectory()) {
      const pointer = readFileSync(gitDir, "utf-8").trim()
      if (pointer.startsWith("gitdir:")) {
        const target = pointer.slice(7).trim()
        gitDir = target.startsWith("/") ? target : join(process.cwd(), target)
      }
    }
    const headPath = join(gitDir, "HEAD")
    if (!existsSync(headPath)) return "unknown"
    const head = readFileSync(headPath, "utf-8").trim()
    if (head.startsWith("ref:")) {
      const ref = head.slice(4).trim()
      const parts = ref.split("/")
      return parts[parts.length - 1] || "unknown"
    }
    // Detached HEAD: HEAD holds a commit hash.
    return head ? head.slice(0, 7) : "unknown"
  } catch {
    return "unknown"
  }
}

function readRecord(id: string): SessionRecord | null {
  const p = sessionPath(id)
  if (!existsSync(p)) return null
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as SessionRecord
  } catch {
    return null
  }
}

/** Create or refresh the calling session's heartbeat file. */
export function heartbeat(agent: string, sessionId: string, opts: { file?: string; ended?: boolean } = {}): void {
  ensureSessionDir()
  const now = new Date().toISOString()
  const existing = readRecord(sessionId)
  const record: SessionRecord = existing
    ? { ...existing, agent, pid: process.pid, lastSeen: now, branch: currentBranch(), ended: opts.ended ?? existing.ended }
    : {
        id: sessionId,
        agent,
        pid: process.pid,
        branch: currentBranch(),
        startedAt: now,
        lastSeen: now,
        ended: opts.ended ?? false,
        files: {},
      }

  if (opts.file && opts.file.trim()) {
    record.files[opts.file.trim()] = now
  }

  writeFileSync(sessionPath(sessionId), JSON.stringify(record, null, 2))
}

/** Mark the calling session as ended (kept visible until TTL, then pruned). */
export function endSession(agent: string, sessionId: string): void {
  heartbeat(agent, sessionId, { ended: true })
}

interface ActiveSessionView extends SessionRecord {
  active: boolean
  ageMs: number
}

function recentIso(iso: string): boolean {
  const t = new Date(iso).getTime()
  return !isNaN(t) && Date.now() - t <= SESSION_TTL_MS
}

/** Read all session records with an `active` flag. */
export function listSessions(): ActiveSessionView[] {
  const dir = sessionDir()
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(dir, f), "utf-8")) as SessionRecord
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .map((r) => {
      const rec = r as SessionRecord
      const active = recentIso(rec.lastSeen)
      return { ...rec, active, ageMs: Date.now() - new Date(rec.lastSeen).getTime() }
    })
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
}

/**
 * Remove dead sessions: pid not alive AND heartbeat older than PRUNE_STALE_MS.
 * Safe because we never delete a file whose owner process is still running.
 * Returns the ids that were pruned.
 */
export function pruneSessions(): string[] {
  const pruned: string[] = []
  const dir = sessionDir()
  if (!existsSync(dir)) return pruned
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const p = join(dir, f)
    let rec: SessionRecord | null = null
    try {
      rec = JSON.parse(readFileSync(p, "utf-8"))
    } catch {
      continue
    }
    if (!rec) continue
    const stale = Date.now() - new Date(rec.lastSeen).getTime() > PRUNE_STALE_MS
    if (stale && !isAlive(rec.pid)) {
      try {
        unlinkSync(p)
        pruned.push(rec.id)
      } catch {
        // ignore
      }
    }
  }
  return pruned
}

/** Detect soft conflicts: files touched by >=2 active sessions. */
export function detectConflicts(active: ActiveSessionView[] = listSessions().filter((s) => s.active)): {
  file: string
  sessions: Array<{ id: string; agent: string; branch: string }>
}[] {
  const byFile = new Map<string, Array<{ id: string; agent: string; branch: string }>>()
  for (const s of active) {
    if (s.ended) continue
    for (const file of Object.keys(s.files)) {
      if (!byFile.has(file)) byFile.set(file, [])
      byFile.get(file)!.push({ id: s.id, agent: s.agent, branch: s.branch })
    }
  }
  const conflicts: { file: string; sessions: Array<{ id: string; agent: string; branch: string }> }[] = []
  for (const [file, sessions] of byFile) {
    if (sessions.length >= 2) conflicts.push({ file, sessions })
  }
  return conflicts
}

/** Convenience: list active sessions + conflicts in one call. */
export function coordinationView(selfId?: string) {
  const all = listSessions()
  const active = all.filter((s) => s.active)
  const conflicts = detectConflicts(active)
  const self = selfId ? all.find((s) => s.id === selfId) : undefined
  pruneSessions()
  return { active, conflicts, self }
}
