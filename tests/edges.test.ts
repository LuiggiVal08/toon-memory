import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mkdirSync, readFileSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

describe("typed edges", () => {
  const testDir = join(tmpdir(), "toon-memory-edges-" + Date.now())
  const memoryDir = join(testDir, ".toon-memory", "memory")
  const edgesFile = join(memoryDir, "edges.toon")
  const cwd = process.cwd()
  let edges: typeof import("../src/mcp/edges")
  let activation: typeof import("../src/lib/activation")

  const header = "version: 1\nentries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|pinned|path_scope|origin|status|supersededOn|importance|evidence}:\n"
  const data =
    header +
    "  aaaa0001|decision|alpha-entry|Use alpha for ranking|src/a.ts|tag|2026-11-26||0|supersedes:beta-entry||0.9|1.0||0||human|active|||high|verified\n" +
    "  bbbb0002|knowledge|beta-entry|Old beta note|src/b.ts|tag|2026-11-26||0|||0.9|1.0||0||agent|active||||\n"

  beforeEach(async () => {
    mkdirSync(memoryDir, { recursive: true })
    process.chdir(testDir)
    vi.resetModules()
    edges = await import("../src/mcp/edges")
    activation = await import("../src/lib/activation")
  })

  afterEach(() => {
    process.chdir(cwd)
    rmSync(testDir, { recursive: true, force: true })
  })

  it("derives typed edges from links and feedback tasks", () => {
    const derived = edges.deriveEdges(data, [
      {
        id: "f1",
        key: "alpha-entry",
        signal: "useful",
        source: "explicit",
        ts: "2026-11-26T00:00:00.000Z",
        session: "s1",
        task: "worked on beta-entry today",
      },
    ])
    expect(derived).toContainEqual(expect.objectContaining({ from: "alpha-entry", to: "beta-entry", type: "supersedes" }))
    expect(derived).toContainEqual(expect.objectContaining({ from: "alpha-entry", to: "beta-entry", type: "used_in" }))
  })

  it("writes and reads the sidecar atomically", () => {
    expect(edges.rebuildEdges(data)).toBe(1)
    expect(readFileSync(edgesFile, "utf-8")).toContain("edges[1|]")
    expect(edges.readEdges()[0].type).toBe("supersedes")
  })

  it("spreads activation only to neighbours", () => {
    const scores = activation.activationScores(
      [
        { from: "alpha-entry", to: "beta-entry", type: "supersedes", weight: 1 },
        { from: "beta-entry", to: "gamma-entry", type: "related", weight: 1 },
      ],
      ["alpha-entry"],
      1
    )
    expect(scores.get("beta-entry")).toBeCloseTo(0.8)
    expect(scores.has("gamma-entry")).toBe(false)
  })
})
