import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, rmSync } from "fs"
import { basename, dirname, join } from "path"
import { checkbox, select, confirm } from "@inquirer/prompts"
import { extractProjectDeps } from "../lib/vocab"
import type { Agent } from "./types"
import { projectRoot, INSTRUCTION_CONTENT, ANTIGRAVITY_HOOK_NAME } from "./constants"
import { detectAgents, resolvePackageJson } from "./agents"
import { installMemoryDir, ensureGitignore, dumpMemoryMarkdown } from "./memory"
import { installMCPConfig, updateMemoryConfig } from "./config-writer"
import { installInstructions } from "./instructions"
import { installHooks, registerAntigravityHooks } from "./hooks"
import { installOpenCodePlugin } from "./opencode-plugin"

const MEMORY_DIR = join(projectRoot, ".toon-memory", "memory")
const CAPTURE_CONFIG = join(MEMORY_DIR, "config.json")

/** Interactive multi-select for agents using @inquirer/prompts. */
export async function promptAgentSelection(agents: Agent[]): Promise<Agent[]> {
  return checkbox({
    message: "¿Qué agentes quieres configurar?",
    choices: agents.map((a) => ({
      name: `${a.name} (${a.format === "none" ? "instrucciones" : a.global ? "local/global" : "solo local"})`,
      value: a,
      checked: true
    }))
  })
}

/**
 * Install everything for a single agent.
 */
export function installForAgent(agent: Agent, scope: string): void {
  console.log(`${agent.name}:`)
  installMCPConfig(agent, scope)
  installInstructions(agent)
  if (agent.needsPlugin) installOpenCodePlugin(agent)
  else if (agent.name === "antigravity") registerAntigravityHooks(agent)
  else installHooks(agent)
}

/**
 * Initialize toon-memory. Behaviour depends on flags and TTY:
 *
 *  - `--agent` flag → non-interactive install for the listed agents
 *  - No `--agent`, TTY present → interactive checkbox + scope prompt
 *  - No `--agent`, no TTY → install for ALL agents (CI fallback)
 */
export async function init(scope?: string, agentFilter?: string[]): Promise<void> {
  console.log("\n🧠 toon-memory init\n")

  installMemoryDir()

  const deps = extractProjectDeps(projectRoot)
  const depCount = Object.keys(deps).length
  if (depCount > 0) {
    updateMemoryConfig({ vocab: deps })
    console.log(`  Detected ${depCount} dependencies → auto-tag vocabulary written to config.json`)
  }

  const agents = detectAgents()
  let selected: Agent[]
  let finalScope = scope || "local"

  if (agentFilter && agentFilter.length > 0) {
    selected = agents.filter((a) => agentFilter.includes(a.name.toLowerCase()))
    if (selected.length === 0) {
      console.log(`Agentes no encontrados: ${agentFilter.join(", ")}`)
      console.log(`Disponibles: ${agents.map((a) => a.name).join(", ")}`)
      process.exit(1)
    }
  } else if (process.stdin.isTTY) {
    selected = await promptAgentSelection(agents)
    if (selected.length === 0) {
      console.log("\nNo se seleccionaron agentes. Nada instalado.\n")
      return
    }
    finalScope = await select({
      message: "Alcance:",
      choices: [
        { name: "Local (proyecto)", value: "local" },
        { name: "Global (~home)", value: "global" }
      ],
      default: finalScope as "local" | "global"
    })
    const ok = await confirm({ message: "¿Proceder?", default: true })
    if (!ok) {
      console.log("\nInstalación cancelada.\n")
      return
    }
  } else {
    selected = agents
  }

  console.log(`\nInstalando (${finalScope}) — ${selected.map((a) => a.name).join(", ")}...\n`)

  for (const agent of selected) {
    installForAgent(agent, finalScope)
    console.log("")
  }

  ensureGitignore()

  console.log("Done! Restart your agent to use memory tools.\n")
}

/**
 * Uninstall toon-memory from all detected agents.
 */
export function uninstall(): void {
  console.log("\n🧠 toon-memory uninstaller\n")

  const agents = detectAgents()

  for (const agent of agents) {
    if (agent.format === "json" || agent.format === "jsonc") {
      const configs = [agent.global, agent.local].filter(Boolean) as string[]

      for (const configPath of configs) {
        if (!existsSync(configPath)) continue

        try {
          let config: Record<string, any>
          if (agent.format === "jsonc") {
            const raw = readFileSync(configPath, "utf-8")
            const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
            config = JSON.parse(stripped)
          } else {
            config = JSON.parse(readFileSync(configPath, "utf-8"))
          }

          const mcpKey = agent.mcpKey || "mcpServers"

          if (config[mcpKey]?.["toon-memory"]) {
            delete config[mcpKey]["toon-memory"]
            writeFileSync(configPath, JSON.stringify(config, null, 2))
            console.log(`  Removed MCP from ${agent.name} (${configPath})`)
          }
        } catch {}
      }
    }

    if (agent.format === "toml" && agent.local && existsSync(agent.local)) {
      try {
        let content = readFileSync(agent.local, "utf-8")
        content = content.replace(/\[mcpServers\.toon-memory\][\s\S]*?(?=\n\[|$)/, "").trim() + "\n"
        writeFileSync(agent.local, content)
        console.log(`  Removed MCP from ${agent.name} (${agent.local})`)
      } catch {}
    }
  }

  for (const agent of agents) {
    if (agent.instructionFile && existsSync(agent.instructionFile)) {
      try {
        const content = readFileSync(agent.instructionFile, "utf-8")
        if (content.includes(INSTRUCTION_CONTENT.trim()) && content.length < INSTRUCTION_CONTENT.length + 100) {
          unlinkSync(agent.instructionFile)
          console.log(`  Removed ${agent.instructionFile}`)
        }
      } catch {}
    }
  }

  const hookDir = join(projectRoot, ".toon-memory", "hooks")
  if (existsSync(hookDir)) {
    rmSync(hookDir, { recursive: true, force: true })
    console.log("  Removed .toon-memory/hooks/")
  }

  const toolsFile = join(projectRoot, ".opencode", "tools", "memory.ts")
  if (existsSync(toolsFile)) {
    unlinkSync(toolsFile)
    console.log("  Removed .opencode/tools/memory.ts")
  }

  const ocPlugin = join(projectRoot, ".opencode", "plugins", "toon-memory.ts")
  if (existsSync(ocPlugin)) {
    unlinkSync(ocPlugin)
    console.log("  Removed .opencode/plugins/toon-memory.ts")
  }

  const agyHooks = join(projectRoot, ".gemini", "config", "hooks.json")
  if (existsSync(agyHooks)) {
    try {
      const agyCfg = JSON.parse(readFileSync(agyHooks, "utf-8"))
      if (agyCfg[ANTIGRAVITY_HOOK_NAME]) {
        delete agyCfg[ANTIGRAVITY_HOOK_NAME]
        if (Object.keys(agyCfg).length === 0) {
          unlinkSync(agyHooks)
          console.log("  Removed .gemini/config/hooks.json")
        } else {
          writeFileSync(agyHooks, JSON.stringify(agyCfg, null, 2))
          console.log("  Removed toon-memory hook from .gemini/config/hooks.json")
        }
      }
    } catch {
      unlinkSync(agyHooks)
      console.log("  Removed .gemini/config/hooks.json")
    }
  }

  console.log("\n✅ toon-memory uninstalled from all agents\n")
}

/**
 * Show toon-memory installation status.
 */
export function status(): void {
  console.log("\n🧠 toon-memory status\n")

  const pkgPath = resolvePackageJson()
  let version = "unknown"
  if (pkgPath) {
    try {
      version = JSON.parse(readFileSync(pkgPath, "utf-8")).version
    } catch {}
  }
  console.log(`Version: ${version}`)

  const memoryFile = join(MEMORY_DIR, "data.toon")
  if (existsSync(memoryFile)) {
    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n").filter((l: string) => l.startsWith("  ") && l.includes("|"))
    console.log(`Memory: ${lines.length} entries`)
  } else {
    console.log("Memory: not initialized")
  }

  let capture = false
  if (process.env.TOON_MEMORY_CAPTURE) capture = true
  else if (existsSync(CAPTURE_CONFIG)) {
    try {
      const c = JSON.parse(readFileSync(CAPTURE_CONFIG, "utf-8"))
      if (c.capture) capture = true
    } catch {}
  }
  console.log(`Capture: ${capture ? "enabled" : "disabled (opt-in)"}`)

  const agents = detectAgents()
  console.log("\nAgent configs:")

  for (const agent of agents) {
    let configured = false

    if (agent.format === "json" || agent.format === "jsonc") {
      const configs = [agent.global, agent.local].filter(Boolean) as string[]

      for (const configPath of configs) {
        if (!existsSync(configPath)) continue

        try {
          let config: Record<string, any>
          if (agent.format === "jsonc") {
            const raw = readFileSync(configPath, "utf-8")
            const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
            config = JSON.parse(stripped)
          } else {
            config = JSON.parse(readFileSync(configPath, "utf-8"))
          }

          if (config[agent.mcpKey]?.["toon-memory"]) {
            configured = true
          }
        } catch {}
      }
    }

    if (agent.format === "toml" && agent.local && existsSync(agent.local)) {
      const content = readFileSync(agent.local, "utf-8")
      if (content.includes("toon-memory")) configured = true
    }

    const hasInstructions = agent.instructionFile ? existsSync(agent.instructionFile) : false

    const hookPath = join(projectRoot, ".toon-memory", "hooks", `session-start-${agent.name}.sh`)
    let hasHooks = existsSync(hookPath)
    if (agent.needsPlugin) {
      hasHooks = existsSync(join(projectRoot, ".opencode", "plugins", "toon-memory.ts"))
    }

    if (agent.format === "none") {
      console.log(`  ${hasInstructions ? "✅" : "❌"} ${agent.name} (instructions only)`)
    } else {
      const mcpStatus = configured ? "✅" : "❌"
      const instrStatus = agent.needsInstructions ? (hasInstructions ? " 📝" : "") : ""
      const hookStatus = (agent.needsHooks || agent.needsPlugin) ? (hasHooks ? " 🪝" : "") : ""
      console.log(`  ${mcpStatus} ${agent.name}${instrStatus}${hookStatus}`)
    }
  }

  console.log("")
}

/**
 * Upgrade toon-memory to the latest version.
 */
export function upgrade(): void {
  console.log("\n🧠 toon-memory upgrade\n")

  try {
    const pkgPath = resolvePackageJson()
    const currentVersion = pkgPath ? JSON.parse(readFileSync(pkgPath, "utf-8")).version : "unknown"

    console.log(`Current version: ${currentVersion}`)
    console.log("\nTo upgrade, run:")
    console.log("  npm install -g toon-memory@latest")
    console.log("\nThen restart your agent.\n")
  } catch {
    console.log("To upgrade, run:")
    console.log("  npm install -g toon-memory@latest")
    console.log("\nThen restart your agent.\n")
  }
}

/**
 * Display memory statistics.
 */
export function stats(): void {
  console.log("\n🧠 toon-memory stats\n")

  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(memoryFile)) {
    console.log("Memory not initialized. Run 'npx toon-memory init' first.\n")
    return
  }

  const data = readFileSync(memoryFile, "utf-8")
  const lines = data.split("\n").filter((l: string) => l.startsWith("  ") && l.includes("|"))

  const categories: Record<string, number> = {}
  let latestDate = ""

  for (const line of lines) {
    const parts = line.trim().split("|")
    if (parts.length >= 7) {
      const category = parts[1]
      const date = parts[6]
      categories[category] = (categories[category] || 0) + 1
      if (date > latestDate) latestDate = date
    }
  }

  console.log("📊 Memory Stats")
  console.log("━".repeat(20))
  console.log(`Total entries: ${lines.length}`)

  for (const [cat, count] of Object.entries(categories)) {
    console.log(`├── ${cat}: ${count}`)
  }

  console.log(`Last updated: ${latestDate || "never"}`)

  const fileSize = Buffer.byteLength(data, "utf-8")
  console.log(`File size: ${(fileSize / 1024).toFixed(1)} KB`)
  console.log("")
}

/**
 * Export memory to JSON format.
 */
export function exportMemory(): void {
  console.log("\n🧠 toon-memory export\n")

  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(memoryFile)) {
    console.log("Memory not initialized. Run 'npx toon-memory init' first.\n")
    return
  }

  const data = readFileSync(memoryFile, "utf-8")
  const lines = data.split("\n").filter((l: string) => l.startsWith("  ") && l.includes("|"))

  const entries = lines.map((line: string) => {
    const parts = line.trim().split("|")
    return {
      id: parts[0],
      category: parts[1],
      key: parts[2],
      content: parts[3],
      file: parts[4],
      tags: parts[5] ? parts[5].split(";") : [],
      date: parts[6]
    }
  })

  const exportData = {
    project: basename(projectRoot),
    exported_at: new Date().toISOString(),
    entries,
    summaries: {}
  }

  const outputPath = join(projectRoot, "toon-memory-export.json")
  writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

  console.log(`Exported ${entries.length} entries to:`)
  console.log(`  ${outputPath}\n`)
}

/**
 * Import memory from JSON file.
 */
export function importMemory(): void {
  console.log("\n🧠 toon-memory import\n")

  const importFile = process.argv[3]

  if (!importFile) {
    console.log("Usage: npx toon-memory import <file.json>\n")
    return
  }

  const importPath = importFile.startsWith("/") ? importFile : join(projectRoot, importFile)

  if (!existsSync(importPath)) {
    console.log(`File not found: ${importPath}\n`)
    return
  }

  let importData: any
  try {
    importData = JSON.parse(readFileSync(importPath, "utf-8"))
  } catch {
    console.log("Invalid JSON file\n")
    return
  }

  if (!importData.entries || !Array.isArray(importData.entries)) {
    console.log("Invalid format: missing 'entries' array\n")
    return
  }

  const memoryFile = join(MEMORY_DIR, "data.toon")

  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })

  let existingKeys: string[] = []
  if (existsSync(memoryFile)) {
    const existing = readFileSync(memoryFile, "utf-8")
    existingKeys = existing.split("\n")
      .filter((l: string) => l.startsWith("  ") && l.includes("|"))
      .map((l: string) => l.trim().split("|")[2])
  }

  const newEntries = importData.entries.filter((e: any) => !existingKeys.includes(e.key))

  if (newEntries.length === 0) {
    console.log("No new entries to import (all keys already exist)\n")
    return
  }

  const newLines = newEntries.map((e: any) => {
    const tags = Array.isArray(e.tags) ? e.tags.join(";") : (e.tags || "")
    return `  ${e.id}|${e.category}|${e.key}|${e.content}|${e.file}|${tags}|${e.date}`
  }).join("\n")

  if (existsSync(memoryFile)) {
    const existing = readFileSync(memoryFile, "utf-8")
    const existingCount = existing.split("\n")
      .filter((l: string) => l.startsWith("  ") && l.includes("|")).length
    const updated = existing.replace(
      /entries\[\d+\|]/,
      `entries[${existingCount + newEntries.length}|]`
    ) + "\n" + newLines
    writeFileSync(memoryFile, updated)
  } else {
    writeFileSync(memoryFile, `version: 1\nentries[${newEntries.length}|]{id|category|key|content|file|tags|date}:\n${newLines}\n`)
  }

  console.log(`Imported ${newEntries.length} new entries`)
  console.log(`Skipped ${importData.entries.length - newEntries.length} duplicates\n`)
}

/**
 * Print the project memory as injectable markdown.
 */
export function dumpMemory(): void {
  console.log(dumpMemoryMarkdown())
}

/**
 * Guided interactive installer.
 */
export async function interactiveInstall(): Promise<void> {
  if (!process.stdin.isTTY) {
    console.log("\n🧠 toon-memory — la instalación interactiva requiere una terminal.")
    console.log("Ejecuta 'toon-memory init [--agent <nombre>]' para instalación no interactiva.\n")
    return
  }

  const agents = detectAgents()
  const selected = await promptAgentSelection(agents)
  if (selected.length === 0) {
    console.log("\nNo se seleccionaron agentes. Nada instalado.\n")
    return
  }

  const scope = await select({
    message: "Alcance:",
    choices: [
      { name: "Local (proyecto)", value: "local" },
      { name: "Global (~home)", value: "global" }
    ]
  })

  const ok = await confirm({ message: "¿Proceder?", default: true })
  if (!ok) {
    console.log("\nInstalación cancelada.\n")
    return
  }

  console.log(`\nInstalando (${scope}) — ${selected.map((a) => a.name).join(", ")}...\n`)
  installMemoryDir()

  const deps = extractProjectDeps(projectRoot)
  if (Object.keys(deps).length > 0) {
    updateMemoryConfig({ vocab: deps })
    console.log(`  Detected ${Object.keys(deps).length} dependencies → auto-tag vocabulary written to config.json`)
  }

  for (const agent of selected) {
    installForAgent(agent, scope)
    console.log("")
  }

  ensureGitignore()

  console.log("Done! Restart your agent to use memory tools.")
  console.log("Run 'npx toon-memory uninstall' to remove.\n")
}
