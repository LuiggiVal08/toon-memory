import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { MEMORY_DIR, projectRoot } from "./constants"

/**
 * Install memory directory and initial data file.
 * Creates `.toon-memory/memory/` directory and initial `data.toon` if needed.
 */
export function installMemoryDir(): void {
  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })

  if (!existsSync(memoryFile)) {
    writeFileSync(memoryFile, "version: 1\n[0|]\n")
    console.log("  Created .toon-memory/memory/data.toon")
  }
}

/**
 * Add `.toon-memory/memory/` to `.gitignore` if not already present.
 */
export function ensureGitignore(): void {
  const gitignorePath = join(projectRoot, ".gitignore")
  const entries = [".toon-memory/memory/", ".opencode/instructions/memory-autoload.md"]

  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, `${entries.join("\n")}\n`)
    console.log("  Created .gitignore with memory exclusion")
    return
  }

  const content = readFileSync(gitignorePath, "utf-8")
  const missing = entries.filter((e) => !content.includes(e))
  if (missing.length > 0) {
    writeFileSync(gitignorePath, `${content.trim()}\n${missing.join("\n")}\n`)
    console.log(`  Added to .gitignore: ${missing.join(", ")}`)
  }
}

/**
 * Render the project memory as markdown ready to be injected into agent context.
 */
export function dumpMemoryMarkdown(): string {
  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(memoryFile)) {
    return "# toon-memory\n(empty)\n"
  }

  const data = readFileSync(memoryFile, "utf-8")
  const lines = data.split("\n").filter((l: string) => l.startsWith("  ") && l.includes("|"))

  const entries = lines.map((line: string) => {
    const parts = line.trim().split("|")
    return {
      id: parts[0] ?? "",
      category: parts[1] ?? "",
      key: parts[2] ?? "",
      content: parts[3] ?? "",
      file: parts[4] ?? "",
      tags: parts[5] ? parts[5].split(";").filter(Boolean) : [],
      date: parts[6] ?? "",
    }
  })

  const allLines = data.split("\n")
  const summaryIdx = allLines.findIndex((l: string) => l.trim().startsWith("summaries:"))
  const summaries: { file: string; summary: string }[] = []
  if (summaryIdx !== -1) {
    for (const sl of allLines.slice(summaryIdx + 1)) {
      if (!sl.includes(":") || !sl.startsWith("  ")) continue
      const idx = sl.indexOf(":")
      const file = sl.slice(0, idx).trim()
      const summary = sl.slice(idx + 1).trim()
      if (file && summary) summaries.push({ file, summary })
    }
  }

  if (entries.length === 0 && summaries.length === 0) {
    return "# toon-memory\n(empty)\n"
  }

  const out: string[] = ["# toon-memory (auto-loaded)", ""]

  for (const e of entries) {
    out.push(`## ${e.category}: ${e.key}`)
    out.push(e.content)
    if (e.file) out.push(`- file: ${e.file}`)
    if (e.tags.length) out.push(`- tags: ${e.tags.join(", ")}`)
    if (e.date) out.push(`- date: ${e.date}`)
    out.push("")
  }

  if (summaries.length > 0) {
    out.push("## file summaries")
    for (const s of summaries) {
      out.push(`- ${s.file}: ${s.summary}`)
    }
    out.push("")
  }

  return out.join("\n").trimEnd() + "\n"
}
