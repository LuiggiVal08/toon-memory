import { spawnSync } from "child_process"
import confirm from "@inquirer/confirm"
import { loadConfig, saveConfig, VECTORS_FILE } from "../mcp/config"
import { readMemory } from "../mcp/memory-io"
import {
  buildVectors,
  denseDiagnostics,
  loadDenseModuleDetailed,
  rebuildVectors,
  readVectors,
} from "../lib/dense"

export const DEFAULT_DENSE_MODEL = "multilingual-e5-small"

async function buildFromCurrent(args: string[]): Promise<void> {
  const detailed = await loadDenseModuleDetailed()
  if (!detailed.module) {
    console.error(`Dense embedder not found (${detailed.spec}): ${detailed.error || "unavailable"}`)
    console.error("Run 'toon-memory dense install' first.")
    process.exitCode = 1
    return
  }
  const config = loadConfig()
  const stats = await rebuildVectors(readMemory(), detailed.module, config.dense?.model || DEFAULT_DENSE_MODEL, {
    force: args.includes("--force"),
  })
  console.log(
    `Vectors in ${VECTORS_FILE}: ${stats.written} built, ${stats.reused} reused, ${stats.removed} removed, dim ${stats.dim}.`
  )
}

export async function runDense(args: string[]): Promise<void> {
  const action = args[0] || "status"
  const config = loadConfig()
  const dense = config.dense || {}

  if (action === "enable") {
    const model = args[1] && !args[1].startsWith("--") ? args[1] : dense.model || DEFAULT_DENSE_MODEL
    saveConfig({ ...config, dense: { ...dense, enabled: true, model } })
    console.log(`Dense retrieval enabled (model: ${model}).`)
    if (args.includes("--build")) await buildFromCurrent(args)
    else console.log("Run 'toon-memory dense build' before relying on dense recall.")
    return
  }

  if (action === "disable") {
    saveConfig({ ...config, dense: { ...dense, enabled: false } })
    console.log("Dense retrieval disabled. BM25 recall remains active.")
    return
  }

  if (action === "install") {
    const detailed = await loadDenseModuleDetailed()
    if (detailed.module) {
      console.log(`Dense embedder already available via ${detailed.spec}.`)
      return
    }
    const command = "npm install toon-memory-dense"
    if (process.env.TOON_MEMORY_DENSE_MODULE) {
      console.log(`TOON_MEMORY_DENSE_MODULE points to ${detailed.spec}; install that module manually.`)
      return
    }
    if (args.includes("--dry-run") || (!args.includes("--yes") && !process.stdin.isTTY)) {
      console.log(`Install the optional embedder locally: ${command}`)
      return
    }
    const ok = args.includes("--yes") || await confirm({ message: "Install toon-memory-dense in this project?", default: true })
    if (!ok) {
      console.log("Installation cancelled.")
      return
    }
    const result = spawnSync("npm", ["install", "toon-memory-dense"], { stdio: "inherit" })
    if (result.status !== 0) {
      process.exitCode = 1
      return
    }
    console.log("Embedder installed. Run 'toon-memory dense enable --build' to create vectors.")
    return
  }

  if (action === "build") {
    await buildFromCurrent(args)
    return
  }

  const diagnostics = await denseDiagnostics(readMemory())
  if (args.includes("--json")) {
    console.log(JSON.stringify(diagnostics, null, 2))
    return
  }
  const stored = readVectors()
  console.log([
    `dense: ${diagnostics.enabled ? "enabled" : "disabled"}`,
    `model: ${diagnostics.model || DEFAULT_DENSE_MODEL}`,
    `module: ${diagnostics.moduleSpec} (${diagnostics.moduleLoaded ? "loaded" : diagnostics.error || "missing"})`,
    `vectors: ${stored.vectors.size} entries, dim ${stored.dim}`,
    `stale: ${diagnostics.stale}`,
    `boost: ${diagnostics.boost}`,
    `auto-build: ${diagnostics.autoBuild ? "on" : "off"}`,
    `built: ${diagnostics.builtAt || "never"}`,
  ].join("\n"))
}

export { buildVectors }
