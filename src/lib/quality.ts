/**
 * Quality scoring, merge-dedup, smart recall, and system primer utilities.
 *
 * Pure heuristics — no LLM, no network, no embeddings. These functions
 * power the enhanced memory features: quality-based ranking, automatic
 * deduplication with attribute merging, unified recall, and the system
 * primer (auto-generated knowledge map).
 */

import { parseEntries, buildGraph, bm25Scores, centrality, renderCompact, type GraphEntry } from "./graph"

const normalize = (s: string): string =>
	s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()

const tokenize = (s: string): string[] => normalize(s).split(" ").filter(Boolean)

const isExpiredLocal = (ttl: string): boolean => {
	if (!ttl) return false
	const today = new Date().toISOString().split("T")[0]
	return ttl <= today
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
 * Quality score for an entry (0..1). Pure heuristics, no LLM.
 * Measures how well-structured and useful a memory entry is.
 */
export function qualityScore(tags: string, links: string, content: string, date: string): number {
	let score = 0
	if (tags) {
		const count = tags.split(";").filter(Boolean).length
		score += Math.min(0.3, count * 0.1)
	}
	if (links) {
		const count = links.split(/[\s;]+/).filter(Boolean).length
		score += Math.min(0.2, count * 0.1)
	}
	const len = content.length
	if (len > 20) score += 0.1
	if (len > 60) score += 0.1
	if (len > 150) score += 0.1
	// Recency bonus
	if (date) {
		const days = (Date.now() - new Date(`${date}T00:00:00`).getTime()) / 86400000
		if (days < 7) score += 0.1
		else if (days < 30) score += 0.05
	}
	// Specificity: more unique words → higher score
	const words = content.toLowerCase().split(/\s+/).filter(Boolean)
	const unique = new Set(words)
	const specificity = words.length > 0 ? unique.size / words.length : 0
	score += specificity * 0.1
	return Math.min(1, score)
}

/**
 * Merge two entry lines with the same key. Combines tags (union), takes
 * max confidence, updates date if newer, merges links, and recalculates
 * quality. Returns the merged TOON entry line.
 */
export function mergeEntries(existingLine: string, newLine: string): string {
	const ep = existingLine.trim().split("|")
	const np = newLine.trim().split("|")
	if (ep.length < 7 || np.length < 7) return newLine

	const id = ep[0]
	const category = np[1] || ep[1]
	const key = ep[2]
	const content = np[3] || ep[3]
	const file = np[4] || ep[4]

	// Merge tags (union)
	const existingTags = (ep[5] || "").split(";").map((t) => t.trim()).filter(Boolean)
	const newTags = (np[5] || "").split(";").map((t) => t.trim()).filter(Boolean)
	const mergedTags = [...new Set([...existingTags, ...newTags])].join(";")

	// Take newer date
	const existingDate = ep[6] || ""
	const newDate = np[6] || ""
	const date = newDate > existingDate ? newDate : existingDate

	// Take new TTL if provided, otherwise keep existing
	const existingTtl = ep[7] || ""
	const newTtl = np[7] || ""
	const ttl = newTtl || existingTtl

	// Take max confidence
	const existingConf = ep.length > 11 ? parseFloat(ep[11]) || 0 : 0
	const newConf = np.length > 11 ? parseFloat(np[11]) || 0 : 0
	const confidence = Math.max(existingConf, newConf)

	// Merge links (union)
	const existingLinks = (ep[9] || "").split(/[\s;]+/).filter(Boolean)
	const newLinks = (np[9] || "").split(/[\s;]+/).filter(Boolean)
	const mergedLinks = [...new Set([...existingLinks, ...newLinks])].join(" ")

	const quality = qualityScore(mergedTags, mergedLinks, content, date)

	return `${id}|${category}|${key}|${content}|${file}|${mergedTags}|${date}|${ttl}|0|${mergedLinks}|${quality.toFixed(2)}|${confidence}`
}

/**
 * Unified recall: BM25 + graph traversal + quality + decay in one call.
 * The LLM calls this at the start of a task to get everything it needs.
 */
export function generateSmartRecall(
	data: string,
	intent: string,
	opts: { limit?: number; category?: string; bumpAccess?: (ids: string[]) => void } = {}
): string {
	const entries = parseEntries(data)
	if (entries.length === 0) return "Memoria vacía."

	const { adjacency } = buildGraph(entries)
	const bm25 = bm25Scores(entries, intent)
	const cent = centrality(adjacency)
	const limit = opts.limit ?? 8
	const category = opts.category || ""

	const qTokens = tokenize(intent)

	const scored = entries
		.filter((e) => {
			if (category && e.category !== category) return false
			if (e.ttl && isExpiredLocal(e.ttl)) return false
			return true
		})
		.map((e) => {
			const text = normalize(
				`${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(" ")}`
			)
			const matchesQuery = qTokens.length === 0 || qTokens.some((t) => text.includes(t))
			const bm25Score = bm25.get(e.key) || 0
			const centScore = cent.get(e.key) || 0
			const impScore = importance(e)
			const combined =
				bm25Score + 0.3 * centScore + 0.3 * impScore + (matchesQuery ? 0.5 : 0)
			return { entry: e, score: combined, matchesQuery }
		})
		.filter((x) => x.score > 0 || x.matchesQuery)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)

	if (scored.length === 0) {
		const top = entries
			.filter((e) => !category || e.category === category)
			.sort((a, b) => importance(b) - importance(a))
			.slice(0, limit)
		if (top.length === 0) return "No hay entradas en memoria."
		return renderCompact(top)
	}

	if (opts.bumpAccess) opts.bumpAccess(scored.map((x) => x.entry.id))
	return renderCompact(scored.map((x) => x.entry))
}

/**
 * Generate a system primer: a concise, always-current knowledge map.
 * Regenerates when called (lightweight — no LLM, pure heuristics).
 */
export function generateSystemPrimer(data: string): string {
	const entries = parseEntries(data)
	if (entries.length === 0) return "Memoria vacía. No hay entradas guardadas."

	const byCategory: Record<string, GraphEntry[]> = {}
	for (const e of entries) {
		if (!byCategory[e.category]) byCategory[e.category] = []
		byCategory[e.category].push(e)
	}

	const lines: string[] = [
		"=== System Primer ===",
		`Entradas: ${entries.length}`,
		"",
	]

	// Top entries by importance (global)
	const top = [...entries]
		.sort((a, b) => importance(b) - importance(a))
		.slice(0, 5)
	lines.push("Top memorias:")
	for (const e of top) {
		const quality = qualityScore(
			e.tags.join(";"),
			e.links.join(" "),
			e.content,
			e.date
		)
		const conf = quality >= 0.5 ? "alta" : quality >= 0.3 ? "media" : "baja"
		lines.push(
			`  [${e.category}] ${e.key} — ${e.content.slice(0, 80)} (calidad: ${conf})`
		)
	}
	lines.push("")

	// Categories
	lines.push("Categorías:")
	for (const [cat, items] of Object.entries(byCategory)) {
		lines.push(`  ${cat}: ${items.length}`)
	}
	lines.push("")

	// Rules (mandatory patterns)
	const patterns = entries.filter((e) => e.category === "pattern")
	if (patterns.length > 0) {
		lines.push("Patrones establecidos:")
		for (const p of patterns.slice(0, 5)) {
			lines.push(`  • ${p.key}: ${p.content.slice(0, 100)}`)
		}
	}

	return lines.join("\n")
}
