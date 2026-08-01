import { readMemory, writeMemory } from "./memory-io"
import { mergeEntries } from "../lib/quality"
import { parseToonLine } from "../lib/utils"

/**
 * Jaccard similarity between two content strings (0..1).
 * Normalizes whitespace and case before comparing word sets.
 */
function contentSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().replace(/\s+/g, " ").trim().split(" "))
  const wordsB = new Set(b.toLowerCase().replace(/\s+/g, " ").trim().split(" "))
  if (wordsA.size === 0 && wordsB.size === 0) return 1
  if (wordsA.size === 0 || wordsB.size === 0) return 0
  let intersection = 0
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++
  }
  const union = wordsA.size + wordsB.size - intersection
  return union > 0 ? intersection / union : 0
}

/** Threshold for near-duplicate detection (0..1). */
const NEAR_DUP_THRESHOLD = 0.7

/**
 * Deterministic consolidation: merge entries with the same key (combining
 * tags, links, max confidence, latest date), then remove exact-content
 * duplicates and merge near-duplicates (similarity > 0.7). No LLM involved.
 */
export function consolidateEntries(): { removed: number; kept: number; duplicates: string[] } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) return { removed: 0, kept: 0, duplicates: [] }

  const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && !l.startsWith("  summaries:"))

  // Phase 1: Merge entries with the same key
  const byKey = new Map<number, string>()
  const keyOrder: number[] = []
  const mergedAway: number[] = []

  for (let i = 0; i < entryLines.length; i++) {
    const line = entryLines[i].trim()
    const parts = parseToonLine(line)
    if (parts.length < 3) continue
    const key = parts[2]
    const existingIdx = keyOrder.findIndex((idx) => {
      const ep = parseToonLine(entryLines[idx])
      return ep[2] === key
    })
    if (existingIdx !== -1) {
      const mergedLine = mergeEntries(byKey.get(keyOrder[existingIdx])!, line)
      byKey.set(keyOrder[existingIdx], mergedLine)
      mergedAway.push(i)
    } else {
      byKey.set(i, line)
      keyOrder.push(i)
    }
  }

  // Phase 2: Remove exact-content duplicates AND merge near-duplicates
  const contentSeen = new Map<string, { line: string; idx: number }>()
  const order: string[] = []
  const duplicates: string[] = []

  for (const idx of keyOrder) {
    const line = byKey.get(idx)!
    const parts = parseToonLine(line)
    if (parts.length < 3) {
      order.push(line)
      continue
    }
    const content = parts[3] || ""
    const normalized = content.toLowerCase().replace(/\s+/g, " ").trim()

    // Check for exact duplicate first
    if (contentSeen.has(normalized)) {
      duplicates.push(parts[2])
      continue
    }

    // Check for near-duplicate (same category, similar content)
    let merged = false
    for (const [seenNorm, existing] of contentSeen) {
      const existingParts = parseToonLine(existing.line)
      if (existingParts[1] !== parts[1]) continue // different category
      const sim = contentSimilarity(content, existingParts[3] || "")
      if (sim >= NEAR_DUP_THRESHOLD) {
        // Merge into the existing entry (keep the one with higher quality)
        const mergedLine = mergeEntries(existing.line, line)
        contentSeen.set(seenNorm, { line: mergedLine, idx: existing.idx })
        // Replace in order array
        const orderIdx = order.findIndex((l) => l === existing.line)
        if (orderIdx !== -1) order[orderIdx] = mergedLine
        duplicates.push(parts[2])
        merged = true
        break
      }
    }

    if (!merged) {
      contentSeen.set(normalized, { line, idx: order.length })
      order.push(line)
    }
  }

  const totalRemoved = mergedAway.length + duplicates.length
  if (totalRemoved === 0) return { removed: 0, kept: order.length, duplicates: [] }

  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${order.length}|`)
  lines.splice(headerIdx + 1, lines.length - headerIdx - 1, ...order.map((l) => `  ${l}`))
  writeMemory(lines.join("\n"))

  return { removed: totalRemoved, kept: order.length, duplicates }
}
