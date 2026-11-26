import { describe, it, expect } from "vitest"
import { compileContext, renderContextPackage } from "../src/lib/compiler"

const HEADER = "version: 1\nentries[9|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|pinned|path_scope|origin|status|supersededOn|importance|evidence}:"

function sample() {
  const today = "2026-11-26"
  return [
    HEADER,
    `  e1|warning|never-edit-generated|Never edit src/generated.ts by hand.|src/generated.ts|trap;warning|2026-01-10||0||0.9|1.0||0||human|active|||high|verified`,
    `  e2|decision|use-toon-format|Elegimos TOON para el formato de memoria.|docs/adr.md|decision|${today}||0||0.9|1.0||1||human|active|||high|verified`,
    `  e3|knowledge|recall-ranking|El recall combina BM25 centralidad e importancia.|src/lib/graph.ts|ranking|${today}||0||0.9|1.0||0||agent|active||||`,
    `  e4|knowledge|cache-layer|Caching de embeddings en vectors.bin.|src/mcp/vectors.ts|dense|${today}||0||0.9|1.0||0||agent|active||||`,
    ...Array.from({ length: 5 }, (_, i) =>
      `  f${i}|knowledge|filler-${i}|Texto general sobre ranking y memoria.|src/lib/filler.ts|ranking|${today}||0||0.9|1.0||0||agent|active||||`
    ),
  ].join("\n")
}

describe("context compiler", () => {
  it("compiles a task into sections, identity and retrieval plan", () => {
    const pkg = compileContext(sample(), "arreglar ranking de recall", {
      root: "/repo",
      today: "2026-11-26",
      sessions: ["proc-1: fijar ranking"],
    })
    const text = renderContextPackage(pkg)
    expect(text).toContain("<memory")
    expect(text).toContain('task="arreglar ranking de recall"')
    expect(text).toContain("identity: mcp_project=repo")
    expect(text).toContain("Directives")
    expect(text).toContain("Constraints")
    expect(text).toContain("Memory")
    expect(text).toContain("Retrieval")
    expect(text).toContain("- query:")
    expect(text).toContain("Hydrate")
    expect(text).toContain("Sessions")
    expect(text).toContain("</memory>")
    expect(text).not.toContain("…")
  })

  it("uses feedback utility to promote a low-ranked entry", () => {
    const before = compileContext(sample(), "ranking", { root: "/repo", today: "2026-11-26", maxTokens: 4000 })
    expect(renderContextPackage(before)).not.toContain("cache-layer")
    const after = compileContext(sample(), "ranking", {
      root: "/repo",
      today: "2026-11-26",
      maxTokens: 4000,
      utility: new Map([["cache-layer", 3]]),
    })
    expect(renderContextPackage(after)).toContain("cache-layer")
  })

  it("drops low-priority sections when the budget is tiny", () => {
    const pkg = compileContext(sample(), "ranking", { root: "/repo", today: "2026-11-26", maxTokens: 200 })
    expect(pkg.sections.every((s) => s.title !== "Sessions")).toBe(true)
    expect(pkg.usedTokens).toBeLessThanOrEqual(260)
  })
})
