/**
 * Context briefing generator for toon-memory.
 *
 * Combines multiple data sources (memory entries, sessions, git state,
 * health checks) into a single compact markdown string — zero LLM calls,
 * pure deterministic logic. The agent calls one tool instead of 5-6
 * separate memory_* calls, saving tokens on both sides.
 *
 * Design principles:
 *   - No LLM, no network, no embeddings
 *   - Output targets ~200-400 tokens (compact by default)
 *   - Reuses graph, quality, and sessions library modules
 *   - All data is read-only — no mutations
 */

import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { parseEntries, buildGraph, bm25Scores, centrality, renderCompact, type GraphEntry } from "./graph"
import { qualityScore } from "./quality"
import { coordinationView, currentBranch, pruneSessions } from "./sessions"

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

// ── Section builders ────────────────────────────────────────────────

/**
 * Memory overview: entry count + category breakdown.
 * ~2-3 lines, ~30 tokens.
 */
function formatOverview(data: string): string {
	const entries = parseEntries(data)
	if (entries.length === 0) return "Memoria: vacía"

	const byCategory: Record<string, number> = {}
	let expired = 0
	for (const e of entries) {
		byCategory[e.category] = (byCategory[e.category] || 0) + 1
		if (e.ttl && isExpiredLocal(e.ttl)) expired++
	}

	const cats = Object.entries(byCategory)
		.map(([k, v]) => `${k}:${v}`)
		.join(" ")
	const ttlNote = expired > 0 ? ` | ${expired} expiradas` : ""

	return `## Memoria (${entries.length} entradas)${ttlNote}\n${cats}`
}

/**
 * Relevant entries for a task: smart recall using BM25 + centrality + importance.
 * Skipped when task is empty (general briefing mode).
 */
function formatRelevantEntries(data: string, task: string, limit: number = 6): string {
	const entries = parseEntries(data)
	if (entries.length === 0) return ""

	const { adjacency, byKey } = buildGraph(entries)
	const bm25 = bm25Scores(entries, task)
	const cent = centrality(adjacency)
	const qTokens = tokenize(task)

	const scored = entries
		.filter((e) => !(e.ttl && isExpiredLocal(e.ttl)))
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

	if (scored.length === 0) return ""

	// Build a compact subgraph for edge rendering
	const selectedKeys = new Set(scored.map((x) => x.entry.key))
	const subAdj = new Map<string, string[]>()
	for (const x of scored) {
		const nb = (adjacency.get(x.entry.key) || []).filter((k) => selectedKeys.has(k))
		if (nb.length) subAdj.set(x.entry.key, nb)
	}

	const seeds = new Set(scored.filter((x) => x.matchesQuery).map((x) => x.entry.key))
	const rendered = renderCompact(
		scored.map((x) => x.entry),
		{ adjacency: subAdj, seeds, snippetLen: 80 }
	)

	return `## Entradas relevantes\n${rendered}`
}

/**
 * Top patterns/rules from memory. These are mandatory conventions the agent
 * must follow. Limited to 5 for token efficiency.
 */
function formatPatterns(data: string): string {
	const entries = parseEntries(data)
	const patterns = entries
		.filter((e) => e.category === "pattern")
		.sort((a, b) => importance(b) - importance(a))
		.slice(0, 5)

	if (patterns.length === 0) return ""

	const lines = patterns.map(
		(e) => `- **${e.key}**: ${e.content.slice(0, 120)}`
	)
	return `## Patrones establecidos\n${lines.join("\n")}`
}

/**
 * Active sessions and soft conflicts. ~3-5 lines.
 */
function formatSessions(): string {
	pruneSessions()
	const { active, conflicts } = coordinationView()
	const branch = currentBranch()

	if (active.length === 0 && conflicts.length === 0) {
		return `## Sesiones\nRama: ${branch} | Sin otras sesiones activas`
	}

	const lines: string[] = [`## Sesiones (${active.length} activa${active.length !== 1 ? "s" : ""}) —rama: ${branch}`]

	for (const s of active.slice(0, 5)) {
		const mins = Math.max(0, Math.round(s.ageMs / 60000))
		const files = Object.keys(s.files).length
		lines.push(`- ${s.agent}@${s.branch} (${mins}min, ${files} archivos)`)
	}

	if (conflicts.length > 0) {
		lines.push("", `**Conflictos suaves (${conflicts.length}):**`)
		for (const c of conflicts.slice(0, 3)) {
			const who = c.sessions.map((s) => s.agent).join(" + ")
			lines.push(`- ${c.file} ↔ ${who}`)
		}
	}

	return lines.join("\n")
}

/**
 * Health warnings: expired entries, high entry count, etc.
 * Only included when there are actual warnings.
 */
function formatHealth(data: string): string {
	const entries = parseEntries(data)
	const warnings: string[] = []

	const expired = entries.filter((e) => e.ttl && isExpiredLocal(e.ttl))
	if (expired.length > 0) {
		warnings.push(`${expired.length} entradas con TTL expirado (ejecutar memory_archive)`)
	}

	if (entries.length > 80) {
		warnings.push(`${entries.length} entradas (cerca del límite de 100, auto-archive se activará)`)
	}

	const orphanLinks = findOrphanLinks(entries)
	if (orphanLinks.length > 0) {
		warnings.push(`${orphanLinks.length} links huérfanos: ${orphanLinks.slice(0, 3).join(", ")}`)
	}

	if (warnings.length === 0) return ""

	return `## Salud\n⚠️ ${warnings.join("\n⚠️ ")}`
}

/**
 * Find links that reference non-existent keys.
 */
function findOrphanLinks(entries: GraphEntry[]): string[] {
	const keys = new Set(entries.map((e) => e.key))
	const orphans: string[] = []
	for (const e of entries) {
		for (const link of e.links) {
			if (!keys.has(link)) orphans.push(`${e.key}->${link}`)
		}
	}
	return orphans
}

// ── Main entry point ────────────────────────────────────────────────

export interface ContextBriefOpts {
	/** When provided, entries are ranked by relevance to this task. */
	task?: string
	/** Max entries in the relevant-entries section. Default 6. */
	limit?: number
}

/**
 * Generate a single context briefing from memory + sessions + health.
 *
 * Zero LLM calls. The output is a compact markdown string (~200-400 tokens)
 * that the agent can inject directly into its context window.
 *
 * Two modes:
 *   - **task mode** (task provided): entries ranked by relevance to the task,
 *     plus overview, sessions, patterns, and health warnings.
 *   - **general mode** (no task): top entries by importance, plus overview,
 *     sessions, patterns, and health warnings.
 */
export function generateContextBrief(data: string, opts: ContextBriefOpts = {}): string {
	const sections: string[] = []

	// 1. Overview (always included)
	sections.push(formatOverview(data))

	// 2. Relevant entries (task mode) or top entries (general mode)
	if (opts.task) {
		const relevant = formatRelevantEntries(data, opts.task, opts.limit)
		if (relevant) sections.push(relevant)
	} else {
		const top = formatTopEntries(data, opts.limit ?? 6)
		if (top) sections.push(top)
	}

	// 3. Patterns (always if present)
	sections.push(formatPatterns(data))

	// 4. Sessions (always)
	sections.push(formatSessions())

	// 5. Health warnings (only when relevant)
	sections.push(formatHealth(data))

	return sections.filter(Boolean).join("\n\n")
}

/**
 * Top entries by importance (general mode fallback).
 */
function formatTopEntries(data: string, limit: number): string {
	const entries = parseEntries(data)
	if (entries.length === 0) return ""

	const top = [...entries]
		.filter((e) => !(e.ttl && isExpiredLocal(e.ttl)))
		.sort((a, b) => importance(b) - importance(a))
		.slice(0, limit)

	if (top.length === 0) return ""

	const rendered = renderCompact(top)
	return `## Top memorias\n${rendered}`
}
