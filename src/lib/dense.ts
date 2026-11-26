import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { dirname } from "path"
import { parseEntries } from "../lib/graph"
import { loadConfig, VECTORS_FILE } from "../mcp/config"
import { withLockSync } from "../lib/lock"

export interface DenseModule {
  embed(texts: string[], model?: string): Promise<number[][]>
}

export interface StoredVectors {
  dim: number
  vectors: Map<string, number[]>
}

export async function loadDenseModule(): Promise<DenseModule | null> {
  const spec = process.env.TOON_MEMORY_DENSE_MODULE || "toon-memory-dense"
  try {
    const mod: any = await import(spec)
    const embed = mod?.embed || mod?.default?.embed || mod?.default
    return typeof embed === "function" ? { embed } : null
  } catch {
    return null
  }
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
  const empty = { dim: 0, vectors: new Map<string, number[]>() }
  if (!existsSync(VECTORS_FILE)) return empty
  try {
    const buf = readFileSync(VECTORS_FILE)
    const newline = buf.indexOf(0x0a)
    if (newline === -1) return empty
    const match = buf.subarray(0, newline).toString("utf-8").match(/^TMVEC1 (\d+)$/)
    if (!match) return empty
    const dim = Number(match[1])
    if (!Number.isFinite(dim) || dim <= 0) return empty
    let offset = newline + 1
    const vectors = new Map<string, number[]>()
    while (offset + 2 <= buf.length) {
      const len = buf.readUInt16BE(offset)
      offset += 2
      if (offset + len + dim * 4 > buf.length) break
      const key = buf.subarray(offset, offset + len).toString("utf-8")
      offset += len
      const vec: number[] = []
      for (let i = 0; i < dim; i++) vec.push(buf.readFloatLE(offset + i * 4))
      offset += dim * 4
      vectors.set(key, vec)
    }
    return { dim, vectors }
  } catch {
    return empty
  }
}

export function writeVectors(vectors: Map<string, number[]>, dim: number): number {
  const dir = dirname(VECTORS_FILE)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const chunks: Buffer[] = [Buffer.from(`TMVEC1 ${dim}\n`, "utf-8")]
  let written = 0
  for (const [key, vec] of vectors) {
    if (vec.length !== dim) continue
    const keyBuf = Buffer.from(key, "utf-8")
    const lenBuf = Buffer.alloc(2)
    lenBuf.writeUInt16BE(keyBuf.length)
    const vecBuf = Buffer.alloc(dim * 4)
    for (let i = 0; i < dim; i++) vecBuf.writeFloatLE(vec[i], i * 4)
    chunks.push(lenBuf, keyBuf, vecBuf)
    written++
  }
  const out = Buffer.concat(chunks)
  withLockSync(VECTORS_FILE, () => writeFileSync(VECTORS_FILE, out))
  return written
}

export async function buildVectors(data: string, module: DenseModule, model?: string): Promise<number> {
  const entries = parseEntries(data).filter((e) => e.status !== "obsolete" && e.status !== "draft")
  if (entries.length === 0) return 0
  const embedded = await module.embed(entries.map((e) => `${e.key} ${e.content}`), model)
  const dim = embedded[0]?.length || loadConfig().dense?.dim || 0
  if (!dim) return 0
  const vectors = new Map<string, number[]>()
  entries.forEach((e, i) => {
    if (embedded[i]?.length === dim) vectors.set(e.key, embedded[i])
  })
  return writeVectors(vectors, dim)
}

export async function denseScores(query: string, data: string): Promise<Map<string, number>> {
  const config = loadConfig()
  if (!config.dense?.enabled || !query.trim()) return new Map()
  try {
    const module = await loadDenseModule()
    if (!module) return new Map()
    if (readVectors().vectors.size === 0) await buildVectors(data, module, config.dense.model)
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
