import { basename } from "path"
import { graphRecallDetailed, parseEntries, type GraphEntry } from "./graph"
import { estimateTokens, isExpiredLocal, isPrivate, tokenize } from "./utils"
import { entryAgeDays, projectSlug } from "./handoff"
import type { ActivationEdge } from "./activation"

export interface ContextSection {
  title: string
  lines: string[]
}

export interface ContextPackage {
  task: string
  asOf: string
  freshness: string
  project: string
  slug: string
  root: string
  sections: ContextSection[]
  queries: string[]
  hydrate: string[]
  usedTokens: number
}

export interface CompileOpts {
  root?: string
  today?: string
  maxTokens?: number
  utility?: Map<string, number>
  edges?: ActivationEdge[]
  activation?: boolean
  dense?: Map<string, number>
  sessions?: string[]
}

function claim(e: GraphEntry, maxChars = 120): string {
  const text = e.content.replace(/\s+/g, " ").trim()
  if (!text) return e.key
  const sentence = text.match(/^[^.!?]+[.!?]?/)?.[0] || text
  if (sentence.length <= maxChars) return sentence.trim()
  return `${sentence.slice(0, maxChars).replace(/\s+\S*$/, "")} · ${e.key}`
}

function line(e: GraphEntry, today: string): string {
  const age = entryAgeDays(e.date, today)
  const stale = age > 30 ? ` [stale ${age}d]` : ""
  const file = e.file ? ` @ ${e.file}` : ""
  return `- [${e.category}] ${e.key}: ${claim(e)}${file}${stale}`
}

export function compileContext(data: string, task: string, opts: CompileOpts = {}): ContextPackage {
  const today = opts.today || new Date().toISOString().split("T")[0]
  const root = opts.root || process.cwd()
  const maxTokens = opts.maxTokens ?? 900
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

  const graphRanked = graphRecallDetailed(data, task, {
    limit: 12,
    utility: opts.utility,
    edges: opts.edges,
    activation: opts.activation,
    dense: opts.dense,
  }).entries
  const utilitySeeds = [...(opts.utility?.entries() || [])]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key)
  const utilityEntries = utilitySeeds
    .map((key) => usable.find((e) => e.key === key))
    .filter((e): e is GraphEntry => Boolean(e))
  const ranked = [...utilityEntries, ...graphRanked.filter((e) => !utilitySeeds.includes(e.key))]
  const seen = new Set<string>()
  const take = (list: GraphEntry[]): GraphEntry[] => {
    const out: GraphEntry[] = []
    for (const e of list) {
      if (seen.has(e.key)) continue
      seen.add(e.key)
      out.push(e)
    }
    return out
  }
  const byDate = (a: GraphEntry, b: GraphEntry) => b.date.localeCompare(a.date)

  const directives = take(
    usable
      .filter(
        (e) =>
          (e.origin === "human" || e.importance === "critical" || e.priority > 0) &&
          e.category !== "warning" &&
          e.evidence !== "conflict"
      )
      .sort((a, b) => b.priority - a.priority || byDate(a, b))
      .slice(0, 3)
  )
  const constraints = take(
    usable
      .filter(
        (e) =>
          e.category === "warning" ||
          e.evidence === "conflict" ||
          e.tags.some((t) => ["trap", "gotcha", "risk", "warning", "outdated"].includes(t.toLowerCase()))
      )
      .sort(byDate)
      .slice(0, 2)
  )
  const memory = take(ranked.slice(0, 5))
  const decisions = take(ranked.filter((e) => e.category === "decision").slice(0, 2))

  const tokens = tokenize(task).slice(0, 4)
  const queries: string[] = []
  if (task.trim()) queries.push(task.trim().slice(0, 140))
  if (tokens.length >= 2) queries.push(`${tokens[0]} ${tokens[1]}`)
  if (memory.length > 0 && tokens.length > 0) queries.push(`${memory[0].key} ${tokens[0]}`)
  const queriesOut = [...new Set(queries)].slice(0, 3)

  const hydrate = [...new Set([...directives, ...constraints, ...memory, ...decisions].map((e) => e.key))].slice(0, 8)
  const files = [...new Set([...directives, ...constraints, ...memory, ...decisions].map((e) => e.file).filter(Boolean))].slice(0, 4)
  const sessionLines = (opts.sessions || []).slice(0, 2).map((s) => `- ${s}`)

  const sections: ContextSection[] = [
    { title: "Directives", lines: directives.map((e) => line(e, today)) },
    { title: "Constraints", lines: constraints.map((e) => line(e, today)) },
    { title: "Memory", lines: memory.map((e) => line(e, today)) },
    { title: "Decisions", lines: decisions.map((e) => line(e, today)) },
    { title: "Retrieval", lines: queriesOut.map((q) => `- query: ${q}`) },
    { title: "Hydrate", lines: hydrate.length ? hydrate.map((k) => `- ${k}`) : ["- (none)"] },
    { title: "Files", lines: files.map((f) => `- ${f}`) },
    { title: "Sessions", lines: sessionLines.length ? sessionLines : ["- (none)"] },
  ].filter((s) => s.lines.length > 0)

  const pkg: ContextPackage = {
    task,
    asOf: today,
    freshness,
    project: basename(root) || root,
    slug: projectSlug(root),
    root,
    sections: [],
    queries: queriesOut,
    hydrate,
    usedTokens: 0,
  }

  let used = estimateTokens(
    `<memory project="${pkg.project}" as_of="${today}" freshness="${freshness}">\nidentity: mcp_project=${pkg.slug} | root=${root}\n</memory>`
  )
  for (const section of sections) {
    const block = `${section.title}\n${section.lines.join("\n")}`
    const cost = estimateTokens(`\n${block}`)
    if (used + cost > maxTokens) continue
    used += cost
    pkg.sections.push(section)
  }
  pkg.usedTokens = used
  return pkg
}

export function renderContextPackage(pkg: ContextPackage): string {
  const task = pkg.task.replace(/"/g, "&quot;").slice(0, 140)
  const out = [
    `<memory project="${pkg.project}" as_of="${pkg.asOf}" freshness="${pkg.freshness}" task="${task}">`,
    `identity: mcp_project=${pkg.slug} | root=${pkg.root}`,
  ]
  for (const section of pkg.sections) out.push(`${section.title}\n${section.lines.join("\n")}`)
  if (pkg.sections.length === 0) out.push("(no stable memories yet)")
  out.push("</memory>")
  return out.join("\n")
}
