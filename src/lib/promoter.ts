/**
 * Deterministic promoter: turns captured signals into durable memory entries.
 * No LLM, no network. High bar on purpose — low-confidence signals stay in
 * session.toon as a log instead of polluting data.toon.
 */

import { parseEntries } from "./graph"
import { toToonLine, escField } from "./utils"

export type SignalType = "user_directive" | "error_fix" | "decision" | "diff_pattern" | "checkpoint"

export interface Signal {
  type: string
  summary: string
  file: string
  session: string
  ts: string
}

export interface ScoredSignal {
  signal: Signal
  score: number
  category: "decision" | "pattern" | "bug" | "knowledge" | "warning"
  tags: string
  origin: "human" | "agent" | "inferred"
  importance: string
  evidence: string
}

export const PROMOTE_THRESHOLD = 0.75

const DIRECTIVE = /recuerda|siempre|nunca|no hagas|importante|ten cuidado|decidimos|must not|always|never/i
const FIX = /fix|fixed|error|fallo|bug|verified|pas(o|ó|ed)|green/i
const DECISION = /decidimos|elegimos|optamos|rechazamos|commit|merge|pr\b/i

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "signal"
}

export function scoreSignal(signal: Signal): ScoredSignal {
  const text = `${signal.summary} ${signal.file}`
  const type = signal.type.replace(/:$/, "")
  const hasFile = Boolean(signal.file)
  const lengthOk = signal.summary.length >= 40 && signal.summary.length <= 300
  let score = 0.2
  let category: ScoredSignal["category"] = "knowledge"
  let tags = "auto-captured"
  let origin: ScoredSignal["origin"] = "inferred"
  let importance = ""
  let evidence = "unverified"

  if (type === "user_directive" || DIRECTIVE.test(text)) {
    category = "warning"
    origin = "human"
    importance = "high"
    tags = "auto-captured;directive"
    score = 0.85
  } else if (type === "error_fix" || FIX.test(text)) {
    category = "bug"
    tags = "auto-captured;error-fix"
    score = 0.6
    if (hasFile && FIX.test(text)) evidence = "verified"
  } else if (type === "decision" || DECISION.test(text)) {
    category = "decision"
    tags = "auto-captured;decision"
    score = 0.58
  } else if (type === "diff_pattern") {
    category = "pattern"
    tags = "auto-captured;pattern"
    score = 0.45
  } else if (type === "checkpoint") {
    tags = "auto-captured;checkpoint"
    score = 0.4
  }

  if (lengthOk) score += 0.08
  if (hasFile) score += 0.04
  if (origin === "human") score += 0.04
  if (evidence === "verified") score += 0.06

  return { signal, score: Math.min(1, Number(score.toFixed(2))), category, tags, origin, importance, evidence }
}

export interface PromotionResult {
  data: string
  promoted: Array<{ key: string; category: string; score: number }>
  kept: number
}

/**
 * Append every signal at/above `threshold` to raw TOON memory data.
 * Existing keys win (no overwrite); count in the header stays consistent.
 */
export function promoteSignals(data: string, signals: Signal[], opts: { threshold?: number; today?: string } = {}): PromotionResult {
  const threshold = opts.threshold ?? PROMOTE_THRESHOLD
  const today = opts.today || new Date().toISOString().split("T")[0]
  const lines = data.split("\n")
  let headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) {
    lines.push("[0|]")
    headerIdx = lines.length - 1
  }

  const known = new Set(parseEntries(data).map((e) => e.key))
  const promoted: PromotionResult["promoted"] = []
  let kept = 0

  for (const raw of signals) {
    const signal = { ...raw, summary: (raw.summary || "").replace(/\s+/g, " ").trim() }
    const scored = scoreSignal(signal)
    if (scored.score < threshold || !signal.summary) {
      kept++
      continue
    }
    const key = `${scored.category}-${slug(signal.summary)}`
    if (known.has(key)) {
      kept++
      continue
    }
    known.add(key)
    const id = `sig-${Date.now().toString(36)}-${promoted.length.toString(36)}`
    const line = toToonLine([
      id, scored.category, key, escField(signal.summary), escField(signal.file || ""),
      scored.tags, today, "", "0", "", "0.85", "1.0", today, "0", "",
      scored.origin, "active", "", scored.importance, scored.evidence,
    ])
    lines.splice(headerIdx + 1, 0, line)
    promoted.push({ key, category: scored.category, score: scored.score })
  }

  const match = lines[headerIdx].match(/\[(\d+)\|/)
  const count = match ? parseInt(match[1]) : 0
  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count + promoted.length}|`)

  return { data: lines.join("\n"), promoted, kept }
}
