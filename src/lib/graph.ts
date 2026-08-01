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

import { normalize, isExpiredLocal, tokenize, importance, parseToonLine } from "./utils"
import { expandSynonyms } from "./synonyms"
import { fuzzyMatch } from "./fuzzy"

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
	/** ISO timestamp of last recall/access. Empty if never accessed. */
	lastAccessed: string
	/** Priority level 0-5. 0 = normal, 1-5 = pinned with priority (5 = highest). */
	priority: number
	/** Glob pattern scoping this entry to a file path (e.g. "src/**\/*.ts"). Empty = global. */
	path_scope: string
	/** Who created this entry. */
	origin: "human" | "agent" | "inferred"
	/** Lifecycle status. Obsolete/draft entries are filtered from normal recalls. */
	status: "active" | "obsolete" | "resolved" | "draft"
	/** ISO date when this entry was superseded (set by memory_forget action=supersede). Empty if never superseded. */
	supersededOn: string
}

/** Edge type labels used in typed links (`type:key`). */
export const EDGE_TYPES = ["related", "supersedes", "superseded_by", "implements", "blocks", "depends_on", "references", "applies_to"] as const

/** Default edge type when a link token has no `type:` prefix. */
export const DEFAULT_EDGE_TYPE = "related"

/**
 * Parse a link token into its edge type and target key.
 * Tolerant: a plain key (`risk-spec`) gets the default `related` type,
 * while `type:key` (e.g. `supersedes:engine-arch`) carries its declared type.
 * Keys are kebab-case and never contain colons, so the LAST `:` is the split point.
 */
export function parseLinkToken(token: string): { type: string; key: string } {
	const idx = token.lastIndexOf(":")
	if (idx === -1) return { type: DEFAULT_EDGE_TYPE, key: token }
	const type = token.slice(0, idx)
	const key = token.slice(idx + 1)
	return { type: type || DEFAULT_EDGE_TYPE, key: key || token }
}

/** Key part of a link token (strips any `type:` prefix). */
export function linkKey(token: string): string {
	return parseLinkToken(token).key
}

/** Render a typed link token. Plain keys stay as-is (backward compatible). */
export function formatLink(type: string, key: string): string {
	return type && type !== DEFAULT_EDGE_TYPE ? `${type}:${key}` : key
}

/** Expand raw link tokens into typed edges. */
export function typedLinks(links: string[]): Array<{ type: string; key: string }> {
	return links.map(parseLinkToken)
}

export interface MemoryGraph {
	/** key -> connected keys (undirected, deduped, only keys that exist). */
	adjacency: Map<string, string[]>
	/** key -> entry (first occurrence wins on duplicate keys). */
	byKey: Map<string, GraphEntry>
}

export const entryLines = (data: string): string[] =>
	data
		.split("\n")
		.filter(
			(l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:")
		)

/**
 * Parse TOON memory content into structured entries.
 * Tolerant of the trailing `links` field (absent on older entries).
 * Also handles the `lastAccessed` field (field 12) for access tracking.
 */
export function parseEntries(data: string): GraphEntry[] {
	const out: GraphEntry[] = []
	for (const line of entryLines(data)) {
		const parts = parseToonLine(line)
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
			lastAccessed: parts.length > 12 ? parts[12] || "" : "",
			priority: parts.length > 13 ? parseInt(parts[13]) || 0 : 0,
			path_scope: parts.length > 14 ? parts[14] || "" : "",
			origin: parts.length > 15 && parts[15] ? parts[15] as "human" | "agent" | "inferred" : "agent",
			status: parts.length > 16 && parts[16] ? parts[16] as "active" | "obsolete" | "resolved" | "draft" : "active",
			supersededOn: parts.length > 17 ? parts[17] || "" : "",
		})
	}
	return out
}

/** Similarity used to attach orphans: shared tags dominate, then shared key
 * tokens, then shared content tokens. Deterministic (tie-break by key). */
function orphanScore(a: GraphEntry, b: GraphEntry): number {
	const aTags = new Set(a.tags)
	let sharedTags = 0
	for (const t of b.tags) if (aTags.has(t)) sharedTags++
	const aKey = new Set(tokenize(a.key))
	const bKey = new Set(tokenize(b.key))
	let sharedKey = 0
	for (const t of bKey) if (aKey.has(t)) sharedKey++
	const aTok = new Set(tokenize(a.content))
	let sharedContent = 0
	for (const t of tokenize(b.content)) if (aTok.has(t)) sharedContent++
	return sharedTags * 4 + sharedKey * 2 + sharedContent
}

/**
 * Build the adjacency graph from explicit links and implicit `[[key]]` refs.
 * Edges are undirected and only connect keys that actually exist. Nodes with
 * zero edges are linked to their most similar entry so every node connects.
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
		for (const l of e.links) link(e.key, linkKey(l))
		const refs = e.content.match(/\[\[([\w-]+)\]\]/g) || []
		for (const r of refs) link(e.key, r.slice(2, -2))
	}

	// Connect entries sharing 2+ tags
	if (entries.some((e) => e.tags.length > 0)) {
		for (let i = 0; i < entries.length; i++) {
			const ei = entries[i]
			if (ei.tags.length === 0) continue
			const eTags = new Set(ei.tags)
			for (let j = i + 1; j < entries.length; j++) {
				const ej = entries[j]
				if (ej.tags.length === 0) continue
				let shared = 0
				for (const t of ej.tags) if (eTags.has(t)) shared++
				if (shared >= 2) link(ei.key, ej.key)
			}
		}
	}

	const adjacency = new Map<string, string[]>()
	for (const [k, v] of adj) adjacency.set(k, [...v])

	// Guarantee connectivity: every entry gets at least one edge. Orphans are
	// attached to their most similar entry so nothing floats alone in the graph.
	const allKeys = [...byKey.keys()]
	for (const key of allKeys) {
		if (adj.has(key)) continue
		let best = ""
		let bestScore = -1
		for (const other of allKeys) {
			if (other === key) continue
			const score = orphanScore(byKey.get(key)!, byKey.get(other)!)
			if (best === "" || score > bestScore || (score === bestScore && other < best)) {
				bestScore = score
				best = other
			}
		}
		if (best) link(key, best)
	}
	for (const [k, v] of adj) adjacency.set(k, [...v])

	// Bridge any remaining islands into the largest component so the graph is
	// one connected whole, not several self-connected clusters.
	const comps = connectedComponents(adjacency)
	if (comps.length > 1) {
		let largest = comps[0]
		for (const c of comps) if (c.length > largest.length) largest = c
		const largestSet = new Set(largest)
		for (const comp of comps) {
			if (comp.length === largest.length && comp[0] === largest[0]) continue
			let bestA = ""
			let bestB = ""
			let bestScore = -1
			for (const a of comp) {
				const ea = byKey.get(a)!
				for (const b of largest) {
					const score = orphanScore(ea, byKey.get(b)!)
					if (
						bestA === "" ||
						score > bestScore ||
						(score === bestScore && a + b < bestA + bestB)
					) {
						bestScore = score
						bestA = a
						bestB = b
					}
				}
			}
			if (bestA) link(bestA, bestB)
		}
		for (const [k, v] of adj) adjacency.set(k, [...v])
	}
	return { adjacency, byKey }
}

function connectedComponents(adjacency: Map<string, string[]>): string[][] {
	const comps: string[][] = []
	const seen = new Set<string>()
	for (const [start] of adjacency) {
		if (seen.has(start)) continue
		const comp: string[] = []
		const stack = [start]
		seen.add(start)
		while (stack.length) {
			const cur = stack.pop()!
			comp.push(cur)
			for (const next of adjacency.get(cur) || []) {
				if (!seen.has(next)) {
					seen.add(next)
					stack.push(next)
				}
			}
		}
		comps.push(comp)
	}
	return comps
}

export interface GraphRecallOpts {
	category?: string
	/** Semicolon-separated; entry must have ALL specified tags to match. */
	tags?: string
	from_date?: string
	to_date?: string
	/** Graph traversal depth from matched seeds (1 or 2). Default 1. */
	hops?: number
	/** Max entries returned (keeps token cost low). Default 6. */
	limit?: number
	/** Session bias: boost entries whose file matches current session files. */
	sessionFiles?: string[]
	/** Path scope glob filter: only return entries whose path_scope matches. */
	path_scope?: string
	/** Use Reciprocal Rank Fusion instead of weighted linear scoring. */
	rrf?: boolean
	/** Temporal view (YYYY-MM-DD): include entries valid on that date.
	 *  Entries superseded AFTER `asOf` still count; entries created after `asOf` are excluded. */
	asOf?: string
	/** Reference date (YYYY-MM-DD) for recency/decay/TTL scoring. Defaults to the wall clock. */
	today?: string
}

/**
 * Reciprocal Rank Fusion of several rankers (BM25 fused multiple times, centrality).
 * k is the RRF smoothing constant. Ranks are 0-based.
 */
export function rrfFuse(rankers: Array<Map<string, number>>, k = 60): Map<string, number> {
	const out = new Map<string, number>()
	for (const ranker of rankers) {
		for (const [key, rank] of ranker) {
			out.set(key, (out.get(key) || 0) + 1 / (k + rank))
		}
	}
	return out
}

/**
 * Adaptive RRF smoothing constant. The textbook k=60 is tuned for large candidate
 * sets from independent retrievers; on a small memory graph it flattens every rank
 * into a narrow score band. Scaling with sqrt(candidateCount) keeps the top ranks
 * distinguishable while remaining stable as memory grows.
 */
export function rrfK(candidateCount: number): number {
	return Math.max(3, Math.min(60, Math.round(Math.sqrt(candidateCount))))
}

/** Build a 0-based rank map from a score map (higher score = lower rank). */
export function rankBy(score: Map<string, number>): Map<string, number> {
	const out = new Map<string, number>()
	;[...score.entries()]
		.sort((a, b) => b[1] - a[1])
		.forEach(([key], i) => out.set(key, i))
	return out
}

/**
 * BM25 relevance of each entry for the query. Deterministic and offline.
 * Returns a map key -> score (0 when the entry shares no query token).
 */
export function bm25Scores(entries: GraphEntry[], query: string): Map<string, number> {
	const N = entries.length
	const scores = new Map<string, number>()
	if (N === 0) return scores

	const docs = entries.map((e) =>
		tokenize(`${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(" ")} ${e.path_scope}`)
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
	const tagsFilter = opts.tags ? opts.tags.split(";").map((t) => t.trim()).filter(Boolean) : []
	const from_date = opts.from_date || ""
	const to_date = opts.to_date || ""

	const qTokens = tokenize(query)
	const expandedTokens = expandSynonyms(qTokens)
	const bm25 = bm25Scores(entries, query)
	const cent = centrality(adjacency)

	const seedKeys = new Set<string>()
	const asOf = opts.asOf || ""
	for (const e of entries) {
		if (e.status === "obsolete" || e.status === "draft") {
			// Temporal view: a superseded entry was still valid until its supersededOn date.
			if (!(asOf && e.status === "obsolete" && e.supersededOn && e.supersededOn > asOf)) continue
		}
		if (asOf && e.date && e.date > asOf) continue
		if (category && e.category !== category) continue
		if (tagsFilter.length > 0 && !tagsFilter.every((t) => e.tags.includes(t))) continue
		if (from_date && e.date < from_date) continue
		if (to_date && e.date > to_date) continue
		if (e.ttl && isExpiredLocal(e.ttl, opts.today)) continue
		if (opts.path_scope && e.path_scope && !globMatch(opts.path_scope, e.path_scope)) continue
		const text = normalize(
			`${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(" ")}`
		)
		const docTokens = text.split(" ")
		const exactMatch = expandedTokens.some((t) => text.includes(t))
		const fuzzy = !exactMatch && fuzzyMatch(qTokens, docTokens)
		if (qTokens.length > 0 && !exactMatch && !fuzzy) continue
		seedKeys.add(e.key)
	}

	let selected: GraphEntry[]
	const scored: Array<{ e: GraphEntry; s: number }> = []
	const visibleEntries = entries.filter((e) => {
		if (e.status === "obsolete" || e.status === "draft") {
			return !!(asOf && e.status === "obsolete" && e.supersededOn && e.supersededOn > asOf)
		}
		return !(asOf && e.date && e.date > asOf)
	})
	const isVisible = new Set(visibleEntries.map((e) => e.key))
	if (seedKeys.size === 0) {
		scored.push(
			...visibleEntries
				.sort((a, b) => {
					if (a.priority !== b.priority) return b.priority - a.priority
					return importance(b, opts.today) - importance(a, opts.today)
				})
				.slice(0, opts.limit ?? 6)
				.map((e) => ({ e, s: importance(e, opts.today) }))
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
				if (!isVisible.has(nb)) continue
				queue.push({ key: nb, dist: dist + 1 })
			}
		}

		// RRF mode: fuse per-signal rankers instead of the weighted linear score.
		// BM25 (the only real retriever on a small memory graph) is fused three times;
		// centrality contributes once as the graph signal. Importance is dropped from
		// the fusion — on small graphs its rank is dominated by recency noise and
		// including it drags nDCG down (validated on scripts/bench-rrf.mjs). k is
		// adaptive: the textbook k=60 flattens rank differences on small graphs, so it
		// scales with sqrt(candidate count).
		const sub = (m: Map<string, number>) => new Map([...m].filter(([k]) => isVisible.has(k)))
		const bm25Rank = rankBy(sub(bm25))
		const centRank = rankBy(sub(cent))
		const fused = opts.rrf ? rrfFuse([bm25Rank, bm25Rank, bm25Rank, centRank], rrfK(bm25Rank.size)) : null

		scored.push(
			...[...best.keys()]
				.map((k) => {
					const e = byKey.get(k)!
					const dist = best.get(k)!
					const decay = Math.pow(DECAY, dist)
					let s = fused
						? fused.get(k) || 0
						: (bm25.get(k) || 0) + W_CENT * (cent.get(k) || 0) + W_IMP * importance(e, opts.today)
					if (!fused && seedKeys.has(k)) s += SEED_BONUS
					if (opts.sessionFiles && opts.sessionFiles.length > 0 && e.file) {
						const entryFile = e.file.split(":")[0]
						if (opts.sessionFiles.some((f) => f === entryFile)) {
							s *= 1.15
						}
					}
					s *= decay
					return { e, s, priority: e.priority }
				})
				.sort((a, b) => {
					if (a.priority !== b.priority) return b.priority - a.priority
					return b.s - a.s
				})
				.slice(0, opts.limit ?? 6)
		)
	}

	selected = scored.map((x) => x.e)

	// Inject pinned entries that aren't already in the result set, sorted by priority desc.
	const pinnedKeys = new Set(visibleEntries.filter((e) => e.priority > 0).map((e) => e.key))
	const inResult = new Set(selected.map((e) => e.key))
	const toInject = [...pinnedKeys]
		.filter((k) => !inResult.has(k) && byKey.has(k))
		.map((k) => byKey.get(k)!)
		.sort((a, b) => b.priority - a.priority)
	for (const e of toInject) {
		selected.unshift(e)
		scored.unshift({ e, s: 999 })
	}

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
	/** Budget level: "tiny" (key+1 line), "normal" (compact, default), "deep" (all fields). */
	budget?: "tiny" | "normal" | "deep"
}

/**
 * Simple glob match: supports `*` (any chars except `/`), `**` (any chars),
 * and `?` (single char). Used by path_scope filtering.
 */
export function globMatch(pattern: string, target: string): boolean {
	if (!pattern) return true
	if (pattern.startsWith("/")) pattern = pattern.slice(1)
	if (target.startsWith("/")) target = target.slice(1)
	const reStr = "^" + pattern
		.replace(/\*\*/g, "___DOUBLESTAR___")
		.replace(/\*/g, "[^/]*")
		.replace(/___DOUBLESTAR___/g, ".*")
		.replace(/\?/g, ".")
		.replace(/\./g, "\\.")
		.replace(/\\\.\*/g, ".*")
	+ "$"
	try {
		return new RegExp(reStr).test(target)
	} catch {
		return false
	}
}

/**
 * Token-efficient rendering of recall results.
 *   - each entry gets a stable numeric index `1`, `2`, ...
 *   - `id` / `date` / `file` are dropped (only `tags` is kept)
 *   - graph edges render as `->2, ->3` (numeric) when `adjacency` is given
 *   - neighbors reached via graph (non-seeds) are truncated to `snippetLen`
 *
 * Budget levels:
 *   "tiny"   — key + category + 1 line of content (~50 tokens). For proactive recall.
 *   "normal" — current compact format with tags, edges, truncated neighbors.
 *   "deep"   — full content with all fields (id, date, file, links, quality).
 *
 * The stored `.toon` file is never mutated — this only shapes the output.
 */
export function renderCompact(entries: GraphEntry[], opts: RenderCompactOpts = {}): string {
	const index = new Map<string, number>()
	entries.forEach((e, i) => index.set(e.key, i + 1))
	const snippetLen = opts.snippetLen ?? 90

	const budget = opts.budget ?? "normal"

	return entries
		.map((e) => {
			const n = index.get(e.key)!
			const isSeed = opts.seeds ? opts.seeds.has(e.key) : true

			if (budget === "tiny") {
				const firstLine = e.content.split("\n")[0] || ""
				const snippet = firstLine.length > 80 ? firstLine.slice(0, 80).trimEnd() + "…" : firstLine
				const pin = e.priority > 0 ? (e.priority > 1 ? ` 📌${e.priority}` : " 📌") : ""
				return `[${n}] ${e.category}/${e.key}${pin}\n  ${snippet}`
			}

			if (budget === "deep") {
				const ttlInfo = e.ttl ? ` · ttl: ${e.ttl}` : ""
				const accessInfo = e.accessed > 0 ? ` · accessed: ${e.accessed}x` : ""
				const lastAccess = e.lastAccessed ? ` · lastAccess: ${e.lastAccessed}` : ""
				const pin = e.priority > 0 ? (e.priority > 1 ? ` 📌${e.priority}` : " 📌") : ""
				const links = e.links.length ? `\n  links: ${e.links.join(", ")}` : ""
				const originInfo = e.origin !== "agent" ? ` · origin: ${e.origin}` : ""
				const scopeInfo = e.path_scope ? ` · scope: ${e.path_scope}` : ""
				const statusInfo = e.status !== "active" ? ` · status: ${e.status}` : ""
				const supersededInfo = e.supersededOn ? ` · superseded: ${e.supersededOn}` : ""
				return `[${n}] ${e.category}/${e.key}${pin} (${e.id})\n  ${e.content}\n  File: ${e.file} | Tags: ${e.tags.join(";")} | Date: ${e.date}${ttlInfo}${accessInfo}${lastAccess}${originInfo}${scopeInfo}${statusInfo}${supersededInfo}${links}`
			}

			// "normal" budget (default)
			let body = e.content
			if (!isSeed && e.content.length > snippetLen) {
				body = e.content.slice(0, snippetLen).trimEnd() + "…"
			}
			const tag = e.priority > 0 ? (e.priority > 1 ? ` 📌${e.priority}` : " 📌") : ""
			const tags = e.tags.length ? ` · tags: ${e.tags.join(";")}` : ""
			let edges = ""
			if (opts.adjacency) {
				const nb = (opts.adjacency.get(e.key) || [])
					.map((k) => index.get(k))
					.filter((x): x is number => typeof x === "number")
				if (nb.length) edges = ` · edges: ->${nb.join(", ->")}`
			}
			return `[${n}] ${e.category}/${e.key}${tag}\n  ${body}${tags}${edges}`
		})
		.join("\n\n")
}
