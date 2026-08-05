// Benchmark regression canary for CI.
//
// Runs the retrieval benchmark (same pipeline as bench:retrieval) and compares
// the result against the committed benchmarks/retrieval-results.json. Fails
// (exit 1) when any metric drifts, so a change to src/lib/* that degrades
// retrieval is caught before merge. Same flags as bench-retrieval.mjs
// (--corpus, --queries) for validating against a second project's data.
//
// Run with: npm run bench:check

import { readFileSync } from "node:fs"
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
const refPath = flagOf("--ref", join(ROOT, "benchmarks", "retrieval-results.json"))

const corpus = readFileSync(corpusPath, "utf8")
const goldFile = JSON.parse(readFileSync(goldPath, "utf8"))
const ref = JSON.parse(readFileSync(refPath, "utf8"))

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

// Per-metric tolerance. Metrics are deterministic on the frozen corpus, so a
// non-zero tolerance only absorbs float noise — any real regression is far
// above it (a single gold query shifting out of top-5 moves R@5 by ~0.02).
const EPS = 1e-6

const metricNames = ["rAtK", "ndcg", "mrr", "answerable"]
let failures = 0

for (const mode of ["linear", "rrf", "smart"]) {
	const got = results.modes[mode]
	const want = ref.modes[mode]
	if (!got || !want) {
		console.error(`✗ mode "${mode}" missing from results`)
		failures++
		continue
	}
	for (const m of metricNames) {
		const g = got[m]
		const w = want[m]
		if (typeof g !== "number" || Math.abs(g - w) > EPS) {
			console.error(`✗ ${mode} ${m}: got ${g}, expected ${w} (committed benchmark)`)
			failures++
		}
	}
}

// Per-category comparison too — a win in one category hiding a loss in another.
for (const mode of ["linear", "rrf", "smart"]) {
	for (const [cat, got] of Object.entries(results.byCategory[mode] ?? {})) {
		const want = ref.byCategory?.[mode]?.[cat]
		if (!want) continue
		for (const m of metricNames) {
			if (Math.abs(got[m] - want[m]) > EPS) {
				console.error(`✗ ${mode} ${cat} ${m}: got ${got[m].toFixed(4)}, expected ${want[m].toFixed(4)}`)
				failures++
			}
		}
	}
}

if (failures > 0) {
	console.error(`\nbench:check failed — ${failures} metric(s) drifted from the committed benchmark.`)
	console.error("If the drift is an intended retrieval improvement, regenerate the baseline:")
	console.error("  npm run bench:retrieval && git add benchmarks/retrieval-results.json")
	process.exit(1)
}

console.log("bench:check ok — retrieval matches the committed benchmark")
console.log(`  rrf  R@5 ${results.modes.rrf.rAtK.toFixed(3)}  nDCG ${results.modes.rrf.ndcg.toFixed(3)}  MRR ${results.modes.rrf.mrr.toFixed(3)}`)
console.log(`  smart R@5 ${results.modes.smart.rAtK.toFixed(3)}  nDCG ${results.modes.smart.ndcg.toFixed(3)}  MRR ${results.modes.smart.mrr.toFixed(3)}`)
