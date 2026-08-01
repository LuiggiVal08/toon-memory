import { describe, it, expect } from "vitest"
import { parseEntries, buildGraph, graphRecall, graphRecallDetailed, bm25Scores, centrality, renderCompact, parseLinkToken, linkKey, formatLink, typedLinks, buildReason } from "../src/lib/graph"

const SAMPLE = `version: 1
entries[5|]{id|category|key|content|file|tags|date|ttl|accessed|links}:
  a1|decision|risk-engine|El motor prioriza riesgo (ver [[risk-spec]]).|spec.md:10|risk;spec|2026-07-01||0|engine-arch
  a2|knowledge|risk-spec|Especificacion de riesgo.|spec.md:20|risk|2026-07-01||0|
  a3|pattern|engine-arch|Arquitectura del motor.|arch.ts:5|engine|2026-07-01||0|risk-spec deep-node
  a4|bug|unrelated-bug|Bug en ui sin relacion.|ui.ts:1|ui|2026-07-01||0|
  a5|knowledge|deep-node|Nodo profundo conectado al grafo.|x.ts:1|deep|2026-07-01||0|
`

const BM25_SAMPLE = `version: 1
entries[4|]{id|category|key|content|file|tags|date|ttl|accessed|links}:
  b1|knowledge|redis-cache|Usamos redis para cache de sesiones.|cache.ts|redis|2026-07-01||0|
  b2|knowledge|redis-pubsub|Redis pubsub para eventos en tiempo real.|events.ts|redis|2026-07-01||0|
  b3|knowledge|postgres-db|Postgres guarda el estado principal.|db.ts|db|2026-07-01||0|
  b4|knowledge|unrelated|Cosa sin relacion con la query.|x.ts|misc|2026-07-01||0|
`

describe("parseEntries", () => {
  it("reads the trailing links field when present", () => {
    const entries = parseEntries(SAMPLE)
    expect(entries).toHaveLength(5)
    const riskEngine = entries.find((e) => e.key === "risk-engine")!
    expect(riskEngine.links).toEqual(["engine-arch"])
    expect(riskEngine.tags).toEqual(["risk", "spec"])
  })

  it("tolerates entries without the links field (backward compatible)", () => {
    const old = `version: 1
entries[1|]{id|category|key|content|file|tags|date|ttl|accessed}:
  z1|decision|legacy|Contenido viejo sin links.|f.ts|old|2026-07-01||0
`
    const entries = parseEntries(old)
    expect(entries).toHaveLength(1)
    expect(entries[0].links).toEqual([])
  })
})

describe("buildGraph", () => {
  it("connects explicit links and implicit [[key]] refs (undirected, existing keys only)", () => {
    const { adjacency, byKey } = buildGraph(parseEntries(SAMPLE))
    expect(byKey.has("risk-engine")).toBe(true)
    // explicit link
    expect(adjacency.get("risk-engine")).toContain("engine-arch")
    // implicit [[risk-spec]]
    expect(adjacency.get("risk-engine")).toContain("risk-spec")
    // undirected
    expect(adjacency.get("engine-arch")).toContain("risk-engine")
    // dangling key (none here) would be dropped
    // unrelated-bug has no links, but the orphan fallback attaches it to its
    // most similar entry (deep-node wins the tie-break) so no node is isolated
    expect(adjacency.get("unrelated-bug")).toContain("deep-node")
  })

  it("bridges separate clusters into a single connected component", () => {
    const data = [
      "version: 1",
      "[4|]{id|category|key|content|file|tags|date|ttl|accessed|links}:",
      "  a|knowledge|alpha|alpha content|a.ts|red;blue|2026-07-01||0|",
      "  b|knowledge|bravo|bravo content|b.ts|red;blue|2026-07-01||0|",
      "  c|knowledge|charlie|charlie content|c.ts|green;yellow|2026-07-01||0|",
      "  d|knowledge|delta|delta content|d.ts|green;yellow|2026-07-01||0|",
      "",
    ].join("\n")
    const { adjacency, byKey } = buildGraph(parseEntries(data))
    const ids = [...byKey.keys()]
    const seen = new Set<string>()
    const stack = [ids[0]]
    seen.add(ids[0])
    while (stack.length) {
      const cur = stack.pop()!
      for (const next of adjacency.get(cur) || []) {
        if (!seen.has(next)) {
          seen.add(next)
          stack.push(next)
        }
      }
    }
    expect(seen.size).toBe(4)
  })
})

describe("graphRecall", () => {
  it("expands the ego-subgraph from keyword matches and excludes unrelated entries", () => {
    const res = graphRecall(SAMPLE, "riesgo", { hops: 1 })
    const keys = res.map((e) => e.key)
    expect(keys).toContain("risk-engine")
    expect(keys).toContain("risk-spec")
    expect(keys).toContain("engine-arch")
    expect(keys).not.toContain("unrelated-bug")
  })

  it("reaches deeper nodes only at hops=2", () => {
    const h1 = graphRecall(SAMPLE, "riesgo", { hops: 1 }).map((e) => e.key)
    const h2 = graphRecall(SAMPLE, "riesgo", { hops: 2 }).map((e) => e.key)
    expect(h1).not.toContain("deep-node")
    expect(h2).toContain("deep-node")
  })

  it("crosses categories: a neighbor reached via graph is returned even if its category was filtered out", () => {
    const res = graphRecall(SAMPLE, "riesgo", { category: "decision", hops: 1 })
    const keys = res.map((e) => e.key)
    expect(keys).toContain("risk-engine")
    expect(keys).toContain("engine-arch")
    // risk-spec (knowledge) is reached as a neighbor of risk-engine via [[risk-spec]]
    expect(keys).toContain("risk-spec")
    expect(keys).not.toContain("unrelated-bug")
  })

  it("keeps the result set small to save tokens (limit)", () => {
    const res = graphRecall(SAMPLE, "riesgo", { hops: 2, limit: 3 })
    expect(res.length).toBeLessThanOrEqual(3)
  })

  it("falls back to top-by-importance when nothing matches", () => {
    const res = graphRecall(SAMPLE, "zzz-sin-coincidencia")
    expect(res.length).toBeGreaterThan(0)
  })
})

describe("bm25Scores", () => {
  it("scores entries sharing query tokens above entries that do not", () => {
    const entries = parseEntries(BM25_SAMPLE)
    const scores = bm25Scores(entries, "redis cache")
    expect(scores.get("redis-cache")!).toBeGreaterThan(0)
    expect(scores.get("redis-pubsub")!).toBeGreaterThan(0)
    expect(scores.get("unrelated")!).toBe(0)
    // the entry that contains BOTH query terms ranks highest
    expect(scores.get("redis-cache")!).toBeGreaterThan(scores.get("redis-pubsub")!)
  })

  it("returns an empty map for an empty corpus", () => {
    expect(bm25Scores([], "anything").size).toBe(0)
  })
})

describe("centrality", () => {
  it("gives the highest degree node the max score (1) and leaves isolated nodes at 0", () => {
    const { adjacency } = buildGraph(parseEntries(SAMPLE))
    const cent = centrality(adjacency)
    const max = Math.max(...[...cent.values()])
    expect(max).toBe(1)
    // engine-arch (connected to risk-engine, risk-spec, deep-node) is the hub
    expect(cent.get("engine-arch")).toBe(1)
    // unrelated-bug had no edges but the orphan fallback attaches it to the
    // graph, so it now has degree 1 (positive centrality, not isolated)
    expect(cent.get("unrelated-bug") ?? 0).toBeGreaterThan(0)
  })
})

describe("graphRecallDetailed (decay + scoring)", () => {
  it("applies per-hop decay so nodes further from seeds score lower", () => {
    const d1 = graphRecallDetailed(SAMPLE, "riesgo", { hops: 2 })
    const seedScore = d1.scores.get("risk-engine")!
    const deepScore = d1.scores.get("deep-node")!
    // deep-node is 2 hops from the seed, so it must score below the seed
    expect(deepScore).toBeLessThan(seedScore)
    // both are positive because deep-node is still reached
    expect(deepScore).toBeGreaterThan(0)
  })

  it("scores reflect a real combined value (seed bonus dominates its neighbors)", () => {
    const d = graphRecallDetailed(SAMPLE, "riesgo", { hops: 1 })
    const seed = d.scores.get("risk-engine")!
    const neighbor = d.scores.get("risk-spec")!
    expect(seed).toBeGreaterThan(neighbor)
  })

  it("puts pinned entries first sorted by priority descending", () => {
    const pinnedSample =
      "version: 1\n" +
      'entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|priority}:\n' +
      "  a1|decision|pinned-rule|Critical project rule.|.clinerule|rule|2026-07-01||0||0.9|1|2026-07-01|1\n" +
      "  a2|knowledge|redis-cache|Usamos redis para cache.|cache.ts|redis|2026-07-01||0||0.5|1|\n" +
      "  a3|knowledge|postgres-db|Postgres guarda el estado.|db.ts|db|2026-07-01||0||0.5|1|\n"
    const d = graphRecallDetailed(pinnedSample, "redis cache")
    expect(d.entries[0].key).toBe("pinned-rule")
    expect(d.entries[0].priority).toBe(1)
  })
})

describe("typed links (type:key edges)", () => {
  it("parses a plain key as the default 'related' type", () => {
    expect(parseLinkToken("engine-arch")).toEqual({ type: "related", key: "engine-arch" })
    expect(linkKey("engine-arch")).toBe("engine-arch")
  })

  it("parses typed tokens and keeps the last ':' as the split point", () => {
    expect(parseLinkToken("superseded_by:engine-arch")).toEqual({ type: "superseded_by", key: "engine-arch" })
    expect(linkKey("superseded_by:engine-arch")).toBe("engine-arch")
    expect(formatLink("supersedes", "engine-arch")).toBe("supersedes:engine-arch")
    expect(formatLink("related", "engine-arch")).toBe("engine-arch")
    expect(typedLinks(["risk-spec", "supersedes:engine-arch"])).toEqual([
      { type: "related", key: "risk-spec" },
      { type: "supersedes", key: "engine-arch" },
    ])
  })

  it("buildGraph links typed edges to the key part (backward compatible)", () => {
    const sample = `version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links}:
  a1|decision|risk-engine|El motor prioriza riesgo.|spec.md|risk;spec|2026-07-01||0|superseded_by:engine-arch
  a2|pattern|engine-arch|Arquitectura del motor.|arch.ts|engine|2026-07-01||0|
  a3|bug|unrelated-bug|Bug sin relacion.|ui.ts|ui|2026-07-01||0|
`
    const { adjacency, byKey } = buildGraph(parseEntries(sample))
    expect(byKey.has("engine-arch")).toBe(true)
    expect(adjacency.get("risk-engine")).toContain("engine-arch")
    expect(adjacency.get("engine-arch")).toContain("risk-engine")
    // orphan fallback attaches unrelated-bug to its nearest neighbor
    expect(adjacency.get("unrelated-bug")).toContain("engine-arch")
  })

  it("stores the raw typed token on the entry (render/deep output keeps the type)", () => {
    const sample = `version: 1
entries[1|]{id|category|key|content|file|tags|date|ttl|accessed|links}:
  a1|decision|risk-engine|El motor prioriza riesgo.|spec.md|risk|2026-07-01||0|superseded_by:engine-arch
`
    const e = parseEntries(sample)[0]
    expect(e.links).toEqual(["superseded_by:engine-arch"])
  })
})

describe("status lifecycle: draft + supersededOn + as_of", () => {
  const LIFE = `version: 1
entries[4|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|priority|path_scope|origin|status|supersededOn}:
  a1|decision|use-zod|Use Zod for validation.|t.ts|validation|2026-07-01||0||0.9|1|2026-07-01|0||agent|active|
  a2|decision|use-joi|Use Joi for validation.|t.ts|validation;superseded|2026-07-01||0|superseded_by:use-zod|0.5|1|2026-07-01|0||agent|obsolete|2026-07-10
  a3|knowledge|draft-note|Nota de borrador sin validar.||draft|2026-07-20||0||0.2|0.5|2026-07-20|0||inferred|draft|
  a4|decision|recent-decision|Decision reciente.|t.ts|new|2026-07-25||0||0.9|1||0||agent|active|
`

  it("parses the superseded_on field (index 17)", () => {
    const e = parseEntries(LIFE)
    expect(e.find((x) => x.key === "use-joi")!.supersededOn).toBe("2026-07-10")
    expect(e.find((x) => x.key === "use-zod")!.supersededOn).toBe("")
    expect(e.find((x) => x.key === "draft-note")!.status).toBe("draft")
  })

  it("hides obsolete and draft entries from normal recall", () => {
    const keys = graphRecall(LIFE, "validation").map((e) => e.key)
    expect(keys).toContain("use-zod")
    expect(keys).not.toContain("use-joi")
    expect(keys).not.toContain("draft-note")
  })

  it("as_of re-includes entries that were valid on that date (before supersession)", () => {
    const keys = graphRecall(LIFE, "validation", { asOf: "2026-07-05" }).map((e) => e.key)
    expect(keys).toContain("use-joi")
    expect(keys).toContain("use-zod")
  })

  it("as_of excludes entries created after that date", () => {
    const keys = graphRecall(LIFE, "decision", { asOf: "2026-07-10", hops: 1 }).map((e) => e.key)
    expect(keys).not.toContain("recent-decision")
  })
})

describe("rrf (reciprocal rank fusion)", () => {
  it("returns the same seeds and keeps hub expansion reachable", () => {
    const linear = graphRecallDetailed(SAMPLE, "riesgo", { hops: 1 })
    const rrf = graphRecallDetailed(SAMPLE, "riesgo", { hops: 1, rrf: true })
    expect(rrf.seeds.has("risk-engine")).toBe(true)
    expect(rrf.entries.map((e) => e.key)).toContain("risk-engine")
    expect(rrf.entries.map((e) => e.key)).toContain("risk-spec")
    // both modes agree on the seed set
    expect(rrf.seeds).toEqual(linear.seeds)
  })

  it("produces finite positive fused scores and ranks seeds above their neighbors", () => {
    const d = graphRecallDetailed(SAMPLE, "riesgo", { hops: 1, rrf: true })
    for (const s of d.scores.values()) {
      expect(Number.isFinite(s)).toBe(true)
      expect(s).toBeGreaterThan(0)
    }
    const seed = d.scores.get("risk-engine")!
    const neighbor = d.scores.get("risk-spec")!
    expect(seed).toBeGreaterThan(neighbor)
  })

  it("still respects pinned priority in rrf mode", () => {
    const pinnedSample =
      "version: 1\n" +
      'entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|priority}:\n' +
      "  a1|decision|pinned-rule|Critical project rule.|.clinerule|rule|2026-07-01||0||0.9|1|2026-07-01|1\n" +
      "  a2|knowledge|redis-cache|Usamos redis para cache.|cache.ts|redis|2026-07-01||0||0.5|1|\n" +
      "  a3|knowledge|postgres-db|Postgres guarda el estado.|db.ts|db|2026-07-01||0||0.5|1|\n"
    const d = graphRecallDetailed(pinnedSample, "redis cache", { rrf: true })
    expect(d.entries[0].key).toBe("pinned-rule")
  })
})

describe("renderCompact", () => {  it("drops id/date/file and assigns stable numeric indices", () => {
    const entries = graphRecall(SAMPLE, "riesgo", { hops: 1 })
    const out = renderCompact(entries)
    expect(out).not.toMatch(/File:/)
    expect(out).not.toMatch(/Date:/)
    expect(out).toMatch(/\[1\] /)
    expect(out).toMatch(/\[2\] /)
    // tags are preserved
    expect(out).toMatch(/tags: risk/)
  })

  it("renders graph edges as numeric '->2' references", () => {
    const d = graphRecallDetailed(SAMPLE, "riesgo", { hops: 1 })
    const out = renderCompact(d.entries, { adjacency: d.adjacency, seeds: d.seeds })
    expect(out).toMatch(/->\d/)
  })

  it("truncates non-seed neighbors to a snippet (ellipsis) but keeps seeds full", () => {
    const d = graphRecallDetailed(SAMPLE, "riesgo", { hops: 2, snippetLen: 20 })
    const seed = d.entries.find((e) => d.seeds.has(e.key))!
    const neighbor = d.entries.find((e) => !d.seeds.has(e.key))!
    const out = renderCompact(d.entries, { adjacency: d.adjacency, seeds: d.seeds, snippetLen: 20 })
    // seed line should contain its FULL content (no ellipsis)
    expect(out).toContain(seed.content)
    // a neighbor longer than the snippet should be truncated
    if (neighbor.content.length > 20) {
      expect(out).toContain("…")
    }
  })
})

describe("buildReason (Explain WHY)", () => {
  it("combines relevance %, usage, last-used and importance", () => {
    const entry = {
      id: "a1", category: "decision", key: "risk-engine", content: "x",
      file: "", tags: [], date: "2026-07-30", ttl: "", accessed: 14,
      links: [], lastAccessed: "2026-08-01T10:00:00Z", priority: 0,
      path_scope: "", origin: "agent" as const, status: "active" as const, supersededOn: "",
    }
    const reason = buildReason(entry, 0.95, 1.0, 0.8, "2026-08-01")
    expect(reason).toContain("95% relevance")
    expect(reason).toContain("used 14×")
    expect(reason).toContain("used today")
    expect(reason).toContain("importance HIGH")
  })

  it("says 'never used' when the entry was never recalled", () => {
    const entry = {
      id: "a1", category: "knowledge", key: "fresh", content: "x",
      file: "", tags: [], date: "2026-07-30", ttl: "", accessed: 0,
      links: [], lastAccessed: "", priority: 0,
      path_scope: "", origin: "agent" as const, status: "active" as const, supersededOn: "",
    }
    const reason = buildReason(entry, 0, 0, 0.2, "2026-08-01")
    expect(reason).toContain("never used")
    expect(reason).toContain("importance LOW")
  })

  it("graphRecallDetailed exposes reasons for the selected entries", () => {
    const d = graphRecallDetailed(SAMPLE, "riesgo", { hops: 1 })
    expect(d.reasons).toBeDefined()
    expect(d.reasons!.size).toBe(d.entries.length)
  })
})

describe("renderCompact — budget_tokens", () => {
  const LONG = `version: 1
entries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links}:
  c1|knowledge|long-a|Palabra clave AAA seguida de mucho contenido repetido aqui para inflar los tokens estimados de la entrada y forzar el corte del presupuesto.|a.ts|k|2026-07-01||0|
  c2|knowledge|long-b|Palabra clave AAA seguida de mucho contenido repetido aqui para inflar los tokens estimados de la entrada y forzar el corte del presupuesto.|b.ts|k|2026-07-01||0|
`

  it("drops later entries when the estimated tokens exceed the budget", () => {
    const d = graphRecallDetailed(LONG, "AAA", { hops: 1 })
    expect(d.entries.length).toBeGreaterThan(1)
    const out = renderCompact(d.entries, { budget: "deep", budgetTokens: 100 })
    // A tiny budget fits at most one deep-rendered entry.
    const blocks = out.split("\n\n")
    expect(blocks.length).toBe(1)
  })

  it("keeps every entry when no budget is set", () => {
    const d = graphRecallDetailed(LONG, "AAA", { hops: 1 })
    const out = renderCompact(d.entries, { budget: "deep" })
    expect(out.split("\n\n").length).toBe(d.entries.length)
  })
})
