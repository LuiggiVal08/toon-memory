import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

// Regression: archiveOldEntries must work on files initialized via the CLI,
// which write a `[N|]` header (src/cli/memory.ts) — not just the `entries[N|]`
// header that the MCP config writer emits. Previously both archiveOldEntries
// and pruneExpiredEntries returned 0 silently on `[N|]` files.
describe("archiveOldEntries header format tolerance", () => {
  const testDir = join(tmpdir(), "toon-memory-archive-" + Date.now())
  const memoryDir = join(testDir, ".toon-memory", "memory")
  const memoryFile = join(memoryDir, "data.toon")
  const archiveFile = join(memoryDir, "archive.toon")
  let cwd = process.cwd()
  let archive: typeof import("../src/mcp/archive")

  const OLD = "2025-01-01"
  const RECENT = new Date().toISOString().split("T")[0]

  const oldEntry = (id: string, key: string) =>
    `  ${id}|decision|${key}|Old entry|file.ts|tag|${OLD}|`

  beforeEach(async () => {
    mkdirSync(memoryDir, { recursive: true })
    cwd = process.cwd()
    process.chdir(testDir)
    // MEMORY_FILE is derived from process.cwd() at module load — re-import
    // after chdir so archiveOldEntries targets the temp dir.
    vi.resetModules()
    archive = await import("../src/mcp/archive")
  })

  afterEach(() => {
    process.chdir(cwd)
    rmSync(testDir, { recursive: true, force: true })
  })

  it("archives old entries in a CLI-style [N|] file", () => {
    writeFileSync(
      memoryFile,
      `version: 1\n[2|]{id|category|key|content|file|tags|date|ttl}:\n${oldEntry("aaa000001", "old-1")}\n${oldEntry("aaa000002", "old-2")}\n`
    )

    const result = archive.archiveOldEntries()
    expect(result.archived).toBe(2)
    expect(result.kept).toBe(0)

    const header = readFileSync(memoryFile, "utf-8").split("\n")[1]
    expect(header).toMatch(/^\[0\|]/)
    expect(existsSync(archiveFile)).toBe(true)
    const archived = readFileSync(archiveFile, "utf-8")
    expect(archived).toContain("old-1")
    expect(archived).toContain("old-2")
  })

  it("archives only the old entries in a mixed [N|] file", () => {
    writeFileSync(
      memoryFile,
      `version: 1\n[2|]{id|category|key|content|file|tags|date|ttl}:\n${oldEntry("aaa000001", "old-1")}\n  aaa000002|decision|fresh|Fresh entry|file.ts|tag|${RECENT}|\n`
    )

    const result = archive.archiveOldEntries()
    expect(result.archived).toBe(1)
    expect(result.kept).toBe(1)

    const lines = readFileSync(memoryFile, "utf-8").split("\n")
    expect(lines[1]).toMatch(/^\[1\|]/)
    expect(lines.join("\n")).toContain("fresh")
    expect(lines.join("\n")).not.toContain("old-1")
  })

  it("still archives in an MCP-style entries[N|] file", () => {
    writeFileSync(
      memoryFile,
      `version: 1\nentries[1|]{id|category|key|content|file|tags|date|ttl}:\n${oldEntry("aaa000001", "old-1")}\n`
    )

    const result = archive.archiveOldEntries()
    expect(result.archived).toBe(1)

    const header = readFileSync(memoryFile, "utf-8").split("\n")[1]
    expect(header).toMatch(/^entries\[0\|]/)
  })

  it("preserves the archived[ prefix across repeated runs", () => {
    writeFileSync(
      memoryFile,
      `version: 1\n[1|]{id|category|key|content|file|tags|date|ttl}:\n${oldEntry("aaa000001", "old-1")}\n`
    )
    archive.archiveOldEntries()

    writeFileSync(
      memoryFile,
      `version: 1\n[1|]{id|category|key|content|file|tags|date|ttl}:\n${oldEntry("aaa000002", "old-2")}\n`
    )
    archive.archiveOldEntries()

    const archived = readFileSync(archiveFile, "utf-8")
    const archiveHeader = archived.split("\n").find((l) => l.startsWith("archived[") || /^\[\d+\|]/.test(l))
    expect(archiveHeader).toBeDefined()
    expect(archiveHeader).toMatch(/^archived\[2\|]/)
    expect(archived).toContain("old-1")
    expect(archived).toContain("old-2")
  })
})
