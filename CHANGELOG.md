# Changelog

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
