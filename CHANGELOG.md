# Changelog

## [4.1.2] - 2026-08-01

### Fixed
- **Corrupt `data.toon` entries** — 3 entries written with unescaped `|` literals (field-shift corruption) repaired in place with the production serializer; content, dates, and TTLs restored
- **Dynamic entry-count limit in health warnings** — `context_health` and the context brief now read `MAX_ENTRIES` from `config.json` via `getMaxEntries()` instead of a hardcoded `100`
- **Malformed-entry detection** — `generateContextHealth` now scans raw lines and flags shifted/invalid `date`/`ttl` fields as a **Critical** health issue (score −20), so a future unescaped-pipe corruption surfaces instead of silently parsing wrong

### Tests
- 18-field `toToonLine` round-trip with combined pipes/backslashes/multiline hazards
- Field-shift exposure: unescaped pipe is visible as an invalid date field, not silent garbage
- Health detector flags malformed entries and leaves clean data unflagged

## [4.1.1] - 2026-08-01

### Fixed
- **CLI `-h`/`--help` handling** — `toon-memory init` and `toon-memory viewer` now accept `-h`/`--help` and print their usage instead of misparsing args; `viewer --export` no longer misparses a missing `--port` value and warns when `--port` is passed alongside `--export`
- **CLI help text** — `toon-memory` top-level help now documents the `viewer` subcommand

## [4.1.0] - 2026-08-01

### Added
- **LongMemEval-style retrieval benchmark** — Retrieval is now measured against a frozen snapshot of real project memory. Corpus: 187 real `data.toon` entries (snapshot `2026-08-01`), 42 hand-authored gold queries across 6 categories (core-fact, temporal, knowledge-updating, multi-hop, meta/session, distractor). The measured code is the **production pipeline** (`src/lib`), bundled in-memory with esbuild — no faithful copies. Benchmark artifacts in `benchmarks/` (`retrieval-corpus.toon`, `gold-queries.json`, `retrieval-results.json`); reproducible via `npm run bench:retrieval`
- **Deterministic recall** — New optional `today` parameter on `memory_recall` / `memory_smart_recall` pins the reference date for recency, staleness decay, and TTL expiry, so results are reproducible regardless of the wall clock (default remains the current date, backward compatible)
- **Retrieval metrics (R@5 / nDCG@5 / MRR@5)** — RRF mode: 0.861 / 0.764 / 0.788 (97.6% of queries answerable from the top-5); smart (unified) mode: 0.829 / 0.739 / 0.760. Docs home gains a Retrieval block (English) with the numbers and methodology

### Changed
- Docs home benchmarks section: added retrieval metrics block (en locale; other locales guarded)

## [4.0.0] - 2026-08-01

### Changed
- Removed 5 deprecated tool aliases — 35 canonical MCP tools + 4 resources

## [3.7.0] - 2026-07-31

### Added
- **`memory_reflect` MCP tool** — Deterministic memory reflection: ranks entries by staleness, quality, and over-connection. Zero LLM
- **`memory_supersede` MCP tool** — Mark an entry as superseded by a newer one. Sets `status=obsolete`, adds `superseded_by`/`supersedes` links and a `supersededOn` date. Old entries are re-included in recall only when `as_of` predates the supersession
- **`memory_promote` MCP tool** — Deterministic auto-promote: promotes low-confidence drafts to active entries (default threshold 0.65, dedup via Jaccard > 0.5). `dryRun` defaults to `true`
- **`as_of` parameter** — `memory_recall` / `memory_smart_recall` accept an `as_of` date: superseded entries reappear when the point-in-time query predates their supersession
- **Typed graph edges** — Edges now carry types (`type:key`): `superseded_by`, `supersedes`, and `relates`. Explicit `links` become `relates:key` in the graph
- **RRF ranking (Reciprocal Rank Fusion)** — Recall fuses BM25 (×3) + graph-centrality ranks with adaptive `k = clamp(3..60, round(sqrt(n)))`. Benchmark (8 gold queries): RRF nDCG 0.776 == linear 0.776, MRR 0.917 — parity with `linear` at no cost
- **MCP tool annotations** — Descriptions document `rrf` and `as_of` parameters on the relevant tools

### Changed
- Tool count: 37 → 40 MCP tools
- `memory_recall` and `memory_smart_recall` now default to RRF fusion; pass `rrf: false` for the previous linear weighted score
- `memory_compress` now honors supersession links when merging related entries

## [3.6.1] - 2026-07-31

### Fixed
- **MCP Registry description** — Shortened `server.json` description to ≤100 characters so the server passes the MCP Registry's `422` validation

## [3.6.0] - 2026-07-30

### Added
- **Path scoping** — `memory_recall` / `context_focus` accept a `pathScope` that filters entries to a file path (glob patterns supported via `globMatch`)
- **Budget control** — `budget` parameter on recall: `"tiny"` (top 3, ~50 tokens), `"normal"` (top 10), `"deep"` (top 20). Backward compatible with `compact: true`
- **Origin tracking** — Every entry tracks its origin (`human`, `agent`, `inferred`); human assertions get a quality boost
- **Soft-delete & resolve** — `memory_forget` soft-deletes by default (`status=obsolete`); `memory_resolve` restores; `memory_suppress` hides without deleting
- **Proactive recall** — OpenCode plugin auto-recalls entries by file path on every `tool.execute.after` event
- **Enhanced lint** — `context_health` detects missing-evidence (path_scope without file) and stale-claims (overlapping content in same category)

### Changed
- Tool count: 35 → 37 MCP tools
- `memory_forget` default changed from hard-delete to soft-delete

## [3.5.0] - 2026-07-29

### Added
- **`memory_checkpoint` MCP tool** — Session snapshot with 7d TTL, rollback reference for long sessions
- **Session bias** — Recall boosts entries from the current git branch
- **Cold memories** — `memory_stats` flags entries below quality/access thresholds
- **Priority pin** — `memory_pin` with priority 1-5; pinned entries always surface first
- **Merge preview** — Merge-dedup shows a preview before applying

### Changed
- Tool count: 34 → 35 MCP tools

## [3.4.0] - 2026-07-30

### Added
- **`memory_pin` / `memory_unpin` MCP tools** — Pin important entries so they always appear at the top of recall results, even without keyword matches. Unpin removes the flag
- **`memory_search` MCP tool** — Unified search with `category`, `tags`, `from_date`, `to_date` filters. Tag filter uses AND logic — all specified tags must match
- **`memory_tag` MCP tool** — Batch tag operations: `add`, `remove`, or `set` tags on one or more entries by key or id in a single call
- **Hook template comments** — `src/cli/hooks.ts` now includes explanatory comments for each hook script
- **Format descriptors** — TOON format updated: `pinned` field (index 13) for pin/unpin support

### Changed
- Tool count: 32 → 34 MCP tools

## [3.3.0] - 2026-07-30

### Added
- **`memory_visualize` MCP tool** — Opens the interactive D3 force-directed graph viewer inline in MCP Apps–compatible hosts (VS Code Copilot, etc.). No HTTP server needed. Registered via `registerAppTool` with `_meta.ui.resourceUri`
- **`ui://viewer` MCP Apps resource** — Interactive graph viewer rendered as `text/html;profile=mcp-app` via `createUIResource` with `mcpApps` adapter
- **Vendored D3.js** — Removed `d3` npm dependency. D3 v7.9.0 vendored at `src/viewer/d3.v7.min.js` (280 KB), read via `readFileSync` at module load time. Falls back to CDN URL string if local file not found
- **`__MCP_UI__` polyfill** — Prevents host bridge injection crash (`Cannot read properties of undefined (reading 'invoke')`)
- **ResizeObserver guard** — Waits for graph container to have non-zero dimensions before initializing D3. Safe proxy for graph methods before `initGraph()` completes
- **Agent instructions for `memory_visualize`** — `toon-memory init` now writes "When asked to see the memory graph, call memory_visualize()" into AGENTS.md for all 15+ supported agents
- **`height: 100%` layout** — Changed from `100vh` for iframe compatibility in MCP Apps hosts

### Changed
- Tool count: 31 → 32 MCP tools
- Resource count: 3 → 4 MCP resources
- `@modelcontextprotocol/sdk@^1.30.0` — Migrated from `@modelcontextprotocol/server@^2.0.0-beta.5`

## [3.2.0] - 2026-07-29

### Added
- **Interactive D3 force-directed graph viewer** — `toon-memory viewer` CLI command with live HTTP server (`--port`) and static export (`--export`). Full interactive graph with physics, zoom/pan, search, filters, timeline, stats, detail panel, path finder, dark/light theme, and PNG/SVG export
- **Embedded viewer on homepage** — Self-contained `embed.html` generated from live memory data (173 entries, 421 edges) embedded across all 8 locale homepages
- **`memory_session_store` MCP module** — Session-aware memory store with create/touch/addFile/getSessions for tracking agent sessions
- **`summarize_project_context` MCP prompt** — Registers a new prompt that analyzes TOON memory state and generates a compact project summary
- **Auto-checkpoint system** — Detects complex work patterns (many tool calls without recall) and auto-generates checkpoint entries to preserve working state
- **Auto-connect graph edges** — Entries sharing 2+ tags are automatically linked in the graph, improving discoverability without manual links

### Changed
- Tool count: 29 → 31 MCP tools
- `toon-memory viewer` added to CLI help and README

## [3.1.0] - 2026-07-28

## [2.10.0] - 2026-07-27

### Added
- **`memory_compress` MCP tool** — LLM-powered two-step compression: summarize + overwrite. Uses `anthropic` or `openai` CLI if available, otherwise returns prompt for manual compression
- **`memory_compress_all` MCP tool** — Batch compression: overwrites all entries under 100 tokens with a compressed version (deterministic, no LLM)
- **`memory_primer` MCP tool** — One-call context primer: top memories + categories + session file changes. Auto-injected at session start via `systemPrimer()`
- **`memory_merge_sessions` MCP tool** — Merge observations across sessions: finds all sessions for a file, deduplicates, auto-promotes to memory
- **`memory_export_gist` MCP tool** — Export memory entries to a GitHub Gist (public or private). Uses `GITHUB_TOKEN` or `gh` CLI for auth
- **`memory_import_gist` MCP tool** — Import entries from a GitHub Gist. Merges with existing entries (union of tags, max confidence)
- **Verbatim mode** — `config.verbatim` option preserves original entries instead of overwriting on save
- **Near-duplicate detection** — Consolidation now detects near-duplicate entries via Jaccard similarity (threshold 0.7) and merges them
- **`lastAccessed` tracking** — `bumpAccessed()` now writes an ISO timestamp so memory_stats can show "Most accessed" entries
- **Quality scoring v2** — `qualityScore()` enhanced with `accessed` count (more accesses = higher score) and `lastAccessed` recency
- **Session-start auto-injection** — `systemPrimer()` function in session-start hook automatically injects top 5 memories at session start
- **6 new documentation pages** — Competitive analysis, alternatives analysis, implementation plan, deferred ideas (gitignored)
- **278 tests** — up from 238; all MCP tools have unit tests

### Changed
- Tool count: 21 → 27 MCP tools
- `GraphEntry` interface extended with `lastAccessed?: string` field
- `parseEntries()` handles field 12 (`lastAccessed`)
- `mergeEntries()` preserves `lastAccessed` field
- Test updated: tool count 21 → 27

## [2.9.8] - 2026-07-27

### Fixed
- Flaky `readRecentCommits` count test — use `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` env vars for deterministic timestamps

## [2.9.7] - 2026-07-27

### Changed
- Updated `@modelcontextprotocol/server` to `2.0.0-beta.5`

## [2.9.6] - 2026-07-27

### Fixed
- `readMemory()` and `writeMemory()` now throw clear errors when encryption is enabled but `TOON_MEMORY_KEY` is not set (previously failed silently)

## [2.9.5] - 2026-07-26

### Fixed
- Handle SIGINT (Ctrl+C) gracefully during interactive prompts — no more unhandled ExitPromptError crash

## [2.9.4] - 2026-07-26

### Fixed
- Flaky encrypt/decrypt tamper tests: use Buffer XOR instead of string replace for deterministic failures

## [2.9.3] - 2026-07-26

### Fixed
- Clamp importance score to [0,1] to prevent values > 1.0 at timezone boundaries
- Added `memory_backup` to README tools table
- Fixed remaining "20 tools" → "21 tools" refs in ES docs and i18n stats

## [2.9.2] - 2026-07-26

### Fixed
- Suppress git init hints in tests with `--initial-branch=main`

## [2.9.1] - 2026-07-26

### Fixed
- Flaky git test: use unique timestamps per commit to avoid CI failures when commits share the same second

## [2.9.0] - 2026-07-26

### Added
- **`memory_backup` MCP tool** — creates timestamped backups of memory file with auto-pruning (keeps last 10)
- **Capture hooks for Gemini, Cursor, and Windsurf** — all three agents now capture activity like Claude and Codex
- **Observations auto-pruning** — observations.toon capped at 500 entries, prevents unbounded growth
- **Configurable MAX_ENTRIES** — set `maxEntries` in config.json (default 100)
- **SEO landing pages** — 6 EN + 6 ES long-tail pages, 3 EN + 3 ES blog posts, sitemap, JSON-LD, meta keywords
- **Infrastructure tests** — 34 new tests for lock, atomic write, crypto, scoring (238 total)

### Fixed
- **archive.toon header mismatch** — header now matches full 12-field TOON format
- **mergeEntries confidence loss** — preserves accessed field and handles malformed entries gracefully
- **memory_recall flat mode** — delegates to graphRecallDetailed, eliminating ~80 lines of duplicated BM25 logic

### Changed
- **All UI messages in English** — ~200 Spanish messages translated across source and tests
- **entryScore consolidated** — delegates to shared importance() in lib/utils.ts
- **context_focus filename search** — extracts file patterns (auth.ts) and path patterns (src/auth) from task text
- **context_diff session tracking** — shows per-session file activity and soft conflicts between parallel sessions
- **npm icon fix** — SiteHeader uses correct SVG path from Starlight docs

## [2.5.1] - 2026-07-25

### Fixed
- Escaped `<` character in TOON format docs (`toon.mdx`) that broke Astro/MDX build

## [2.5.0] - 2026-07-25

### Added
- **Agent selection in `toon-memory init`** — interactive checkbox to pick which agents to configure (via `@inquirer/prompts`)
- `--agent` flag for non-interactive agent selection (e.g., `toon-memory init --agent opencode --agent claude`)
- `--scope` flag for non-interactive scope selection (e.g., `toon-memory init --agent opencode --scope global`)
- `memory_smart_recall` MCP tool — unified search combining BM25 + graph centrality + quality score + freshness decay in one call
- Quality scoring (0-1) auto-calculated for every entry based on tag coverage, link richness, content detail, recency, and specificity
- Confidence scores (0-1) — 1.0 for user-asserted memories, 0.65-0.75 for inferred/gathered
- Merge-deduplication — re-saving an entry with same key merges tags, links, quality (max), and confidence (max)
- System Primer — auto-generated knowledge map exposed as MCP resource `toon://memory/summaries`
- Extended TOON format with 4 new fields: `accessed`, `links`, `quality`, `confidence` (12 total)
- Quality-weighted ranking in `memory_recall` results
- Quality distribution breakdown in `memory_stats`
- Benchmark comparison table in README (toon-memory vs competitors)
- CHANGELOG.md

### Changed
- `toon-memory init` now shows interactive agent selection when no `--agent` flag and TTY is present
- `toon-memory` (no args) uses `@inquirer/prompts` for agent selection, scope, and confirmation
- CLI build uses `--packages=external` to resolve CJS dependencies correctly
- Documentation updated across English and Spanish: 14 tools, new features, extended TOON format

### Removed
- Custom `runAgentChecklist` keypress handler (~80 lines) — replaced by `@inquirer/prompts`
- `readline` imports (`createInterface`, `emitKeypressEvents`) from CLI setup

## [2.4.5] - 2026-07-24

### Fixed
- CLI dump command avoids 'undefined' in output for entries with empty/short fields

### Added
- Passive OpenCode memory injection via dump + autoload plugin

## [2.4.3] - 2026-07-23

### Fixed
- Resolve package.json by walking up so status/upgrade show correct version
- Sync package-lock.json version

## [2.4.1] - 2026-07-22

### Changed
- Navigable checklist installer (arrows/space/Enter) instead of text prompt

### Fixed
- Security: drop child_process — read git branch from .git/HEAD via fs
