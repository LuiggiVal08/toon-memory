import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import esbuild from "esbuild"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
const flagOf = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const check = args.includes("--check")
const write = args.includes("--write")
const boost = Number(flagOf("--boost", "0.25"))
const corpusPath = flagOf("--corpus", join(root, "benchmarks", "retrieval-corpus.toon"))
const goldPath = flagOf("--queries", join(root, "benchmarks", "gold-queries.json"))
const refPath = join(root, "benchmarks", "dense-results.json")

const corpus = readFileSync(corpusPath, "utf8")
const goldFile = JSON.parse(readFileSync(goldPath, "utf8"))
const K = 5

function dcgAt(ranking, gold, k) {
  let dcg = 0
  for (let i = 0; i < Math.min(k, ranking.length); i++) if (gold.has(ranking[i])) dcg += 1 / Math.log2(i + 2)
  return dcg
}

function ndcgAt(ranking, gold, k) {
  if (gold.size === 0) return 0
  const ideal = [...gold].sort().slice(0, k).map((_, i) => 1 / Math.log2(i + 2)).reduce((a, b) => a + b, 0)
  return ideal > 0 ? dcgAt(ranking, gold, k) / ideal : 0
}

function mrrAt(ranking, gold, k) {
  for (let i = 0; i < Math.min(k, ranking.length); i++) if (gold.has(ranking[i])) return 1 / (i + 1)
  return 0
}

function recallAt(ranking, gold, k) {
  if (gold.size === 0) return 0
  let hits = 0
  for (let i = 0; i < Math.min(k, ranking.length); i++) if (gold.has(ranking[i])) hits++
  return hits / Math.min(k, gold.size)
}

function answerableAt(ranking, gold, k) {
  for (let i = 0; i < Math.min(k, ranking.length); i++) if (gold.has(ranking[i])) return 1
  return 0
}

function keysFromRecall(text) {
  const keys = []
  for (const line of text.split("\n")) {
    const match = line.match(/^\[\d+\]\s+[\w-]+\/([\w-]+)/)
    if (match) keys.push(match[1])
  }
  return keys
}

async function loadTs(entry) {
  const bundle = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
  })
  return import("data:text/javascript;base64," + Buffer.from(bundle.outputFiles[0].text).toString("base64"))
}

const fakeEmbedder = `
export async function embed(texts) {
  const dim = 16
  return texts.map((text) => {
    const vec = Array(dim).fill(0)
    for (const token of String(text).toLowerCase().match(/[a-z0-9_]+/g) || []) {
      let hash = 2166136261
      for (const ch of token) {
        hash ^= ch.charCodeAt(0)
        hash = Math.imul(hash, 16777619)
      }
      vec[Math.abs(hash) % dim] += 1
    }
    const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1
    return vec.map((n) => n / norm)
  })
}
export default { embed }
`

const cwd = process.cwd()
const oldModule = process.env.TOON_MEMORY_DENSE_MODULE
const testDir = join(tmpdir(), `toon-memory-bench-dense-${Date.now()}`)
const memoryDir = join(testDir, ".toon-memory", "memory")

try {
  mkdirSync(memoryDir, { recursive: true })
  writeFileSync(join(memoryDir, "data.toon"), corpus)
  writeFileSync(
    join(memoryDir, "config.json"),
    JSON.stringify({ encrypted: false, dense: { enabled: true, model: "fake", boost, autoBuild: true } })
  )
  process.chdir(testDir)
  process.env.TOON_MEMORY_DENSE_MODULE = "data:text/javascript," + encodeURIComponent(fakeEmbedder)

  const quality = await loadTs(join(root, "src", "lib", "quality.ts"))
  const dense = await loadTs(join(root, "src", "lib", "dense.ts"))

  const modes = { smart: [], smartDense: [] }
  const totals = { smart: { ndcg: 0, mrr: 0, rAtK: 0, answerable: 0, n: 0 }, smartDense: { ndcg: 0, mrr: 0, rAtK: 0, answerable: 0, n: 0 } }

  for (const query of goldFile.queries) {
    if (query.asOf) continue
    const gold = new Set(query.gold)
    const rankings = {
      smart: keysFromRecall(quality.generateSmartRecall(corpus, query.q, { limit: 8, rrf: true, today: goldFile.snapshot })),
      smartDense: keysFromRecall(
        quality.generateSmartRecall(corpus, query.q, {
          limit: 8,
          rrf: true,
          today: goldFile.snapshot,
          dense: await dense.denseScores(query.q, corpus),
          denseBoost: boost,
        })
      ),
    }
    for (const mode of Object.keys(modes)) {
      const ranking = rankings[mode]
      const metric = {
        ndcg: ndcgAt(ranking, gold, K),
        mrr: mrrAt(ranking, gold, K),
        rAtK: recallAt(ranking, gold, K),
        answerable: answerableAt(ranking, gold, K),
      }
      totals[mode].ndcg += metric.ndcg
      totals[mode].mrr += metric.mrr
      totals[mode].rAtK += metric.rAtK
      totals[mode].answerable += metric.answerable
      totals[mode].n++
    }
  }

  const results = {
    benchmark: "dense",
    boost,
    k: K,
    snapshot: goldFile.snapshot,
    queries: totals.smart.n,
    modes: Object.fromEntries(
      Object.entries(totals).map(([mode, total]) => [
        mode,
        Object.fromEntries(["ndcg", "mrr", "rAtK", "answerable"].map((key) => [key, total[key] / (total.n || 1)])),
      ])
    ),
  }

  if (write) {
    writeFileSync(refPath, JSON.stringify(results, null, 2) + "\n")
    console.log(`Wrote ${refPath}`)
  }

  if (check) {
    if (!existsSync(refPath)) {
      console.error(`Missing baseline ${refPath}; run npm run bench:dense -- --write`)
      process.exit(1)
    }
    const ref = JSON.parse(readFileSync(refPath, "utf8"))
    let failures = 0
    if (Math.abs(ref.boost - boost) > Number.EPSILON) {
      console.error(`boost drift: got ${boost}, expected ${ref.boost}`)
      failures++
    }
    for (const mode of ["smart", "smartDense"]) {
      for (const metric of ["ndcg", "mrr", "rAtK", "answerable"]) {
        const got = results.modes[mode][metric]
        const want = ref.modes[mode][metric]
        if (Math.abs(got - want) > 1e-6) {
          console.error(`${mode} ${metric}: got ${got}, expected ${want}`)
          failures++
        }
      }
    }
    if (failures > 0) {
      console.error(`\nbench:dense:check failed — ${failures} metric(s) drifted.`)
      process.exit(1)
    }
    console.log("bench:dense:check ok — dense ranking matches the committed baseline")
  } else {
    console.log(JSON.stringify(results, null, 2))
  }
} finally {
  process.chdir(cwd)
  if (oldModule === undefined) delete process.env.TOON_MEMORY_DENSE_MODULE
  else process.env.TOON_MEMORY_DENSE_MODULE = oldModule
  rmSync(testDir, { recursive: true, force: true })
}
