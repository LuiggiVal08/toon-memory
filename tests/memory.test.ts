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
})
