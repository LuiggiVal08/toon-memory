import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

/** Base directory for memory storage */
export const MEMORY_DIR = join(process.cwd(), ".toon-memory", "memory")

/** Main memory data file */
export const MEMORY_FILE = join(MEMORY_DIR, "data.toon")

/** Archive file for old entries */
export const ARCHIVE_FILE = join(MEMORY_DIR, "archive.toon")

/** Observations log written by capture hooks (opt-in, separate from memory) */
export const OBSERVATIONS_FILE = join(MEMORY_DIR, "observations.toon")

/** Configuration file for encryption settings */
export const CONFIG_FILE = join(MEMORY_DIR, "config.json")

/** Maximum active entries before auto-archive (default 100, configurable via config.json) */
export function getMaxEntries(): number {
  const config = loadConfig()
  return config.maxEntries || 100
}

/** Legacy constant for backward compatibility */
export const MAX_ENTRIES = 100

/** Days before entries are archived */
export const ARCHIVE_DAYS = 30

/** Encryption algorithm for AES-256-GCM */
export const ALGORITHM = "aes-256-gcm"

/** Memory configuration with encryption settings */
export interface MemoryConfig {
  /** Whether encryption is enabled */
  encrypted: boolean
  /** Project-specific tag vocabulary discovered from dependencies (Hito 7). */
  vocab?: Record<string, string[]>
  /** Maximum active entries before auto-archive (default 100). */
  maxEntries?: number
}

/**
 * Load memory configuration from config.json.
 */
export function loadConfig(): MemoryConfig {
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
 */
export function saveConfig(config: MemoryConfig): void {
  ensureMemoryDir()
  let existing: Partial<MemoryConfig> = {}
  if (existsSync(CONFIG_FILE)) {
    try {
      existing = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"))
    } catch {
      existing = {}
    }
  }
  writeFileSync(CONFIG_FILE, JSON.stringify({ ...existing, ...config }, null, 2))
}

/**
 * Get the encryption key from environment variable.
 */
export function getKey(): string | undefined {
  return process.env.TOON_MEMORY_KEY
}

/**
 * Ensure memory directory exists, creating it if necessary.
 */
export function ensureMemoryDir(): void {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })
}

/**
 * Ensure memory file exists with default structure.
 */
export function ensureMemoryFile(): void {
  ensureMemoryDir()
  if (!existsSync(MEMORY_FILE)) {
    writeFileSync(MEMORY_FILE, "version: 1\nentries[0|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:\n")
  }
}
