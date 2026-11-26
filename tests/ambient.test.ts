import { describe, it, expect } from "vitest"
import { buildHandoffBrief, projectSlug } from "../src/lib/handoff"
import { promoteSignals, PROMOTE_THRESHOLD } from "../src/lib/promoter"
import { splitIds, noMatches } from "../src/mcp/args"

const HEADER = "version: 1\nentries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|pinned|path_scope|origin|status|supersededOn|importance|evidence}:"

function sample(today: string) {
  return [
    HEADER,
    `  e1|warning|never-edit-generated|Never edit src/generated.ts by hand; regenerarlo rompe el build.|src/generated.ts|trap;warning|2026-01-10||0||0.9|1.0||0||human|active|||high|verified`,
    `  e2|decision|use-toon-format|Elegimos TOON para el formato de memoria.|docs/adr.md|decision|${today}||0||0.9|1.0||1||human|active|||high|verified`,
    `  e3|knowledge|recall-ranking|El recall combina BM25 centralidad e importancia.|src/lib/graph.ts|ranking|${today}||0||0.9|1.0||0||agent|active||||`,
  ].join("\n")
}

describe("handoff brief", () => {
  it("carries cross-tool identity and freshness", () => {
    const root = "/home/egraterol/projects/toon-memory"
    const brief = buildHandoffBrief(sample("2026-11-26"), root, { today: "2026-11-26", maxTokens: 900 })
    expect(brief).toContain("<memory")
    expect(brief).toContain(`mcp_project=${projectSlug(root)}`)
    expect(projectSlug(root)).toBe("home-egraterol-projects-toon-memory")
    expect(brief).toContain('freshness="fresh"')
    expect(brief).toContain("</memory>")
  })

  it("marks an aged corpus as stale instead of presenting it as current advice", () => {
    const brief = buildHandoffBrief(sample("2026-07-10"), "/repo", { today: "2026-11-26", maxTokens: 900 })
    expect(brief).toContain("stale-")
    expect(brief).toContain("[stale")
  })

  it("surfaces traps before decisions, with file pointers and no ellipsis", () => {
    const brief = buildHandoffBrief(sample("2026-11-26"), "/repo", { today: "2026-11-26", maxTokens: 900 })
    expect(brief).toContain("traps:")
    expect(brief).toContain("[warning] never-edit-generated")
    expect(brief).toContain("@ src/generated.ts")
    expect(brief.indexOf("traps:")).toBeLessThan(brief.indexOf("recent:"))
    expect(brief).not.toContain("…")
    expect(brief).toContain("mcp_project=")
  })

  it("stays under the token budget", () => {
    const brief = buildHandoffBrief(sample("2026-11-26"), "/repo", { today: "2026-11-26", maxTokens: 120 })
    expect(brief.length).toBeLessThan(120 * 4 + 200)
  })
})

describe("deterministic promoter", () => {
  it("promotes high-confidence user directives and keeps low-confidence signals", () => {
    const result = promoteSignals(HEADER + "\n", [
      { type: "user_directive", summary: "Recuerda que siempre hay que regenerar los archivos generados antes de publicar", file: "src/generated.ts", session: "s1", ts: "2026-11-26T00:00:00Z" },
      { type: "diff_pattern", summary: "Edit minor file", file: "", session: "s1", ts: "2026-11-26T00:00:00Z" },
    ], { today: "2026-11-26", threshold: PROMOTE_THRESHOLD })

    expect(result.promoted).toHaveLength(1)
    expect(result.promoted[0].category).toBe("warning")
    expect(result.kept).toBe(1)
    expect(result.data).toContain("warning-")
    expect(result.data.match(/entries\[(\d+)\|/)?.[1]).toBe("4")
  })

  it("classifies error-fix signals as bugs with verified evidence when a file is present", () => {
    const result = promoteSignals(HEADER + "\n", [
      { type: "error_fix", summary: "Fixed the failing MCP input validation error on memory_recall for string limits", file: "src/mcp/tools.ts", session: "s1", ts: "2026-11-26T00:00:00Z" },
    ], { today: "2026-11-26" })
    expect(result.promoted[0].category).toBe("bug")
    expect(result.data).toContain("verified")
  })

  it("does not duplicate an existing key", () => {
    const existing = `${HEADER}\n  x1|warning|warning-always-regenerate-generated-files|old|f|t|2026-11-26||||||||||||`
    const result = promoteSignals(existing, [
      { type: "user_directive", summary: "Always regenerate generated files", file: "f", session: "s", ts: "2026-11-26T00:00:00Z" },
    ], { today: "2026-11-26" })
    expect(result.promoted).toHaveLength(0)
    expect(result.kept).toBe(1)
  })
})

describe("tolerant MCP arguments", () => {
  it("splits ids by any separator, including JSON arrays", () => {
    expect(splitIds("a,b; c  d")).toEqual(["a", "b", "c", "d"])
    expect(splitIds('["a","b"]')).toEqual(["a", "b"])
  })

  it("reports an empty recall as data rather than an error", () => {
    const res = noMatches("foo")
    expect(res.structuredContent).toEqual({ found: false, count: 0 })
    expect(res.content[0].text).toContain("not an error")
  })
})
