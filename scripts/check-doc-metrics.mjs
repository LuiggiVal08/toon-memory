import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const ref = JSON.parse(readFileSync(join(root, "benchmarks", "retrieval-results.json"), "utf8"))
const i18n = readFileSync(join(root, "docs", "src", "i18n.ts"), "utf8")

const round = (n) => n.toFixed(3)
const mode = (name) => ref.modes[name]
const metrics = ["rAtK", "ndcg", "mrr"]

let failures = 0
const fail = (msg) => {
  console.error(`✗ ${msg}`)
  failures++
}

for (const key of metrics) {
  const expected = `linear: '${round(mode("linear")[key])}', rrf: '${round(mode("rrf")[key])}', smart: '${round(mode("smart")[key])}' }`
  const count = i18n.split(expected).length - 1
  if (count !== 8) fail(`${key} expected 8 locale rows, found ${count} (want ${expected})`)
}

const stale = [
  "rrf: '0.891'",
  "rrf: '0.825'",
  "rrf: '0.871'",
  "~1 MB",
  "约 1 MB",
  "約 1 MB",
  "설치 약 1 MB",
  "100% of queries answered from the top-5",
  "El 100% de las queries",
  "100% 的查询",
  "100%のクエリ",
  "100%의 쿼리",
  "97,6% das queries",
  "97,6 % der Queries",
  "97,6 % des requêtes",
]
for (const token of stale) if (i18n.includes(token)) fail(`stale copy still present: ${token}`)

const answerable = [
  "95% of queries answered from the top-5",
  "El 95% de las queries respondidas desde el top-5",
  "95% 的查询可从前 5 名得到答案",
  "95%のクエリがトップ5から回答可能",
  "95%의 쿼리가 상위 5개에서 답변 가능",
  "95,0% das queries respondidas a partir do top-5",
  "95,0 % der Queries aus den Top 5 beantwortet",
  "95,0 % des requêtes répondues depuis le top-5",
]
for (const line of answerable) {
  const count = i18n.split(line).length - 1
  if (count !== 1) fail(`expected one result line ${JSON.stringify(line)}, found ${count}`)
}

if (failures > 0) {
  console.error(`\ndoc:check failed — ${failures} mismatch(es).`)
  process.exit(1)
}
console.log("doc:check ok — benchmark copy matches retrieval-results.json in 8 locales")
