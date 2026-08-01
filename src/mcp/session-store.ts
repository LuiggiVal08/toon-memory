import { readFileSync, existsSync, writeFileSync, renameSync } from "fs"
import { join } from "path"
import { OBSERVATIONS_FILE, MEMORY_FILE, MEMORY_DIR } from "./config"
import { withLockSync, atomicWrite, readUnderLock } from "../lib/lock"
import { parseToonLine, toToonLine } from "../lib/utils"
import { loadConfig, getKey } from "./config"
import { encrypt, decrypt } from "./crypto"

/**
 * Session-aware memory store.
 *
 * Replaces observations.toon with session.toon — adds session lifecycle:
 * - Entries are tagged with session_id
 * - On session end, entries with accessed > 0 are auto-promoted to memory.toon
 * - Entries without access are discarded
 * - Manual promotion via memory_promote tool
 */

/** Maximum session entries to keep */
const MAX_SESSION_ENTRIES = 500

export interface SessionEntry {
  ts: string
  session: string
  agent: string
  branch: string
  tool: string
  file: string
  summary: string
  accessed: number
  lastAccessed: string
}

/**
 * Read captured activity from session.toon (or observations.toon for compat).
 */
export function readSessionEntries(sessionId?: string): SessionEntry[] {
  const filePath = getSessionFile()
  if (!existsSync(filePath)) return []

  const entries = readFileSync(filePath, "utf-8")
    .split("\n")
    .filter((l) => l.startsWith("  ") && l.includes("|"))
    .map((l) => {
      const p = parseToonLine(l)
      return {
        ts: p[0] || "",
        session: p[1] || "",
        agent: p[2] || "",
        branch: p[3] || "",
        tool: p[4] || "",
        file: p[6] || "",
        summary: p[7] || "",
        accessed: p.length > 8 ? parseInt(p[8]) || 0 : 0,
        lastAccessed: p.length > 9 ? p[9] || "" : "",
      }
    })

  if (sessionId) {
    return entries.filter((e) => e.session === sessionId)
  }
  return entries
}

/**
 * Write a session entry. Appends to session.toon.
 */
export function writeSessionEntry(entry: Omit<SessionEntry, "accessed" | "lastAccessed">): void {
  const filePath = getSessionFile()
  ensureSessionFile()

  const data = readUnderLock(filePath)
  const lines = data.split("\n")
  let headerIdx = lines.findIndex((l) => l.startsWith("session[") || l.startsWith("observations["))
  if (headerIdx === -1) {
    lines.push("session[0|]")
    headerIdx = lines.length - 1
  }

  const entryLine = toToonLine([entry.ts, entry.session, entry.agent, entry.branch, entry.tool, "", entry.file, entry.summary, "0", ""])

  const match = lines[headerIdx].match(/\[(\d+)\|/)
  const count = match ? parseInt(match[1]) : 0
  lines.splice(headerIdx + 1, 0, entryLine)
  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count + 1}|`)

  atomicWrite(filePath, lines.join("\n"))
  pruneSessionEntries()
}

/**
 * Promote session entries to permanent memory.toon.
 * Moves selected entries (by index or tool filter) to memory.
 */
export function promoteSessionEntries(
  entriesToPromote: SessionEntry[],
  category: "decision" | "pattern" | "bug" | "knowledge" | "architecture" = "knowledge"
): number {
  if (entriesToPromote.length === 0) return 0

  const memoryData = readMemoryFile()
  const memoryLines = memoryData.split("\n")
  let memoryHeaderIdx = memoryLines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (memoryHeaderIdx === -1) {
    memoryLines.push("[0|]")
    memoryHeaderIdx = memoryLines.length - 1
  }

  let promoted = 0
  for (const entry of entriesToPromote) {
    if (!entry.summary) continue

    const id = `sp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const date = entry.ts.split("T")[0] || new Date().toISOString().split("T")[0]
    const key = entry.summary.slice(0, 50).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `session-${id}`

    const memoryEntry = toToonLine([id, category, key, entry.summary, entry.file, "session-promoted", date, "", "0", "", "0.5", "1.0", ""])

    const match = memoryLines[memoryHeaderIdx].match(/\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    memoryLines.splice(memoryHeaderIdx + 1, 0, memoryEntry)
    memoryLines[memoryHeaderIdx] = memoryLines[memoryHeaderIdx].replace(/\[\d+\|/, `[${count + 1}|`)
    promoted++
  }

  if (promoted > 0) {
    atomicWrite(MEMORY_FILE, memoryLines.join("\n"))
  }

  return promoted
}

/**
 * Clear session entries (called on session end).
 * Auto-promotes entries with accessed > 0, discards the rest.
 */
export function clearSession(sessionId: string): { promoted: number; discarded: number } {
  const allEntries = readSessionEntries()
  const sessionEntries = allEntries.filter((e) => e.session === sessionId)
  const otherEntries = allEntries.filter((e) => e.session !== sessionId)

  const toPromote = sessionEntries.filter((e) => e.accessed > 0)
  const toDiscard = sessionEntries.filter((e) => e.accessed === 0)

  const promoted = promoteSessionEntries(toPromote, "knowledge")

  // Rewrite file with only other sessions' entries
  const filePath = getSessionFile()
  if (otherEntries.length === 0) {
    atomicWrite(filePath, "session[0|]{ts|session|agent|branch|tool||file|summary|accessed|lastAccessed}:\n")
  } else {
    const lines = [`session[${otherEntries.length}|]{ts|session|agent|branch|tool||file|summary|accessed|lastAccessed}:`]
    for (const e of otherEntries) {
      lines.push(`  ${e.ts}|${e.session}|${e.agent}|${e.branch}|${e.tool}||${e.file}|${e.summary}|${e.accessed}|${e.lastAccessed}`)
    }
    atomicWrite(filePath, lines.join("\n"))
  }

  return { promoted, discarded: toDiscard.length }
}

/**
 * Mark session entries as accessed (bump counter).
 */
export function bumpSessionAccess(summaries: string[]): void {
  if (summaries.length === 0) return
  const summarySet = new Set(summaries)
  const filePath = getSessionFile()
  if (!existsSync(filePath)) return

  const data = readUnderLock(filePath)
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("session[") || l.startsWith("observations["))
  if (headerIdx === -1) return

  const now = new Date().toISOString()
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    const parts = parseToonLine(line)
    const summary = parts[7] || ""
    if (summarySet.has(summary)) {
      const accessed = parts.length > 8 ? (parseInt(parts[8]) || 0) + 1 : 1
      parts[8] = String(accessed)
      while (parts.length < 10) parts.push("")
      parts[9] = now
      lines[i] = toToonLine(parts)
    }
  }

  atomicWrite(filePath, lines.join("\n"))
}

/**
 * Get the session file path, migrating from observations.toon if needed.
 */
function getSessionFile(): string {
  const sessionFile = join(MEMORY_DIR, "session.toon")
  if (existsSync(sessionFile)) return sessionFile

  // Migrate from observations.toon
  if (existsSync(OBSERVATIONS_FILE)) {
    migrateObservationsToSession()
    return sessionFile
  }

  return sessionFile
}

/**
 * Migrate observations.toon to session.toon format.
 */
function migrateObservationsToSession(): void {
  const data = readFileSync(OBSERVATIONS_FILE, "utf-8")
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("observations["))
  if (headerIdx === -1) return

  // Convert old format to new format (add accessed/lastAccessed fields)
  const newLines = [`session[0|]{ts|session|agent|branch|tool||file|summary|accessed|lastAccessed}:`]
  for (const line of lines.slice(headerIdx + 1)) {
    if (!line.startsWith("  ") || !line.includes("|")) continue
    const parts = parseToonLine(line)
    // Old format: ts|session|agent|branch|tool||file|summary
    // New format: ts|session|agent|branch|tool||file|summary|accessed|lastAccessed
    while (parts.length < 8) parts.push("")
    parts.push("0", "") // Add accessed=0 and lastAccessed=""
    newLines.push(toToonLine(parts))
  }

  const sessionFile = join(MEMORY_DIR, "session.toon")
  atomicWrite(sessionFile, newLines.join("\n"))

  // Keep observations.toon as backup (don't delete - user might want it)
}

function ensureSessionFile(): void {
  const filePath = getSessionFile()
  if (!existsSync(filePath)) {
    atomicWrite(filePath, "session[0|]{ts|session|agent|branch|tool||file|summary|accessed|lastAccessed}:\n")
  }
}

function pruneSessionEntries(): void {
  const filePath = getSessionFile()
  if (!existsSync(filePath)) return

  const data = readUnderLock(filePath)
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("session[") || l.startsWith("observations["))
  if (headerIdx === -1) return

  const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0)
  if (entryLines.length <= MAX_SESSION_ENTRIES) return

  const toRemove = entryLines.length - MAX_SESSION_ENTRIES
  const kept = entryLines.slice(toRemove)

  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${kept.length}|`)
  lines.splice(headerIdx + 1, lines.length - headerIdx - 1, ...kept.map((l) => `  ${l.trim()}`))
  atomicWrite(filePath, lines.join("\n"))
}

function readMemoryFile(): string {
  const config = loadConfig()
  const data = readUnderLock(MEMORY_FILE)
  if (config.encrypted) {
    const key = getKey()
    if (!key) return "version: 1\nentries[0|]:\n"
    return decrypt(data, key)
  }
  return data
}

// Re-export for backward compatibility
export const readObservations = readSessionEntries
export const pruneObservations = pruneSessionEntries
