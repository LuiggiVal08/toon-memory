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

  it("falls back to BM25 when dense is disabled or the module is missing", async () => {
    expect((await dense.denseScores("ranking", data)).size).toBe(0)
    writeFileSync(configFile, JSON.stringify({ encrypted: false, dense: { enabled: true, model: "fake" } }))
    process.env.TOON_MEMORY_DENSE_MODULE = "/nonexistent/dense-module.js"
    expect((await dense.denseScores("ranking", data)).size).toBe(0)
  })
})
