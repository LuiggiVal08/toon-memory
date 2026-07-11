#!/usr/bin/env node
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { spawn } from "child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

const target = args[0] === "mcp"
  ? join(__dirname, "..", "mcp", "server.js")
  : join(__dirname, "..", "dist", "cli", "setup.js")

const extraArgs = args[0] === "mcp" ? [] : args
const child = spawn("node", [target, ...extraArgs], { stdio: "inherit" })
child.on("exit", (code) => process.exit(code ?? 0))
