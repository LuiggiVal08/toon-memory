#!/usr/bin/env node
/**
 * Benchmark for viewer graph performance.
 * Measures memory parse time, graph build time, and HTML generation time.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "..")

function readMemory() {
  const filePath = join(projectRoot, ".toon-memory", "memory", "data.toon")
  return readFileSync(filePath, "utf-8")
}

function parseEntries(data) {
  const lines = data.split("\n").filter(l => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
  return lines.map(l => {
    const p = l.trim().split("|")
    return {
      id: p[0], category: p[1], key: p[2], content: p[3],
      file: p[4] || "", tags: (p[5] || "").split(";").map(t => t.trim()).filter(Boolean),
      date: p[6] || "", links: (p[9] || "").split(/[\s;]+/).map(t => t.trim()).filter(Boolean),
    }
  })
}

function buildGraph(entries) {
  const byKey = new Map(entries.map(e => [e.key, e]))
  const adj = new Map()
  const link = (a, b) => {
    if (a === b) return
    if (!byKey.has(a) || !byKey.has(b)) return
    if (!adj.has(a)) adj.set(a, new Set())
    adj.get(a).add(b)
    if (!adj.has(b)) adj.set(b, new Set())
    adj.get(b).add(a)
  }

  for (const e of entries) {
    for (const l of e.links) link(e.key, l)
    const refs = e.content.match(/\[\[([\w-]+)\]\]/g) || []
    for (const r of refs) link(e.key, r.slice(2, -2))
  }

  for (let i = 0; i < entries.length; i++) {
    const ei = entries[i]
    if (ei.tags.length === 0) continue
    const eTags = new Set(ei.tags)
    for (let j = i + 1; j < entries.length; j++) {
      const ej = entries[j]
      if (ej.tags.length === 0) continue
      let shared = 0
      for (const t of ej.tags) if (eTags.has(t)) shared++
      if (shared >= 2) link(ei.key, ej.key)
    }
  }

  const nodeIds = new Map(entries.map(e => [e.key, e.id]))
  const edges = []
  const seen = new Set()
  adj.forEach((nbrs, keyA) => {
    nbrs.forEach(keyB => {
      const pair = [keyA, keyB].sort().join("::")
      if (!seen.has(pair)) {
        seen.add(pair)
        edges.push({ source: nodeIds.get(keyA), target: nodeIds.get(keyB) })
      }
    })
  })

  return { nodes: entries, edges }
}

const WARMUP = 10
const RUNS = 100

console.log(`\n📊 Viewer Benchmark`)
console.log(`   Warmup: ${WARMUP} runs, Measure: ${RUNS} runs\n`)

// Warmup
for (let i = 0; i < WARMUP; i++) {
  const data = readMemory()
  const entries = parseEntries(data)
  buildGraph(entries)
}

// Read + Parse
let totalReadParse = 0
for (let i = 0; i < RUNS; i++) {
  const t0 = performance.now()
  const data = readMemory()
  const entries = parseEntries(data)
  totalReadParse += performance.now() - t0
}
const readParseAvg = totalReadParse / RUNS

// Parse only
let totalParse = 0
const data = readMemory()
for (let i = 0; i < RUNS; i++) {
  const t0 = performance.now()
  const entries = parseEntries(data)
  totalParse += performance.now() - t0
}
const parseAvg = totalParse / RUNS

// Graph build
let entries = parseEntries(data)
let totalGraph = 0
for (let i = 0; i < RUNS; i++) {
  const t0 = performance.now()
  const graph = buildGraph(entries)
  totalGraph += performance.now() - t0
}
const graphAvg = totalGraph / RUNS
const graph = buildGraph(entries)

console.log(`   Entries: ${graph.nodes.length}`)
console.log(`   Edges:   ${graph.edges.length}`)
console.log(``)
console.log(`   Read + Parse:  ${readParseAvg.toFixed(3)}ms avg (${RUNS} runs)`)
console.log(`   Parse only:    ${parseAvg.toFixed(3)}ms avg`)
console.log(`   Graph build:   ${graphAvg.toFixed(3)}ms avg`)
console.log(``)

// Node density
const maxEdges = graph.nodes.length * (graph.nodes.length - 1) / 2
const density = maxEdges > 0 ? (graph.edges.length / maxEdges) : 0
console.log(`   Graph density: ${(density * 100).toFixed(3)}%`)
console.log(`   Avg degree:    ${(graph.edges.length * 2 / graph.nodes.length).toFixed(2)}`)
console.log(``)
