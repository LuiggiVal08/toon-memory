import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "fs"
import { join } from "path"
import { createHash } from "crypto"
import { withLockSync, atomicWrite } from "../lib/lock"
import { heartbeat, endSession, resolveSessionId, currentBranch } from "../lib/sessions"

/**
 * Hook capture script for toon-memory.
 *
 * Invoked by an agent's PostToolUse / Stop hook. Reads the JSON payload
 * from stdin, applies a deterministic privacy filter, de-duplicates, and
 * appends a lightweight observation to `.toon-memory/memory/observations.toon`.
 *
 * This script makes NO network calls and NO LLM calls. It only records
 * what tool ran. Promoting an observation into real memory is still the
 * agent's decision (via `memory_remember`).
 *
 * Two concerns, decoupled:
 *  - SESSION HEARTBEAT: always runs (opt-out via TOON_MEMORY_NO_SESSION).
 *    It records this session's presence/branch/files so parallel sessions
 *    can coordinate via `memory_sessions`. No server, no network.
 *  - OBSERVATION LOG: opt-in. Only writes to observations.toon when
 *    TOON_MEMORY_CAPTURE is set or config.json has `"capture": true`.
 */

const MEMORY_DIR = join(process.cwd(), ".toon-memory", "memory")
const OBSERVATIONS_FILE = join(MEMORY_DIR, "observations.toon")
const CONFIG_FILE = join(MEMORY_DIR, "config.json")

const DEDUP_WINDOW_MS = 5 * 60 * 1000

function captureEnabled(): boolean {
  if (process.env.TOON_MEMORY_CAPTURE) return true
  try {
    const cfg = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"))
    if (cfg && cfg.capture) return true
  } catch {
    // no config
  }
  return false
}

function sessionEnabled(): boolean {
  return !process.env.TOON_MEMORY_NO_SESSION
}

/** Deterministic secret redaction — no LLM, no network. */
function stripSecrets(text: string): string {
  let t = text
  t = t.replace(/sk-[A-Za-z0-9]{20,}/g, "<redacted>")
  t = t.replace(/AKIA[0-9A-Z]{16}/g, "<redacted>")
  t = t.replace(/gh[pousr]_[A-Za-z0-9]{36,}/g, "<redacted>")
  t = t.replace(/xox[baprs]-[A-Za-z0-9-]{10,}/g, "<redacted>")
  t = t.replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "<redacted>")
  t = t.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer <redacted>")
  t = t.replace(
    /(password|secret|token|api[_-]?key|access[_-]?key|private[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9/+._-]{8,}/gi,
    (m) => m.replace(/[A-Za-z0-9/+._-]{8,}$/, "<redacted>")
  )
  return t
}

/** Extract a short, human-readable summary and file path from a tool payload. */
function derive(tool: string, input: unknown): { file: string; summary: string } {
  let file = ""
  let summary = ""

  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>
    file = String(obj.file_path || obj.path || obj.filename || obj.notebook_path || "")
    const rawCmd =
      obj.command ??
      obj.cmd ??
      obj.prompt ??
      obj.new_string ??
      obj.old_string ??
      obj.content ??
      ""
    if (rawCmd) summary = String(rawCmd)
    else summary = JSON.stringify(obj).slice(0, 200)
  } else if (typeof input === "string") {
    summary = input
  }

  summary = stripSecrets(String(summary || "")).replace(/\s+/g, " ").trim().slice(0, 200)
  return { file: String(file || "").trim(), summary }
}

function ensureMemoryDir(): void {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })
}

function appendObservation(row: string): void {
  ensureMemoryDir()
  let data = existsSync(OBSERVATIONS_FILE)
    ? readFileSync(OBSERVATIONS_FILE, "utf-8")
    : "version: 1\nobservations[0|]{ts|session|agent|branch|tool|hash|file|summary}:\n"

  const lines = data.split("\n")
  let headerIdx = lines.findIndex((l) => l.startsWith("observations["))
  if (headerIdx === -1) {
    lines.push("observations[0|]{ts|session|agent|branch|tool|hash|file|summary}:")
    headerIdx = lines.length - 1
  }

  const entryLines = lines
    .slice(headerIdx + 1)
    .filter((l) => l.trim().length > 0)
    .map((l) => l.trim())

  entryLines.unshift(row)

  const match = lines[headerIdx].match(/\[(\d+)\|/)
  const count = match ? parseInt(match[1]) : 0
  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count + 1}|`)
  lines.splice(headerIdx + 1, lines.length - headerIdx - 1, ...entryLines.map((l) => `  ${l}`))
  withLockSync(OBSERVATIONS_FILE, () => atomicWrite(OBSERVATIONS_FILE, lines.join("\n")))
}

function main(): void {
  const agent = process.argv[2] || "agent"

  let raw = ""
  try {
    raw = readFileSync(0, "utf-8")
  } catch {
    process.exit(0)
  }

  let payload: Record<string, unknown> = {}
  try {
    payload = JSON.parse(raw)
  } catch {
    process.exit(0)
  }

  const toolName: string =
    (payload.tool_name as string) ||
    (payload.toolName as string) ||
    (payload.tool as string) ||
    ""

  // Stop / SessionEnd events have no tool — record as a session marker.
  const isStop = !toolName && (payload.session_id || payload.stop_reason || payload.session_id_untruncated)
  const effectiveTool = toolName || "Stop"

  const sessionId = resolveSessionId(payload)

  // Session heartbeat: always run (unless explicitly disabled) so parallel
  // sessions can coordinate. Cheap, local, no network.
  if (sessionEnabled()) {
    const input = payload.tool_input ?? payload.input ?? {}
    const { file } = derive(effectiveTool, input)
    if (isStop) endSession(agent, sessionId)
    else heartbeat(agent, sessionId, { file })
  }

  // Observation log: opt-in only.
  if (!captureEnabled()) process.exit(0)

  const input = payload.tool_input ?? payload.input ?? {}
  const { file, summary } = derive(effectiveTool, input)
  const normalized = JSON.stringify(input ?? {})
  const hash = createHash("sha256").update(`${effectiveTool}|${normalized}`).digest("hex").slice(0, 16)
  const ts = new Date().toISOString()
  const branch = currentBranch()

  // De-duplicate within window (deterministic, no LLM).
  if (existsSync(OBSERVATIONS_FILE)) {
    const data = readFileSync(OBSERVATIONS_FILE, "utf-8")
    for (const line of data.split("\n")) {
      if (!line.startsWith("  ")) continue
      const p = line.trim().split("|")
      if (p[5] === hash) {
        const prev = new Date(p[0]).getTime()
        if (Date.now() - prev < DEDUP_WINDOW_MS) process.exit(0)
      }
    }
  }

  if (!isStop && !toolName) process.exit(0)

  appendObservation(`${ts}|${sessionId}|${agent}|${branch}|${effectiveTool}|${hash}|${file}|${summary}`)
  process.exit(0)
}

main()
