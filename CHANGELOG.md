# Changelog

## [4.3.5] - 2026-08-04

### Fixed
- **Viewer XSS hardening** — `innerHTML` injection points now escape `& < > " '` via `escHtml`; inline `onclick` handlers on stored `category`/`id` values replaced with `data-id` + delegated click handling (`window.selectEntryById`); category/date/ttl/lastAccessed escaped in the graph, timeline, tooltips, stats bar, and detail panel.
- **Browser launch without shell** — `openBrowser` no longer shells out (`execSync` with string interpolation), using `spawn` with argv arrays and no shell, so viewer URLs can't be interpreted by a shell.
- **Offline d3 loading** — the viewer now resolves `d3.v7.min.js` from the installed package for both CLI (`dist/cli/`) and MCP (`mcp/`) bundles, instead of falling back to the `d3js.org` CDN at runtime.

### Changed
- **Trimmed the last heavy transitive deps** — `@inquirer/prompts` umbrella replaced with direct `@inquirer/checkbox` / `@inquirer/select` / `@inquirer/confirm` imports. Drops `@inquirer/editor` → `@inquirer/external-editor` → `chardet` → `iconv-lite` → `safer-buffer` (unmaintained since 2018) from the install tree. Clean install: ~4.4 MB across 8 packages (was ~5.5 MB / 11), still a single "prompts" family in `dependencies`.

## [4.3.4] - 2026-08-04

### Changed
- **~14× smaller npm install** — `dependencies` trimmed to a single runtime dependency (`@inquirer/prompts`, for the interactive installer). The MCP SDK (`@modelcontextprotocol/sdk`), its HTTP/SSE transitives (hono, ajv, express, jose…), `@modelcontextprotocol/ext-apps`, `zod`, and `@toon-format/toon` are all bundled into the shipped binary (`mcp/server.js`, `dist/`) by esbuild and moved to `devDependencies` (build-only). Verified on a clean `npm pack` → `npm i --omit=dev`: download ~0.85 MB (was ~14 MB), installed ~5.5 MB across 11 packages (was ~33 MB / 120). All 38 MCP tools, the CLI, and the interactive installer work from the minimal install.

## [4.3.3] - 2026-08-04

### Added
- **7 new MCP-capable agents** — expanded auto-detection from 15 to 22 supported agents: **Qwen** (`~/.qwen/settings.json`, hooks + AGENTS.md), **Kimi** (`~/.kimi/mcp.json`), **Goose** (`~/.config/goose/config.yaml`, YAML `extensions`), **Junie** (`.junie/mcp/mcp.json`), **Amp** (`~/.config/amp/settings.json`, nested `amp.mcpServers`), **Grok** (`.grok/config.toml`, `[mcp_servers]` TOML), **Trae** (`.trae/mcp.json`). New `yaml` config format plus nested-key + append-only TOML/YAML writers; `status`/`uninstall` cover global+local paths for all three formats. Marketing/docs updated from "15+" to "20+" across the 8-locale docs site and README.
- **Write-path evidence (F1)** — `memory_remember` now annotates every save with an evidence level stored as the 20th TOON field (`parts[19]`): `verified` when the referenced file exists on disk, `unverified` when it doesn't, `conflict` when it overlaps a `warning` or a critical/high decision (Jaccard, deterministic, offline). Conflicts never block the write — the save succeeds and the response surfaces a `⚠️ Potential CONTRADICTION` warning (max 3 hits, sorted by similarity). Ranking bias: `conflict` +0.15, `verified` +0.03, `unverified` −0.02 (applied in both `graphRecallDetailed` and `generateSmartRecall`). `mergeEntries` keeps `conflict` over any other level. Empty = legacy entry or no file claim (neutral).
- **Encrypted secrets vault (F3)** — `memory_secret` (`store`/`get`/`list`/`forget`) persists credentials in an encrypted sidecar `secrets.toon` (AES-256-GCM, reuses the main crypto, requires `TOON_MEMORY_KEY`). Values are encrypted once per entry and the whole file is encrypted again at rest, so neither values nor key names leak to plaintext while `data.toon` stays a readable open format. New module `src/mcp/vault.ts`.
- **Global memory import/export (F5)** — `memory_export_global` writes project memory to `~/.toon-memory/memory/global.toon` (overridable via `TOON_MEMORY_GLOBAL_FILE`); `memory_import_global` merges cross-project conventions back with a one-shot, deterministic, offline merge by key (`mergeMemoryFiles` in `consolidation.ts`, preserves every field incl. summaries/prefix). Never a live dual-source recall.

### Fixed
- **`mergeMemoryFiles` emitted entries without the two-space TOON indent** — imported/kept entries were `.trim()`-ed and rejoined unindented, so `parseEntries` (which only reads lines starting with two spaces) silently ignored them and global imports were unrecallable. Output is now re-indented.
- **`parseEntries` dropped minimal legacy lines** — entries with fewer than 7 fields (e.g. a hand-written or CLI-style `id|category|key|content` line) were skipped everywhere. They now parse with graceful defaults (≥3 fields required), so legacy global files import and recall correctly.
- **`mergeMemoryFiles` silently skipped minimal incoming lines** — the `< 7` field gate dropped legacy lines without counting them. Now aligned with the local side (≥3).
- **`storeSecret` stored values in plaintext inside the encrypted file** — `getSecret` tried to `decrypt()` a plaintext value and threw "wrong key". Values are now encrypted before they're written (double encryption at rest).

### Tests
- Evidence: contradiction thresholds (warning vs critical), obsolete/draft/self-key exclusions, similarity sorting, evidence levels, `mergeEntries` conflict-wins, 20-field round-trip, and conflict-ranking bias in `generateSmartRecall`
- Vault: store/get/list/forget round-trip, no plaintext at rest (value *and* key name), in-place id preservation, cross-module-instance persistence, missing-key error
- Global import: adds/merges keys, preserves prefix + summaries, evidence carried through the merge, minimal legacy lines accepted, output round-trips through `parseEntries`
- Integration (spawned server): `memory_remember` evidence + CONTRADICTION end-to-end, `memory_secret` full lifecycle, `memory_export_global` → `memory_import_global` cross-project recall

## [4.3.2] - 2026-08-03

### Fixed
- **`memory_archive` no-oped on CLI-initialized projects** — `archiveOldEntries` and `pruneExpiredEntries` only recognized the `entries[N|]` header written by the MCP config writer, but `toon-memory init` creates `data.toon` with a `[N|]` header. On those files both functions returned `0` silently, so `memory_archive`, the MAX_ENTRIES auto-trim, and TTL pruning never ran. They now accept both header conventions, and the count bump preserves the `entries`/`archived` prefix (the archive writer also used to strip `archived` from `archive.toon`, breaking subsequent runs).
- **Hook scripts referenced `capture.js`/`session-start.js` relative to the hook CWD** — `constants.ts` derived the CLI directory from `process.argv[1]`, which the entry points overwrite with `"toon-memory"`, so generated hooks ran `node "capture.js" ...` resolved against whatever directory the agent executed the hook from. Script paths are now derived from `import.meta.url` and are absolute.
- **`toon-memory import` left the entry count stale** — the header regex required a literal `]` right after the count (`entries[\d+\|]`), which no real header has, so the count never updated after importing. It now matches both `entries[N|]` and `[N|]` headers and preserves the prefix.

### Tests
- `archiveOldEntries` works on `[N|]`, `entries[N|]`, and mixed files, and preserves the `archived[` prefix across repeated runs
- `toon-memory init` writes hook scripts with absolute paths; `toon-memory import` bumps the header count on a CLI-style `[N|]` file

## [4.3.1] - 2026-08-03

### Fixed
- **Windows crash `ERR_UNSUPPORTED_ESM_URL_SCHEME`** — the CLI/MCP entry points called `import()` with a raw absolute path (`C:\...`), which Node's ESM loader parses as a URL with scheme `c:` and rejects. Every published version since 2026-07-12 was broken on Windows (both `toon-memory <cmd>` and `toon-memory mcp`). Entry points now convert paths via `pathToFileURL` (new shared helper `src/cli/entry.ts`), and `build:bin` bundles so the helper ships inside `bin/toon-memory.js`.
- **`install.ps1` pinned an ancient release** — the Windows installer hard-coded `toon-memory@1.0.9` (current: 4.3.0) with a placeholder SHA-256 checksum, so it installed a version whose `init` wrote the legacy OpenCode MCP format (`{"command","args"}` without `type`/`enabled`), which OpenCode 1.17+ rejects and blocks the whole config from loading. It now resolves the latest version + `dist.integrity` from the npm registry at runtime (mirrors `install.sh`) and verifies the tarball with SHA-512.
- **OpenCode config migration** — `toon-memory init` already writes the current format (`{ type: "local", command: [...], enabled: true }`); re-running it repairs a legacy entry while preserving every other key (other MCP servers, `$schema`).
- **No silent config wipe** — if an existing agent config is not valid JSON, `installJSONConfig`, the Zed/Continue/OpenClaw writers, and the JSON hook writers now skip with a warning instead of resetting the file to `{}` and overwriting the user's other settings.

### Tests
- `fileImportURL` converts Windows-style and POSIX absolute paths to `file://` URLs (never a drive-letter scheme) — regression guard for the Windows ESM crash
- `installJSONConfig` preserves `$schema` + other MCP servers while migrating a legacy toon-memory entry, and does not overwrite an existing non-JSON config

## [4.3.0] - 2026-08-02

### Added
- **Explicit importance** — `memory_remember({ importance })` accepts `critical`, `high`, `medium`, or `low`. Empty = auto (recency + frequency). Ranking boosts: critical +0.3, high +0.15, medium 0, low −0.1, applied in both the graph and unified recall pipelines (`graphRecallDetailed` and `generateSmartRecall`). `mergeEntries` keeps the higher explicit level on re-save. `buildReason()` reports `explicit {level}` and deep output shows `· importance: {level}`. Stored as the 19th TOON field (`parts[18]`).

### Fixed
- **`memory_remember` merge branch field alignment** — the upsert path wrote `path_scope` into the `priority` slot and `origin` into the `path_scope` slot (both off by one). Now aligned with `mergeEntries`: `priority, path_scope, origin, status, supersededOn, importance`.

### Tests
- Explicit importance levels: parse, ranking boost ordering, merge max-level, `buildReason` explicit reporting
- Round-trip of the 19-field TOON line with `importance` populated and empty

## [4.2.0] - 2026-08-01

### Added
- **Explain WHY** — `memory_recall` and `memory_smart_recall` accept `explain: true` and append a deterministic reason line (`↳ 100% relevance · used 14× · used today · importance HIGH`) to every rendered entry, built by `buildReason()` from relevance %, access count, last-used and importance — no LLM involved
- **Token budgets** — `memory_recall` and `memory_smart_recall` accept `budget_tokens` (0 = no limit); `renderCompact` and the deep-render path accumulate entries greedily via `estimateTokens()` and drop the tail that would exceed the budget
- **Version supersession compaction** — `memory_consolidate mode: "versions"` (with `dryRun`) detects entries describing the same subject at different library versions via `extractVersion()`/`compareVersions()`, marks the older ones `status=obsolete` + `supersededOn=today`, and links the winner
- **Negative memories** — `memory_remember` gains a `warning` category for "do NOT do this" facts; `warning` entries get a +0.2 recall boost in both `graphRecallDetailed` and `generateSmartRecall` (also accepted by session capture promotion)
- **Extended stats** — `memory_stats` now reports `Hit rate` (% recalled at least once), `Duplicate` (% exact-content duplicates) and `Dead` (% obsolete entries)
- **Ranking factors** — recall scoring now includes `languageFamily()` (Unicode-range detection; same-family boost +0.1) and a `path_scope` folder-match boost (+0.05), applied consistently in the graph and unified recall pipelines

### Tests
- `buildReason` reason rendering (relevance %, usage, importance) and `graphRecallDetailed` reason population
- `renderCompact` token-budget behavior (drops tail over budget, keeps all without a budget)
- `generateSmartRecall` explain flag, tiny-budget trimming and `warning`-boost ordering
- `extractVersion` version detection (major.minor, full semver, `v` prefix, no-version)
- `estimateTokens` determinism/monotonicity and `languageFamily` latin/CJK/cyrillic/none

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
- **Agent instructions for `memory_visualize`** — `toon-memory init` now writes "When asked to see the memory graph, call memory_visualize()" into AGENTS.md for all 20+ supported agents
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
