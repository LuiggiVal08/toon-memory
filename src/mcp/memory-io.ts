import { withLockSync, atomicWrite, readUnderLock } from "../lib/lock"
import { loadConfig, ensureMemoryFile, MEMORY_FILE, getKey } from "./config"
import { encrypt, decrypt } from "./crypto"

/**
 * Write `content` to a memory file atomically and safely across processes.
 * Uses an advisory lock (temp+rename) so parallel sessions can't corrupt
 * the same file. Encryption, if enabled, is applied by the caller.
 */
export function safeWrite(file: string, content: string): void {
  withLockSync(file, () => atomicWrite(file, content))
}

/**
 * Read memory file, decrypting if encryption is enabled.
 * Key is read from TOON_MEMORY_KEY env var.
 */
export function readMemory(): string {
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
 */
export function writeMemory(content: string): void {
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
