/**
 * Project structure scanner for toon-memory.
 *
 * Reads the project filesystem (package.json, directory tree, .env.example)
 * to build a compact structural overview. Zero LLM, no network.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".toon-memory", "dist", "build",
  ".next", ".nuxt", "coverage", "__pycache__", ".venv",
  "vendor", ".cache", ".turbo",
])

const MANIFEST_NAMES = [
  "package.json", "Cargo.toml", "requirements.txt",
  "pyproject.toml", "go.mod", "Gemfile", "pom.xml",
]

export interface ProjectStructure {
  /** Top-level directories (non-skipped). */
  dirs: string[]
  /** Key files at root level. */
  rootFiles: string[]
  /** Source file count (recursive, all extensions). */
  sourceFileCount: number
  /** File extension breakdown: ext → count. */
  extensions: Record<string, number>
}

/**
 * Scan the project directory tree (max depth 2) and return a structural summary.
 */
export function scanProjectStructure(root: string, maxDepth: number = 2): ProjectStructure {
  const dirs: string[] = []
  const rootFiles: string[] = []
  let sourceFileCount = 0
  const extensions: Record<string, number> = {}

  function walk(dir: string, depth: number): void {
    if (depth > maxDepth) return
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.startsWith(".") && depth === 0 && entry !== ".env.example" && entry !== ".env.template") continue
      const fullPath = join(dir, entry)
      let isDir: boolean
      try {
        isDir = statSync(fullPath).isDirectory()
      } catch {
        continue
      }
      if (isDir) {
        if (SKIP_DIRS.has(entry)) continue
        if (depth === 0) dirs.push(entry)
        walk(fullPath, depth + 1)
      } else {
        if (depth === 0) rootFiles.push(entry)
        sourceFileCount++
        const ext = extname(entry) || "(no ext)"
        extensions[ext] = (extensions[ext] || 0) + 1
      }
    }
  }

  walk(root, 0)
  return { dirs: dirs.sort(), rootFiles: rootFiles.sort(), sourceFileCount, extensions }
}

// ── .env.example parser ──────────────────────────────────────────────

export interface EnvVar {
  name: string
  comment: string
  default: string
}

/**
 * Parse .env.example (or .env.template, .env.sample) into structured env vars.
 * Format: VAR_NAME=default # comment
 */
export function readEnvExample(root: string): EnvVar[] {
  const candidates = [".env.example", ".env.template", ".env.sample"]
  for (const name of candidates) {
    const p = join(root, name)
    if (existsSync(p)) {
      try {
        const content = readFileSync(p, "utf-8")
        return parseEnvContent(content)
      } catch {
        return []
      }
    }
  }
  return []
}

function parseEnvContent(content: string): EnvVar[] {
  const vars: EnvVar[] = []
  for (const raw of content.split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const eqIdx = line.indexOf("=")
    if (eqIdx < 0) continue
    const name = line.slice(0, eqIdx).trim()
    const rest = line.slice(eqIdx + 1)
    // Split default value from comment
    const hashIdx = rest.indexOf("#")
    const defaultVal = (hashIdx >= 0 ? rest.slice(0, hashIdx) : rest).trim()
    const comment = hashIdx >= 0 ? rest.slice(hashIdx + 1).trim() : ""
    vars.push({ name, comment, default: defaultVal })
  }
  return vars
}

// ── Manifest reader ──────────────────────────────────────────────────

export interface ProjectManifest {
  name: string
  version: string
  language: string
  description: string
  scripts: Record<string, string>
  deps: string[]
  devDeps: string[]
}

/**
 * Read project manifest (package.json, Cargo.toml, etc.) and return
 * a unified project info object.
 */
export function readManifest(root: string): ProjectManifest | null {
  // Try package.json first (most common)
  const pkgPath = join(root, "package.json")
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
      return {
        name: pkg.name || "",
        version: pkg.version || "",
        language: "javascript",
        description: pkg.description || "",
        scripts: pkg.scripts || {},
        deps: Object.keys(pkg.dependencies || {}),
        devDeps: Object.keys(pkg.devDependencies || {}),
      }
    } catch {
      // fall through
    }
  }

  // Cargo.toml
  const cargoPath = join(root, "Cargo.toml")
  if (existsSync(cargoPath)) {
    try {
      const txt = readFileSync(cargoPath, "utf-8")
      const nameMatch = txt.match(/^name\s*=\s*"([^"]+)"/m)
      const verMatch = txt.match(/^version\s*=\s*"([^"]+)"/m)
      const depsBlock = txt.match(/\[dependencies\]([\s\S]*?)(?:\[|$)/)?.[1] || ""
      const deps = [...depsBlock.matchAll(/^\s*([A-Za-z0-9_-]+)\s*=/gm)].map((m) => m[1])
      return {
        name: nameMatch?.[1] || "",
        version: verMatch?.[1] || "",
        language: "rust",
        description: "",
        scripts: {},
        deps,
        devDeps: [],
      }
    } catch {
      // fall through
    }
  }

  // pyproject.toml
  const pyPath = join(root, "pyproject.toml")
  if (existsSync(pyPath)) {
    try {
      const txt = readFileSync(pyPath, "utf-8")
      const nameMatch = txt.match(/^name\s*=\s*"([^"]+)"/m)
      const verMatch = txt.match(/^version\s*=\s*"([^"]+)"/m)
      return {
        name: nameMatch?.[1] || "",
        version: verMatch?.[1] || "",
        language: "python",
        description: "",
        scripts: {},
        deps: [],
        devDeps: [],
      }
    } catch {
      // fall through
    }
  }

  // go.mod
  const goPath = join(root, "go.mod")
  if (existsSync(goPath)) {
    try {
      const txt = readFileSync(goPath, "utf-8")
      const moduleMatch = txt.match(/^module\s+(.+)$/m)
      const deps = [...txt.matchAll(/^\s*([A-Za-z0-9_./-]+)\s+v[\d.]+/gm)].map((m) => m[1])
      return {
        name: moduleMatch?.[1] || "",
        version: "",
        language: "go",
        description: "",
        scripts: {},
        deps,
        devDeps: [],
      }
    } catch {
      // fall through
    }
  }

  return null
}
