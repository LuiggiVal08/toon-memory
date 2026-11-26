import { existsSync } from "fs"
import { loadConfig, saveConfig, VECTORS_FILE } from "../mcp/config"
import { readMemory } from "../mcp/memory-io"
import { buildVectors, loadDenseModule, readVectors } from "../lib/dense"

export const DEFAULT_DENSE_MODEL = "multilingual-e5-small"

export async function runDense(args: string[]): Promise<void> {
  const action = args[0] || "status"
  const config = loadConfig()
  const dense = config.dense || {}

  if (action === "enable") {
    saveConfig({ ...config, dense: { ...dense, enabled: true, model: args[1] || dense.model || DEFAULT_DENSE_MODEL } })
    console.log(`Dense retrieval enabled (model: ${args[1] || dense.model || DEFAULT_DENSE_MODEL}). Run 'toon-memory dense build' once.`)
    return
  }

  if (action === "disable") {
    saveConfig({ ...config, dense: { ...dense, enabled: false } })
    console.log("Dense retrieval disabled. BM25 recall remains active.")
    return
  }

  if (action === "install") {
    console.log("Install the optional embedder: npm install toon-memory-dense")
    console.log("Then point to it with TOON_MEMORY_DENSE_MODULE=/absolute/path/to/module.js if it is not on the default resolution path.")
    return
  }

  if (action === "build") {
    const module = await loadDenseModule()
    if (!module) {
      console.error("Dense embedder not found. Run 'toon-memory dense install' first.")
      process.exitCode = 1
      return
    }
    const count = await buildVectors(readMemory(), module, dense.model || DEFAULT_DENSE_MODEL)
    console.log(`Built vectors for ${count} entries in ${VECTORS_FILE}.`)
    return
  }

  const stored = readVectors()
  console.log([
    `dense: ${dense.enabled ? "enabled" : "disabled"}`,
    `model: ${dense.model || DEFAULT_DENSE_MODEL}`,
    `module: ${process.env.TOON_MEMORY_DENSE_MODULE || "toon-memory-dense"}`,
    `vectors: ${existsSync(VECTORS_FILE) ? `${stored.vectors.size} entries, dim ${stored.dim}` : "not built"}`,
  ].join("\n"))
}
