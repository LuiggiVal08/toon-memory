// LongMemEval-style retrieval benchmark runner.
//
// Bundles the REAL production recall pipeline (scripts/bench-retrieval-core.ts
// + src/lib/*) in-memory with esbuild and imports it as a data: URL, so the
// measured code is exactly what ships — no faithful copies, no temp files.
// Read-only: no bumpAccess, no writes.
//
// Run with: npm run bench:retrieval
// Options: --corpus <file>   override the corpus .toon file (second-project validation)
//           --queries <file> override the gold queries json
//           --out <file>     write the metrics json (default benchmarks/retrieval-results.json)

import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import esbuild from "esbuild"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const args = process.argv.slice(2)
const flagOf = (name, fallback) => {
	const i = args.indexOf(name)
	return i >= 0 ? args[i + 1] : fallback
}
const corpusPath = flagOf("--corpus", join(ROOT, "benchmarks", "retrieval-corpus.toon"))
const goldPath = flagOf("--queries", join(ROOT, "benchmarks", "gold-queries.json"))
const outPath = flagOf("--out", join(ROOT, "benchmarks", "retrieval-results.json"))
const corpus = readFileSync(corpusPath, "utf8")
const goldFile = JSON.parse(readFileSync(goldPath, "utf8"))

const bundle = await esbuild.build({
	entryPoints: [join(ROOT, "scripts", "bench-retrieval-core.ts")],
	bundle: true,
	write: false,
	format: "esm",
	platform: "node",
})
const mod = await import("data:text/javascript;base64," + Buffer.from(bundle.outputFiles[0].text).toString("base64"))

const missing = mod.checkGoldKeys(corpus, goldFile.queries)
if (missing.length > 0) {
	console.error(`ERROR: gold keys not present in corpus: ${missing.join(", ")}`)
	process.exit(1)
}

const results = mod.run({ corpus, queries: goldFile.queries, today: goldFile.snapshot })

// ── report ──────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n)
const fmt = (n) => n.toFixed(3)
const pct = (n) => (n * 100).toFixed(1) + "%"

const modeNames = { linear: "linear (graph)", rrf: "rrf (graph)", smart: "smart (unified)" }
const catLabels = {
	"core-fact": "core fact",
	temporal: "temporal",
	"knowledge-updating": "knowledge updating",
	"multi-hop": "multi-hop",
	"meta-session": "meta/session",
	distractor: "distractor",
}

console.log("toon-memory — LongMemEval-style retrieval benchmark")
console.log(`Corpus: ${results.corpusEntries} real entries (benchmarks/retrieval-corpus.toon, snapshot ${results.today})`)
console.log(`Queries: ${results.queryCount} hand-authored gold sets | Metric: R@${results.k} / nDCG@${results.k} / MRR@${results.k}`)
console.log("Pipeline: production src/lib/graph.ts + src/lib/quality.ts (esbuild-bundled, read-only)\n")

console.log(`${pad("mode", 20)} ${pad("R@5", 10)} ${pad("nDCG@5", 10)} ${pad("MRR@5", 10)} ${pad("answerable", 10)}`)
console.log("-".repeat(62))
for (const mode of ["linear", "rrf", "smart"]) {
	const m = results.modes[mode]
	console.log(
		`${pad(modeNames[mode], 20)} ${pad(fmt(m.rAtK), 10)} ${pad(fmt(m.ndcg), 10)} ${pad(fmt(m.mrr), 10)} ${pad(pct(m.answerable), 10)}`
	)
}
console.log("-".repeat(62))

console.log("\nBy category (R@5 / nDCG@5 / MRR@5):")
console.log(`${pad("category", 20)} ${pad("linear", 18)} ${pad("rrf", 18)} ${pad("smart", 18)}`)
console.log("-".repeat(74))
for (const cat of Object.keys(results.byCategory.rrf)) {
	const row = (m) => {
		const c = results.byCategory[m][cat]
		return c ? `${fmt(c.rAtK)} / ${fmt(c.ndcg)} / ${fmt(c.mrr)}` : "—"
	}
	console.log(`${pad(catLabels[cat] || cat, 20)} ${pad(row("linear"), 18)} ${pad(row("rrf"), 18)} ${pad(row("smart"), 18)}`)
}

// per-query detail for the rrf mode
console.log("\nPer query (rrf):")
console.log(`${pad("id", 8)} ${pad("category", 18)} ${pad("R@5", 6)} ${pad("nDCG", 6)} ${pad("MRR", 6)} q`)
console.log("-".repeat(96))
for (const q of goldFile.queries) {
	const m = results.perQuery.rrf[q.id]
	if (!m) continue
	console.log(
		`${pad(q.id, 8)} ${pad(catLabels[q.category] || q.category, 18)} ${pad(fmt(m.rAtK), 6)} ${pad(fmt(m.ndcg), 6)} ${pad(fmt(m.mrr), 6)} ${q.q}`
	)
}

console.log("\n// metrics for the docs site")
const metrics = {
	benchmark: "retrieval",
	corpusEntries: results.corpusEntries,
	queries: results.queryCount,
	k: results.k,
	snapshot: results.today,
	pipeline: "production src/lib (esbuild in-memory bundle)",
	modes: results.modes,
	byCategory: results.byCategory,
	goldKeysValid: true,
}
console.log(JSON.stringify(metrics, null, 2))
writeFileSync(outPath, JSON.stringify(metrics, null, 2) + "\n")
