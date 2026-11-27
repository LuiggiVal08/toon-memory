import { createHash } from "crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { dirname } from "path"
import { parseEntries } from "../lib/graph"
import { loadConfig, VECTORS_FILE } from "../mcp/config"
import { withLockSync } from "../lib/lock"

export interface DenseModule {
  embed(texts: string[], model?: string): Promise<number[][]>
}

export interface VectorMeta {
  model?: string
  hashes?: Map<string, string>
  builtAt?: string
  sourceHash?: string
}

export interface StoredVectors extends VectorMeta {
  dim: number
  vectors: Map<string, number[]>
}

export interface RebuildStats {
  written: number
  reused: number
  removed: number
  stale: number
  dim: number
}

export interface DenseDiagnostics {
  enabled: boolean
  model: string
  moduleSpec: string
  moduleLoaded: boolean
  error: string
  vectors: number
  dim: number
  stale: number
  builtAt: string
  sourceHash: string
  boost: number
  autoBuild: boolean
}

type MemoryEntry = { key: string; content: string; status?: string }

function activeEntries(data: string): MemoryEntry[] {
  return parseEntries(data).filter((e) => e.status !== "obsolete" && e.status !== "draft")
}

function entryHash(entry: MemoryEntry): string {
  return createHash("sha256").update(entry.key).update("\0").update(entry.content).digest("hex")
}

function sourceHash(entries: MemoryEntry[]): string {
  const hash = createHash("sha256")
  for (const entry of entries) hash.update(entry.key).update("\0").update(entry.content).update("\n")
  return hash.digest("hex")
}

export async function loadDenseModuleDetailed(): Promise<{
  module: DenseModule | null
  spec: string
  error: string
}> {
  const spec = process.env.TOON_MEMORY_DENSE_MODULE || "toon-memory-dense"
  try {
    const mod: any = await import(spec)
    const embed = mod?.embed || mod?.default?.embed || mod?.default
    if (typeof embed !== "function") return { module: null, spec, error: "module does not export embed()" }
    return { module: { embed }, spec, error: "" }
  } catch (error) {
    return { module: null, spec, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function loadDenseModule(): Promise<DenseModule | null> {
  return (await loadDenseModuleDetailed()).module
}

export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n === 0) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  const value = dot / (Math.sqrt(na) * Math.sqrt(nb))
  return Number.isFinite(value) ? value : 0
}

export function readVectors(): StoredVectors {
  const empty: StoredVectors = { dim: 0, vectors: new Map() }
  if (!existsSync(VECTORS_FILE)) return empty
  try {
    const buf = readFileSync(VECTORS_FILE)
    const newline = buf.indexOf(0x0a)
    if (newline === -1) return empty
    const header = buf.subarray(0, newline).toString("utf-8")
    const v1 = header.match(/^TMVEC1 (\d+)$/)
    const v2 = header.match(/^TMVEC2 (\d+)(?: (\S+))?(?: (\S+))?(?: (\S+))?$/)
    if (!v1 && !v2) return empty
    const dim = Number((v1 || v2)![1])
    if (!Number.isFinite(dim) || dim <= 0) return empty
    const version = v1 ? 1 : 2
    const meta = v2
      ? {
          model: v2[2] || "",
          builtAt: v2[3] || "",
          sourceHash: v2[4] || "",
        }
      : {}
    let offset = newline + 1
    const vectors = new Map<string, number[]>()
    const hashes = new Map<string, string>()
    while (offset + 2 <= buf.length) {
      const len = buf.readUInt16BE(offset)
      offset += 2
      if (offset + len > buf.length) break
      const key = buf.subarray(offset, offset + len).toString("utf-8")
      offset += len
      if (version === 2) {
        if (offset + 2 > buf.length) break
        const hashLen = buf.readUInt16BE(offset)
        offset += 2
        if (offset + hashLen + dim * 4 > buf.length) break
        hashes.set(key, buf.subarray(offset, offset + hashLen).toString("utf-8"))
        offset += hashLen
      } else if (offset + dim * 4 > buf.length) break
      const vec: number[] = []
      for (let i = 0; i < dim; i++) vec.push(buf.readFloatLE(offset + i * 4))
      offset += dim * 4
      vectors.set(key, vec)
    }
    return { dim, vectors, hashes, ...meta }
  } catch {
    return empty
  }
}

export function writeVectors(vectors: Map<string, number[]>, dim: number, meta: VectorMeta = {}): number {
  const dir = dirname(VECTORS_FILE)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const version = meta.model || meta.builtAt || meta.sourceHash || meta.hashes ? 2 : 1
  const header = version === 2
    ? `TMVEC2 ${dim} ${meta.model || ""} ${meta.builtAt || ""} ${meta.sourceHash || ""}\n`
    : `TMVEC1 ${dim}\n`
  const chunks: Buffer[] = [Buffer.from(header, "utf-8")]
  let written = 0
  for (const [key, vec] of vectors) {
    if (vec.length !== dim) continue
    const keyBuf = Buffer.from(key, "utf-8")
    if (keyBuf.length > 0xffff) continue
    const lenBuf = Buffer.alloc(2)
    lenBuf.writeUInt16BE(keyBuf.length)
    const vecBuf = Buffer.alloc(dim * 4)
    for (let i = 0; i < dim; i++) vecBuf.writeFloatLE(vec[i], i * 4)
    chunks.push(lenBuf, keyBuf)
    if (version === 2) {
      const hashBuf = Buffer.from(meta.hashes?.get(key) || "", "utf-8")
      const hashLenBuf = Buffer.alloc(2)
      hashLenBuf.writeUInt16BE(hashBuf.length)
      chunks.push(hashLenBuf, hashBuf)
    }
    chunks.push(vecBuf)
    written++
  }
  const out = Buffer.concat(chunks)
  withLockSync(VECTORS_FILE, () => writeFileSync(VECTORS_FILE, out))
  return written
}

export function staleVectorCount(data: string, stored: StoredVectors = readVectors()): number {
  const entries = activeEntries(data)
  if (entries.length === 0) return 0
  let stale = 0
  for (const entry of entries) {
    const vec = stored.vectors.get(entry.key)
    if (!vec || vec.length !== stored.dim) {
      stale++
      continue
    }
    const hash = stored.hashes?.get(entry.key)
    if (!hash || hash !== entryHash(entry)) stale++
  }
  return stale
}

export async function rebuildVectors(
  data: string,
  module: DenseModule,
  model?: string,
  opts: { force?: boolean } = {}
): Promise<RebuildStats> {
  const entries = activeEntries(data)
  if (entries.length === 0) return { written: 0, reused: 0, removed: 0, stale: 0, dim: 0 }
  const stored = readVectors()
  const hashes = new Map(entries.map((entry) => [entry.key, entryHash(entry)]))
  const source = sourceHash(entries)
  const reused = new Map<string, number[]>()
  if (!opts.force && stored.model === (model || stored.model)) {
    for (const [key, hash] of hashes) {
      const vec = stored.vectors.get(key)
      if (vec?.length === stored.dim && stored.hashes?.get(key) === hash) reused.set(key, vec)
    }
  }
  const stale = entries.filter((entry) => !reused.has(entry.key))
  const embedded = stale.length ? await module.embed(stale.map((entry) => `${entry.key} ${entry.content}`), model) : []
  const dim = reused.values().next().value?.length || embedded.find((vec) => vec?.length)?.length || stored.dim
  if (!dim) return { written: 0, reused: 0, removed: 0, stale: stale.length, dim: 0 }
  const vectors = new Map(reused)
  let written = 0
  stale.forEach((entry, i) => {
    const vec = embedded[i]
    if (vec?.length === dim) {
      vectors.set(entry.key, vec)
      written++
    }
  })
  const removed = [...stored.vectors.keys()].filter((key) => !hashes.has(key)).length
  for (const key of vectors.keys()) if (!hashes.has(key)) vectors.delete(key)
  writeVectors(vectors, dim, {
    model,
    hashes,
    builtAt: new Date().toISOString(),
    sourceHash: source,
  })
  return { written, reused: reused.size, removed, stale: stale.length, dim }
}

export async function buildVectors(data: string, module: DenseModule, model?: string): Promise<number> {
  const result = await rebuildVectors(data, module, model, { force: true })
  return result.written
}

export async function denseDiagnostics(data: string): Promise<DenseDiagnostics> {
  const config = loadConfig()
  const stored = readVectors()
  const detailed = await loadDenseModuleDetailed()
  return {
    enabled: Boolean(config.dense?.enabled),
    model: config.dense?.model || "",
    moduleSpec: detailed.spec,
    moduleLoaded: Boolean(detailed.module),
    error: detailed.error,
    vectors: stored.vectors.size,
    dim: stored.dim,
    stale: staleVectorCount(data, stored),
    builtAt: stored.builtAt || "",
    sourceHash: stored.sourceHash || "",
    boost: config.dense?.boost ?? 0.25,
    autoBuild: config.dense?.autoBuild !== false,
  }
}

export async function denseScores(query: string, data: string): Promise<Map<string, number>> {
  const config = loadConfig()
  if (!config.dense?.enabled || !query.trim()) return new Map()
  try {
    const detailed = await loadDenseModuleDetailed()
    const module = detailed.module
    if (!module) return new Map()
    const autoBuild = config.dense.autoBuild !== false
    if (autoBuild && (readVectors().vectors.size === 0 || staleVectorCount(data) > 0)) {
      await rebuildVectors(data, module, config.dense.model)
    }
    const stored = readVectors()
    if (stored.vectors.size === 0) return new Map()
    const [queryVec] = await module.embed([query], config.dense.model)
    if (!queryVec) return new Map()
    const out = new Map<string, number>()
    for (const [key, vec] of stored.vectors) out.set(key, cosine(queryVec, vec))
    return out
  } catch {
    return new Map()
  }
}
