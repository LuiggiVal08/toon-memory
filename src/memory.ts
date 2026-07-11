import { tool } from "@opencode-ai/plugin"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { randomBytes } from "crypto"

const __dirname = dirname(fileURLToPath(import.meta.url))
const MEMORY_DIR = join(__dirname, "..", "memory")
const MEMORY_FILE = join(MEMORY_DIR, "data.toon")

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

export const memoryRemember = tool({
  description: "Guarda un hecho en la memoria persistente del proyecto (decisiones, patrones, bugs, conocimiento). Se recuerda entre sesiones.",
  args: {
    category: tool.schema.enum({
      description: "Categoría del hecho",
      options: ["decision", "pattern", "bug", "knowledge"],
    }),
    key: tool.schema.string({
      description: "Título corto en kebab-case (ej: risk-engine-prioridad)",
    }),
    content: tool.schema.string({
      description: "Contenido detallado del hecho",
    }),
    file: tool.schema.string({
      description: "Archivo o línea relacionada (ej: spec.md:145)",
    }),
    tags: tool.schema.string({
      description: "Tags separados por punto y coma (ej: risk;spec)",
    }),
  },
  async execute(args) {
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
    const newEntry = `${id}|${args.category}|${args.key}|${args.content}|${args.file || ""}|${args.tags || ""}|${date}`

    lines.splice(headerIdx + 1, 0, `  ${newEntry}`)
    lines[headerIdx] = lines[headerIdx].replace(/entries\[\d+\|/, `[${count + 1}|`)

    writeMemory(lines.join("\n"))
    return `🧠 Guardado: ${args.category}/${args.key} (${id})\n${args.content}`
  },
})

export const memoryRecall = tool({
  description: "Busca en la memoria persistente del proyecto. Devuelve entradas relevantes por categoría, tag, o texto libre. Usar ANTES de leer archivos para evitar re-investigar.",
  args: {
    query: tool.schema.string({
      description: "Texto a buscar (busca en key, content, tags)",
    }),
    category: tool.schema.string({
      description: "Filtrar por categoría (decision|pattern|bug|knowledge). Vacío = todos.",
    }),
  },
  async execute(args) {
    const data = readMemory()
    const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|"))
    const queryLower = args.query.toLowerCase()

    const results = lines
      .map((line) => {
        const trimmed = line.trim()
        const parts = trimmed.split("|")
        if (parts.length < 7) return null
        const [id, cat, key, content, file, tags, date] = parts
        if (args.category && cat !== args.category) return null
        const searchStr = `${id} ${cat} ${key} ${content} ${file} ${tags}`.toLowerCase()
        if (!searchStr.includes(queryLower)) return null
        return { id, cat, key, content, file, tags, date }
      })
      .filter(Boolean)

    if (results.length === 0) {
      return `No se encontraron resultados para "${args.query}"`
    }

    return results
      .map((r) => `[${r!.cat}] ${r!.key} (${r!.id})\n  ${r!.content}\n  File: ${r!.file} | Tags: ${r!.tags} | Date: ${r!.date}`)
      .join("\n\n")
  },
})

export const memoryForget = tool({
  description: "Elimina una entrada de la memoria por su key o id.",
  args: {
    key: tool.schema.string({
      description: "Key o id de la entrada a eliminar",
    }),
  },
  async execute(args) {
    const data = readMemory()
    const lines = data.split("\n")
    const headerIdx = lines.findIndex((l) => l.startsWith("entries["))

    if (headerIdx === -1) {
      return "No hay entradas en memoria"
    }

    const entryLines = lines.slice(headerIdx + 1).filter((l) => l.trim().length > 0)
    const filtered = entryLines.filter((l) => {
      const parts = l.trim().split("|")
      return parts[0] !== args.key && parts[2] !== args.key
    })

    const removed = entryLines.length - filtered.length
    const match = lines[headerIdx].match(/entries\[(\d+)\|/)
    const count = match ? parseInt(match[1]) : 0
    lines[headerIdx] = lines[headerIdx].replace(/entries\[\d+\|/, `[${count - removed}|`)
    lines.splice(headerIdx + 1, entryLines.length, ...filtered.map((l) => `  ${l.trim()}`))

    writeMemory(lines.join("\n"))
    return `"${args.key}" eliminado. Quedan ${count - removed} entradas.`
  },
})

export const memoryStats = tool({
  description: "Muestra estadísticas de la memoria: total entradas, por categoría, y resúmenes de archivos.",
  args: {},
  async execute() {
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

    return stats.join("\n")
  },
})

export const memorySummary = tool({
  description: "Guarda o recupera un resumen de un archivo grande. El agente puede leer el resumen en vez del archivo completo para ahorrar tokens.",
  args: {
    action: tool.schema.enum({
      description: "get para leer, set para guardar",
      options: ["get", "set"],
    }),
    file: tool.schema.string({
      description: "Ruta del archivo",
    }),
    summary: tool.schema.string({
      description: "Resumen del archivo (solo para set)",
    }),
  },
  async execute(args) {
    const data = readMemory()

    if (args.action === "get") {
      const lines = data.split("\n")
      const summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))
      if (summaryIdx === -1) {
        return `No hay resúmenes guardados para "${args.file}"`
      }

      const summaryLines = lines.slice(summaryIdx + 1).filter((l) => l.includes(":"))
      const match = summaryLines.find((l) => l.startsWith(`  ${args.file}:`))
      if (!match) {
        return `No hay resumen para "${args.file}"`
      }

      const summaryText = match.replace(`  ${args.file}: `, "")
      return summaryText
    }

    const lines = data.split("\n")
    let summaryIdx = lines.findIndex((l) => l.trim().startsWith("summaries:"))

    if (summaryIdx === -1) {
      lines.push("", "summaries:")
      summaryIdx = lines.length - 1
    }

    const summaryLines = lines.slice(summaryIdx + 1).filter((l) => l.includes(":"))
    const existingIdx = summaryLines.findIndex((l) => l.startsWith(`  ${args.file}:`))

    if (existingIdx !== -1) {
      summaryLines[existingIdx] = `  ${args.file}: ${args.summary}`
    } else {
      summaryLines.push(`  ${args.file}: ${args.summary}`)
    }

    lines.splice(summaryIdx + 1, lines.length - summaryIdx - 1, ...summaryLines)
    writeMemory(lines.join("\n"))
    return `📝 Resumen guardado para ${args.file}`
  },
})
