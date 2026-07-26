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
	const recency = Math.max(0, 30 - days) / 30
	const freq = Math.min(1, e.accessed / 5)
	return recency * 0.6 + freq * 0.4
}

export const tokenize = (s: string): string[] => normalize(s).split(" ").filter(Boolean)
