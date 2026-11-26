import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

describe("sleep consolidation", () => {
  const testDir = join(tmpdir(), "toon-memory-sleep-" + Date.now())
  const memoryDir = join(testDir, ".toon-memory", "memory")
  const configFile = join(memoryDir, "config.json")
  const dataFile = join(memoryDir, "data.toon")
  const edgesFile = join(memoryDir, "edges.toon")
  const cwd = process.cwd()
  let sleep: typeof import("../src/cli/sleep")

  const data =
    "version: 1\nentries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|pinned|path_scope|origin|status|supersededOn|importance|evidence}:\n" +
    "  aaaa0001|decision|alpha-entry|Use alpha for ranking|src/a.ts|tag|2026-11-26||0|supersedes:beta-entry||0.9|1.0||0||human|active|||high|verified\n" +
    "  bbbb0002|knowledge|beta-entry|Old beta note|src/b.ts|tag|2026-11-26||0|||0.9|1.0||0||agent|active||||\n"

  beforeEach(async () => {
    mkdirSync(memoryDir, { recursive: true })
    writeFileSync(dataFile, data)
    process.chdir(testDir)
    vi.resetModules()
    sleep = await import("../src/cli/sleep")
  })

  afterEach(() => {
    process.chdir(cwd)
    delete process.env.TOON_MEMORY_SLEEP
    rmSync(testDir, { recursive: true, force: true })
  })

  it("is a no-op unless enabled", () => {
    const result = sleep.runSleep()
    expect(result.ran).toBe(false)
    expect(existsSync(edgesFile)).toBe(false)
  })

  it("rebuilds edges and respects the config flag", () => {
    writeFileSync(configFile, JSON.stringify({ encrypted: false, sleep: { enabled: true } }))
    const result = sleep.runSleep()
    expect(result.ran).toBe(true)
    expect(result.edges).toBeGreaterThan(0)
    expect(readFileSync(edgesFile, "utf-8")).toContain("supersedes")
  })

  it("can be forced with TOON_MEMORY_SLEEP=1", () => {
    process.env.TOON_MEMORY_SLEEP = "1"
    expect(sleep.runSleep().ran).toBe(true)
  })
})
