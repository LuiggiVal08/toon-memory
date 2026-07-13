import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { execSync } from "child_process"
import {
  heartbeat,
  endSession,
  listSessions,
  pruneSessions,
  detectConflicts,
  coordinationView,
  SESSION_TTL_MS,
  PRUNE_STALE_MS,
} from "../src/lib/sessions"

const testDir = join(tmpdir(), "toon-sessions-test-" + Date.now())
const cwd = process.cwd()

beforeEach(() => {
  mkdirSync(testDir, { recursive: true })
  rmSync(join(testDir, ".toon-memory"), { recursive: true, force: true })
  process.chdir(testDir)
})

afterEach(() => {
  process.chdir(cwd)
  rmSync(testDir, { recursive: true, force: true })
})

describe("Session coordination", () => {
  it("registers a heartbeat and lists it as active", () => {
    heartbeat("claude", "sess-1", { file: "src/a.ts" })
    const all = listSessions()
    expect(all).toHaveLength(1)
    expect(all[0]!.id).toBe("sess-1")
    expect(all[0]!.active).toBe(true)
    expect(all[0]!.agent).toBe("claude")
    expect(all[0]!.files["src/a.ts"]).toBeDefined()
  })

  it("updates lastSeen and accumulates files on repeated heartbeats", () => {
    heartbeat("claude", "sess-1", { file: "src/a.ts" })
    const first = listSessions()[0]!.lastSeen
    // ensure timestamp differs
    const t = new Date()
    t.setMilliseconds(t.getMilliseconds() + 5)
    heartbeat("claude", "sess-1", { file: "src/b.ts" })
    const second = listSessions()[0]!
    expect(Object.keys(second.files)).toContain("src/a.ts")
    expect(Object.keys(second.files)).toContain("src/b.ts")
    expect(second.lastSeen >= first).toBe(true)
  })

  it("marks a session ended but keeps it visible within TTL", () => {
    heartbeat("opencode", "sess-2", { file: "docs/x.md" })
    endSession("opencode", "sess-2")
    const s = listSessions().find((x) => x.id === "sess-2")!
    expect(s.ended).toBe(true)
    expect(s.active).toBe(true)
  })

  it("detects soft conflicts across active sessions", () => {
    heartbeat("claude", "A", { file: "shared.ts" })
    heartbeat("opencode", "B", { file: "shared.ts" })
    heartbeat("gemini", "C", { file: "other.ts" })
    const active = listSessions().filter((s) => s.active)
    const conflicts = detectConflicts(active)
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]!.file).toBe("shared.ts")
    expect(conflicts[0]!.sessions.map((s) => s.id).sort()).toEqual(["A", "B"])
  })

  it("does not flag conflicts for ended sessions", () => {
    heartbeat("claude", "A", { file: "shared.ts" })
    heartbeat("opencode", "B", { file: "shared.ts" })
    endSession("opencode", "B")
    const active = listSessions().filter((s) => s.active && !s.ended)
    const conflicts = detectConflicts(active)
    expect(conflicts).toHaveLength(0)
  })

  it("prunes stale dead sessions but keeps active ones", () => {
    // Write a fake dead session file with an old timestamp and a bogus pid.
    const sessionsDir = join(testDir, ".toon-memory", "memory", "sessions")
    mkdirSync(sessionsDir, { recursive: true })
    const old = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    writeFileSync(
      join(sessionsDir, "dead.json"),
      JSON.stringify({ id: "dead", agent: "x", pid: 999999, branch: "main", startedAt: old, lastSeen: old, ended: true, files: {} })
    )
    heartbeat("claude", "live", { file: "a.ts" })
    const pruned = pruneSessions()
    expect(pruned).toContain("dead")
    const remaining = listSessions().map((s) => s.id)
    expect(remaining).toContain("live")
    expect(remaining).not.toContain("dead")
  })

  it("coordinationView returns active sessions, conflicts, and self", () => {
    heartbeat("claude", "self", { file: "a.ts" })
    heartbeat("opencode", "other", { file: "a.ts" })
    const view = coordinationView("self")
    expect(view.self?.id).toBe("self")
    expect(view.active.map((s) => s.id).sort()).toEqual(["other", "self"])
    expect(view.conflicts).toHaveLength(1)
  })
})

describe("Conflict edge cases", () => {
  it("groups all sessions sharing a file into a single conflict", () => {
    heartbeat("claude", "A", { file: "x.ts" })
    heartbeat("opencode", "B", { file: "x.ts" })
    heartbeat("gemini", "C", { file: "x.ts" })
    const conflicts = detectConflicts(listSessions().filter((s) => s.active))
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]!.file).toBe("x.ts")
    expect(conflicts[0]!.sessions.map((s) => s.id).sort()).toEqual(["A", "B", "C"])
  })

  it("only flags files touched by 2+ sessions", () => {
    heartbeat("claude", "A", { file: "a.ts" })
    heartbeat("opencode", "B", { file: "b.ts" })
    const conflicts = detectConflicts(listSessions().filter((s) => s.active))
    expect(conflicts).toHaveLength(0)
  })

  it("does not flag a file touched by the same session twice", () => {
    heartbeat("claude", "A", { file: "a.ts" })
    heartbeat("claude", "A", { file: "a.ts" })
    const conflicts = detectConflicts(listSessions().filter((s) => s.active))
    expect(conflicts).toHaveLength(0)
  })

  it("reports conflicting sessions with agent and branch metadata", () => {
    heartbeat("claude", "A", { file: "shared.ts" })
    heartbeat("opencode", "B", { file: "shared.ts" })
    const conflicts = detectConflicts(listSessions().filter((s) => s.active))
    const sess = conflicts[0]!.sessions.find((s) => s.id === "B")!
    expect(sess.agent).toBe("opencode")
    expect(typeof sess.branch).toBe("string")
  })
})

describe("Pruning edge cases", () => {
  function writeRecord(id: string, pid: number, lastSeenMsAgo: number, ended = true): void {
    const sessionsDir = join(testDir, ".toon-memory", "memory", "sessions")
    mkdirSync(sessionsDir, { recursive: true })
    const lastSeen = new Date(Date.now() - lastSeenMsAgo).toISOString()
    writeFileSync(
      join(sessionsDir, `${id}.json`),
      JSON.stringify({ id, agent: "x", pid, branch: "main", startedAt: lastSeen, lastSeen, ended, files: {} })
    )
  }

  it("keeps a stale session whose process is still alive", () => {
    writeRecord("zombie", process.pid, PRUNE_STALE_MS + 60_000)
    const pruned = pruneSessions()
    expect(pruned).not.toContain("zombie")
    expect(listSessions().map((s) => s.id)).toContain("zombie")
  })

  it("keeps a recent session whose process is dead", () => {
    writeRecord("fresh-dead", 999999, 1000)
    const pruned = pruneSessions()
    expect(pruned).not.toContain("fresh-dead")
    expect(listSessions().map((s) => s.id)).toContain("fresh-dead")
  })

  it("returns empty when there are no dead+stale sessions", () => {
    heartbeat("claude", "live", { file: "a.ts" })
    expect(pruneSessions()).toHaveLength(0)
  })

  it("prunes multiple dead+stale sessions in one pass", () => {
    writeRecord("d1", 999991, PRUNE_STALE_MS + 1000)
    writeRecord("d2", 999992, PRUNE_STALE_MS + 2000)
    heartbeat("live", "keep", { file: "a.ts" })
    const pruned = pruneSessions().sort()
    expect(pruned).toEqual(["d1", "d2"])
    const remaining = listSessions().map((s) => s.id)
    expect(remaining).toContain("keep")
    expect(remaining).not.toContain("d1")
    expect(remaining).not.toContain("d2")
  })
})

describe("Capture hook session heartbeat", () => {
  const cliPath = join(__dirname, "..", "dist", "cli", "capture.js")

  it("writes a session heartbeat file on every invocation (even with capture off)", () => {
    const payload = JSON.stringify({
      session_id: "hook-sess",
      tool_name: "Edit",
      tool_input: { file_path: "src/foo.ts" },
    })
    execSync(`node ${cliPath} claude`, { input: payload, encoding: "utf-8" })
    const sessFile = join(testDir, ".toon-memory", "memory", "sessions", "hook-sess.json")
    expect(existsSync(sessFile)).toBe(true)
    const rec = JSON.parse(readFileSync(sessFile, "utf-8"))
    expect(rec.id).toBe("hook-sess")
    expect(rec.agent).toBe("claude")
    expect(rec.files["src/foo.ts"]).toBeDefined()
  })

  it("does NOT write observations when capture is off", () => {
    const payload = JSON.stringify({ session_id: "hook-sess2", tool_name: "Edit", tool_input: { file_path: "x.ts" } })
    execSync(`node ${cliPath} claude`, { input: payload, encoding: "utf-8" })
    const obsFile = join(testDir, ".toon-memory", "memory", "observations.toon")
    expect(existsSync(obsFile)).toBe(false)
  })

  it("does write observations when capture is on", () => {
    mkdirSync(join(testDir, ".toon-memory", "memory"), { recursive: true })
    writeFileSync(
      join(testDir, ".toon-memory", "memory", "config.json"),
      JSON.stringify({ capture: true })
    )
    const payload = JSON.stringify({ session_id: "hook-sess3", tool_name: "Write", tool_input: { file_path: "y.ts", content: "secret sk-ABCDEFGHIJKLMNOPQRSTUVWX" } })
    execSync(`node ${cliPath} claude`, { input: payload, encoding: "utf-8" })
    const obsFile = join(testDir, ".toon-memory", "memory", "observations.toon")
    expect(existsSync(obsFile)).toBe(true)
    const content = readFileSync(obsFile, "utf-8")
    expect(content).toContain("secret")
    expect(content).toContain("<redacted>")
    expect(content).not.toContain("sk-ABCDEFGHIJKLMNOPQRSTUVWX")
  })
})
