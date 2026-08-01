// LongMemEval-style retrieval benchmark core.
//
// Runs the REAL production recall pipeline (src/lib/graph.ts graphRecallDetailed
// and src/lib/quality.ts generateSmartRecall) over a frozen corpus of 189 real
// toon-memory entries, scored against hand-authored gold query sets.
//
// This file is bundled in-memory by scripts/bench-retrieval.mjs (esbuild) and
// imported as a data: URL, so it always measures production code — not a faithful
// copy. No mutations: no bumpAccess, read-only.
//
// Determinism: the corpus snapshot date is passed as `today` so recency/decay/TTL
// don't drift as wall-clock time advances.
//
// Run with: npm run bench:retrieval

import { graphRecallDetailed, parseEntries } from "../src/lib/graph"
import { generateSmartRecall } from "../src/lib/quality"

export interface GoldQuery {
	id: string
	q: string
	gold: string[]
	category: string
	asOf?: string
}

export interface RunInput {
	corpus: string
	queries: GoldQuery[]
	today: string
}

export interface Metric {
	ndcg: number
	mrr: number
	rAtK: number
	answerable: number
	ranking: string[]
}

// ── retrieval metrics (gold relevance) ─────────────────────────────────────
function dcgAt(ranking: string[], gold: Set<string>, k: number): number {
	let dcg = 0
	for (let i = 0; i < Math.min(k, ranking.length); i++) {
		if (gold.has(ranking[i])) dcg += 1 / Math.log2(i + 2)
	}
	return dcg
}

function ndcgAt(ranking: string[], gold: Set<string>, k: number): number {
	if (gold.size === 0) return 0
	const ideal = [...gold]
		.sort()
		.slice(0, k)
		.map((_, i) => 1 / Math.log2(i + 2))
		.reduce((a, b) => a + b, 0)
	return ideal > 0 ? dcgAt(ranking, gold, k) / ideal : 0
}

function mrrAt(ranking: string[], gold: Set<string>, k: number): number {
	for (let i = 0; i < Math.min(k, ranking.length); i++) {
		if (gold.has(ranking[i])) return 1 / (i + 1)
	}
	return 0
}

/** recall@k: hits over min(k, |gold|) so a fully-retrieved gold set scores 1.0. */
function recallAt(ranking: string[], gold: Set<string>, k: number): number {
	if (gold.size === 0) return 0
	let hits = 0
	for (let i = 0; i < Math.min(k, ranking.length); i++) if (gold.has(ranking[i])) hits++
	return hits / Math.min(k, gold.size)
}

function answerableAt(ranking: string[], gold: Set<string>, k: number): number {
	for (let i = 0; i < Math.min(k, ranking.length); i++) if (gold.has(ranking[i])) return 1
	return 0
}

// ── ranking modes (all real production functions) ──────────────────────────
const K = 5
const LIMIT = 8

function graphRank(corpus: string, q: string, today: string, asOf: string | undefined, rrf: boolean): string[] {
	const res = graphRecallDetailed(corpus, q, { rrf, limit: LIMIT, today, ...(asOf ? { asOf } : {}) })
	return res.entries.map((e) => e.key)
}

function smartRank(corpus: string, q: string, today: string): string[] {
	const out = generateSmartRecall(corpus, q, {
		limit: LIMIT,
		rrf: true,
		today,
	})
	// generateSmartRecall renders "[n] category/key" blocks — parse the keys back out.
	const keys: string[] = []
	for (const line of out.split("\n")) {
		const m = line.match(/^\[\d+\]\s+[\w-]+\/([\w-]+)/)
		if (m) keys.push(m[1])
	}
	return keys
}

export function checkGoldKeys(corpus: string, queries: GoldQuery[]): string[] {
	const keys = new Set(parseEntries(corpus).map((e) => e.key))
	const missing = new Set<string>()
	for (const q of queries) for (const k of q.gold) if (!keys.has(k)) missing.add(k)
	return [...missing]
}

export function run(input: RunInput) {
	const { corpus, queries, today } = input
	const modes = {
		linear: (q: GoldQuery) => graphRank(corpus, q.q, today, q.asOf, false),
		rrf: (q: GoldQuery) => graphRank(corpus, q.q, today, q.asOf, true),
		// generateSmartRecall has no asOf/temporal view — skip asOf-marked queries for it.
		smart: (q: GoldQuery) => (q.asOf ? [] : smartRank(corpus, q.q, today)),
	}

	const perQuery: Record<string, Record<string, Metric & { id: string; q: string; category: string }>> = {}
	const totals: Record<string, { ndcg: number; mrr: number; rAtK: number; answerable: number; n: number }> = {}

	for (const [mode, rankFn] of Object.entries(modes)) {
		totals[mode] = { ndcg: 0, mrr: 0, rAtK: 0, answerable: 0, n: 0 }
		perQuery[mode] = {}
		for (const query of queries) {
			// smart recall has no temporal (asOf) view — score only supported queries.
			if (mode === "smart" && query.asOf) continue
			const gold = new Set(query.gold)
			const ranking = rankFn(query)
			const metric = {
				id: query.id,
				q: query.q,
				category: query.category,
				ndcg: ndcgAt(ranking, gold, K),
				mrr: mrrAt(ranking, gold, K),
				rAtK: recallAt(ranking, gold, K),
				answerable: answerableAt(ranking, gold, K),
				ranking,
			}
			perQuery[mode][query.id] = metric
			totals[mode].ndcg += metric.ndcg
			totals[mode].mrr += metric.mrr
			totals[mode].rAtK += metric.rAtK
			totals[mode].answerable += metric.answerable
			totals[mode].n++
		}
	}

	const avg = (m: string, key: keyof (typeof totals)["linear"]) =>
		totals[m].n ? totals[m][key] / totals[m].n : 0

	// per-category aggregates
	const byCategory: Record<string, Record<string, Record<string, number>>> = {}
	for (const mode of Object.keys(modes)) {
		byCategory[mode] = {}
		for (const cat of new Set(queries.map((q) => q.category))) {
			const qs = queries.filter((q) => q.category === cat && perQuery[mode][q.id])
			const sum = (key: "ndcg" | "mrr" | "rAtK" | "answerable") =>
				qs.reduce((a, q) => a + perQuery[mode][q.id][key], 0) / (qs.length || 1)
			byCategory[mode][cat] = {
				ndcg: sum("ndcg"),
				mrr: sum("mrr"),
				rAtK: sum("rAtK"),
				answerable: sum("answerable"),
			}
		}
	}

	return {
		corpusEntries: parseEntries(corpus).length,
		queryCount: queries.length,
		k: K,
		limit: LIMIT,
		today,
		modes: Object.fromEntries(
			Object.keys(modes).map((m) => [
				m,
				{
					ndcg: avg(m, "ndcg"),
					mrr: avg(m, "mrr"),
					rAtK: avg(m, "rAtK"),
					answerable: avg(m, "answerable"),
				},
			])
		),
		byCategory,
		perQuery,
	}
}
