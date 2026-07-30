import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerAppTool } from "@modelcontextprotocol/ext-apps/server"
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
import { graphRecallDetailed, renderCompact, parseEntries, buildGraph } from "../lib/graph"
import { qualityScore, mergeEntries, generateSmartRecall } from "../lib/quality"
import { generateContextBrief, generateContextGenerate, generateContextDiff, generateContextFocus, generateContextHealth, generateContextExport } from "../lib/context"
import { coordinationView, resolveSessionId, currentBranch, SESSION_TTL_MS } from "../lib/sessions"
import { fileMtimes } from "../lib/git"
import { normalize, isExpiredLocal, tokenize, importance } from "../lib/utils"
import { expandSynonyms } from "../lib/synonyms"

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
    const config = loadConfig()
    const verbatim = config.verbatim === true
    const resolvedTags = tags ? tags : (verbatim ? "" : inferTags(content, key, config.vocab))
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
      const accessed = 0
      const lastAccessed = ""
      const quality = verbatim ? 0.5 : qualityScore(resolvedTags, resolvedLinks, content, date, accessed, lastAccessed)
      const confidence = 1.0
      newEntry = `${entryId}|${category}|${key}|${content}|${file || ""}|${resolvedTags}|${date}|${resolvedTtl}|${accessed}|${resolvedLinks}|${quality.toFixed(2)}|${confidence}|${lastAccessed}`
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
        const accessInfo = parts[8] && parseInt(parts[8]) > 0 ? ` | accessed: ${parts[8]}x` : ""
        return `  [${parts[1]}] ${parts[2]} (${parts[0]})${ttlInfo}${qualityInfo}${accessInfo}`
      }),
      "",
      `Most accessed:`,
      ...lines
        .filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
        .map((l) => {
          const parts = l.trim().split("|")
          return { key: parts[2], accessed: parts.length > 8 ? parseInt(parts[8]) || 0 : 0, quality: parts[10] || "" }
        })
        .filter((e) => e.accessed > 0)
        .sort((a, b) => b.accessed - a.accessed)
        .slice(0, 5)
        .map((e) => `  ${e.key}: ${e.accessed}x (Q: ${e.quality})`),
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

// ── memory_primer ─────────────────────────────────────────────────────

server.registerTool(
  "memory_primer",
  {
    title: "System Primer",
    description: "Generate a compact system primer: always-current knowledge map for auto-injection into agent context. Excludes private entries, shows top memories by importance, categories, and patterns. Use at session start or when context feels stale.",
    inputSchema: {},
  },
  async () => {
    const data = readMemory()
    const { generateSystemPrimer } = await import("../lib/quality")
    const primer = generateSystemPrimer(data)
    return { content: [{ type: "text" as const, text: primer }] }
  }
)

// ── memory_compress ────────────────────────────────────────────────────

server.registerTool(
  "memory_compress",
  {
    title: "Compress Memory Entries",
    description: "LLM-powered compression: select entries to compress into one concise entry. The agent (YOU) reads the entries, writes a compressed summary, then calls memory_remember to save it. Two-step dance: this tool provides context, you provide intelligence.",
    inputSchema: {
      query: z.string().optional().default("").describe("Search query to find entries to compress (e.g. 'auth bug fixes'). Empty = show lowest-quality entries."),
      count: z.number().optional().default(3).describe("Number of entries to compress (2-10). Default: 3."),
      category: z.string().optional().default("").describe("Filter by category (empty = all)."),
    },
  },
  async ({ query, count, category }) => {
    const data = readMemory()
    const entries = parseEntries(data)
    const clampedCount = Math.max(2, Math.min(10, count))

    let candidates: typeof entries

    if (query) {
      // Find entries matching the query
      const qTokens = tokenize(query)
      const expandedTokens = expandSynonyms(qTokens)
      candidates = entries
        .filter((e) => {
          if (category && e.category !== category) return false
          if (e.ttl && isExpiredLocal(e.ttl)) return false
          const text = normalize(`${e.key} ${e.content} ${e.tags.join(" ")}`)
          return expandedTokens.some((t) => text.includes(t)) || qTokens.some((t) => text.includes(t))
        })
        .sort((a, b) => importance(b) - importance(a))
    } else {
      // Find lowest-quality entries (candidates for compression)
      candidates = entries
        .filter((e) => {
          if (category && e.category !== category) return false
          if (e.ttl && isExpiredLocal(e.ttl)) return false
          return true
        })
        .sort((a, b) => importance(a) - importance(b))
    }

    const toCompress = candidates.slice(0, clampedCount)

    if (toCompress.length < 2) {
      return {
        content: [{
          type: "text" as const,
          text: `Need at least 2 entries to compress. Found ${toCompress.length} matching entries.`
        }],
      }
    }

    // Build the compression prompt for the agent
    const entryList = toCompress.map((e, i) =>
      `${i + 1}. [${e.category}] ${e.key} (${e.id})\n   ${e.content}\n   Tags: ${e.tags.join(";")} | File: ${e.file} | Date: ${e.date}`
    ).join("\n\n")

    const prompt = [
      `📦 Compress ${toCompress.length} entries into 1 concise entry.`,
      "",
      "Entries to compress:",
      entryList,
      "",
      "Instructions:",
      "1. Read the entries above",
      "2. Write a single concise summary that captures the essential information",
      "3. Call memory_remember with:",
      `   - category: "${toCompress[0].category}" (or most appropriate)`,
      "   - key: a short kebab-case title (e.g. 'auth-bug-patterns')",
      "   - content: your compressed summary (1-3 sentences)",
      "   - tags: combine the most relevant tags from all entries",
      `   - file: "${toCompress.find((e) => e.file)?.file || ""}" (if applicable)`,
      "   - links: combine relevant links",
      "",
      "4. After saving, call memory_forget for each original entry ID:",
      toCompress.map((e) => `   memory_forget(key: "${e.id}")`).join("\n"),
      "",
      "The compressed entry should be strictly better than the sum of its parts.",
    ].join("\n")

    return { content: [{ type: "text" as const, text: prompt }] }
  }
)

// ── memory_compress_all ────────────────────────────────────────────────

server.registerTool(
  "memory_compress_all",
  {
    title: "Lazy Batch Compression",
    description: "Compress all low-quality entries (no tags, low quality score) in one pass. Deterministic, no LLM — merges entries with similar content and removes empty/stale ones. Inspired by MemPalace's lazy compression.",
    inputSchema: {
      minQuality: z.number().optional().default(0.3).describe("Entries below this quality score are compression candidates (0-1). Default: 0.3."),
      dryRun: z.boolean().optional().default(false).describe("If true, show what would be compressed without making changes."),
    },
  },
  async ({ minQuality, dryRun }) => {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
    if (headerIdx === -1) {
      return { content: [{ type: "text" as const, text: "No entries in memory." }] }
    }

    const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && !l.startsWith("  summaries:"))

    // Find compression candidates: low quality, no tags, or stale
    const candidates: { idx: number; line: string; quality: number; key: string }[] = []
    for (let i = 0; i < entryLines.length; i++) {
      const line = entryLines[i].trim()
      const parts = line.split("|")
      if (parts.length < 11) continue
      const quality = parseFloat(parts[10]) || 0
      const tags = parts[5] || ""
      const key = parts[2]
      const content = parts[3] || ""

      // Candidates: low quality OR no tags OR very short content
      const isCandidate = quality < minQuality || !tags || content.length < 20
      if (isCandidate) {
        candidates.push({ idx: i, line, quality, key })
      }
    }

    if (candidates.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: `✅ No compression candidates found. All entries have quality >= ${minQuality} or have tags.`
        }],
      }
    }

    // Group candidates by category for potential merging
    const byCategory = new Map<string, typeof candidates>()
    for (const c of candidates) {
      const parts = c.line.split("|")
      const cat = parts[1] || "unknown"
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat)!.push(c)
    }

    const sections: string[] = [
      `📦 Compression candidates: ${candidates.length} entries below quality ${minQuality}`,
      "",
      "By category:",
    ]

    for (const [cat, items] of byCategory) {
      sections.push(`  ${cat}: ${items.length} entries`)
      for (const item of items.slice(0, 3)) {
        const parts = item.line.split("|")
        sections.push(`    - ${item.key} (Q: ${item.quality.toFixed(2)}) — ${(parts[3] || "").slice(0, 60)}`)
      }
      if (items.length > 3) {
        sections.push(`    ... and ${items.length - 3} more`)
      }
    }

    if (dryRun) {
      sections.push("", "🔍 Dry run — no changes made. Use dryRun: false to compress.")
      return { content: [{ type: "text" as const, text: sections.join("\n") }] }
    }

    // Remove candidates (conservative: just remove the lowest quality ones)
    // Don't auto-merge — let the agent decide via memory_compress
    const removeKeys = new Set(candidates.map((c) => c.key))
    const kept = entryLines.filter((l) => {
      const parts = l.trim().split("|")
      return !removeKeys.has(parts[2])
    })

    const match = lines[headerIdx].match(/\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${kept.length}|`)
    lines.splice(headerIdx + 1, entryLines.length, ...kept.map((l) => `  ${l.trim()}`))
    writeMemory(lines.join("\n"))

    sections.push("", `🗑️ Removed ${candidates.length} low-quality entries. ${kept.length} entries remaining.`)
    sections.push("💡 Use memory_compress to merge related entries before removing them.")

    return { content: [{ type: "text" as const, text: sections.join("\n") }] }
  }
)

// ── memory_export_gist ─────────────────────────────────────────────────

server.registerTool(
  "memory_export_gist",
  {
    title: "Export to GitHub Gist",
    description: "Export memory to a private GitHub Gist for cloud sync. Requires GITHUB_TOKEN env var. Zero deps — uses Node's built-in fetch().",
    inputSchema: {
      description: z.string().optional().default("").describe("Optional description for the Gist."),
    },
  },
  async ({ description }) => {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return {
        content: [{
          type: "text" as const,
          text: "❌ GITHUB_TOKEN not set. Add it to your environment:\n  export GITHUB_TOKEN=ghp_your_token_here"
        }],
      }
    }

    if (!existsSync(MEMORY_FILE)) {
      return { content: [{ type: "text" as const, text: "No memory file to export." }] }
    }

    const data = readFileSync(MEMORY_FILE, "utf-8")
    const desc = description || `toon-memory backup ${new Date().toISOString().split("T")[0]}`

    try {
      const resp = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          description: desc,
          public: false,
          files: {
            "data.toon": { content: data },
          },
        }),
      })

      if (!resp.ok) {
        const err = await resp.text()
        return { content: [{ type: "text" as const, text: `❌ GitHub API error (${resp.status}): ${err}` }] }
      }

      const gist = await resp.json() as { id: string; html_url: string; created_at: string }
      return {
        content: [{
          type: "text" as const,
          text: `📤 Memory exported to Gist\nID: ${gist.id}\nURL: ${gist.html_url}\n\nTo import later: memory_import_gist(gist_id: "${gist.id}")`
        }],
      }
    } catch (err) {
      return { content: [{ type: "text" as const, text: `❌ Failed to export: ${err}` }] }
    }
  }
)

// ── memory_import_gist ─────────────────────────────────────────────────

server.registerTool(
  "memory_import_gist",
  {
    title: "Import from GitHub Gist",
    description: "Import memory from a GitHub Gist. Merges entries (keeps newer dates, combines tags). Requires GITHUB_TOKEN env var.",
    inputSchema: {
      gist_id: z.string().describe("GitHub Gist ID or full URL (https://gist.github.com/user/id)."),
      merge: z.boolean().optional().default(true).describe("If true, merge with existing memory. If false, replace entirely."),
    },
  },
  async ({ gist_id, merge }) => {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return {
        content: [{
          type: "text" as const,
          text: "❌ GITHUB_TOKEN not set. Add it to your environment:\n  export GITHUB_TOKEN=ghp_your_token_here"
        }],
      }
    }

    // Extract gist ID from URL if needed
    const idMatch = gist_id.match(/\/([a-f0-9]+)$/i) || [null, gist_id]
    const id = idMatch[1] || gist_id

    try {
      const resp = await fetch(`https://api.github.com/gists/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!resp.ok) {
        const err = await resp.text()
        return { content: [{ type: "text" as const, text: `❌ GitHub API error (${resp.status}): ${err}` }] }
      }

      const gist = await resp.json() as { files: Record<string, { content: string }> }
      const file = gist.files["data.toon"]
      if (!file) {
        return { content: [{ type: "text" as const, text: "❌ Gist does not contain data.toon file." }] }
      }

      const remoteData = file.content

      if (!merge) {
        // Replace entirely
        safeWrite(MEMORY_FILE, remoteData)
        const entries = parseEntries(remoteData)
        return {
          content: [{
            type: "text" as const,
            text: `📥 Memory replaced from Gist (${entries.length} entries).`
          }],
        }
      }

      // Merge mode: combine entries from both sources
      const localData = existsSync(MEMORY_FILE) ? readFileSync(MEMORY_FILE, "utf-8") : "version: 1\nentries[0|]\n"
      const localEntries = parseEntries(localData)
      const remoteEntries = parseEntries(remoteData)

      const localByKey = new Map(localEntries.map((e) => [e.key, e]))
      let added = 0
      let updated = 0

      for (const remote of remoteEntries) {
        const existing = localByKey.get(remote.key)
        if (!existing) {
          // New entry from remote
          localByKey.set(remote.key, remote)
          added++
        } else {
          // Merge: keep newer date, combine tags, take max quality
          const mergedTags = [...new Set([...existing.tags, ...remote.tags])].join(";")
          const mergedLinks = [...new Set([...existing.links, ...remote.links])].join(" ")
          const newerDate = remote.date > existing.date ? remote.date : existing.date
          const merged = {
            ...existing,
            tags: mergedTags.split(";").filter(Boolean),
            links: mergedLinks.split(/[\s;]+/).filter(Boolean),
            date: newerDate,
            content: remote.content.length > existing.content.length ? remote.content : existing.content,
          }
          localByKey.set(remote.key, merged)
          updated++
        }
      }

      // Rebuild the file
      const entries = [...localByKey.values()]
      const lines = [
        "version: 1",
        `[${entries.length}|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed}:`,
        ...entries.map((e) => {
          const tags = e.tags.join(";")
          const links = e.links.join(" ")
          const q = qualityScore(tags, links, e.content, e.date, e.accessed, e.lastAccessed)
          return `  ${e.id}|${e.category}|${e.key}|${e.content}|${e.file}|${tags}|${e.date}|${e.ttl}|${e.accessed}|${links}|${q.toFixed(2)}|1|${e.lastAccessed}`
        }),
      ]
      safeWrite(MEMORY_FILE, lines.join("\n"))

      return {
        content: [{
          type: "text" as const,
          text: `📥 Memory merged from Gist\n  Added: ${added} new entries\n  Updated: ${updated} existing entries\n  Total: ${entries.length} entries`
        }],
      }
    } catch (err) {
      return { content: [{ type: "text" as const, text: `❌ Failed to import: ${err}` }] }
    }
  }
)

// ── memory_merge_sessions ──────────────────────────────────────────────

server.registerTool(
  "memory_merge_sessions",
  {
    title: "Merge Session Observations",
    description: "Merge observations from multiple sessions/branches into a consolidated view. Deduplicates and suggests entries to promote to memory. Inspired by Hindsight's multi-agent session merging.",
    inputSchema: {
      since: z.string().optional().default("24h").describe("Time window to merge (e.g. '24h', '7d', '2026-07-20'). Default: 24h."),
      promote: z.boolean().optional().default(false).describe("If true, auto-promote unique observations to memory entries."),
    },
  },
  async ({ since, promote }) => {
    const { listSessions, pruneSessions } = await import("../lib/sessions")
    pruneSessions()
    const sessions = listSessions()

    // Filter sessions by time window
    const sinceMs = parseRelativeMs(since)
    const cutoff = Date.now() - sinceMs
    const recentSessions = sessions.filter((s) => new Date(s.lastSeen).getTime() >= cutoff)

    if (recentSessions.length === 0) {
      return { content: [{ type: "text" as const, text: `No sessions found in the last ${since}.` }] }
    }

    // Collect all files touched across sessions
    const allFiles = new Map<string, Array<{ session: string; agent: string; branch: string; touched: string }>>()
    for (const s of recentSessions) {
      for (const [file, touched] of Object.entries(s.files)) {
        if (!allFiles.has(file)) allFiles.set(file, [])
        allFiles.get(file)!.push({ session: s.id, agent: s.agent, branch: s.branch, touched })
      }
    }

    // Find files touched by multiple sessions (potential merge points)
    const sharedFiles = [...allFiles.entries()]
      .filter(([_, sessions]) => sessions.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)

    // Read observations for these sessions
    let observations: Array<{ ts: string; session: string; agent: string; branch: string; tool: string; file: string; summary: string }> = []
    if (existsSync(OBSERVATIONS_FILE)) {
      const data = readFileSync(OBSERVATIONS_FILE, "utf-8")
      const sessionIds = new Set(recentSessions.map((s) => s.id))
      observations = data.split("\n")
        .filter((l) => l.startsWith("  ") && l.includes("|"))
        .map((l) => {
          const p = l.trim().split("|")
          return { ts: p[0] || "", session: p[1] || "", agent: p[2] || "", branch: p[3] || "", tool: p[4] || "", file: p[6] || "", summary: p[7] || "" }
        })
        .filter((o) => sessionIds.has(o.session))
    }

    // Deduplicate observations by tool+summary hash
    const seen = new Set<string>()
    const uniqueObs = observations.filter((o) => {
      const key = `${o.tool}|${o.summary}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Build output
    const sections: string[] = [
      `🔀 Session Merge Report (${recentSessions.length} sessions, last ${since})`,
      "",
      `Sessions:`,
      ...recentSessions.map((s) => {
        const mins = Math.max(0, Math.round((Date.now() - new Date(s.lastSeen).getTime()) / 60000))
        const files = Object.keys(s.files).length
        return `  ${s.agent}@${s.branch} (${s.id}) — ${mins}min ago, ${files} files`
      }),
    ]

    if (sharedFiles.length > 0) {
      sections.push("", `Shared files (${sharedFiles.length}):`)
      for (const [file, sess] of sharedFiles.slice(0, 10)) {
        const who = sess.map((s) => `${s.agent}@${s.branch}`).join(", ")
        sections.push(`  ${file} ↔ ${who}`)
      }
    }

    if (uniqueObs.length > 0) {
      sections.push("", `Unique observations (${uniqueObs.length} of ${observations.length} total):`)
      for (const o of uniqueObs.slice(0, 15)) {
        sections.push(`  [${o.tool}] ${o.agent}@${o.branch}: ${o.summary.slice(0, 100)}`)
      }
    }

    // Auto-promote mode
    if (promote && uniqueObs.length > 0) {
      const data = readMemory()
      const entries = parseEntries(data)
      const existingKeys = new Set(entries.map((e) => e.key))
      let promoted = 0

      for (const obs of uniqueObs.slice(0, 5)) {
        // Generate a key from the observation summary
        const key = obs.summary
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .split(/\s+/)
          .slice(0, 4)
          .join("-")
          .slice(0, 40)

        if (!key || existingKeys.has(key)) continue

        // Use memory_remember logic inline
        const newId = generateId()
        const date = new Date().toISOString().split("T")[0]
        const content = obs.summary.slice(0, 500)
        const file = obs.file || ""
        const tags = `session-merge;${obs.agent};${obs.branch}`
        const quality = qualityScore(tags, "", content, date)
        const entry = `${newId}|knowledge|${key}|${content}|${file}|${tags}|${date}||0||${quality.toFixed(2)}|1|`

        // Append to memory
        const lines = data.split("\n")
        let headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
        if (headerIdx === -1) {
          lines.push(`[0|]`)
          headerIdx = lines.length - 1
        }
        const match = lines[headerIdx].match(/\[(\d+)\|/)
        const count = match ? parseInt(match[1]) : 0
        lines.splice(headerIdx + 1, 0, `  ${entry}`)
        lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count + 1}|`)
        writeMemory(lines.join("\n"))
        existingKeys.add(key)
        promoted++
      }

      sections.push("", `📤 Promoted ${promoted} observations to memory.`)
    } else if (uniqueObs.length > 0) {
      sections.push("", `💡 Use 'promote: true' to auto-save unique observations as memory entries.`)
    }

    return { content: [{ type: "text" as const, text: sections.join("\n") }] }
  }
)

// ── memory_merge_similar ─────────────────────────────────────────────

server.registerTool(
  "memory_merge_similar",
  {
    title: "Merge Similar Entries",
    description: "Find entries with overlapping content (>50% word similarity) and merge them. Deterministic, no LLM. Keeps the longer content and combines tags.",
    inputSchema: {
      dryRun: z.boolean().optional().default(false).describe("If true, show what would be merged without making changes."),
    },
  },
  async ({ dryRun }) => {
    const data = readMemory()
    const entries = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))

    if (entries.length < 2) {
      return { content: [{ type: "text" as const, text: "✅ Not enough entries to compress." }] }
    }

    // Parse entries and compute similarity
    const parsed = entries.map((line) => {
      const parts = line.trim().split("|")
      if (parts.length < 7) return null
      const [id, cat, key, content, file, tags, date, ttl, accessedRaw] = parts
      const words = new Set(normalize(`${key} ${content} ${tags}`).split(" ").filter(Boolean))
      return { id, cat, key, content, file, tags, date, ttl, accessed: parseInt(accessedRaw) || 0, words, line }
    }).filter(Boolean) as Array<{ id: string; cat: string; key: string; content: string; file: string; tags: string; date: string; ttl: string; accessed: number; words: Set<string>; line: string }>

    // Find pairs with >50% word overlap (Jaccard similarity)
    const mergePairs: Array<{ a: number; b: number; similarity: number }> = []
    for (let i = 0; i < parsed.length; i++) {
      for (let j = i + 1; j < parsed.length; j++) {
        const a = parsed[i], b = parsed[j]
        const intersection = new Set([...a.words].filter((w) => b.words.has(w)))
        const union = new Set([...a.words, ...b.words])
        const similarity = union.size > 0 ? intersection.size / union.size : 0
        if (similarity > 0.5) {
          mergePairs.push({ a: i, b: j, similarity })
        }
      }
    }

    if (mergePairs.length === 0) {
      return { content: [{ type: "text" as const, text: "✅ No similar entries found to merge." }] }
    }

    // Sort by similarity (highest first) and merge greedily
    mergePairs.sort((x, y) => y.similarity - x.similarity)
    const merged = new Set<number>()
    const mergeActions: string[] = []

    for (const pair of mergePairs) {
      if (merged.has(pair.a) || merged.has(pair.b)) continue
      const a = parsed[pair.a], b = parsed[pair.b]

      // Merge: keep the entry with more content, combine tags
      const mergedTags = [...new Set([...a.tags.split(";"), ...b.tags.split(";")])].filter(Boolean).join(";")
      const longer = a.content.length >= b.content.length ? a : b
      const shorter = a.content.length < b.content.length ? a : b
      const newContent = longer.content
      const newDate = a.date > b.date ? a.date : b.date
      const newAccessed = a.accessed + b.accessed

      mergeActions.push(`  [${longer.cat}] ${longer.key} ← ${shorter.key} (similarity: ${(pair.similarity * 100).toFixed(0)}%)`)

      if (!dryRun) {
        // Update the longer entry with merged data
        const mergedLine = `  ${longer.id}|${longer.cat}|${longer.key}|${newContent}|${longer.file}|${mergedTags}|${newDate}|${longer.ttl}|${newAccessed}|${longer.line.split("|")[9] || ""}|${longer.line.split("|")[10] || ""}|${longer.line.split("|")[11] || ""}|${longer.line.split("|")[12] || ""}`
        // Replace in entries array
        entries[entries.indexOf(longer.line)] = mergedLine
        merged.add(pair.b)
      }
    }

    if (dryRun) {
      return {
        content: [{
          type: "text" as const,
          text: `🔍 Dry run — would merge ${merged.size} entries:\n\n${mergeActions.join("\n")}\n\nRun with dryRun: false to apply.`
        }],
      }
    }

    // Remove merged entries and write back
    const newLines = entries.filter((_, i) => !merged.has(i))
    const headerIdx = newLines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
    if (headerIdx !== -1) {
      const count = newLines.filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:")).length
      newLines[headerIdx] = newLines[headerIdx].replace(/\[\d+\|/, `[${count}|`)
    }
    writeMemory(newLines.join("\n"))

    return {
      content: [{
        type: "text" as const,
        text: `✅ Merged ${merged.size} entries into ${entries.length - merged.size} entries.\n\n${mergeActions.join("\n")}`
      }],
    }
  }
)

// ── memory_graph_path ────────────────────────────────────────────────

server.registerTool(
  "memory_graph_path",
  {
    title: "Find Graph Path",
    description: "Find the shortest path between two memory entries in the knowledge graph. Shows how two concepts are connected through related entries.",
    inputSchema: {
      from: z.string().describe("Starting entry key"),
      to: z.string().describe("Target entry key"),
    },
  },
  async ({ from, to }) => {
    const data = readMemory()
    const entries = parseEntries(data)
    const graph = buildGraph(entries)

    if (!graph.byKey.has(from)) {
      return { content: [{ type: "text" as const, text: `❌ Entry "${from}" not found in memory.` }] }
    }
    if (!graph.byKey.has(to)) {
      return { content: [{ type: "text" as const, text: `❌ Entry "${to}" not found in memory.` }] }
    }

    // BFS shortest path
    const visited = new Set<string>()
    const parent = new Map<string, string>()
    const queue = [from]
    visited.add(from)

    while (queue.length > 0) {
      const current = queue.shift()!
      if (current === to) break

      for (const neighbor of graph.adjacency.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          parent.set(neighbor, current)
          queue.push(neighbor)
        }
      }
    }

    if (!visited.has(to)) {
      return {
        content: [{
          type: "text" as const,
          text: `🔗 No path found between "${from}" and "${to}". They may be in disconnected parts of the memory graph.`
        }],
      }
    }

    // Reconstruct path
    const path: string[] = []
    let current: string | null = to
    while (current !== null) {
      path.unshift(current)
      current = parent.get(current) || null
    }

    const pathStr = path.map((key, i) => {
      const entry = graph.byKey.get(key)!
      const arrow = i < path.length - 1 ? ` → ` : ""
      return `[${entry.category}] ${key}${arrow}`
    }).join("\n   ")

    return {
      content: [{
        type: "text" as const,
        text: `🔗 Path (${path.length} hops):\n\n   ${pathStr}`
      }],
    }
  }
)

// ── memory_visualize (MCP Apps) ──────────────────────────────────────────────

registerAppTool(
  server as unknown as Parameters<typeof registerAppTool>[0],
  "memory_visualize",
  {
    title: "Open Memory Graph Viewer",
    description: "Open the interactive memory graph viewer (force-directed graph, stats, timeline, detail panel). Renders inline in MCP Apps-compatible hosts.",
    inputSchema: {
      query: z.string().optional().default("").describe("Optional search query to highlight entries in the viewer"),
    },
    _meta: { ui: { resourceUri: "ui://viewer" } },
  },
  async ({ query }) => {
    const data = readMemory()
    const entries = parseEntries(data)
    const total = entries.length
    const graph = buildGraph(entries)
    const edgeCount = [...graph.adjacency.values()].reduce((sum, n) => sum + n.length, 0) / 2

    let msg = `🧠 Memory Graph Viewer — ${total} entries, ${edgeCount} edges`
    if (query) msg += `\n🔍 Focus: "${query}"`

    return {
      content: [{ type: "text" as const, text: msg }],
    }
  }
)

} // end registerTools

/** Parse relative time string to milliseconds. */
function parseRelativeMs(s: string): number {
  const match = s.match(/^(\d+)(h|d|m)$/i)
  if (!match) {
    // Try parsing as date
    const d = new Date(s)
    if (!isNaN(d.getTime())) return Date.now() - d.getTime()
    return 24 * 60 * 60 * 1000 // default 24h
  }
  const n = parseInt(match[1])
  switch (match[2].toLowerCase()) {
    case "m": return n * 60 * 1000
    case "h": return n * 60 * 60 * 1000
    case "d": return n * 24 * 60 * 60 * 1000
    default: return 24 * 60 * 60 * 1000
  }
}
