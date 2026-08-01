/**
 * Shared helper functions used across lib/ modules.
 * Eliminates copy-paste duplication of normalize, isExpiredLocal, importance, tokenize.
 */

export const normalize = (s: string): string =>
	s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()

export const isExpiredLocal = (ttl: string): boolean => {
	if (!ttl) return false
	const today = new Date().toISOString().split("T")[0]
	return ttl <= today
}

/** Lightweight importance score: recency (60%) + frequency (40%). */
export function importance(e: { date: string; accessed: number }): number {
	const today = new Date().toISOString().split("T")[0]
	const days =
		(Date.now() - new Date(`${e.date || today}T00:00:00`).getTime()) / 86400000
	const recency = Math.min(1, Math.max(0, 30 - days) / 30)
	const freq = Math.min(1, e.accessed / 5)
	return recency * 0.6 + freq * 0.4
}

export const tokenize = (s: string): string[] =>
	s
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/[-_]/g, " ")
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean)

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
