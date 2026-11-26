/**
 * Compact handoff brief: the packet injected at session start instead of a
 * full memory dump. Deterministic, zero-dep, no LLM.
 *
 * Unlike a search result, a handoff carries enough state to keep the agent
 * from re-investigating: cross-tool identity, freshness, hard directives,
 * known traps and file pointers.
 */

import { basename } from "path"
import { parseEntries, type GraphEntry } from "./graph"
import { estimateTokens, isExpiredLocal, isPrivate } from "./utils"

export interface HandoffOpts {
  /** Focus area; biases "recent" selection toward matching entries. */
  task?: string
  /** Hard token ceiling for the whole brief. Default 420. */
  maxTokens?: number
  /** Today, injectable for deterministic tests. */
  today?: string
}

/** Slug used by codebase-memory-mcp and other path-derived project registries. */
export function projectSlug(root: string): string {
  return root
    .replace(/^[\\/]+/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

export function entryAgeDays(date: string, today: string): number {
  if (!date) return 0
  const then = Date.parse(`${date}T00:00:00`)
  const now = Date.parse(`${today}T00:00:00`)
  if (!Number.isFinite(then) || !Number.isFinite(now)) return 0
  return Math.max(0, Math.round((now - then) / 86400000))
}

/** First sentence, clipped at a word boundary. Never ends in an ellipsis. */
function claim(e: GraphEntry, maxChars = 130): string {
  const text = e.content.replace(/\s+/g, " ").trim()
  if (!text) return e.key
  const sentence = text.match(/^[^.!?]+[.!?]?/)?.[0] || text
  if (sentence.length <= maxChars) return sentence.trim()
  const cut = sentence.slice(0, maxChars).replace(/\s+\S*$/, "")
  return `${cut} · ver ${e.key}`
}

function matches(e: GraphEntry, task: string): boolean {
  const q = task.toLowerCase()
  if (!q) return false
  const text = `${e.key} ${e.content} ${e.tags.join(" ")} ${e.file}`.toLowerCase()
  return q.split(/\s+/).filter((t) => t.length > 3).some((t) => text.includes(t))
}

/**
 * Build the handoff brief from raw TOON memory data.
 */
export function buildHandoffBrief(data: string, root: string, opts: HandoffOpts = {}): string {
  const today = opts.today || new Date().toISOString().split("T")[0]
  const maxTokens = opts.maxTokens ?? 420
  const task = opts.task || ""

  const usable = parseEntries(data).filter(
    (e) =>
      e.status !== "obsolete" &&
      e.status !== "draft" &&
      !isPrivate(e) &&
      !(e.ttl && isExpiredLocal(e.ttl, today))
  )

  const newest = usable.reduce((acc, e) => (e.date > acc ? e.date : acc), "")
  const age = entryAgeDays(newest, today)
  const freshness = !newest ? "empty" : age > 30 ? `stale-${age}d` : "fresh"

  const head = [
    `<memory project="${basename(root) || root}" as_of="${today}" freshness="${freshness}">`,
    `identity: mcp_project=${projectSlug(root)} | root=${root}`,
  ]

  const used = new Set<string>()
  const take = (list: GraphEntry[]): GraphEntry[] => {
    const out: GraphEntry[] = []
    for (const e of list) {
      if (used.has(e.key)) continue
      used.add(e.key)
      out.push(e)
    }
    return out
  }
  const byDate = (a: GraphEntry, b: GraphEntry) => b.date.localeCompare(a.date)
  const line = (section: string, e: GraphEntry): string => {
    const stale = entryAgeDays(e.date, today) > 30 ? ` [stale ${entryAgeDays(e.date, today)}d]` : ""
    const file = e.file ? ` @ ${e.file}` : ""
    return `${section} [${e.category}] ${e.key}: ${claim(e)}${file}${stale}`
  }

  const traps = take(
    usable
      .filter(
        (e) =>
          e.category === "warning" ||
          e.tags.some((t) => ["trap", "gotcha", "risk", "warning"].includes(t.toLowerCase()))
      )
      .sort(byDate)
      .slice(0, 2)
  )
  const directives = take(
    usable
      .filter((e) => e.origin === "human" || e.importance === "critical")
      .sort((a, b) => b.priority - a.priority || byDate(a, b))
      .slice(0, 2)
  )
  const open = take(usable.filter((e) => e.category === "decision").sort(byDate).slice(0, 3))
  const recent = take(
    [...usable].sort((a, b) => {
      const tm = Number(matches(b, task)) - Number(matches(a, task))
      return tm || byDate(a, b)
    }).slice(0, 3)
  )
  const files = usable.filter((e) => e.file).sort(byDate).slice(0, 3)

  const sections: string[] = []
  const push = (title: string, rows: string[]) => {
    if (rows.length > 0) sections.push(`${title}\n${rows.join("\n")}`)
  }
  push("directives:", directives.map((e) => line("-", e)))
  push("traps:", traps.map((e) => line("-", e)))
  push("open:", open.map((e) => line("-", e)))
  push("recent:", recent.map((e) => line("-", e)))
  if (files.length > 0) {
    push("files:", files.map((e) => `- ${e.file}${e.key ? ` ← ${e.key}` : ""}`))
  }

  const out = [...head]
  for (const section of sections) {
    if (estimateTokens(out.join("\n") + "\n" + section) > maxTokens) break
    out.push(section)
  }
  if (out.length === 2) out.push("(no stable memories yet)")
  out.push("</memory>")
  return out.join("\n")
}
