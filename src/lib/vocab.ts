/**
 * Project-vocabulary discovery for toon-memory (Hito 7).
 *
 * On `toon-memory init` we scan the project's dependency manifests and turn
 * each dependency into a tag keyword. Those keywords are written to
 * `config.json` as `vocab`, and `memory_remember`'s tag inference matches
 * against them — so a project that depends on `redis` auto-tags entries that
 * mention "redis" with `redis`, without a hand-maintained glossary.
 *
 * Deterministic and offline: we only read manifest files, never hit the network.
 */

import { existsSync, readFileSync } from "fs"
import { join } from "path"

/** tag -> keywords that should attach that tag. */
export type Vocab = Record<string, string[]>

/** Cargo-style manifest names we understand. */
const MANIFESTS = ["package.json", "Cargo.toml", "requirements.txt", "pyproject.toml", "go.mod"]

/**
 * Scan `root` for dependency manifests and return a vocabulary derived from
 * the declared dependencies. Missing manifests are silently skipped.
 */
export function extractProjectDeps(root: string): Vocab {
  const vocab: Vocab = {}

  const pkgPath = join(root, "package.json")
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
      for (const name of Object.keys(deps)) {
        const tag = name.replace(/^@[^/]+\//, "").toLowerCase()
        vocab[tag] = name.includes("/") ? [name.toLowerCase(), tag] : [name.toLowerCase()]
      }
    } catch {
      // ignore malformed manifest
    }
  }

  const cargoPath = join(root, "Cargo.toml")
  if (existsSync(cargoPath)) {
    try {
      const txt = readFileSync(cargoPath, "utf-8")
      const block = txt.match(/\[dependencies\][\s\S]*?(?:\n\[|$)/)?.[0] || ""
      for (const line of block.split("\n")) {
        const m = line.match(/^\s*([A-Za-z0-9_-]+)\s*=/)
        if (m) {
          const tag = m[1].toLowerCase()
          vocab[tag] = [tag]
        }
      }
    } catch {
      // ignore
    }
  }

  for (const file of ["requirements.txt", "pyproject.toml"]) {
    const p = join(root, file)
    if (!existsSync(p)) continue
    try {
      const txt = readFileSync(p, "utf-8")
      for (const raw of txt.split("\n")) {
        const name = raw.trim().split(/[<>=!~ \[\]]/)[0].toLowerCase()
        if (!name || name.startsWith("#") || name.includes("[") ) continue
        vocab[name] = [name]
      }
    } catch {
      // ignore
    }
  }

  const goPath = join(root, "go.mod")
  if (existsSync(goPath)) {
    try {
      const txt = readFileSync(goPath, "utf-8")
      for (const raw of txt.split("\n")) {
        const m = raw.match(/^\s*([A-Za-z0-9_./-]+)\s+v[0-9]/)
        if (m) {
          const full = m[1]
          const tag = full.split("/").pop()!.toLowerCase()
          vocab[tag] = [tag, full.toLowerCase()]
        }
      }
    } catch {
      // ignore
    }
  }

  return vocab
}

/** Merge two vocabularies; `extra` wins on key collisions. */
export function mergeVocab(base: Vocab, extra: Vocab): Vocab {
  return { ...base, ...extra }
}

export { MANIFESTS }
