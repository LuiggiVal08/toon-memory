import { describe, it, expect } from "vitest"
import { parseEntries, buildGraph, graphRecall } from "../src/lib/graph"

const SAMPLE = `version: 1
entries[5|]{id|category|key|content|file|tags|date|ttl|accessed|links}:
  a1|decision|risk-engine|El motor prioriza riesgo (ver [[risk-spec]]).|spec.md:10|risk;spec|2026-07-01||0|engine-arch
  a2|knowledge|risk-spec|Especificacion de riesgo.|spec.md:20|risk|2026-07-01||0|
  a3|pattern|engine-arch|Arquitectura del motor.|arch.ts:5|engine|2026-07-01||0|risk-spec deep-node
  a4|bug|unrelated-bug|Bug en ui sin relacion.|ui.ts:1|ui|2026-07-01||0|
  a5|knowledge|deep-node|Nodo profundo conectado al grafo.|x.ts:1|deep|2026-07-01||0|
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
