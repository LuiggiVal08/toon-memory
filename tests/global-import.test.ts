import { describe, it, expect } from "vitest"
import { mergeMemoryFiles } from "../src/mcp/consolidation"
import { parseEntries } from "../src/lib/graph"
import { parseToonLine } from "../src/lib/utils"

const line = (id: string, key: string, content: string, extra = "") =>
  `  ${id}|decision|${key}|${content}|${extra}`
const legacy = (id: string, key: string, content: string) =>
  `  ${id}|decision|${key}|${content}|file.ts|tag|2026-08-01|`

describe("mergeMemoryFiles (F5 global import)", () => {
  const today = new Date().toISOString().split("T")[0]
  const full = (id: string, key: string, content: string, evidence: string) =>
    `  ${id}|decision|${key}|${content}|auth.ts|auth|${today}||0||0.70|1.0||0||agent|active|||${evidence}`

  it("adds new keys and counts them", () => {
    const local = "version: 1\n[1|]{id|category|key|content}:\n" + legacy("a1", "existing-key", "keep me")
    const incoming = "version: 1\n[1|]{id|category|key|content}:\n" + legacy("g1", "global-key", "new global rule")
    const res = mergeMemoryFiles(local, incoming)
    expect(res.added).toBe(1)
    expect(res.updated).toBe(0)
    expect(res.data).toContain("global-key")
    expect(res.data).toContain("existing-key")
  })

  it("merges overlapping keys, keeping the local id and latest content", () => {
    const local = "version: 1\n[1|]{id|category|key|content}:\n" + legacy("a1", "shared", "local content")
    const incoming = "version: 1\n[1|]{id|category|key|content}:\n" + legacy("g1", "shared", "incoming content")
    const res = mergeMemoryFiles(local, incoming)
    expect(res.added).toBe(0)
    expect(res.updated).toBe(1)
    expect(res.data).toContain("a1")
    expect(res.data).not.toContain("g1")
    expect(res.data).toContain("incoming content")
  })

  it("preserves the version prefix and summary blocks", () => {
    const local = [
      "version: 1",
      "summaries:",
      "  summary-file.ts|A summary",
      "[1|]{id|category|key|content}:",
      legacy("a1", "k1", "body"),
    ].join("\n")
    const res = mergeMemoryFiles(local, "version: 1\n[1|]{id|category|key|content}:\n" + legacy("g1", "k2", "extra"))
    expect(res.data).toContain("summaries:")
    expect(res.data).toContain("A summary")
    expect(res.data.split("\n")[0]).toBe("version: 1")
  })

  it("carries the evidence field through the merge (conflict wins)", () => {
    const local = "version: 1\n[1|]{id|category|key|content}:\n" + full("a1", "auth-jwt", "we chose JWT", "verified")
    const incoming = "version: 1\n[1|]{id|category|key|content}:\n" + full("g1", "auth-jwt", "we chose JWT", "conflict")
    const res = mergeMemoryFiles(local, incoming)
    const mergedLine = res.data.split("\n").find((l) => l.includes("auth-jwt"))
    expect(parseToonLine(mergedLine!)[19]).toBe("conflict")
  })

  it("imports minimal legacy lines (4 fields)", () => {
    const incoming = "version: 1\n[1|]{id|category|key|content}:\n  aaa000001|decision|legacy-rule|always use tabs\n"
    const res = mergeMemoryFiles("version: 1\n[0|]{id|category|key|content}:\n", incoming)
    expect(res.added).toBe(1)
    expect(res.data).toContain("legacy-rule")
  })

  it("produces output that parseEntries reads back (two-space indent preserved)", () => {
    const local = "version: 1\n[1|]{id|category|key|content}:\n" + legacy("a1", "local-key", "local")
    const incoming = "version: 1\n[1|]{id|category|key|content}:\n" + legacy("g1", "global-key", "new global rule")
    const res = mergeMemoryFiles(local, incoming)
    expect(res.data.split("\n").filter((l) => l.startsWith("  "))).toHaveLength(2)
    const parsed = parseEntries(res.data)
    expect(parsed.map((e) => e.key)).toEqual(["local-key", "global-key"])
  })

  it("ignores malformed and summary-like lines from the incoming file", () => {
    const incoming = [
      "version: 1",
      "entries[2|]{id|category|key|content}:",
      legacy("g1", "good-key", "valid"),
      "  not-an-entry",
    ].join("\n")
    const res = mergeMemoryFiles("version: 1\n[0|]{id|category|key|content}:\n", incoming)
    expect(res.added).toBe(1)
    expect(res.data).toContain("good-key")
    expect(res.data).not.toContain("not-an-entry")
  })
})
