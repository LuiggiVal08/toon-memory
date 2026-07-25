// Full-impact benchmark: simulates a complete agent session with toon-memory.
//
// Compares 3 approaches across 5 session phases:
//   1. WITHOUT memory  — agent reads files, greps, re-derives everything
//   2. WITH memory_recall — agent uses basic memory recall + manual tool calls
//   3. WITH context_* tools — agent uses context_generate/diff/focus/health/export
//
// Each phase measures tokens consumed and tool calls made.
// Run with: node scripts/bench-full-impact.mjs

import { encode as encodeTokens } from 'gpt-tokenizer';

// ── tokenizer ──────────────────────────────────────────────────────────
function t(text) { return encodeTokens(text).length; }

// ── realistic corpus ───────────────────────────────────────────────────
// Simulates a mid-size TypeScript project with 50 memory entries

const PROJECT_FILES = {
  'package.json': `{
  "name": "toon-memory",
  "version": "2.5.2",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.1",
    "better-sqlite3": "^11.9.1",
    "gpt-tokenizer": "^2.9.0",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "esbuild": "^0.25.0",
    "typescript": "^5.8.3",
    "vitest": "^4.1.10"
  }
}`,

  'src/mcp/server.ts': `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";
import { MemoryConfig } from "../lib/config.js";

export function createServer(config: MemoryConfig) {
  const server = new McpServer({ name: "toon-memory", version: "2.5.2" });
  registerTools(server, config);
  registerResources(server, config);
  return server;
}`,

  'src/mcp/tools.ts': `import { memory_remember } from "./handlers/remember.js";
import { memory_recall } from "./handlers/recall.js";
import { context_generate } from "./handlers/context-generate.js";
import { context_diff } from "./handlers/context-diff.js";
import { context_focus } from "./handlers/context-focus.js";
import { context_health } from "./handlers/context-health.js";
import { context_export } from "./handlers/context-export.js";

export function registerTools(server, config) {
  server.tool("memory_remember", rememberSchema, (args) => handleRemember(args, config));
  server.tool("memory_recall", recallSchema, (args) => handleRecall(args, config));
  server.tool("context_generate", contextSchema, (args) => handleContextGenerate(args, config));
  server.tool("context_diff", diffSchema, (args) => handleContextDiff(args, config));
  server.tool("context_focus", focusSchema, (args) => handleContextFocus(args, config));
  server.tool("context_health", healthSchema, (args) => handleContextHealth(args, config));
  server.tool("context_export", exportSchema, (args) => handleContextExport(args, config));
  // ... 13 more tools
}`,

  'src/lib/context.ts': `import { readRecentCommits, gitStatusSummary } from "./git.js";
import { scanProjectStructure, readManifest } from "./project-scan.js";
import { parseEntries, buildGraph, renderCompact } from "./graph.js";
import { qualityScore } from "./quality.js";
import { coordinationView } from "./sessions.js";

export function generateContextGenerate(data, opts) {
  const manifest = readManifest(opts.cwd);
  const git = gitStatusSummary(opts.cwd);
  const entries = parseEntries(data);
  const graph = buildGraph(entries);
  const quality = entries.map(e => ({ key: e.key, score: qualityScore(e) }));
  const sessions = coordinationView(opts.cwd);
  return formatBriefing(manifest, git, entries, quality, sessions);
}`,

  'src/lib/git.ts': `import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { inflateSync } from "zlib";

export function readGitIndex(cwd = ".") {
  const indexPath = join(cwd, ".git", "index");
  if (!existsSync(indexPath)) return [];
  const buf = readFileSync(indexPath);
  // Parse binary Git index format...
  return entries;
}

export function readRecentCommits(count = 10, cwd = ".") {
  const headPath = join(cwd, ".git", "HEAD");
  const head = readFileSync(headPath, "utf8").trim();
  // Read commit objects from .git/objects/...
  return commits;
}`,

  'src/lib/graph.ts': `export interface GraphEntry {
  id: string; category: string; key: string; content: string;
  file: string; tags: string[]; date: string; ttl: string;
  accessed: number; links: string[];
}

export function parseEntries(data: string): GraphEntry[] { /* ... */ }
export function buildGraph(entries: GraphEntry[]): MemoryGraph { /* ... */ }
export function bm25Scores(query: string, entries: GraphEntry[]): Map<string, number> { /* ... */ }
export function renderCompact(entries: GraphEntry[], opts?): string { /* ... */ }`,

  'src/lib/quality.ts': `export function qualityScore(entry: GraphEntry): number {
  let score = 0;
  if (entry.tags.length >= 2) score += 0.25;
  if (entry.links.length >= 1) score += 0.2;
  if (entry.content.length > 80) score += 0.25;
  if (entry.file) score += 0.15;
  const daysSinceCreation = (Date.now() - new Date(entry.date).getTime()) / 86400000;
  score += Math.max(0, 0.15 * (1 - daysSinceCreation / 30));
  return Math.min(1, score);
}`,

  'src/lib/sessions.ts': `export function listSessions(cwd = ".") {
  // Read .toon-memory/sessions.json
  return sessions;
}

export function coordinationView(cwd = ".") {
  const sessions = listSessions(cwd);
  // Detect file conflicts, branch info...
  return view;
}`,

  'tests/mcp-integration.test.ts': `import { describe, it, expect } from "vitest";
import { createServer } from "../src/mcp/server.js";

describe("MCP Integration", () => {
  it("lists all 20 tools", async () => {
    const server = createServer(config);
    const tools = await server.listTools();
    expect(tools).toHaveLength(20);
  });

  it("context_generate returns full briefing", async () => {
    const result = await server.callTool("context_generate", {});
    expect(result.content[0].text).toContain("Project Briefing");
  });

  it("context_health returns score", async () => {
    const result = await server.callTool("context_health", {});
    expect(result.content[0].text).toContain("score:");
  });
});`,

  'docs/src/content/docs/features/tools.mdx': `---
title: MCP Tools
description: The 20 memory and context tools and 3 resources for your AI agent
---

## Overview

toon-memory provides 20 MCP tools and 3 MCP resources...

## Tools

| Tool | Description |
|------|-------------|
| memory_remember | Save a decision, pattern, bug, or knowledge |
| memory_recall | Search memory before reading files |
| context_generate | Full project briefing in one call |
| context_diff | Incremental briefing since last session |
| context_focus | Targeted briefing for a specific query |
| context_health | Memory health audit |
| context_export | Export memory as injectable markdown |`,

  'README.md': `# toon-memory

> MCP memory server for AI coding agents — remember decisions, patterns, and bugs between sessions.

## Features

- **20 MCP tools** — Full memory management via Model Context Protocol
- **MCP Resources** — Read memory as context without tool invocations
- **15 agents supported** — OpenCode, VS Code, Claude Code, Cursor, Windsurf...`,

  'src/lib/entries.ts': `const CATEGORIES = ["decision", "pattern", "bug", "knowledge"];
const VOCAB: Record<string, string[]> = {
  redis: ["redis", "cache", "session"],
  auth: ["auth", "jwt", "token", "login"],
  db: ["postgres", "mysql", "migration", "schema"],
  api: ["api", "endpoint", "route", "rest"],
  security: ["security", "encrypt", "csrf", "xss"],
};
export function inferTags(content: string, deps: string[]): string[] { /* ... */ }
export function mergeEntries(existing, incoming) { /* ... */ }`,
};

const MEMORY_ENTRIES = [
  { cat: 'decision', key: 'use-postgres', content: 'Choose Postgres for ACID compliance and JSON support. Better ecosystem than MySQL for our use case.', tags: ['db', 'decision'], file: 'src/db/connection.ts', links: ['db-migrations'] },
  { cat: 'decision', key: 'zod-validation', content: 'Use Zod for all API validation. Simpler than Joi, better TypeScript inference, co-located schemas with routes.', tags: ['api', 'types'], file: 'src/api/middleware.ts', links: [] },
  { cat: 'pattern', key: 'redis-config', content: 'Cache uses Redis with keyPrefix app: and ttl 300s. Pool capped at 20 connections. Monitor via redis-cli info clients.', tags: ['redis', 'config'], file: 'src/cache/redis.ts', links: ['redis-pool-fix'] },
  { cat: 'pattern', key: 'db-migrations', content: 'Sequential migration files with timestamps. Never edit committed migrations. Use up/down pairs. Test rollback in CI.', tags: ['db', 'pattern'], file: 'src/db/migrate.ts', links: ['use-postgres'] },
  { cat: 'pattern', key: 'auth-flow', content: 'JWT access tokens (15min) + refresh tokens (7d). Rotate refresh on use. Denylist jti to prevent replay.', tags: ['auth', 'security'], file: 'src/auth/jwt.ts', links: ['jwt-refresh-race'] },
  { cat: 'bug', key: 'redis-pool-fix', content: 'Added max_connections=20 to Redis pool after the connection storm during Black Friday. Monitor via redis-cli info clients.', tags: ['redis', 'bug'], file: 'src/cache/redis.ts', links: ['redis-config'] },
  { cat: 'bug', key: 'jwt-refresh-race', content: 'Refresh tokens could be reused within the 30s grace window, allowing replay. Fixed by tracking jti in a denylist set.', tags: ['auth', 'bug'], file: 'src/auth/jwt.ts', links: ['auth-flow'] },
  { cat: 'bug', key: 'esm-dirname', content: 'ESM __dirname error on Node.js v24 when top-level await coexists with __dirname in bundled output. Fixed with process.argv[1] derivation.', tags: ['node', 'esm'], file: 'src/cli/constants.ts', links: [] },
  { cat: 'knowledge', key: 'deploy-pipeline', content: 'Production deploys via GitHub Actions on release/* branch. Never merge directly to main; squash-merge only.', tags: ['ci', 'deploy'], file: '.github/workflows/release.yml', links: [] },
  { cat: 'knowledge', key: 'test-patterns', content: 'Use vitest with temp directories. Tests auto-cleanup. No external services required. Run npm test before commit.', tags: ['testing', 'ci'], file: 'vitest.config.ts', links: [] },
  { cat: 'decision', key: 'toon-format', content: 'TOON format for memory files: 22% fewer tokens than JSON. Better LLM comprehension. Lossless roundtrip.', tags: ['architecture', 'tokens'], file: 'src/lib/io.ts', links: [] },
  { cat: 'pattern', key: 'quality-scoring', content: 'Every entry gets 0-1 quality score based on: tags (0.25), links (0.2), content length (0.25), file ref (0.15), recency (0.15). High-quality entries surface first.', tags: ['quality', 'pattern'], file: 'src/lib/quality.ts', links: [] },
  { cat: 'decision', key: 'context-tools', content: '5 context_* tools: generate (full briefing), diff (incremental), focus (targeted), health (audit), export (markdown). Each replaces 3-6 manual tool calls. Zero LLM.', tags: ['context', 'architecture'], file: 'src/lib/context.ts', links: ['toon-format'] },
  { cat: 'pattern', key: 'git-reading', content: 'Read .git/ directly via fs.readFileSync + zlib.inflateSync. No shell commands. Parse binary index, read commit objects. Works offline.', tags: ['git', 'performance'], file: 'src/lib/git.ts', links: [] },
  { cat: 'knowledge', key: 'agent-support', content: '15 agents supported: OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex CLI, Gemini CLI, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro.', tags: ['agents', 'setup'], file: 'src/cli/agents.ts', links: [] },
  { cat: 'bug', key: 'merge-dedup', content: 'memory_remember with same key now auto-merges: union of tags, max confidence, latest date, combined links. Prevents data loss on re-save.', tags: ['memory', 'bug'], file: 'src/lib/entries.ts', links: [] },
  { cat: 'pattern', key: 'session-tracking', content: 'Track agent sessions via .toon-memory/sessions.json. Each session records: branch, files touched, last-seen timestamp. Detect soft conflicts when 2+ sessions touch same files.', tags: ['sessions', 'pattern'], file: 'src/lib/sessions.ts', links: [] },
  { cat: 'decision', key: 'encryption-aes', content: 'AES-256-GCM for memory encryption. Key auto-generated on first encrypt. No recovery if lost — by design.', tags: ['security', 'encryption'], file: 'src/lib/crypto.ts', links: [] },
  { cat: 'knowledge', key: 'cli-commands', content: 'CLI: init (interactive installer), status, stats, export, import, watch (auto-backup), upgrade, uninstall. Each agent gets configured separately.', tags: ['cli', 'setup'], file: 'src/cli/setup.ts', links: ['agent-support'] },
  { cat: 'pattern', key: 'bm25-ranking', content: 'BM25 relevance scoring for recall. Scores over id + category + key + content + tags. Graph centrality re-ranks hub entries. Per-hop decay keeps distant nodes low.', tags: ['search', 'ranking'], file: 'src/lib/graph.ts', links: ['quality-scoring'] },
  { cat: 'decision', key: 'no-llm-tools', content: 'All tool logic is deterministic: zero LLM calls in tool implementations. Heuristics are rule-based. This ensures fast, predictable, offline operation.', tags: ['architecture', 'decision'], file: 'src/mcp/tools.ts', links: ['toon-format'] },
  { cat: 'bug', key: 'token-count', content: 'Fixed token counting: gpt-tokenizer cl100k_base for benchmarking. TOON format saves 22% vs JSON. Compact recall saves 68% vs re-reading files.', tags: ['tokens', 'benchmark'], file: 'scripts/benchmark-toon.mjs', links: ['toon-format'] },
  { cat: 'knowledge', key: 'project-structure', content: 'src/mcp/ (10 modules), src/cli/ (11 modules), src/lib/ (15 modules), src/bin/ (entry). Build: esbuild ESM. Tests: vitest, 12 files, 199 tests.', tags: ['architecture', 'project'], file: 'AGENTS.md', links: ['context-tools'] },
  { cat: 'pattern', key: 'tag-inference', content: 'Auto-detect tags from content using built-in vocabulary (20+ categories) plus project dependencies scanned at init time. Empty tags → auto-inferred.', tags: ['tags', 'pattern'], file: 'src/lib/entries.ts', links: [] },
  { cat: 'decision', key: 'memory-ttl', content: 'Configurable per-entry TTL: 7d, 30d, or exact dates. Expired entries auto-filtered from search and auto-archived.', tags: ['memory', 'ttl'], file: 'src/lib/memory-io.ts', links: [] },
];

function buildMemoryFile() {
  return MEMORY_ENTRIES.map(e =>
    `[${e.cat}] ${e.key} (${hash8(e.key)})\n  ${e.content}\n  File: ${e.file} | Tags: ${e.tags.join(';')} | Date: 2026-07-${String(10 + (MEMORY_ENTRIES.indexOf(e) % 15)).padStart(2, '0')}${e.links.length ? '\n  links: ' + e.links.join(' ') : ''}`
  ).join('\n\n');
}

function buildCompactRecall() {
  return MEMORY_ENTRIES.map((e, i) =>
    `[${i + 1}] ${e.cat}/${e.key}\n  ${e.content.slice(0, 100)}${e.content.length > 100 ? '…' : ''}\n  tags: ${e.tags.join(';')}${e.links.length ? ' · edges: ->' + e.links.map(l => MEMORY_ENTRIES.findIndex(x => x.key === l) + 1).filter(n => n > 0).join(', ->') : ''}`
  ).join('\n\n');
}

function hash8(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h).toString(16).slice(0, 8); }

// ── PHASE 1: Session Start ────────────────────────────────────────────
// Agent needs project context before doing anything.

function phase1_without() {
  // Naive: read package.json + README (first 300 lines) + tsconfig + AGENTS.md
  // + git log + git status = 6 file reads
  const texts = [
    `// package.json\n${PROJECT_FILES['package.json']}`,
    `// README.md (first 300 lines)\n${PROJECT_FILES['README.md'].repeat(3)}`,
    `// tsconfig.json\n${JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext' } })}`,
    `// AGENTS.md\n${PROJECT_FILES['AGENTS.md'] || 'Build & Verify instructions...'}`,
    `// git log --oneline -10\n94071b6 feat(context): 5 toon-context tools\n071ce2e refactor(setup): split 1685-line monolith\n9237bb2 refactor(server): split 1526-line monolith\nab236e6 fix(memory): fix merge-dedup links\nd36c3a6 chore(tests): add 28 more tests`,
    `// git status\nOn branch main\nYour branch is up to date\nnothing to commit, working tree clean`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 6, label: 'Read project files + git' };
}

function phase1_withRecall() {
  // Use memory_recall to get project context, still need git + package.json
  const texts = [
    `// memory_recall({ query: "project structure architecture" })\n${buildCompactRecall().split('\n').slice(0, 20).join('\n')}`,
    `// package.json\n${PROJECT_FILES['package.json']}`,
    `// git log --oneline -5\n94071b6 feat(context): 5 tools\n071ce2e refactor(setup): 11 modules\n9237bb2 refactor(server): 10 modules`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 3, label: 'memory_recall + git + package.json' };
}

function phase1_withContext() {
  // Single context_generate call
  const text = `# Project Briefing (full)

## Project
- Name: toon-memory v2.5.2
- Root: /home/egraterol/projects/toon-memory
- Package Manager: npm
- TypeScript: ✓ (v5.8)
- Test Framework: vitest (12 files, 199 tests)
- Build: esbuild (ESM)
- Key Deps: @modelcontextprotocol/sdk, gpt-tokenizer, better-sqlite3, zod

## Git Status
- Branch: main (94071b6)
- 0 uncommitted, 0 untracked

## Memory (26 entries · 8 patterns · 6 bugs · 7 decisions · 5 knowledge)
[1] decision/use-postgres — Postgres for ACID · tags: db;decision
[2] decision/zod-validation — Zod for API validation · tags: api;types
[3] pattern/redis-config — Redis cache TTL 300s, pool 20 · tags: redis;config
[4] pattern/db-migrations — Sequential timestamps, never edit committed · tags: db;pattern
[5] pattern/auth-flow — JWT 15min + refresh 7d, denylist jti · tags: auth;security
[6] bug/redis-pool-fix — max_connections=20 after Black Friday · tags: redis;bug
[7] bug/jwt-refresh-race — jti denylist prevents replay · tags: auth;bug
[8] decision/context-tools — 5 context_* tools, 85% token savings · tags: context;architecture

## Sessions
- egraterol (main, 2m ago): 42 files touched
- ci-bot (main, 1h ago): 3 files touched`;
  return { tokens: t(text), calls: 1, label: 'context_generate (one call)' };
}

// ── PHASE 2: Debug an issue ──────────────────────────────────────────
// Agent is told "Redis connection is failing in production"

function phase2_without() {
  // Naive: grep for redis + read redis.ts + read cache config + read runbook + read tests
  const texts = [
    `// grep -r "redis" src/\n${Object.entries(PROJECT_FILES).filter(([k]) => k.includes('redis') || k.includes('cache')).map(([k, v]) => `// ${k}\n${v}`).join('\n\n')}`,
    `// src/cache/redis.ts (full)\nimport { createClient } from "redis";\nconst pool: RedisClientType[] = [];\nconst MAX = 20;\nexport function getConn() {\n  if (pool.length < MAX) pool.push(createClient({ url: process.env.REDIS_URL }));\n  return pool[pool.length - 1];\n}\n// After Black Friday: MAX=20. Monitor: redis-cli info clients`,
    `// docs/runbook.md\n# Cache runbook\nIf CONNECTION storm, check redis-cli info clients.\nPool capped at max_connections=20.\nDo not raise without reviewing Black Friday postmortem.`,
    `// tests/cache.test.ts\ndescribe("redis pool", () => {\n  it("respects MAX=20", () => {\n    expect(getConn).toThrowWhenPoolFull(20);\n  });\n});`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 4, label: 'Grep + read redis files + runbook + tests' };
}

function phase2_withRecall() {
  // memory_recall finds the bug fix + pattern, still need to read the source file
  const texts = [
    `// memory_recall({ query: "redis connection pool" })\n[1] bug/redis-pool-fix (a1b2c3d4)\n  Added max_connections=20 after connection storm during Black Friday\n  File: src/cache/redis.ts | Tags: redis;bug | Date: 2026-07-10\n  links: redis-config\n\n[2] pattern/redis-config (b2c3d4e5)\n  Cache uses Redis with keyPrefix app: and ttl 300s. Pool capped at 20.\n  File: src/cache/redis.ts | Tags: redis;config | Date: 2026-07-10`,
    `// src/cache/redis.ts (full file)\nimport { createClient } from "redis";\nconst pool: RedisClientType[] = [];\nconst MAX = 20;\nexport function getConn() { ... }`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 2, label: 'memory_recall + read source file' };
}

function phase2_withContext() {
  // context_focus gives everything related to redis in one call
  const text = `# Context Focus: redis connection pool

## Memory (3 relevant entries)
[1] bug/redis-pool-fix
  Added max_connections=20 after Black Friday connection storm
  tags: redis;bug · edges: ->2

[2] pattern/redis-config
  Cache uses Redis with keyPrefix app: and ttl 300s, pool 20
  tags: redis;config · edges: ->1

[3] knowledge/redis-monitoring
  Monitor via redis-cli info clients, alert on >15 connections
  tags: redis;monitoring

## Related Files
- src/cache/redis.ts (2.1 kB) — Pool management, getConn(), closeAll()
- src/config/cache.ts (0.3 kB) — Cache config constants
- docs/runbook.md (0.4 kB) — Cache runbook for incidents
- tests/cache.test.ts (0.8 kB) — Pool behavior tests

## Callers
- src/mcp/tools.ts:85 — context_generate calls readGitIndex()
- src/cache/index.ts:12 — getConn() called from getCache()

## Test Files
- tests/cache.test.ts — Pool MAX test, connection lifecycle`;
  return { tokens: t(text), calls: 1, label: 'context_focus (one call)' };
}

// ── PHASE 3: Implement a feature ─────────────────────────────────────
// Agent is told: "Add rate limiting to the API endpoints"

function phase3_without() {
  // Naive: read API routes + read middleware + read existing patterns + check for rate limiting + read tests
  const texts = [
    `// src/api/routes.ts (excerpt)\nrouter.get("/users", auth, listUsers);\nrouter.post("/users", auth, createUser);\nrouter.get("/posts", auth, listPosts);\nrouter.post("/posts", auth, createPost);\nrouter.get("/health", healthCheck);\n// ... 12 more routes`,
    `// src/api/middleware.ts\nimport { z } from "zod";\nexport function validate(schema) { return (req, res, next) => { ... } }\nexport function auth(req, res, next) { ... }`,
    `// grep -r "rate" src/\n(no matches found)`,
    `// package.json dependencies\n(no rate-limit package found)`,
    `// src/api/middleware/rate-limit.ts\n(file does not exist — needs to be created)`,
    `// tests/api.test.ts (excerpt)\ndescribe("API routes", () => {\n  it("validates input", () => { ... });\n  it("requires auth", () => { ... });\n});`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 6, label: 'Read routes + middleware + grep + check deps + tests' };
}

function phase3_withRecall() {
  // memory_recall finds API patterns, Zod validation decision, still need to read routes
  const texts = [
    `// memory_recall({ query: "api middleware validation" })\n[1] decision/zod-validation (c3d4e5f6)\n  Use Zod for all API validation. Simpler than Joi, better TS inference\n  File: src/api/middleware.ts | Tags: api;types\n\n[2] pattern/auth-flow (d4e5f6a7)\n  JWT access tokens (15min) + refresh tokens (7d). Rotate on use.\n  File: src/auth/jwt.ts | Tags: auth;security`,
    `// src/api/routes.ts (excerpt)\nrouter.get("/users", auth, listUsers);\nrouter.post("/users", auth, createUser);\n// ... 12 more routes`,
    `// src/api/middleware.ts\nimport { z } from "zod";\nexport function validate(schema) { ... }\nexport function auth(req, res, next) { ... }`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 3, label: 'memory_recall + read routes + middleware' };
}

function phase3_withContext() {
  // context_focus gives API-related context + patterns + existing middleware
  const text = `# Context Focus: rate limiting API endpoints

## Memory (4 relevant entries)
[1] decision/zod-validation
  Use Zod for all API validation — schemas co-located with routes
  tags: api;types

[2] pattern/auth-flow
  JWT access (15min) + refresh (7d), rotate on use, denylist jti
  tags: auth;security

[3] decision/no-llm-tools
  All tool logic deterministic, zero LLM calls in implementations
  tags: architecture;decision

[4] pattern/quality-scoring
  Quality score based on tags, links, content, recency
  tags: quality;pattern

## Related Files
- src/api/routes.ts (1.8 kB) — All route definitions (14 routes)
- src/api/middleware.ts (0.6 kB) — validate(), auth() middleware
- src/auth/jwt.ts (1.2 kB) — JWT verification, token rotation
- src/lib/entries.ts (2.1 kB) — Tag inference, merge logic
- tests/api.test.ts (1.4 kB) — API route tests

## Callers
- src/api/routes.ts:1 — All routes use auth middleware
- src/api/middleware.ts:5 — validate() wraps Zod schemas

## Test Files
- tests/api.test.ts — Route tests, validation tests
- tests/auth.test.ts — JWT tests, refresh tests`;
  return { tokens: t(text), calls: 1, label: 'context_focus (one call)' };
}

// ── PHASE 4: Code review ─────────────────────────────────────────────
// Agent reviews: "What changed in the last 3 days? Any decisions I should know about?"

function phase4_without() {
  const texts = [
    `// git log --oneline --since="3 days ago"\n94071b6 feat(context): 5 toon-context tools + shared lib\n071ce2e refactor(setup): split 1685-line monolith\n9237bb2 refactor(server): split 1526-line monolith`,
    `// git diff --stat HEAD~3..HEAD\n 28 files changed, 2847 insertions(+), 2156 deletions(-)\n src/mcp/tools.ts          | 180 +++++++++++\n src/lib/context.ts         | 420 +++++++++++++++++++++\n src/lib/git.ts             | 150 ++++++++\n tests/context-tools.test.ts | 320 +++++++++++++++`,
    `// memory_diff({ since: "3d" })\n📋 Changes since 2026-07-22:\n  NEW [decision] context-tools — 5 context_* tools\n  NEW [pattern] git-reading — Read .git/ without shell\n  NEW [pattern] project-scan — Scan project structure\n  NEW [pattern] code-search — Code search utilities\n  UPDATED [decision] server-refactor — Split into 10 modules`,
    `// memory_recall({ query: "decisions architecture" })\n[1] decision/use-postgres — Postgres for ACID\n[2] decision/zod-validation — Zod for validation\n[3] decision/toon-format — TOON 22% fewer tokens\n[4] decision/context-tools — 5 context_* tools\n[5] decision/no-llm-tools — Zero LLM in tools`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 4, label: 'git log + git diff + memory_diff + memory_recall' };
}

function phase4_withRecall() {
  const texts = [
    `// memory_diff({ since: "3d" })\n📋 Changes since 2026-07-22:\n  NEW [decision] context-tools — 5 context_* tools\n  NEW [pattern] git-reading — Read .git/ without shell\n  NEW [pattern] project-scan — Scan project structure\n  UPDATED [decision] server-refactor — Split into 10 modules`,
    `// git log --oneline --since="3 days ago"\n94071b6 feat(context): 5 toon-context tools\n071ce2e refactor(setup): split monolith\n9237bb2 refactor(server): split monolith`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 2, label: 'memory_diff + git log' };
}

function phase4_withContext() {
  const text = `# Context Diff (3 days)

## Git
- 3 commits since 2026-07-22
- 28 files changed, +2847 -2156 lines
  src/mcp/tools.ts (+180), src/lib/context.ts (+420), src/lib/git.ts (+150)
  tests/context-tools.test.ts (+320)

## Memory (4 new · 1 updated)
- NEW: [decision] context-tools — 5 context_* tools, 85% savings
- NEW: [pattern] git-reading — Read .git/ without shell
- NEW: [pattern] project-scan — Scan project structure
- NEW: [pattern] code-search — Code search utilities
- UPDATED: [decision] server-refactor — Now 10 focused modules

## Key Decisions
- context-tools: Each tool replaces 3-6 manual calls
- server-refactor: 1526→30 lines, 10 modules
- setup-refactor: 1685→60 lines, 11 modules

## Sessions
- egraterol (main): 15 new entries, 12 files
- ci-bot (main): 2 new entries, 3 files`;
  return { tokens: t(text), calls: 1, label: 'context_diff (one call)' };
}

// ── PHASE 5: Session wrap-up ─────────────────────────────────────────
// Agent saves learnings + checks health + prepares for next session

function phase5_without() {
  const texts = [
    `// memory_stats\n📊 Memory: 26 entradas\n  patterns: 8 · bugs: 6 · decisions: 7 · knowledge: 5\n  Quality avg: 0.68 · Graph edges: 18\n  Archived: 12 · Active TTL: 3`,
    `// memory_recall({ compact: true })\n${buildCompactRecall()}`,
    `// Manual: format as markdown for export\n(The agent would need to parse the above and format it)`,
    `// grep -r "orphan" .toon-memory/\n(scanning for orphan links...)`,
    `// Check for expired TTL entries\n(scanning for expired entries...)`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 5, label: 'memory_stats + recall + format + scan orphans + scan TTL' };
}

function phase5_withRecall() {
  const texts = [
    `// memory_stats\n📊 Memory: 26 entradas · Quality avg: 0.68 · Graph edges: 18`,
    `// memory_remember({ category: "knowledge", key: "session-learnings", content: "..." })\n🧠 Guardado: knowledge/session-learnings (x1y2z3w4)`,
  ];
  return { tokens: t(texts.join('\n\n')), calls: 2, label: 'memory_stats + memory_remember' };
}

function phase5_withContext() {
  const text = `# Memory Health (score: 91/100)

## Summary
- 26 entries (8 patterns, 6 bugs, 7 decisions, 5 knowledge)
- 68.2% average quality
- 18 graph edges
- 3 active TTL entries, 0 expired

## Issues (1)
- Orphan link: [pattern] old-cache → [pattern] redis-old (key not found)

## Broken File Refs (0)
- All file references valid

## Stale Sessions
- 0 stale sessions (all heartbeat <1h)`;
  return { tokens: t(text), calls: 1, label: 'context_health (one call)' };
}

// ── run simulation ────────────────────────────────────────────────────
const phases = [
  {
    name: 'Phase 1: Session Start',
    desc: 'Agent gets project context before doing anything',
    without: phase1_without(),
    withRecall: phase1_withRecall(),
    withContext: phase1_withContext(),
  },
  {
    name: 'Phase 2: Debug Issue',
    desc: '"Redis connection is failing in production"',
    without: phase2_without(),
    withRecall: phase2_withRecall(),
    withContext: phase2_withContext(),
  },
  {
    name: 'Phase 3: Implement Feature',
    desc: '"Add rate limiting to API endpoints"',
    without: phase3_without(),
    withRecall: phase3_withRecall(),
    withContext: phase3_withContext(),
  },
  {
    name: 'Phase 4: Code Review',
    desc: '"What changed in the last 3 days?"',
    without: phase4_without(),
    withRecall: phase4_withRecall(),
    withContext: phase4_withContext(),
  },
  {
    name: 'Phase 5: Wrap-up',
    desc: 'Save learnings + health check + prep for next session',
    without: phase5_without(),
    withRecall: phase5_withRecall(),
    withContext: phase5_withContext(),
  },
];

// ── print results ─────────────────────────────────────────────────────
console.log('═'.repeat(110));
console.log('  toon-memory — Full Session Impact Benchmark');
console.log('  Simulates a realistic 5-phase agent session across 3 approaches');
console.log('  Tokenizer: gpt-tokenizer (cl100k_base)');
console.log('═'.repeat(110));

console.log('\n┌─────────────────────────────────────────┬────────────────────┬────────────────────┬────────────────────┐');
console.log('│ Phase                                   │ Without memory     │ memory_recall      │ context_* tools    │');
console.log('│                                         │ (tokens / calls)   │ (tokens / calls)   │ (tokens / calls)   │');
console.log('├─────────────────────────────────────────┼────────────────────┼────────────────────┼────────────────────┤');

let totals = { without: { tokens: 0, calls: 0 }, recall: { tokens: 0, calls: 0 }, context: { tokens: 0, calls: 0 } };

for (const p of phases) {
  const name = p.name.length > 39 ? p.name.slice(0, 38) + '…' : p.name.padEnd(39);
  const w = `${p.without.tokens.toLocaleString().padStart(6)} t / ${String(p.without.calls).padStart(2)} c`;
  const r = `${p.withRecall.tokens.toLocaleString().padStart(6)} t / ${String(p.withRecall.calls).padStart(2)} c`;
  const c = `${p.withContext.tokens.toLocaleString().padStart(6)} t / ${String(p.withContext.calls).padStart(2)} c`;
  console.log(`│ ${name} │ ${w.padStart(18)} │ ${r.padStart(18)} │ ${c.padStart(18)} │`);

  totals.without.tokens += p.without.tokens;
  totals.without.calls += p.without.calls;
  totals.recall.tokens += p.withRecall.tokens;
  totals.recall.calls += p.withRecall.calls;
  totals.context.tokens += p.withContext.tokens;
  totals.context.calls += p.withContext.calls;
}

console.log('├─────────────────────────────────────────┼────────────────────┼────────────────────┼────────────────────┤');
const tw = `${totals.without.tokens.toLocaleString().padStart(6)} t / ${String(totals.without.calls).padStart(2)} c`;
const tr = `${totals.recall.tokens.toLocaleString().padStart(6)} t / ${String(totals.recall.calls).padStart(2)} c`;
const tc = `${totals.context.tokens.toLocaleString().padStart(6)} t / ${String(totals.context.calls).padStart(2)} c`;
console.log(`│ ${'TOTAL'.padEnd(39)} │ ${tw.padStart(18)} │ ${tr.padStart(18)} │ ${tc.padStart(18)} │`);
console.log('└─────────────────────────────────────────┴────────────────────┴────────────────────┴────────────────────┘');

const savedRecall = totals.without.tokens - totals.recall.tokens;
const savedContext = totals.without.tokens - totals.context.tokens;
const pctRecall = ((savedRecall / totals.without.tokens) * 100).toFixed(1);
const pctContext = ((savedContext / totals.without.tokens) * 100).toFixed(1);

console.log('\n' + '═'.repeat(110));
console.log('  IMPACT SUMMARY');
console.log('═'.repeat(110));
console.log(`\n  Without toon-memory:   ${totals.without.tokens.toLocaleString()} tokens  /  ${totals.without.calls} tool calls`);
console.log(`  With memory_recall:    ${totals.recall.tokens.toLocaleString()} tokens  /  ${totals.recall.calls} tool calls  →  ${pctRecall}% fewer tokens, ${totals.without.calls - totals.recall.calls} fewer calls`);
console.log(`  With context_* tools:  ${totals.context.tokens.toLocaleString()} tokens  /  ${totals.context.calls} tool calls  →  ${pctContext}% fewer tokens, ${totals.without.calls - totals.context.calls} fewer calls`);

console.log('\n  ── Per-phase savings (context_* vs without) ──');
for (const p of phases) {
  const saved = p.without.tokens - p.withContext.tokens;
  const pct = ((saved / p.without.tokens) * 100).toFixed(0);
  const barLen = Math.max(0, Math.min(20, Math.round(Math.abs(pct) / 5)));
  const bar = saved >= 0
    ? '█'.repeat(barLen) + '░'.repeat(20 - barLen)
    : '▓'.repeat(barLen) + '░'.repeat(20 - barLen);
  const sign = saved >= 0 ? '' : '+';
  console.log(`  ${p.name.padEnd(28)} ${bar} ${sign}${pct.padStart(3)}%  (${Math.abs(saved).toLocaleString()} tokens ${saved >= 0 ? 'saved' : 'more'})`);
}

console.log('\n  ── Why it matters ──');
console.log(`  • Token cost: ~$0.03/1K tokens (GPT-4 input)`);
console.log(`  • Without memory: ${totals.without.tokens.toLocaleString()} tokens ≈ $${(totals.without.tokens * 0.03 / 1000).toFixed(4)}/session`);
console.log(`  • With context_*: ${totals.context.tokens.toLocaleString()} tokens ≈ $${(totals.context.tokens * 0.03 / 1000).toFixed(4)}/session`);
console.log(`  • At 20 sessions/day: ~$${(savedContext * 0.03 / 1000 * 20).toFixed(2)}/day saved`);
console.log(`  • At 20 sessions/day × 30 days: ~$${(savedContext * 0.03 / 1000 * 20 * 30).toFixed(2)}/month saved`);

console.log('\n  ── Tool call reduction (the real win) ──');
console.log(`  • Without memory: ${totals.without.calls} calls per session`);
console.log(`  • With memory_recall: ${totals.recall.calls} calls (${((1 - totals.recall.calls / totals.without.calls) * 100).toFixed(0)}% fewer)`);
console.log(`  • With context_*: ${totals.context.calls} calls (${((1 - totals.context.calls / totals.without.calls) * 100).toFixed(0)}% fewer)`);
console.log(`  • Each call = network roundtrip + context window usage + latency`);
console.log(`  • 25→5 calls = ~${((1 - totals.context.calls / totals.without.calls) * 100).toFixed(0)}% less latency overhead per session`);

console.log('\n  ── The trade-off: tokens vs calls ──');
console.log(`  • memory_recall uses ${totals.recall.tokens.toLocaleString()} tokens (fewer, cheaper per-token)`);
console.log(`  • context_* uses ${totals.context.tokens.toLocaleString()} tokens (more, but richer context)`);
console.log(`  • context_* trades ~${Math.abs(totals.context.tokens - totals.recall.tokens).toLocaleString()} extra tokens for ${totals.recall.calls - totals.context.calls} fewer calls`);
console.log(`  • In practice: richer context → fewer re-reads → net savings compound`);
console.log(`  • Phases 2-3: context_focus returns MORE context (callers, tests, related files)`);
console.log(`    The agent doesn't need to make 3-4 follow-up calls to find that info`);

console.log('\n' + '═'.repeat(110));

console.log('\n// metrics for the docs site');
console.log(JSON.stringify({
  benchmark: 'full-session-impact',
  approaches: {
    without: { tokens: totals.without.tokens, calls: totals.without.calls },
    memoryRecall: { tokens: totals.recall.tokens, calls: totals.recall.calls },
    contextTools: { tokens: totals.context.tokens, calls: totals.context.calls },
  },
  savings: {
    recallVsWithout: { tokens: savedRecall, pct: Number(pctRecall), callsSaved: totals.without.calls - totals.recall.calls },
    contextVsWithout: { tokens: savedContext, pct: Number(pctContext), callsSaved: totals.without.calls - totals.context.calls },
    contextVsRecall: { tokens: totals.recall.tokens - totals.context.tokens, pct: Number((((totals.recall.tokens - totals.context.tokens) / totals.recall.tokens) * 100).toFixed(1)) },
  },
  costEstimate: {
    perSessionWithout: Number((totals.without.tokens * 0.03 / 1000).toFixed(4)),
    perSessionWithContext: Number((totals.context.tokens * 0.03 / 1000).toFixed(4)),
    dailySaved20Sessions: Number((savedContext * 0.03 / 1000 * 20).toFixed(2)),
    monthlySaved20Sessions: Number((savedContext * 0.03 / 1000 * 20 * 30).toFixed(2)),
  },
  phases: phases.map(p => ({
    name: p.name,
    desc: p.desc,
    without: { tokens: p.without.tokens, calls: p.without.calls },
    recall: { tokens: p.withRecall.tokens, calls: p.withRecall.calls },
    context: { tokens: p.withContext.tokens, calls: p.withContext.calls },
    savingPct: Number(((1 - p.withContext.tokens / p.without.tokens) * 100).toFixed(1)),
  })),
}, null, 2));
