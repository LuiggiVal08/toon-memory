/**
 * CLI surface for the ambient memory loops:
 *   brief     — compact handoff packet for injection at session start
 *   doctor    — is memory wired correctly in this workspace?
 *   signal    — append one deterministic signal to session.toon
 *   promote   — promote high-confidence signals into data.toon
 */

import { existsSync, readFileSync } from "fs"
import { join } from "path"
import { buildHandoffBrief } from "../lib/handoff"
import { compileContext, renderContextPackage } from "../lib/compiler"
import { promoteSignals, PROMOTE_THRESHOLD, type Signal } from "../lib/promoter"
import { readMemory, writeMemory } from "../mcp/memory-io"
import { MEMORY_DIR, MEMORY_FILE, CONFIG_FILE, GLOBAL_FILE } from "../mcp/config"
import { readSessionEntries, writeSessionEntry } from "../mcp/session-store"
import { parseEntries } from "../lib/graph"
import { denseDiagnostics } from "../lib/dense"
import { entryAgeDays, projectSlug } from "../lib/handoff"

function flag(args: string[], name: string): string {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : ""
}

/** Print the handoff brief. This is what hooks inject — never the full dump. */
export function printBrief(task = ""): void {
  const data = readMemory()
  const root = process.cwd()
  if (task.trim()) {
    const sessions = readSessionEntries()
      .slice(-2)
      .map((e) => `${e.session || "cli"}: ${e.summary.slice(0, 80)}`)
    process.stdout.write(renderContextPackage(compileContext(data, task, { root, sessions })))
    return
  }
  process.stdout.write(buildHandoffBrief(data, root, { task }))
}

/** Append one signal to the unified session store. */
export function recordSignal(args: string[]): void {
  const type = flag(args, "type") || "observation"
  const summary = flag(args, "summary")
  if (!summary) {
    console.error("signal: --summary is required")
    process.exitCode = 1
    return
  }
  writeSessionEntry({
    ts: new Date().toISOString(),
    session: flag(args, "session") || process.env.TOON_MEMORY_SESSION || "cli",
    agent: flag(args, "agent") || "opencode",
    branch: flag(args, "branch") || "",
    tool: `${type}:${flag(args, "tool") || "hook"}`,
    file: flag(args, "file") || "",
    summary,
  })
}

/** Promote high-confidence signals. Deterministic; no model call. */
export function runPromotion(args: string[]): void {
  const thresholdArg = Number(flag(args, "threshold"))
  const threshold = Number.isFinite(thresholdArg) && thresholdArg > 0 ? thresholdArg : PROMOTE_THRESHOLD
  const entries = readSessionEntries(flag(args, "session") || undefined)
  const signals: Signal[] = entries.map((e) => ({
    type: e.tool,
    summary: e.summary,
    file: e.file,
    session: e.session,
    ts: e.ts,
  }))
  const result = promoteSignals(readMemory(), signals, { threshold })
  if (result.promoted.length > 0) writeMemory(result.data)
  console.log(`Promoted ${result.promoted.length} signal(s); ${result.kept} kept in log.`)
  for (const p of result.promoted) console.log(`  + ${p.category}/${p.key} (${p.score})`)
}

/** Read-only health check for the ambient loops. */
export async function printDoctor(): Promise<void> {
  const root = process.cwd()
  const lines: string[] = [
    `toon-memory doctor — ${root}`,
    `mcp_project: ${projectSlug(root)}`,
  ]

  if (!existsSync(MEMORY_FILE)) {
    lines.push(`memory: MISSING (${MEMORY_FILE}) — run 'toon-memory init'`)
  } else {
    const entries = parseEntries(readFileSync(MEMORY_FILE, "utf-8"))
    const today = new Date().toISOString().split("T")[0]
    const newest = entries.reduce((a, e) => (e.date > a ? e.date : a), "")
    const age = newest ? entryAgeDays(newest, today) : 0
    const freshness = !newest ? "empty" : age > 30 ? `stale-${age}d` : "fresh"
    const stale = entries.filter((e) => e.date && entryAgeDays(e.date, today) > 30 && e.status !== "obsolete").length
    const traps = entries.filter(
      (e) => e.category === "warning" || e.tags.some((t) => ["trap", "gotcha", "risk"].includes(t.toLowerCase()))
    ).length
    lines.push(`memory: ${entries.length} entries | newest: ${newest || "none"} | freshness: ${freshness}`)
    lines.push(`hygiene: ${stale} stale | ${traps} traps`)
  }

  const sessionFile = join(MEMORY_DIR, "session.toon")
  lines.push(`signals: ${existsSync(sessionFile) ? readSessionEntries().length : 0} in session.toon`)
  lines.push(`config: ${existsSync(CONFIG_FILE) ? "present" : "default"}`)
  lines.push(`global: ${existsSync(GLOBAL_FILE) ? "present" : "absent"}`)

  const plugin = join(root, ".opencode", "plugins", "toon-memory.ts")
  if (existsSync(plugin)) {
    const src = readFileSync(plugin, "utf-8")
    const hasSystem = src.includes("experimental.chat.system.transform")
    lines.push(`opencode plugin: installed | system injection: ${hasSystem ? "OK" : "STALE — re-run init"}`)
  } else {
    lines.push("opencode plugin: absent")
  }
  lines.push(`injection: brief via 'toon-memory brief' (system.transform) | auto-write via 'signal' + 'promote'`)
  const dense = await denseDiagnostics(readMemory())
  lines.push(`dense: ${dense.enabled ? "enabled" : "disabled"} | module: ${dense.moduleLoaded ? "OK" : dense.error || "missing"} | vectors: ${dense.vectors}/${dense.stale} stale`)
  lines.push(`catalog: ${process.env.TOON_MEMORY_EXPERT_TOOLS === "1" ? "expert" : "core"} (set TOON_MEMORY_EXPERT_TOOLS=1 for advanced tools)`)
  console.log(lines.join("\n"))
}
