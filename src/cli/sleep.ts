import { loadConfig } from "../mcp/config"
import { readMemory, writeMemory } from "../mcp/memory-io"
import { readObservations, pruneObservations } from "../mcp/observations"
import { promoteSignals, type Signal } from "../lib/promoter"
import { readFeedback } from "../mcp/feedback"
import { rebuildEdges } from "../mcp/edges"
import { pruneExpiredEntries } from "../mcp/archive"
import { consolidateEntries } from "../mcp/consolidation"

export interface SleepResult {
  ran: boolean
  promoted: number
  edges: number
  pruned: number
  duplicates: number
}

export function runSleep(): SleepResult {
  const config = loadConfig()
  if (!config.sleep?.enabled && process.env.TOON_MEMORY_SLEEP !== "1") {
    return { ran: false, promoted: 0, edges: 0, pruned: 0, duplicates: 0 }
  }

  const signals: Signal[] = readObservations().map((o) => ({
    type: o.tool,
    summary: o.summary,
    file: o.file,
    session: o.session,
    ts: o.ts,
  }))
  const promotedResult = promoteSignals(readMemory(), signals, {})
  if (promotedResult.promoted.length > 0) writeMemory(promotedResult.data)

  const edges = rebuildEdges(readMemory(), readFeedback())
  const pruned = pruneExpiredEntries() + pruneObservations()
  const duplicates = consolidateEntries().removed

  return {
    ran: true,
    promoted: promotedResult.promoted.length,
    edges,
    pruned,
    duplicates,
  }
}
