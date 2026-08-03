import { dirname } from "path"
import { fileURLToPath } from "url"
import { fileImportURL } from "./entry"

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

if (args[0] === "mcp") {
  await import(fileImportURL(__dirname, "..", "mcp", "server.js"))
} else {
  process.argv = ["node", "toon-memory", ...args]
  await import(fileImportURL(__dirname, "..", "dist", "cli", "setup.js"))
}
