import { readMemory, writeMemory } from "./memory-io"
import { normalize, importance } from "../lib/utils"

/**
 * Importance score for an entry: blends recency and access frequency.
 * Delegates to shared importance() in lib/utils.
 */
export function entryScore(dateStr: string, accessed: number): number {
  return importance({ date: dateStr, accessed })
}

export function entryScoreForLine(line: string): number {
  const parts = line.trim().split("|")
  const date = parts[6] || new Date().toISOString().split("T")[0]
  const accessed = parts.length > 8 ? parseInt(parts[8]) || 0 : 0
  return entryScore(date, accessed)
}

/**
 * Find entries related to the given text by fuzzy matching.
 * Returns top N results ranked by match quality.
 */
export function findRelatedEntries(text: string, excludeKey: string = "", limit: number = 3): Array<{ id: string; cat: string; key: string; content: string; file: string; tags: string; date: string; score: number }> {
  const data = readMemory()
  const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
  const queryTokens = normalize(text).split(" ").filter(Boolean)

  const scored = lines
    .map((line) => {
      const trimmed = line.trim()
      const parts = trimmed.split("|")
      if (parts.length < 7) return null
      const [id, cat, key, content, file, tags, date] = parts
      if (key === excludeKey) return null
      const searchStr = normalize(`${id} ${cat} ${key} ${content} ${file} ${tags}`)
      let score = 0
      for (const token of queryTokens) {
        if (searchStr.includes(token)) score++
      }
      if (score === 0) return null
      return { id, cat, key, content, file, tags, date, score }
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, limit)

  return scored as Array<{ id: string; cat: string; key: string; content: string; file: string; tags: string; date: string; score: number }>
}

/**
 * Increment the `accessed` counter and update `lastAccessed` timestamp
 * for the given entry ids. Used by recall/suggest so frequently-used
 * memories rank higher.
 */
export function bumpAccessed(ids: string[]): void {
  if (ids.length === 0) return
  const idSet = new Set(ids)
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) return

  const now = new Date().toISOString()
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    if (line.startsWith("  summaries:")) break
    const parts = line.trim().split("|")
    if (idSet.has(parts[0])) {
      const accessed = parts.length > 8 ? (parseInt(parts[8]) || 0) + 1 : 1
      parts[8] = String(accessed)
      // Ensure we have enough fields for lastAccessed (field 12)
      while (parts.length < 13) parts.push("")
      parts[12] = now
      lines[i] = `  ${parts.join("|")}`
    }
  }
  writeMemory(lines.join("\n"))
}
