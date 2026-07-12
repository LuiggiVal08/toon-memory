#!/usr/bin/env node
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

if (args[0] === "mcp") {
  await import(join(__dirname, "..", "mcp", "server.js"))
} else {
  process.argv = ["node", "toon-memory", ...args]
  await import(join(__dirname, "..", "dist", "cli", "setup.js"))
}
