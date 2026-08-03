/**
 * Evidence layer for memory writes (write-path intelligence).
 *
 * Deterministic, offline, no LLM. When an entry is saved it is annotated with
 * one of three evidence levels that bias recall:
 *
 *   - "conflict"  — the new entry overlaps a `warning` or a critical/high
 *                   decision already in memory. Surfaces (+0.15) so the agent
 *                   re-checks before trusting the newer claim.
 *   - "verified"  — the entry references a file that actually exists on disk
 *                   (grounded in the repo). Small boost (+0.03).
 *   - "unverified" — neither. Slight penalty (−0.02).
 *
 * Contradiction detection is a Jaccard overlap against strong entries only
 * (warnings and critical/high importance). It never blocks a write — the
 * remember tool just warns so the agent can review.
 */

import { existsSync } from "fs"
import { tokenize } from "./utils"
import type { GraphEntry } from "./graph"

/** Evidence levels stored as the 20th TOON field. Empty = legacy entry or no file claim. */
export type Evidence = "" | "verified" | "unverified" | "conflict"

/** Ranking boost per evidence level. Empty/unknown = 0. */
export const EVIDENCE_BOOST: Record<string, number> = {
	conflict: 0.15,
	verified: 0.03,
	unverified: -0.02,
}

/** Evidence of a potential contradiction with an existing strong entry. */
export interface Contradiction {
	key: string
	category: string
	similarity: number
	note: string
}

/** Token-set Jaccard similarity (0..1) over key + content + tags. */
export function contentJaccard(a: string, b: string): number {
	const sa = new Set(tokenize(a))
	const sb = new Set(tokenize(b))
	if (sa.size === 0 && sb.size === 0) return 1
	if (sa.size === 0 || sb.size === 0) return 0
	let inter = 0
	for (const t of sa) if (sb.has(t)) inter++
	const union = sa.size + sb.size - inter
	return union > 0 ? inter / union : 0
}

interface Candidate {
	key: string
	content: string
	category: string
	tags: string[]
}

/**
 * Find entries that may contradict the candidate. Only "strong" entries are
 * considered targets: warnings (negative memories) and critical/high
 * importance decisions. Thresholds are looser for warnings (a landmine must
 * surface) than for critical decisions (which need real overlap).
 * Deterministic — sorted by similarity, capped at 3 hits.
 */
export function detectContradictions(
	entries: GraphEntry[],
	candidate: Candidate
): Contradiction[] {
	const candText = `${candidate.key} ${candidate.content} ${candidate.tags.join(" ")}`
	const hits: Contradiction[] = []

	for (const e of entries) {
		if (e.status === "obsolete" || e.status === "draft") continue
		if (e.key === candidate.key) continue
		const strong = e.category === "warning" || e.importance === "critical" || e.importance === "high"
		if (!strong) continue

		const sim = contentJaccard(candText, `${e.key} ${e.content} ${e.tags.join(" ")}`)
		if (e.category === "warning" && sim < 0.22) continue
		if (e.category !== "warning" && sim < 0.3) continue

		hits.push({
			key: e.key,
			category: e.category,
			similarity: Math.round(sim * 100),
			note:
				e.category === "warning"
					? "overlaps a WARNING (negative memory) — possible landmine"
					: "may contradict an existing critical/high decision",
		})
	}

	return hits.sort((a, b) => b.similarity - a.similarity).slice(0, 3)
}

/**
 * Compute the evidence level for a candidate being saved.
 *   - "conflict" when it contradicts a strong entry,
 *   - "verified" when its referenced file exists on disk,
 *   - "unverified" when it claims a file that does not exist (broken reference),
 *   - "" (neutral) when no file is claimed.
 */
export function evidenceFor(
	entries: GraphEntry[],
	candidate: Candidate,
	file?: string
): Evidence {
	const conflicts = detectContradictions(entries, candidate)
	if (conflicts.length > 0) return "conflict"
	if (!file) return ""
	const filePath = file.split(":")[0]
	return existsSync(filePath) ? "verified" : "unverified"
}

/** Ranking boost for an entry's stored evidence (empty/unknown = 0). */
export const evidenceBoost = (evidence: string): number => EVIDENCE_BOOST[evidence] ?? 0
