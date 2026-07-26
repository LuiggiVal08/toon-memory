import { readFileSync, existsSync, writeFileSync } from "fs"
import { OBSERVATIONS_FILE } from "./config"

/** Maximum observations to keep in the log file */
const MAX_OBSERVATIONS = 500

/**
 * Read captured activity from observations.toon (written by hooks).
 */
export function readObservations(): Array<{ ts: string; session: string; agent: string; branch: string; tool: string; file: string; summary: string }> {
  if (!existsSync(OBSERVATIONS_FILE)) return []
  return readFileSync(OBSERVATIONS_FILE, "utf-8")
    .split("\n")
    .filter((l) => l.startsWith("  ") && l.includes("|"))
    .map((l) => {
      const p = l.trim().split("|")
      return { ts: p[0] || "", session: p[1] || "", agent: p[2] || "", branch: p[3] || "", tool: p[4] || "", file: p[6] || "", summary: p[7] || "" }
    })
}

/**
 * Prune observations.toon to MAX_OBSERVATIONS entries.
 * Keeps the most recent entries. Called on each capture append.
 */
export function pruneObservations(): number {
  if (!existsSync(OBSERVATIONS_FILE)) return 0
  const data = readFileSync(OBSERVATIONS_FILE, "utf-8")
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("observations["))
  if (headerIdx === -1) return 0

  const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0)
  if (entryLines.length <= MAX_OBSERVATIONS) return 0

  const toRemove = entryLines.length - MAX_OBSERVATIONS
  const pruned = entryLines.slice(toRemove)
  const kept = entryLines.slice(0, MAX_OBSERVATIONS)

  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${kept.length}|`)
  lines.splice(headerIdx + 1, lines.length - headerIdx - 1, ...kept.map((l) => `  ${l.trim()}`))
  writeFileSync(OBSERVATIONS_FILE, lines.join("\n"))
  return toRemove
}
