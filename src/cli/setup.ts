import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync, unlinkSync } from "fs"
import { basename, dirname, join } from "path"
import { fileURLToPath } from "url"
import { execSync } from "child_process"
import { createInterface } from "readline"
import { createRequire } from "module"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = process.cwd()
// When compiled to dist/cli/, src is at ../../src
// When running directly from src/cli/, src is at ../src
const sourceDir = join(__dirname, "..", "..", "src")
const HOME = process.env.HOME || process.env.USERPROFILE || "~"

interface Agent {
  name: string
  global?: string
  local?: string
  mcpKey: string
}

// Auto-install @toon-format/toon if not present
try {
  createRequire(import.meta.url).resolve("@toon-format/toon")
} catch {
  console.log("Installing @toon-format/toon...")
  execSync("npm install @toon-format/toon", { cwd: projectRoot, stdio: "inherit" })
}

// Detect all supported agents
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

// Install custom tools for OpenCode
function installOpenCodeTools(): void {
  const toolsDir = join(projectRoot, ".opencode", "tools")
  const memoryDir = join(projectRoot, ".opencode", "memory")
  const memoryFile = join(memoryDir, "data.toon")

  if (!existsSync(toolsDir)) mkdirSync(toolsDir, { recursive: true })
  if (!existsSync(memoryDir)) mkdirSync(memoryDir, { recursive: true })

  cpSync(join(sourceDir, "memory.ts"), join(toolsDir, "memory.ts"))
  console.log("  Copied memory.ts to .opencode/tools/")

  if (!existsSync(memoryFile)) {
    writeFileSync(memoryFile, "version: 1\nentries[0|]{id|category|key|content|file|tags|date}:\n")
    console.log("  Created .opencode/memory/data.toon")
  }
}

// Install MCP server config for different agents
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
  
  config[mcpKey]["toon-memory"] = {
    command: "npx",
    args: ["-y", "toon-memory", "mcp"]
  }
  
  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  MCP server added to ${configPath}`)
}

// Uninstall from all agents
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

// Quick init without interactive prompts
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
  
  console.log("Done! Restart your agent to use memory tools.\n")
}

// Show installation status
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

// Upgrade to latest version
function upgrade(): void {
  console.log("\n🧠 toon-memory upgrade\n")
  
  try {
    console.log("Checking for updates...")
    const latest = execSync("npm view toon-memory version", { encoding: "utf-8" }).trim()
    console.log(`Latest version: ${latest}`)
    
    console.log("Upgrading...")
    execSync("npm install -g toon-memory@" + latest, { stdio: "inherit" })
    
    console.log(`\n✅ Upgraded to toon-memory@${latest}`)
    console.log("Restart your agent to use the new version.\n")
  } catch (error) {
    console.error("Upgrade failed:", (error as Error).message)
  }
}

// Show memory statistics
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

// Export memory to JSON
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

// Import memory from JSON
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
  
  console.log("Done! Restart your agent to use memory tools.")
  console.log("Run 'npx toon-memory uninstall' to remove.\n")
  rl.close()
})
