import { readMemory } from "../mcp/memory-io"
import { parseEntries, buildGraph } from "../lib/graph"
import type { ViewerData } from "./types"

export function buildViewerData(): ViewerData {
  const data = readMemory()
  const entries = parseEntries(data)
  if (entries.length === 0) {
    return { nodes: [], edges: [], categories: {}, tagCounts: {}, totalEntries: 0 }
  }

  const graph = buildGraph(entries)

  const nodes = entries.map((e) => ({
    id: e.key,
    category: e.category,
    content: e.content.substring(0, 120),
    tags: e.tags,
    quality: e.accessed,
    accessCount: e.accessed,
    date: e.date,
    file: e.file,
    links: e.links,
    ttl: e.ttl,
    lastAccessed: e.lastAccessed,
  }))

  const edges: { source: string; target: string }[] = []
  const seen = new Set<string>()
  for (const [key, neighbors] of graph.adjacency) {
    for (const n of neighbors) {
      const pair = [key, n].sort().join("::")
      if (!seen.has(pair)) {
        seen.add(pair)
        edges.push({ source: key, target: n })
      }
    }
  }

  const categories: Record<string, number> = {}
  const tagCounts: Record<string, number> = {}
  for (const e of entries) {
    categories[e.category] = (categories[e.category] || 0) + 1
    for (const t of e.tags) tagCounts[t] = (tagCounts[t] || 0) + 1
  }

  return { nodes, edges, categories, tagCounts, totalEntries: entries.length }
}
