import type { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { readMemory, writeMemory } from "./memory-io"
import { loadConfig, saveConfig, getKey, MEMORY_FILE, OBSERVATIONS_FILE, MAX_ENTRIES } from "./config"
import { generateId, parseTTL, isExpired, inferTags, parseRelativeDate } from "./entries"
import { entryScore, findRelatedEntries, bumpAccessed } from "./scoring"
import { readObservations } from "./observations"
import { archiveOldEntries } from "./archive"
import { consolidateEntries } from "./consolidation"
import { encrypt, decrypt } from "./crypto"
import { graphRecallDetailed, renderCompact } from "../lib/graph"
import { qualityScore, mergeEntries, generateSmartRecall } from "../lib/quality"
import { generateContextBrief } from "../lib/context"
import { coordinationView, resolveSessionId, currentBranch, SESSION_TTL_MS } from "../lib/sessions"

const normalize = (s: string) => s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()

/**
 * Register all 15 memory tools.
 */
export function registerTools(server: McpServer): void {

// ── memory_remember ──────────────────────────────────────────────────────────

server.registerTool(
  "memory_remember",
  {
    title: "Save to Memory",
    description: "Guarda un hecho en la memoria persistente del proyecto (decisiones, patrones, bugs, conocimiento). Se recuerda entre sesiones.",
    inputSchema: {
      category: z.enum(["decision", "pattern", "bug", "knowledge"]).describe("Categoría del hecho"),
      key: z.string().describe("Título corto en kebab-case (ej: risk-engine-prioridad)"),
      content: z.string().describe("Contenido detallado del hecho"),
      file: z.string().optional().default("").describe("Archivo o línea relacionada (ej: spec.md:145)"),
      tags: z.string().optional().default("").describe("Tags separados por punto y coma (ej: risk;spec)"),
      ttl: z.string().optional().default("").describe("Time to live (ej: 7d, 2026-07-17). Vacío = sin expiración"),
      links: z.string().optional().default("").describe("Entradas relacionadas por key, separadas por espacio o ';' (ej: risk-spec engine-arch). Construye aristas del grafo de memoria."),
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
    let action = "Guardado"
    let mergeInfo = ""
    const tagsInferred = !tags && resolvedTags ? true : false

    if (existingIdx !== -1) {
      newEntry = mergeEntries(lines[existingIdx].trim(), newEntry)
      lines[existingIdx] = `  ${newEntry}`
      action = "Actualizado"
      mergeInfo = "\n🔗 Merge: tags combinados, fecha y links actualizados"
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
    if (entryCount > MAX_ENTRIES) {
      const result = archiveOldEntries({ trimToMax: true })
      if (result.archived > 0) {
        archiveMsg = `\n📦 Auto-archived ${result.archived} low-importance entries (${result.kept} kept)`
      }
    }

    const ttlMsg = resolvedTtl ? `\n⏰ TTL: ${resolvedTtl}` : ""
    const inferredMsg = tagsInferred ? `\n🏷️ Tags inferidos: ${resolvedTags}` : ""

    const related = findRelatedEntries(`${key} ${content} ${resolvedTags}`, key, 3)
    let relatedMsg = ""
    if (related.length > 0) {
      const items = related.map((r) => `  [${r.cat}] ${r.key} — ${r.content.slice(0, 80)}`).join("\n")
      relatedMsg = `\n\n🔗 Entradas relacionadas:\n${items}`
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
    description: "Busca en la memoria persistente del proyecto. Devuelve entradas relevantes. Usar ANTES de leer archivos.",
    inputSchema: {
      query: z.string().describe("Texto a buscar"),
      category: z.string().optional().default("").describe("Filtrar por categoría (vacío = todos)"),
      from_date: z.string().optional().default("").describe("Fecha inicio filtro (YYYY-MM-DD)"),
      to_date: z.string().optional().default("").describe("Fecha fin filtro (YYYY-MM-DD)"),
      mode: z.enum(["flat", "graph"]).optional().default("flat").describe("'flat' = búsqueda por palabra clave (default). 'graph' = recall basado en grafo: expande el subgrafo de entradas relacionadas desde las coincidencias (más preciso, menos tokens)."),
      hops: z.number().optional().default(1).describe("Profundidad del grafo en modo 'graph' (1 o 2). Default 1."),
      compact: z.boolean().optional().default(false).describe("Salida token-efficient: índices numéricos (1, 2), omite id/fecha/archivo (conserva tags), aristas como '->2', y trunca vecinos del grafo a un snippet. No muta el archivo .toon."),
    },
  },
  async ({ query, category, from_date, to_date, mode, hops, compact }) => {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))

    const queryTokens = normalize(query).split(" ").filter(Boolean)

    const results = lines
      .map((line) => {
        const trimmed = line.trim()
        const parts = trimmed.split("|")
        if (parts.length < 7) return null
        const [id, cat, key, content, file, tags, date, ttl, accessedRaw] = parts
        const qualityRaw = parts[10] || ""
        const confidenceRaw = parts[11] || ""
        if (category && cat !== category) return null
        if (from_date && date < from_date) return null
        if (to_date && date > to_date) return null
        if (ttl && isExpired(ttl)) return null
        const searchStr = normalize(`${id} ${cat} ${key} ${content} ${file} ${tags} ${qualityRaw} ${confidenceRaw}`)
        if (!queryTokens.every((token) => searchStr.includes(token))) return null
        const accessed = accessedRaw ? parseInt(accessedRaw) || 0 : 0
        return { id, cat, key, content, file, tags, date, accessed, qualityRaw, confidenceRaw }
      })
      .filter(Boolean) as Array<{ id: string; cat: string; key: string; content: string; file: string; tags: string; date: string; accessed: number; qualityRaw: string; confidenceRaw: string }>

    if (results.length === 0) {
      return { content: [{ type: "text" as const, text: `No se encontraron resultados para "${query}"` }] }
    }

    if (mode === "graph") {
      const detail = graphRecallDetailed(data, query, { category, from_date, to_date, hops })
      if (detail.entries.length === 0) {
        return { content: [{ type: "text" as const, text: `No se encontraron resultados para "${query}"` }] }
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

    const ranked = results
      .map((r) => {
        const quality = r.qualityRaw ? parseFloat(r.qualityRaw) || 0 : 0
        const qualityBoost = quality * 0.15
        return { ...r, score: entryScore(r.date, r.accessed) + qualityBoost }
      })
      .sort((a, b) => b.score - a.score)

    bumpAccessed(ranked.map((r) => r.id))

    if (compact) {
      const entries = ranked.map((r) => ({
        id: r.id,
        category: r.cat,
        key: r.key,
        content: r.content,
        file: r.file,
        tags: r.tags ? r.tags.split(";").filter(Boolean) : [],
        date: r.date,
        ttl: "",
        accessed: r.accessed,
        links: [] as string[],
      }))
      const formatted = renderCompact(entries)
      return { content: [{ type: "text" as const, text: formatted }] }
    }

    const formatted = ranked
      .map((r) => `[${r.cat}] ${r.key} (${r.id})\n  ${r.content}\n  File: ${r.file} | Tags: ${r.tags} | Date: ${r.date}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: formatted }] }
  }
)

// ── memory_forget ────────────────────────────────────────────────────────────

server.registerTool(
  "memory_forget",
  {
    title: "Delete from Memory",
    description: "Elimina una entrada de la memoria por su key o id.",
    inputSchema: {
      key: z.string().describe("Key o id de la entrada a eliminar"),
    },
  },
  async ({ key }) => {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries[") || /^\[\d+\|]/.test(l))

    if (headerIdx === -1) {
      return { content: [{ type: "text" as const, text: "No hay entradas en memoria" }] }
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
    return {
      content: [{ type: "text" as const, text: `"${key}" eliminado. Quedan ${count - removed} entradas.` }],
    }
  }
)

// ── memory_stats ─────────────────────────────────────────────────────────────

server.registerTool(
  "memory_stats",
  {
    title: "Memory Stats",
    description: "Muestra estadísticas de la memoria del proyecto.",
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
      `Entradas totales: ${entries.length}`,
      `Resúmenes de archivos: ${summaryLines.length}`,
      "",
      "Por categoría:",
      ...Object.entries(byCategory).map(([k, v]) => `  ${k}: ${v}`),
      "",
      `TTL: ${withTtl} con expiración, ${expired} expiradas`,
      `Calidad promedio: ${avgQuality} (${withQuality} con score)`,
      "",
      `Últimas 5 entradas:`,
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
    description: "Muestra qué cambió en la memoria desde una fecha. Útil para saber qué se aprendió desde la última sesión.",
    inputSchema: {
      since: z.string().describe("Desde cuándo mostrar cambios (ej: 24h, 7d, 2026-07-10)"),
      type: z.enum(["all", "created", "updated"]).optional().default("all").describe("Filtrar por tipo de cambio"),
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
      return { content: [{ type: "text" as const, text: `No hay cambios desde ${sinceDate}` }] }
    }

    const created = results.filter((r) => r!.changeType === "created")
    const updated = results.filter((r) => r!.changeType === "updated")

    const sections: string[] = [`📋 Cambios desde ${sinceDate}:`, ""]

    if (created.length > 0 && (type === "all" || type === "created")) {
      sections.push(`➕ Nuevas (${created.length}):`)
      for (const r of created) {
        sections.push(`  [${r!.cat}] ${r!.key} (${r!.id})\n    ${r!.content}`)
      }
      sections.push("")
    }

    if (updated.length > 0 && (type === "all" || type === "updated")) {
      sections.push(`✏️  Actualizadas (${updated.length}):`)
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
    description: "Sugiere entradas de memoria relacionadas con un contexto dado. Útil para obtener contexto antes de una tarea.",
    inputSchema: {
      context: z.string().describe("Texto o contexto para buscar sugerencias"),
      limit: z.number().optional().default(5).describe("Máximo de sugerencias"),
    },
  },
  async ({ context, limit }) => {
    const related = findRelatedEntries(context, "", limit)

    if (related.length === 0) {
      return { content: [{ type: "text" as const, text: `No se encontraron entradas relacionadas con "${context}"` }] }
    }

    const formatted = related
      .map((r) => `[${r.cat}] ${r.key} (${r.id})\n  ${r.content}\n  File: ${r.file} | Tags: ${r.tags} | Date: ${r.date}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: `🔍 Sugerencias para "${context}":\n\n${formatted}` }] }
  }
)

// ── memory_smart_recall ──────────────────────────────────────────────────────

server.registerTool(
  "memory_smart_recall",
  {
    title: "Smart Recall (Unified)",
    description: "Recuperación unificada: combina BM25 + grafo + decay + calidad en una sola llamada. Usar al INICIO de cada tarea para obtener todo el contexto relevante de memoria.",
    inputSchema: {
      intent: z.string().describe("Describe qué necesitas saber (ej: 'diseño de base de datos para backend')"),
      limit: z.number().optional().default(8).describe("Máximo de entradas a devolver"),
      category: z.string().optional().default("").describe("Filtrar por categoría (vacío = todos)"),
    },
  },
  async ({ intent, limit, category }) => {
    const data = readMemory()
    const result = generateSmartRecall(data, intent, { limit, category })
    return { content: [{ type: "text" as const, text: result }] }
  }
)

// ── memory_summary ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_summary",
  {
    title: "File Summary",
    description: "Guarda o recupera un resumen de un archivo grande para ahorrar tokens.",
    inputSchema: {
      action: z.enum(["get", "set"]).describe("get para leer, set para guardar"),
      file: z.string().describe("Ruta del archivo"),
      summary: z.string().optional().default("").describe("Resumen del archivo (solo para set)"),
    },
  },
  async ({ action, file, summary }) => {
    const data = readMemory()

    if (action === "get") {
      const lines = data.split("\n")
      const summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))
      if (summaryIdx === -1) {
        return { content: [{ type: "text" as const, text: `No hay resúmenes guardados para "${file}"` }] }
      }

      const summaryLines = lines.slice(summaryIdx + 1).filter((l) => l.includes(":"))
      const match = summaryLines.find((l) => l.startsWith(`  ${file}:`))
      if (!match) {
        return { content: [{ type: "text" as const, text: `No hay resumen para "${file}"` }] }
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
      content: [{ type: "text" as const, text: `📝 Resumen guardado para ${file}` }],
    }
  }
)

// ── memory_archive ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_archive",
  {
    title: "Archive Old Entries",
    description: "Mover entradas antiguas (>30 días) a archive.toon para mantener la memoria limpia.",
    inputSchema: {},
  },
  async () => {
    const result = archiveOldEntries()

    if (result.archived === 0) {
      return { content: [{ type: "text" as const, text: "No hay entradas antiguas para archivar" }] }
    }

    return {
      content: [{
        type: "text" as const,
        text: `📦 Archivadas ${result.archived} entradas antiguas\n📋 Quedan ${result.kept} entradas activas`
      }],
    }
  }
)

// ── memory_encrypt ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_encrypt",
  {
    title: "Enable Encryption",
    description: "Habilita encriptación AES-256-GCM para la memoria. La clave se genera automáticamente.",
    inputSchema: {},
  },
  async () => {
    const config = loadConfig()

    if (config.encrypted) {
      return { content: [{ type: "text" as const, text: "La encriptación ya está habilitada" }] }
    }

    const key = getKey()
    if (!key) {
      return { content: [{ type: "text" as const, text: "❌ Define TOON_MEMORY_KEY en el entorno antes de encriptar" }] }
    }

    const data = readFileSync(MEMORY_FILE, "utf-8")
    const encrypted = encrypt(data, key)
    writeFileSync(MEMORY_FILE, encrypted)

    saveConfig({ encrypted: true })

    return {
      content: [{ type: "text" as const, text: "🔐 Encriptación habilitada" }],
    }
  }
)

// ── memory_decrypt ───────────────────────────────────────────────────────────

server.registerTool(
  "memory_decrypt",
  {
    title: "Disable Encryption",
    description: "Deshabilita la encriptación y decodifica la memoria.",
    inputSchema: {
      key: z.string().describe("Clave de encriptación"),
    },
  },
  async ({ key }) => {
    const config = loadConfig()

    if (!config.encrypted) {
      return { content: [{ type: "text" as const, text: "La encriptación no está habilitada" }] }
    }

    const resolvedKey = key || getKey() || ""
    if (!resolvedKey) {
      return { content: [{ type: "text" as const, text: "❌ No hay clave. Pásala como argumento o la del archivo .env" }] }
    }

    try {
      const data = readFileSync(MEMORY_FILE, "utf-8")
      const decrypted = decrypt(data, resolvedKey)

      writeFileSync(MEMORY_FILE, decrypted)
      saveConfig({ encrypted: false })

      return {
        content: [{ type: "text" as const, text: "🔓 Encriptación deshabilitada" }],
      }
    } catch {
      return { content: [{ type: "text" as const, text: "❌ Clave incorrecta o datos corruptos" }] }
    }
  }
)

// ── memory_captured ──────────────────────────────────────────────────────────

server.registerTool(
  "memory_captured",
  {
    title: "List Captured Activity",
    description: "Muestra el log de actividad capturado automáticamente por los hooks (solo si la captura está habilitada). Útil para promover observaciones a memoria con memory_remember.",
    inputSchema: {
      limit: z.number().optional().default(20).describe("Máximo de observaciones a mostrar"),
      tool: z.string().optional().default("").describe("Filtrar por nombre de herramienta"),
      file: z.string().optional().default("").describe("Filtrar por archivo"),
      clear: z.boolean().optional().default(false).describe("Si true, limpia el log de captura"),
    },
  },
  async ({ limit, tool, file, clear }) => {
    if (clear) {
      if (existsSync(OBSERVATIONS_FILE)) {
        writeFileSync(OBSERVATIONS_FILE, "version: 1\nobservations[0|]{ts|session|agent|branch|tool|hash|file|summary}:\n")
      }
      return { content: [{ type: "text" as const, text: "🧹 Log de captura limpiado" }] }
    }

    let obs = readObservations()
    if (tool) obs = obs.filter((o) => o.tool.toLowerCase().includes(tool.toLowerCase()))
    if (file) obs = obs.filter((o) => o.file.toLowerCase().includes(file.toLowerCase()))
    obs = obs.slice(-limit).reverse()

    if (obs.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No hay actividad capturada. La captura está desactivada por defecto; actívala con `toon-memory capture on`.",
        }],
      }
    }

    const formatted = obs
      .map((o) => `[${o.ts}] ${o.agent}@${o.branch}/${o.tool}${o.file ? ` (${o.file})` : ""}\n  ${o.summary}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: `🔍 Actividad capturada (${obs.length}):\n\n${formatted}` }] }
  }
)

// ── memory_consolidate ───────────────────────────────────────────────────────

server.registerTool(
  "memory_consolidate",
  {
    title: "Consolidate Memory",
    description: "Consolida la memoria eliminando entradas con contenido idéntico (mantiene la primera). Determinista, sin LLM.",
    inputSchema: {},
  },
  async () => {
    const result = consolidateEntries()
    if (result.removed === 0) {
      return { content: [{ type: "text" as const, text: `✅ Memoria ya consolidada (${result.kept} entradas, 0 duplicados)` }] }
    }
    return {
      content: [{
        type: "text" as const,
        text: `🧹 Consolidadas ${result.removed} entradas duplicadas.\nQuedan ${result.kept} activas.\nDuplicados: ${result.duplicates.join(", ")}`,
      }],
    }
  }
)

// ── memory_sessions ──────────────────────────────────────────────────────────

server.registerTool(
  "memory_sessions",
  {
    title: "Active Sessions & Conflicts",
    description: "Muestra las sesiones de agente activas en este proyecto (rama git, archivos tocados, last-seen) y detecta conflictos suaves (archivos tocados por 2+ sesiones). Úsalo al iniciar para no pisar el trabajo de otras sesiones paralelas.",
    inputSchema: {
      conflictsOnly: z.boolean().optional().default(false).describe("Si true, muestra solo conflictos suaves"),
    },
  },
  async ({ conflictsOnly }) => {
    const selfId = resolveSessionId()
    const { active, conflicts } = coordinationView(selfId)

    if (conflictsOnly) {
      if (conflicts.length === 0) {
        return { content: [{ type: "text" as const, text: "✅ No hay conflictos suaves entre sesiones activas." }] }
      }
      const lines = conflicts.map((c) => {
        const who = c.sessions.map((s) => `${s.agent}@${s.branch} (${s.id})`).join(", ")
        return `⚠️ ${c.file}\n   ↔ ${who}`
      })
      return {
        content: [{ type: "text" as const, text: `🔥 Conflictos suaves (${conflicts.length}):\n\n${lines.join("\n\n")}` }],
      }
    }

    if (active.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "🟢 No hay otras sesiones activas en este proyecto.\n(Esta sesión: " + selfId + " @ " + currentBranch() + ")",
        }],
      }
    }

    const ttlMin = Math.round(SESSION_TTL_MS / 60000)
    const section = (s: ReturnType<typeof coordinationView>["active"][number]) => {
      const mins = Math.max(0, Math.round(s.ageMs / 60000))
      const tag = s.id === selfId ? " (tú)" : ""
      const ended = s.ended ? " 🏁" : ""
      const files = Object.keys(s.files).slice(0, 8).map((f) => `      • ${f}`).join("\n")
      const fileBlock = files ? `\n   Archivos:\n${files}` : ""
      return `• ${s.agent} @ ${s.branch}${tag}${ended}\n   id: ${s.id}\n   hace ${mins} min${fileBlock}`
    }

    const parts = [
      `🧭 Sesiones activas (${active.length}) — ventana ${ttlMin} min:`,
      "",
      ...active.map(section),
    ]

    if (conflicts.length > 0) {
      parts.push("", `🔥 Conflictos suaves (${conflicts.length}):`)
      for (const c of conflicts) {
        const who = c.sessions.map((s) => `${s.agent}@${s.branch}`).join(", ")
        parts.push(`   ⚠️ ${c.file}  ↔  ${who}`)
      }
    } else {
      parts.push("", "✅ Sin conflictos suaves detectados.")
    }

    return { content: [{ type: "text" as const, text: parts.join("\n") }] }
  }
)

// ── context_brief ────────────────────────────────────────────────────────────

server.registerTool(
  "context_brief",
  {
    title: "Context Briefing",
    description: "Genera un briefing de contexto compacto: memoria relevante + sesiones activas + salud del proyecto. Un solo call en vez de 5-6 llamadas separadas. Cero LLM, pura lógica determinista.",
    inputSchema: {
      task: z.string().optional().default("").describe("Tarea actual del agente. Si se provee, las entradas se rankean por relevancia a esta tarea. Si está vacío, muestra las top entradas por importancia."),
      limit: z.number().optional().default(6).describe("Máximo de entradas relevantes a mostrar"),
    },
  },
  async ({ task, limit }) => {
    const data = readMemory()
    const brief = generateContextBrief(data, { task: task || undefined, limit })
    return { content: [{ type: "text" as const, text: brief }] }
  }
)

} // end registerTools
