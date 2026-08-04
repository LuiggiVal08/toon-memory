/**
 * Encrypted sidecar vault for secrets.
 *
 * The main memory file (data.toon) stays a readable, open TOON format — that
 * is the product's philosophy. But that means credentials and API keys cannot
 * live there. `secrets.toon` is a whole-file AES-256-GCM vault (reusing the
 * main crypto) that keeps secret values out of plaintext while the rest of the
 * memory remains open.
 *
 * Internal layout is the same TOON line format, one entry per secret:
 *   `id|secret|key|iv:authTag:ciphertext|file|tags|date|ttl|0|links|...`
 * Only the `content` field carries the encrypted value; the whole file is then
 * encrypted again at rest, so no metadata leaks either. Requires
 * TOON_MEMORY_KEY (same key as memory_encrypt). Deterministic, offline.
 */

import { existsSync } from "fs"
import { generateId, parseTTL } from "./entries"
import { SECRETS_FILE, getKey } from "./config"
import { encrypt, decrypt } from "./crypto"
import { safeWrite } from "./memory-io"
import { readUnderLock } from "../lib/lock"
import { parseToonLine, toToonLine } from "../lib/utils"

const VAULT_HEADER = "version: 1\nentries[0|]{id|category|key|content|file|tags|date|ttl|accessed|links}:\n"

/** Resolve the vault key or throw a friendly error telling the user how to fix it. */
export function vaultKey(): string {
  const key = getKey()
  if (!key) {
    throw new Error(
      "TOON_MEMORY_KEY is not set — the secrets vault needs it.\n  export TOON_MEMORY_KEY=<64-hex-char-key>\n  (generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")"
    )
  }
  return key
}

/** Read the vault and return its decrypted TOON content ("" when the vault doesn't exist yet). */
export function readVault(): string {
  if (!existsSync(SECRETS_FILE)) return ""
  const key = vaultKey()
  const raw = readUnderLock(SECRETS_FILE)
  try {
    return decrypt(raw, key)
  } catch {
    throw new Error("Failed to decrypt secrets.toon — wrong TOON_MEMORY_KEY or corrupted vault.")
  }
}

/** Encrypt the given TOON content and persist it to secrets.toon (atomic + locked). */
export function writeVault(content: string): void {
  const key = vaultKey()
  safeWrite(SECRETS_FILE, encrypt(content, key))
}

/** Parse vault content into a map of key -> { id, file, tags, date, ttl } plus the ciphertext. */
function vaultEntries(content: string): Array<{ id: string; key: string; value: string; file: string; tags: string; date: string; ttl: string }> {
  const out: Array<{ id: string; key: string; value: string; file: string; tags: string; date: string; ttl: string }> = []
  for (const line of content.split("\n")) {
    if (!line.startsWith("  ") || !line.includes("|")) continue
    const parts = parseToonLine(line)
    if (parts.length < 7) continue
    out.push({ id: parts[0], key: parts[2], value: parts[3] || "", file: parts[4] || "", tags: parts[5] || "", date: parts[6] || "", ttl: parts[7] || "" })
  }
  return out
}

/** Rebuild the vault TOON content from a list of parsed secrets. */
function rebuildVault(list: Array<{ id: string; key: string; value: string; file: string; tags: string; date: string; ttl: string }>): string {
  const lines = [
    "version: 1",
    `[${list.length}|]{id|category|key|content|file|tags|date|ttl|accessed|links}:`,
    ...list.map((s) =>
      toToonLine([s.id, "secret", s.key, s.value, s.file, s.tags, s.date, s.ttl, "0", ""])
    ),
  ]
  return lines.join("\n")
}

export interface StoredSecret {
  key: string
  value: string
  file: string
  tags: string[]
  date: string
  ttl: string
}

export interface SecretMeta {
  id: string
  key: string
  file: string
  tags: string[]
  date: string
  ttl: string
}

/** Store (or overwrite) a secret. The value is AES-256-GCM encrypted at rest. */
export function storeSecret(
  key: string,
  value: string,
  opts: { file?: string; tags?: string; ttl?: string } = {}
): { id: string; date: string } {
  if (!value) throw new Error("A secret needs a non-empty value.")
  const vk = vaultKey()
  const encrypted = encrypt(value, vk)
  const content = readVault()
  const list = vaultEntries(content)
  const date = new Date().toISOString().split("T")[0]
  const resolvedTtl = parseTTL(opts.ttl || "")

  const existing = list.find((s) => s.key === key)
  const id = existing ? existing.id : generateId()
  const merged: Array<{ id: string; key: string; value: string; file: string; tags: string; date: string; ttl: string }> = []
  for (const s of list) {
    if (s.key === key) {
      merged.push({ id, key, value: encrypted, file: opts.file || s.file, tags: opts.tags || s.tags, date, ttl: resolvedTtl || s.ttl })
    } else {
      merged.push(s)
    }
  }
  if (!existing) {
    merged.push({ id, key, value: encrypted, file: opts.file || "", tags: opts.tags || "", date, ttl: resolvedTtl })
  }

  writeVault(rebuildVault(merged))
  return { id, date }
}

/** Retrieve a secret's decrypted value plus metadata. Returns null when not found. */
export function getSecret(key: string): StoredSecret | null {
  const content = readVault()
  if (!content) return null
  const hit = vaultEntries(content).find((s) => s.key === key)
  if (!hit) return null
  const vk = vaultKey()
  let value: string
  try {
    value = decrypt(hit.value, vk)
  } catch {
    throw new Error(`Failed to decrypt secret "${key}" — wrong TOON_MEMORY_KEY or corrupted value.`)
  }
  return {
    key,
    value,
    file: hit.file,
    tags: hit.tags.split(";").map((t) => t.trim()).filter(Boolean),
    date: hit.date,
    ttl: hit.ttl,
  }
}

/** List vault metadata (keys, files, dates) without decrypting any value. */
export function listSecrets(): SecretMeta[] {
  const content = readVault()
  if (!content) return []
  return vaultEntries(content).map((s) => ({
    id: s.id,
    key: s.key,
    file: s.file,
    tags: s.tags.split(";").map((t) => t.trim()).filter(Boolean),
    date: s.date,
    ttl: s.ttl,
  }))
}

/** Remove a secret by key. Returns false when the key did not exist. */
export function forgetSecret(key: string): boolean {
  const content = readVault()
  if (!content) return false
  const list = vaultEntries(content)
  const next = list.filter((s) => s.key !== key)
  if (next.length === list.length) return false
  writeVault(rebuildVault(next))
  return true
}
