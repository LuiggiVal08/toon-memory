import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

describe("feedback utility", () => {
  const testDir = join(tmpdir(), "toon-memory-feedback-" + Date.now())
  const memoryDir = join(testDir, ".toon-memory", "memory")
  const memoryFile = join(memoryDir, "data.toon")
  const feedbackFile = join(memoryDir, "feedback.toon")
  const cwd = process.cwd()
  let feedback: typeof import("../src/mcp/feedback")
  let graph: typeof import("../src/lib/graph")

  const header = "version: 1\nentries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|pinned|path_scope|origin|status|supersededOn|importance|evidence}:\n"
  const entryLine = (id: string, key: string, content: string) =>
    `  ${id}|knowledge|${key}|${content}||tag|2026-08-01||0|||0.5|1.0||0|||||`

  beforeEach(async () => {
    mkdirSync(memoryDir, { recursive: true })
    writeFileSync(memoryFile, header + entryLine("aaa00001", "alpha-entry", "shared memory") + "\n" + entryLine("bbb00002", "beta-entry", "shared memory") + "\n")
    process.chdir(testDir)
    vi.resetModules()
    feedback = await import("../src/mcp/feedback")
    graph = await import("../src/lib/graph")
  })

  afterEach(() => {
    process.chdir(cwd)
    rmSync(testDir, { recursive: true, force: true })
  })

  it("appends explicit feedback with escaped fields", () => {
    feedback.appendFeedback({ key: "alpha-entry", signal: "useful", source: "explicit", session: "s1", task: "a | pipe\nnewline" })
    const events = feedback.readFeedback()
    expect(events).toHaveLength(1)
    expect(events[0].key).toBe("alpha-entry")
    expect(events[0].task).toBe("a | pipe\nnewline")
    expect(readFileSync(feedbackFile, "utf-8")).toContain("a \\| pipe\\nnewline")
  })

  it("aggregates utility with decay and ignores implicit events when not recorded", () => {
    feedback.appendFeedback({ key: "alpha-entry", signal: "useful", source: "explicit", ts: "2026-08-01T00:00:00.000Z" })
    feedback.appendFeedback({ key: "alpha-entry", signal: "irrelevant", source: "explicit", ts: "2026-08-01T00:00:00.000Z" })
    feedback.appendFeedback({ key: "beta-entry", signal: "wrong", source: "explicit", ts: "2026-08-01T00:00:00.000Z" })
    const utilities = feedback.utilityMap("2026-08-01")
    expect(utilities.get("alpha-entry")).toBeCloseTo(0)
    expect(utilities.get("beta-entry")).toBeCloseTo(-2)
  })

  it("flags evidence as conflict on wrong feedback", () => {
    expect(feedback.markWrong("beta-entry")).toBe(true)
    expect(readFileSync(memoryFile, "utf-8")).toContain("conflict")
  })

  it("a positive utility map can reorder otherwise tied recalls", () => {
    const data = readFileSync(memoryFile, "utf-8")
    const before = graph.graphRecallDetailed(data, "shared", { limit: 2 }).entries.map((e) => e.key)
    const after = graph.graphRecallDetailed(data, "shared", { limit: 2, utility: new Map([["beta-entry", 3]]) }).entries.map((e) => e.key)
    expect(before[0]).toBe("alpha-entry")
    expect(after[0]).toBe("beta-entry")
  })
})
