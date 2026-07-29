/**
 * Auto-checkpoint system for toon-memory.
 *
 * Inspired by MiMo Code's checkpoint-writer subagent, but deterministic:
 * - Detects when agent is working on complex tasks (many tool calls without recall)
 * - Auto-generates checkpoint entries to preserve working state
 * - Uses pattern detection, not LLM
 */

import { readSessionEntries, writeSessionEntry } from "../mcp/session-store"
import { loadConfig } from "../mcp/config"

/** Minimum tool calls between auto-checkpoints */
const DEFAULT_INTERVAL = 5

/** Minimum time (ms) between auto-checkpoints */
const MIN_TIME_BETWEEN_MS = 2 * 60 * 1000 // 2 minutes

/** Last checkpoint timestamp (in-memory, per process) */
let lastCheckpointTime = 0

/**
 * Analyze session history to determine if auto-checkpoint should trigger.
 *
 * Triggers when:
 * 1. Interval of tool calls reached (default: 5 calls since last checkpoint)
 * 2. Enough time has passed (2+ minutes)
 * 3. Agent is working without recalling memory (potential "blind" work)
 */
export function shouldCheckpoint(sessionId?: string): boolean {
  const config = loadConfig()
  const checkpointConfig = config.checkpoint

  // Check if auto-checkpoint is disabled
  if (checkpointConfig?.enabled === false) return false

  const interval = checkpointConfig?.interval || DEFAULT_INTERVAL

  // Time check
  const now = Date.now()
  if (now - lastCheckpointTime < MIN_TIME_BETWEEN_MS) return false

  // Get session entries
  const entries = readSessionEntries(sessionId)
  if (entries.length < interval) return false

  // Count tool calls since last checkpoint
  // Simple heuristic: if we have N+ entries without a checkpoint summary, trigger
  const recentEntries = entries.slice(-interval)
  const hasCheckpoint = recentEntries.some((e) =>
    e.summary.toLowerCase().includes("checkpoint") ||
    e.summary.toLowerCase().includes("auto-saved")
  )

  if (hasCheckpoint) return false

  // Check for "blind work" pattern: many tool calls without memory recall
  const recentTools = recentEntries.map((e) => e.tool)
  const recallCount = recentTools.filter((t) =>
    t.includes("recall") || t.includes("smart_recall") || t.includes("context")
  ).length

  // If less than 20% of recent calls are recalls, agent might be working blind
  const recallRatio = recallCount / recentTools.length
  if (recallRatio > 0.2) return false

  // All checks passed
  return true
}

/**
 * Generate a checkpoint entry from current session state.
 * Called after shouldCheckpoint returns true.
 */
export function generateCheckpoint(sessionId: string): { summary: string; file: string } {
  const entries = readSessionEntries(sessionId)

  // Extract key information from recent entries
  const recentFiles = [...new Set(entries.slice(-10).map((e) => e.file).filter(Boolean))]
  const recentTools = entries.slice(-10).map((e) => e.tool)
  const toolCounts = recentTools.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t, c]) => `${t}(${c})`)
    .join(", ")

  const filesSummary = recentFiles.length > 0
    ? `Files: ${recentFiles.slice(0, 5).join(", ")}${recentFiles.length > 5 ? ` +${recentFiles.length - 5}` : ""}`
    : ""

  const summary = `Auto-checkpoint: ${topTools}${filesSummary ? ` | ${filesSummary}` : ""}`

  return {
    summary,
    file: recentFiles[0] || "",
  }
}

/**
 * Maybe auto-checkpoint: check if we should checkpoint, and if so, do it.
 * Returns true if a checkpoint was created.
 */
export function maybeAutoCheckpoint(sessionId: string): boolean {
  if (!shouldCheckpoint(sessionId)) return false

  const checkpoint = generateCheckpoint(sessionId)

  writeSessionEntry({
    ts: new Date().toISOString(),
    session: sessionId,
    agent: "system",
    branch: "",
    tool: "auto-checkpoint",
    file: checkpoint.file,
    summary: checkpoint.summary,
  })

  lastCheckpointTime = Date.now()
  return true
}

/**
 * Reset checkpoint timer (called on session start).
 */
export function resetCheckpointTimer(): void {
  lastCheckpointTime = 0
}
