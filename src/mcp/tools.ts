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
import { consolidateEntries, consolidateVersions } from "./consolidation"
import { readUnderLock } from "../lib/lock"
import { encrypt, decrypt } from "./crypto"
import { graphRecallDetailed, renderCompact, parseEntries, buildGraph, parseLinkToken, formatLink, typedLinks } from "../lib/graph"
import { qualityScore, mergeEntries, generateSmartRecall } from "../lib/quality"
import { generateContextBrief, generateContextGenerate, generateContextDiff, generateContextFocus, generateContextHealth, generateContextExport } from "../lib/context"
import { coordinationView, resolveSessionId, currentBranch, SESSION_TTL_MS, getCurrentSessionFiles } from "../lib/sessions"
import { fileMtimes } from "../lib/git"
import { normalize, isExpiredLocal, tokenize, importance, estimateTokens, parseToonLine, toToonLine, escField, unescField } from "../lib/utils"
import { expandSynonyms } from "../lib/synonyms"

/**
 * Register all 22 memory tools.
 */
export function registerTools(server: McpServer): void {

type ToolText = { type: "text"; text: string }

// ── Shared lifecycle helpers (backing canonical memory_forget) ──

function softDelete(key: string): { content: ToolText[] } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

  if (headerIdx === -1) {
    return { content: [{ type: "text", text: "No entries in memory" }] }
  }

  let found = false
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    if (line.startsWith("  summaries:")) break
    const parts = parseToonLine(line)
    if (parts[0] === key || parts[2] === key) {
      while (parts.length < 17) parts.push("")
      parts[16] = "obsolete"
      lines[i] = toToonLine(parts)
      found = true
      break
    }
  }

  writeMemory(lines.join("\n"))

  if (!found) {
    return { content: [{ type: "text", text: `"${key}" not found in memory.` }] }
  }

  return { content: [{ type: "text", text: `"${key}" marked as obsolete. Use memory_forget(key, action: 'restore') to restore.` }] }
}

function hardDelete(key: string): { content: ToolText[] } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

  if (headerIdx === -1) {
    return { content: [{ type: "text", text: "No entries in memory" }] }
  }

  const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && !l.startsWith("  summaries:"))
  const filtered = entryLines.filter((l) => {
    const parts = parseToonLine(l)
    return parts[0] !== key && parts[2] !== key
  })

  const removed = entryLines.length - filtered.length
  const match = lines[headerIdx].match(/\[(\d+)\|/)
  const count = match ? parseInt(match[1]) : 0
  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count - removed}|`)
  lines.splice(headerIdx + 1, entryLines.length, ...filtered.map((l) => `  ${l.trim()}`))

  writeMemory(lines.join("\n"))

  if (removed === 0) {
    return { content: [{ type: "text", text: `"${key}" not found in memory.` }] }
  }

  return { content: [{ type: "text", text: `"${key}" permanently deleted. ${count - removed} entries remaining.` }] }
}

function restoreEntry(key: string): { content: ToolText[] } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

  if (headerIdx === -1) {
    return { content: [{ type: "text", text: "No entries in memory" }] }
  }

  let found = false
  let wasObsolete = false
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    if (line.startsWith("  summaries:")) break
    const parts = parseToonLine(line)
    if (parts[0] === key || parts[2] === key) {
      while (parts.length < 17) parts.push("")
      wasObsolete = parts[16] === "obsolete"
      parts[16] = "active"
      lines[i] = toToonLine(parts)
      found = true
      break
    }
  }

  if (!found) {
    return { content: [{ type: "text", text: `"${key}" not found in memory.` }] }
  }

  writeMemory(lines.join("\n"))

  const msg = wasObsolete ? `"${key}" restored to active status.` : `"${key}" marked as resolved.`
  return { content: [{ type: "text", text: `✅ ${msg}` }] }
}

function supersedeEntry(old_key: string, new_key: string, reason: string): { content: ToolText[] } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) {
    return { content: [{ type: "text", text: "No entries in memory" }] }
  }

  const today = new Date().toISOString().split("T")[0]

  let oldIdx = -1
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    if (line.startsWith("  summaries:")) break
    const parts = parseToonLine(line)
    if (parts[0] === old_key || parts[2] === old_key) {
      oldIdx = i
      break
    }
  }

  if (oldIdx === -1) {
    return { content: [{ type: "text", text: `❌ "${old_key}" not found in memory.` }] }
  }

  let newIdx = -1
  let newKey = ""
  if (new_key) {
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.startsWith("  ") || !line.includes("|")) continue
      if (line.startsWith("  summaries:")) break
      const parts = parseToonLine(line)
      if (parts[0] === new_key || parts[2] === new_key) {
        newIdx = i
        newKey = parts[2]
        break
      }
    }
    if (newIdx === -1) {
      return { content: [{ type: "text", text: `❌ Replacement "${new_key}" not found in memory.` }] }
    }
  }

  const oldParts = parseToonLine(lines[oldIdx])
  const oldKey = oldParts[2]

  const tags = (oldParts[5] || "").split(";").map((t) => t.trim()).filter(Boolean)
  if (!tags.includes("superseded")) tags.push("superseded")

  const links = (oldParts[9] || "").split(/[\s;]+/).filter(Boolean)
  if (newKey) {
    const edge = formatLink("superseded_by", newKey)
    if (!links.includes(edge)) links.push(edge)
  }

  let content = oldParts[3] || ""
  if (reason && !content.includes(reason)) {
    const flat = reason.replace(/[\r\n]+/g, " ").trim()
    content = `${content} ⏳ Superseded (${today}): ${flat}`
  }

  while (oldParts.length < 18) oldParts.push("")
  oldParts[3] = content
  oldParts[5] = tags.join(";")
  oldParts[9] = links.join(" ")
  oldParts[16] = "obsolete"
  oldParts[17] = today
  lines[oldIdx] = toToonLine(oldParts)

  if (newIdx !== -1) {
    const newParts = parseToonLine(lines[newIdx])
    const newLinks = (newParts[9] || "").split(/[\s;]+/).filter(Boolean)
    const edge = formatLink("supersedes", oldKey)
    if (!newLinks.includes(edge)) {
      newLinks.push(edge)
      newParts[9] = newLinks.join(" ")
      lines[newIdx] = toToonLine(newParts)
    }
  }

  writeMemory(lines.join("\n"))

  const target = newKey ? ` by "${newKey}"` : " (retired)"
  return {
    content: [{
      type: "text",
      text: `⏳ "${oldKey}" superseded${target} on ${today}.\n\nOld entry is now status=obsolete (hidden from normal recalls).\n  · link: superseded_by${newKey ? `:${newKey}` : ""}\n  · tag: superseded\n\nTo see what was true before: memory_recall(query: "${oldKey}", as_of: "${today}")\nTo restore: memory_forget(key: "${oldKey}", action: 'restore')${reason ? `\n\nReason: ${reason}` : ""}`,
    }],
  }
}

// ── Shared cleanup helpers (backing canonical memory_consolidate) ──

function runConsolidate(): { content: ToolText[] } {
  const result = consolidateEntries()
  if (result.removed === 0) {
    return { content: [{ type: "text", text: `✅ Memory already consolidated (${result.kept} entries, 0 duplicates)` }] }
  }
  return {
    content: [{
      type: "text",
      text: `🧹 Consolidated ${result.removed} duplicate entries.\n${result.kept} active entries remaining.\nDuplicates: ${result.duplicates.join(", ")}`,
    }],
  }
}

function runConsolidateVersions(dryRun: boolean): { content: ToolText[] } {
  const result = consolidateVersions(dryRun)
  if (result.groups.length === 0) {
    return { content: [{ type: "text", text: "✅ No version supersession detected." }] }
  }
  if (dryRun) {
    return {
      content: [{
        type: "text",
        text: `🔍 Version supersession candidates (${result.groups.length}):\n${result.proposals.map((p) => `  • ${p}`).join("\n")}\n\nRun again with dryRun: false to apply.`,
      }],
    }
  }
  return {
    content: [{
      type: "text",
      text: `🗂️ Marked ${result.removed} old-version entries obsolete:\n${result.proposals.map((p) => `  • ${p}`).join("\n")}`,
    }],
  }
}

function runMergeSimilar(dryRun: boolean): { content: ToolText[] } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) {
    return { content: [{ type: "text", text: "No entries in memory." }] }
  }

  const parsed: Array<{ lineIdx: number; id: string; cat: string; key: string; content: string; file: string; tags: string; date: string; ttl: string; accessed: number; words: Set<string>; line: string }> = []
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.startsWith("  ") || !line.includes("|")) continue
    if (line.startsWith("  summaries:")) break
    const parts = parseToonLine(line)
    if (parts.length < 7) continue
    const [id, cat, key, content, file, tags, date, ttl, accessedRaw] = parts
    const words = new Set(normalize(`${key} ${content} ${tags}`).split(" ").filter(Boolean))
    parsed.push({ lineIdx: i, id, cat, key, content, file, tags, date, ttl, accessed: parseInt(accessedRaw) || 0, words, line })
  }

  if (parsed.length < 2) {
    return { content: [{ type: "text", text: "✅ Not enough entries to compress." }] }
  }

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
    return { content: [{ type: "text", text: "✅ No similar entries found to merge." }] }
  }

  mergePairs.sort((x, y) => y.similarity - x.similarity)
  const merged = new Set<number>()
  const mergeActions: string[] = []

  for (const pair of mergePairs) {
    if (merged.has(pair.a) || merged.has(pair.b)) continue
    const a = parsed[pair.a], b = parsed[pair.b]

    const mergedTags = [...new Set([...a.tags.split(";"), ...b.tags.split(";")])].filter(Boolean).join(";")
    const longer = a.content.length >= b.content.length ? a : b
    const shorter = a.content.length < b.content.length ? a : b
    const newContent = longer.content
    const newDate = a.date > b.date ? a.date : b.date
    const newAccessed = a.accessed + b.accessed

    mergeActions.push(`  [${longer.cat}] ${longer.key} ← ${shorter.key} (similarity: ${(pair.similarity * 100).toFixed(0)}%)`)

    if (!dryRun) {
      const lp = parseToonLine(longer.line)
      const mergedLine = toToonLine([longer.id, longer.cat, longer.key, newContent, longer.file, mergedTags, newDate, longer.ttl, String(newAccessed), lp[9] || "", lp[10] || "", lp[11] || "", lp[12] || ""])
      lines[longer.lineIdx] = mergedLine
      merged.add(pair.b)
    }
  }

  if (dryRun) {
    const previewLines: string[] = [
      `🔍 Dry run — ${mergePairs.length} merge candidate(s) found:`,
      "",
    ]
    for (const pair of mergePairs) {
      const a = parsed[pair.a], b = parsed[pair.b]
      const mergedTags = [...new Set([...a.tags.split(";"), ...b.tags.split(";")])].filter(Boolean).join(";")
      const longer = a.content.length >= b.content.length ? a : b
      const shorter = a.content.length < b.content.length ? a : b
      previewLines.push(`  ── Pair: [${a.cat}] ${a.key}  ↔  [${b.cat}] ${b.key}`)
      previewLines.push(`     Similarity: ${(pair.similarity * 100).toFixed(0)}%`)
      previewLines.push(`     A tags: ${a.tags || "(none)"}`)
      previewLines.push(`     B tags: ${b.tags || "(none)"}`)
      previewLines.push(`     → Merged tags: ${mergedTags || "(none)"}`)
      previewLines.push(`     → Content winner: "${longer.key}" (${longer.content.length} chars vs ${shorter.content.length})`)
      previewLines.push(`     → Result content: ${longer.content.slice(0, 120)}${longer.content.length > 120 ? "…" : ""}`)
      previewLines.push("")
    }
    previewLines.push(`Would merge ${merged.size} entries into ${parsed.length - merged.size} entries.`)
    previewLines.push("Run with dryRun: false to apply.")
    return {
      content: [{
        type: "text",
        text: previewLines.join("\n"),
      }],
    }
  }

  // Rebuild the entries section, preserving version + header lines.
  const kept = parsed.filter((_, i) => !merged.has(i)).map((p) => lines[p.lineIdx])
  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${kept.length}|`)
  lines.splice(headerIdx + 1, parsed.length, ...kept.map((l) => `  ${l.trim()}`))
  writeMemory(lines.join("\n"))

  return {
    content: [{
      type: "text",
      text: `✅ Merged ${merged.size} entries into ${parsed.length - merged.size} entries.\n\n${mergeActions.join("\n")}`
    }],
  }
}

function runCompressAll(minQuality: number, dryRun: boolean): { content: ToolText[] } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
  if (headerIdx === -1) {
    return { content: [{ type: "text", text: "No entries in memory." }] }
  }

  const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0 && !l.startsWith("  summaries:"))

  const candidates: { idx: number; line: string; quality: number; key: string }[] = []
  for (let i = 0; i < entryLines.length; i++) {
    const line = entryLines[i].trim()
    const parts = parseToonLine(line)
    if (parts.length < 11) continue
    const quality = parseFloat(parts[10]) || 0
    const tags = parts[5] || ""
    const key = parts[2]
    const content = parts[3] || ""

    const isCandidate = quality < minQuality || !tags || content.length < 20
    if (isCandidate) {
      candidates.push({ idx: i, line, quality, key })
    }
  }

  if (candidates.length === 0) {
    return {
      content: [{
        type: "text",
        text: `✅ No compression candidates found. All entries have quality >= ${minQuality} or have tags.`
      }],
    }
  }

  const byCategory = new Map<string, typeof candidates>()
  for (const c of candidates) {
    const parts = parseToonLine(c.line)
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
      const parts = parseToonLine(item.line)
      sections.push(`    - ${item.key} (Q: ${item.quality.toFixed(2)}) — ${(parts[3] || "").slice(0, 60)}`)
    }
    if (items.length > 3) {
      sections.push(`    ... and ${items.length - 3} more`)
    }
  }

  if (dryRun) {
    sections.push("", "🔍 Dry run — no changes made. Use dryRun: false to compress.")
    return { content: [{ type: "text", text: sections.join("\n") }] }
  }

  const removeKeys = new Set(candidates.map((c) => c.key))
  const kept = entryLines.filter((l) => {
    const parts = parseToonLine(l)
    return !removeKeys.has(parts[2])
  })

  const match = lines[headerIdx].match(/\[(\d+)\|/)
  const count = match ? parseInt(match[1]) : 0
  lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${kept.length}|`)
  lines.splice(headerIdx + 1, entryLines.length, ...kept.map((l) => `  ${l.trim()}`))
  writeMemory(lines.join("\n"))

  sections.push("", `🗑️ Removed ${candidates.length} low-quality entries. ${kept.length} entries remaining.`)
  sections.push("💡 Use memory_compress to merge related entries before removing them.")

  return { content: [{ type: "text", text: sections.join("\n") }] }
}

// ── memory_remember ──────────────────────────────────────────────────────────

server.registerTool(
  "memory_remember",
  {
    title: "Save to Memory",
    description: "Save a fact to the project's persistent memory (decisions, patterns, bugs, knowledge). Persists between sessions. Tags: 'private' excludes from context injection; 'superseded' marks as obsolete.",
    inputSchema: {
      category: z.enum(["decision", "pattern", "bug", "knowledge", "warning"]).describe("Category of the fact. 'warning' = negative memory ('NO hacer esto, rompe X') — recalled with a boost so past mistakes surface first."),
      key: z.string().describe("Short title in kebab-case (e.g. risk-engine-priority)"),
      content: z.string().describe("Detailed content of the fact"),
      file: z.string().optional().default("").describe("Related file or line (e.g. spec.md:145)"),
      tags: z.string().optional().default("").describe("Semicolon-separated tags (e.g. risk;spec)"),
      ttl: z.string().optional().default("").describe("Time to live (e.g. 7d, 2026-07-17). Empty = no expiration"),
      links: z.string().optional().default("").describe("Related entry keys, separated by space or ';' (e.g. risk-spec engine-arch). Builds graph edges."),
      path_scope: z.string().optional().default("").describe("Glob pattern to scope this entry (e.g. src/**.ts). Empty = global."),
      origin: z.enum(["human", "agent", "inferred"]).optional().default("agent").describe("Who created this entry."),
      importance: z.enum(["critical", "high", "medium", "low"]).optional().describe("Explicit importance level — critical/high entries surface first in recall, low last. Omit for auto (recency + frequency)."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ category, key, content, file, tags, ttl, links, path_scope, origin, importance = "" }) => {
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
      const parts = parseToonLine(line)
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
    const existingParts = existingIdx !== -1 ? parseToonLine(lines[existingIdx]) : []
    const resolvedLinks = links
      ? links.split(/[\s;]+/).filter(Boolean).join(" ")
      : existingParts[9] || ""
    let newEntry = toToonLine([entryId, category, key, content, file || "", resolvedTags, date, resolvedTtl, "0", resolvedLinks, "", "", "", "0", path_scope || "", origin, "", "", importance])
    let action = "Saved"
    let mergeInfo = ""
    const tagsInferred = !tags && resolvedTags ? true : false

    if (existingIdx !== -1) {
      newEntry = mergeEntries(lines[existingIdx].trim(), newEntry)
      lines[existingIdx] = newEntry
      action = "Updated"
      mergeInfo = "\nMerge: tags combined, date and links updated"
    } else {
      const accessed = 0
      const lastAccessed = ""
      const quality = verbatim ? 0.5 : qualityScore(resolvedTags, resolvedLinks, content, date, accessed, lastAccessed, origin)
      const confidence = 1.0
      newEntry = toToonLine([entryId, category, key, content, file || "", resolvedTags, date, resolvedTtl, String(accessed), resolvedLinks, quality.toFixed(2), String(confidence), lastAccessed, "0", path_scope || "", origin, "active", "", importance])
      const match = lines[headerIdx].match(/\[(\d+)\|/)
      const count = match ? parseInt(match[1]) : 0
      lines.splice(headerIdx + 1, 0, newEntry)
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
      budget: z.enum(["tiny", "normal", "deep"]).optional().default("deep").describe("'tiny': key+1 line (~50 tokens). 'normal': compact with tags/edges. 'deep': all fields (default). Overrides 'compact'."),
      budget_tokens: z.number().optional().default(0).describe("Deterministic token budget: include entries until the estimated output reaches ~N tokens (overrides limit). 0 = no budget."),
      explain: z.boolean().optional().default(false).describe("Append a 'why this entry' line to each result (relevance %, times used, last used, importance). No LLM — pure heuristics."),
      bias: z.enum(["none", "session"]).optional().default("none").describe("'session': boost entries whose file matches current session files. 'none': no bias (default)."),
      path_scope: z.string().optional().default("").describe("Glob pattern to filter entries by path scope (e.g. 'src/**.ts')."),
      rrf: z.boolean().optional().default(false).describe("Use Reciprocal Rank Fusion (BM25x3 + centrality ranks, adaptive k=sqrtN) instead of weighted linear scoring. Weight-free: reaches parity with the tuned linear scorer on scripts/bench-rrf.mjs."),
      as_of: z.string().optional().default("").describe("Temporal view (YYYY-MM-DD): return entries valid on that date. Superseded entries still appear if they were active then."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ query, category, from_date, to_date, mode, hops, compact, budget: budgetParam, budget_tokens, explain, bias, path_scope, rrf, as_of }) => {
    const data = readMemory()

    // Delegate to graphRecallDetailed for both flat and graph modes
    // This avoids duplicating BM25 + ranking logic
    const sessionFiles = bias === "session" ? getCurrentSessionFiles() : undefined
    const resolvedBudget = budgetParam || (compact ? "normal" : "deep")
    const detail = graphRecallDetailed(data, query, { category, from_date, to_date, hops, sessionFiles, path_scope: path_scope || undefined, rrf, asOf: as_of || undefined })
    if (detail.entries.length === 0) {
      return { content: [{ type: "text" as const, text: `No results found for "${query}"` }] }
    }
    bumpAccessed(detail.entries.map((e) => e.id))
    const reasons = explain ? detail.reasons : undefined
    if (resolvedBudget === "tiny" || resolvedBudget === "normal") {
      const formatted = renderCompact(detail.entries, {
        adjacency: detail.adjacency,
        seeds: detail.seeds,
        snippetLen: 90,
        budget: resolvedBudget,
        reasons,
        budgetTokens: budget_tokens || undefined,
      })
      return { content: [{ type: "text" as const, text: formatted }] }
    }
    const formatted = detail.entries
      .map((r) => {
        const links = r.links.length ? `\n  links: ${r.links.join(", ")}` : ""
        const pin = r.priority > 0 ? (r.priority > 1 ? ` 📌${r.priority}` : " 📌") : ""
        const originInfo = r.origin !== "agent" ? ` | origin: ${r.origin}` : ""
        const scopeInfo = r.path_scope ? ` | scope: ${r.path_scope}` : ""
        const statusInfo = r.status !== "active" ? ` | status: ${r.status}` : ""
        const supersededInfo = r.supersededOn ? ` | superseded: ${r.supersededOn}` : ""
        const why = reasons?.get(r.key) ? `\n  ↳ ${reasons.get(r.key)}` : ""
        return `[${r.category}] ${r.key}${pin} (${r.id})\n  ${r.content}\n  File: ${r.file} | Tags: ${r.tags.join(";")} | Date: ${r.date}${links}${originInfo}${scopeInfo}${statusInfo}${supersededInfo}${why}`
      })
      .join("\n\n")
    // Deterministic token budget for the deep render.
    if (budget_tokens && budget_tokens > 0) {
      const blocks = formatted.split("\n\n")
      let acc = 0
      let out: string[] = []
      for (let i = 0; i < blocks.length; i++) {
        acc += estimateTokens(blocks[i])
        if (i > 0 && acc > budget_tokens) break
        out.push(blocks[i])
      }
      return { content: [{ type: "text" as const, text: out.join("\n\n") }] }
    }
    return { content: [{ type: "text" as const, text: formatted }] }
  }
)

// ── memory_forget ────────────────────────────────────────────────────────────

server.registerTool(
  "memory_forget",
  {
    title: "Forget from Memory",
    description: "Lifecycle operations for a memory entry: soft (default) marks it obsolete and hides it from recalls, hard permanently removes it, restore brings it back to active, supersede retires it with a typed superseded_by edge to a newer entry.",
    inputSchema: {
      key: z.string().describe("Key or id of the entry"),
      action: z.enum(["soft", "hard", "restore", "supersede"]).optional().default("soft").describe("soft: mark obsolete (default). hard: permanently remove. restore: bring an obsolete entry back to active. supersede: mark obsolete with a superseded_by link to new_key."),
      new_key: z.string().optional().default("").describe("Replacement entry key or id (only used with action: supersede)."),
      reason: z.string().optional().default("").describe("Optional note appended to the old entry (only used with action: supersede)."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async ({ key, action, new_key, reason }) => {
    switch (action) {
      case "hard":
        return hardDelete(key)
      case "restore":
        return restoreEntry(key)
      case "supersede":
        return supersedeEntry(key, new_key, reason)
      default:
        return softDelete(key)
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async () => {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
    const entries = lines.map((l) => {
      const parts = parseToonLine(l)
      return { category: parts[1] || "unknown", ttl: parts[7] || "", quality: parts[10] || "", origin: parts.length > 15 ? parts[15] || "" : "", status: parts.length > 16 ? parts[16] || "" : "" }
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
    const byOrigin: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const accessed = new Map<string, number>()
    const fullParts = lines
      .filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
      .map((l) => parseToonLine(l))
    for (const p of fullParts) {
      byOrigin[p.length > 15 ? p[15] || "agent" : "agent"] = (byOrigin[p.length > 15 ? p[15] || "agent" : "agent"] || 0) + 1
      const st = p.length > 16 ? p[16] || "active" : "active"
      byStatus[st] = (byStatus[st] || 0) + 1
      accessed.set(p[0], p.length > 8 ? parseInt(p[8]) || 0 : 0)
    }

    // Extended stats: hit rate, duplicate %, dead %
    const hitRate = entries.length > 0
      ? ((fullParts.filter((p) => (parseInt(p[8]) || 0) > 0).length / entries.length) * 100).toFixed(0)
      : "0"
    const contentCounts = new Map<string, number>()
    for (const p of fullParts) {
      const norm = (p[3] || "").toLowerCase().replace(/\s+/g, " ").trim()
      contentCounts.set(norm, (contentCounts.get(norm) || 0) + 1)
    }
    let dupCount = 0
    for (const c of contentCounts.values()) if (c > 1) dupCount += c - 1
    const dupPct = entries.length > 0 ? ((dupCount / entries.length) * 100).toFixed(0) : "0"
    const deadCount = byStatus["obsolete"] || 0
    const deadPct = entries.length > 0 ? ((deadCount / entries.length) * 100).toFixed(0) : "0"

    const stats = [
      `Total entries: ${entries.length}`,
      `File summaries: ${summaryLines.length}`,
      "",
      "By category:",
      ...Object.entries(byCategory).map(([k, v]) => `  ${k}: ${v}`),
      "",
      "By origin:",
      ...Object.entries(byOrigin).map(([k, v]) => `  ${k}: ${v}`),
      "",
      "By status:",
      ...Object.entries(byStatus).map(([k, v]) => `  ${k}: ${v}`),
      "",
      `TTL: ${withTtl} with expiration, ${expired} expired`,
      `Average quality: ${avgQuality} (${withQuality} with score)`,
      "",
      `Hit rate: ${hitRate}% recalled at least once (${fullParts.filter((p) => (parseInt(p[8]) || 0) > 0).length}/${entries.length})`,
      `Duplicate: ${dupPct}% (${dupCount} exact-content dups)`,
      `Dead: ${deadPct}% (${deadCount} obsolete)`,
      "",
      `Last 5 entries:`,
      ...lines.slice(-5).map((l) => {
        const parts = parseToonLine(l)
        const ttlInfo = parts[7] ? ` | TTL: ${parts[7]}` : ""
        const qualityInfo = parts[10] ? ` | Q: ${parts[10]}` : ""
        const accessInfo = parts[8] && parseInt(parts[8]) > 0 ? ` | accessed: ${parts[8]}x` : ""
        const originInfo = parts.length > 15 && parts[15] && parts[15] !== "agent" ? ` | origin: ${parts[15]}` : ""
        const statusInfo = parts.length > 16 && parts[16] && parts[16] !== "active" ? ` | status: ${parts[16]}` : ""
        return `  [${parts[1]}] ${parts[2]} (${parts[0]})${ttlInfo}${qualityInfo}${accessInfo}${originInfo}${statusInfo}`
      }),
      "",
      `Most accessed:`,
      ...lines
        .filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
        .map((l) => {
          const parts = parseToonLine(l)
          return { key: parts[2], accessed: parts.length > 8 ? parseInt(parts[8]) || 0 : 0, quality: parts[10] || "" }
        })
        .filter((e) => e.accessed > 0)
        .sort((a, b) => b.accessed - a.accessed)
        .slice(0, 5)
        .map((e) => `  ${e.key}: ${e.accessed}x (Q: ${e.quality})`),
    ]

    // Cold memories: high quality but rarely accessed
    const coldEntries = lines
      .filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
      .map((l) => {
        const p = parseToonLine(l)
        return {
          key: p[2],
          cat: p[1],
          quality: parseFloat(p[10]) || 0,
          accessed: p.length > 8 ? parseInt(p[8]) || 0 : 0,
          lastAccessed: p.length > 12 ? p[12] || "" : "",
          date: p[6] || "",
        }
      })
      .filter((e) => {
        if (e.accessed >= 2) return false
        if (e.quality < 0.7) return false
        const lastDate = e.lastAccessed || e.date
        if (!lastDate) return false
        const daysSinceLastAccess = (Date.now() - new Date(lastDate).getTime()) / 86400000
        return daysSinceLastAccess > 30
      })
      .sort((a, b) => b.quality - a.quality)

    if (coldEntries.length > 0) {
      stats.push(
        "",
        `Cold memories (${coldEntries.length}):`,
        ...coldEntries.slice(0, 5).map((e) => {
          const lastDate = e.lastAccessed || e.date
          const daysSince = Math.round((Date.now() - new Date(lastDate).getTime()) / 86400000)
          return `  ${e.key} (Q: ${e.quality.toFixed(2)}) — ${daysSince}d since last access`
        }),
        "",
        "💡 Run memory_archive() to archive cold entries."
      )
    }

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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async ({ since, type }) => {
    const sinceDate = parseRelativeDate(since)
    const today = new Date().toISOString().split("T")[0]
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))

    const results = lines
      .map((line) => {
        const trimmed = line.trim()
        const parts = parseToonLine(trimmed)
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
      bias: z.enum(["none", "session"]).optional().default("none").describe("'session': boost entries whose file matches current session files. 'none': no bias (default)."),
      rrf: z.boolean().optional().default(false).describe("Use Reciprocal Rank Fusion (BM25x3 + centrality ranks, adaptive k=sqrtN) instead of weighted linear scoring. Weight-free: reaches parity with the tuned linear scorer on scripts/bench-rrf.mjs."),
      budget_tokens: z.number().optional().default(0).describe("Deterministic token budget: include entries until the estimated output reaches ~N tokens (overrides limit). 0 = no budget."),
      explain: z.boolean().optional().default(false).describe("Append a 'why this entry' line to each result (relevance %, times used, last used, importance). No LLM — pure heuristics."),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async ({ intent, limit, category, bias, rrf, budget_tokens, explain }) => {
    const data = readMemory()
    const mtimes = fileMtimes()
    const sessionFiles = bias === "session" ? getCurrentSessionFiles() : undefined
    const result = generateSmartRecall(data, intent, { limit, category, fileMtimes: mtimes, sessionFiles, rrf, budgetTokens: budget_tokens || undefined, explain })
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
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
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

      const summaryText = unescField(match.replace(`  ${file}: `, ""))
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
      summaryLines[existingIdx] = `  ${file}: ${escField(summary)}`
    } else {
      summaryLines.push(`  ${file}: ${escField(summary)}`)
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
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
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
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
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
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
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
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
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
    description: "Cleanup operations, all deterministic (no LLM): identical removes duplicate entries (keeps the first), similar merges entries with >50% word overlap (keeps longer content, combines tags), low-quality removes entries below minQuality or without tags, versions marks entries describing the same subject with older versions obsolete in favor of the newest.",
    inputSchema: {
      mode: z.enum(["identical", "similar", "low-quality", "versions"]).optional().default("identical").describe("identical: dedupe entries with identical content (default). similar: merge entries with >50% word overlap. low-quality: remove entries below minQuality or without tags. versions: detect version supersession ('Use React 18' vs 'React 19') and obsolete the older ones."),
      minQuality: z.number().optional().default(0.3).describe("Entries below this quality score are candidates (only used with mode: low-quality)."),
      dryRun: z.boolean().optional().default(false).describe("If true, show what would change without writing."),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async ({ mode, minQuality, dryRun }) => {
    switch (mode) {
      case "similar":
        return runMergeSimilar(dryRun)
      case "low-quality":
        return runCompressAll(minQuality, dryRun)
      case "versions":
        return runConsolidateVersions(dryRun)
      default:
        return runConsolidate()
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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

// ── memory_export_gist ─────────────────────────────────────────────────

server.registerTool(
  "memory_export_gist",
  {
    title: "Export to GitHub Gist",
    description: "Export memory to a private GitHub Gist for cloud sync. Requires GITHUB_TOKEN env var. Zero deps — uses Node's built-in fetch().",
    inputSchema: {
      description: z.string().optional().default("").describe("Optional description for the Gist."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
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
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
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
          return toToonLine([e.id, e.category, e.key, e.content, e.file, tags, e.date, e.ttl, String(e.accessed), links, q.toFixed(2), "1", e.lastAccessed])
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
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
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
          const p = parseToonLine(l)
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
        const entry = toToonLine([newId, "knowledge", key, content, file, tags, date, "", "0", "", quality.toFixed(2), "1", ""])

        // Append to memory
        const lines = data.split("\n")
        let headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
        if (headerIdx === -1) {
          lines.push(`[0|]`)
          headerIdx = lines.length - 1
        }
        const match = lines[headerIdx].match(/\[(\d+)\|/)
        const count = match ? parseInt(match[1]) : 0
        lines.splice(headerIdx + 1, 0, entry)
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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

// ── memory_checkpoint ─────────────────────────────────────────────────────────

server.registerTool(
  "memory_checkpoint",
  {
    title: "Session Checkpoint",
    description: "Save or update a session checkpoint with 7-day TTL. Creates a knowledge entry snapshot of the current session state. Same session = upsert (single checkpoint per session). Auto-expires.",
    inputSchema: {
      note: z.string().optional().default("").describe("Optional summary of what was accomplished in this session."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ note }) => {
    const data = readMemory()
    const lines = data.split("\n")

    let headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
    if (headerIdx === -1) {
      lines.push(`[0|]`)
      headerIdx = lines.length - 1
    }

    const sessionId = resolveSessionId({})
    const shortId = sessionId.replace(/^proc-/, "").slice(0, 8)
    const key = `checkpoint-${shortId}`
    const now = new Date()
    const date = now.toISOString().split("T")[0]
    const ttl7d = new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0]

    // Gather session context: branch, files touched, agent
    const sessions = await import("../lib/sessions")
    const allSessions = sessions.listSessions()
    const mySession = allSessions.find((s) => s.id === sessionId)
    const branch = mySession?.branch || currentBranch()
    const files = mySession ? Object.keys(mySession.files) : []
    const fileList = files.length > 0 ? `\nFiles touched: ${files.slice(0, 10).join(", ")}${files.length > 10 ? ` (+${files.length - 10} more)` : ""}` : ""

    const content = `Session checkpoint (${date})${note ? `\nNote: ${note}` : ""}\nBranch: ${branch}${fileList}`

    // Check for existing checkpoint with same key
    let existingIdx = -1
    let existingId = ""
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.startsWith("  ") || !line.includes("|")) continue
      if (line.startsWith("  summaries:")) break
      const parts = parseToonLine(line)
      if (parts[2] === key) {
        existingIdx = i
        existingId = parts[0]
        break
      }
    }

    if (existingIdx !== -1) {
      // Update existing checkpoint
      const parts = parseToonLine(lines[existingIdx])
      parts[3] = content
      parts[6] = date
      parts[7] = ttl7d
      while (parts.length < 14) parts.push("")
      parts[13] = "0"
      lines[existingIdx] = toToonLine(parts)
      writeMemory(lines.join("\n"))
      return {
        content: [{ type: "text" as const, text: `📝 Checkpoint updated: ${key}\n⏰ TTL: ${ttl7d} (7d)\n${note ? `\n${note}` : ""}` }],
      }
    }

    // Create new checkpoint entry
    const newId = `cp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const quality = qualityScore("checkpoint", "", content, date)
    const newEntry = toToonLine([newId, "knowledge", key, content, "", "checkpoint", date, ttl7d, "0", "", quality.toFixed(2), "1", now.toISOString(), "0"])

    const match = lines[headerIdx].match(/\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    lines.splice(headerIdx + 1, 0, newEntry)
    lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count + 1}|`)
    writeMemory(lines.join("\n"))

    return {
      content: [{
        type: "text" as const,
        text: `📝 Checkpoint saved: ${key} (${newId})\n⏰ TTL: ${ttl7d} (7d)${note ? `\n\n${note}` : ""}`,
      }],
    }
  }
)

// ── memory_pin ───────────────────────────────────────────────────────────────

server.registerTool(
  "memory_pin",
  {
    title: "Pin Entry",
    description: "Pin a memory entry with priority level (1-5). Higher priority entries appear first in recalls. Default: 1. Useful for critical decisions, project rules, or frequently-needed context.",
    inputSchema: {
      key: z.string().describe("Key or id of the entry to pin"),
      priority: z.number().optional().default(1).describe("Priority level 1-5 (5 = highest). Default: 1."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ key, priority }) => {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

    if (headerIdx === -1) {
      return { content: [{ type: "text" as const, text: "No entries in memory" }] }
    }

    const clampedPriority = Math.max(1, Math.min(5, Math.round(priority)))

    let found = false
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.startsWith("  ") || !line.includes("|")) continue
      if (line.startsWith("  summaries:")) break
      const parts = parseToonLine(line)
      if (parts[0] === key || parts[2] === key) {
        while (parts.length < 14) parts.push("")
        parts[13] = String(clampedPriority)
        lines[i] = toToonLine(parts)
        found = true
        break
      }
    }

    if (!found) {
      return { content: [{ type: "text" as const, text: `"${key}" not found in memory.` }] }
    }

    writeMemory(lines.join("\n"))
    return { content: [{ type: "text" as const, text: `📌${clampedPriority > 1 ? clampedPriority : ""} Pinned "${key}" at priority ${clampedPriority}. It will now appear first in recalls.` }] }
  }
)

// ── memory_unpin ─────────────────────────────────────────────────────────────

server.registerTool(
  "memory_unpin",
  {
    title: "Unpin Entry",
    description: "Remove the pin from a memory entry so it returns to normal ranking.",
    inputSchema: {
      key: z.string().describe("Key or id of the entry to unpin"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ key }) => {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

    if (headerIdx === -1) {
      return { content: [{ type: "text" as const, text: "No entries in memory" }] }
    }

    let found = false
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.startsWith("  ") || !line.includes("|")) continue
      if (line.startsWith("  summaries:")) break
      const parts = parseToonLine(line)
      if (parts[0] === key || parts[2] === key) {
        if (parts.length > 13) {
          parts[13] = "0"
          lines[i] = toToonLine(parts)
        }
        found = true
        break
      }
    }

    if (!found) {
      return { content: [{ type: "text" as const, text: `"${key}" not found in memory.` }] }
    }

    writeMemory(lines.join("\n"))
    return { content: [{ type: "text" as const, text: `Unpinned "${key}". It will now use normal ranking.` }] }
  }
)

// ── memory_search ────────────────────────────────────────────────────────────

server.registerTool(
  "memory_search",
  {
    title: "Unified Search",
    description: "Search memory with combined filters: text query, category, tags, and date range. Returns ranked results.",
    inputSchema: {
      query: z.string().describe("Text to search for"),
      category: z.string().optional().default("").describe("Filter by category (empty = all)"),
      tags: z.string().optional().default("").describe("Semicolon-separated tags; entry must have ALL specified tags"),
      from_date: z.string().optional().default("").describe("Start date filter (YYYY-MM-DD or relative like 7d)"),
      to_date: z.string().optional().default("").describe("End date filter (YYYY-MM-DD)"),
      limit: z.number().optional().default(6).describe("Maximum entries to return"),
      mode: z.enum(["flat", "graph"]).optional().default("flat").describe("'flat' = keyword search (default). 'graph' = graph-based recall."),
      hops: z.number().optional().default(1).describe("Graph depth in 'graph' mode (1 or 2). Default 1."),
      compact: z.boolean().optional().default(false).describe("Token-efficient output"),
      budget: z.enum(["tiny", "normal", "deep"]).optional().default("deep").describe("'tiny': key+1 line (~50 tokens). 'normal': compact with tags/edges. 'deep': all fields (default). Overrides 'compact'."),
      bias: z.enum(["none", "session"]).optional().default("none").describe("'session': boost entries whose file matches current session files. 'none': no bias (default)."),
      path_scope: z.string().optional().default("").describe("Glob pattern to filter entries by path scope (e.g. 'src/**.ts')."),
      rrf: z.boolean().optional().default(false).describe("Use Reciprocal Rank Fusion (BM25x3 + centrality ranks, adaptive k=sqrtN) instead of weighted linear scoring. Weight-free: reaches parity with the tuned linear scorer on scripts/bench-rrf.mjs."),
      as_of: z.string().optional().default("").describe("Temporal view (YYYY-MM-DD): return entries valid on that date."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ query, category, tags, from_date, to_date, limit, mode, hops, compact, bias, budget: budgetParam, path_scope, rrf, as_of }) => {
    const data = readMemory()

    const resolvedFrom = from_date ? parseRelativeDate(from_date) : ""
    const sessionFiles = bias === "session" ? getCurrentSessionFiles() : undefined
    const resolvedBudget = budgetParam || (compact ? "normal" : "deep")
    const detail = graphRecallDetailed(data, query, {
      category: category || undefined,
      tags: tags || undefined,
      from_date: resolvedFrom || undefined,
      to_date: to_date || undefined,
      hops,
      limit,
      sessionFiles,
      path_scope: path_scope || undefined,
      rrf,
      asOf: as_of || undefined,
    })

    if (detail.entries.length === 0) {
      return { content: [{ type: "text" as const, text: `No results found for "${query}"` }] }
    }

    bumpAccessed(detail.entries.map((e) => e.id))

    if (resolvedBudget === "tiny" || resolvedBudget === "normal") {
      const formatted = renderCompact(detail.entries, {
        adjacency: detail.adjacency,
        seeds: detail.seeds,
        snippetLen: 90,
        budget: resolvedBudget,
      })
      return { content: [{ type: "text" as const, text: `🔍 Search: "${query}"\n\n${formatted}` }] }
    }

    const formatted = detail.entries
      .map((r) => {
        const links = r.links.length ? `\n  links: ${r.links.join(", ")}` : ""
        const pin = r.priority > 0 ? (r.priority > 1 ? ` 📌${r.priority}` : " 📌") : ""
        const originInfo = r.origin !== "agent" ? ` | origin: ${r.origin}` : ""
        const scopeInfo = r.path_scope ? ` | scope: ${r.path_scope}` : ""
        const statusInfo = r.status !== "active" ? ` | status: ${r.status}` : ""
        const supersededInfo = r.supersededOn ? ` | superseded: ${r.supersededOn}` : ""
        return `[${r.category}] ${r.key}${pin} (${r.id})\n  ${r.content}\n  File: ${r.file} | Tags: ${r.tags.join(";")} | Date: ${r.date}${links}${originInfo}${scopeInfo}${statusInfo}${supersededInfo}`
      })
      .join("\n\n")

    let filterInfo = ""
    if (category) filterInfo += ` category: ${category}`
    if (tags) filterInfo += ` tags: ${tags}`
    if (from_date) filterInfo += ` from: ${from_date}`
    if (to_date) filterInfo += ` to: ${to_date}`

    return {
      content: [{ type: "text" as const, text: `🔍 Search results${filterInfo}:\n\n${formatted}` }],
    }
  }
)

// ── memory_tag ───────────────────────────────────────────────────────────────

server.registerTool(
  "memory_tag",
  {
    title: "Batch Tag Operations",
    description: "Batch add, remove, or set tags on one or more memory entries by key or id.",
    inputSchema: {
      action: z.enum(["add", "remove", "set"]).describe("'add': merge tags (union). 'remove': remove specified tags. 'set': replace all tags."),
      tags: z.string().describe("Semicolon-separated tags to apply"),
      ids: z.string().describe("Comma or space-separated entry keys or IDs to modify"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ action, tags, ids }) => {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

    if (headerIdx === -1) {
      return { content: [{ type: "text" as const, text: "No entries in memory." }] }
    }

    const targetIds = ids.split(/[\s,]+/).filter(Boolean)
    const targetSet = new Set(targetIds)
    const tagsToApply = tags.split(";").map((t) => t.trim()).filter(Boolean)

    if (tagsToApply.length === 0) {
      return { content: [{ type: "text" as const, text: "No tags provided." }] }
    }

    let modified = 0
    const modifiedKeys: string[] = []

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.startsWith("  ") || !line.includes("|")) continue
      if (line.startsWith("  summaries:")) break
      const parts = parseToonLine(line)
      const entryId = parts[0]
      const entryKey = parts[2]

      if (!targetSet.has(entryId) && !targetSet.has(entryKey)) continue

      const currentTags = (parts[5] || "").split(";").map((t) => t.trim()).filter(Boolean)
      let newTags: string[]

      if (action === "add") {
        newTags = [...new Set([...currentTags, ...tagsToApply])]
      } else if (action === "remove") {
        newTags = currentTags.filter((t) => !tagsToApply.includes(t))
      } else {
        newTags = [...tagsToApply]
      }

      parts[5] = newTags.join(";")
      lines[i] = toToonLine(parts)
      modified++
      modifiedKeys.push(entryKey)
    }

    if (modified === 0) {
      return { content: [{ type: "text" as const, text: `No entries found matching: ${targetIds.join(", ")}` }] }
    }

    writeMemory(lines.join("\n"))

    const actionLabel = action === "add" ? "Added" : action === "remove" ? "Removed" : "Set"
    return {
      content: [{
        type: "text" as const,
        text: `🏷️ ${actionLabel} tags on ${modified} entries:\n  Tags: ${tagsToApply.join(";")}\n  Entries: ${modifiedKeys.join(", ")}`,
      }],
    }
  }
)

// ── memory_reflect ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_reflect",
  {
    title: "Reflect on Memory",
    description: "Deterministic memory audit (no LLM): tag co-occurrence themes, hub/orphan entries, near-duplicates, contradiction candidates, stale entries, and superseded-but-active entries. Signals what to link, merge, or retire.",
    inputSchema: {
      category: z.string().optional().default("").describe("Restrict analysis to one category (empty = all)."),
      limit: z.number().optional().default(5).describe("Max items per section."),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  async ({ category, limit }) => {
    const data = readMemory()
    const entries = parseEntries(data)
    const cap = Math.max(1, Math.min(20, limit || 5))
    if (entries.length === 0) {
      return { content: [{ type: "text" as const, text: "Empty memory." }] }
    }

    const scope = entries.filter((e) => !category || e.category === category)
    const { adjacency } = buildGraph(entries)

    const sections: string[] = [`🧠 Memory reflect (${scope.length}/${entries.length} entries)`]

    // 1. Hubs and orphans
    const degree = new Map<string, number>()
    for (const [k, nbs] of adjacency) degree.set(k, nbs.length)
    const hubs = [...degree.entries()].sort((a, b) => b[1] - a[1]).filter(([, d]) => d >= 3)
    if (hubs.length > 0) {
      sections.push("", "🔗 Hubs (connectors):")
      for (const [k, d] of hubs.slice(0, cap)) {
        const e = entries.find((x) => x.key === k)
        sections.push(`  ${k} (deg ${d}) — ${e ? e.content.slice(0, 70) : ""}`)
      }
    }
    const orphans = scope.filter((e) => e.status === "active" && !(degree.get(e.key) || 0) && e.tags.length === 0)
    if (orphans.length > 0) {
      sections.push("", "🕳️ Orphans (no links, no tags — consider linking):")
      for (const e of orphans.slice(0, cap)) {
        sections.push(`  [${e.category}] ${e.key} — ${e.content.slice(0, 70)}`)
      }
    }

    // 2. Tag co-occurrence themes
    const pairCount = new Map<string, number>()
    for (const e of scope) {
      if (e.tags.length < 2) continue
      const t = [...e.tags].sort()
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          const pair = `${t[i]} + ${t[j]}`
          pairCount.set(pair, (pairCount.get(pair) || 0) + 1)
        }
      }
    }
    const themes = [...pairCount.entries()].sort((a, b) => b[1] - a[1])
    if (themes.length > 0) {
      sections.push("", "🏷️ Latent themes (tag co-occurrence):")
      for (const [pair, n] of themes.slice(0, cap)) {
        sections.push(`  ${pair} — ${n} entries`)
      }
    }

    // 3. Near-duplicates (Jaccard word overlap > 0.5)
    const active = scope.filter((e) => e.status === "active")
    const wordSets = new Map<string, Set<string>>()
    for (const e of active) {
      wordSets.set(e.key, new Set(normalize(`${e.key} ${e.content} ${e.tags.join(" ")}`).split(" ").filter(Boolean)))
    }
    const dupes: Array<{ a: string; b: string; sim: number }> = []
    const keysArr = active.map((e) => e.key)
    for (let i = 0; i < keysArr.length; i++) {
      for (let j = i + 1; j < keysArr.length; j++) {
        const wa = wordSets.get(keysArr[i])!
        const wb = wordSets.get(keysArr[j])!
        const inter = new Set([...wa].filter((w) => wb.has(w)))
        const union = new Set([...wa, ...wb])
        const sim = union.size > 0 ? inter.size / union.size : 0
        if (sim > 0.5) dupes.push({ a: keysArr[i], b: keysArr[j], sim })
      }
    }
    if (dupes.length > 0) {
      sections.push("", "♻️ Near-duplicates (merge candidates):")
      for (const d of dupes.sort((x, y) => y.sim - x.sim).slice(0, cap)) {
        sections.push(`  ${d.a} ↔ ${d.b} (${(d.sim * 100).toFixed(0)}% overlap)`)
      }
    }

    // 4. Contradiction candidates: same category, ≥2 shared tags, split polarity markers
    const NEGATION = /\b(no longer|never|not|no|doesn'?t|don'?t|shouldn'?t|cannot|can'?t|instead of|contradicts|replaces|deprecated|broken|fails|wrong|incorrect)\b/i
    const contradictions: string[] = []
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i], b = active[j]
        if (a.category !== b.category) continue
        const shared = a.tags.filter((t) => b.tags.includes(t)).length
        if (shared < 2) continue
        const aNeg = NEGATION.test(a.content)
        const bNeg = NEGATION.test(b.content)
        if (aNeg !== bNeg) {
          contradictions.push(`${a.key} ↔ ${b.key} [${a.category}] (${shared} shared tags, split polarity)`)
        }
      }
    }
    if (contradictions.length > 0) {
      sections.push("", "⚡ Contradiction candidates (verify):")
      for (const c of contradictions.slice(0, cap)) {
        sections.push(`  ${c}`)
      }
    }

    // 5. Stale / archive candidates
    const now = Date.now()
    const stale = active.filter((e) => {
      if (e.tags.includes("private")) return false
      if (e.ttl && isExpiredLocal(e.ttl)) return true
      if (!e.date) return false
      const ageDays = (now - new Date(`${e.date}T00:00:00`).getTime()) / 86400000
      const lastAccessDays = e.lastAccessed ? (now - new Date(e.lastAccessed).getTime()) / 86400000 : ageDays
      return ageDays > 120 && lastAccessDays > 90 && e.accessed === 0
    })
    if (stale.length > 0) {
      sections.push("", "🗄️ Stale (archive candidates):")
      for (const e of stale.sort((a, b) => a.date.localeCompare(b.date)).slice(0, cap)) {
        sections.push(`  [${e.category}] ${e.key} — ${e.content.slice(0, 70)}`)
      }
    }

    // 6. Superseded-but-active (tag/link present but status not obsolete)
    const pending = entries.filter((e) => e.status === "active" && (e.tags.includes("superseded") || typedLinks(e.links).some((l) => l.type === "superseded_by")))
    if (pending.length > 0) {
      sections.push("", "🔎 Superseded tag but still active (fix with memory_forget action: 'supersede'):")
      for (const e of pending.slice(0, cap)) {
        sections.push(`  [${e.category}] ${e.key}`)
      }
    }

    // 7. Drafts pending review
    const drafts = entries.filter((e) => e.status === "draft")
    if (drafts.length > 0) {
      sections.push("", "📝 Drafts pending review (promote with memory_promote / memory_forget action: 'restore'):")
      for (const e of drafts.slice(0, cap)) {
        sections.push(`  [${e.category}] ${e.key} — ${e.content.slice(0, 70)}`)
      }
    }

    return { content: [{ type: "text" as const, text: sections.join("\n") }] }
  }
)

// ── memory_promote ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_promote",
  {
    title: "Promote Observations",
    description: "Heuristic auto-promote from the capture log (no LLM). Each observation gets a deterministic confidence score; high-confidence ones promote as active entries, low-confidence (≤ minConfidence) become reviewable drafts. Opt-in: run with dryRun: true first.",
    inputSchema: {
      dryRun: z.boolean().optional().default(true).describe("If true, only preview what would be promoted (no writes)."),
      minConfidence: z.number().optional().default(0.65).describe("Observations at or below this confidence become drafts; above it become active entries."),
      max: z.number().optional().default(5).describe("Maximum observations to promote."),
      days: z.number().optional().default(7).describe("Only consider observations from the last N days."),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  async ({ dryRun, minConfidence, max, days }) => {
    const obs = readObservations()
    if (obs.length === 0) {
      return { content: [{ type: "text" as const, text: "No captured activity. Enable with `toon-memory capture on`." }] }
    }

    const cutoff = Date.now() - (days || 7) * 86400000
    const recent = obs.filter((o) => new Date(o.ts).getTime() >= cutoff)

    const data = readMemory()
    const existing = parseEntries(data)
    const existingKeys = new Set(existing.map((e) => e.key))
    const existingWords = existing.map((e) => new Set(normalize(`${e.key} ${e.content} ${e.tags.join(" ")}`).split(" ").filter(Boolean)))

    // Deterministic confidence heuristic (0..1).
    const confidence = (o: { tool: string; file: string; summary: string }): number => {
      const summary = (o.summary || "").trim()
      if (!summary) return 0.1
      let c = 0.5
      const len = summary.length
      if (len >= 40 && len <= 300) c += 0.1
      else if (len < 40) c -= 0.1
      if (o.file) c += 0.15
      const tool = (o.tool || "").toLowerCase()
      if (["edit", "write", "create", "bash", "git", "npm"].includes(tool)) c += 0.1
      else if (["read", "grep", "glob", "search", "ls", "list"].includes(tool)) c -= 0.15
      if (/\b(error|fail|bug|fix|broken|fails|failed|cannot|crash)\b/i.test(summary)) c += 0.1
      if (/\b(viewed|read|opened|inspected|browsed|listed|scanned)\b/i.test(summary)) c -= 0.1
      return Math.max(0.05, Math.min(1, c))
    }

    const alreadyKnown = (o: { tool: string; summary: string }): boolean => {
      const words = new Set(normalize(`${o.tool} ${o.summary}`).split(" ").filter(Boolean))
      if (words.size === 0) return true
      for (const set of existingWords) {
        const inter = new Set([...words].filter((w) => set.has(w)))
        const union = new Set([...words, ...set])
        if (inter.size / union.size > 0.5) return true
      }
      return false
    }

    const seen = new Set<string>()
    const candidates = recent
      .filter((o) => {
        const dedupKey = `${o.tool}|${o.summary}`
        if (seen.has(dedupKey)) return false
        seen.add(dedupKey)
        return o.summary && !alreadyKnown(o)
      })
      .map((o) => ({ o, conf: confidence(o) }))
      .sort((a, b) => b.conf - a.conf)
      .slice(0, max || 5)

    if (candidates.length === 0) {
      return { content: [{ type: "text" as const, text: "✅ Nothing new to promote — all recent observations are already covered by memory or below threshold." }] }
    }

    const preview = candidates.map(({ o, conf }) => {
      const kind = conf <= minConfidence ? "draft" : "active"
      return `  [${kind}] ${(o.summary || "").slice(0, 90)} (conf ${conf.toFixed(2)})${o.file ? ` @ ${o.file}` : ""}`
    })
    const kindLabel = (conf: number) => (conf <= minConfidence ? "draft" : "active")

    if (dryRun) {
      return {
        content: [{
          type: "text" as const,
          text: `🔍 Dry run — ${candidates.length} candidate(s) from the last ${days || 7}d (threshold ${minConfidence}):\n\n${preview.join("\n")}\n\nRun with dryRun: false to promote.`
        }],
      }
    }

    const date = new Date().toISOString().split("T")[0]
    const lines = data.split("\n")
    let headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))
    if (headerIdx === -1) {
      lines.push(`[0|]`)
      headerIdx = lines.length - 1
    }
    const match = lines[headerIdx].match(/\[(\d+)\|/)
    let count = match ? parseInt(match[1]) : 0

    let promoted = 0
    let drafted = 0
    const actions: string[] = []
    for (const { o, conf } of candidates) {
      const key = o.summary
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 4)
        .join("-")
        .slice(0, 40) || `observation-${Date.now().toString(36)}`
      if (existingKeys.has(key)) continue

      const newId = generateId()
      const status = kindLabel(conf)
      const tags = ["captured", `${o.agent || "agent"}`]
      if (status === "draft") tags.push("draft")
      const content = (o.summary || "").slice(0, 500)
      const quality = qualityScore(tags.join(";"), "", content, date)
      const entry = toToonLine([newId, "knowledge", key, content, o.file || "", tags.join(";"), date, "", "0", "", quality.toFixed(2), conf.toFixed(2), date, "0", "", "inferred", status])

      lines.splice(headerIdx + 1, 0, entry)
      count++
      existingKeys.add(key)
      if (status === "draft") drafted++
      else promoted++
      actions.push(`  [${status}] ${key} (conf ${conf.toFixed(2)})`)
    }
    lines[headerIdx] = lines[headerIdx].replace(/\[\d+\|/, `[${count}|`)
    writeMemory(lines.join("\n"))

    return {
      content: [{
        type: "text" as const,
        text: `📤 Promoted ${promoted} active + ${drafted} draft from the capture log.\n\n${actions.join("\n")}\n\nDrafts are hidden from recalls until promoted — use memory_forget(key, action: 'restore') to activate, or review with memory_reflect.`
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
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
