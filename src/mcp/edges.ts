import { existsSync, mkdirSync, readFileSync } from "fs"
import { dirname } from "path"
import { EDGES_FILE } from "./config"
import { atomicWrite, withLockSync } from "../lib/lock"
import { parseEntries, parseLinkToken } from "../lib/graph"
import { parseToonLine, toToonLine } from "../lib/utils"
import type { FeedbackEvent } from "./feedback"

export const EDGE_TYPES = ["related", "supports", "contradicts", "supersedes", "depends_on", "derived_from", "used_in"] as const
export type EdgeType = (typeof EDGE_TYPES)[number]

export interface Edge {
  from: string
  to: string
  type: EdgeType
  weight: number
  ts: string
}

const HEADER = "version: 1\nedges[0|]{from|to|type|weight|ts}:"
const MAX_EDGES = 2000

function normalizeType(type: string): EdgeType {
  const t = type.toLowerCase()
  return (EDGE_TYPES as readonly string[]).includes(t) ? (t as EdgeType) : "related"
}

export function readEdges(): Edge[] {
  if (!existsSync(EDGES_FILE)) return []
  try {
    const lines = readFileSync(EDGES_FILE, "utf-8").split("\n")
    const start = lines.findIndex((l) => l.startsWith("edges[") || /^\[\d+\|]/.test(l))
    if (start === -1) return []
    const out: Edge[] = []
    for (const line of lines.slice(start + 1)) {
      if (!line.startsWith("  ") || !line.includes("|")) continue
      const p = parseToonLine(line)
      if (p.length < 5) continue
      const weight = Number(p[3])
      if (!p[0] || !p[1] || !Number.isFinite(weight)) continue
      out.push({ from: p[0], to: p[1], type: normalizeType(p[2]), weight, ts: p[4] || "" })
    }
    return out
  } catch {
    return []
  }
}

export function writeEdges(edges: Edge[]): void {
  const dir = dirname(EDGES_FILE)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const sorted = [...edges]
    .filter((e) => e.from && e.to && e.from !== e.to)
    .sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to) || a.type.localeCompare(b.type))
    .slice(0, MAX_EDGES)
  const header = `version: 1\nedges[${sorted.length}|]{from|to|type|weight|ts}:`
  const lines = [header, ...sorted.map((e) => toToonLine([e.from, e.to, e.type, String(e.weight), e.ts]))]
  withLockSync(EDGES_FILE, () => atomicWrite(EDGES_FILE, lines.join("\n")))
}

export function deriveEdges(data: string, feedback: FeedbackEvent[] = []): Edge[] {
  const entries = parseEntries(data)
  const keys = new Set(entries.map((e) => e.key))
  const map = new Map<string, Edge>()
  const add = (from: string, to: string, type: EdgeType, weight: number, ts: string) => {
    if (!keys.has(from) || !keys.has(to) || from === to) return
    const id = `${from}|${to}|${type}`
    const prev = map.get(id)
    if (prev) prev.weight = Math.max(prev.weight, weight)
    else map.set(id, { from, to, type, weight, ts })
  }

  for (const e of entries) {
    for (const link of e.links) {
      const { type, key } = parseLinkToken(link)
      add(e.key, key, normalizeType(type), 1, e.date)
    }
  }

  for (const event of feedback) {
    if (!event.task) continue
    const haystack = event.task.toLowerCase()
    const type: EdgeType = event.signal === "wrong" || event.signal === "outdated" ? "contradicts" : "used_in"
    const weight = event.signal === "useful" ? 1 : 0.5
    for (const key of keys) {
      if (key === event.key) continue
      if (!haystack.includes(key.toLowerCase())) continue
      add(event.key, key, type, weight, event.ts.slice(0, 10))
    }
  }

  return [...map.values()]
}

export function rebuildEdges(data: string, feedback: FeedbackEvent[] = []): number {
  const edges = deriveEdges(data, feedback)
  writeEdges(edges)
  return edges.length
}
