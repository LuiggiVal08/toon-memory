import { existsSync, mkdirSync, readFileSync } from "fs"
import { dirname } from "path"
import { randomBytes } from "crypto"
import { withLockSync, atomicWrite } from "../lib/lock"
import { parseToonLine, toToonLine } from "../lib/utils"
import { FEEDBACK_FILE } from "./config"
import { readMemory, writeMemory } from "./memory-io"

export type FeedbackSignal = "useful" | "irrelevant" | "outdated" | "wrong"
export type FeedbackSource = "explicit" | "implicit"

export interface FeedbackEvent {
  id: string
  key: string
  signal: FeedbackSignal
  source: FeedbackSource
  ts: string
  session: string
  task: string
}

const HEADER = "version: 1\nfeedback[0|]{id|key|signal|source|ts|session|task}:"
const MAX_EVENTS = 1000
const SIGNAL_WEIGHT: Record<FeedbackSignal, number> = {
  useful: 1,
  irrelevant: -1,
  outdated: -1.5,
  wrong: -2,
}

export function readFeedback(): FeedbackEvent[] {
  if (!existsSync(FEEDBACK_FILE)) return []
  let data = ""
  try {
    data = readFileSync(FEEDBACK_FILE, "utf-8")
  } catch {
    return []
  }
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("feedback[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) return []
  const out: FeedbackEvent[] = []
  for (const line of lines.slice(headerIdx + 1)) {
    if (!line.startsWith("  ") || !line.includes("|")) continue
    const p = parseToonLine(line.trim())
    if (p.length < 5) continue
    const signal = p[2] as FeedbackSignal
    if (!(signal in SIGNAL_WEIGHT)) continue
    out.push({
      id: p[0],
      key: p[1],
      signal,
      source: p[3] === "implicit" ? "implicit" : "explicit",
      ts: p[4],
      session: p[5] || "",
      task: p[6] || "",
    })
  }
  return out
}

export function appendFeedback(
  event: Omit<FeedbackEvent, "id" | "ts" | "session"> & { session?: string; id?: string; ts?: string }
): FeedbackEvent {
  const full: FeedbackEvent = {
    id: event.id || `fb-${randomBytes(4).toString("hex")}`,
    key: event.key,
    signal: event.signal,
    source: event.source,
    ts: event.ts || new Date().toISOString(),
    session: event.session || "",
    task: event.task || "",
  }
  const dir = dirname(FEEDBACK_FILE)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  withLockSync(FEEDBACK_FILE, () => {
    const data = existsSync(FEEDBACK_FILE) ? readFileSync(FEEDBACK_FILE, "utf-8") : HEADER
    const lines = data.split("\n")
    let headerIdx = lines.findIndex((l) => l.startsWith("feedback[") || /^\[\d+\|]/.test(l))
    if (headerIdx === -1) {
      lines.unshift(HEADER.split("\n")[1])
      headerIdx = 0
    }
    const rows = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && l.startsWith("  "))
    const row = toToonLine([
      full.id, full.key, full.signal, full.source, full.ts,
      full.session, full.task.slice(0, 2000),
    ])
    const kept = [row, ...rows].slice(0, MAX_EVENTS)
    const countMatch = lines[headerIdx].match(/\[(\d+)\|/)
    const count = countMatch ? parseInt(countMatch[1], 10) : 0
    lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count + 1}|`)
    lines.splice(headerIdx + 1, lines.length - headerIdx - 1, ...kept)
    atomicWrite(FEEDBACK_FILE, lines.join("\n"))
  })
  return full
}

export function utilityMap(today?: string): Map<string, number> {
  const ref = today || new Date().toISOString().split("T")[0]
  const refTime = Date.parse(`${ref}T00:00:00Z`)
  const out = new Map<string, number>()
  for (const e of readFeedback()) {
    const days = Number.isNaN(refTime) ? 0 : Math.max(0, (refTime - Date.parse(e.ts)) / 86400000)
    const decay = Math.pow(0.9, days)
    const delta = SIGNAL_WEIGHT[e.signal] * decay
    out.set(e.key, Math.max(-3, Math.min(3, Number(((out.get(e.key) || 0) + delta).toFixed(3)))))
  }
  return out
}

export function markWrong(key: string): boolean {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) return false
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    if (line.startsWith("  summaries:")) break
    const parts = parseToonLine(line)
    if (parts[0] !== key && parts[2] !== key) continue
    while (parts.length < 20) parts.push("")
    parts[19] = "conflict"
    lines[i] = toToonLine(parts)
    writeMemory(lines.join("\n"))
    return true
  }
  return false
}
