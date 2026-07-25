import { readFileSync, existsSync } from "fs"
import { OBSERVATIONS_FILE } from "./config"

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
