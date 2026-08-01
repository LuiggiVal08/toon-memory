import { readFileSync, existsSync } from "fs"
import { withLockSync } from "../lib/lock"
import { readMemory, writeMemory, safeWrite } from "./memory-io"
import { ensureMemoryFile, MEMORY_FILE, MEMORY_DIR, getMaxEntries, ARCHIVE_DAYS, ARCHIVE_FILE } from "./config"
import { isExpired } from "./entries"
import { entryScoreForLine } from "./scoring"
import { parseToonLine } from "../lib/utils"

/**
 * Archive entries older than ARCHIVE_DAYS or with expired TTL.
 * When `trimToMax` is set, also archive the lowest-importance entries
 * until the active count is at or below MAX_ENTRIES.
 */
export function archiveOldEntries(opts: { trimToMax?: boolean } = {}): { archived: number; kept: number } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries["))

  if (headerIdx === -1) return { archived: 0, kept: 0 }

  const today = new Date()
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - ARCHIVE_DAYS)
  const cutoffStr = cutoff.toISOString().split("T")[0]

  const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0)
  const toArchive = new Set<number>()

  entryLines.forEach((line, idx) => {
    const parts = parseToonLine(line)
    if (parts.length < 7) return
    const date = parts[6]
    const ttl = parts[7] || ""
    if (date < cutoffStr || (ttl && isExpired(ttl))) toArchive.add(idx)
  })

  if (opts.trimToMax) {
    const remaining = entryLines.length - toArchive.size
    const maxEntries = getMaxEntries()
    if (remaining > maxEntries) {
      const need = remaining - maxEntries
      const candidates = entryLines
        .map((line, idx) => ({ idx, score: entryScoreForLine(line) }))
        .filter((c) => !toArchive.has(c.idx))
        .sort((a, b) => a.score - b.score)
      for (let i = 0; i < need && i < candidates.length; i++) toArchive.add(candidates[i].idx)
    }
  }

  if (toArchive.size === 0) return { archived: 0, kept: entryLines.length }

  const toArchiveLines = entryLines.filter((_, idx) => toArchive.has(idx)).map((l) => l.trim())
  const toKeepLines = entryLines.filter((_, idx) => !toArchive.has(idx)).map((l) => l.trim())

  // Write archived entries
  let archiveContent = ""
  if (existsSync(ARCHIVE_FILE)) {
    archiveContent = readFileSync(ARCHIVE_FILE, "utf-8")
  } else {
    archiveContent = `version: 1\narchived:\n`
  }

  const archiveLines = archiveContent.split("\n")
  let archiveHeaderIdx = archiveLines.findIndex((l) => l.startsWith("archived["))
  if (archiveHeaderIdx === -1) {
    archiveLines.push(`archived[0|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:`)
    archiveHeaderIdx = archiveLines.length - 1
  }

  const archiveMatch = archiveLines[archiveHeaderIdx].match(/archived\[(\d+)\|/)
  const archiveCount = archiveMatch ? parseInt(archiveMatch[1]) : 0

  for (const entry of toArchiveLines) {
    archiveLines.splice(archiveHeaderIdx + 1, 0, `  ${entry}`)
  }
  archiveLines[archiveHeaderIdx] = archiveLines[archiveHeaderIdx].replace(/archived\[\d+\|/, `[${archiveCount + toArchiveLines.length}|`)

  safeWrite(ARCHIVE_FILE, archiveLines.join("\n"))

  // Update main file
  lines[headerIdx] = lines[headerIdx].replace(/entries\[\d+\|/, `[${toKeepLines.length}|`)
  const keepSet = new Set(toKeepLines)
  const allEntryLines = lines.slice(headerIdx + 1)
  const newEntryLines = allEntryLines.filter((l) => {
    if (l.trim().length === 0) return false
    return keepSet.has(l.trim())
  })
  lines.splice(headerIdx + 1, allEntryLines.length, ...newEntryLines.map((l) => `  ${l.trim()}`))
  writeMemory(lines.join("\n"))

  return { archived: toArchiveLines.length, kept: toKeepLines.length }
}

/**
 * Remove entries whose TTL has expired, run at server startup.
 * Distinct from archiveOldEntries: pruning == hard delete of entries that
 * have outlived their TTL. Runs entirely under the memory-file lock so parallel
 * sessions can't corrupt the file mid-prune.
 */
export function pruneExpiredEntries(): number {
  ensureMemoryFile()
  if (!existsSync(MEMORY_FILE)) return 0
  let pruned = 0
  withLockSync(MEMORY_FILE, () => {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    if (headerIdx === -1) return

    const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && !l.startsWith("  summaries:"))
    const kept = entryLines.filter((l) => {
      const parts = parseToonLine(l)
      if (parts.length < 8) return true
      const ttl = parts[7] || ""
      if (ttl && isExpired(ttl)) {
        pruned++
        return false
      }
      return true
    })
    if (pruned === 0) return

    lines[headerIdx] = lines[headerIdx].replace(/entries\[\d+\|/, `[${kept.length}|`)
    const keepSet = new Set(kept.map((l) => l.trim()))
    const allEntryLines = lines.slice(headerIdx + 1)
    const newLines = allEntryLines.filter((l) => l.trim().length === 0 || keepSet.has(l.trim()))
    lines.splice(headerIdx + 1, allEntryLines.length, ...newLines.map((l) => (l.trim().length ? `  ${l.trim()}` : l)))
    writeMemory(lines.join("\n"))
  })
  return pruned
}
