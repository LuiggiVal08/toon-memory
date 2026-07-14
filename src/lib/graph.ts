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
 *
 * Hito 7 adds BM25 relevance scoring + graph centrality re-ranking, plus a
 * `detailed` result so the MCP server can render compact / numeric-edge output
 * without mutating the stored `.toon` file.
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

const tokenize = (s: string): string[] => normalize(s).split(" ").filter(Boolean)

/**
 * BM25 relevance of each entry for the query. Deterministic and offline.
 * Returns a map key -> score (0 when the entry shares no query token).
 */
export function bm25Scores(entries: GraphEntry[], query: string): Map<string, number> {
	const N = entries.length
	const scores = new Map<string, number>()
	if (N === 0) return scores

	const docs = entries.map((e) =>
		tokenize(`${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(" ")}`)
	)
	const df = new Map<string, number>()
	for (const d of docs) {
		for (const t of new Set(d)) df.set(t, (df.get(t) || 0) + 1)
	}
	const avgdl = docs.reduce((a, b) => a + b.length, 0) / N
	const k1 = 1.5
	const b = 0.75
	const qTokens = tokenize(query)

	entries.forEach((e, i) => {
		const d = docs[i]
		const dl = d.length || 1
		let score = 0
		for (const t of qTokens) {
			const dfT = df.get(t)
			if (!dfT) continue
			const f = d.filter((x) => x === t).length
			const idf = Math.log((N - dfT + 0.5) / (dfT + 0.5) + 1)
			score += (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + (b * dl) / avgdl))
		}
		scores.set(e.key, score)
	})
	return scores
}

/**
 * Degree-normalized centrality (0..1). A hub connected to many entries scores
 * near 1, so it surfaces even when it lacks the exact query word.
 */
export function centrality(adjacency: Map<string, string[]>): Map<string, number> {
	let maxDeg = 1
	const deg = new Map<string, number>()
	for (const [k, v] of adjacency) {
		deg.set(k, v.length)
		if (v.length > maxDeg) maxDeg = v.length
	}
	const out = new Map<string, number>()
	for (const [k, d] of deg) out.set(k, d / maxDeg)
	return out
}

export interface GraphRecallResult {
	/** Selected entries, ordered by final score (desc). */
	entries: GraphEntry[]
	/** Keys that directly matched the query (seeds, distance 0). */
	seeds: Set<string>
	/** Adjacency restricted to the selected entries (for numeric-edge rendering). */
	adjacency: Map<string, string[]>
	/** Final combined score per key (bm25 + centrality + importance + seed bonus). */
	scores: Map<string, number>
}

const W_CENT = 0.4
const W_IMP = 0.25
const SEED_BONUS = 1.0
/** Per-hop decay: a node 1 hop from a seed scores half of an equivalent seed. */
const DECAY = 0.5

/**
 * Graph-aware recall with BM25 + centrality re-ranking.
 * Seeds are keyword matches (AND logic); the result is the ego-subgraph
 * expanded up to `hops` (1 or 2), with relevance propagated from the seeds.
 * Falls back to top-by-importance when the query matches nothing.
 */
export function graphRecallDetailed(
	data: string,
	query: string,
	opts: GraphRecallOpts = {}
): GraphRecallResult {
	const entries = parseEntries(data)
	const { adjacency, byKey } = buildGraph(entries)
	const hops = Math.max(1, Math.min(2, opts.hops ?? 1))
	const category = opts.category || ""
	const from_date = opts.from_date || ""
	const to_date = opts.to_date || ""

	const qTokens = tokenize(query)
	const bm25 = bm25Scores(entries, query)
	const cent = centrality(adjacency)

	const seedKeys = new Set<string>()
	for (const e of entries) {
		if (category && e.category !== category) continue
		if (from_date && e.date < from_date) continue
		if (to_date && e.date > to_date) continue
		if (e.ttl && isExpiredLocal(e.ttl)) continue
		const text = normalize(
			`${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(" ")}`
		)
		if (qTokens.length > 0 && !qTokens.every((t) => text.includes(t))) continue
		seedKeys.add(e.key)
	}

	let selected: GraphEntry[]
	const scored: Array<{ e: GraphEntry; s: number }> = []
	if (seedKeys.size === 0) {
		scored.push(
			...[...entries]
				.sort((a, b) => importance(b) - importance(a))
				.slice(0, opts.limit ?? 6)
				.map((e) => ({ e, s: importance(e) }))
		)
	} else {
		// BFS from all seeds, recording the shortest hop distance to each node.
		const best = new Map<string, number>()
		const queue: Array<{ key: string; dist: number }> = []
		for (const k of seedKeys) queue.push({ key: k, dist: 0 })
		while (queue.length) {
			const { key, dist } = queue.shift()!
			if (best.has(key) && best.get(key)! <= dist) continue
			best.set(key, dist)
			if (dist >= hops) continue
			for (const nb of adjacency.get(key) || []) {
				queue.push({ key: nb, dist: dist + 1 })
			}
		}

		scored.push(
			...[...best.keys()]
				.map((k) => {
					const e = byKey.get(k)!
					const dist = best.get(k)!
					const decay = Math.pow(DECAY, dist)
					let s = (bm25.get(k) || 0) + W_CENT * cent.get(k)! + W_IMP * importance(e)
					if (seedKeys.has(k)) s += SEED_BONUS
					s *= decay
					return { e, s }
				})
				.sort((a, b) => b.s - a.s)
				.slice(0, opts.limit ?? 6)
		)
	}

	selected = scored.map((x) => x.e)

	// Restrict adjacency to the selected entries for compact edge rendering.
	const subAdj = new Map<string, string[]>()
	for (const e of selected) {
		subAdj.set(
			e.key,
			(adjacency.get(e.key) || []).filter((k) => selected.some((s) => s.key === k))
		)
	}

	const scores = new Map<string, number>()
	selected.forEach((e) => scores.set(e.key, scored.find((x) => x.e.key === e.key)!.s))

	return { entries: selected, seeds: seedKeys, adjacency: subAdj, scores }
}

/**
 * Convenience wrapper returning just the ordered entries (backward compatible).
 */
export function graphRecall(
	data: string,
	query: string,
	opts: GraphRecallOpts = {}
): GraphEntry[] {
	return graphRecallDetailed(data, query, opts).entries
}

export interface RenderCompactOpts {
	/** Restricted adjacency for numeric edge rendering (graph mode). */
	adjacency?: Map<string, string[]>
	/** Keys that directly matched the query (seeds = full content). */
	seeds?: Set<string>
	/** Max chars before a neighbor (non-seed) is truncated with an ellipsis. */
	snippetLen?: number
}

/**
 * Token-efficient rendering of recall results.
 *   - each entry gets a stable numeric index `1`, `2`, ...
 *   - `id` / `date` / `file` are dropped (only `tags` is kept)
 *   - graph edges render as `->2, ->3` (numeric) when `adjacency` is given
 *   - neighbors reached via graph (non-seeds) are truncated to `snippetLen`
 *
 * The stored `.toon` file is never mutated — this only shapes the output.
 */
export function renderCompact(entries: GraphEntry[], opts: RenderCompactOpts = {}): string {
	const index = new Map<string, number>()
	entries.forEach((e, i) => index.set(e.key, i + 1))
	const snippetLen = opts.snippetLen ?? 90

	return entries
		.map((e) => {
			const n = index.get(e.key)!
			const isSeed = opts.seeds ? opts.seeds.has(e.key) : true
			let body = e.content
			if (!isSeed && e.content.length > snippetLen) {
				body = e.content.slice(0, snippetLen).trimEnd() + "…"
			}
			const tags = e.tags.length ? ` · tags: ${e.tags.join(";")}` : ""
			let edges = ""
			if (opts.adjacency) {
				const nb = (opts.adjacency.get(e.key) || [])
					.map((k) => index.get(k))
					.filter((x): x is number => typeof x === "number")
				if (nb.length) edges = ` · edges: ->${nb.join(", ->")}`
			}
			return `[${n}] ${e.category}/${e.key}\n  ${body}${tags}${edges}`
		})
		.join("\n\n")
}
