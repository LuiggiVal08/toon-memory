/**
 * Shared helper functions used across lib/ modules.
 * Eliminates copy-paste duplication of normalize, isExpiredLocal, importance, tokenize.
 */

export const normalize = (s: string): string =>
	s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()

export const isExpiredLocal = (ttl: string, today = new Date().toISOString().split("T")[0]): boolean => {
	if (!ttl) return false
	return ttl <= today
}

/** Lightweight importance score: recency (60%) + frequency (40%). */
export function importance(
	e: { date: string; accessed: number },
	today = new Date().toISOString().split("T")[0]
): number {
	const days =
		(Date.parse(`${today}T00:00:00`) - Date.parse(`${e.date || today}T00:00:00`)) / 86400000
	const recency = Math.min(1, Math.max(0, 30 - days) / 30)
	const freq = Math.min(1, e.accessed / 5)
	return recency * 0.6 + freq * 0.4
}

/** Explicit importance levels, highest to lowest. Empty string = auto (no boost). */
export const IMPORTANCE_LEVELS = ["critical", "high", "medium", "low"] as const
export type ImportanceLevel = (typeof IMPORTANCE_LEVELS)[number]

/** Ranking boost for an explicit importance level. Auto (empty) = 0. */
export const IMPORTANCE_BOOST: Record<ImportanceLevel, number> = {
	critical: 0.3,
	high: 0.15,
	medium: 0,
	low: -0.1,
}

/** Map an explicit importance level to its ranking boost (empty/unknown = 0). */
export const importanceBoost = (level: string): number =>
	IMPORTANCE_BOOST[level as ImportanceLevel] ?? 0

/** Rank order for merging: higher value wins. Empty (auto) counts as medium. */
export const importanceRank = (level: string): number => {
	if (level === "critical") return 4
	if (level === "high") return 3
	if (level === "low") return 1
	return 2 // medium or auto
}

export const tokenize = (s: string): string[] =>
	s
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/[-_]/g, " ")
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean)

/**
 * Deterministic token estimate for a text: roughly one token per 4 chars,
 * plus one per whitespace run. No LLM — good enough to budget recall output.
 */
export const estimateTokens = (s: string): number => {
	if (!s) return 0
	const chars = Math.ceil(s.length / 4)
	const words = (s.match(/\S+/g) || []).length
	return Math.max(1, chars + words)
}

/**
 * Language-family detection via character ranges. Deterministic, no libraries.
 * Returns "latin" for ASCII/EU languages, "cjk" for CJK, "cyrillic", "arabic",
 * "greek", "hebrew", "devanagari", or "other".
 */
export const languageFamily = (s: string): string => {
	let cjk = 0, cyr = 0, arab = 0, greek = 0, hebrew = 0, deva = 0, latin = 0, total = 0
	for (const ch of s) {
		const c = ch.codePointAt(0)!
		if (!/[\p{L}]/u.test(ch)) continue
		total++
		if (c >= 0x4e00 && c <= 0x9fff || c >= 0x3040 && c <= 0x30ff || c >= 0xac00 && c <= 0xd7af) cjk++
		else if (c >= 0x0400 && c <= 0x04ff) cyr++
		else if (c >= 0x0600 && c <= 0x06ff) arab++
		else if (c >= 0x0370 && c <= 0x03ff) greek++
		else if (c >= 0x0590 && c <= 0x05ff) hebrew++
		else if (c >= 0x0900 && c <= 0x097f) deva++
		else latin++
	}
	if (total === 0) return "none"
	if (cjk / total > 0.3) return "cjk"
	if (cyr / total > 0.3) return "cyrillic"
	if (arab / total > 0.3) return "arabic"
	if (greek / total > 0.3) return "greek"
	if (hebrew / total > 0.3) return "hebrew"
	if (deva / total > 0.3) return "devanagari"
	return "latin"
}

/**
 * Escape a field for the pipe-delimited TOON format. Literal newlines, pipes and
 * backslashes would otherwise break line-based parsing (a multi-line content turns
 * each continuation line into a bogus entry), so they are stored as `\n`, `\|` and
 * `\\` to keep the encoding reversible.
 */
export const escField = (s: string): string => {
	let out = ""
	for (let i = 0; i < s.length; i++) {
		const c = s[i]
		if (c === "\\") out += "\\\\"
		else if (c === "\n") out += "\\n"
		else if (c === "\r") {
			out += "\\n"
			if (s[i + 1] === "\n") i++
		} else if (c === "|") out += "\\|"
		else out += c
	}
	return out
}

/** Inverse of `escField`: `\\n` -> newline, `\\|` -> pipe, `\\\\` -> backslash. */
export const unescField = (s: string): string => {
	let out = ""
	for (let i = 0; i < s.length; i++) {
		const c = s[i]
		if (c === "\\" && i + 1 < s.length) {
			const n = s[i + 1]
			if (n === "n") {
				out += "\n"
				i++
			} else if (n === "|") {
				out += "|"
				i++
			} else if (n === "\\") {
				out += "\\"
				i++
			} else out += c
		} else out += c
	}
	return out
}

/** Split a stored TOON line into unescaped fields (`\|` is not a delimiter). */
export const parseToonLine = (line: string): string[] => {
	const parts: string[] = []
	let cur = ""
	let escaped = false
	for (const c of line.trim()) {
		if (escaped) {
			cur += c
			escaped = false
			continue
		}
		if (c === "\\") {
			cur += c
			escaped = true
			continue
		}
		if (c === "|") {
			parts.push(unescField(cur))
			cur = ""
			continue
		}
		cur += c
	}
	if (escaped) cur += "\\"
	parts.push(unescField(cur))
	return parts
}

/** Serialize raw fields into a stored TOON line (escapes newlines, pipes, backslashes). */
export const toToonLine = (parts: string[]): string =>
	`  ${parts.map(escField).join("|")}`

/** Check if an entry is marked as private (excluded from context injection). */
export const isPrivate = (e: { tags: string[] }): boolean =>
	e.tags.some((t) => t.toLowerCase() === "private")
