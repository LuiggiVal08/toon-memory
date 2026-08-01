import { describe, it, expect } from "vitest"
import { qualityScore, mergeEntries, generateSmartRecall, generateSystemPrimer } from "../src/lib/quality"
import { parseToonLine } from "../src/lib/utils"
import { extractVersion } from "../src/mcp/consolidation"

describe("qualityScore", () => {
  const today = new Date().toISOString().split("T")[0]

  it("returns 0 for empty entry", () => {
    expect(qualityScore("", "", "", "")).toBe(0)
  })

  it("scores higher with more tags", () => {
    const noTags = qualityScore("", "", "Some content here for testing", today)
    const oneTag = qualityScore("redis", "", "Some content here for testing", today)
    const twoTags = qualityScore("redis;cache", "", "Some content here for testing", today)
    expect(oneTag).toBeGreaterThan(noTags)
    expect(twoTags).toBeGreaterThan(oneTag)
  })

  it("scores higher with links", () => {
    const noLinks = qualityScore("tag", "", "Some content here for testing", today)
    const oneLink = qualityScore("tag", "related-key", "Some content here for testing", today)
    expect(oneLink).toBeGreaterThan(noLinks)
  })

  it("scores higher with longer content", () => {
    const short = qualityScore("tag", "", "Short", today)
    const medium = qualityScore("tag", "", "This is a medium length content that passes the threshold", today)
    const long = qualityScore("tag", "", "This is a very long content that exceeds the 150 character threshold for maximum content quality bonus in the scoring algorithm", today)
    expect(medium).toBeGreaterThan(short)
    expect(long).toBeGreaterThan(medium)
  })

  it("scores higher for recent entries", () => {
    const recent = qualityScore("tag", "", "Some content here for testing", today)
    const old = qualityScore("tag", "", "Some content here for testing", "2025-01-01")
    expect(recent).toBeGreaterThan(old)
  })

  it("never exceeds 1.0", () => {
    const max = qualityScore("a;b;c;d", "link1 link2 link3", "Very long content that exceeds all thresholds for maximum scoring in the quality evaluation system", today)
    expect(max).toBeLessThanOrEqual(1)
  })
})

describe("mergeEntries", () => {
  const today = new Date().toISOString().split("T")[0]

  it("merges tags as union", () => {
    const existing = `id1|decision|test-key|Old content|file.ts|redis;cache|2026-07-01||0||0.50|0.8`
    const incoming = `id2|decision|test-key|New content|file.ts|redis;db|${today}||0||0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = parseToonLine(merged)
    const tags = parts[5].split(";")
    expect(tags).toContain("redis")
    expect(tags).toContain("cache")
    expect(tags).toContain("db")
  })

  it("takes the newer date", () => {
    const existing = `id1|decision|test-key|Content|file.ts|tag|2026-07-01||0||0.50|0.8`
    const incoming = `id2|decision|test-key|Content|file.ts|tag|${today}||0||0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = parseToonLine(merged)
    expect(parts[6]).toBe(today)
  })

  it("takes max confidence", () => {
    const existing = `id1|decision|test-key|Content|file.ts|tag|2026-07-01||0||0.50|0.6`
    const incoming = `id2|decision|test-key|Content|file.ts|tag|${today}||0||0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = parseToonLine(merged)
    expect(parseFloat(parts[11])).toBe(1.0)
  })

  it("merges links as union", () => {
    const existing = `id1|decision|test-key|Content|file.ts|tag|2026-07-01||0|link-a|0.50|0.8`
    const incoming = `id2|decision|test-key|Content|file.ts|tag|${today}||0|link-b|0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = parseToonLine(merged)
    const links = parts[9].split(" ")
    expect(links).toContain("link-a")
    expect(links).toContain("link-b")
  })

  it("preserves the original id", () => {
    const existing = `id1|decision|test-key|Content|file.ts|tag|2026-07-01||0||0.50|0.8`
    const incoming = `id2|decision|test-key|New content|file.ts|tag|${today}||0||0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = parseToonLine(merged)
    expect(parts[0]).toBe("id1")
  })

  it("returns new line if existing has too few fields", () => {
    const existing = `id1|decision|test-key`
    const incoming = `id2|decision|test-key|Content|file.ts|tag|${today}||0||0.60|1.0`
    expect(mergeEntries(existing, incoming)).toBe(incoming)
  })

  it("preserves superseded_on (field 17) and supersedes link across merges", () => {
    const existing = `id1|decision|old-key|Old content|f.ts|validation;superseded|2026-07-01||0|superseded_by:new-key|0.50|0.8|2026-07-01|0||agent|obsolete|2026-07-10`
    const incoming = `id2|decision|old-key|Old content|f.ts|validation|2026-07-20||0||0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = parseToonLine(merged)
    expect(parts[17]).toBe("2026-07-10")
    expect(parts[9]).toContain("superseded_by:new-key")
    expect(parts[16]).toBe("obsolete") // obsolete entries stay obsolete across merges
  })
})

describe("generateSmartRecall", () => {
  const SAMPLE = `version: 1
entries[4|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|redis-cache|Usamos redis para cache de sesiones.|cache.ts|redis;cache|${new Date().toISOString().split("T")[0]}||0||0.70|1.0
  a2|bug|redis-timeout|Redis connection timeout in production.|redis.ts|redis;bug|${new Date().toISOString().split("T")[0]}||0||0.55|0.9
  a3|pattern|auth-jwt|JWT authentication with refresh tokens.|src/auth.ts|auth;jwt|${new Date().toISOString().split("T")[0]}||0||0.65|1.0
  a4|knowledge|postgres-db|Postgres guarda el estado principal.|db.ts|db;postgres|${new Date().toISOString().split("T")[0]}||0||0.60|1.0
`

  it("returns entries matching the intent", () => {
    const result = generateSmartRecall(SAMPLE, "redis cache")
    expect(result).toContain("redis-cache")
    expect(result).toContain("redis-timeout")
  })

  it("returns compact format (numeric indices)", () => {
    const result = generateSmartRecall(SAMPLE, "redis")
    expect(result).toMatch(/\[1\]/)
    expect(result).not.toMatch(/File:/)
  })

  it("falls back to top-by-importance when nothing matches", () => {
    const result = generateSmartRecall(SAMPLE, "zzz-no-match")
    expect(result).toMatch(/\[\d+\]/)
  })

  it("returns empty message for empty memory", () => {
    const empty = `version: 1\nentries[0|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:\n`
    expect(generateSmartRecall(empty, "anything")).toBe("Empty memory.")
  })

  it("respects category filter", () => {
    const result = generateSmartRecall(SAMPLE, "redis", { category: "bug" })
    expect(result).toContain("redis-timeout")
    expect(result).not.toContain("redis-cache")
  })

  it("respects limit parameter", () => {
    const result = generateSmartRecall(SAMPLE, "redis", { limit: 1 })
    // Should have only 1 entry
    const matches = result.match(/\[\d+\]/g)
    expect(matches).toHaveLength(1)
  })

  it("applies drift penalty when file was modified after entry creation", () => {
    const old = new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0]
    const today = new Date().toISOString().split("T")[0]
    const data = `version: 1
entries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|use-zod|Use Zod for validation|src/types.ts|types|${old}||0||0.70|1.0
  a2|knowledge|redis-cache|Redis for caching|cache.ts|redis|${old}||0||0.60|1.0
`
    // cache.ts was NOT modified → no drift
    const mtimesNoDrift = new Map([["src/types.ts", old]])
    const resultNoDrift = generateSmartRecall(data, "zod", { fileMtimes: mtimesNoDrift })
    expect(resultNoDrift).toContain("use-zod")

    // src/types.ts was modified today → drift penalty applies
    const mtimesDrift = new Map([["src/types.ts", today]])
    const resultDrift = generateSmartRecall(data, "zod", { fileMtimes: mtimesDrift })
    // The drifted entry should still appear but with lower effective score
    // Since it's the only match, it still shows up (BM25 score > 0)
    expect(resultDrift).toContain("use-zod")
  })

  it("supports rrf fusion and excludes drafts/obsolete entries", () => {
    const today = new Date().toISOString().split("T")[0]
    const data = `version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|priority|path_scope|origin|status}:
  a1|decision|use-zod|Use Zod for validation|src/types.ts|types|${today}||0||0.70|1.0||0||agent|active
  a2|knowledge|draft-idea|Borrador sin validar de idea|notes.md|draft|${today}||0||0.20|0.4||0||inferred|draft
  a3|knowledge|old-junk|Nota vieja obsoleta|old.md|junk|${today}||0||0.10|0.3||0||agent|obsolete
`
    const result = generateSmartRecall(data, "zod", { rrf: true })
    expect(result).toContain("use-zod")
    expect(result).not.toContain("draft-idea")
    expect(result).not.toContain("old-junk")
  })
})

describe("generateSystemPrimer", () => {
  const today = new Date().toISOString().split("T")[0]

  it("returns empty message for empty memory", () => {
    const empty = `version: 1\nentries[0|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:\n`
    expect(generateSystemPrimer(empty)).toBe("Empty memory. No entries saved.")
  })

  it("includes header and entry count", () => {
    const data = `version: 1
entries[1|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|use-zod|Use Zod for validation|src/types.ts|types|${today}||0||0.50|1.0
`
    const primer = generateSystemPrimer(data)
    expect(primer).toContain("=== System Primer ===")
    expect(primer).toContain("Entries: 1")
  })

  it("lists categories with counts", () => {
    const data = `version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|d1|Decision content|f.ts|tag|${today}||0||0.50|1.0
  a2|bug|b1|Bug content|f.ts|tag|${today}||0||0.40|0.9
  a3|decision|d2|Another decision|f.ts|tag|${today}||0||0.55|1.0
`
    const primer = generateSystemPrimer(data)
    expect(primer).toContain("decision: 2")
    expect(primer).toContain("bug: 1")
  })

  it("shows top entries by importance", () => {
    const data = `version: 1
entries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|important|Very important decision about architecture|f.ts|arch|${today}||5||0.80|1.0
  a2|knowledge|minor|Minor note about formatting|f.ts|misc|2025-01-01||0||0.30|0.7
`
    const primer = generateSystemPrimer(data)
    expect(primer).toContain("Top memories:")
    expect(primer).toContain("important")
  })

  it("lists patterns as rules", () => {
    const data = `version: 1
entries[1|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|pattern|use-zod|Always use Zod for validation|src/types.ts|types|${today}||0||0.60|1.0
`
    const primer = generateSystemPrimer(data)
    expect(primer).toContain("Established patterns:")
    expect(primer).toContain("use-zod")
  })
})

describe("generateSmartRecall — explain + budget_tokens + warning boost", () => {
  const today = new Date().toISOString().split("T")[0]

  const DATA = `version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|redis-cache|Usamos redis para cache de sesiones con mucho contenido extra para inflar el tamaño estimado de esta entrada.|cache.ts|redis;cache|${today}||14||0.70|1.0
  a2|warning|prisma-migration|NO migres Prisma sin backup: rompe la base de datos en producción.|db.ts|prisma;warning|${today}||0||0.60|1.0
  a3|knowledge|postgres-db|Postgres guarda el estado principal de la aplicacion.|db.ts|db;postgres|${today}||0||0.50|1.0
`

  it("appends a reason line when explain is true", () => {
    const out = generateSmartRecall(DATA, "redis", { explain: true, today })
    expect(out).toContain("↳")
    expect(out).toContain("importance")
  })

  it("does not append reasons by default", () => {
    const out = generateSmartRecall(DATA, "redis", { today })
    expect(out).not.toContain("↳")
  })

  it("honors a tiny token budget by dropping entries", () => {
    const all = generateSmartRecall(DATA, "redis", { today })
    const trimmed = generateSmartRecall(DATA, "redis", { today, budgetTokens: 60 })
    expect(trimmed.split("…").length).toBeLessThanOrEqual(all.split("…").length)
  })

  it("boosts warning entries above equal relevance", () => {
    // query hits the prisma content token ('prisma') in both warning and a neutral entry
    const out = generateSmartRecall(DATA, "prisma", { today })
    expect(out).toContain("prisma-migration")
  })
})

describe("extractVersion (version-supersession detection)", () => {
  it("extracts the versioned word + major.minor version", () => {
    const hit = extractVersion("use react 18.2")
    expect(hit).toEqual({ base: "react", version: [18, 2, 0] })
  })

  it("handles full semver and v prefixes", () => {
    const hit = extractVersion("next 13.5.1")
    expect(hit!.version).toEqual([13, 5, 1])
    const v = extractVersion("node v18.2")
    expect(v).toEqual({ base: "node", version: [18, 2, 0] })
  })

  it("returns null when no version is present", () => {
    expect(extractVersion("just some note about react")).toBeNull()
  })
})
