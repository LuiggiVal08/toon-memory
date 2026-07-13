/**
 * Memory graph layer for toon-memory.
 *
 * Turns the flat TOON entry list into a lightweight knowledge graph:
 *   - nodes  = memory entries (keyed by `key`)
 *   - edges  = explicit `links` + implicit `[[key]]` references in content
 *
 * Everything is deterministic and offline: no embeddings, no LLM, no network.
 * The graph's value is precision (relational context) and smaller result sets
 * (an ego-subgraph instead of dumping every keyword match).
 */

export interface GraphEntry {
	id: string
	category: string
	key: string
	content: string
	file: string
	tags: string[]
	date: string
	ttl: string
	accessed: number
	/** Explicit outgoing links declared on the entry. */
	links: string[]
}

export interface MemoryGraph {
	/** key -> connected keys (undirected, deduped, only keys that exist). */
	adjacency: Map<string, string[]>
	/** key -> entry (first occurrence wins on duplicate keys). */
	byKey: Map<string, GraphEntry>
}

const isExpiredLocal = (ttl: string): boolean => {
	if (!ttl) return false
	const today = new Date().toISOString().split("T")[0]
	return ttl <= today
}

const normalize = (s: string): string =>
	s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()

const entryLines = (data: string): string[] =>
	data
		.split("\n")
		.filter(
			(l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:")
		)

/**
 * Parse TOON memory content into structured entries.
 * Tolerant of the trailing `links` field (absent on older entries).
 */
export function parseEntries(data: string): GraphEntry[] {
	const out: GraphEntry[] = []
	for (const line of entryLines(data)) {
		const parts = line.trim().split("|")
		if (parts.length < 7) continue
		const [id, category, key, content, file, tags, date, ttl, accessedRaw, linksRaw] =
			parts
		out.push({
			id,
			category,
			key,
			content,
			file: file || "",
			tags: (tags || "")
				.split(";")
				.map((t) => t.trim())
				.filter(Boolean),
			date: date || "",
			ttl: ttl || "",
			accessed: accessedRaw ? parseInt(accessedRaw) || 0 : 0,
			links: (linksRaw || "")
				.split(/[\s;]+/)
				.map((t) => t.trim())
				.filter(Boolean),
		})
	}
	return out
}

/**
 * Build the adjacency graph from explicit links and implicit `[[key]]` refs.
 * Edges are undirected and only connect keys that actually exist.
 */
export function buildGraph(entries: GraphEntry[]): MemoryGraph {
	const byKey = new Map<string, GraphEntry>()
	for (const e of entries) {
		if (!byKey.has(e.key)) byKey.set(e.key, e)
	}

	const adj = new Map<string, Set<string>>()
	const link = (a: string, b: string): void => {
		if (a === b) return
		if (!byKey.has(a) || !byKey.has(b)) return
		if (!adj.has(a)) adj.set(a, new Set())
		adj.get(a)!.add(b)
		if (!adj.has(b)) adj.set(b, new Set())
		adj.get(b)!.add(a)
	}

	for (const e of entries) {
		for (const l of e.links) link(e.key, l)
		const refs = e.content.match(/\[\[([\w-]+)\]\]/g) || []
		for (const r of refs) link(e.key, r.slice(2, -2))
	}

	const adjacency = new Map<string, string[]>()
	for (const [k, v] of adj) adjacency.set(k, [...v])
	return { adjacency, byKey }
}

export interface GraphRecallOpts {
	category?: string
	from_date?: string
	to_date?: string
	/** Graph traversal depth from matched seeds (1 or 2). Default 1. */
	hops?: number
	/** Max entries returned (keeps token cost low). Default 6. */
	limit?: number
}

const importance = (e: GraphEntry): number => {
	const today = new Date().toISOString().split("T")[0]
	const days =
		(Date.now() - new Date(`${e.date || today}T00:00:00`).getTime()) / 86400000
	const recency = Math.max(0, 30 - days) / 30
	const freq = Math.min(1, e.accessed / 5)
	return recency * 0.6 + freq * 0.4
}

/**
 * Graph-aware recall. Seeds are keyword matches (AND logic); the result is the
 * ego-subgraph expanded up to `hops` with relevance propagated from seeds.
 * Falls back to top-by-importance when the query matches nothing.
 */
export function graphRecall(
	data: string,
	query: string,
	opts: GraphRecallOpts = {}
): GraphEntry[] {
	const entries = parseEntries(data)
	const { adjacency, byKey } = buildGraph(entries)
	const hops = Math.max(1, Math.min(2, opts.hops ?? 1))
	const category = opts.category || ""
	const from_date = opts.from_date || ""
	const to_date = opts.to_date || ""

	const queryTokens = normalize(query)
		.split(" ")
		.filter(Boolean)

	const seedScore = new Map<string, number>()
	for (const e of entries) {
		if (category && e.category !== category) continue
		if (from_date && e.date < from_date) continue
		if (to_date && e.date > to_date) continue
		if (e.ttl && isExpiredLocal(e.ttl)) continue
		const searchStr = normalize(
			`${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(" ")}`
		)
		if (queryTokens.length > 0 && !queryTokens.every((t) => searchStr.includes(t)))
			continue
		seedScore.set(e.key, importance(e) + 1.0)
	}

	// No matches: return the most important entries as a sane fallback.
	if (seedScore.size === 0) {
		return [...entries]
			.sort((a, b) => importance(b) - importance(a))
			.slice(0, opts.limit ?? 6)
	}

	// BFS from all seeds, recording the shortest hop distance to each node.
	const best = new Map<string, number>()
	const queue: Array<{ key: string; dist: number }> = []
	for (const k of seedScore.keys()) queue.push({ key: k, dist: 0 })
	while (queue.length) {
		const { key, dist } = queue.shift()!
		if (best.has(key) && best.get(key)! <= dist) continue
		best.set(key, dist)
		if (dist >= hops) continue
		for (const nb of adjacency.get(key) || []) {
			queue.push({ key: nb, dist: dist + 1 })
		}
	}

	const scored = [...best.keys()]
		.map((k) => {
			const e = byKey.get(k)!
			let s = importance(e)
			if (seedScore.has(k)) s += 1.0
			else s += 0.6 / best.get(k)!
			return { e, s }
		})
		.sort((a, b) => b.s - a.s)

	return scored.slice(0, opts.limit ?? 6).map((x) => x.e)
}
