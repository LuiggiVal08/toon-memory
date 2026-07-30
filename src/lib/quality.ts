/**
 * Quality scoring, merge-dedup, smart recall, and system primer utilities.
 *
 * Pure heuristics — no LLM, no network, no embeddings. These functions
 * power the enhanced memory features: quality-based ranking, automatic
 * deduplication with attribute merging, unified recall, and the system
 * primer (auto-generated knowledge map).
 */

import { parseEntries, buildGraph, bm25Scores, centrality, renderCompact, type GraphEntry } from "./graph"
import { normalize, isExpiredLocal, tokenize, importance, isPrivate } from "./utils"
import { expandSynonyms } from "./synonyms"
import { fuzzyMatch } from "./fuzzy"

/**
 * Quality score for an entry (0..1). Pure heuristics, no LLM.
 * Measures how well-structured and useful a memory entry is.
 *
 * Factors:
 *   - Tags (0.3 max): structured categorization
 *   - Links (0.2 max): graph connectivity
 *   - Content length (0.3 max): detail level
 *   - Recency (0.1 max): how recently created
 *   - Specificity (0.1 max): unique word ratio
 *   - Access frequency (0.15 max): how often recalled
 *   - Access recency (0.1 max): how recently accessed
 *   - Staleness decay: entries not accessed in 30+ days lose up to 0.2
 */
export function qualityScore(
	tags: string,
	links: string,
	content: string,
	date: string,
	accessed: number = 0,
	lastAccessed: string = "",
	origin: string = ""
): number {
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
	// Recency bonus (creation date)
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
	// Access frequency: entries recalled more often are more valuable
	if (accessed > 0) {
		score += Math.min(0.15, accessed * 0.03)
	}
	// Access recency: recently accessed entries are more relevant
	if (lastAccessed) {
		const daysSinceAccess = (Date.now() - new Date(lastAccessed).getTime()) / 86400000
		if (daysSinceAccess < 1) score += 0.1
		else if (daysSinceAccess < 7) score += 0.07
		else if (daysSinceAccess < 30) score += 0.03
	}

	// Origin weighting: human > agent > inferred
	if (origin === "human") score += 0.1
	else if (origin === "inferred") score -= 0.05

	// Staleness decay: penalize entries that haven't been accessed recently
	// and were created more than 30 days ago. Decay ramps up over time.
	if (date) {
		const daysSinceCreation = (Date.now() - new Date(`${date}T00:00:00`).getTime()) / 86400000
		const daysSinceLastAccess = lastAccessed
			? (Date.now() - new Date(lastAccessed).getTime()) / 86400000
			: daysSinceCreation

		// Only decay if entry is old AND hasn't been accessed recently
		if (daysSinceCreation > 30 && daysSinceLastAccess > 30) {
			const staleness = Math.min(1, (daysSinceLastAccess - 30) / 90) // 0→1 over 30-120 days
			score -= staleness * 0.2 // Max penalty: -0.2
		}
	}

	return Math.max(0, Math.min(1, score))
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

	// Preserve existing accessed count (field 8)
	const existingAccessed = ep.length > 8 ? parseInt(ep[8]) || 0 : 0
	const newAccessed = np.length > 8 ? parseInt(np[8]) || 0 : 0
	const accessed = Math.max(existingAccessed, newAccessed)

	// Merge links (union)
	const existingLinks = (ep[9] || "").split(/[\s;]+/).filter(Boolean)
	const newLinks = (np[9] || "").split(/[\s;]+/).filter(Boolean)
	const mergedLinks = [...new Set([...existingLinks, ...newLinks])].join(" ")

	// Take max confidence — handle entries with <12 fields gracefully
	const existingConf = ep.length > 11 ? parseFloat(ep[11]) || 0 : 0
	const newConf = np.length > 11 ? parseFloat(np[11]) || 0 : 0
	const confidence = Math.max(existingConf, newConf)

	// Take most recent lastAccessed (field 12)
	const existingLastAccessed = ep.length > 12 ? ep[12] || "" : ""
	const newLastAccessed = np.length > 12 ? np[12] || "" : ""
	const lastAccessed = newLastAccessed > existingLastAccessed ? newLastAccessed : existingLastAccessed

	// Take max priority (field 13)
	const existingPriority = ep.length > 13 ? parseInt(ep[13]) || 0 : 0
	const newPriority = np.length > 13 ? parseInt(np[13]) || 0 : 0
	const priority = Math.max(existingPriority, newPriority)

	const quality = qualityScore(mergedTags, mergedLinks, content, date, accessed, lastAccessed)

	// Merge new fields: path_scope (field 14), origin (field 15), status (field 16)
	const existingScope = ep.length > 14 ? ep[14] || "" : ""
	const newScope = np.length > 14 ? np[14] || "" : ""
	const path_scope = newScope || existingScope

	const existingOrigin = ep.length > 15 ? ep[15] || "" : ""
	const newOrigin = np.length > 15 ? np[15] || "" : ""
	const originRank: Record<string, number> = { human: 3, agent: 2, inferred: 1 }
	const origin = (originRank[newOrigin] || 0) >= (originRank[existingOrigin] || 0) ? newOrigin : existingOrigin

	const existingStatus = ep.length > 16 ? ep[16] || "" : ""
	const newStatus = np.length > 16 ? np[16] || "" : ""
	const status = newStatus === "active" || existingStatus === "active" ? "active" : newStatus || existingStatus || "active"

	return `${id}|${category}|${key}|${content}|${file}|${mergedTags}|${date}|${ttl}|${accessed}|${mergedLinks}|${quality.toFixed(2)}|${confidence}|${lastAccessed}|${priority}|${path_scope}|${origin}|${status}`
}

/**
 * Unified recall: BM25 + graph traversal + quality + decay in one call.
 * The LLM calls this at the start of a task to get everything it needs.
 */
export function generateSmartRecall(
	data: string,
	intent: string,
	opts: { limit?: number; category?: string; bumpAccess?: (ids: string[]) => void; fileMtimes?: Map<string, string>; sessionFiles?: string[] } = {}
): string {
	const entries = parseEntries(data)
	if (entries.length === 0) return "Empty memory."

	const { adjacency } = buildGraph(entries)
	const bm25 = bm25Scores(entries, intent)
	const cent = centrality(adjacency)
	const limit = opts.limit ?? 8
	const category = opts.category || ""
	const mtimes = opts.fileMtimes

	const qTokens = tokenize(intent)
	const expandedTokens = expandSynonyms(qTokens)

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
			const docTokens = text.split(" ")
			const exactMatch = qTokens.length === 0 || expandedTokens.some((t) => text.includes(t))
			const fuzzy = !exactMatch && qTokens.length > 0 && fuzzyMatch(qTokens, docTokens)
			const matchesQuery = exactMatch || fuzzy
			const bm25Score = bm25.get(e.key) || 0
			const centScore = cent.get(e.key) || 0
			const impScore = importance(e)
			// Drift penalty: if the linked file was modified after the entry was created
			let drift = 0
			if (mtimes && e.file) {
				const filePath = e.file.split(":")[0]
				const fileDate = mtimes.get(filePath)
				if (fileDate && e.date && fileDate > e.date) drift = 0.3
			}
			// Session bias: boost entries matching current session files
			let sessionBias = 0
			if (opts.sessionFiles && opts.sessionFiles.length > 0 && e.file) {
				const entryFile = e.file.split(":")[0]
				if (opts.sessionFiles.some((f) => f === entryFile)) {
					sessionBias = 0.15
				}
			}
			const combined =
				bm25Score + 0.3 * centScore + 0.3 * impScore + (matchesQuery ? 0.5 : 0) - drift + sessionBias
			return { entry: e, score: combined, matchesQuery, priority: e.priority }
		})
		.filter((x) => x.score > 0 || x.matchesQuery)
		.sort((a, b) => {
			if (a.priority !== b.priority) return b.priority - a.priority
			return b.score - a.score
		})
		.slice(0, limit)

	// Inject pinned entries not already in the result set, sorted by priority desc.
	const pinnedKeys = new Set(entries.filter((e) => e.priority > 0).map((e) => e.key))
	const inResult = new Set(scored.map((x) => x.entry.key))
	const toInject = [...pinnedKeys]
		.filter((k) => !inResult.has(k))
		.map((k) => entries.find((en) => en.key === k)!)
		.filter(Boolean)
		.sort((a, b) => b.priority - a.priority)
	for (const e of toInject) {
		scored.unshift({ entry: e, score: 999, matchesQuery: false, priority: e.priority })
	}

	if (scored.length === 0) {
		const top = entries
			.filter((e) => !category || e.category === category)
			.sort((a, b) => {
				if (a.priority !== b.priority) return b.priority - a.priority
				return importance(b) - importance(a)
			})
			.slice(0, limit)
		if (top.length === 0) return "No entries in memory."
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
	if (entries.length === 0) return "Empty memory. No entries saved."

	const byCategory: Record<string, GraphEntry[]> = {}
	for (const e of entries) {
		if (isPrivate(e)) continue
		if (!byCategory[e.category]) byCategory[e.category] = []
		byCategory[e.category].push(e)
	}

	const lines: string[] = [
		"=== System Primer ===",
		`Entries: ${entries.length}`,
		"",
	]

	// Pinned entries first, then top by importance
	const top = [...entries]
		.filter((e) => !isPrivate(e))
		.sort((a, b) => {
			if (a.priority !== b.priority) return b.priority - a.priority
			return importance(b) - importance(a)
		})
		.slice(0, 5)
	lines.push("Top memories:")
	for (const e of top) {
		const quality = qualityScore(
			e.tags.join(";"),
			e.links.join(" "),
			e.content,
			e.date,
			e.accessed,
			e.lastAccessed
		)
		const conf = quality >= 0.5 ? "high" : quality >= 0.3 ? "medium" : "low"
		const pin = e.priority > 0 ? (e.priority > 1 ? ` 📌${e.priority}` : " 📌") : ""
		lines.push(
			`  [${e.category}] ${e.key}${pin} — ${e.content.slice(0, 80)} (quality: ${conf})`
		)
	}
	lines.push("")

	// Categories
	lines.push("Categories:")
	for (const [cat, items] of Object.entries(byCategory)) {
		lines.push(`  ${cat}: ${items.length}`)
	}
	lines.push("")

	// Rules (mandatory patterns)
	const patterns = entries.filter((e) => e.category === "pattern")
	if (patterns.length > 0) {
		lines.push("Established patterns:")
		for (const p of patterns.slice(0, 5)) {
			lines.push(`  • ${p.key}: ${p.content.slice(0, 100)}`)
		}
	}

	return lines.join("\n")
}
