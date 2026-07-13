import { McpServer } from "@modelcontextprotocol/server"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"
import { z } from "zod"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { randomBytes, createCipheriv, createDecipheriv } from "crypto"
import { withLockSync, atomicWrite, readUnderLock } from "../lib/lock"
import { coordinationView, resolveSessionId, currentBranch, SESSION_TTL_MS } from "../lib/sessions"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Base directory for memory storage */
const MEMORY_DIR = join(process.cwd(), ".toon-memory", "memory")

/** Main memory data file */
const MEMORY_FILE = join(MEMORY_DIR, "data.toon")

/** Archive file for old entries */
const ARCHIVE_FILE = join(MEMORY_DIR, "archive.toon")

/** Observations log written by capture hooks (opt-in, separate from memory) */
const OBSERVATIONS_FILE = join(MEMORY_DIR, "observations.toon")

/** Configuration file for encryption settings */
const CONFIG_FILE = join(MEMORY_DIR, "config.json")

/** Maximum active entries before auto-archive */
const MAX_ENTRIES = 100

/** Days before entries are archived */
const ARCHIVE_DAYS = 30

/**
 * Write `content` to a memory file atomically and safely across processes.
 * Uses an advisory lock (temp+rename) so parallel sessions can't corrupt
 * the same file. Encryption, if enabled, is applied by the caller.
 */
function safeWrite(file: string, content: string): void {
  withLockSync(file, () => atomicWrite(file, content))
}

/** Encryption algorithm for AES-256-GCM */
const ALGORITHM = "aes-256-gcm"

/** Memory configuration with encryption settings */
interface MemoryConfig {
  /** Whether encryption is enabled */
  encrypted: boolean
}

/**
 * Load memory configuration from config.json.
 * 
 * @returns MemoryConfig object with encryption settings
 * 
 * @example
 * ```typescript
 * const config = loadConfig()
 * if (config.encrypted) {
 *   console.log("Encryption enabled")
 * }
 * ```
 */
function loadConfig(): MemoryConfig {
  if (!existsSync(CONFIG_FILE)) {
    return { encrypted: false }
  }
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"))
  } catch {
    return { encrypted: false }
  }
}

/**
 * Save memory configuration to config.json.
 * 
 * @param config - MemoryConfig to save
 */
function saveConfig(config: MemoryConfig): void {
  ensureMemoryDir()
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

/**
 * Get the encryption key from environment variable.
 * 
 * @returns The key string, or undefined if not set
 */
function getKey(): string | undefined {
  return process.env.TOON_MEMORY_KEY
}

/**
 * Ensure memory directory exists, creating it if necessary.
 */
function ensureMemoryDir(): void {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })
}

/**
 * Ensure memory file exists with default structure.
 */
function ensureMemoryFile(): void {
  ensureMemoryDir()
  if (!existsSync(MEMORY_FILE)) {
    writeFileSync(MEMORY_FILE, "version: 1\nentries[0|]{id|category|key|content|file|tags|date|ttl|accessed}:\n")
  }
}

/**
 * Encrypt text using AES-256-GCM.
 * 
 * @param text - Plain text to encrypt
 * @param key - Hex-encoded encryption key (64 chars)
 * @returns Encrypted string in format "iv:authTag:ciphertext"
 * 
 * @example
 * ```typescript
 * const encrypted = encrypt("my secret", key)
 * // "a1b2c3d4...:e5f6g7h8...:i9j0k1l2..."
 * ```
 */
function encrypt(text: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex")
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv)
  
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

/**
 * Decrypt AES-256-GCM encrypted data.
 * 
 * @param encryptedData - Encrypted string in format "iv:authTag:ciphertext"
 * @param key - Hex-encoded encryption key (64 chars)
 * @returns Decrypted plain text
 * @throws If key is invalid or data is corrupted
 */
function decrypt(encryptedData: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex")
  const parts = encryptedData.split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format: expected iv:authTag:ciphertext")
  }
  const [ivHex, authTagHex, encrypted] = parts
  
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")
  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  
  return decrypted
}

/**
 * Read memory file, decrypting if encryption is enabled.
 * Key is read from TOON_MEMORY_KEY env var.
 * 
 * @returns Memory content as string (TOON format)
 */
function readMemory(): string {
  ensureMemoryFile()
  const config = loadConfig()
  const data = readUnderLock(MEMORY_FILE)
  
  if (config.encrypted) {
    const key = getKey()
    if (!key) return ""
    try {
      return decrypt(data, key)
    } catch {
      return ""
    }
  }
  
  return data
}

/**
 * Write content to memory file, encrypting if encryption is enabled.
 * Key is read from TOON_MEMORY_KEY env var.
 * 
 * @param content - Memory content to write (TOON format)
 */
function writeMemory(content: string): void {
  ensureMemoryFile()
  const config = loadConfig()
  
  if (config.encrypted) {
    const key = getKey()
    if (!key) return
    const encrypted = encrypt(content, key)
    safeWrite(MEMORY_FILE, encrypted)
    return
  }
  
  safeWrite(MEMORY_FILE, content)
}

/**
 * Generate a random 8-character hex ID for memory entries.
 * 
 * @returns Hex string (8 chars)
 */
function generateId(): string {
  return randomBytes(4).toString("hex")
}

/**
 * Parse a TTL value into an absolute date string (YYYY-MM-DD).
 * Supports: exact dates (2026-07-17), relative days (7d, 30d).
 * Returns empty string if no TTL.
 */
function parseTTL(ttl: string): string {
  if (!ttl || !ttl.trim()) return ""
  const trimmed = ttl.trim()
  const dayMatch = trimmed.match(/^(\d+)d$/)
  if (dayMatch) {
    const days = parseInt(dayMatch[1])
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split("T")[0]
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  return ""
}

/**
 * Check if a TTL value has expired (date is in the past).
 */
function isExpired(ttl: string): boolean {
  if (!ttl) return false
  const ttlDate = parseTTL(ttl) || ttl
  const today = new Date().toISOString().split("T")[0]
  return ttlDate <= today
}

/** Built-in vocabulary for automatic tag inference */
const TAG_VOCABULARY: Record<string, string[]> = {
  "redis": ["redis", "cache", "caching", "memcached"],
  "auth": ["auth", "authentication", "authorization", "login", "token", "jwt", "session", "oauth"],
  "api": ["api", "endpoint", "rest", "graphql", "route", "router", "controller"],
  "db": ["database", "db", "sql", "postgres", "mysql", "mongo", "query", "migration", "schema"],
  "security": ["security", "encrypt", "decrypt", "vulnerability", "xss", "csrf", "cors", "sanitiz"],
  "test": ["test", "testing", "vitest", "jest", "spec", "mock", "assert", "coverage"],
  "deploy": ["deploy", "docker", "ci/cd", "github actions", "pipeline", "kubernetes", "k8s"],
  "config": ["config", "configuration", "settings", "env", "environment", "dotenv"],
  "performance": ["performance", "optimize", "benchmark", "latency", "throughput", "cache"],
  "refactor": ["refactor", "cleanup", "restructure", "reorganize", "rework"],
  "error": ["error", "exception", "throw", "catch", "handling", "retry", "fallback"],
  "logging": ["log", "logging", "logger", "debug", "trace", "monitor", "observability"],
  "types": ["typescript", "types", "type", "interface", "generic", "enum", "zod", "schema"],
  "async": ["async", "await", "promise", "concurrent", "parallel", "worker", "queue"],
  "state": ["state", "store", "redux", "context", "reducer", "action", "observable"],
  "ui": ["ui", "component", "render", "dom", "css", "style", "layout", "responsive"],
  "storage": ["storage", "file", "filesystem", "s3", "blob", "upload", "download"],
  "email": ["email", "mail", "smtp", "sendgrid", "newsletter", "notification"],
  "payment": ["payment", "stripe", "billing", "invoice", "checkout", "subscription"],
  "webhook": ["webhook", "callback", "event", "listener", "hook"],
}

/**
 * Infer tags from content and key by matching against vocabulary.
 * Returns semicolon-separated tags.
 */
function inferTags(content: string, key: string): string {
  const text = `${key} ${content}`.toLowerCase()
  const matched: string[] = []
  for (const [tag, keywords] of Object.entries(TAG_VOCABULARY)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(tag)
    }
  }
  return matched.join(";")
}

/**
 * Parse a relative date string into an absolute YYYY-MM-DD date.
 * Supports: "24h", "7d", "30d", or an exact date "2026-07-10".
 */
function parseRelativeDate(since: string): string {
  const trimmed = since.trim()
  const hourMatch = trimmed.match(/^(\d+)h$/)
  if (hourMatch) {
    const d = new Date()
    d.setHours(d.getHours() - parseInt(hourMatch[1]))
    return d.toISOString().split("T")[0]
  }
  const dayMatch = trimmed.match(/^(\d+)d$/)
  if (dayMatch) {
    const d = new Date()
    d.setDate(d.getDate() - parseInt(dayMatch[1]))
    return d.toISOString().split("T")[0]
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const today = new Date().toISOString().split("T")[0]
  return today
}

const normalize = (s: string) => s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()

/**
 * Find entries related to the given text by fuzzy matching.
 * Returns top N results ranked by match quality.
 */
function findRelatedEntries(text: string, excludeKey: string = "", limit: number = 3): Array<{ id: string; cat: string; key: string; content: string; file: string; tags: string; date: string; score: number }> {
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
 * Archive entries older than ARCHIVE_DAYS to archive.toon.
 * 
 * Moves old entries from data.toon to archive.toon to keep
 * the active memory file manageable.
 * 
 * @returns Object with counts of archived and kept entries
 * 
 * @example
 * ```typescript
 * const result = archiveOldEntries()
 * console.log(`Archived: ${result.archived}, Kept: ${result.kept}`)
 * ```
 */
/**
 * Importance score for an entry: blends recency and access frequency.
 * Deterministic — no LLM. Higher = more worth keeping.
 */
function entryScore(dateStr: string, accessed: number): number {
  const days = (Date.now() - new Date(`${dateStr}T00:00:00`).getTime()) / 86400000
  const recency = Math.max(0, 30 - days) / 30
  const freq = Math.min(1, accessed / 5)
  return recency * 0.6 + freq * 0.4
}

function entryScoreForLine(line: string): number {
  const parts = line.trim().split("|")
  const date = parts[6] || new Date().toISOString().split("T")[0]
  const accessed = parts.length > 8 ? parseInt(parts[8]) || 0 : 0
  return entryScore(date, accessed)
}

/**
 * Increment the `accessed` counter for the given entry ids.
 * Used by recall/suggest so frequently-used memories rank higher.
 */
function bumpAccessed(ids: string[]): void {
  if (ids.length === 0) return
  const idSet = new Set(ids)
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) return

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    if (line.startsWith("  summaries:")) break
    const parts = line.trim().split("|")
    if (idSet.has(parts[0])) {
      const accessed = parts.length > 8 ? (parseInt(parts[8]) || 0) + 1 : 1
      parts[8] = String(accessed)
      lines[i] = `  ${parts.join("|")}`
    }
  }
  writeMemory(lines.join("\n"))
}

/**
 * Read captured activity from observations.toon (written by hooks).
 */
function readObservations(): Array<{ ts: string; session: string; agent: string; branch: string; tool: string; file: string; summary: string }> {
  if (!existsSync(OBSERVATIONS_FILE)) return []
  return readFileSync(OBSERVATIONS_FILE, "utf-8")
    .split("\n")
    .filter((l) => l.startsWith("  ") && l.includes("|"))
    .map((l) => {
      const p = l.trim().split("|")
      return { ts: p[0] || "", session: p[1] || "", agent: p[2] || "", branch: p[3] || "", tool: p[4] || "", file: p[6] || "", summary: p[7] || "" }
    })
}

/**
 * Archive entries older than ARCHIVE_DAYS or with expired TTL.
 * When `trimToMax` is set, also archive the lowest-importance entries
 * until the active count is at or below MAX_ENTRIES.
 */
function archiveOldEntries(opts: { trimToMax?: boolean } = {}): { archived: number; kept: number } {
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
    const parts = line.trim().split("|")
    if (parts.length < 7) return
    const date = parts[6]
    const ttl = parts[7] || ""
    if (date < cutoffStr || (ttl && isExpired(ttl))) toArchive.add(idx)
  })

  if (opts.trimToMax) {
    const remaining = entryLines.length - toArchive.size
    if (remaining > MAX_ENTRIES) {
      const need = remaining - MAX_ENTRIES
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
    archiveLines.push(`archived[0|]{id|category|key|content|file|tags|date}:`)
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
 * have outlived their TTL (they've passed their useful window), rather than
 * archiving by age. Runs entirely under the memory-file lock so parallel
 * sessions can't corrupt the file mid-prune.
 *
 * @returns Number of entries pruned
 */
function pruneExpiredEntries(): number {
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
      const parts = l.trim().split("|")
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

/**
 * Deterministic consolidation: remove entries with identical (normalized)
 * content, keeping the first. No LLM involved.
 */
function consolidateEntries(): { removed: number; kept: number; duplicates: string[] } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) return { removed: 0, kept: 0, duplicates: [] }

  const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && !l.startsWith("  summaries:"))
  const seen = new Map<string, string>()
  const order: string[] = []
  const duplicates: string[] = []

  for (const line of entryLines) {
    const parts = line.trim().split("|")
    if (parts.length < 3) {
      order.push(line.trim())
      continue
    }
    const content = (parts[3] || "").toLowerCase().replace(/\s+/g, " ").trim()
    if (seen.has(content)) {
      duplicates.push(parts[2])
      continue
    }
    seen.set(content, line.trim())
    order.push(line.trim())
  }

  if (duplicates.length === 0) return { removed: 0, kept: order.length, duplicates: [] }

  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${order.length}|`)
  lines.splice(headerIdx + 1, lines.length - headerIdx - 1, ...order.map((l) => `  ${l}`))
  writeMemory(lines.join("\n"))

  return { removed: duplicates.length, kept: order.length, duplicates }
}

const server = new McpServer(
  { name: "toon-memory", version: "2.0.0" },
  { capabilities: { tools: { listChanged: true }, resources: { listChanged: true } } }
)

/**
 * Register memory entries as an MCP resource.
 * Agents can read this as context in the system prompt.
 */
server.registerResource(
  "memory-entries",
  "toon://memory/entries",
  { title: "Memory Entries", mimeType: "text/plain" },
  async (uri) => {
    const data = readMemory()
    return { contents: [{ uri: uri.href, text: data }] }
  }
)

/**
 * Register memory stats as an MCP resource.
 */
server.registerResource(
  "memory-stats",
  "toon://memory/stats",
  { title: "Memory Stats", mimeType: "text/plain" },
  async (uri) => {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
    const entries = lines.map((l) => {
      const parts = l.trim().split("|")
      return { category: parts[1] || "unknown", ttl: parts[7] || "" }
    })
    const byCategory: Record<string, number> = {}
    for (const e of entries) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1
    }
    const withTtl = entries.filter((e) => e.ttl).length
    const expired = entries.filter((e) => e.ttl && isExpired(e.ttl)).length
    const text = [
      `Entradas totales: ${entries.length}`,
      `TTL: ${withTtl} con expiración, ${expired} expiradas`,
      "Por categoría:",
      ...Object.entries(byCategory).map(([k, v]) => `  ${k}: ${v}`),
    ].join("\n")
    return { contents: [{ uri: uri.href, text }] }
  }
)

/**
 * Register memory summaries as an MCP resource.
 */
server.registerResource(
  "memory-summaries",
  "toon://memory/summaries",
  { title: "Memory Summaries", mimeType: "text/plain" },
  async (uri) => {
    const data = readMemory()
    const lines = data.split("\n")
    const summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))
    if (summaryIdx === -1) {
      return { contents: [{ uri: uri.href, text: "No hay resúmenes guardados" }] }
    }
    const summaryText = lines.slice(summaryIdx + 1).filter((l) => l.includes(":")).join("\n")
    return { contents: [{ uri: uri.href, text: summaryText || "No hay resúmenes guardados" }] }
  }
)

/**
 * Register the memory_remember tool.
 * Saves a fact to persistent memory (decisions, patterns, bugs, knowledge).
 * 
 * @example
 * ```typescript
 * // From MCP tool call:
 * await callTool("memory_remember", {
 *   category: "decision",
 *   key: "use-ts-for-mcp",
 *   content: "Using TypeScript for MCP server implementation"
 * })
 * ```
 */
server.registerTool(
  "memory_remember",
  {
    title: "Save to Memory",
    description: "Guarda un hecho en la memoria persistente del proyecto (decisiones, patrones, bugs, conocimiento). Se recuerda entre sesiones.",
    inputSchema: {
      category: z.enum(["decision", "pattern", "bug", "knowledge"]).describe("Categoría del hecho"),
      key: z.string().describe("Título corto en kebab-case (ej: risk-engine-prioridad)"),
      content: z.string().describe("Contenido detallado del hecho"),
      file: z.string().optional().default("").describe("Archivo o línea relacionada (ej: spec.md:145)"),
      tags: z.string().optional().default("").describe("Tags separados por punto y coma (ej: risk;spec)"),
      ttl: z.string().optional().default("").describe("Time to live (ej: 7d, 2026-07-17). Vacío = sin expiración"),
    },
  },
  async ({ category, key, content, file, tags, ttl }) => {
    const data = readMemory()
    const newId = generateId()
    const date = new Date().toISOString().split("T")[0]
    const lines = data.split("\n")

    let headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
    if (headerIdx === -1) {
      lines.push(`[0|]`)
      headerIdx = lines.length - 1
    }

    // Find existing entry with same key (upsert)
    let existingIdx = -1
    let existingId = newId
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.startsWith("  ") || !line.includes("|")) continue
      if (line.startsWith("  summaries:")) break
      const parts = line.trim().split("|")
      if (parts[2] === key) {
        existingIdx = i
        existingId = parts[0] // Preserve original ID
        break
      }
    }

    const entryId = existingIdx !== -1 ? existingId : newId
    const resolvedTtl = parseTTL(ttl)
    const resolvedTags = tags ? tags : inferTags(content, key)
    const newEntry = `${entryId}|${category}|${key}|${content}|${file || ""}|${resolvedTags}|${date}|${resolvedTtl}|0`
    let action = "Guardado"
    const tagsInferred = !tags && resolvedTags ? true : false

    if (existingIdx !== -1) {
      // Update existing entry
      lines[existingIdx] = `  ${newEntry}`
      action = "Actualizado"
    } else {
      // Create new entry
      const match = lines[headerIdx].match(/\[(\d+)\|/)
      const count = match ? parseInt(match[1]) : 0
      lines.splice(headerIdx + 1, 0, `  ${newEntry}`)
      lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count + 1}|`)
    }

    writeMemory(lines.join("\n"))

    // Auto-archive if we exceed MAX_ENTRIES (old entries, then lowest-importance)
    const headerMatch = lines[headerIdx].match(/\[(\d+)\|/)
    const entryCount = headerMatch ? parseInt(headerMatch[1]) : 0
    let archiveMsg = ""
    if (entryCount > MAX_ENTRIES) {
      const result = archiveOldEntries({ trimToMax: true })
      if (result.archived > 0) {
        archiveMsg = `\n📦 Auto-archived ${result.archived} low-importance entries (${result.kept} kept)`
      }
    }

    const ttlMsg = resolvedTtl ? `\n⏰ TTL: ${resolvedTtl}` : ""
    const inferredMsg = tagsInferred ? `\n🏷️ Tags inferidos: ${resolvedTags}` : ""

    const related = findRelatedEntries(`${key} ${content} ${resolvedTags}`, key, 3)
    let relatedMsg = ""
    if (related.length > 0) {
      const items = related.map((r) => `  [${r.cat}] ${r.key} — ${r.content.slice(0, 80)}`).join("\n")
      relatedMsg = `\n\n🔗 Entradas relacionadas:\n${items}`
    }

    return {
      content: [{ type: "text" as const, text: `🧠 ${action}: ${category}/${key} (${entryId})\n${content}${ttlMsg}${inferredMsg}${archiveMsg}${relatedMsg}` }],
    }
  }
)

/**
 * Register the memory_recall tool.
 * Search persistent memory for relevant entries by text, category, or date range.
 * 
 * @example
 * ```typescript
 * // From MCP tool call:
 * await callTool("memory_recall", { query: "risk engine" })
 * await callTool("memory_recall", { query: "redis", category: "bug" })
 * ```
 */
server.registerTool(
  "memory_recall",
  {
    title: "Search Memory",
    description: "Busca en la memoria persistente del proyecto. Devuelve entradas relevantes. Usar ANTES de leer archivos.",
    inputSchema: {
      query: z.string().describe("Texto a buscar"),
      category: z.string().optional().default("").describe("Filtrar por categoría (vacío = todos)"),
      from_date: z.string().optional().default("").describe("Fecha inicio filtro (YYYY-MM-DD)"),
      to_date: z.string().optional().default("").describe("Fecha fin filtro (YYYY-MM-DD)"),
    },
  },
  async ({ query, category, from_date, to_date }) => {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))

    // Normalize for fuzzy matching: hyphens/underscores → spaces, collapse whitespace
    const normalize = (s: string) => s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()
    const queryTokens = normalize(query).split(" ").filter(Boolean)

    const results = lines
      .map((line) => {
        const trimmed = line.trim()
        const parts = trimmed.split("|")
        if (parts.length < 7) return null
        const [id, cat, key, content, file, tags, date, ttl, accessedRaw] = parts
        if (category && cat !== category) return null
        if (from_date && date < from_date) return null
        if (to_date && date > to_date) return null
        if (ttl && isExpired(ttl)) return null
        const searchStr = normalize(`${id} ${cat} ${key} ${content} ${file} ${tags}`)
        // All query tokens must match (AND logic)
        if (!queryTokens.every((token) => searchStr.includes(token))) return null
        const accessed = accessedRaw ? parseInt(accessedRaw) || 0 : 0
        return { id, cat, key, content, file, tags, date, accessed }
      })
      .filter(Boolean) as Array<{ id: string; cat: string; key: string; content: string; file: string; tags: string; date: string; accessed: number }>

    if (results.length === 0) {
      return { content: [{ type: "text" as const, text: `No se encontraron resultados para "${query}"` }] }
    }

    // Rank by importance (recency + access frequency), then bump access counts.
    const ranked = results
      .map((r) => ({ ...r, score: entryScore(r.date, r.accessed) }))
      .sort((a, b) => b.score - a.score)

    bumpAccessed(ranked.map((r) => r.id))

    const formatted = ranked
      .map((r) => `[${r.cat}] ${r.key} (${r.id})\n  ${r.content}\n  File: ${r.file} | Tags: ${r.tags} | Date: ${r.date}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: formatted }] }
  }
)

/**
 * Register the memory_forget tool.
 * Delete a memory entry by key or ID.
 * 
 * @example
 * ```typescript
 * await callTool("memory_forget", { key: "old-decision" })
 * ```
 */
server.registerTool(
  "memory_forget",
  {
    title: "Delete from Memory",
    description: "Elimina una entrada de la memoria por su key o id.",
    inputSchema: {
      key: z.string().describe("Key o id de la entrada a eliminar"),
    },
  },
  async ({ key }) => {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

    if (headerIdx === -1) {
      return { content: [{ type: "text" as const, text: "No hay entradas en memoria" }] }
    }

    const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && !l.startsWith("  summaries:"))
    const filtered = entryLines.filter((l) => {
      const parts = l.trim().split("|")
      return parts[0] !== key && parts[2] !== key
    })

    const removed = entryLines.length - filtered.length
    const match = lines[headerIdx].match(/\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count - removed}|`)
    lines.splice(headerIdx + 1, entryLines.length, ...filtered.map((l) => `  ${l.trim()}`))

    writeMemory(lines.join("\n"))
    return {
      content: [{ type: "text" as const, text: `"${key}" eliminado. Quedan ${count - removed} entradas.` }],
    }
  }
)

/**
 * Register the memory_stats tool.
 * Display memory statistics including entry counts and categories.
 * 
 * @example
 * ```typescript
 * await callTool("memory_stats", {})
 * ```
 */
server.registerTool(
  "memory_stats",
  {
    title: "Memory Stats",
    description: "Muestra estadísticas de la memoria del proyecto.",
    inputSchema: {},
  },
  async () => {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
    const entries = lines.map((l) => {
      const parts = l.trim().split("|")
      return { category: parts[1] || "unknown", ttl: parts[7] || "" }
    })

    const byCategory: Record<string, number> = {}
    for (const e of entries) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1
    }

    const withTtl = entries.filter((e) => e.ttl).length
    const expired = entries.filter((e) => e.ttl && isExpired(e.ttl)).length

    const summaryLines = data.split("\n").filter((l) => l.includes(":") && !l.startsWith("  ") && !l.startsWith("version") && !l.startsWith("entries") && !/^\[\d+\|]/.test(l))
    const stats = [
      `Entradas totales: ${entries.length}`,
      `Resúmenes de archivos: ${summaryLines.length}`,
      "",
      "Por categoría:",
      ...Object.entries(byCategory).map(([k, v]) => `  ${k}: ${v}`),
      "",
      `TTL: ${withTtl} con expiración, ${expired} expiradas`,
      "",
      `Últimas 5 entradas:`,
      ...lines.slice(-5).map((l) => {
        const parts = l.trim().split("|")
        const ttlInfo = parts[7] ? ` | TTL: ${parts[7]}` : ""
        return `  [${parts[1]}] ${parts[2]} (${parts[0]})${ttlInfo}`
      }),
    ]

    return { content: [{ type: "text" as const, text: stats.join("\n") }] }
  }
)

/**
 * Register the memory_diff tool.
 * Show what changed in memory since a given date.
 */
server.registerTool(
  "memory_diff",
  {
    title: "Memory Diff",
    description: "Muestra qué cambió en la memoria desde una fecha. Útil para saber qué se aprendió desde la última sesión.",
    inputSchema: {
      since: z.string().describe("Desde cuándo mostrar cambios (ej: 24h, 7d, 2026-07-10)"),
      type: z.enum(["all", "created", "updated"]).optional().default("all").describe("Filtrar por tipo de cambio"),
    },
  },
  async ({ since, type }) => {
    const sinceDate = parseRelativeDate(since)
    const today = new Date().toISOString().split("T")[0]
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))

    const results = lines
      .map((line) => {
        const trimmed = line.trim()
        const parts = trimmed.split("|")
        if (parts.length < 7) return null
        const [id, cat, key, content, file, tags, date] = parts
        if (date < sinceDate) return null
        // For "updated" we check if date is recent but key existed before
        // For simplicity: same date as today = created today, otherwise "updated" if date >= sinceDate
        const changeType = date === today ? "created" : "updated"
        if (type !== "all" && changeType !== type) return null
        return { id, cat, key, content, file, tags, date, changeType }
      })
      .filter(Boolean)

    if (results.length === 0) {
      return { content: [{ type: "text" as const, text: `No hay cambios desde ${sinceDate}` }] }
    }

    const created = results.filter((r) => r!.changeType === "created")
    const updated = results.filter((r) => r!.changeType === "updated")

    const sections: string[] = [`📋 Cambios desde ${sinceDate}:`, ""]

    if (created.length > 0 && (type === "all" || type === "created")) {
      sections.push(`➕ Nuevas (${created.length}):`)
      for (const r of created) {
        sections.push(`  [${r!.cat}] ${r!.key} (${r!.id})\n    ${r!.content}`)
      }
      sections.push("")
    }

    if (updated.length > 0 && (type === "all" || type === "updated")) {
      sections.push(`✏️  Actualizadas (${updated.length}):`)
      for (const r of updated) {
        sections.push(`  [${r!.cat}] ${r!.key} (${r!.id}) — ${r!.date}`)
      }
      sections.push("")
    }

    return { content: [{ type: "text" as const, text: sections.join("\n") }] }
  }
)

/**
 * Register the memory_suggest tool.
 * Suggest related entries for a given text context.
 */
server.registerTool(
  "memory_suggest",
  {
    title: "Suggest Related Memories",
    description: "Sugiere entradas de memoria relacionadas con un contexto dado. Útil para obtener contexto antes de una tarea.",
    inputSchema: {
      context: z.string().describe("Texto o contexto para buscar sugerencias"),
      limit: z.number().optional().default(5).describe("Máximo de sugerencias"),
    },
  },
  async ({ context, limit }) => {
    const related = findRelatedEntries(context, "", limit)

    if (related.length === 0) {
      return { content: [{ type: "text" as const, text: `No se encontraron entradas relacionadas con "${context}"` }] }
    }

    const formatted = related
      .map((r) => `[${r.cat}] ${r.key} (${r.id})\n  ${r.content}\n  File: ${r.file} | Tags: ${r.tags} | Date: ${r.date}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: `🔍 Sugerencias para "${context}":\n\n${formatted}` }] }
  }
)

/**
 * Register the memory_summary tool.
 * Get or set file summaries to save tokens when reading large files.
 * 
 * @example
 * ```typescript
 * // Set a summary
 * await callTool("memory_summary", {
 *   action: "set",
 *   file: "src/complex.ts",
 *   summary: "Complex module handling X, Y, Z"
 * })
 * 
 * // Get a summary
 * await callTool("memory_summary", {
 *   action: "get",
 *   file: "src/complex.ts"
 * })
 * ```
 */
server.registerTool(
  "memory_summary",
  {
    title: "File Summary",
    description: "Guarda o recupera un resumen de un archivo grande para ahorrar tokens.",
    inputSchema: {
      action: z.enum(["get", "set"]).describe("get para leer, set para guardar"),
      file: z.string().describe("Ruta del archivo"),
      summary: z.string().optional().default("").describe("Resumen del archivo (solo para set)"),
    },
  },
  async ({ action, file, summary }) => {
    const data = readMemory()

    if (action === "get") {
      const lines = data.split("\n")
      const summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))
      if (summaryIdx === -1) {
        return { content: [{ type: "text" as const, text: `No hay resúmenes guardados para "${file}"` }] }
      }

      const summaryLines = lines.slice(summaryIdx + 1).filter((l) => l.includes(":"))
      const match = summaryLines.find((l) => l.startsWith(`  ${file}:`))
      if (!match) {
        return { content: [{ type: "text" as const, text: `No hay resumen para "${file}"` }] }
      }

      const summaryText = match.replace(`  ${file}: `, "")
      return { content: [{ type: "text" as const, text: summaryText }] }
    }

    const lines = data.split("\n")
    let summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))

    if (summaryIdx === -1) {
      lines.push("", "summaries:")
      summaryIdx = lines.length - 1
    }

    const summaryLines = lines.slice(summaryIdx + 1).filter((l) => l.includes(":"))
    const existingIdx = summaryLines.findIndex((l) => l.startsWith(`  ${file}:`))

    if (existingIdx !== -1) {
      summaryLines[existingIdx] = `  ${file}: ${summary}`
    } else {
      summaryLines.push(`  ${file}: ${summary}`)
    }

    lines.splice(summaryIdx + 1, lines.length - summaryIdx - 1, ...summaryLines)
    writeMemory(lines.join("\n"))
    return {
      content: [{ type: "text" as const, text: `📝 Resumen guardado para ${file}` }],
    }
  }
)

/**
 * Register the memory_archive tool.
 * Archive old entries (>30 days) to archive.toon to keep memory clean.
 * 
 * @example
 * ```typescript
 * await callTool("memory_archive", {})
 * // "📦 Archivadas 5 entradas antiguas"
 * ```
 */
server.registerTool(
  "memory_archive",
  {
    title: "Archive Old Entries",
    description: "Mover entradas antiguas (>30 días) a archive.toon para mantener la memoria limpia.",
    inputSchema: {},
  },
  async () => {
    const result = archiveOldEntries()
    
    if (result.archived === 0) {
      return { content: [{ type: "text" as const, text: "No hay entradas antiguas para archivar" }] }
    }
    
    return {
      content: [{ 
        type: "text" as const, 
        text: `📦 Archivadas ${result.archived} entradas antiguas\n📋 Quedan ${result.kept} entradas activas` 
      }],
    }
  }
)

/**
 * Register the memory_encrypt tool.
 * Enable AES-256-GCM encryption for the memory file.
 * 
 * ⚠️ Warning: Save the encryption key! It cannot be recovered.
 * 
 * @example
 * ```typescript
 * await callTool("memory_encrypt", {})
 * // "🔐 Encriptación habilitada\n⚠️ Guarda esta clave: ..."
 * ```
 */
server.registerTool(
  "memory_encrypt",
  {
    title: "Enable Encryption",
    description: "Habilita encriptación AES-256-GCM para la memoria. La clave se genera automáticamente.",
    inputSchema: {},
  },
  async () => {
    const config = loadConfig()
    
    if (config.encrypted) {
      return { content: [{ type: "text" as const, text: "La encriptación ya está habilitada" }] }
    }
    
    const key = getKey()
    if (!key) {
      return { content: [{ type: "text" as const, text: "❌ Define TOON_MEMORY_KEY en el entorno antes de encriptar" }] }
    }
    
    const data = readFileSync(MEMORY_FILE, "utf-8")
    const encrypted = encrypt(data, key)
    writeFileSync(MEMORY_FILE, encrypted)
    
    saveConfig({ encrypted: true })
    
    return {
      content: [{ type: "text" as const, text: "🔐 Encriptación habilitada" }],
    }
  }
)

/**
 * Register the memory_decrypt tool.
 * Disable encryption and decrypt the memory file.
 * 
 * @example
 * ```typescript
 * await callTool("memory_decrypt", { key: "your-encryption-key" })
 * // "🔓 Encriptación deshabilitada"
 * ```
 */
server.registerTool(
  "memory_decrypt",
  {
    title: "Disable Encryption",
    description: "Deshabilita la encriptación y decodifica la memoria.",
    inputSchema: {
      key: z.string().describe("Clave de encriptación"),
    },
  },
  async ({ key }) => {
    const config = loadConfig()
    
    if (!config.encrypted) {
      return { content: [{ type: "text" as const, text: "La encriptación no está habilitada" }] }
    }
    
    const resolvedKey = key || getKey() || ""
    if (!resolvedKey) {
      return { content: [{ type: "text" as const, text: "❌ No hay clave. Pásala como argumento o la del archivo .env" }] }
    }
    
    try {
      const data = readFileSync(MEMORY_FILE, "utf-8")
      const decrypted = decrypt(data, resolvedKey)
      
      writeFileSync(MEMORY_FILE, decrypted)
      saveConfig({ encrypted: false })
      
      return {
        content: [{ type: "text" as const, text: "🔓 Encriptación deshabilitada" }],
      }
    } catch {
      return { content: [{ type: "text" as const, text: "❌ Clave incorrecta o datos corruptos" }] }
    }
  }
)

/**
 * Register the memory_captured tool.
 * Show activity captured automatically by hooks (opt-in, off by default).
 */
server.registerTool(
  "memory_captured",
  {
    title: "List Captured Activity",
    description: "Muestra el log de actividad capturado automáticamente por los hooks (solo si la captura está habilitada). Útil para promover observaciones a memoria con memory_remember.",
    inputSchema: {
      limit: z.number().optional().default(20).describe("Máximo de observaciones a mostrar"),
      tool: z.string().optional().default("").describe("Filtrar por nombre de herramienta"),
      file: z.string().optional().default("").describe("Filtrar por archivo"),
      clear: z.boolean().optional().default(false).describe("Si true, limpia el log de captura"),
    },
  },
  async ({ limit, tool, file, clear }) => {
    if (clear) {
      if (existsSync(OBSERVATIONS_FILE)) {
        writeFileSync(OBSERVATIONS_FILE, "version: 1\nobservations[0|]{ts|session|agent|branch|tool|hash|file|summary}:\n")
      }
      return { content: [{ type: "text" as const, text: "🧹 Log de captura limpiado" }] }
    }

    let obs = readObservations()
    if (tool) obs = obs.filter((o) => o.tool.toLowerCase().includes(tool.toLowerCase()))
    if (file) obs = obs.filter((o) => o.file.toLowerCase().includes(file.toLowerCase()))
    obs = obs.slice(-limit).reverse()

    if (obs.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No hay actividad capturada. La captura está desactivada por defecto; actívala con `toon-memory capture on`.",
        }],
      }
    }

    const formatted = obs
      .map((o) => `[${o.ts}] ${o.agent}@${o.branch}/${o.tool}${o.file ? ` (${o.file})` : ""}\n  ${o.summary}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: `🔍 Actividad capturada (${obs.length}):\n\n${formatted}` }] }
  }
)

/**
 * Register the memory_consolidate tool.
 * Deterministic de-duplication of memory entries (no LLM).
 */
server.registerTool(
  "memory_consolidate",
  {
    title: "Consolidate Memory",
    description: "Consolida la memoria eliminando entradas con contenido idéntico (mantiene la primera). Determinista, sin LLM.",
    inputSchema: {},
  },
  async () => {
    const result = consolidateEntries()
    if (result.removed === 0) {
      return { content: [{ type: "text" as const, text: `✅ Memoria ya consolidada (${result.kept} entradas, 0 duplicados)` }] }
    }
    return {
      content: [{
        type: "text" as const,
        text: `🧹 Consolidadas ${result.removed} entradas duplicadas.\nQuedan ${result.kept} activas.\nDuplicados: ${result.duplicates.join(", ")}`,
      }],
    }
  }
)

/**
 * Register the memory_sessions tool.
 * File-based multi-session coordination — shows other active agent sessions
 * (branch, files, last-seen) and soft conflicts, so parallel sessions don't
 * step on each other. No server, no network, no LLM.
 */
server.registerTool(
  "memory_sessions",
  {
    title: "Active Sessions & Conflicts",
    description: "Muestra las sesiones de agente activas en este proyecto (rama git, archivos tocados, last-seen) y detecta conflictos suaves (archivos tocados por 2+ sesiones). Úsalo al iniciar para no pisar el trabajo de otras sesiones paralelas.",
    inputSchema: {
      conflictsOnly: z.boolean().optional().default(false).describe("Si true, muestra solo conflictos suaves"),
    },
  },
  async ({ conflictsOnly }) => {
    const selfId = resolveSessionId()
    const { active, conflicts } = coordinationView(selfId)

    if (conflictsOnly) {
      if (conflicts.length === 0) {
        return { content: [{ type: "text" as const, text: "✅ No hay conflictos suaves entre sesiones activas." }] }
      }
      const lines = conflicts.map((c) => {
        const who = c.sessions.map((s) => `${s.agent}@${s.branch} (${s.id})`).join(", ")
        return `⚠️ ${c.file}\n   ↔ ${who}`
      })
      return {
        content: [{ type: "text" as const, text: `🔥 Conflictos suaves (${conflicts.length}):\n\n${lines.join("\n\n")}` }],
      }
    }

    if (active.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "🟢 No hay otras sesiones activas en este proyecto.\n(Esta sesión: " + selfId + " @ " + currentBranch() + ")",
        }],
      }
    }

    const ttlMin = Math.round(SESSION_TTL_MS / 60000)
    const section = (s: ReturnType<typeof coordinationView>["active"][number]) => {
      const mins = Math.max(0, Math.round(s.ageMs / 60000))
      const tag = s.id === selfId ? " (tú)" : ""
      const ended = s.ended ? " 🏁" : ""
      const files = Object.keys(s.files).slice(0, 8).map((f) => `      • ${f}`).join("\n")
      const fileBlock = files ? `\n   Archivos:\n${files}` : ""
      return `• ${s.agent} @ ${s.branch}${tag}${ended}\n   id: ${s.id}\n   hace ${mins} min${fileBlock}`
    }

    const parts = [
      `🧭 Sesiones activas (${active.length}) — ventana ${ttlMin} min:`,
      "",
      ...active.map(section),
    ]

    if (conflicts.length > 0) {
      parts.push("", `🔥 Conflictos suaves (${conflicts.length}):`)
      for (const c of conflicts) {
        const who = c.sessions.map((s) => `${s.agent}@${s.branch}`).join(", ")
        parts.push(`   ⚠️ ${c.file}  ↔  ${who}`)
      }
    } else {
      parts.push("", "✅ Sin conflictos suaves detectados.")
    }

    return { content: [{ type: "text" as const, text: parts.join("\n") }] }
  }
)

// Startup TTL prune: drop entries whose TTL has elapsed. Best-effort — never
// block server startup on a prune failure.
try {
  pruneExpiredEntries()
} catch {
  // ignore — pruning is non-critical for serving requests
}

const transport = new StdioServerTransport()
await server.connect(transport)
