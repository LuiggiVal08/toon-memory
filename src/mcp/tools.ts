import type { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync } from "fs"
import { join, basename } from "path"
import { readMemory, writeMemory, safeWrite } from "./memory-io"
import { loadConfig, saveConfig, getKey, MEMORY_FILE, OBSERVATIONS_FILE, MEMORY_DIR, MAX_ENTRIES, getMaxEntries, ARCHIVE_FILE } from "./config"
import { generateId, parseTTL, isExpired, inferTags, parseRelativeDate } from "./entries"
import { findRelatedEntries, bumpAccessed } from "./scoring"
import { readObservations } from "./observations"
import { archiveOldEntries } from "./archive"
import { consolidateEntries } from "./consolidation"
import { readUnderLock } from "../lib/lock"
import { encrypt, decrypt } from "./crypto"
import { graphRecallDetailed, renderCompact, parseEntries } from "../lib/graph"
import { qualityScore, mergeEntries, generateSmartRecall } from "../lib/quality"
import { generateContextBrief, generateContextGenerate, generateContextDiff, generateContextFocus, generateContextHealth, generateContextExport } from "../lib/context"
import { coordinationView, resolveSessionId, currentBranch, SESSION_TTL_MS } from "../lib/sessions"
import { fileMtimes } from "../lib/git"

/**
 * Register all 20 memory tools.
 */
export function registerTools(server: McpServer): void {

// ── memory_remember ──────────────────────────────────────────────────────────

server.registerTool(
  "memory_remember",
  {
    title: "Save to Memory",
    description: "Save a fact to the project's persistent memory (decisions, patterns, bugs, knowledge). Persists between sessions. Tags: 'private' excludes from context injection; 'superseded' marks as obsolete.",
    inputSchema: {
      category: z.enum(["decision", "pattern", "bug", "knowledge"]).describe("Category of the fact"),
      key: z.string().describe("Short title in kebab-case (e.g. risk-engine-priority)"),
      content: z.string().describe("Detailed content of the fact"),
      file: z.string().optional().default("").describe("Related file or line (e.g. spec.md:145)"),
      tags: z.string().optional().default("").describe("Semicolon-separated tags (e.g. risk;spec)"),
      ttl: z.string().optional().default("").describe("Time to live (e.g. 7d, 2026-07-17). Empty = no expiration"),
      links: z.string().optional().default("").describe("Related entry keys, separated by space or ';' (e.g. risk-spec engine-arch). Builds graph edges."),
    },
  },
  async ({ category, key, content, file, tags, ttl, links }) => {
    const data = readMemory()
    const newId = generateId()
    const date = new Date().toISOString().split("T")[0]
    const lines = data.split("\n")

    let headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
    if (headerIdx === -1) {
      lines.push(`[0|]`)
      headerIdx = lines.length - 1
    }

    let existingIdx = -1
    let existingId = newId
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.startsWith("  ") || !line.includes("|")) continue
      if (line.startsWith("  summaries:")) break
      const parts = line.trim().split("|")
      if (parts[2] === key) {
        existingIdx = i
        existingId = parts[0]
        break
      }
    }

    const entryId = existingIdx !== -1 ? existingId : newId
    const resolvedTtl = parseTTL(ttl)
    const resolvedTags = tags ? tags : inferTags(content, key, loadConfig().vocab)
    const existingParts = existingIdx !== -1 ? lines[existingIdx].trim().split("|") : []
    const resolvedLinks = links
      ? links.split(/[\s;]+/).filter(Boolean).join(" ")
      : existingParts[9] || ""
    let newEntry = `${entryId}|${category}|${key}|${content}|${file || ""}|${resolvedTags}|${date}|${resolvedTtl}|0|${resolvedLinks}`
    let action = "Saved"
    let mergeInfo = ""
    const tagsInferred = !tags && resolvedTags ? true : false

    if (existingIdx !== -1) {
      newEntry = mergeEntries(lines[existingIdx].trim(), newEntry)
      lines[existingIdx] = `  ${newEntry}`
      action = "Updated"
      mergeInfo = "\nMerge: tags combined, date and links updated"
    } else {
      const quality = qualityScore(resolvedTags, resolvedLinks, content, date)
      const confidence = 1.0
      newEntry = `${entryId}|${category}|${key}|${content}|${file || ""}|${resolvedTags}|${date}|${resolvedTtl}|0|${resolvedLinks}|${quality.toFixed(2)}|${confidence}`
      const match = lines[headerIdx].match(/\[(\d+)\|/)
      const count = match ? parseInt(match[1]) : 0
      lines.splice(headerIdx + 1, 0, `  ${newEntry}`)
      lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count + 1}|`)
    }

    writeMemory(lines.join("\n"))

    const headerMatch = lines[headerIdx].match(/\[(\d+)\|/)
    const entryCount = headerMatch ? parseInt(headerMatch[1]) : 0
    let archiveMsg = ""
    if (entryCount > getMaxEntries()) {
      const result = archiveOldEntries({ trimToMax: true })
      if (result.archived > 0) {
        archiveMsg = `\n📦 Auto-archived ${result.archived} low-importance entries (${result.kept} kept)`
      }
    }

    const ttlMsg = resolvedTtl ? `\n⏰ TTL: ${resolvedTtl}` : ""
    const inferredMsg = tagsInferred ? `\n🏷️ Inferred tags: ${resolvedTags}` : ""

    const related = findRelatedEntries(`${key} ${content} ${resolvedTags}`, key, 3)
    let relatedMsg = ""
    if (related.length > 0) {
      const items = related.map((r) => `  [${r.cat}] ${r.key} — ${r.content.slice(0, 80)}`).join("\n")
      relatedMsg = `\n\n🔗 Related entries:\n${items}`
    }

    return {
      content: [{ type: "text" as const, text: `🧠 ${action}: ${category}/${key} (${entryId})\n${content}${ttlMsg}${inferredMsg}${archiveMsg}${mergeInfo}${relatedMsg}` }],
    }
  }
)

// ── memory_recall ────────────────────────────────────────────────────────────

server.registerTool(
  "memory_recall",
  {
    title: "Search Memory",
    description: "Search the project's persistent memory. Returns relevant entries. Use BEFORE reading files. Pattern: recall → context_diff for recent changes → capture to save observations.",
    inputSchema: {
      query: z.string().describe("Text to search for"),
      category: z.string().optional().default("").describe("Filter by category (empty = all)"),
      from_date: z.string().optional().default("").describe("Start date filter (YYYY-MM-DD)"),
      to_date: z.string().optional().default("").describe("End date filter (YYYY-MM-DD)"),
      mode: z.enum(["flat", "graph"]).optional().default("flat").describe("'flat' = keyword search (default). 'graph' = graph-based recall: expands the related-entry subgraph from matches (more precise, fewer tokens)."),
      hops: z.number().optional().default(1).describe("Graph depth in 'graph' mode (1 or 2). Default 1."),
      compact: z.boolean().optional().default(false).describe("Token-efficient output: numeric indices (1, 2), omits id/date/file (keeps tags), edges as '->2', truncates graph neighbors to a snippet. Does not mutate .toon file."),
    },
  },
  async ({ query, category, from_date, to_date, mode, hops, compact }) => {
    const data = readMemory()

    // Delegate to graphRecallDetailed for both flat and graph modes
    // This avoids duplicating BM25 + ranking logic
    const detail = graphRecallDetailed(data, query, { category, from_date, to_date, hops })
    if (detail.entries.length === 0) {
      return { content: [{ type: "text" as const, text: `No results found for "${query}"` }] }
    }
    bumpAccessed(detail.entries.map((e) => e.id))
    if (compact) {
      const formatted = renderCompact(detail.entries, {
        adjacency: detail.adjacency,
        seeds: detail.seeds,
        snippetLen: 90,
      })
      return { content: [{ type: "text" as const, text: formatted }] }
    }
    const formatted = detail.entries
      .map((r) => {
        const links = r.links.length ? `\n  links: ${r.links.join(", ")}` : ""
        return `[${r.category}] ${r.key} (${r.id})\n  ${r.content}\n  File: ${r.file} | Tags: ${r.tags.join(";")} | Date: ${r.date}${links}`
      })
      .join("\n\n")
    return { content: [{ type: "text" as const, text: formatted }] }
  }
)

// ── memory_forget ────────────────────────────────────────────────────────────

server.registerTool(
  "memory_forget",
  {
    title: "Delete from Memory",
    description: "Delete a memory entry by its key or id.",
    inputSchema: {
      key: z.string().describe("Key or id of the entry to delete"),
    },
  },
  async ({ key }) => {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

    if (headerIdx === -1) {
      return { content: [{ type: "text" as const, text: "No entries in memory" }] }
    }

    const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && !l.startsWith("  summaries:"))
    const filtered = entryLines.filter((l) => {
      const parts = l.trim().split("|")
      return parts[0] !== key && parts[2] !== key
    })

    const removed = entryLines.length - filtered.length
    const match = lines[headerIdx].match(/\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count - removed}|`)
    lines.splice(headerIdx + 1, entryLines.length, ...filtered.map((l) => `  ${l.trim()}`))

    writeMemory(lines.join("\n"))

    if (removed === 0) {
      return {
        content: [{ type: "text" as const, text: `"${key}" not found in memory.` }],
      }
    }

    return {
      content: [{ type: "text" as const, text: `"${key}" deleted. ${count - removed} entries remaining.` }],
    }
  }
)

// ── memory_stats ─────────────────────────────────────────────────────────────

server.registerTool(
  "memory_stats",
  {
    title: "Memory Stats",
    description: "Show project memory statistics.",
    inputSchema: {},
  },
  async () => {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
    const entries = lines.map((l) => {
      const parts = l.trim().split("|")
      return { category: parts[1] || "unknown", ttl: parts[7] || "", quality: parts[10] || "" }
    })

    const byCategory: Record<string, number> = {}
    for (const e of entries) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1
    }

    const withTtl = entries.filter((e) => e.ttl).length
    const expired = entries.filter((e) => e.ttl && isExpired(e.ttl)).length
    const withQuality = entries.filter((e) => e.quality).length
    const avgQuality = withQuality > 0
      ? (entries.reduce((sum, e) => sum + (e.quality ? parseFloat(e.quality) : 0), 0) / withQuality).toFixed(2)
      : "N/A"

    const summaryLines = data.split("\n").filter((l) => l.includes(":") && !l.startsWith("  ") && !l.startsWith("version") && !l.startsWith("entries") && !/^\[\d+\|]/.test(l))
    const stats = [
      `Total entries: ${entries.length}`,
      `File summaries: ${summaryLines.length}`,
      "",
      "By category:",
      ...Object.entries(byCategory).map(([k, v]) => `  ${k}: ${v}`),
      "",
      `TTL: ${withTtl} with expiration, ${expired} expired`,
      `Average quality: ${avgQuality} (${withQuality} with score)`,
      "",
      `Last 5 entries:`,
      ...lines.slice(-5).map((l) => {
        const parts = l.trim().split("|")
        const ttlInfo = parts[7] ? ` | TTL: ${parts[7]}` : ""
        const qualityInfo = parts[10] ? ` | Q: ${parts[10]}` : ""
        return `  [${parts[1]}] ${parts[2]} (${parts[0]})${ttlInfo}${qualityInfo}`
      }),
    ]

    return { content: [{ type: "text" as const, text: stats.join("\n") }] }
  }
)

// ── memory_diff ──────────────────────────────────────────────────────────────

server.registerTool(
  "memory_diff",
  {
    title: "Memory Diff",
    description: "Show what changed in memory since a date. Useful for seeing what was learned since the last session.",
    inputSchema: {
      since: z.string().describe("Show changes since (e.g. 24h, 7d, 2026-07-10)"),
      type: z.enum(["all", "created", "updated"]).optional().default("all").describe("Filter by change type"),
    },
  },
  async ({ since, type }) => {
    const sinceDate = parseRelativeDate(since)
    const today = new Date().toISOString().split("T")[0]
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))

    const results = lines
      .map((line) => {
        const trimmed = line.trim()
        const parts = trimmed.split("|")
        if (parts.length < 7) return null
        const [id, cat, key, content, file, tags, date] = parts
        if (date < sinceDate) return null
        const changeType = date === today ? "created" : "updated"
        if (type !== "all" && changeType !== type) return null
        return { id, cat, key, content, file, tags, date, changeType }
      })
      .filter(Boolean)

    if (results.length === 0) {
      return { content: [{ type: "text" as const, text: `No changes since ${sinceDate}` }] }
    }

    const created = results.filter((r) => r!.changeType === "created")
    const updated = results.filter((r) => r!.changeType === "updated")

    const sections: string[] = [`📋 Changes since ${sinceDate}:`, ""]

    if (created.length > 0 && (type === "all" || type === "created")) {
      sections.push(`➕ New (${created.length}):`)
      for (const r of created) {
        sections.push(`  [${r!.cat}] ${r!.key} (${r!.id})\n    ${r!.content}`)
      }
      sections.push("")
    }

    if (updated.length > 0 && (type === "all" || type === "updated")) {
      sections.push(`✏️  Updated (${updated.length}):`)
      for (const r of updated) {
        sections.push(`  [${r!.cat}] ${r!.key} (${r!.id}) — ${r!.date}`)
      }
      sections.push("")
    }

    return { content: [{ type: "text" as const, text: sections.join("\n") }] }
  }
)

// ── memory_suggest ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_suggest",
  {
    title: "Suggest Related Memories",
    description: "Suggest memory entries related to a given context. Useful for gathering context before a task.",
    inputSchema: {
      context: z.string().describe("Text or context to search for suggestions"),
      limit: z.number().optional().default(5).describe("Maximum suggestions"),
    },
  },
  async ({ context, limit }) => {
    const related = findRelatedEntries(context, "", limit)

    if (related.length === 0) {
      return { content: [{ type: "text" as const, text: `No related entries found for "${context}"` }] }
    }

    const formatted = related
      .map((r) => `[${r.cat}] ${r.key} (${r.id})\n  ${r.content}\n  File: ${r.file} | Tags: ${r.tags} | Date: ${r.date}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: `🔍 Suggestions for "${context}":\n\n${formatted}` }] }
  }
)

// ── memory_smart_recall ──────────────────────────────────────────────────────

server.registerTool(
  "memory_smart_recall",
  {
    title: "Smart Recall (Unified)",
    description: "Unified retrieval: combines BM25 + graph + decay + quality in a single call. Use at the START of each task to get all relevant memory context. Then use context_diff for recent changes, context_focus for deep dives.",
    inputSchema: {
      intent: z.string().describe("Describe what you need to know (e.g. 'database schema for backend')"),
      limit: z.number().optional().default(8).describe("Maximum entries to return"),
      category: z.string().optional().default("").describe("Filter by category (empty = all)"),
    },
  },
  async ({ intent, limit, category }) => {
    const data = readMemory()
    const mtimes = fileMtimes()
    const result = generateSmartRecall(data, intent, { limit, category, fileMtimes: mtimes })
    return { content: [{ type: "text" as const, text: result }] }
  }
)

// ── memory_summary ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_summary",
  {
    title: "File Summary",
    description: "Save or retrieve a summary of a large file to save tokens.",
    inputSchema: {
      action: z.enum(["get", "set"]).describe("get to read, set to save"),
      file: z.string().describe("File path"),
      summary: z.string().optional().default("").describe("File summary (only for set)"),
    },
  },
  async ({ action, file, summary }) => {
    const data = readMemory()

    if (action === "get") {
      const lines = data.split("\n")
      const summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))
      if (summaryIdx === -1) {
        return { content: [{ type: "text" as const, text: `No summaries saved for "${file}"` }] }
      }

      const summaryLines = lines.slice(summaryIdx + 1).filter((l) => l.includes(":"))
      const match = summaryLines.find((l) => l.startsWith(`  ${file}:`))
      if (!match) {
        return { content: [{ type: "text" as const, text: `No summary for "${file}"` }] }
      }

      const summaryText = match.replace(`  ${file}: `, "")
      return { content: [{ type: "text" as const, text: summaryText }] }
    }

    const lines = data.split("\n")
    let summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))

    if (summaryIdx === -1) {
      lines.push("", "summaries:")
      summaryIdx = lines.length - 1
    }

    const summaryLines = lines.slice(summaryIdx + 1).filter((l) => l.includes(":"))
    const existingIdx = summaryLines.findIndex((l) => l.startsWith(`  ${file}:`))

    if (existingIdx !== -1) {
      summaryLines[existingIdx] = `  ${file}: ${summary}`
    } else {
      summaryLines.push(`  ${file}: ${summary}`)
    }

    lines.splice(summaryIdx + 1, lines.length - summaryIdx - 1, ...summaryLines)
    writeMemory(lines.join("\n"))
    return {
      content: [{ type: "text" as const, text: `📝 Summary saved for ${file}` }],
    }
  }
)

// ── memory_archive ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_archive",
  {
    title: "Archive Old Entries",
    description: "Move old entries (>30 days) to archive.toon to keep memory clean.",
    inputSchema: {},
  },
  async () => {
    const result = archiveOldEntries()

    if (result.archived === 0) {
      return { content: [{ type: "text" as const, text: "No old entries to archive" }] }
    }

    return {
      content: [{
        type: "text" as const,
        text: `📦 Archived ${result.archived} old entries\n📋 ${result.kept} active entries remaining`
      }],
    }
  }
)

// ── memory_encrypt ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_encrypt",
  {
    title: "Enable Encryption",
    description: "Enable AES-256-GCM encryption for memory. Requires TOON_MEMORY_KEY in environment.",
    inputSchema: {},
  },
  async () => {
    const config = loadConfig()

    if (config.encrypted) {
      return { content: [{ type: "text" as const, text: "Encryption is already enabled" }] }
    }

    const key = getKey()
    if (!key) {
      return { content: [{ type: "text" as const, text: "❌ Set TOON_MEMORY_KEY in environment before encrypting" }] }
    }

    const data = readUnderLock(MEMORY_FILE)
    const encrypted = encrypt(data, key)
    safeWrite(MEMORY_FILE, encrypted)

    saveConfig({ encrypted: true })

    return {
      content: [{ type: "text" as const, text: "🔐 Encryption enabled" }],
    }
  }
)

// ── memory_decrypt ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_decrypt",
  {
    title: "Disable Encryption",
    description: "Disable encryption and decode memory.",
    inputSchema: {
      key: z.string().describe("Encryption key"),
    },
  },
  async ({ key }) => {
    const config = loadConfig()

    if (!config.encrypted) {
      return { content: [{ type: "text" as const, text: "Encryption is not enabled" }] }
    }

    const resolvedKey = key || getKey() || ""
    if (!resolvedKey) {
      return { content: [{ type: "text" as const, text: "❌ No key provided. Pass as argument or set in .env file" }] }
    }

    try {
      const data = readUnderLock(MEMORY_FILE)
      const decrypted = decrypt(data, resolvedKey)

      safeWrite(MEMORY_FILE, decrypted)
      saveConfig({ encrypted: false })

      return {
        content: [{ type: "text" as const, text: "🔓 Encryption disabled" }],
      }
    } catch {
      return { content: [{ type: "text" as const, text: "❌ Wrong key or corrupted data" }] }
    }
  }
)

// ── memory_captured ──────────────────────────────────────────────────────────

server.registerTool(
  "memory_captured",
  {
    title: "List Captured Activity",
    description: "Show activity log captured automatically by hooks (only if capture is enabled). Useful for promoting observations to memory with memory_remember.",
    inputSchema: {
      limit: z.number().optional().default(20).describe("Maximum observations to show"),
      tool: z.string().optional().default("").describe("Filter by tool name"),
      file: z.string().optional().default("").describe("Filter by file"),
      clear: z.boolean().optional().default(false).describe("If true, clears the capture log"),
    },
  },
  async ({ limit, tool, file, clear }) => {
    if (clear) {
      if (existsSync(OBSERVATIONS_FILE)) {
        writeFileSync(OBSERVATIONS_FILE, "version: 1\nobservations[0|]{ts|session|agent|branch|tool|hash|file|summary}:\n")
      }
        return { content: [{ type: "text" as const, text: "🧹 Capture log cleared" }] }
    }

    let obs = readObservations()
    if (tool) obs = obs.filter((o) => o.tool.toLowerCase().includes(tool.toLowerCase()))
    if (file) obs = obs.filter((o) => o.file.toLowerCase().includes(file.toLowerCase()))
    obs = obs.slice(-limit).reverse()

    if (obs.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No captured activity. Capture is disabled by default; enable with `toon-memory capture on`.",
        }],
      }
    }

    const formatted = obs
      .map((o) => `[${o.ts}] ${o.agent}@${o.branch}/${o.tool}${o.file ? ` (${o.file})` : ""}\n  ${o.summary}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: `🔍 Captured activity (${obs.length}):\n\n${formatted}` }] }
  }
)

// ── memory_consolidate ───────────────────────────────────────────────────────

server.registerTool(
  "memory_consolidate",
  {
    title: "Consolidate Memory",
    description: "Consolidate memory by removing entries with identical content (keeps the first). Deterministic, no LLM.",
    inputSchema: {},
  },
  async () => {
    const result = consolidateEntries()
    if (result.removed === 0) {
      return { content: [{ type: "text" as const, text: `✅ Memory already consolidated (${result.kept} entries, 0 duplicates)` }] }
    }
    return {
      content: [{
        type: "text" as const,
        text: `🧹 Consolidated ${result.removed} duplicate entries.\n${result.kept} active entries remaining.\nDuplicates: ${result.duplicates.join(", ")}`,
      }],
    }
  }
)

// ── memory_sessions ──────────────────────────────────────────────────────────

server.registerTool(
  "memory_sessions",
  {
    title: "Active Sessions & Conflicts",
    description: "Show active agent sessions in this project (git branch, files touched, last-seen) and detect soft conflicts (files touched by 2+ sessions). Use at startup to avoid overwriting other parallel sessions' work.",
    inputSchema: {
      conflictsOnly: z.boolean().optional().default(false).describe("If true, only show soft conflicts"),
    },
  },
  async ({ conflictsOnly }) => {
    const selfId = resolveSessionId()
    const { active, conflicts } = coordinationView(selfId)

    if (conflictsOnly) {
      if (conflicts.length === 0) {
        return { content: [{ type: "text" as const, text: "✅ No soft conflicts between active sessions." }] }
      }
      const lines = conflicts.map((c) => {
        const who = c.sessions.map((s) => `${s.agent}@${s.branch} (${s.id})`).join(", ")
        return `⚠️ ${c.file}\n   ↔ ${who}`
      })
      return {
        content: [{ type: "text" as const, text: `🔥 Soft conflicts (${conflicts.length}):\n\n${lines.join("\n\n")}` }],
      }
    }

    if (active.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "🟢 No other active sessions in this project.\n(This session: " + selfId + " @ " + currentBranch() + ")",
        }],
      }
    }

    const ttlMin = Math.round(SESSION_TTL_MS / 60000)
    const section = (s: ReturnType<typeof coordinationView>["active"][number]) => {
      const mins = Math.max(0, Math.round(s.ageMs / 60000))
      const tag = s.id === selfId ? " (you)" : ""
      const ended = s.ended ? " 🏁" : ""
      const files = Object.keys(s.files).slice(0, 8).map((f) => `      • ${f}`).join("\n")
      const fileBlock = files ? `\n   Files:\n${files}` : ""
      return `• ${s.agent} @ ${s.branch}${tag}${ended}\n   id: ${s.id}\n   ${mins} min ago${fileBlock}`
    }

    const parts = [
      `🧭 Active sessions (${active.length}) — window ${ttlMin} min:`,
      "",
      ...active.map(section),
    ]

    if (conflicts.length > 0) {
      parts.push("", `🔥 Soft conflicts (${conflicts.length}):`)
      for (const c of conflicts) {
        const who = c.sessions.map((s) => `${s.agent}@${s.branch}`).join(", ")
        parts.push(`   ⚠️ ${c.file}  ↔  ${who}`)
      }
    } else {
      parts.push("", "✅ No soft conflicts detected.")
    }

    return { content: [{ type: "text" as const, text: parts.join("\n") }] }
  }
)

// ── context_brief ────────────────────────────────────────────────────────────

server.registerTool(
  "context_brief",
  {
    title: "Context Briefing",
    description: "Generate a compact context briefing: relevant memory + active sessions + project health. Single call instead of 5-6 separate calls. Zero LLM, pure deterministic logic.",
    inputSchema: {
      task: z.string().optional().default("").describe("Current agent task. If provided, entries are ranked by relevance to this task. If empty, shows top entries by importance."),
      limit: z.number().optional().default(6).describe("Maximum relevant entries to show"),
    },
  },
  async ({ task, limit }) => {
    const data = readMemory()
    const brief = generateContextBrief(data, { task: task || undefined, limit })
    return { content: [{ type: "text" as const, text: brief }] }
  }
)

// ── context_generate ─────────────────────────────────────────────────

server.registerTool(
  "context_generate",
  {
    title: "Generate Full Context",
    description: "Generate a full system prompt: project (package.json, deps, framework) + git (branch, commits) + memory (relevant entries) + sessions. Single call to prepare the agent. Zero LLM.",
    inputSchema: {
      task: z.string().optional().default("").describe("Agent task. If provided, ranks entries by relevance to this task."),
    },
  },
  async ({ task }) => {
    const data = readMemory()
    const root = process.cwd()
    const brief = generateContextGenerate(data, root, { task: task || undefined })
    return { content: [{ type: "text" as const, text: brief }] }
  }
)

// ── context_diff ─────────────────────────────────────────────────────

server.registerTool(
  "context_diff",
  {
    title: "Context Diff",
    description: "What changed since the last session: git commits + modified files + new/updated memory entries. Zero LLM.",
    inputSchema: {
      since: z.string().optional().default("").describe("Start date (YYYY-MM-DD or relative like '7d'). Empty = last visible changes."),
    },
  },
  async ({ since }) => {
    const data = readMemory()
    const root = process.cwd()
    const diff = generateContextDiff(data, root, since || undefined)
    return { content: [{ type: "text" as const, text: diff }] }
  }
)

// ── context_focus ────────────────────────────────────────────────────

server.registerTool(
  "context_focus",
  {
    title: "Focus Context for Task",
    description: "Hyper-focused context for a specific task: relevant entries + related files + code referencing the symbol + existing tests. Zero LLM.",
    inputSchema: {
      task: z.string().describe("Task or symbol to search context for (e.g. 'fix auth bug', 'authenticate')"),
      limit: z.number().optional().default(6).describe("Maximum memory entries to include"),
    },
  },
  async ({ task, limit }) => {
    const data = readMemory()
    const root = process.cwd()
    const focused = generateContextFocus(data, root, task, { limit })
    return { content: [{ type: "text" as const, text: focused }] }
  }
)

// ── context_health ───────────────────────────────────────────────────

server.registerTool(
  "context_health",
  {
    title: "Memory Health Audit",
    description: "Full memory health audit: orphan links, duplicates, broken refs, expired TTL, quality, stale sessions. Includes score 0-100. Zero LLM.",
    inputSchema: {},
  },
  async () => {
    const data = readMemory()
    const root = process.cwd()
    const { markdown } = generateContextHealth(data, root)
    return { content: [{ type: "text" as const, text: markdown }] }
  }
)

// ── context_export ───────────────────────────────────────────────────

server.registerTool(
  "context_export",
  {
    title: "Export Memory as Markdown",
    description: "Export all memory as markdown injectable for other agents or sessions. Full (detailed) or compact format. Zero LLM.",
    inputSchema: {
      format: z.enum(["full", "compact"]).optional().default("full").describe("full = detailed with graph, compact = summarized without edges"),
    },
  },
  async ({ format }) => {
    const data = readMemory()
    const exported = generateContextExport(data, format as "full" | "compact")
    return { content: [{ type: "text" as const, text: exported }] }
  }
)

// ── memory_backup ───────────────────────────────────────────────────

server.registerTool(
  "memory_backup",
  {
    title: "Backup Memory",
    description: "Create a timestamped backup of the memory file. Use before major operations or to preserve state.",
    inputSchema: {},
  },
  async () => {
    if (!existsSync(MEMORY_FILE)) {
      return { content: [{ type: "text" as const, text: "No memory file to backup" }] }
    }

    const backupDir = join(MEMORY_DIR, "backups")
    if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
    const backupFile = join(backupDir, `memory-${timestamp}.toon`)

    copyFileSync(MEMORY_FILE, backupFile)

    // Also backup archive if it exists
    let archiveBackup = ""
    if (existsSync(ARCHIVE_FILE)) {
      const archiveBackupFile = join(backupDir, `archive-${timestamp}.toon`)
      copyFileSync(ARCHIVE_FILE, archiveBackupFile)
      archiveBackup = `\n📦 Archive backed up`
    }

    // Prune old backups (keep last 10)
    const backups = readdirSync(backupDir)
      .filter((f) => f.startsWith("memory-") && f.endsWith(".toon"))
      .sort()
      .reverse()
    for (const old of backups.slice(10)) {
      try {
        const { unlinkSync } = require("fs")
        unlinkSync(join(backupDir, old))
      } catch {
        // ignore
      }
    }

    return {
      content: [{
        type: "text" as const,
        text: `💾 Memory backed up to ${basename(backupFile)}${archiveBackup}\n📦 ${backups.length} backup(s) retained`
      }],
    }
  }
)

} // end registerTools
