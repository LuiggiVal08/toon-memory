import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

// Test the memory operations directly (without MCP server)
describe("Memory Operations", () => {
  const testDir = join(tmpdir(), "toon-memory-test-" + Date.now())
  const memoryDir = join(testDir, ".toon-memory", "memory")
  const memoryFile = join(memoryDir, "data.toon")

  beforeEach(() => {
    mkdirSync(memoryDir, { recursive: true })
    writeFileSync(memoryFile, "version: 1\nentries[0|]{id|category|key|content|file|tags|date}:\n")
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it("should create memory file with correct format", () => {
    const content = readFileSync(memoryFile, "utf-8")
    expect(content).toContain("version: 1")
    expect(content).toContain("entries[0|]{id|category|key|content|file|tags|date}:")
  })

  it("should add entry to memory", () => {
    const id = "abc12345"
    const category = "decision"
    const key = "test-decision"
    const content = "This is a test decision"
    const file = "test.ts"
    const tags = "test;decision"
    const date = new Date().toISOString().split("T")[0]

    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n")

    let headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    if (headerIdx === -1) {
      lines.push(`entries[0|]{id|category|key|content|file|tags|date}:`)
      headerIdx = lines.length - 1
    }

    const match = lines[headerIdx].match(/entries\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    const newEntry = `${id}|${category}|${key}|${content}|${file}|${tags}|${date}`

    lines.splice(headerIdx + 1, 0, `  ${newEntry}`)
    lines[headerIdx] = lines[headerIdx].replace(/entries\[\d+\|/, `[${count + 1}|`)

    writeFileSync(memoryFile, lines.join("\n"))

    const updatedContent = readFileSync(memoryFile, "utf-8")
    expect(updatedContent).toContain(newEntry)
    expect(updatedContent).toContain("[1|]{id|category|key|content|file|tags|date}:")
  })

  it("should search entries by query", () => {
    const testEntries = [
      "  abc12345|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10",
      "  def67890|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10",
    ]

    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    lines.splice(headerIdx + 1, 0, ...testEntries)
    lines[headerIdx] = "entries[2|]{id|category|key|content|file|tags|date}:"
    writeFileSync(memoryFile, lines.join("\n"))

    const updatedData = readFileSync(memoryFile, "utf-8")
    const entryLines = updatedData.split("\n").filter((l) => l.startsWith("  ") && l.includes("|"))
    const queryLower = "zod"

    const results = entryLines
      .map((line) => {
        const trimmed = line.trim()
        const parts = trimmed.split("|")
        if (parts.length < 7) return null
        const [id, cat, key, content, file, tags, date] = parts
        const searchStr = `${id} ${cat} ${key} ${content} ${file} ${tags}`.toLowerCase()
        if (!searchStr.includes(queryLower)) return null
        return { id, cat, key, content, file, tags, date }
      })
      .filter(Boolean)

    expect(results).toHaveLength(1)
    expect(results[0]!.key).toBe("use-zod")
  })

  it("should delete entry by key", () => {
    const testEntries = [
      "  abc12345|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10",
      "  def67890|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10",
    ]

    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    lines.splice(headerIdx + 1, 0, ...testEntries)
    lines[headerIdx] = "entries[2|]{id|category|key|content|file|tags|date}:"
    writeFileSync(memoryFile, lines.join("\n"))

    const keyToDelete = "use-zod"
    const updatedData = readFileSync(memoryFile, "utf-8")
    const updatedLines = updatedData.split("\n")
    const updatedHeaderIdx = updatedLines.findIndex((l) => l.startsWith("entries["))

    const entryLines = updatedLines.slice(updatedHeaderIdx + 1).filter((l) => l.trim().length > 0)
    const filtered = entryLines.filter((l) => {
      const parts = l.trim().split("|")
      return parts[0] !== keyToDelete && parts[2] !== keyToDelete
    })

    const removed = entryLines.length - filtered.length
    const match = updatedLines[updatedHeaderIdx].match(/entries\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    updatedLines[updatedHeaderIdx] = updatedLines[updatedHeaderIdx].replace(/entries\[\d+\|/, `[${count - removed}|`)
    updatedLines.splice(updatedHeaderIdx + 1, entryLines.length, ...filtered.map((l) => `  ${l.trim()}`))

    writeFileSync(memoryFile, updatedLines.join("\n"))

    const finalData = readFileSync(memoryFile, "utf-8")
    expect(finalData).not.toContain("use-zod")
    expect(finalData).toContain("pydantic-configs")
    expect(finalData).toContain("[1|]{id|category|key|content|file|tags|date}:")
  })

  it("should add summary", () => {
    const filePath = "src/services/redis.ts"
    const summary = "Redis connection pool with retry logic"

    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n")
    let summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))

    if (summaryIdx === -1) {
      lines.push("", "summaries:")
      summaryIdx = lines.length - 1
    }

    const summaryLines = lines.slice(summaryIdx + 1).filter((l) => l.includes(":"))
    summaryLines.push(`  ${filePath}: ${summary}`)

    lines.splice(summaryIdx + 1, lines.length - summaryIdx - 1, ...summaryLines)
    writeFileSync(memoryFile, lines.join("\n"))

    const updatedData = readFileSync(memoryFile, "utf-8")
    expect(updatedData).toContain(`  ${filePath}: ${summary}`)
  })

  it("should support TTL field in entries", () => {
    const ttlDate = "2026-12-31"
    const entry = `  ttl12345|decision|temp-config|Temporary config|config.ts|temp|2026-07-10|${ttlDate}`

    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    lines.splice(headerIdx + 1, 0, entry)
    lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, "[1|]")
    writeFileSync(memoryFile, lines.join("\n"))

    const updatedData = readFileSync(memoryFile, "utf-8")
    const entryLine = updatedData.split("\n").find((l) => l.includes("ttl12345"))
    expect(entryLine).toBeDefined()
    const parts = entryLine!.trim().split("|")
    expect(parts[7]).toBe(ttlDate)
  })

  it("should filter expired TTL entries in search", () => {
    const entries = [
      "  ttl000001|decision|active-decision|Still valid|file.ts|tag|2026-07-10|2027-12-31",
      "  ttl000002|decision|expired-decision|Already expired|file.ts|tag|2026-07-10|2026-01-01",
      "  ttl000003|decision|no-ttl-decision|No TTL at all|file.ts|tag|2026-07-10|",
    ]

    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    lines.splice(headerIdx + 1, 0, ...entries)
    lines[headerIdx] = "entries[3|]{id|category|key|content|file|tags|date|ttl}:"
    writeFileSync(memoryFile, lines.join("\n"))

    const updatedData = readFileSync(memoryFile, "utf-8")
    const entryLines = updatedData.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))

    const today = new Date().toISOString().split("T")[0]
    const results = entryLines
      .map((line) => {
        const parts = line.trim().split("|")
        if (parts.length < 7) return null
        const ttl = parts[7] || ""
        if (ttl && ttl <= today) return null
        return { id: parts[0], key: parts[2] }
      })
      .filter(Boolean)

    expect(results).toHaveLength(2)
    expect(results.map((r) => r!.key)).toContain("active-decision")
    expect(results.map((r) => r!.key)).toContain("no-ttl-decision")
    expect(results.map((r) => r!.key)).not.toContain("expired-decision")
  })

  it("should archive entries with expired TTL", () => {
    const entries = [
      "  ttl000001|decision|keep-this|Still valid|file.ts|tag|2026-07-10|2027-12-31",
      "  ttl000002|decision|archive-this|Has expired TTL|file.ts|tag|2026-07-10|2026-01-01",
      "  ttl000003|decision|old-entry|Old by date|file.ts|tag|2025-01-01|",
    ]

    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    lines.splice(headerIdx + 1, 0, ...entries)
    lines[headerIdx] = "entries[3|]{id|category|key|content|file|tags|date|ttl}:"
    writeFileSync(memoryFile, lines.join("\n"))

    const updatedData = readFileSync(memoryFile, "utf-8")
    const entryLines = updatedData.split("\n").filter((l) => l.trim().length > 0 && l.includes("|") && !l.startsWith("version") && !l.startsWith("entries"))

    const today = new Date().toISOString().split("T")[0]
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffStr = cutoff.toISOString().split("T")[0]

    const toArchive: string[] = []
    const toKeep: string[] = []

    for (const line of entryLines) {
      const parts = line.trim().split("|")
      if (parts.length >= 7) {
        const date = parts[6]
        const ttl = parts[7] || ""
        const isOld = date < cutoffStr
        const isTtlExpired = ttl && ttl <= today
        if (isOld || isTtlExpired) {
          toArchive.push(line.trim())
        } else {
          toKeep.push(line.trim())
        }
      }
    }

    expect(toArchive).toHaveLength(2)
    expect(toKeep).toHaveLength(1)
    expect(toKeep[0]).toContain("keep-this")
    expect(toArchive.some((l) => l.includes("archive-this"))).toBe(true)
    expect(toArchive.some((l) => l.includes("old-entry"))).toBe(true)
  })

  it("should infer tags from content", () => {
    const TAG_VOCABULARY: Record<string, string[]> = {
      "redis": ["redis", "cache", "caching"],
      "auth": ["auth", "authentication", "login", "token", "jwt"],
      "api": ["api", "endpoint", "rest", "graphql", "route"],
      "db": ["database", "db", "sql", "postgres", "query"],
      "security": ["security", "encrypt", "decrypt", "vulnerability"],
      "test": ["test", "testing", "vitest", "jest", "spec"],
    }

    function inferTags(content: string, key: string): string {
      const text = `${key} ${content}`.toLowerCase()
      const matched: string[] = []
      for (const [tag, keywords] of Object.entries(TAG_VOCABULARY)) {
        if (keywords.some((kw) => text.includes(kw))) {
          matched.push(tag)
        }
      }
      return matched.join(";")
    }

    expect(inferTags("Redis cache layer for sessions", "cache-setup")).toBe("redis")
    expect(inferTags("JWT authentication flow with refresh tokens", "auth-system")).toBe("auth")
    expect(inferTags("PostgreSQL database migration for users table", "db-migration")).toBe("db")
    expect(inferTags("REST API endpoint for user registration", "api-users")).toBe("api")
    expect(inferTags("Vitest test suite for payment module", "payment-tests")).toBe("test")
    expect(inferTags("Encrypt sensitive data at rest", "data-security")).toBe("api;security")
    expect(inferTags("Redis auth token cache", "session-cache")).toBe("redis;auth")
    expect(inferTags("Random unrelated content", "foo-bar")).toBe("")
  })

  it("should parse relative dates correctly", () => {
    function parseRelativeDate(since: string): string {
      const trimmed = since.trim()
      const hourMatch = trimmed.match(/^(\d+)h$/)
      if (hourMatch) {
        const d = new Date()
        d.setHours(d.getHours() - parseInt(hourMatch[1]))
        return d.toISOString().split("T")[0]
      }
      const dayMatch = trimmed.match(/^(\d+)d$/)
      if (dayMatch) {
        const d = new Date()
        d.setDate(d.getDate() - parseInt(dayMatch[1]))
        return d.toISOString().split("T")[0]
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
      return new Date().toISOString().split("T")[0]
    }

    const today = new Date().toISOString().split("T")[0]
    expect(parseRelativeDate("2026-07-10")).toBe("2026-07-10")
    expect(parseRelativeDate("1d")).toBe(new Date(Date.now() - 86400000).toISOString().split("T")[0])
    expect(parseRelativeDate("7d")).toBe(new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
    expect(parseRelativeDate("24h")).toBe(new Date(Date.now() - 24 * 3600000).toISOString().split("T")[0])
    expect(parseRelativeDate("invalid")).toBe(today)
  })

  it("should filter entries by date range for diff", () => {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const oldDate = "2025-01-01"

    const entries = [
      `  diff00001|decision|new-today|Created today|file.ts|tag|${today}|`,
      `  diff00002|pattern|from-yesterday|From yesterday|file.ts|tag|${yesterday}|`,
      `  diff00003|bug|very-old|Very old entry|file.ts|tag|${oldDate}|`,
    ]

    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    lines.splice(headerIdx + 1, 0, ...entries)
    lines[headerIdx] = "entries[3|]{id|category|key|content|file|tags|date|ttl}:"
    writeFileSync(memoryFile, lines.join("\n"))

    const updatedData = readFileSync(memoryFile, "utf-8")
    const entryLines = updatedData.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))

    const sinceDate = yesterday
    const results = entryLines
      .map((line) => {
        const parts = line.trim().split("|")
        if (parts.length < 7) return null
        const date = parts[6]
        if (date < sinceDate) return null
        return { key: parts[2], date }
      })
      .filter(Boolean)

    expect(results).toHaveLength(2)
    expect(results.map((r) => r!.key)).toContain("new-today")
    expect(results.map((r) => r!.key)).toContain("from-yesterday")
    expect(results.map((r) => r!.key)).not.toContain("very-old")
  })
})
