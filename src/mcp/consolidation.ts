import { readMemory, writeMemory } from "./memory-io"
import { mergeEntries } from "../lib/quality"

/**
 * Deterministic consolidation: merge entries with the same key (combining
 * tags, links, max confidence, latest date), then remove exact-content
 * duplicates. No LLM involved.
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
    const parts = line.split("|")
    if (parts.length < 3) continue
    const key = parts[2]
    const existingIdx = keyOrder.findIndex((idx) => {
      const ep = entryLines[idx].trim().split("|")
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

  // Phase 2: Remove exact-content duplicates (normalized)
  const contentSeen = new Map<string, string>()
  const order: string[] = []
  const duplicates: string[] = []

  for (const idx of keyOrder) {
    const line = byKey.get(idx)!
    const parts = line.split("|")
    if (parts.length < 3) {
      order.push(line)
      continue
    }
    const content = (parts[3] || "").toLowerCase().replace(/\s+/g, " ").trim()
    if (contentSeen.has(content)) {
      duplicates.push(parts[2])
      continue
    }
    contentSeen.set(content, line)
    order.push(line)
  }

  const totalRemoved = mergedAway.length + duplicates.length
  if (totalRemoved === 0) return { removed: 0, kept: order.length, duplicates: [] }

  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${order.length}|`)
  lines.splice(headerIdx + 1, lines.length - headerIdx - 1, ...order.map((l) => `  ${l}`))
  writeMemory(lines.join("\n"))

  return { removed: totalRemoved, kept: order.length, duplicates }
}
