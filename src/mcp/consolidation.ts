import { readMemory, writeMemory } from "./memory-io"
import { mergeEntries } from "../lib/quality"
import { parseToonLine, toToonLine } from "../lib/utils"

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

/**
 * Extract a (base, version) pair from a versioned key or content line.
 * Matches "Use React 18", "React 18.2", "next 13.5.1", "vite ^5.0.0", etc.
 * Returns null when no version number is present.
 */
export function extractVersion(text: string): { base: string; version: [number, number, number] } | null {
  const m = text.match(/([A-Za-z][A-Za-z0-9._-]*?)\s*(?:v)?(\d+)\.(\d+)(?:\.(\d+))?/)
  if (!m) return null
  const base = m[1].replace(/[-_.]+$/g, "").toLowerCase()
  return { base, version: [parseInt(m[2]), parseInt(m[3]), m[4] ? parseInt(m[4]) : 0] }
}

/** Compare two [major, minor, patch] version tuples: >0, <0, or 0. */
function compareVersions(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

/**
 * Version-supersession compaction: detect entries that describe the same
 * subject with different versions (e.g. "Use React 18" vs "Use React 19")
 * and mark the older ones obsolete in favor of the newest. Deterministic,
 * no LLM — uses a version regex + base-name grouping.
 *
 * Returns the actions taken (or proposed when `dryRun`).
 */
export function consolidateVersions(dryRun: boolean): { removed: number; proposals: string[]; groups: Array<{ base: string; winner: string; losers: string[] }> } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) return { removed: 0, proposals: [], groups: [] }

  interface Candidate { lineIdx: number; id: string; key: string; content: string; category: string; base: string; version: [number, number, number] }
  const candidates: Candidate[] = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    if (line.startsWith("  summaries:")) break
    const parts = parseToonLine(line)
    if (parts.length < 7) continue
    const [id, category, key, content] = parts
    const hit = extractVersion(`${key} ${content}`.toLowerCase())
    if (hit && key.toLowerCase().includes(hit.base)) {
      candidates.push({ lineIdx: i, id, key, content, category, base: hit.base, version: hit.version })
    }
  }
  if (candidates.length < 2) return { removed: 0, proposals: [], groups: [] }

  // Group by base name.
  const byBase = new Map<string, Candidate[]>()
  for (const c of candidates) {
    const list = byBase.get(c.base) || []
    list.push(c)
    byBase.set(c.base, list)
  }

  const groups: Array<{ base: string; winner: string; losers: string[] }> = []
  for (const [base, list] of byBase) {
    if (list.length < 2) continue
    const sorted = [...list].sort((a, b) => compareVersions(b.version, a.version))
    const winner = sorted[0]
    const losers = sorted.slice(1)
    if (losers.length === 0) continue
    groups.push({ base, winner: winner.key, losers: losers.map((l) => l.key) })
  }

  if (groups.length === 0) return { removed: 0, proposals: [], groups }
  if (dryRun) return { removed: 0, proposals: groups.map((g) => `Replace ${g.losers.join(", ")} by ${g.winner}`), groups }

  // Apply: mark losers obsolete with a superseded note.
  const today = new Date().toISOString().split("T")[0]
  let changed = 0
  for (const g of groups) {
    for (const loser of g.losers) {
      const hit = candidates.find((c) => c.key === loser)
      if (!hit) continue
      const parts = parseToonLine(lines[hit.lineIdx])
      while (parts.length < 18) parts.push("")
      parts[9] = parts[9] ? `${parts[9]} ${g.winner}` : g.winner
      parts[16] = "obsolete"
      parts[17] = today
      lines[hit.lineIdx] = toToonLine(parts)
      changed++
    }
  }
  if (changed === 0) return { removed: 0, proposals: [], groups }

  writeMemory(lines.join("\n"))
  return { removed: changed, proposals: groups.map((g) => `Replace ${g.losers.join(", ")} by ${g.winner}`), groups }
}
