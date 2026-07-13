import { openSync, closeSync, writeFileSync, readFileSync, unlinkSync, existsSync, statSync, renameSync } from "fs"

/**
 * Minimal, dependency-free, cross-process advisory locking + atomic writes.
 *
 * Used so multiple parallel agent sessions (e.g. several OpenCode sessions)
 * can safely read/modify the same memory files without corrupting them and
 * without a long-lived server. Lock is reentrant within the same process.
 */

const STALE_MS = 15000
const LOCK_TIMEOUT_MS = 10000

function isAlive(pid: number): boolean {
  if (!pid || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function tryAcquire(lockFile: string): boolean {
  if (existsSync(lockFile)) {
    const age = Date.now() - statSync(lockFile).mtimeMs
    let stale = age > STALE_MS
    if (!stale) {
      try {
        const pid = parseInt(readFileSync(lockFile, "utf-8").trim(), 10)
        if (!isAlive(pid)) stale = true
      } catch {
        stale = true
      }
    }
    if (stale) {
      try {
        unlinkSync(lockFile)
      } catch {
        // ignore
      }
    } else {
      return false
    }
  }
  try {
    const fd = openSync(lockFile, "wx")
    writeFileSync(fd, String(process.pid))
    closeSync(fd)
    return true
  } catch {
    return false
  }
}

const held = new Map<string, number>()

/** Run `fn` while holding an advisory lock on `file` (cross-process safe). */
export function withLockSync(file: string, fn: () => void): void {
  const lockFile = `${file}.lock`
  const depth = held.get(lockFile) ?? 0
  if (depth > 0) {
    held.set(lockFile, depth + 1)
    try {
      fn()
    } finally {
      const d = (held.get(lockFile) ?? 0) - 1
      if (d <= 0) held.delete(lockFile)
      else held.set(lockFile, d)
    }
    return
  }

  const deadline = Date.now() + LOCK_TIMEOUT_MS
  while (!tryAcquire(lockFile)) {
    if (Date.now() > deadline) throw new Error(`toon-memory lock timeout: ${file}`)
    const t = Date.now() + 10
    while (Date.now() < t) {
      // busy-wait (short; tool writes are infrequent)
    }
  }

  held.set(lockFile, 1)
  try {
    fn()
  } finally {
    const d = (held.get(lockFile) ?? 0) - 1
    if (d <= 0) {
      held.delete(lockFile)
      try {
        unlinkSync(lockFile)
      } catch {
        // ignore
      }
    } else {
      held.set(lockFile, d)
    }
  }
}

/** Write `content` to `file` atomically via a temp file + rename (crash-safe). */
export function atomicWrite(file: string, content: string): void {
  const tmp = `${file}.tmp`
  writeFileSync(tmp, content)
  renameSync(tmp, file)
}

/**
 * Read `file` while holding its advisory lock (cross-process safe).
 * Use for read-modify-write sequences (e.g. pruning expired entries) that
 * must not race another process writing the same file. Reentrant with
 * `withLockSync`, so it is safe to call from inside an outer lock.
 */
export function readUnderLock(file: string, encoding: BufferEncoding = "utf-8"): string {
  let content = ""
  withLockSync(file, () => {
    content = readFileSync(file, encoding)
  })
  return content
}
