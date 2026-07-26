import { describe, it, expect } from "vitest"
import { qualityScore, mergeEntries, generateSmartRecall, generateSystemPrimer } from "../src/lib/quality"

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
    const parts = merged.split("|")
    const tags = parts[5].split(";")
    expect(tags).toContain("redis")
    expect(tags).toContain("cache")
    expect(tags).toContain("db")
  })

  it("takes the newer date", () => {
    const existing = `id1|decision|test-key|Content|file.ts|tag|2026-07-01||0||0.50|0.8`
    const incoming = `id2|decision|test-key|Content|file.ts|tag|${today}||0||0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = merged.split("|")
    expect(parts[6]).toBe(today)
  })

  it("takes max confidence", () => {
    const existing = `id1|decision|test-key|Content|file.ts|tag|2026-07-01||0||0.50|0.6`
    const incoming = `id2|decision|test-key|Content|file.ts|tag|${today}||0||0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = merged.split("|")
    expect(parseFloat(parts[11])).toBe(1.0)
  })

  it("merges links as union", () => {
    const existing = `id1|decision|test-key|Content|file.ts|tag|2026-07-01||0|link-a|0.50|0.8`
    const incoming = `id2|decision|test-key|Content|file.ts|tag|${today}||0|link-b|0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = merged.split("|")
    const links = parts[9].split(" ")
    expect(links).toContain("link-a")
    expect(links).toContain("link-b")
  })

  it("preserves the original id", () => {
    const existing = `id1|decision|test-key|Content|file.ts|tag|2026-07-01||0||0.50|0.8`
    const incoming = `id2|decision|test-key|New content|file.ts|tag|${today}||0||0.60|1.0`
    const merged = mergeEntries(existing, incoming)
    const parts = merged.split("|")
    expect(parts[0]).toBe("id1")
  })

  it("returns new line if existing has too few fields", () => {
    const existing = `id1|decision|test-key`
    const incoming = `id2|decision|test-key|Content|file.ts|tag|${today}||0||0.60|1.0`
    expect(mergeEntries(existing, incoming)).toBe(incoming)
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
