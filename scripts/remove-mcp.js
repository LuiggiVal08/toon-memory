#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "fs"

const file = process.argv[2]

if (!file || !existsSync(file)) {
  process.exit(0)
}

try {
  const config = JSON.parse(readFileSync(file, "utf-8"))
  let modified = false

  if (config.mcp?.["toon-memory"]) {
    delete config.mcp["toon-memory"]
    modified = true
  } else if (config.mcpServers?.["toon-memory"]) {
    delete config.mcpServers["toon-memory"]
    modified = true
  }

  if (modified) {
    writeFileSync(file, JSON.stringify(config, null, 2))
    console.log(`  ✅ Removed from ${file}`)
  }
} catch {}
