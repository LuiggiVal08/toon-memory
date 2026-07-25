/**
 * Git reading without shell — reads .git/ filesystem directly.
 *
 * Zero child_process usage. Parses binary git index, commit objects,
 * and .gitignore for status summaries. All deterministic, no network.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs"
import { join } from "path"
import { inflateSync } from "zlib"
import { currentBranch } from "./sessions"

function gitDir(cwd?: string): string | null {
  const dotgit = join(cwd || process.cwd(), ".git")
  if (!existsSync(dotgit)) return null
  if (statSync(dotgit).isDirectory()) return dotgit
  // Worktree: .git is a file pointing to the real dir
  const pointer = readFileSync(dotgit, "utf-8").trim()
  if (pointer.startsWith("gitdir:")) {
    const target = pointer.slice(7).trim()
    return target.startsWith("/") ? target : join(process.cwd(), target)
  }
  return null
}

function resolveHead(cwd?: string): string | null {
  const dir = gitDir(cwd)
  if (!dir) return null
  const headPath = join(dir, "HEAD")
  if (!existsSync(headPath)) return null
  const head = readFileSync(headPath, "utf-8").trim()
  if (head.startsWith("ref:")) {
    const refPath = join(dir, head.slice(4).trim())
    if (!existsSync(refPath)) return null
    return readFileSync(refPath, "utf-8").trim()
  }
  // Detached HEAD
  return head || null
}

// ── Git index parsing ────────────────────────────────────────────────

interface IndexEntry {
  mtimeSec: number
  mtimeNsec: number
  dev: number
  ino: number
  mode: number
  uid: number
  gid: number
  size: number
  sha: string
  flags: number
  name: string
}

/**
 * Parse the binary .git/index file.
 * Format: 12-byte header + N * (variable) entries.
 * Each entry: 40 bytes fixed + 2 bytes flags + variable name (null-padded to 8).
 */
function parseIndex(dir: string): IndexEntry[] {
  const indexPath = join(dir, "index")
  if (!existsSync(indexPath)) return []

  const buf = readFileSync(indexPath)
  if (buf.length < 12) return []

  const sig = buf.toString("ascii", 0, 4)
  if (sig !== "DIRC") return []

  const version = buf.readUInt32BE(4)
  const count = buf.readUInt32BE(8)
  if (version < 2 || version > 4) return []

  const entries: IndexEntry[] = []
  let offset = 12

  for (let i = 0; i < count && offset + 62 <= buf.length; i++) {
    const entryStart = offset
    const mtimeSec = buf.readUInt32BE(offset)
    const mtimeNsec = buf.readUInt32BE(offset + 4)
    const dev = buf.readUInt32BE(offset + 8)
    const ino = buf.readUInt32BE(offset + 12)
    const mode = buf.readUInt32BE(offset + 16)
    const uid = buf.readUInt32BE(offset + 20)
    const gid = buf.readUInt32BE(offset + 24)
    const size = buf.readUInt32BE(offset + 28)
    const sha = buf.slice(offset + 32, offset + 52).toString("hex")
    const flags = buf.readUInt16BE(offset + 52)

    // Name starts at offset 62, null-terminated, padded to 8-byte alignment
    const nameLen = flags & 0x0fff
    const nameStart = entryStart + 62
    let name: string
    if (nameLen > 0 && nameStart + nameLen <= buf.length) {
      name = buf.toString("utf-8", nameStart, nameStart + nameLen)
    } else {
      // Read until null byte
      const end = buf.indexOf(0, nameStart)
      name = end >= 0 ? buf.toString("utf-8", nameStart, end) : buf.toString("utf-8", nameStart)
    }

    // Skip extended data (v3+): 4 extra bytes of padding before the name
    if (version >= 3) {
      // In v3, there's an extra 4-byte field (padding/extended)
      // The name starts at entryStart + 62 regardless in v2-v4
    }

    // Compute total entry size: 62 bytes + name length, padded to 8-byte boundary
    const rawLen = 62 + name.length
    const paddedLen = Math.ceil(rawLen / 8) * 8
    offset = entryStart + paddedLen

    entries.push({ mtimeSec, mtimeNsec, dev, ino, mode, uid, gid, size, sha, flags, name })
  }

  return entries
}

/**
 * Parse .gitignore patterns into a set of ignored paths.
 * Simplified: handles exact filenames and directory names.
 */
function parseGitignore(dir: string): Set<string> {
  const ignored = new Set<string>()
  const gitignorePath = join(dir, "..", ".gitignore")
  if (!existsSync(gitignorePath)) return ignored

  const lines = readFileSync(gitignorePath, "utf-8").split("\n")
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    // Strip leading slash (root-only pattern)
    const pattern = line.replace(/^\//, "")
    // Simple: just track the pattern as-is
    if (pattern) ignored.add(pattern)
  }
  return ignored
}

/**
 * Read the git index and return the list of tracked file paths.
 * These are the files git knows about (staged or tracked).
 * @param cwd Working directory (default: process.cwd())
 */
export function readGitIndex(cwd?: string): string[] {
  const dir = gitDir(cwd)
  if (!dir) return []
  return parseIndex(dir).map((e) => e.name)
}

/**
 * Parse a raw git object (decompressed with zlib).
 * Returns the object type and content.
 */
function readObject(sha: string, cwd?: string): { type: string; content: string } | null {
  const dir = gitDir(cwd)
  if (!dir) return null
  const objPath = join(dir, "objects", sha.slice(0, 2), sha.slice(2))
  if (!existsSync(objPath)) return null

  try {
    const compressed = readFileSync(objPath)
    const decompressed = inflateSync(compressed)
    const str = decompressed.toString("utf-8")
    const nullIdx = str.indexOf("\0")
    if (nullIdx < 0) return null
    const header = str.slice(0, nullIdx)
    const type = header.split(" ")[0]
    const content = str.slice(nullIdx + 1)
    return { type, content }
  } catch {
    return null
  }
}

export interface GitCommit {
  hash: string
  shortHash: string
  subject: string
  author: string
  date: string
}

/**
 * Read the n most recent commits by walking the commit chain from HEAD.
 * @param cwd Working directory (default: process.cwd())
 */
export function readRecentCommits(count: number = 10, cwd?: string): GitCommit[] {
  const sha = resolveHead(cwd)
  if (!sha) return []

  const commits: GitCommit[] = []
  const visited = new Set<string>()
  let current = sha

  while (commits.length < count && current && !visited.has(current)) {
    visited.add(current)
    const obj = readObject(current, cwd)
    if (!obj || obj.type !== "commit") break

    const lines = obj.content.split("\n")
    let subject = ""
    let author = ""
    let date = ""
    let parent: string | null = null
    let pastHeaders = false

    for (const line of lines) {
      if (line.startsWith("author ")) {
        const match = line.match(/^author\s+(.+?)\s+<[^>]+>\s+(\d+)/)
        if (match) {
          author = match[1]
          const ts = parseInt(match[2])
          date = new Date(ts * 1000).toISOString().split("T")[0]
        }
      } else if (line.startsWith("parent ")) {
        parent = line.slice(7).trim()
      } else if (line.startsWith("tree ")) {
        // skip
      } else if (line.startsWith("committer ")) {
        pastHeaders = true
      } else if (pastHeaders && !subject && line.trim()) {
        subject = line.trim()
      }
    }

    commits.push({
      hash: current,
      shortHash: current.slice(0, 7),
      subject,
      author,
      date,
    })

    current = parent || ""
  }

  return commits
}

/**
 * Get a summary of the current git status.
 * @param cwd Working directory (default: process.cwd())
 */
export function gitStatusSummary(cwd?: string): {
  branch: string
  head: string | null
  trackedFiles: number
  recentCommits: GitCommit[]
  hasGitignore: boolean
} {
  const branch = currentBranch()
  const head = resolveHead(cwd)
  const trackedFiles = readGitIndex(cwd).length
  const recentCommits = readRecentCommits(5, cwd)
  const hasGitignore = existsSync(join(cwd || process.cwd(), ".gitignore"))

  return { branch, head, trackedFiles, recentCommits, hasGitignore }
}


