/**
 * Deterministic character n-gram "embedding-lite" for toon-memory.
 *
 * No model, no weights, no network: hashes character n-grams (tri-grams by
 * default) of a text into a sparse 32-bit hash set, then measures overlap via
 * cosine. Captures exactly the lexical variation that token-level BM25 misses:
 *   - morphology:  "autotag" ≈ "auto tag"   (shared tri-grams)
 *   - plurals:     "plugin" ≈ "plugins"
 *   - derivations: "serialize" ≈ "serialization"
 *
 * Deterministic: FNV-1a is a fixed hash, so the same text always yields the
 * same vector. Offline: zero deps, zero model files. The whole module is
 * ~80 lines of pure JS.
 */

/** FNV-1a 32-bit hash. Deterministic, single pass, no collisions in practice
 *  for the tens-to-hundreds of n-grams per text we hash. */
export function fnv1a32(s: string): number {
	let h = 0x811c9dc5
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i)
		h = (h * 0x01000193) >>> 0
	}
	return h >>> 0
}

/**
 * Hash set of the character n-grams of a text.
 *
 * The text is split on whitespace and every token is padded with `^`/`$`
 * sentinels so boundary tri-grams (prefixes/suffixes) are captured:
 * "auto" → ^au aut uto o$, which overlaps heavily with "autotag".
 */
export function ngramHashes(text: string, n = 3): Set<number> {
	const out = new Set<number>()
	const tokens = text.split(/\s+/)
	for (const token of tokens) {
		if (!token) continue
		const padded = "^" + token + "$"
		for (let i = 0; i + n <= padded.length; i++) {
			out.add(fnv1a32(padded.slice(i, i + n)))
		}
	}
	return out
}

/** Cosine similarity between two n-gram hash sets. 0 when either is empty. */
export function ngramCosine(a: Set<number>, b: Set<number>): number {
	if (a.size === 0 || b.size === 0) return 0
	let inter = 0
	const [small, large] = a.size <= b.size ? [a, b] : [b, a]
	for (const h of small) if (large.has(h)) inter++
	return inter / Math.sqrt(a.size * b.size)
}

/** Per-entry n-gram cosine vs the query. Returns key → 0..1. */
export function ngramScores(
	entries: Array<{ key: string; id: string; category: string; content: string; file: string; tags: string[]; path_scope?: string }>,
	query: string
): Map<string, number> {
	const qHashes = ngramHashes(query)
	const out = new Map<string, number>()
	for (const e of entries) {
		const text = `${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(" ")} ${e.path_scope || ""}`
		out.set(e.key, ngramCosine(qHashes, ngramHashes(text)))
	}
	return out
}
