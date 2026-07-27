/**
 * Fuzzy token matching via Levenshtein distance.
 *
 * Handles typos and minor variations (e.g. "tiemout" ≈ "timeout").
 * Pure JS — zero dependencies, ~20 lines of core logic.
 */

/**
 * Levenshtein edit distance between two strings.
 * Classic DP approach, O(n*m) time, O(min(n,m)) space.
 */
export function levenshtein(a: string, b: string): number {
	const al = a.length
	const bl = b.length
	if (al === 0) return bl
	if (bl === 0) return al

	// Optimization: only keep two rows at a time
	let prev = new Array(bl + 1)
	let curr = new Array(bl + 1)
	for (let j = 0; j <= bl; j++) prev[j] = j

	for (let i = 1; i <= al; i++) {
		curr[0] = i
		for (let j = 1; j <= bl; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1
			curr[j] = Math.min(
				prev[j] + 1,      // deletion
				curr[j - 1] + 1,  // insertion
				prev[j - 1] + cost // substitution
			)
		}
		;[prev, curr] = [curr, prev]
	}
	return prev[bl]
}

/**
 * Check if any query token fuzzy-matches any document token
 * within the given Levenshtein distance.
 *
 * Short-circuits on first match for speed.
 */
export function fuzzyMatch(
	queryTokens: string[],
	docTokens: string[],
	maxDistance: number = 2
): boolean {
	for (const qt of queryTokens) {
		// Skip very short tokens (1-2 chars) — too many false positives
		if (qt.length <= 2) continue
		for (const dt of docTokens) {
			if (Math.abs(qt.length - dt.length) > maxDistance) continue
			if (levenshtein(qt, dt) <= maxDistance) return true
		}
	}
	return false
}
