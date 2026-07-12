import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, unlinkSync, readdirSync, statSync } from "fs"
import { basename, dirname, join } from "path"
import { fileURLToPath } from "url"
import { createInterface } from "readline"
import { gzipSync, gunzipSync } from "zlib"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = process.cwd()
// When compiled to dist/cli/, src is at ../../src
// When running directly from src/cli/, src is at ../src
const sourceDir = join(__dirname, "..", "..", "src")
const HOME = process.env.HOME || process.env.USERPROFILE || "~"

/** Supported AI coding agent configuration */
interface Agent {
  /** Agent identifier (e.g., "opencode", "vscode/copilot") */
  name: string
  /** Global config file path (e.g., ~/.config/opencode/opencode.json) */
  global?: string
  /** Local (project-level) config file path (e.g., .opencode/opencode.json) */
  local?: string
  /** JSON key where MCP servers are stored */
  mcpKey: string
}

/**
 * Detect all supported AI coding agents on the system.
 * 
 * Scans for configuration files in both global (~/.config/) and local
 * (.opencode/, .vscode/, etc.) locations.
 * 
 * @returns Array of detected agent configurations
 * 
 * @example
 * ```typescript
 * const agents = detectAgents()
 * for (const agent of agents) {
 *   console.log(`${agent.name}: ${agent.local || "not found"}`)
 * }
 * ```
 */
function detectAgents(): Agent[] {
  const agents: Agent[] = []
  
  // OpenCode
  const opencodeGlobal = join(HOME, ".config", "opencode", "opencode.json")
  const opencodeLocal = join(projectRoot, ".opencode", "opencode.json")
  agents.push({ 
    name: "opencode", 
    global: opencodeGlobal, 
    local: opencodeLocal,
    mcpKey: "mcp"
  })
  
  // VS Code / GitHub Copilot
  const vscodeLocal = join(projectRoot, ".vscode", "mcp.json")
  agents.push({ 
    name: "vscode/copilot", 
    local: vscodeLocal,
    mcpKey: "servers"
  })
  
  // Claude Code
  const claudeGlobal = join(HOME, ".claude", "settings.json")
  const claudeLocal = join(projectRoot, ".claude", "settings.json")
  agents.push({ 
    name: "claude", 
    global: claudeGlobal, 
    local: claudeLocal,
    mcpKey: "mcpServers"
  })
  
  // Cursor
  const cursorLocal = join(projectRoot, ".cursor", "mcp.json")
  agents.push({ 
    name: "cursor", 
    local: cursorLocal,
    mcpKey: "mcpServers"
  })
  
  // Windsurf
  const windsurfGlobal = join(HOME, ".codeium", "windsurf", "mcp_config.json")
  agents.push({ 
    name: "windsurf", 
    global: windsurfGlobal,
    mcpKey: "mcpServers"
  })
  
  // Cline
  const clineLocal = join(projectRoot, ".cline", "mcp.json")
  agents.push({ 
    name: "cline", 
    local: clineLocal,
    mcpKey: "mcpServers"
  })
  
  // Continue
  const continueLocal = join(projectRoot, ".continue", "config.json")
  agents.push({ 
    name: "continue", 
    local: continueLocal,
    mcpKey: "mcpServers"
  })
  
  return agents
}

/**
 * Install memory directory for OpenCode.
 * 
 * Creates `.opencode/memory/` directory and initial `data.toon` if needed.
 * The MCP server handles all memory operations - no plugin needed.
 * 
 * @example
 * ```bash
 * npx toon-memory init  # Calls installOpenCodeTools()
 * ```
 */
function installOpenCodeTools(): void {
  const memoryDir = join(projectRoot, ".opencode", "memory")
  const memoryFile = join(memoryDir, "data.toon")

  if (!existsSync(memoryDir)) mkdirSync(memoryDir, { recursive: true })

  if (!existsSync(memoryFile)) {
    writeFileSync(memoryFile, "version: 1\n[0|]\n")
    console.log("  Created .opencode/memory/data.toon")
  }
}

/**
 * Add `.opencode/memory/` to `.gitignore` if not already present.
 * 
 * Creates `.gitignore` if it doesn't exist, or appends the memory
 * exclusion pattern to the existing file.
 * 
 * @example
 * ```typescript
 * ensureGitignore()  // Adds .opencode/memory/ to .gitignore
 * ```
 */
function ensureGitignore(): void {
  const gitignorePath = join(projectRoot, ".gitignore")
  const entry = ".opencode/memory/"
  
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, `${entry}\n`)
    console.log("  Created .gitignore with memory exclusion")
    return
  }
  
  const content = readFileSync(gitignorePath, "utf-8")
  if (!content.includes(entry)) {
    writeFileSync(gitignorePath, `${content.trim()}\n${entry}\n`)
    console.log("  Added .opencode/memory/ to .gitignore")
  }
}

/**
 * Install MCP server configuration for an agent.
 * 
 * Adds the `toon-memory` MCP server entry to the agent's config file.
 * 
 * @param agent - Agent configuration with config path and MCP key
 * @param scope - "global" or "local" installation scope
 * 
 * @example
 * ```typescript
 * const agent = { name: "opencode", local: ".opencode/opencode.json", mcpKey: "mcp" }
 * installMCPConfig(agent, "local")
 * ```
 */
function installMCPConfig(agent: Agent, scope: string): void {
  const configPath = scope === "global" ? agent.global : agent.local
  
  if (!configPath) {
    console.log(`  No ${scope} config path for ${agent.name}`)
    return
  }
  
  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })
  
  let config: Record<string, any> = {}
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"))
    } catch {
      config = {}
    }
  }
  
  const mcpKey = agent.mcpKey || "mcpServers"
  if (!config[mcpKey]) config[mcpKey] = {}
  
  // OpenCode uses a different format than other agents
  if (agent.name === "opencode") {
    config[mcpKey]["toon-memory"] = {
      enabled: true,
      type: "local",
      command: ["npx", "-y", "toon-memory", "mcp"]
    }
  } else {
    config[mcpKey]["toon-memory"] = {
      command: "npx",
      args: ["-y", "toon-memory", "mcp"]
    }
  }
  
  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  MCP server added to ${configPath}`)
}

/**
 * Uninstall toon-memory from all detected agents.
 * 
 * Removes MCP server configurations and custom tools from all agents.
 * 
 * @example
 * ```bash
 * npx toon-memory uninstall
 * ```
 */
function uninstall(): void {
  console.log("\n🧠 toon-memory uninstaller\n")
  
  const agents = detectAgents()
  
  for (const agent of agents) {
    const configs = [agent.global, agent.local].filter(Boolean) as string[]
    
    for (const configPath of configs) {
      if (!existsSync(configPath)) continue
      
      try {
        const config = JSON.parse(readFileSync(configPath, "utf-8"))
        const mcpKey = agent.mcpKey || "mcpServers"
        
        if (config[mcpKey]?.["toon-memory"]) {
          delete config[mcpKey]["toon-memory"]
          writeFileSync(configPath, JSON.stringify(config, null, 2))
          console.log(`  ✅ Removed from ${agent.name} (${configPath})`)
        }
      } catch {}
    }
  }
  
  // Remove custom tools
  const toolsFile = join(projectRoot, ".opencode", "tools", "memory.ts")
  if (existsSync(toolsFile)) {
    unlinkSync(toolsFile)
    console.log("  ✅ Removed .opencode/tools/memory.ts")
  }
  
  console.log("\n✅ toon-memory uninstalled from all agents\n")
}

/**
 * Initialize toon-memory for all detected agents (non-interactive).
 * 
 * Installs MCP server configs, creates memory directory, and
 * updates `.gitignore`.
 * 
 * @param scope - "local" (default) or "global" installation scope
 * 
 * @example
 * ```bash
 * npx toon-memory init          # Local install
 * npx toon-memory init global   # Global install
 * ```
 */
function init(scope: string = "local"): void {
  console.log("\n🧠 toon-memory init\n")
  
  const agents = detectAgents()
  
  for (const agent of agents) {
    console.log(`${agent.name}:`)
    
    if (agent.name === "opencode") {
      installOpenCodeTools()
    }
    
    installMCPConfig(agent, scope)
    console.log("")
  }
  
  ensureGitignore()
  
  console.log("Done! Restart your agent to use memory tools.\n")
}

/**
 * Show toon-memory installation status.
 * 
 * Displays version, memory entry count, and agent configuration status.
 * 
 * @example
 * ```bash
 * npx toon-memory status
 * ```
 */
function status(): void {
  console.log("\n🧠 toon-memory status\n")
  
  // Check npm package
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"))
    console.log(`Version: ${pkg.version}`)
  } catch {
    console.log("Version: unknown")
  }
  
  // Check memory file
  const memoryFile = join(projectRoot, ".opencode", "memory", "data.toon")
  if (existsSync(memoryFile)) {
    const data = readFileSync(memoryFile, "utf-8")
    const lines = data.split("\n").filter((l: string) => l.startsWith("  ") && l.includes("|"))
    console.log(`Memory: ${lines.length} entries`)
  } else {
    console.log("Memory: not initialized")
  }
  
  // Check agent configs
  const agents = detectAgents()
  console.log("\nAgent configs:")
  
  for (const agent of agents) {
    const configs = [agent.global, agent.local].filter(Boolean) as string[]
    let found = false
    
    for (const configPath of configs) {
      if (!existsSync(configPath)) continue
      
      try {
        const config = JSON.parse(readFileSync(configPath, "utf-8"))
        const mcpKey = agent.mcpKey || "mcpServers"
        
        if (config[mcpKey]?.["toon-memory"]) {
          console.log(`  ✅ ${agent.name} (${configPath})`)
          found = true
        }
      } catch {}
    }
    
    if (!found) {
      console.log(`  ❌ ${agent.name} (not configured)`)
    }
  }
  
  console.log("")
}

/**
 * Upgrade toon-memory to the latest version.
 * 
 * Checks npm registry for updates and installs if available.
 * 
 * @example
 * ```bash
 * npx toon-memory upgrade
 * ```
 */
function upgrade(): void {
  console.log("\n🧠 toon-memory upgrade\n")
  
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"))
    const currentVersion = pkg.version
    
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
 * 
 * Shows entry counts by category, last update date, and file size.
 * 
 * @example
 * ```bash
 * npx toon-memory stats
 * ```
 */
function stats(): void {
  console.log("\n🧠 toon-memory stats\n")
  
  const memoryFile = join(projectRoot, ".opencode", "memory", "data.toon")
  
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
 * 
 * Creates a `toon-memory-export.json` file with all entries
 * for backup or transfer to another project.
 * 
 * @example
 * ```bash
 * npx toon-memory export
 * ```
 */
function exportMemory(): void {
  console.log("\n🧠 toon-memory export\n")
  
  const memoryFile = join(projectRoot, ".opencode", "memory", "data.toon")
  
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
 * 
 * Imports entries from a JSON export, skipping duplicates based on key.
 * 
 * @param file - Path to JSON file (relative or absolute)
 * 
 * @example
 * ```bash
 * npx toon-memory import toon-memory-export.json
 * ```
 */
function importMemory(): void {
  console.log("\n🧠 toon-memory import\n")
  
  const importFile = process.argv[3]
  
  if (!importFile) {
    console.log("Usage: npx toon-memory import <file.json>\n")
    return
  }
  
  // Use absolute path if provided, otherwise resolve relative to project root
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
  
  const memoryDir = join(projectRoot, ".opencode", "memory")
  const memoryFile = join(memoryDir, "data.toon")
  
  if (!existsSync(memoryDir)) mkdirSync(memoryDir, { recursive: true })
  
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
    const updated = existing.replace(
      /entries\[\d+\|]/,
      `entries[${newEntries.length}|]`
    ) + "\n" + newLines
    writeFileSync(memoryFile, updated)
  } else {
    writeFileSync(memoryFile, `version: 1\nentries[${newEntries.length}|]{id|category|key|content|file|tags|date}:\n${newLines}\n`)
  }
  
  console.log(`Imported ${newEntries.length} new entries`)
  console.log(`Skipped ${importData.entries.length - newEntries.length} duplicates\n`)
}

/** Watch mode options */
interface WatchOptions {
  /** Backup interval in minutes (default: 5) */
  interval: number
  /** Maximum number of backups to keep (0 = unlimited) */
  maxBackups: number
  /** Enable gzip compression for backups */
  compress: boolean
  /** Enable file logging */
  logFile: boolean
  /** Log file path */
  logPath: string
}

/** Parse watch CLI arguments into WatchOptions */
function parseWatchOptions(args: string[]): WatchOptions {
  const opts: WatchOptions = {
    interval: 5,
    maxBackups: 10,
    compress: false,
    logFile: false,
    logPath: ""
  }
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--compress" || arg === "-c") {
      opts.compress = true
    } else if (arg === "--log" || arg === "-l") {
      opts.logFile = true
      opts.logPath = args[++i] || join(projectRoot, ".opencode", "memory", "watch.log")
    } else if (arg === "--max-backups" || arg === "-m") {
      opts.maxBackups = parseInt(args[++i]) || 10
    } else if (!arg.startsWith("-")) {
      opts.interval = parseInt(arg) || 5
    }
  }
  
  return opts
}

/** Write a line to the watch log file */
function writeWatchLog(logPath: string, message: string): void {
  if (!logPath) return
  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] ${message}\n`
  writeFileSync(logPath, logLine, { flag: "a" })
}

/** Get list of backup files sorted by creation time (oldest first) */
function getBackupFiles(backupDir: string): string[] {
  if (!existsSync(backupDir)) return []
  
  return readdirSync(backupDir)
    .filter(f => f.startsWith("backup-") && (f.endsWith(".toon") || f.endsWith(".gz")))
    .map(f => join(backupDir, f))
    .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs)
}

/** Remove oldest backups if we exceed maxBackups */
function pruneBackups(backupDir: string, maxBackups: number): number {
  if (maxBackups <= 0) return 0
  
  const files = getBackupFiles(backupDir)
  const excess = files.length - maxBackups
  
  if (excess <= 0) return 0
  
  for (let i = 0; i < excess; i++) {
    unlinkSync(files[i])
  }
  
  return excess
}

/** Compress content with gzip */
function compressData(data: string): Buffer {
  return gzipSync(Buffer.from(data, "utf-8"))
}

/** Decompress gzip data to string */
function decompressData(data: Buffer): string {
  return gunzipSync(data).toString("utf-8")
}

/**
 * Watch mode - backup memory every N minutes
 * 
 * @example
 * ```bash
 * npx toon-memory watch          # Default: 5 min interval, 10 max backups
 * npx toon-memory watch 10       # 10 minute interval
 * npx toon-memory watch -c       # Enable compression
 * npx toon-memory watch -l       # Enable file logging
 * npx toon-memory watch -m 20    # Keep max 20 backups
 * npx toon-memory watch 15 -c -l -m 5  # All options
 * ```
 */
function watch(): void {
  console.log("\n🧠 toon-memory watch\n")
  
  const memoryFile = join(projectRoot, ".opencode", "memory", "data.toon")
  const backupDir = join(projectRoot, ".opencode", "memory", "backups")
  
  if (!existsSync(memoryFile)) {
    console.log("Memory not initialized. Run 'npx toon-memory init' first.\n")
    return
  }
  
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true })
  
  const opts = parseWatchOptions(args)
  
  if (opts.logFile) {
    const logDir = dirname(opts.logPath)
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })
  }
  
  console.log(`Watching memory file every ${opts.interval} minutes...`)
  console.log(`Max backups: ${opts.maxBackups === 0 ? "unlimited" : opts.maxBackups}`)
  console.log(`Compression: ${opts.compress ? "enabled" : "disabled"}`)
  console.log(`Logging: ${opts.logFile ? `enabled (${opts.logPath})` : "disabled"}`)
  console.log(`Press Ctrl+C to stop\n`)
  
  let lastContent = readFileSync(memoryFile, "utf-8")
  let lastHash = hashContent(lastContent)
  let backupCount = 0
  
  if (opts.logFile) writeWatchLog(opts.logPath, "Watch started")
  
  const backup = () => {
    try {
      const currentContent = readFileSync(memoryFile, "utf-8")
      const currentHash = hashContent(currentContent)
      
      if (currentHash !== lastHash) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        const ext = opts.compress ? ".toon.gz" : ".toon"
        const backupFile = join(backupDir, `backup-${timestamp}${ext}`)
        
        if (opts.compress) {
          writeFileSync(backupFile, compressData(currentContent))
        } else {
          writeFileSync(backupFile, currentContent)
        }
        
        backupCount++
        console.log(`📦 Backup #${backupCount} created: ${timestamp}`)
        if (opts.logFile) writeWatchLog(opts.logPath, `Backup #${backupCount}: ${timestamp}`)
        
        lastContent = currentContent
        lastHash = currentHash
        
        const pruned = pruneBackups(backupDir, opts.maxBackups)
        if (pruned > 0) {
          console.log(`🗑️  Pruned ${pruned} old backup(s)`)
          if (opts.logFile) writeWatchLog(opts.logPath, `Pruned ${pruned} old backup(s)`)
        }
      }
    } catch (err) {
      const msg = `Error creating backup: ${(err as Error).message}`
      console.error(`❌ ${msg}`)
      if (opts.logFile) writeWatchLog(opts.logPath, msg)
    }
  }
  
  /** Simple hash for change detection (not cryptographic) */
  function hashContent(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }
  
  // Initial backup
  backup()
  
  // Set interval
  const interval = setInterval(backup, opts.interval * 60 * 1000)
  
  // Handle Ctrl+C
  process.on("SIGINT", () => {
    clearInterval(interval)
    console.log(`\n✅ Watch stopped. ${backupCount} backups created.\n`)
    if (opts.logFile) writeWatchLog(opts.logPath, `Watch stopped. ${backupCount} backups created.`)
    process.exit(0)
  })
  
  process.on("SIGTERM", () => {
    clearInterval(interval)
    process.exit(0)
  })
}

// Main
const args = process.argv.slice(2)

if (args[0] === "uninstall") {
  uninstall()
  process.exit(0)
}

if (args[0] === "init") {
  init(args[1] || "local")
  process.exit(0)
}

if (args[0] === "status") {
  status()
  process.exit(0)
}

if (args[0] === "upgrade") {
  upgrade()
  process.exit(0)
}

if (args[0] === "stats") {
  stats()
  process.exit(0)
}

if (args[0] === "export") {
  exportMemory()
  process.exit(0)
}

if (args[0] === "import") {
  importMemory()
  process.exit(0)
}

if (args[0] === "watch") {
  watch()
  process.exit(0)
}

const agents = detectAgents()
console.log("\n🧠 toon-memory installer\n")

console.log("Supported agents:")
agents.forEach((a: Agent, i: number) => console.log(`  ${i + 1}. ${a.name}`))
console.log("")

const rl = createInterface({ input: process.stdin, output: process.stdout })
rl.question("Install (1) Local or (2) Global? [1/2]: ", (answer: string) => {
  const scope = answer === "2" ? "global" : "local"
  console.log(`\nInstalling ${scope}ly...\n`)
  
  for (const agent of agents) {
    console.log(`${agent.name}:`)
    
    if (agent.name === "opencode") {
      installOpenCodeTools()
    }
    
    installMCPConfig(agent, scope)
    console.log("")
  }
  
  ensureGitignore()
  
  console.log("Done! Restart your agent to use memory tools.")
  console.log("Run 'npx toon-memory uninstall' to remove.\n")
  rl.close()
})
