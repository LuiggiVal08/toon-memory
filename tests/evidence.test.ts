import { describe, it, expect } from "vitest"
import { parseEntries } from "../src/lib/graph"
import { parseToonLine, toToonLine } from "../src/lib/utils"
import { mergeEntries, generateSmartRecall } from "../src/lib/quality"
import {
  contentJaccard,
  detectContradictions,
  evidenceFor,
  evidenceBoost,
  EVIDENCE_BOOST,
} from "../src/lib/evidence"

const entry = (
  id: string,
  key: string,
  content: string,
  extra: { category?: string; tags?: string[]; importance?: string; status?: string; evidence?: string } = {}
) =>
  ({
    id,
    key,
    category: extra.category || "decision",
    content,
    file: "",
    tags: extra.tags || [],
    date: "2026-08-01",
    ttl: "",
    accessed: 0,
    links: [],
    lastAccessed: "",
    priority: 0,
    path_scope: "",
    origin: "agent" as const,
    status: (extra.status || "active") as "active" | "obsolete" | "resolved" | "draft",
    supersededOn: "",
    importance: extra.importance || "",
    evidence: extra.evidence || "",
  })

describe("contentJaccard", () => {
  it("returns 1 for identical text", () => {
    expect(contentJaccard("use zod for validation", "use zod for validation")).toBe(1)
  })

  it("returns 0 for disjoint text", () => {
    expect(contentJaccard("redis pool fix", "css grid layout")).toBe(0)
  })

  it("is symmetric and bounded", () => {
    const a = contentJaccard("auth uses jwt tokens", "auth uses jwt tokens and refresh")
    const b = contentJaccard("auth uses jwt tokens and refresh", "auth uses jwt tokens")
    expect(a).toBeCloseTo(b)
    expect(a).toBeGreaterThan(0)
    expect(a).toBeLessThan(1)
  })
})

describe("detectContradictions", () => {
  const warning = entry("w1", "dont-use-mysql", "never use MySQL for this project, use Postgres", {
    category: "warning",
  })

  it("flags a candidate that overlaps a warning", () => {
    const candidate = { key: "use-mysql", content: "lets use MySQL for this project instead", category: "decision", tags: ["db"] }
    const hits = detectContradictions([warning], candidate)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].key).toBe("dont-use-mysql")
    expect(hits[0].category).toBe("warning")
  })

  it("flags a candidate that overlaps a critical decision", () => {
    const critical = entry("c1", "auth-jwt", "we chose JWT over sessions for auth", { importance: "critical" })
    const candidate = { key: "auth-sessions", content: "we chose sessions over JWT for auth", category: "decision", tags: ["auth"] }
    const hits = detectContradictions([critical], candidate)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].key).toBe("auth-jwt")
  })

  it("does not flag a candidate merely repeating a weak entry", () => {
    const weak = entry("w1", "db-choice", "we use Postgres for storage", { importance: "" })
    const candidate = { key: "db-choice-2", content: "we use Postgres for storage", category: "decision", tags: ["db"] }
    expect(detectContradictions([weak], candidate)).toHaveLength(0)
  })

  it("ignores obsolete/draft entries", () => {
    const obsolete = entry("o1", "old-pick", "we use Redis for cache", { status: "obsolete", importance: "critical" })
    const draft = entry("o2", "new-pick", "we use Redis for cache", { status: "draft", importance: "critical" })
    const candidate = { key: "pick-3", content: "we use Redis for cache", category: "decision", tags: ["cache"] }
    expect(detectContradictions([obsolete, draft], candidate)).toHaveLength(0)
  })

  it("ignores its own key", () => {
    const strong = entry("s1", "same-key", "we use Redis for cache", { importance: "critical" })
    const candidate = { key: "same-key", content: "we use Redis for cache", category: "decision", tags: ["cache"] }
    expect(detectContradictions([strong], candidate)).toHaveLength(0)
  })

  it("sorts hits by similarity descending", () => {
    const hits = detectContradictions(
      [entry("a", "topic-x", "exact same topic wording here", { category: "warning" })],
      { key: "topic-y", content: "exact same topic wording here", category: "decision", tags: [] }
    )
    expect(hits[0].similarity).toBeGreaterThanOrEqual(50)
  })
})

describe("evidenceFor", () => {
  const entries = [
    entry("w1", "dont-use-mysql", "never use MySQL in this project", { category: "warning" }),
  ]

  it("returns conflict when the candidate contradicts a strong entry", () => {
    const candidate = { key: "use-mysql", content: "lets use MySQL for this project instead", category: "decision", tags: [] }
    expect(evidenceFor(entries, candidate, "")).toBe("conflict")
  })

  it("returns verified when the referenced file exists", () => {
    const candidate = { key: "redis-config", content: "pool max_connections 20", category: "bug", tags: [] }
    expect(evidenceFor([], candidate, "src/lib/quality.ts")).toBe("verified")
  })

  it("returns unverified when the file is claimed but missing", () => {
    const candidate = { key: "old-file", content: "config lives in this file", category: "knowledge", tags: [] }
    expect(evidenceFor([], candidate, "src/does-not-exist-123.ts")).toBe("unverified")
  })

  it("returns empty (neutral) when no file is claimed and no conflict", () => {
    const candidate = { key: "team-process", content: "we ship on tuesdays", category: "knowledge", tags: [] }
    expect(evidenceFor([], candidate, "")).toBe("")
  })
})

describe("evidenceBoost", () => {
  it("surfaces conflicts and rewards verified entries", () => {
    expect(EVIDENCE_BOOST.conflict).toBeGreaterThan(EVIDENCE_BOOST.verified)
    expect(EVIDENCE_BOOST.verified).toBeGreaterThan(0)
    expect(EVIDENCE_BOOST.unverified).toBeLessThan(0)
    expect(evidenceBoost("conflict")).toBe(EVIDENCE_BOOST.conflict)
    expect(evidenceBoost("")).toBe(0)
    expect(evidenceBoost("bogus")).toBe(0)
  })
})

describe("evidence round-trip through the TOON format", () => {
  it("persists evidence as the 20th field", () => {
    const line = toToonLine(["id1", "decision", "auth-jwt", "content", "auth.ts", "auth", "2026-08-01", "", "0", "", "0.70", "1.0", "", "0", "", "agent", "active", "", "critical", "conflict"])
    const parts = parseToonLine(line)
    expect(parts.length).toBe(20)
    expect(parts[19]).toBe("conflict")
    const parsed = parseEntries(`version: 1\nentries[1|]{id|category|key|content}:\n${line}\n`)
    expect(parsed[0].evidence).toBe("conflict")
    expect(parsed[0].importance).toBe("critical")
  })

  it("treats legacy lines without evidence as neutral", () => {
    const line = toToonLine(["id1", "decision", "k", "content", "f.ts", "t", "2026-08-01", "", "0", "", "0.70", "1.0", "", "0", "", "agent", "active", "", "high"])
    const parsed = parseEntries(`version: 1\nentries[1|]{id|category|key|content}:\n${line}\n`)
    expect(parsed[0].evidence).toBe("")
  })
})

describe("mergeEntries evidence handling", () => {
  const mk = (evidence: string) =>
    toToonLine(["idA", "decision", "auth-jwt", "content", "auth.ts", "auth", "2026-08-01", "", "0", "", "0.70", "1.0", "", "0", "", "agent", "active", "", "high", evidence])

  it("keeps the existing evidence when the incoming one is empty", () => {
    const merged = mergeEntries(mk("verified"), mk(""))
    expect(parseToonLine(merged)[19]).toBe("verified")
  })

  it("promotes conflict over verified", () => {
    const merged = mergeEntries(mk("verified"), mk("conflict"))
    expect(parseToonLine(merged)[19]).toBe("conflict")
  })
})

describe("evidence ranking bias", () => {
  it("surfaces a conflict-flagged entry above an otherwise identical verified one", () => {
    const today = new Date().toISOString().split("T")[0]
    const line = (id: string, key: string, evidence: string) =>
      `  ${id}|decision|${key}|we chose JWT for auth tokens|auth.ts|auth;jwt|${today}||0||0.70|1.0||0||agent|active|||${evidence}`
    const data = [
      "version: 1",
      `[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:`,
      line("aaa000001", "auth-jwt-a", "verified"),
      line("aaa000002", "auth-jwt-b", "conflict"),
    ].join("\n")

    const out = generateSmartRecall(data, "jwt auth", { limit: 2 })
    expect(out.indexOf("auth-jwt-b")).toBeGreaterThanOrEqual(0)
    expect(out.indexOf("auth-jwt-a")).toBeGreaterThanOrEqual(0)
    expect(out.indexOf("auth-jwt-b")).toBeLessThan(out.indexOf("auth-jwt-a"))
  })
})
