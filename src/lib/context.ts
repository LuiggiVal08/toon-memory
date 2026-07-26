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
import { normalize, isExpiredLocal, tokenize, importance } from "./utils"
import { coordinationView, currentBranch, pruneSessions, listSessions } from "./sessions"
import { readRecentCommits, gitStatusSummary, readGitIndex } from "./git"
import { scanProjectStructure, readManifest, readEnvExample } from "./project-scan"
import { findFilesByPattern, searchCode, findCallers } from "./code-search"

// ── Section builders ────────────────────────────────────────────────

/**
 * Memory overview: entry count + category breakdown.
 * ~2-3 lines, ~30 tokens.
 */
function formatOverview(data: string): string {
	const entries = parseEntries(data)
	if (entries.length === 0) return "Memory: empty"

	const byCategory: Record<string, number> = {}
	let expired = 0
	for (const e of entries) {
		byCategory[e.category] = (byCategory[e.category] || 0) + 1
		if (e.ttl && isExpiredLocal(e.ttl)) expired++
	}

	const cats = Object.entries(byCategory)
		.map(([k, v]) => `${k}:${v}`)
		.join(" ")
	const ttlNote = expired > 0 ? ` | ${expired} expired` : ""

	return `## Memory (${entries.length} entries)${ttlNote}\n${cats}`
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

	return `## Relevant entries\n${rendered}`
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
	return `## Established patterns\n${lines.join("\n")}`
}

/**
 * Active sessions and soft conflicts. ~3-5 lines.
 */
function formatSessions(): string {
	pruneSessions()
	const { active, conflicts } = coordinationView()
	const branch = currentBranch()

	if (active.length === 0 && conflicts.length === 0) {
		return `## Sessions\nBranch: ${branch} | No other active sessions`
	}

	const lines: string[] = [`## Sessions (${active.length} active) — branch: ${branch}`]

	for (const s of active.slice(0, 5)) {
		const mins = Math.max(0, Math.round(s.ageMs / 60000))
		const files = Object.keys(s.files).length
		lines.push(`- ${s.agent}@${s.branch} (${mins}min, ${files} files)`)
	}

	if (conflicts.length > 0) {
		lines.push("", `**Soft conflicts (${conflicts.length}):**`)
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
		warnings.push(`${expired.length} entries with expired TTL (run memory_archive)`)
	}

	if (entries.length > 80) {
		warnings.push(`${entries.length} entries (near limit of 100, auto-archive will trigger)`)
	}

	const orphanLinks = findOrphanLinks(entries)
	if (orphanLinks.length > 0) {
		warnings.push(`${orphanLinks.length} orphan links: ${orphanLinks.slice(0, 3).join(", ")}`)
	}

	if (warnings.length === 0) return ""

	return `## Health\n⚠️ ${warnings.join("\n⚠️ ")}`
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
	return `## Top memories\n${rendered}`
}

// ── context_generate ─────────────────────────────────────────────────

export interface ContextGenerateOpts {
	task?: string
}

/**
 * Full context briefing: project + git + memory → system prompt ready.
 * Reads the actual project filesystem, not just memory.
 * ~400-600 tokens. Zero LLM.
 */
export function generateContextGenerate(data: string, root: string, opts: ContextGenerateOpts = {}): string {
	const sections: string[] = []

	// 1. Project manifest
	const manifest = readManifest(root)
	if (manifest) {
		const deps = manifest.deps.length > 0 ? manifest.deps.slice(0, 15).join(", ") : "none"
		const version = manifest.version ? ` v${manifest.version}` : ""
		sections.push(`## Project\n${manifest.name}${version} (${manifest.language})\nDeps: ${deps}`)
	}

	// 2. Structure
	const structure = scanProjectStructure(root)
	if (structure.dirs.length > 0 || structure.rootFiles.length > 0) {
		const dirs = structure.dirs.length > 0 ? `Dirs: ${structure.dirs.join(", ")}` : ""
		const files = structure.rootFiles.length > 0 ? `Root: ${structure.rootFiles.slice(0, 10).join(", ")}` : ""
		const exts = Object.entries(structure.extensions)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([k, v]) => `${k}:${v}`)
			.join(" ")
		const src = `${structure.sourceFileCount} source files`
		const parts = [dirs, files, `${src} ${exts ? `(${exts})` : ""}`].filter(Boolean)
		if (parts.length > 0) sections.push(`## Structure\n${parts.join("\n")}`)
	}

	// 3. Environment variables
	const envVars = readEnvExample(root)
	if (envVars.length > 0) {
		const envLines = envVars.slice(0, 8).map((v) => `- ${v.name}${v.comment ? ` — ${v.comment}` : ""}`)
		sections.push(`## Env vars (${envVars.length})\n${envLines.join("\n")}`)
	}

	// 4. Git status
	const git = gitStatusSummary(root)
	if (git.branch !== "unknown") {
		const recent = git.recentCommits.slice(0, 3)
		const commitLines = recent.map((c) => `- ${c.shortHash} ${c.subject}`)
		const parts = [`Branch: ${git.branch}`, `Tracked files: ${git.trackedFiles}`]
		if (commitLines.length > 0) parts.push(`Recent commits:\n${commitLines.join("\n")}`)
		sections.push(`## Git\n${parts.join("\n")}`)
	}

	// 5. Memory overview + entries
	sections.push(formatOverview(data))
	if (opts.task) {
		const relevant = formatRelevantEntries(data, opts.task, 6)
		if (relevant) sections.push(relevant)
	} else {
		const top = formatTopEntries(data, 6)
		if (top) sections.push(top)
	}
	sections.push(formatPatterns(data))

	// 6. Sessions
	sections.push(formatSessions())

	// 7. Health
	sections.push(formatHealth(data))

	return sections.filter(Boolean).join("\n\n")
}

// ── context_diff ─────────────────────────────────────────────────────

/**
 * What changed since the last session: git commits + memory changes + touched files + session activity.
 * ~200-400 tokens. Zero LLM.
 */
export function generateContextDiff(data: string, root: string, since?: string): string {
	const sections: string[] = []

	// 1. Git commits
	const commits = readRecentCommits(10, root)
	if (commits.length > 0) {
		const cutoff = since || commits[0]?.date || ""
		const recent = cutoff
			? commits.filter((c) => c.date >= cutoff)
			: commits.slice(0, 5)
		if (recent.length > 0) {
			const lines = recent.map((c) => `- ${c.shortHash} (${c.date}) ${c.subject}`)
			sections.push(`## Git commits (${recent.length})\n${lines.join("\n")}`)
		}
	}

	// 2. Modified files from git index
	const tracked = readGitIndex(root)
	if (tracked.length > 0) {
		sections.push(`## Tracked files (${tracked.length})\n${tracked.slice(0, 20).join("\n")}`)
	}

	// 3. Memory changes (reuse existing diff logic)
	const entries = parseEntries(data)
	const today = new Date().toISOString().split("T")[0]
	const sinceDate = since || today
	const recentEntries = entries.filter((e) => e.date >= sinceDate)
	if (recentEntries.length > 0) {
		const created = recentEntries.filter((e) => e.date === today)
		const updated = recentEntries.filter((e) => e.date !== today)
		const parts: string[] = []
		if (created.length > 0) parts.push(`New: ${created.map((e) => e.key).join(", ")}`)
		if (updated.length > 0) parts.push(`Updated: ${updated.map((e) => e.key).join(", ")}`)
		if (parts.length > 0) sections.push(`## Memory (${recentEntries.length} changes)\n${parts.join("\n")}`)
	}

	// 4. Session activity with file details
	const { active, conflicts } = coordinationView()
	if (active.length > 0) {
		const lines = active.slice(0, 5).map((s) => {
			const mins = Math.max(0, Math.round(s.ageMs / 60000))
			const files = Object.keys(s.files)
			const fileList = files.length > 0 ? ` — ${files.slice(0, 3).join(", ")}${files.length > 3 ? ` +${files.length - 3}` : ""}` : ""
			return `- ${s.agent}@${s.branch} (${mins}min ago)${fileList}`
		})
		sections.push(`## Active sessions (${active.length})\n${lines.join("\n")}`)
	}

	// 5. Soft conflicts between sessions
	if (conflicts.length > 0) {
		const lines = conflicts.slice(0, 3).map((c) => {
			const who = c.sessions.map((s) => s.agent).join(" + ")
			return `- ${c.file} ↔ ${who}`
		})
		sections.push(`## Session conflicts (${conflicts.length})\n${lines.join("\n")}`)
	}

	if (sections.length === 0) return "No recent changes."
	return sections.filter(Boolean).join("\n\n")
}

// ── context_focus ────────────────────────────────────────────────────

export interface ContextFocusOpts {
	/** Max entries to include. Default 6. */
	limit?: number
}

/**
 * Hyper-focused context for a specific task: memory entries + related files + code references.
 * ~300-500 tokens. Zero LLM.
 */
export function generateContextFocus(data: string, root: string, task: string, opts: ContextFocusOpts = {}): string {
	const sections: string[] = []
	const limit = opts.limit ?? 6

	// 1. Relevant memory entries
	const relevant = formatRelevantEntries(data, task, limit)
	if (relevant) sections.push(relevant)

	// 2. Extract keywords and filenames from task
	const keywords = task.toLowerCase().split(/\s+/).filter((w) => w.length > 2)

	// Also extract file-like patterns (e.g. "auth.ts", "src/index.js")
	const filePatterns = task.toLowerCase().match(/[\w/.-]+\.[a-z]{1,4}/g) || []
	// Extract path-like patterns (e.g. "src/auth", "lib/utils")
	const pathPatterns = task.toLowerCase().match(/[\w/.-]+\/[\w/.-]+/g) || []

	// 3. Related files - search by keywords, file patterns, and path patterns
	const allFiles: string[] = []
	const searchTerms = [...keywords, ...filePatterns, ...pathPatterns]
	for (const kw of searchTerms) {
		allFiles.push(...findFilesByPattern(root, kw))
	}
	const uniqueFiles = [...new Set(allFiles)].slice(0, 10)
	if (uniqueFiles.length > 0) {
		sections.push(`## Related files\n${uniqueFiles.join("\n")}`)
	}

	// 4. Code references (callers and matches)
	for (const kw of keywords.slice(0, 3)) {
		const callers = findCallers(root, kw)
		if (callers.length > 0) {
			const lines = callers.slice(0, 5).map((c) => `${c.file}:${c.line} — ${c.content.slice(0, 80)}`)
			sections.push(`## References: ${kw}\n${lines.join("\n")}`)
		}
	}

	// 5. Related tests - search by keywords and file patterns
	const testFiles: string[] = []
	const testSearchTerms = [...keywords.slice(0, 2), ...filePatterns]
	for (const kw of testSearchTerms) {
		const tests = findFilesByPattern(root, ".test.")
			.filter((f) => f.toLowerCase().includes(kw))
		testFiles.push(...tests)
	}
	const uniqueTests = [...new Set(testFiles)].slice(0, 5)
	if (uniqueTests.length > 0) {
		sections.push(`## Existing tests\n${uniqueTests.join("\n")}`)
	}

	if (sections.length === 0) return `No context found for "${task}".`
	return sections.filter(Boolean).join("\n\n")
}

// ── context_health ───────────────────────────────────────────────────

export interface HealthReport {
	score: number
	warnings: string[]
	info: string[]
	critical: string[]
}

/**
 * Full health audit: orphan links, duplicates, missing quality, expired TTL, broken file refs.
 * Returns structured report + markdown string. Zero LLM.
 */
export function generateContextHealth(data: string, root: string): { report: HealthReport; markdown: string } {
	const entries = parseEntries(data)
	const critical: string[] = []
	const warnings: string[] = []
	const info: string[] = []
	let score = 100

	// 1. Orphan links
	const keys = new Set(entries.map((e) => e.key))
	const orphanLinks: string[] = []
	for (const e of entries) {
		for (const link of e.links) {
			if (!keys.has(link)) orphanLinks.push(`${e.key}->${link}`)
		}
	}
	if (orphanLinks.length > 0) {
		warnings.push(`${orphanLinks.length} orphan links: ${orphanLinks.slice(0, 5).join(", ")}`)
		score -= 5
	}

	// 2. Duplicate content
	const contentMap = new Map<string, string[]>()
	for (const e of entries) {
		const existing = contentMap.get(e.content) || []
		existing.push(e.key)
		contentMap.set(e.content, existing)
	}
	const duplicates: string[] = []
	for (const [_, keys] of contentMap) {
		if (keys.length > 1) duplicates.push(keys.join(" = "))
	}
	if (duplicates.length > 0) {
		warnings.push(`${duplicates.length} duplicate entries: ${duplicates.slice(0, 3).join("; ")}`)
		score -= 5
	}

	// 3. Never-accessed old entries (created >7d ago but never recalled = possibly stale)
	const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
	const staleNeverAccessed = entries.filter((e) => e.accessed === 0 && e.date < weekAgo)
	if (staleNeverAccessed.length > 0) {
		info.push(`${staleNeverAccessed.length} old entries never recalled (possibly stale)`)
		score -= 2
	}

	// 4. Expired TTL
	const expired = entries.filter((e) => e.ttl && isExpiredLocal(e.ttl))
	if (expired.length > 0) {
		info.push(`${expired.length} entries with expired TTL (auto-prune on next startup)`)
		score -= 3
	}

	// 5. Broken file refs
	const brokenFiles: string[] = []
	for (const e of entries) {
		if (e.file) {
			const filePath = e.file.split(":")[0]
			if (filePath && !existsSync(join(root, filePath))) {
				brokenFiles.push(`${e.key}: ${e.file}`)
			}
		}
	}
	if (brokenFiles.length > 0) {
		warnings.push(`${brokenFiles.length} refs to non-existent files: ${brokenFiles.slice(0, 3).join("; ")}`)
		score -= 5
	}

	// 6. Stale sessions
	const sessions = listSessions()
	const stale = sessions.filter((s) => !s.active && !s.ended)
	if (stale.length > 0) {
		info.push(`${stale.length} stale sessions (will be pruned automatically)`)
	}

	// 7. Entry count
	if (entries.length > 80) {
		warnings.push(`${entries.length} entries (near limit of 100)`)
		score -= 3
	} else if (entries.length === 0) {
		info.push("Empty memory")
	}

	score = Math.max(0, score)

	const report: HealthReport = { score, warnings, info, critical }

	// Build markdown
	const parts: string[] = [`## Memory Health: ${score >= 90 ? "✅" : score >= 70 ? "⚠️" : "❌"} ${score}/100`]

	if (critical.length > 0) {
		parts.push("", "### Critical", ...critical.map((w) => `- ${w}`))
	}
	if (warnings.length > 0) {
		parts.push("", "### Warnings", ...warnings.map((w) => `- ${w}`))
	}
	if (info.length > 0) {
		parts.push("", "### Info", ...info.map((i) => `- ${i}`))
	}

	return { report, markdown: parts.join("\n") }
}

// ── context_export ───────────────────────────────────────────────────

export type ExportFormat = "full" | "compact"

/**
 * Export memory as injectable markdown for other agents or sessions.
 * Zero LLM. Output is complete memory dump in readable format.
 */
export function generateContextExport(data: string, format: ExportFormat = "full"): string {
	const entries = parseEntries(data)
	const sections: string[] = []

	// Header
	const today = new Date().toISOString().split("T")[0]
	sections.push(`# toon-memory export\nDate: ${today} | Entries: ${entries.length}\n`)

	if (entries.length === 0) {
		sections.push("Empty memory.")
		return sections.join("\n")
	}

	// Group by category
	const byCategory: Record<string, GraphEntry[]> = {}
	for (const e of entries) {
		if (!byCategory[e.category]) byCategory[e.category] = []
		byCategory[e.category].push(e)
	}

	const categoryLabels: Record<string, string> = {
		decision: "Decisions",
		pattern: "Patterns",
		bug: "Bugs",
		knowledge: "Knowledge",
	}

	for (const [cat, items] of Object.entries(byCategory)) {
		const label = categoryLabels[cat] || cat
		sections.push(`## ${label} (${items.length})`)

		for (const e of items) {
			if (format === "compact") {
				sections.push(`- **${e.key}**: ${e.content.slice(0, 120)}`)
			} else {
				const tags = e.tags.length > 0 ? ` · tags: ${e.tags.join(";")}` : ""
				const links = e.links.length > 0 ? ` · links: ${e.links.join(", ")}` : ""
				const file = e.file ? ` · file: ${e.file}` : ""
				sections.push(`### ${e.key}\n${e.content}\n_${e.date}${tags}${file}${links}_`)
			}
		}
		sections.push("")
	}

	// Graph summary (full format only)
	if (format === "full") {
		const { adjacency } = buildGraph(entries)
		if (adjacency.size > 0) {
			const edges: string[] = []
			for (const [key, neighbors] of adjacency) {
				for (const n of neighbors) {
					if (key < n) edges.push(`${key} -> ${n}`)
				}
			}
		if (edges.length > 0) {
			sections.push(`## Graph (${edges.length} edges)`)
				sections.push(edges.slice(0, 20).join("\n"))
			}
		}
	}

	// Sessions snapshot
	const sessions = listSessions()
	if (sessions.length > 0) {
		const active = sessions.filter((s) => s.active)
		sections.push(`## Sessions (${active.length} active / ${sessions.length} total)`)
		for (const s of sessions.slice(0, 5)) {
			const status = s.active ? "🟢" : "⚪"
			sections.push(`- ${status} ${s.agent}@${s.branch} (${s.id})`)
		}
	}

	return sections.filter(Boolean).join("\n")
}
