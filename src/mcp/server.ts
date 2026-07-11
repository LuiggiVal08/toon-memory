import { McpServer } from "@modelcontextprotocol/server"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"
import { z } from "zod"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { randomBytes } from "crypto"

const __dirname = dirname(fileURLToPath(import.meta.url))
const MEMORY_DIR = join(process.cwd(), ".opencode", "memory")
const MEMORY_FILE = join(MEMORY_DIR, "data.toon")
const ARCHIVE_FILE = join(MEMORY_DIR, "archive.toon")
const MAX_ENTRIES = 100
const ARCHIVE_DAYS = 30

function ensureMemoryFile() {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })
  if (!existsSync(MEMORY_FILE)) {
    writeFileSync(MEMORY_FILE, "version: 1\nentries[0|]{id|category|key|content|file|tags|date}:\n")
  }
}

function readMemory() {
  ensureMemoryFile()
  return readFileSync(MEMORY_FILE, "utf-8")
}

function writeMemory(content: string) {
  ensureMemoryFile()
  writeFileSync(MEMORY_FILE, content)
}

function generateId(): string {
  return randomBytes(4).toString("hex")
}

function archiveOldEntries(): { archived: number; kept: number } {
  const data = readMemory()
  const lines = data.split("\n")
  const headerIdx = lines.findIndex((l) => l.startsWith("entries["))
  
  if (headerIdx === -1) return { archived: 0, kept: 0 }
  
  const today = new Date()
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - ARCHIVE_DAYS)
  const cutoffStr = cutoff.toISOString().split("T")[0]
  
  const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0)
  const toArchive: string[] = []
  const toKeep: string[] = []
  
  for (const line of entryLines) {
    const parts = line.trim().split("|")
    if (parts.length >= 7) {
      const date = parts[6]
      if (date < cutoffStr) {
        toArchive.push(line.trim())
      } else {
        toKeep.push(line.trim())
      }
    } else {
      toKeep.push(line.trim())
    }
  }
  
  if (toArchive.length === 0) return { archived: 0, kept: toKeep.length }
  
  // Write archived entries
  let archiveContent = ""
  if (existsSync(ARCHIVE_FILE)) {
    archiveContent = readFileSync(ARCHIVE_FILE, "utf-8")
  } else {
    archiveContent = `version: 1\narchived:\n`
  }
  
  const archiveLines = archiveContent.split("\n")
  let archiveHeaderIdx = archiveLines.findIndex((l) => l.startsWith("archived["))
  if (archiveHeaderIdx === -1) {
    archiveLines.push(`archived[0|]{id|category|key|content|file|tags|date}:`)
    archiveHeaderIdx = archiveLines.length - 1
  }
  
  const archiveMatch = archiveLines[archiveHeaderIdx].match(/archived\[(\d+)\|/)
  const archiveCount = archiveMatch ? parseInt(archiveMatch[1]) : 0
  
  for (const entry of toArchive) {
    archiveLines.splice(archiveHeaderIdx + 1, 0, `  ${entry}`)
  }
  archiveLines[archiveHeaderIdx] = archiveLines[archiveHeaderIdx].replace(/archived\[\d+\|/, `[${archiveCount + toArchive.length}|`)
  
  writeFileSync(ARCHIVE_FILE, archiveLines.join("\n"))
  
  // Update main file
  lines[headerIdx] = lines[headerIdx].replace(/entries\[\d+\|/, `[${toKeep.length}|`)
  lines.splice(headerIdx + 1, entryLines.length, ...toKeep.map((l) => `  ${l}`))
  writeMemory(lines.join("\n"))
  
  return { archived: toArchive.length, kept: toKeep.length }
}

const server = new McpServer(
  { name: "toon-memory", version: "1.1.0" },
  { capabilities: { tools: { listChanged: true } } }
)

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
    },
  },
  async ({ category, key, content, file, tags }) => {
    const data = readMemory()
    const id = generateId()
    const date = new Date().toISOString().split("T")[0]
    const lines = data.split("\n")

    let headerIdx = lines.findIndex((l) => l.startsWith("entries["))
    if (headerIdx === -1) {
      lines.push(`entries[0|]{id|category|key|content|file|tags|date}:`)
      headerIdx = lines.length - 1
    }

    const match = lines[headerIdx].match(/entries\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    const newEntry = `${id}|${category}|${key}|${content}|${file || ""}|${tags || ""}|${date}`

    lines.splice(headerIdx + 1, 0, `  ${newEntry}`)
    lines[headerIdx] = lines[headerIdx].replace(/entries\[\d+\|/, `[${count + 1}|`)

    writeMemory(lines.join("\n"))
    return {
      content: [{ type: "text" as const, text: `🧠 Guardado: ${category}/${key} (${id})\n${content}` }],
    }
  }
)

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
    },
  },
  async ({ query, category, from_date, to_date }) => {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|"))
    const queryLower = query.toLowerCase()

    const results = lines
      .map((line) => {
        const trimmed = line.trim()
        const parts = trimmed.split("|")
        if (parts.length < 7) return null
        const [id, cat, key, content, file, tags, date] = parts
        if (category && cat !== category) return null
        if (from_date && date < from_date) return null
        if (to_date && date > to_date) return null
        const searchStr = `${id} ${cat} ${key} ${content} ${file} ${tags}`.toLowerCase()
        if (!searchStr.includes(queryLower)) return null
        return { id, cat, key, content, file, tags, date }
      })
      .filter(Boolean)

    if (results.length === 0) {
      return { content: [{ type: "text" as const, text: `No se encontraron resultados para "${query}"` }] }
    }

    const formatted = results
      .map((r) => `[${r!.cat}] ${r!.key} (${r!.id})\n  ${r!.content}\n  File: ${r!.file} | Tags: ${r!.tags} | Date: ${r!.date}`)
      .join("\n\n")

    return { content: [{ type: "text" as const, text: formatted }] }
  }
)

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
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))

    if (headerIdx === -1) {
      return { content: [{ type: "text" as const, text: "No hay entradas en memoria" }] }
    }

    const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0)
    const filtered = entryLines.filter((l) => {
      const parts = l.trim().split("|")
      return parts[0] !== key && parts[2] !== key
    })

    const removed = entryLines.length - filtered.length
    const match = lines[headerIdx].match(/entries\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    lines[headerIdx] = lines[headerIdx].replace(/entries\[\d+\|/, `[${count - removed}|`)
    lines.splice(headerIdx + 1, entryLines.length, ...filtered.map((l) => `  ${l.trim()}`))

    writeMemory(lines.join("\n"))
    return {
      content: [{ type: "text" as const, text: `"${key}" eliminado. Quedan ${count - removed} entradas.` }],
    }
  }
)

server.registerTool(
  "memory_stats",
  {
    title: "Memory Stats",
    description: "Muestra estadísticas de la memoria del proyecto.",
    inputSchema: {},
  },
  async () => {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|"))
    const entries = lines.map((l) => {
      const parts = l.trim().split("|")
      return { category: parts[1] || "unknown" }
    })

    const byCategory: Record<string, number> = {}
    for (const e of entries) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1
    }

    const summaryLines = data.split("\n").filter((l) => l.includes(":") && !l.startsWith("  ") && !l.startsWith("version") && !l.startsWith("entries"))
    const stats = [
      `Entradas totales: ${entries.length}`,
      `Resúmenes de archivos: ${summaryLines.length}`,
      "",
      "Por categoría:",
      ...Object.entries(byCategory).map(([k, v]) => `  ${k}: ${v}`),
      "",
      `Últimas 5 entradas:`,
      ...lines.slice(-5).map((l) => {
        const parts = l.trim().split("|")
        return `  [${parts[1]}] ${parts[2]} (${parts[0]})`
      }),
    ]

    return { content: [{ type: "text" as const, text: stats.join("\n") }] }
  }
)

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

const transport = new StdioServerTransport()
await server.connect(transport)
