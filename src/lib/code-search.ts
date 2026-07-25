/**
 * Simple code search utilities for toon-memory.
 *
 * Grep-like search across source files without external dependencies.
 * Used by context tools to find related files, callers, and references.
 * Zero LLM, no network, no AST parsing — pure string matching.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs"
import { join, extname, relative } from "path"

const SOURCE_EXTS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".rb", ".go", ".rs", ".java", ".kt",
  ".swift", ".c", ".cpp", ".h", ".hpp", ".cs",
  ".vue", ".svelte", ".astro",
])

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".toon-memory", "dist", "build",
  ".next", ".nuxt", "coverage", "__pycache__", ".venv",
  "vendor", ".cache", ".turbo",
])

export interface SearchResult {
  file: string
  line: number
  content: string
}

/**
 * Find files matching a simple pattern (substring match on filename).
 */
export function findFilesByPattern(root: string, pattern: string): string[] {
  const results: string[] = []
  const pat = pattern.toLowerCase()

  function walk(dir: string): void {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue
      const fullPath = join(dir, entry)
      let isDir: boolean
      try {
        isDir = statSync(fullPath).isDirectory()
      } catch {
        continue
      }
      if (isDir) {
        walk(fullPath)
      } else if (entry.toLowerCase().includes(pat)) {
        results.push(relative(root, fullPath))
      }
    }
  }

  walk(root)
  return results.sort()
}

/**
 * Search source file contents for a query string (case-insensitive substring).
 * Returns matching lines with file path and line number.
 */
export function searchCode(root: string, query: string, opts: { maxResults?: number; extensions?: string[] } = {}): SearchResult[] {
  const results: SearchResult[] = []
  const maxResults = opts.maxResults ?? 30
  const extensions = opts.extensions
    ? new Set(opts.extensions)
    : SOURCE_EXTS
  const q = query.toLowerCase()

  function walk(dir: string): void {
    if (results.length >= maxResults) return
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (results.length >= maxResults) return
      if (SKIP_DIRS.has(entry)) continue
      const fullPath = join(dir, entry)
      let isDir: boolean
      try {
        isDir = statSync(fullPath).isDirectory()
      } catch {
        continue
      }
      if (isDir) {
        walk(fullPath)
      } else {
        const ext = extname(entry)
        if (!extensions.has(ext)) continue
        try {
          const content = readFileSync(fullPath, "utf-8")
          const lines = content.split("\n")
          for (let i = 0; i < lines.length; i++) {
            if (results.length >= maxResults) return
            if (lines[i].toLowerCase().includes(q)) {
              results.push({
                file: relative(root, fullPath),
                line: i + 1,
                content: lines[i].trim(),
              })
            }
          }
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  walk(root)
  return results
}

/**
 * Find usages of a symbol (function/method/class name) across source files.
 * Searches for the symbol as a word boundary (not substring of another word).
 */
export function findCallers(root: string, symbol: string): SearchResult[] {
  const results: SearchResult[] = []
  const maxResults = 30

  // Build a word-boundary regex: matches the symbol but not when surrounded by word chars
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`(?<![\\w$])${escaped}(?![\\w$])`, "g")

  function walk(dir: string): void {
    if (results.length >= maxResults) return
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (results.length >= maxResults) return
      if (SKIP_DIRS.has(entry)) continue
      const fullPath = join(dir, entry)
      let isDir: boolean
      try {
        isDir = statSync(fullPath).isDirectory()
      } catch {
        continue
      }
      if (isDir) {
        walk(fullPath)
      } else {
        const ext = extname(entry)
        if (!SOURCE_EXTS.has(ext)) continue
        try {
          const content = readFileSync(fullPath, "utf-8")
          const lines = content.split("\n")
          for (let i = 0; i < lines.length; i++) {
            if (results.length >= maxResults) return
            regex.lastIndex = 0
            if (regex.test(lines[i])) {
              results.push({
                file: relative(root, fullPath),
                line: i + 1,
                content: lines[i].trim(),
              })
            }
          }
        } catch {
          // skip
        }
      }
    }
  }

  walk(root)
  return results
}

/**
 * Find test files related to a given pattern (e.g., a module name).
 */
export function findTestFiles(root: string, pattern: string): string[] {
  const pat = pattern.toLowerCase()
  return findFilesByPattern(root, ".test.").concat(findFilesByPattern(root, ".spec."))
    .filter((f) => f.toLowerCase().includes(pat) || pat.includes(f.split("/").pop()?.split(".")[0] || ""))
}
