#!/usr/bin/env node
import { dirname, join } from "path"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

function getVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"))
    return pkg.version || "unknown"
  } catch {
    return "unknown"
  }
}

const HELP = `toon-memory — MCP memory server for AI coding agents

Usage:
  toon-memory <command> [scope]

Commands:
  init [local|global]   Install memory tools + hooks for detected agents
  status                Show version, memory count, and agent config status
  stats                 Show memory statistics
  dump                  Print memory as injectable markdown (auto-load)
  export [file]         Export memory to a TOON/JSON file
  import <file>         Import memory from a TOON/JSON file
  watch                 Watch memory file and re-render on change
  uninstall             Remove toon-memory from all agents
  capture <on|off>      Enable/disable activity capture hooks
  upgrade               Upgrade to the latest version

Options:
  -v, --version         Show version
  -h, --help            Show this help

MCP mode:
  toon-memory mcp       Run as an MCP server (stdio)
`

if (args[0] === "-v" || args[0] === "--version") {
  console.log(getVersion())
  process.exit(0)
}

if (args[0] === "-h" || args[0] === "--help") {
  console.log(HELP)
  process.exit(0)
}

if (args[0] === "mcp") {
  await import(join(__dirname, "..", "mcp", "server.js"))
} else {
  process.argv = ["node", "toon-memory", ...args]
  await import(join(__dirname, "..", "dist", "cli", "setup.js"))
}
