import { describe, it, expect } from "vitest"
import { parseEntries, buildGraph, graphRecall, graphRecallDetailed, bm25Scores, centrality, renderCompact } from "../src/lib/graph"

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
    // dangling key (none here) would be dropped; unrelated-bug has no edges
    expect(adjacency.get("unrelated-bug")).toBeUndefined()
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
    // unrelated-bug has no edges → not present / 0
    expect(cent.get("unrelated-bug") ?? 0).toBe(0)
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
})

describe("renderCompact", () => {
  it("drops id/date/file and assigns stable numeric indices", () => {
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
