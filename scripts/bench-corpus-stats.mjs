#!/usr/bin/env node
// Structural corpus metrics — deterministic, no LLM. Used to test the hypothesis
// that corpus structure predicts which ranker (linear vs RRF fusion) wins.
//
// Usage: node scripts/bench-corpus-stats.mjs <data.toon> [data.toon ...]

import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import esbuild from "esbuild"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const bundle = await esbuild.build({
	entryPoints: [join(ROOT, "src", "lib", "graph.ts")],
	bundle: true,
	write: false,
	format: "esm",
	platform: "node",
})
const { buildGraph, parseEntries } = await import(
	"data:text/javascript;base64," + Buffer.from(bundle.outputFiles[0].text).toString("base64")
)

function tokenize(s) {
	return (s || "").toLowerCase().split(/[^a-z0-9\u00e0-\u00ff]+/).filter(Boolean)
}

function countCrossRefs(entries) {
	let n = 0
	for (const e of entries) {
		const refs = (e.content.match(/\[\[([a-z0-9-]+)\]\]/g) || []).length
		if (refs > 0) n++
	}
	return n
}

function stats(path) {
	const entries = parseEntries(readFileSync(path, "utf8"))
	const active = entries.filter((e) => e.status === "active")
	const { adjacency } = buildGraph(entries)
	const degs = [...adjacency.values()].map((s) => s.length)
	const meanDeg = degs.reduce((a, b) => a + b, 0) / Math.max(1, degs.length)
	const maxDeg = Math.max(0, ...degs)
	const withLinks = entries.filter((e) => e.links.length > 0).length
	const withTags = entries.filter((e) => e.tags.length > 0).length
	const lens = entries.map((e) => tokenize(`${e.key} ${e.content}`).length)
	const avgLen = lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length)
	const medLen = [...lens].sort((a, b) => a - b)[Math.floor(lens.length / 2)]
	return {
		file: path,
		entries: entries.length,
		active: active.length,
		avgTokens: Math.round(avgLen),
		medianTokens: medLen,
		withLinks: Math.round((100 * withLinks) / entries.length),
		avgTags: (entries.reduce((a, e) => a + e.tags.length, 0) / Math.max(1, entries.length)).toFixed(2),
		withTags: Math.round((100 * withTags) / entries.length),
		crossRefs: Math.round((100 * countCrossRefs(entries)) / entries.length),
		meanDegree: meanDeg.toFixed(2),
		maxDegree: maxDeg,
	}
}

for (const path of process.argv.slice(2)) {
	const s = stats(path)
	console.log(
		[
			s.file.replace(/^.*\/(projects)\//, "$1/"),
			`entries=${s.entries}`,
			`active=${s.active}`,
			`avgTok=${s.avgTokens}`,
			`medTok=${s.medianTokens}`,
			`links=${s.withLinks}%`,
			`tags=${s.avgTags}avg(${s.withTags}%)`,
			`refs=${s.crossRefs}%`,
			`deg=${s.meanDegree}(max ${s.maxDegree})`,
		].join("  ")
	)
}
