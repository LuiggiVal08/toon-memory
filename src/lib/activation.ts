export interface ActivationEdge {
  from: string
  to: string
  type: string
  weight: number
}

export function activationScores(
  edges: ActivationEdge[],
  seeds: string[],
  depth = 1
): Map<string, number> {
  const out = new Map<string, number>()
  let frontier = [...new Set(seeds)]
  for (let d = 0; d < Math.max(0, depth); d++) {
    const next: string[] = []
    for (const node of frontier) {
      for (const edge of edges) {
        let other = ""
        if (edge.from === node) other = edge.to
        else if (edge.to === node) other = edge.from
        if (!other || other === node || seeds.includes(other)) continue
        const kind = edge.type === "supports" || edge.type === "used_in" ? 1 : edge.type === "contradicts" ? 0.6 : 0.8
        const gain = edge.weight * kind * Math.pow(0.5, d)
        out.set(other, (out.get(other) || 0) + gain)
        next.push(other)
      }
    }
    frontier = [...new Set(next)]
  }
  return out
}
