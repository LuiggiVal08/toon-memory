import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

describe("dense sidecar", () => {
  const testDir = join(tmpdir(), "toon-memory-dense-" + Date.now())
  const memoryDir = join(testDir, ".toon-memory", "memory")
  const configFile = join(memoryDir, "config.json")
  const dataFile = join(memoryDir, "data.toon")
  const vectorsFile = join(memoryDir, "vectors.bin")
  const cwd = process.cwd()
  let dense: typeof import("../src/lib/dense")

  const data =
    "version: 1\nentries[1|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:\n" +
    "  aaaa0001|knowledge|alpha-entry|Dense ranking notes|src/a.ts|tag|2026-11-26||0|||0.9|1.0\n"
  const twoEntries =
    "version: 1\nentries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:\n" +
    "  aaaa0001|knowledge|alpha-entry|Dense ranking notes|src/a.ts|tag|2026-11-26||0|||0.9|1.0\n" +
    "  aaaa0002|knowledge|beta-entry|Dense sidecar notes|src/b.ts|tag|2026-11-26||0|||0.9|1.0\n"

  beforeEach(async () => {
    mkdirSync(memoryDir, { recursive: true })
    writeFileSync(dataFile, data)
    process.chdir(testDir)
    vi.resetModules()
    dense = await import("../src/lib/dense")
  })

  afterEach(() => {
    process.chdir(cwd)
    delete process.env.TOON_MEMORY_DENSE_MODULE
    rmSync(testDir, { recursive: true, force: true })
  })

  it("round-trips vectors in the binary sidecar", () => {
    const count = dense.writeVectors(new Map([["alpha-entry", [1, 0, 0]], ["beta-entry", [0, 1, 0]]]), 3)
    expect(count).toBe(2)
    const stored = dense.readVectors()
    expect(stored.dim).toBe(3)
    expect(stored.vectors.get("alpha-entry")).toEqual([1, 0, 0])
    expect(readFileSync(vectorsFile, "utf-8").startsWith("TMVEC1 3\n")).toBe(true)
  })

  it("round-trips V2 metadata and per-entry hashes", () => {
    dense.writeVectors(new Map([["alpha-entry", [1, 0, 0]]]), 3, {
      model: "fake-model",
      hashes: new Map([["alpha-entry", "abc123"]]),
      builtAt: "2026-11-27T00:00:00.000Z",
      sourceHash: "deadbeef",
    })
    const stored = dense.readVectors()
    expect(stored.dim).toBe(3)
    expect(stored.model).toBe("fake-model")
    expect(stored.builtAt).toBe("2026-11-27T00:00:00.000Z")
    expect(stored.sourceHash).toBe("deadbeef")
    expect(stored.hashes?.get("alpha-entry")).toBe("abc123")
    expect(readFileSync(vectorsFile, "utf-8").startsWith("TMVEC2 3 fake-model")).toBe(true)
  })

  it("computes cosine similarity", () => {
    expect(dense.cosine([1, 0], [1, 0])).toBeCloseTo(1)
    expect(dense.cosine([1, 0], [0, 1])).toBeCloseTo(0)
    expect(dense.cosine([], [1])).toBe(0)
  })

  it("builds vectors with an injected embedder", async () => {
    const module = { embed: async (texts: string[]) => texts.map(() => [0.2, 0.4, 0.9]) }
    expect(await dense.buildVectors(data, module, "fake-model")).toBe(1)
    expect(dense.readVectors().vectors.has("alpha-entry")).toBe(true)
  })

  it("reuses unchanged vectors and only embeds stale entries", async () => {
    const module = { embed: vi.fn(async (texts: string[]) => texts.map(() => [1, 0, 0])) }
    const first = await dense.rebuildVectors(data, module, "fake-model")
    expect(first.written).toBe(1)
    expect(first.stale).toBe(1)
    const second = await dense.rebuildVectors(data, module, "fake-model")
    expect(second.written).toBe(0)
    expect(second.reused).toBe(1)
    expect(module.embed).toHaveBeenCalledTimes(1)
  })

  it("invalidates vectors when the model changes", async () => {
    const module = { embed: vi.fn(async (texts: string[]) => texts.map(() => [1, 0, 0])) }
    await dense.rebuildVectors(data, module, "model-a")
    const changed = await dense.rebuildVectors(data, module, "model-b")
    expect(changed.written).toBe(1)
    expect(changed.reused).toBe(0)
    expect(dense.readVectors().model).toBe("model-b")
  })

  it("prunes vectors for removed entries", async () => {
    const module = { embed: async (texts: string[]) => texts.map(() => [0.3, 0.5, 0.8]) }
    await dense.rebuildVectors(twoEntries, module, "fake-model")
    const pruned = await dense.rebuildVectors(data, module, "fake-model")
    expect(pruned.removed).toBe(1)
    expect(dense.readVectors().vectors.has("beta-entry")).toBe(false)
  })

  it("reports module errors in diagnostics", async () => {
    writeFileSync(configFile, JSON.stringify({ encrypted: false, dense: { enabled: true, model: "fake" } }))
    process.env.TOON_MEMORY_DENSE_MODULE = "/nonexistent/dense-module.js"
    const report = await dense.denseDiagnostics(data)
    expect(report.enabled).toBe(true)
    expect(report.moduleLoaded).toBe(false)
    expect(report.error.length).toBeGreaterThan(0)
  })

  it("falls back to BM25 when dense is disabled or the module is missing", async () => {
    expect((await dense.denseScores("ranking", data)).size).toBe(0)
    writeFileSync(configFile, JSON.stringify({ encrypted: false, dense: { enabled: true, model: "fake" } }))
    process.env.TOON_MEMORY_DENSE_MODULE = "/nonexistent/dense-module.js"
    expect((await dense.denseScores("ranking", data)).size).toBe(0)
  })
})
