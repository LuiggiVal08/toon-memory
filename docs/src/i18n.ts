export const content = {
	en: {
		nav: {
			docs: 'Docs',
			features: 'Features',
			viewer: 'Viewer',
			benchmarks: 'Benchmarks',
			faq: 'FAQ',
			npm: 'npm',
			github: 'GitHub',
		},
		hero: {
			tagline: 'The Continuity Layer for AI Agents',
			subtitle: "AI agents shouldn't have to relearn your project every session. toon-memory preserves your project's knowledge, decisions, and conventions across sessions — locally and privately, through MCP.",
			poweredBy: 'Powered by TOON',
			getStarted: 'Get Started',
			viewGithub: 'View on GitHub',
			copy: 'Copy',
			copied: 'Copied!',
			installCmd: 'npm install -g toon-memory',
		},
		problem: {
			title: 'Why do agents lose context between sessions?',
			subtitle: 'AI coding agents start every session with amnesia',
			cards: [
				{
					icon: '🌀',
					title: 'Context resets daily',
					body: 'Every new session, your agent forgets the decisions, patterns, and bugs it learned yesterday. You re-explain the same context over and over.',
				},
				{
					icon: '🔍',
					title: 'Hunting through history',
					body: 'Without memory, agents grep git history and re-read files to reconstruct why something was built a certain way — burning tokens and time.',
				},
				{
					icon: '📋',
					title: 'Copy-paste notes',
					body: 'Developers paste context between chats by hand. It is fragile, gets stale, and never reaches the next autonomous run.',
				},
			],
			resolution:
				'toon-memory gives your agent a persistent, queryable memory — so context survives every session, automatically.',
		},

		continuity: {
			kicker: 'Get to know toon-memory',
			title: 'The Continuity Layer for your coding workflow',
			subtitle:
				'A memory stores facts; a continuity layer preserves how your project works — so every session starts where the last one ended.',
			items: [
				{
					icon: '🧭',
					title: 'Decisions',
					body: 'The "why" behind every choice — frameworks, libraries, trade-offs. Recalled when it counts, never re-debated.',
				},
				{
					icon: '📏',
					title: 'Conventions',
					body: 'Naming, structure, and style rules your team has agreed on. Followed without being re-explained.',
				},
				{
					icon: '🧠',
					title: 'Context',
					body: 'Architecture, environment, and operational knowledge that doesn\'t live in any single file.',
				},
				{
					icon: '🤝',
					title: 'Shared understanding',
					body: 'Project knowledge and team decisions available to every agent and every session.',
				},
			],
			closing:
				'toon-memory introduces the concept of a continuity layer: a lightweight system that preserves project knowledge, decisions, and context between AI sessions — no cloud services or heavy infrastructure.',
		},

		benefits: {
			kicker: 'Why developers choose toon-memory',
			title: 'Built around the real problems',
			subtitle: 'Not a list of tools — a set of outcomes.',
			groups: [
				{
					icon: '🧭',
					title: 'Persistent project knowledge',
					items: [
						'Remembers decisions and the reasons behind them',
						'Remembers architecture and conventions',
						'Accumulates between sessions — never re-explained',
					],
				},
				{
					icon: '🔒',
					title: 'Privacy-first',
					items: [
						'100% local — no cloud, no server, no telemetry',
						'Optional AES-256-GCM encryption',
						'You own the memory file, like any source file',
					],
				},
				{
					icon: '⚡',
					title: 'Lightweight',
					items: [
						'Native TOON format — 22% fewer tokens than JSON',
						'Zero dependencies, runs on any Node.js 18+',
						'Deterministic logic — no LLM calls, no API keys',
					],
				},
				{
					icon: '🛰️',
					title: 'Universal',
					items: [
						'Works with 15+ agents: Claude Code, Codex, Gemini CLI, Cursor, OpenCode and more',
						'Standard MCP — switch agents without losing context',
						'Project memory shared by every team member',
					],
				},
			],
		},
		features: {
			cards: [
			{
				icon: '🧩',
				title: 'A memory toolkit, not a protocol',
				body: 'Everything your agent needs to remember, recall, and reason — grouped by purpose, with resources for direct context reading and an interactive graph viewer.',
				toolGroups: [
					{ label: 'Core Memory', tools: ['memory_remember', 'memory_recall', 'memory_forget', 'memory_stats', 'memory_diff', 'memory_suggest', 'memory_summary', 'memory_archive', 'memory_checkpoint', 'memory_visualize', 'memory_pin', 'memory_unpin', 'memory_tag', 'memory_reflect', 'memory_promote'] },
					{ label: 'Search & Intelligence', tools: ['memory_smart_recall', 'memory_captured', 'memory_consolidate', 'memory_graph_path', 'memory_search'] },
					{ label: 'Context Briefing', tools: ['context_brief', 'context_generate', 'context_diff', 'context_focus', 'context_health', 'context_export'] },
					{ label: 'Compression', tools: ['memory_compress', 'memory_primer'] },
					{ label: 'Session Management', tools: ['memory_sessions', 'memory_merge_sessions'] },
					{ label: 'Sync & Security', tools: ['memory_export_gist', 'memory_import_gist', 'memory_encrypt', 'memory_decrypt', 'memory_backup'] },
				],
				wide: true,
			},
				{
					icon: '⭐',
					title: 'Multi-Agent',
					body: 'Works with 15+ AI coding agents. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue, Codex, Gemini, Zed, Antigravity, Aider, KiloCode, OpenClaw — zero configuration.',
					tags: ['OpenCode', 'Claude', 'Cursor', 'Windsurf'],
				},
				{
					icon: '📄',
					title: 'TOON Format',
					body: '22% fewer tokens than JSON (measured). Custom encoding designed for LLM comprehension and token efficiency.',
					stats: ['22% less tokens', '1.3x faster parse'],
				},
				{
					icon: '🔎',
					title: 'Smart Recall',
					body: 'Graph-aware recall re-ranked by BM25 relevance and graph centrality (hubs surface even without the query word). Per-hop decay keeps distant context low. Token-efficient `compact` mode returns numeric-indexed, snippet-truncated results.',
					stats: ['BM25', 'Centrality', 'compact'],
				},
				{
					icon: '🧠',
					title: 'Smart Memory',
					body: 'Auto-tag inference from a built-in vocabulary plus your project dependencies, quality scoring with staleness decay, confidence scores, merge-dedup, related entry suggestions, memory diff, and configurable TTL for temporary context.',
					stats: ['Auto-tags', 'Quality', 'Staleness decay'],
				},
				{
					icon: '⚡',
					title: 'Intelligent Auto-Loading',
					body: 'OpenCode plugin auto-recalls relevant memory by file path on every tool execution — no dump-all, no wasted context. Injects only what matters via setContext(), saving ~90% tokens per interaction.',
					stats: ['~90% fewer tokens', 'File-path recall', 'Zero config'],
				},
				{
					icon: '🗜️',
					title: 'Compression',
					body: 'LLM-powered compression for related entries, batch cleanup of low-quality entries deterministically (no LLM), merge similar entries by Jaccard similarity, and auto-injected system primer at session start.',
					stats: ['14% fewer tokens', 'Merge similar', 'Auto-primer'],
				},
				{
					icon: '🔒',
					title: 'Encryption & Security',
					body: 'AES-256-GCM for sensitive data. Auto-archive old entries. Watch mode for automatic backup every N minutes.',
					stats: ['AES-256-GCM', 'Auto-backup'],
				},
				{
					icon: '🔄',
					title: 'Sync & Sessions',
					body: 'Export/import memory via GitHub Gists. Merge observations across parallel sessions. Detect soft conflicts between agents.',
					stats: ['Gist sync', 'Cross-session'],
				},
				{
					icon: '🔗',
					title: 'Knowledge Graph',
				body: 'Entries linked via `links` or `[[key]]` refs form a queryable graph. BFS shortest-path finds connection chains between any two entries. Centrality scoring surfaces hub knowledge — no embeddings, no LLM, fully offline.',
					stats: ['Graph path', 'Centrality', 'Offline'],
				},
			],
		},
		agents: {
			title: 'Works with 15+ AI coding agents',
			subtitle: 'Zero configuration — toon-memory auto-detects and configures each one',
		},
		stats: {
			items: [
				{ number: '97.6%', label: 'Recall from top-5 (R@5 0.861)' },
				{ number: '15', label: 'Agents' },
				{ number: '80%', label: 'Fewer Tool Calls / session' },
				{ number: '0', label: 'Config Needed' },
			],
		},
		howItWorks: {
			title: 'How does it work?',
			subtitle: 'Five steps from amnesia to memory',
			steps: [
				{ n: 1, title: 'Install', body: 'One command. Zero configuration for 15+ agents.', code: 'npm install -g toon-memory' },
				{
					n: 2,
					title: 'Remember',
					body: 'Save decisions, patterns, and bugs as you work — with auto-tag inference and optional TTL.',
					code: `memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  file: "src/types.ts"
})`,
				},
				{
					n: 3,
					title: 'Recall',
					body: 'Your agent queries memory on demand — no re-explaining, no token waste.',
					code: `memory_recall({ query: "validation" })
// [decision] use-zod (a1b2c3d4)
//   Use Zod for validation — src/types.ts`,
				},
				{
					n: 4,
					title: 'Auto-Inject',
					body: 'System primer auto-injects at session start — top memories, categories, patterns. Zero tool calls.',
					code: `// Session start (automatic)
toon-memory:
  Top memories:
    [pattern] retry-with-backoff: Exponential backoff...
    [decision] use-zod: Use Zod for validation...
  Categories: pattern: 5, bug: 12, knowledge: 25`,
				},
				{
					n: 5,
					title: 'Context',
					body: 'One call gives your agent everything: project, git, memory, sessions. 80% fewer tool calls.',
				code: `context_generate({})
// # Project Briefing (full)
// ## Project — toon-memory v4.3.0
// ## Git — branch: main, 3 commits
// ## Memory — 26 entries, 18 edges
// ## Sessions — 2 active`,
				},
			],
		},
		tips: {
			title: 'Memory Tips',
			subtitle: 'Get the most out of toon-memory with these patterns',
			items: [
				{
					n: 1,
					title: 'Save decisions immediately',
					body: 'When you make a choice, save it right away. Add context on <em>why</em> you chose option A over B — future you will thank yourself.',
				},
				{
					n: 2,
					title: 'Use consistent keys',
					body: 'Prefix keys by domain: <code class="inline-code">db:redis-config</code>, <code class="inline-code">auth:jwt</code>. Makes recall faster and avoids collisions.',
				},
				{
					n: 3,
					title: 'Tags auto-infer',
					body: 'Leave tags empty and the system infers them from content — redis, auth, api, db, and 16+ more categories. Or add them manually for precise control.',
				},
				{
					n: 4,
					title: 'Use TTL for temp context',
					body: 'Deadlines, sprints, time-sensitive notes — set a <code class="inline-code">ttl: "7d"</code> and they auto-expire. No manual cleanup needed.',
				},
			],
		},
		comparison: {
			title: 'Same project. Two sessions.',
			subtitle: 'What your agent remembers changes the outcome.',
			beforeTitle: 'Without toon-memory',
			afterTitle: 'With toon-memory',
			thinkingBefore: 'Thinking…',
			thinkingAfter: 'Recalling…',
			before: [
				{ session: 'Session 1' },
				{ user: 'Use Sequelize.' },
				{ assistant: 'OK.' },
				{ note: 'Held in session context — tokens accumulate.', tone: 'warn' },
				{ session: 'Session 2' },
				{ user: "What's our ORM?" },
				{ note: 'No memory between sessions.', tone: 'error' },
				{ assistant: "I don't know." },
			],
			after: [
				{ session: 'Session 1' },
				{ user: 'Use Sequelize.' },
				{ cmd: '$ memory_remember({ category: "decision", key: "orm:sequelize", content: "Use Sequelize as ORM" })' },
				{ assistant: 'OK.' },
				{ note: 'Saved to memory.' },
				{ session: 'Session 2' },
				{ user: "What's our ORM?" },
				{ note: 'Recalled from memory.' },
				{ assistant: "You're using Sequelize." },
			],
		},
		codeExamples: {
			quickExample: 'Quick Example',
			quickInstall: 'Quick Install',
			exampleCode: `// Save a decision (with auto-tag inference)
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  file: "src/types.ts"
})
// 🏷️ Tags inferred: types

// Save with TTL (expires in 7 days)
memory_remember({
  category: "knowledge",
  key: "sprint-deadline",
  content: "Sprint ends July 18",
  ttl: "7d"
})

// See what changed since last session
memory_diff({ since: "24h" })

// Search memory
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20`,
			installCode: `# npm
npm install -g toon-memory

# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex`,
		},
		benchmarks: {
			title: 'Benchmarks',
			subtitle: 'Measured, not assumed',
			tabs: {
				ranking: 'Ranking quality',
				workflow: 'Workflow savings',
				format: 'TOON format',
			},
			retrieval: {
				subtitle: 'LongMemEval-style retrieval on a frozen 187-entry real snapshot — 42 gold queries',
				what: 'The unified recall pipeline finds the right entry in the top 5',
				metricLabel: 'Metric',
				linear: 'Linear',
				rrf: 'RRF',
				smart: 'Unified',
				metricRows: [
					{ metric: 'R@5', gloss: 'gold entry in the top 5', linear: '0.643', rrf: '0.861', smart: '0.829' },
					{ metric: 'nDCG@5', gloss: 'ordering quality', linear: '0.654', rrf: '0.764', smart: '0.739' },
					{ metric: 'MRR@5', gloss: 'position of the right hit', linear: '0.776', rrf: '0.788', smart: '0.760' },
				],
				result: '97.6% of queries answered from the top-5',
				note: 'Real <code>data.toon</code> snapshot (187 entries, 2026-08-01), deterministic <code>today</code>, read-only, no code copies; 2 priority meta-entries excluded. Reproducible: <code>npm run bench:retrieval</code>.',
			},
			workflow: {
				subtitle: 'Token and tool-call savings measured across a real session',
				stats: [
					{ num: '~90%', cap: 'fewer tokens', feature: 'Auto-loading', from: 'Dumping all memory at every step', to: 'Only the task-relevant entries' },
					{ num: '80%', cap: 'fewer tool calls', feature: 'Tool calls', from: '25 manual calls', to: '5 calls per session' },
					{ num: '68%', cap: 'fewer tokens', feature: 'Compact recall', from: 'Reading whole files', to: 'One compact recall' },
					{ num: '58%', cap: 'fewer tokens', feature: 'System primer', from: 'Gathering context by hand', to: 'Primer injected automatically' },
					{ num: '14%', cap: 'fewer tokens', feature: 'Batch compress', from: 'Scattered low-quality entries', to: 'One consolidated summary' },
				],
				cards: [
					{
						feature: 'Auto-loading',
						num: '~90%',
						cap: 'fewer tokens',
						from: 'Dumping all memory at every step',
						to: 'Only the task-relevant entries',
						more: '80% fewer tool calls (25 → 5)',
					},
					{
						feature: 'Compact recall',
						num: '68%',
						cap: 'fewer tokens',
						from: 'Reading whole files',
						to: 'One compact recall',
						more: '58% fewer tokens (system primer)',
					},
					{
						feature: 'Batch compress',
						num: '14%',
						cap: 'fewer tokens',
						from: 'Scattered low-quality entries',
						to: 'One consolidated summary',
					},
				],
				note: 'Auto-loading: the OpenCode plugin injects only file-relevant memory instead of dumping all entries. Full session: start → debug → implement → review → wrap-up. Reproducible: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
			},
			format: {
				subtitle: 'The TOON format is built for LLMs, not for humans',
				stats: [
					{ num: '22.5%', cap: 'fewer tokens than JSON' },
					{ num: '30.5%', cap: 'on a single entry' },
					{ num: '1.3x', cap: 'faster to parse' },
				],
				note: 'Measured with <code>gpt-tokenizer</code> (cl100k_base) over 16 representative memory entries, comparing the real on-disk TOON format against compact JSON. Reproducible: <code>npm run bench</code>.',
			},
		},
		tools: {
			title: 'A complete memory toolkit',
			subtitle: 'Everything your agent needs to remember, recall, and reason',
			resourcesLabel: 'Resources:',
			groups: {
				core: 'Core Memory',
				search: 'Search & Intelligence',
				context: 'Context Briefing',
				compress: 'Compression',
				sessions: 'Session Management',
				sync: 'Sync & Security',
			},
			cards: [
				{ name: 'memory_remember', title: 'Save to Memory', desc: 'Store decisions, patterns, bugs, knowledge, or warnings (negative "do NOT do this" memories, recalled with a boost) — persisted across sessions with auto quality scoring.', group: 'core' },
				{ name: 'memory_recall', title: 'Search Memory', desc: 'Query the knowledge graph before reading files. Quality-weighted results. Supports path scoping (path_scope) and budget control (tiny/normal/deep). explain: true appends a per-entry reason line; budget_tokens caps output by estimated tokens.', group: 'core' },
				{ name: 'memory_forget', title: 'Lifecycle Ops', desc: 'Soft-delete (obsolete), hard-delete, restore, or supersede an entry by key or id via the action parameter.', group: 'core' },
				{ name: 'memory_stats', title: 'Memory Stats', desc: 'Show statistics about the project memory, including quality distribution, most accessed entries, and hit-rate/duplicate/dead metrics.', group: 'core' },
				{ name: 'memory_diff', title: 'Memory Diff', desc: 'See what changed since your last session.', group: 'core' },
				{ name: 'memory_suggest', title: 'Suggest Related', desc: 'Surface related entries for a given context.', group: 'core' },
				{ name: 'memory_summary', title: 'File Summary', desc: 'Save or retrieve a file summary to save tokens.', group: 'core' },
				{ name: 'memory_archive', title: 'Archive Old', desc: 'Move entries older than 30 days to keep memory clean.', group: 'core' },
				{ name: 'memory_smart_recall', title: 'Smart Recall', desc: 'Unified search combining BM25 + graph centrality + quality score + freshness + session bias in one call. Supports explain: true (per-entry reasons) and budget_tokens (output cap).', group: 'search' },
				{ name: 'memory_captured', title: 'Captured Activity', desc: 'View auto-captured hook activity log — promote observations to memory.', group: 'search' },
				{ name: 'memory_checkpoint', title: 'Session Checkpoint', desc: 'Snapshot the current memory state with 7d TTL — rollback reference for long sessions.', group: 'core' },
				{ name: 'memory_consolidate', title: 'Consolidate', desc: 'Dedupe identical entries, merge near-duplicates (Jaccard >50%), batch-compress low-quality entries, or retire older library-version entries (mode: "versions") — deterministic, no LLM.', group: 'search' },
				{ name: 'memory_graph_path', title: 'Graph Path', desc: 'BFS shortest-path between two entries. Trace knowledge chains across your graph without embeddings or LLM.', group: 'search' },
				{ name: 'context_brief', title: 'Context Briefing', desc: 'One-call context briefing: memory + sessions + health in compact markdown. Zero LLM.', group: 'context' },
				{ name: 'context_generate', title: 'Full Project Briefing', desc: 'One-call briefing: project structure + git state + memory + sessions. Replaces 6 manual calls. Saves 93% tokens.', group: 'context' },
				{ name: 'context_diff', title: 'Incremental Briefing', desc: 'Git commits + modified files + new/updated memory since last session. Saves 72% tokens.', group: 'context' },
				{ name: 'context_focus', title: 'Targeted Briefing', desc: 'Relevant memory + related files + callers + test files for a specific query.', group: 'context' },
				{ name: 'context_health', title: 'Health Audit', desc: 'Orphan links, duplicates, broken file refs, expired TTL, stale sessions. Score 0–100.', group: 'context' },
				{ name: 'context_export', title: 'Export as Markdown', desc: 'Export memory as injectable markdown for system prompts. Saves 82% tokens.', group: 'context' },
				{ name: 'memory_compress', title: 'LLM Compress', desc: 'LLM-powered two-step compression: summarize + overwrite. Uses Anthropic/OpenAI CLI if available.', group: 'compress' },
				{ name: 'memory_primer', title: 'Context Primer', desc: 'One-call context primer: top memories + categories + session file changes. Auto-injected at session start.', group: 'compress' },
				{ name: 'memory_sessions', title: 'Sessions', desc: 'Show active agent sessions and detect soft conflicts.', group: 'sessions' },
				{ name: 'memory_merge_sessions', title: 'Merge Sessions', desc: 'Merge observations across parallel sessions for a file. Deduplicates and auto-promotes.', group: 'sessions' },
				{ name: 'memory_export_gist', title: 'Export to Gist', desc: 'Export memory entries to a GitHub Gist (public or private). Uses GITHUB_TOKEN or gh CLI.', group: 'sync' },
				{ name: 'memory_import_gist', title: 'Import from Gist', desc: 'Import entries from a GitHub Gist. Merges with existing entries (union of tags, max confidence).', group: 'sync' },
				{ name: 'memory_encrypt', title: 'Enable Encryption', desc: 'AES-256-GCM encryption with an auto-generated key.', group: 'sync' },
				{ name: 'memory_decrypt', title: 'Disable Encryption', desc: 'Decrypt and disable encryption.', group: 'sync' },
				{ name: 'memory_backup', title: 'Backup Memory', desc: 'Create timestamped backup of memory file. Auto-prunes to 10 most recent.', group: 'sync' },
				{ name: 'memory_visualize', title: 'Open Graph Viewer', desc: 'Render the interactive memory graph inline in MCP Apps–compatible hosts. Force-directed graph, stats, timeline, detail panel.', group: 'core' },
				{ name: 'memory_pin', title: 'Pin Entry', desc: 'Pin important entries with priority 1-5 — they always appear first in recall results sorted by priority, even without a keyword match.', group: 'core' },
				{ name: 'memory_unpin', title: 'Unpin Entry', desc: 'Remove the priority flag from an entry.', group: 'core' },
				{ name: 'memory_search', title: 'Unified Search', desc: 'Search memory with category, tags, and date range filters. Tag filter uses AND logic — all specified tags must match. sessionBias boosts entries from the current git branch.', group: 'search' },
				{ name: 'memory_tag', title: 'Batch Tag Ops', desc: 'Add, remove, or set tags on one or more entries by key or id in a single call.', group: 'core' },
				{ name: 'memory_reflect', title: 'Memory Reflect', desc: 'Deterministically rank entries by staleness, quality, and over-connection to surface what needs attention or cleanup. Zero LLM.', group: 'core' },
				{ name: 'memory_promote', title: 'Auto-Promote', desc: 'Promote low-confidence drafts to active entries deterministically (threshold 0.65, Jaccard dedup > 0.5). dryRun by default.', group: 'core' },
			],
		},
		graphSection: {
			title: 'Your memory, as a graph',
			subtitle:
				'Connect decisions to their specs, bugs, and architecture. Recall returns the right context — not just keyword matches.',
			points: [
				'Link entries with `links` or `[[key]]` refs — no embeddings, no LLM',
				'`memory_recall({ mode: "graph" })` expands a relationship-aware subgraph',
			],
			launchLabel: 'Launch interactive viewer',
		},
		viewerSection: {
			title: 'Memory Graph Viewer',
			subtitle: 'Visualize your memory as an interactive force-directed graph. See entries, connections, categories, and access patterns at a glance.',
			capsLabel: 'Inside the viewer:',
			caps: ['Search', 'Path finder', 'PNG / SVG export', 'Dark & light themes'],
			features: [
				'<strong>CLI viewer:</strong> <code>npx toon-memory viewer</code> starts an HTTP server',
				'<strong>Inline MCP Apps viewer:</strong> call <code>memory_visualize()</code> to render the graph directly in MCP Apps–compatible hosts — no server needed',
				'Hover nodes for tooltips with content preview and quality score',
				'Click to select and center; double-click to open details',
				'Search filters entries and highlights matching nodes with a pulsing glow',
				'Path finder finds and highlights the shortest connection between two entries',
				'Adjustable physics, dark/light theme, PNG/SVG export',
			],
		},
		smartRecallSection: {
			title: 'Smart, token-efficient recall',
			subtitle:
				'Recall is re-ranked offline by BM25 relevance and graph centrality — then shrunk to a compact form when tokens matter. Quality scores and freshness boost the best entries.',
			points: [
				'BM25 scoring over id + category + key + content + tags',
				'Graph centrality surfaces hub entries even without the query word',
				'Quality score (0-1) and freshness decay boost the best, most recent entries',
				'`compact: true` → numeric indices, dropped id/date/file, snippet-truncated neighbors',
			],
			standardCode: `memory_recall({ query: "riesgo", mode: "graph" })
[decision] risk-engine-priority (a1b2c3d4)
  The engine prioritizes risk over speed.
  File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01
  links: engine-arch`,
			compactCode: `memory_recall({ query: "riesgo", mode: "graph", compact: true })
[1] decision/risk-engine-priority
  The engine prioritizes risk over speed.
  tags: risk;spec · edges: ->2, ->3`,
			caption: 'Compact mode keeps the same context in fewer tokens — the .toon file is never changed.',
		},
		faq: {
			title: 'Frequently Asked Questions',
			subtitle: 'Everything you need to know about giving your agent a memory',
			items: [
				{
					q: 'What is toon-memory?',
					a: 'A memory layer that gives your AI coding agent continuity — it stores decisions, patterns, bugs, and context in a compact TOON format so your agent remembers everything across sessions, with 80% fewer tool calls per session.',
				},
				{
					q: 'Which agents are supported?',
					a: 'OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex, Gemini, Zed, Antigravity, Aider, KiloCode, OpenClaw, and Kiro — 15+ agents with zero configuration via the MCP server.',
				},
				{
					q: 'How is my data stored?',
					a: 'Entries are written to a local TOON file (a token-efficient format ~22% smaller than JSON, measured). You own the file and can commit it, diff it, or back it up like any other source file.',
				},
				{
					q: 'Is my memory encrypted?',
					a: 'Yes. Enable encryption with the memory_encrypt tool to secure sensitive entries with AES-256-GCM. The key is generated automatically and kept local.',
				},
				{
					q: 'Does it work offline?',
					a: 'Completely. toon-memory runs locally with no external services or accounts required. Watch mode even creates automatic backups on a schedule.',
				},
				{
					q: 'Can multiple agents share the same memory?',
					a: 'Yes. Because memory lives in a plain file in your project, every agent configured for that project reads and writes the same context.',
				},
				{
					q: 'How do I back up my memory?',
					a: 'Use watch mode for scheduled automatic backups, or simply commit the TOON file to git. Old entries are auto-archived after 30 days to keep things clean.',
				},
				{
					q: 'Is it free and open source?',
					a: 'Yes. toon-memory is MIT licensed and free to use. The source is available on GitHub and the package is published on npm.',
				},
				{
					q: 'How is this different from my agent\'s built-in memory?',
					a: 'Built-in memory is often ephemeral or vendor-specific. toon-memory gives you a portable, diffable, encrypted memory file you fully control across agents and projects.',
				},
				{
					q: 'Can I expire temporary context?',
					a: 'Yes. Set a TTL (e.g. ttl: "7d") on any entry and it auto-expires — perfect for sprints, deadlines, and time-sensitive notes.',
				},
				{
					q: 'What is smart recall?',
					a: 'memory_smart_recall combines BM25 keyword search, graph centrality, quality scoring, and freshness decay in a single call — the best of all ranking strategies without manual orchestration.',
				},
				{
					q: 'How does quality scoring work?',
					a: 'Every entry gets an automatic quality score (0-1) based on tag coverage, link richness, content detail, recency, and specificity. High-quality entries surface first in recall results.',
				},
				{
					q: 'What happens if I save the same key twice?',
					a: 'The system merges attributes instead of replacing: tags and links are unioned, quality and confidence take the max, and the date is updated. Your entry gets richer over time.',
				},
				{
					q: 'What is memory compression?',
					a: 'memory_compress lets an LLM summarize related entries into one concise summary. memory_consolidate(mode: "low-quality") removes low-quality entries (no tags, short content) deterministically — no LLM needed. Both reduce token count.',
				},
				{
					q: 'Can I sync memory across machines?',
					a: 'Yes. Use memory_export_gist to push entries to a GitHub Gist, then memory_import_gist on another machine. Entries merge automatically (union of tags, max confidence).',
				},
			],
		},
		whatNew: {
			title: "What's New in v4.3.0",
			subtitle: 'Explicit importance levels, plus Explain WHY, token budgets, version supersession, and smarter ranking',
			cards: [
				{
					icon: '🎯',
					title: 'Explicit importance',
					body: '`memory_remember({ importance })` sets `critical`, `high`, `medium`, or `low` — critical decisions surface first (+0.3), low notes stay out of the way (−0.1). Empty = auto (recency + frequency).',
					stats: ['critical +0.3', 'high +0.15', 'low −0.1'],
				},
				{
					icon: '🤔',
					title: 'Explain WHY',
					body: '`memory_recall`/`memory_smart_recall` accept `explain: true` and append a deterministic reason line (`↳ 100% relevance · used 14× · used today · importance HIGH`) to every returned entry — *why* it was retrieved, no LLM.',
					stats: ['↳ reason line', 'no LLM'],
				},
				{
					icon: '🧮',
					title: 'Token budgets',
					body: '`budget_tokens` caps the recall output by estimated token count; entries accumulate greedily and the tail that would exceed the budget is dropped (`0` = no limit).',
					stats: ['0 = no limit', 'greedy tail-drop'],
				},
				{
					icon: '🔄',
					title: 'Version supersession',
					body: '`memory_consolidate(mode: "versions")` detects entries describing the same subject at different library versions (e.g. "Use React 18" vs "Use React 19") and retires the older ones in favor of the newest.',
					stats: ['"versions" mode', 'dryRun'],
				},
				{
					icon: '🚫',
					title: 'Negative memories',
					body: 'A `warning` category for "do NOT do this" facts — anti-patterns and landmines. `warning` entries get a recall boost so the agent sees the mistakes before repeating them.',
					stats: ['warning boost', 'anti-patterns'],
				},
				{
					icon: '📊',
					title: 'Extended stats',
					body: '`memory_stats` now reports Hit rate (% of entries recalled at least once), Duplicate (% exact-content duplicates) and Dead (% obsolete entries).',
					stats: ['hit rate', 'duplicates', 'dead'],
				},
				{
					icon: '🏷️',
					title: 'Smarter ranking',
					body: 'Recall adds a language-family boost (+0.1) for entries written in the same script (latin/CJK/cyrillic/…) and a folder-match boost (+0.05) when `path_scope` matches the current file.',
					stats: ['lang +0.1', 'folder +0.05'],
				},
			],
		},
		cta: {
			title: 'Ready to give your agent continuity?',
			subtitle: 'Install in seconds and never re-explain your project again.',
			getStarted: 'Get Started',
			viewGithub: 'View on GitHub',
		},
		footer: {
			text: 'MIT License — ',
			odalx: 'An open source project by ODALX',
			odalxTag: 'Building infrastructure for the AI-native era.',
		},
	},
	es: {
		nav: {
			docs: 'Documentación',
			features: 'Funciones',
			viewer: 'Visor',
			benchmarks: 'Métricas',
			faq: 'FAQ',
			npm: 'npm',
			github: 'GitHub',
		},
		hero: {
			tagline: 'La capa de continuidad para agentes de IA',
			subtitle:
				'Los agentes de IA no deberían tener que reaprender tu proyecto en cada sesión. toon-memory conserva el conocimiento, las decisiones y las convenciones de tu proyecto entre sesiones — de forma local y privada, mediante MCP.',
			poweredBy: 'Impulsado por TOON',
			getStarted: 'Empezar',
			viewGithub: 'Ver en GitHub',
			copy: 'Copiar',
			copied: '¡Copiado!',
			installCmd: 'npm install -g toon-memory',
		},
		problem: {
			title: '¿Por qué los agentes pierden contexto entre sesiones?',
			subtitle: 'Los agentes de IA empiezan cada sesión con amnesia',
			cards: [
				{
					icon: '🌀',
					title: 'El contexto se reinicia a diario',
					body: 'En cada sesión nueva, tu agente olvida las decisiones, patrones y bugs que aprendió ayer. Repites el mismo contexto una y otra vez.',
				},
				{
					icon: '🔍',
					title: 'Buscando en el historial',
					body: 'Sin memoria, los agentes hacen grep en el historial de git y releen archivos para reconstruir por qué algo se hizo de cierta forma — gastando tokens y tiempo.',
				},
				{
					icon: '📋',
					title: 'Notas de copiar y pegar',
					body: 'Los desarrolladores pegan contexto a mano entre chats. Es frágil, se vuelve obsoleto y nunca llega a la siguiente ejecución autónoma.',
				},
			],
			resolution:
				'toon-memory le da a tu agente una memoria persistente y consultable — para que el contexto sobreviva a cada sesión, automáticamente.',
		},

		continuity: {
			kicker: 'Conoce a toon-memory',
			title: 'La capa de continuidad para tu flujo de trabajo',
			subtitle:
				'Mientras una memoria almacena hechos, una capa de continuidad preserva cómo funciona tu proyecto — para que cada sesión empiece donde terminó la anterior.',
			items: [
				{
					icon: '🧭',
					title: 'Decisiones',
					body: 'El "por qué" detrás de cada elección: frameworks, librerías, compensaciones. Recordado cuando importa, nunca re-litigado.',
				},
				{
					icon: '📏',
					title: 'Convenciones',
					body: 'Reglas de nomenclatura, estructura y estilo que tu equipo acordó. Seguidas sin que te lo digan otra vez.',
				},
				{
					icon: '🧠',
					title: 'Contexto',
					body: 'Arquitectura, entorno y conocimiento operativo que no vive en ningún archivo único.',
				},
				{
					icon: '🤝',
					title: 'Entendimiento compartido',
					body: 'Conocimiento del proyecto y decisiones del equipo disponibles para cada agente y cada sesión.',
				},
			],
			closing:
				'toon-memory introduce el concepto de capa de continuidad: un sistema ligero que preserva el conocimiento, las decisiones y el contexto del proyecto entre sesiones de IA — sin servicios en la nube ni infraestructura pesada.',
		},

		benefits: {
			kicker: 'Por qué los desarrolladores eligen toon-memory',
			title: 'Construido alrededor de los problemas reales',
			subtitle: 'No una lista de herramientas — un conjunto de resultados.',
			groups: [
				{
					icon: '🧭',
					title: 'Conocimiento persistente del proyecto',
					items: [
						'Recuerda decisiones y las razones detrás de ellas',
						'Recuerda arquitectura y convenciones',
						'Se acumula entre sesiones — nunca re-explicado',
					],
				},
				{
					icon: '🔒',
					title: 'Privacidad primero',
					items: [
						'100% local — sin nube, sin servidor, sin telemetría',
						'Cifrado opcional AES-256-GCM',
						'Tu archivo de memoria te pertenece, como cualquier archivo fuente',
					],
				},
				{
					icon: '⚡',
					title: 'Ligero',
					items: [
						'Formato TOON nativo — 22% menos tokens que JSON',
						'Cero dependencias, funciona en cualquier Node.js 18+',
						'Lógica determinista — sin llamadas LLM, sin claves API',
					],
				},
				{
					icon: '🛰️',
					title: 'Universal',
					items: [
						'Funciona con 15+ agentes: Claude Code, Codex, Gemini CLI, Cursor, OpenCode y más',
						'MCP estándar — cambia de agente sin perder contexto',
						'Memoria por proyecto que comparte todo el equipo',
					],
				},
			],
		},

		features: {
			cards: [
			{
				icon: '🧩',
				title: 'Un kit de memoria, no un protocolo',
				body: 'Todo lo que tu agente necesita para recordar, recuperar y razonar — agrupado por propósito, con recursos para lectura directa de contexto y un visor de grafo interactivo.',
				toolGroups: [
					{ label: 'Memoria Principal', tools: ['memory_remember', 'memory_recall', 'memory_forget', 'memory_stats', 'memory_diff', 'memory_suggest', 'memory_summary', 'memory_archive', 'memory_checkpoint', 'memory_visualize', 'memory_pin', 'memory_unpin', 'memory_tag', 'memory_reflect', 'memory_promote'] },
					{ label: 'Búsqueda e Inteligencia', tools: ['memory_smart_recall', 'memory_captured', 'memory_consolidate', 'memory_graph_path', 'memory_search'] },
					{ label: 'Contexto Briefing', tools: ['context_brief', 'context_generate', 'context_diff', 'context_focus', 'context_health', 'context_export'] },
					{ label: 'Compresión', tools: ['memory_compress', 'memory_primer'] },
					{ label: 'Sesiones', tools: ['memory_sessions', 'memory_merge_sessions'] },
					{ label: 'Sincronización y Seguridad', tools: ['memory_export_gist', 'memory_import_gist', 'memory_encrypt', 'memory_decrypt', 'memory_backup'] },
				],
				wide: true,
			},
				{
					icon: '⭐',
					title: 'Multi-agente',
					body: 'Funciona con 15+ agentes de IA principales. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue, Codex, Gemini, Zed, Antigravity, Aider, KiloCode, OpenClaw — sin configuración.',
					tags: ['OpenCode', 'Claude', 'Cursor', 'Windsurf'],
				},
				{
					icon: '📄',
					title: 'Formato TOON',
					body: '22% menos tokens que JSON (medido). Codificación diseñada para la comprensión de LLMs y la eficiencia de tokens.',
					stats: ['22% menos tokens', '1.3x más rápido'],
				},
				{
					icon: '🔎',
					title: 'Recuperación inteligente',
					body: 'Recall basado en grafo re-ordenado por relevancia BM25 y centralidad del grafo (los hubs aparecen aunque no tengan la palabra de búsqueda). El decay por salto mantiene el contexto lejano abajo. El modo `compact` devuelve resultados con índices numéricos y snippets.',
					stats: ['BM25', 'Centralidad', 'compact'],
				},
				{
					icon: '🧠',
					title: 'Memoria inteligente',
					body: 'Inferencia automática de etiquetas desde un vocabulario integrado más tus dependencias del proyecto, puntuación de calidad con decay de obsolescencia, puntuaciones de confianza, merge-dedup, sugerencias de entradas relacionadas, diff de memoria y TTL configurable para contexto temporal.',
					stats: ['Auto-etiquetas', 'Calidad', 'Decay de obsolescencia'],
				},
				{
					icon: '⚡',
					title: 'Auto-carga inteligente',
					body: 'El plugin de OpenCode auto-recupera memoria relevante por file path en cada ejecución de herramienta — sin dump-all, sin contexto desperdiciado. Inyecta solo lo que importa vía setContext(), ahorrando ~90% tokens.',
					stats: ['~90% menos tokens', 'Recall por file path', 'Cero config'],
				},
				{
					icon: '🗜️',
					body: 'Compresión con LLM para entradas relacionadas, limpieza por lotes de entradas de baja calidad de forma determinista (sin LLM), fusión de entradas similares por similitud Jaccard, y system primer auto-inyectado al inicio de sesión.',
					title: 'Compresión',
					stats: ['14% menos tokens', 'Merge similar', 'Auto-primer'],
				},
				{
					icon: '🔒',
					title: 'Encriptación y seguridad',
					body: 'AES-256-GCM para datos sensibles. Auto-archivado de entradas antiguas. Modo watch para backup automático cada N minutos.',
					stats: ['AES-256-GCM', 'Auto-backup'],
				},
				{
					icon: '🔄',
					title: 'Sincronización y sesiones',
					body: 'Exporta e importa memoria vía GitHub Gists. Fusiona observaciones entre sesiones paralelas. Detecta conflictos suaves entre agentes.',
					stats: ['Gist sync', 'Cross-session'],
				},
				{
					icon: '🔗',
					title: 'Grafo de conocimiento',
					body: 'Entradas enlazadas vía `links` o refs `[[key]]` forman un grafo consultable. BFS shortest-path encuentra cadenas de conexión entre dos entradas cualesquiera. La centralidad destaca conocimiento clave — sin embeddings, sin LLM, 100% offline.',
					stats: ['Graph path', 'Centralidad', 'Offline'],
				},
			],
		},
		agents: {
			title: 'Funciona con 15+ agentes de IA',
			subtitle: 'Sin configuración — toon-memory detecta y configura cada uno automáticamente',
		},
		stats: {
			items: [
				{ number: '97.6%', label: 'Recall en top-5 (R@5 0.861)' },
				{ number: '15', label: 'Agentes' },
				{ number: '80%', label: 'Menos tool calls por sesión' },
				{ number: '0', label: 'Config necesaria' },
			],
		},
		howItWorks: {
			title: '¿Cómo funciona?',
			subtitle: 'Cuatro pasos de la amnesia a la memoria',
			steps: [
				{ n: 1, title: 'Instalar', body: 'Un solo comando. Sin configuración para 15+ agentes.', code: 'npm install -g toon-memory' },
				{
					n: 2,
					title: 'Recordar',
					body: 'Guarda decisiones, patrones y bugs mientras trabajas — con inferencia automática de etiquetas y TTL opcional.',
					code: `memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Usar Zod para validación",
  file: "src/types.ts"
})`,
				},
				{
					n: 3,
					title: 'Recuperar',
					body: 'Tu agente consulta la memoria bajo demanda — sin re-explicar, sin desperdiciar tokens.',
					code: `memory_recall({ query: "validation" })
// [decision] use-zod (a1b2c3d4)
//   Usar Zod para validación — src/types.ts`,
				},
				{
					n: 4,
					title: 'Contexto',
					body: 'Una llamada le da a tu agente todo: proyecto, git, memoria, sesiones. 80% menos tool calls.',
					code: `context_generate({})
// # Briefing del proyecto (completo)
// ## Proyecto — toon-memory v4.3.0
// ## Git — branch: main, 3 commits
// ## Memoria — 26 entradas, 18 edges
// ## Sesiones — 2 activas`,
				},
			],
		},
		tips: {
			title: 'Consejos de memoria',
			subtitle: 'Saca el máximo partido a toon-memory con estos patrones',
			items: [
				{
					n: 1,
					title: 'Guarda las decisiones de inmediato',
					body: 'Cuando tomes una decisión, guárdala de inmediato. Agrega contexto sobre <em>por qué</em> elegiste la opción A sobre B — tu yo futuro te lo agradecerá.',
				},
				{
					n: 2,
					title: 'Usa claves consistentes',
					body: 'Antepón el dominio a las claves: <code class="inline-code">db:redis-config</code>, <code class="inline-code">auth:jwt</code>. Hace la recuperación más rápida y evita colisiones.',
				},
				{
					n: 3,
					title: 'Etiquetas automáticas',
					body: 'Deja las etiquetas vacías y el sistema las infiere del contenido — redis, auth, api, db y 16+ categorías más. O agrégalas manualmente para control preciso.',
				},
				{
					n: 4,
					title: 'Usa TTL para contexto temporal',
					body: 'Fechas límite, sprints, notas sensibles al tiempo — define un <code class="inline-code">ttl: "7d"</code> y expiran automáticamente. Sin limpieza manual.',
				},
			],
		},
		comparison: {
			title: 'Mismo proyecto. Dos sesiones.',
			subtitle: 'Lo que tu agente recuerda cambia el resultado.',
			beforeTitle: 'Sin toon-memory',
			afterTitle: 'Con toon-memory',
			thinkingBefore: 'Pensando…',
			thinkingAfter: 'Recordando…',
			before: [
				{ session: 'Sesión 1' },
				{ user: 'Refactoriza el módulo de pagos para Stripe' },
				{ assistant: 'OK.', tokens: '2 tokens' },
				{ session: 'Sesión 2' },
				{ user: '¿Qué proveedor usa el módulo de pagos?' },
				{ cmd: '$ cat src/payments/payments.py', tokens: '2.312 tokens' },
				{ cmd: '$ grep -r "provider" src/payments/', tokens: '343 tokens' },
				{ assistant: 'Stripe.', tokens: '2 tokens' },
			],
			after: [
				{ session: 'Sesión 1' },
				{ user: 'Refactoriza el módulo de pagos para Stripe', thinking: 'Pensando…' },
				{ cmd: '$ memory_remember({ category: "decision", key: "payments:stripe", content: "Proveedor de pagos: Stripe" })', tokens: '38 tokens' },
				{ assistant: 'OK. Guardado.', tokens: '5 tokens' },
				{ session: 'Sesión 2' },
				{ user: '¿Qué proveedor usa el módulo de pagos?' },
				{ cmd: '$ memory_recall({ query: "payments" })', tokens: '89 tokens' },
				{ note: 'payments:stripe · 1 entrada' },
				{ assistant: 'Stripe.', tokens: '2 tokens' },
			],
		},
		codeExamples: {
			quickExample: 'Ejemplo rápido',
			quickInstall: 'Instalación rápida',
			exampleCode: `// Guardar una decisión (con inferencia automática de etiquetas)
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Usar Zod para validación",
  file: "src/types.ts"
})
// 🏷️ Tags inferidos: types

// Guardar con TTL (expira en 7 días)
memory_remember({
  category: "knowledge",
  key: "sprint-deadline",
  content: "El sprint termina el 18 de julio",
  ttl: "7d"
})

// Ver qué cambió desde la última sesión
memory_diff({ since: "24h" })

// Buscar en la memoria
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Se agregó max_connections=20`,
			installCode: `# npm
npm install -g toon-memory

# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex`,
		},
		benchmarks: {
			title: 'Benchmarks',
			subtitle: 'Medido, no asumido',
			tabs: {
				ranking: 'Calidad del ranking',
				workflow: 'Ahorro en el flujo',
				format: 'Formato TOON',
			},
			retrieval: {
				subtitle: 'Búsqueda estilo LongMemEval sobre un snapshot real congelado de 187 entries — 42 gold queries',
				what: 'El pipeline de recall unificado encuentra la entrada correcta en el top 5',
				metricLabel: 'Métrica',
				linear: 'Lineal',
				rrf: 'RRF',
				smart: 'Unificado',
				metricRows: [
					{ metric: 'R@5', gloss: 'entrada gold en el top 5', linear: '0.643', rrf: '0.861', smart: '0.829' },
					{ metric: 'nDCG@5', gloss: 'calidad del orden', linear: '0.654', rrf: '0.764', smart: '0.739' },
					{ metric: 'MRR@5', gloss: 'posición del acierto', linear: '0.776', rrf: '0.788', smart: '0.760' },
				],
				result: 'El 97.6% de las queries se responden desde el top-5',
				note: 'Snapshot real de <code>data.toon</code> (187 entries, 2026-08-01), <code>today</code> determinista, solo lectura y sin copias; se excluyen 2 meta-entries priority. Reproducible: <code>npm run bench:retrieval</code>.',
			},
			workflow: {
				subtitle: 'Ahorro de tokens y tool calls medido en una sesión real',
				stats: [
					{ num: '~90%', cap: 'menos tokens', feature: 'Auto-carga', from: 'Volcar toda la memoria a cada paso', to: 'Solo lo relevante a la tarea' },
					{ num: '80%', cap: 'menos tool calls', feature: 'Tool calls', from: '25 llamadas manuales', to: '5 llamadas por sesión' },
					{ num: '68%', cap: 'menos tokens', feature: 'Recall compacto', from: 'Releer los archivos enteros', to: 'Un recall compacto' },
					{ num: '58%', cap: 'menos tokens', feature: 'System primer', from: 'Pedir el contexto a mano', to: 'Primer inyectado solo' },
					{ num: '14%', cap: 'menos tokens', feature: 'Compresión por lotes', from: 'Entradas dispersas de baja calidad', to: '1 resumen consolidado' },
				],
				cards: [
					{
						feature: 'Auto-carga',
						num: '~90%',
						cap: 'menos tokens',
						from: 'Volcar toda la memoria a cada paso',
						to: 'Solo lo relevante a la tarea',
						more: '80% menos tool calls (25 → 5)',
					},
					{
						feature: 'Recall compacto',
						num: '68%',
						cap: 'menos tokens',
						from: 'Releer los archivos enteros',
						to: 'Un recall compacto',
						more: '58% menos tokens (system primer)',
					},
					{
						feature: 'Compresión por lotes',
						num: '14%',
						cap: 'menos tokens',
						from: 'Entradas dispersas de baja calidad',
						to: '1 resumen consolidado',
					},
				],
				note: 'Auto-carga: el plugin de OpenCode inyecta solo memoria relevante al file path en vez de volcar todas las entradas. Sesión completa: inicio → debug → implementar → revisar → cerrar. Reproducible: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
			},
			format: {
				subtitle: 'El formato TOON está hecho para LLMs, no para humanos',
				stats: [
					{ num: '22.5%', cap: 'menos tokens que JSON' },
					{ num: '30.5%', cap: 'en una sola entrada' },
					{ num: '1.3x', cap: 'más rápido de parsear' },
				],
				note: 'Medido con <code>gpt-tokenizer</code> (cl100k_base) sobre 16 entradas de memoria representativas, comparando el formato TOON real en disco contra JSON compacto. Reproducible: <code>npm run bench</code>.',
			},
		},
	tools: {
		title: 'Un kit de memoria completo',
		subtitle: 'Todo lo que tu agente necesita para recordar, recuperar y razonar',
		resourcesLabel: 'Recursos:',
		groups: {
			core: 'Memoria Principal',
			search: 'Búsqueda e Inteligencia',
			context: 'Contexto Briefing',
			compress: 'Compresión',
			sessions: 'Sesiones',
			sync: 'Sincronización y Seguridad',
		},
		cards: [
			{ name: 'memory_remember', title: 'Guardar en memoria', desc: 'Almacena decisiones, patrones, bugs, conocimiento o warnings (memorias negativas "NO hagas esto", recuperadas con boost) — persistente entre sesiones con puntuación de calidad automática.', group: 'core' },
			{ name: 'memory_recall', title: 'Buscar en memoria', desc: 'Consulta el grafo de conocimiento antes de leer archivos. Resultados ponderados por calidad. Soporta path scoping (path_scope) y control de presupuesto (tiny/normal/deep). explain: true añade una línea de razón por entrada; budget_tokens limita la salida por tokens estimados.', group: 'core' },
			{ name: 'memory_forget', title: 'Ciclo de vida', desc: 'Soft-delete (obsoleta), borrado definitivo, restaurar o superseder una entrada por key o id mediante el parámetro action.', group: 'core' },
			{ name: 'memory_stats', title: 'Estadísticas', desc: 'Muestra estadísticas sobre la memoria del proyecto, incluyendo distribución de calidad, entradas más accedidas y métricas de hit-rate/duplicados/obsoletas.', group: 'core' },
			{ name: 'memory_diff', title: 'Diff de memoria', desc: 'Mira qué cambió desde tu última sesión.', group: 'core' },
			{ name: 'memory_suggest', title: 'Sugerir relacionados', desc: 'Muestra entradas relacionadas para un contexto dado.', group: 'core' },
			{ name: 'memory_summary', title: 'Resumen de archivo', desc: 'Guarda o recupera un resumen de archivo para ahorrar tokens.', group: 'core' },
			{ name: 'memory_archive', title: 'Archivar antiguos', desc: 'Mueve entradas de más de 30 días para mantener la memoria limpia.', group: 'core' },
			{ name: 'memory_smart_recall', title: 'Recuperación inteligente', desc: 'Búsqueda unificada combinando BM25 + centralidad + calidad + frescura + sesgo de sesión en una sola llamada. Soporta explain: true (razones por entrada) y budget_tokens (límite de salida).', group: 'search' },
			{ name: 'memory_captured', title: 'Actividad capturada', desc: 'Muestra el log de actividad capturado por hooks — promueve observaciones a memoria.', group: 'search' },
			{ name: 'memory_checkpoint', title: 'Punto de control', desc: 'Crea una instantánea del estado actual de memoria con TTL de 7d. Útil para referencia de restauración durante sesiones largas.', group: 'core' },
			{ name: 'memory_consolidate', title: 'Consolidar', desc: 'Elimina duplicados idénticos, fusiona casi-duplicados (Jaccard >50%), comprime en lote entradas de baja calidad o retira entradas de versiones antiguas de librería (mode: "versions") — determinístico, sin LLM.', group: 'search' },
			{ name: 'memory_graph_path', title: 'Ruta del grafo', desc: 'BFS shortest-path entre dos entradas. Traza cadenas de conocimiento a través de tu grafo sin embeddings ni LLM.', group: 'search' },
			{ name: 'context_brief', title: 'Briefing de contexto', desc: 'Briefing de contexto en una sola llamada: memoria + sesiones + salud en markdown compacto. Cero LLM.', group: 'context' },
			{ name: 'context_generate', title: 'Briefing completo', desc: 'Briefing en una llamada: estructura del proyecto + estado git + memoria + sesiones. Reemplaza 6 llamadas manuales. Ahorra 93% tokens.', group: 'context' },
			{ name: 'context_diff', title: 'Briefing incremental', desc: 'Commits git + archivos modificados + memoria nueva/actualizada desde la última sesión. Ahorra 72% tokens.', group: 'context' },
			{ name: 'context_focus', title: 'Briefing dirigido', desc: 'Memoria relevante + archivos relacionados + callers + archivos de test para una query específica.', group: 'context' },
			{ name: 'context_health', title: 'Auditoría de salud', desc: 'Links huérfanos, duplicados, referencias rotas, TTL expirados, sesiones obsoletas. Puntaje 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Exportar como Markdown', desc: 'Exporta memoria como markdown inyectable para system prompts. Ahorra 82% tokens.', group: 'context' },
			{ name: 'memory_compress', title: 'Compresión con LLM', desc: 'Compresión con LLM en dos pasos: resumir + sobrescribir. Usa Anthropic/OpenAI CLI si están disponibles.', group: 'compress' },
			{ name: 'memory_primer', title: 'Primer de contexto', desc: 'Contexto en una llamada: memorias principales + categorías + cambios de archivos. Auto-inyectado al inicio de sesión.', group: 'compress' },
			{ name: 'memory_sessions', title: 'Sesiones', desc: 'Muestra sesiones de agente activas y detecta conflictos suaves.', group: 'sessions' },
			{ name: 'memory_merge_sessions', title: 'Fusionar sesiones', desc: 'Fusiona observaciones entre sesiones paralelas para un archivo. Deduplica y auto-promueve.', group: 'sessions' },
			{ name: 'memory_export_gist', title: 'Exportar a Gist', desc: 'Exporta entradas a un GitHub Gist (público o privado). Usa GITHUB_TOKEN o gh CLI.', group: 'sync' },
			{ name: 'memory_import_gist', title: 'Importar de Gist', desc: 'Importa entradas desde un GitHub Gist. Fusiona con existentes (unión de tags, máxima confianza).', group: 'sync' },
			{ name: 'memory_encrypt', title: 'Habilitar encriptación', desc: 'Encriptación AES-256-GCM con clave autogenerada.', group: 'sync' },
			{ name: 'memory_decrypt', title: 'Deshabilitar encriptación', desc: 'Desencripta y deshabilita la encriptación.', group: 'sync' },
			{ name: 'memory_backup', title: 'Backup de memoria', desc: 'Crea backup con timestamp del archivo de memoria. Auto-limpia a los 10 más recientes.', group: 'sync' },
			{ name: 'memory_visualize', title: 'Abrir visor del grafo', desc: 'Renderiza el grafo de memoria interactivo inline en hosts compatibles con MCP Apps. Grafo de fuerza dirigida, estadísticas, línea de tiempo, panel de detalles.', group: 'core' },
			{ name: 'memory_pin', title: 'Fijar entrada', desc: 'Fija entradas importantes con prioridad 1-5 — aparecen primero en resultados de recall ordenadas por prioridad, incluso sin coincidencia de palabras clave.', group: 'core' },
			{ name: 'memory_unpin', title: 'Desfijar entrada', desc: 'Elimina la marca de prioridad de una entrada.', group: 'core' },
			{ name: 'memory_search', title: 'Búsqueda unificada', desc: 'Busca en la memoria con filtros de categoría, etiquetas y rango de fechas. Filtro de etiquetas usa lógica AND. sessionBias potencia entradas de la rama git actual.', group: 'search' },
			{ name: 'memory_tag', title: 'Operaciones por lotes', desc: 'Añade, elimina o establece etiquetas en una o más entradas por key o id en una sola llamada.', group: 'core' },
			{ name: 'memory_reflect', title: 'Reflexión de memoria', desc: 'Rankea entradas determinísticamente por obsolescencia, calidad y sobre-conexión para detectar qué necesita atención o limpieza. Zero LLM.', group: 'core' },
			{ name: 'memory_promote', title: 'Auto-promover', desc: 'Promueve drafts de baja confianza a entradas activas de forma determinista (umbral 0.65, dedup Jaccard > 0.5). dryRun por defecto.', group: 'core' },
		],
	},
		graphSection: {
			title: 'Tu memoria, como un grafo',
			subtitle:
				'Conecta decisiones con sus specs, bugs y arquitectura. El recall devuelve el contexto correcto, no solo coincidencias de palabras.',
			points: [
				'Enlaza entries con `links` o referencias `[[key]]` — sin embeddings, sin LLM',
				'`memory_recall({ mode: "graph" })` expande un subgrafo consciente de las relaciones',
			],
			launchLabel: 'Abrir visor interactivo',
		},
		viewerSection: {
			title: 'Visor del grafo de memoria',
			subtitle: 'Visualiza tu memoria como un grafo interactivo de fuerza dirigida. Ve entradas, conexiones, categorías y patrones de acceso de un vistazo.',
			capsLabel: 'Dentro del visor:',
			caps: ['Búsqueda', 'Buscador de caminos', 'Exportar PNG / SVG', 'Temas claro y oscuro'],
			features: [
				'<strong>Visor CLI:</strong> <code>npx toon-memory viewer</code> inicia un servidor HTTP',
				'<strong>Visor inline MCP Apps:</strong> llama <code>memory_visualize()</code> para renderizar el grafo directamente en hosts compatibles con MCP Apps — sin servidor',
				'Pasa el ratón sobre nodos para tooltips con vista previa y puntuación de calidad',
				'Click para seleccionar y centrar; doble click para abrir detalles',
				'La búsqueda filtra entradas y resalta nodos coincidentes con un brillo pulsante',
				'Path finder encuentra y resalta la conexión más corta entre dos entradas',
				'Física ajustable, tema oscuro/claro, exportación PNG/SVG',
			],
		},
		smartRecallSection: {
			title: 'Recuperación inteligente y eficiente',
			subtitle:
				'El recall se re-ordena offline por relevancia BM25 y centralidad del grafo, y luego se comprime a una forma compacta cuando importan los tokens. Las puntuaciones de calidad y frescura impulsan las mejores entradas.',
			points: [
				'Puntuación BM25 sobre id + categoría + key + contenido + tags',
				'La centralidad del grafo hace aparecer los hubs aunque no tengan la palabra',
				'La puntuación de calidad (0-1) y el decay de frescura impulsan las mejores entradas más recientes',
				'`compact: true` → índices numéricos, sin id/fecha/archivo, vecinos como snippet',
			],
			standardCode: `memory_recall({ query: "riesgo", mode: "graph" })
[decision] risk-engine-priority (a1b2c3d4)
  El motor prioriza riesgo sobre velocidad.
  File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01
  links: engine-arch`,
			compactCode: `memory_recall({ query: "riesgo", mode: "graph", compact: true })
[1] decision/risk-engine-priority
  El motor prioriza riesgo sobre velocidad.
  tags: risk;spec · edges: ->2, ->3`,
			caption: 'El modo compact conserva el mismo contexto en menos tokens — el archivo .toon nunca cambia.',
		},
		faq: {
			title: 'Preguntas frecuentes',
			subtitle: 'Todo lo que necesitas saber para darle memoria a tu agente',
			items: [
				{
					q: '¿Qué es toon-memory?',
					a: 'Una capa de memoria persistente para agentes de IA. Almacena decisiones, patrones, bugs y contexto en un formato compacto TOON para que tu agente recuerde todo entre sesiones.',
				},
				{
					q: '¿Qué agentes son compatibles?',
					a: 'OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex, Gemini, Zed, Antigravity, Aider, KiloCode, OpenClaw y Kiro — 15+ agentes sin configuración vía el servidor MCP.',
				},
				{
					q: '¿Cómo se almacenan mis datos?',
					a: 'Las entradas se escriben en un archivo TOON local (un formato eficiente en tokens ~22% más pequeño que JSON, medido). Tú eres dueño del archivo y puedes hacerle commit, diff o backup como cualquier otro archivo fuente.',
				},
				{
					q: '¿Mi memoria está encriptada?',
					a: 'Sí. Habilita la encriptación con la herramienta memory_encrypt para asegurar entradas sensibles con AES-256-GCM. La clave se genera automáticamente y se mantiene local.',
				},
				{
					q: '¿Funciona sin conexión?',
					a: 'Completamente. toon-memory corre localmente sin servicios externos ni cuentas. El modo watch incluso crea backups automáticos según un horario.',
				},
				{
					q: '¿Pueden varios agentes compartir la misma memoria?',
					a: 'Sí. Como la memoria vive en un archivo plano en tu proyecto, cada agente configurado para ese proyecto lee y escribe el mismo contexto.',
				},
				{
					q: '¿Cómo hago backup de mi memoria?',
					a: 'Usa el modo watch para backups automáticos programados, o simplemente haz commit del archivo TOON a git. Las entradas antiguas se auto-archivan tras 30 días para mantener todo limpio.',
				},
				{
					q: '¿Es gratis y de código abierto?',
					a: 'Sí. toon-memory tiene licencia MIT y es gratuito. El código está en GitHub y el paquete se publica en npm.',
				},
				{
					q: '¿En qué se diferencia de la memoria integrada de mi agente?',
					a: 'La memoria integrada suele ser efímera o específica del proveedor. toon-memory te da un archivo de memoria portátil, con diff y encriptado que controlas totalmente entre agentes y proyectos.',
				},
				{
					q: '¿Puedo hacer expirar contexto temporal?',
					a: 'Sí. Define un TTL (ej. ttl: "7d") en cualquier entrada y expira automáticamente — ideal para sprints, fechas límite y notas sensibles al tiempo.',
				},
				{
					q: '¿Qué es la recuperación inteligente?',
					a: 'memory_smart_recall combina búsqueda BM25 por palabras clave, centralidad del grafo, puntuación de calidad y decay de frescura en una sola llamada — lo mejor de todas las estrategias sin orquestación manual.',
				},
				{
					q: '¿Cómo funciona la puntuación de calidad?',
					a: 'Cada entrada recibe automáticamente una puntuación de calidad (0-1) basada en cobertura de etiquetas, riqueza de enlaces, detalle del contenido, frescura y especificidad. Las entradas de alta calidad aparecen primero en los resultados.',
				},
			{
				q: '¿Qué pasa si guardo la misma key dos veces?',
				a: 'El sistema fusiona atributos en vez de reemplazar: etiquetas y enlaces se unen, calidad y confianza toman el máximo, y la fecha se actualiza. Tu entrada se enriquece con el tiempo.',
			},
			{
				q: '¿Qué es la compresión de memoria?',
				a: 'memory_compress permite a un LLM resumir entradas relacionadas en un resumen conciso. memory_consolidate(mode: "low-quality") elimina entradas de baja calidad (sin tags, contenido corto) de forma determinista — sin LLM. Ambas reducen el conteo de tokens.',
			},
			{
				q: '¿Puedo sincronizar la memoria entre máquinas?',
				a: 'Sí. Usa memory_export_gist para subir entradas a un GitHub Gist, luego memory_import_gist en otra máquina. Las entradas se fusionan automáticamente (unión de tags, confianza máxima).',
			},
		],
	},
	whatNew: {
		title: 'Novedades en v4.3.0',
		subtitle: 'Niveles de importancia explícita, más Explain WHY, presupuestos de tokens, supersesión por versión y ranking más inteligente',
		cards: [
			{
				icon: '🎯',
				title: 'Importancia explícita',
				body: '`memory_remember({ importance })` define `critical`, `high`, `medium` o `low` — las decisiones críticas aparecen primero (+0.3), las notas bajas quedan fuera del camino (−0.1). Vacío = automático (recencia + frecuencia).',
				stats: ['critical +0.3', 'high +0.15', 'low −0.1'],
			},
			{
				icon: '🤔',
				title: 'Explicar POR QUÉ',
				body: '`memory_recall`/`memory_smart_recall` aceptan `explain: true` y añaden una línea de razón determinista (`↳ 100% relevance · used 14× · used today · importance HIGH`) a cada entrada devuelta — *por qué* se recuperó, sin LLM.',
				stats: ['↳ línea de razón', 'sin LLM'],
			},
			{
				icon: '🧮',
				title: 'Presupuestos de tokens',
				body: '`budget_tokens` limita la salida del recall por conteo estimado de tokens; las entradas se acumulan de forma ávida y la cola que excedería el presupuesto se descarta (`0` = sin límite).',
				stats: ['0 = sin límite', 'descarte ávido'],
			},
			{
				icon: '🔄',
				title: 'Supersesión por versión',
				body: '`memory_consolidate(mode: "versions")` detecta entradas que describen el mismo tema en diferentes versiones de librería (ej. "Usar React 18" vs "Usar React 19") y retira las antiguas a favor de la más nueva.',
				stats: ['modo "versions"', 'dryRun'],
			},
			{
				icon: '🚫',
				title: 'Memorias negativas',
				body: 'Una categoría `warning` para hechos de tipo "NO hagas esto" — antipatrones y trampas. Las entradas `warning` reciben un boost en el recall para que el agente vea los errores antes de repetirlos.',
				stats: ['boost warning', 'antipatrones'],
			},
			{
				icon: '📊',
				title: 'Estadísticas extendidas',
				body: '`memory_stats` ahora reporta Hit rate (% de entradas recuperadas al menos una vez), Duplicate (% de duplicados de contenido exacto) y Dead (% de entradas obsoletas).',
				stats: ['hit rate', 'duplicados', 'obsoletas'],
			},
			{
				icon: '🏷️',
				title: 'Ranking más inteligente',
				body: 'El recall añade un boost de familia de idioma (+0.1) para entradas en la misma escritura (latín/CJK/cirílico/…) y un boost de coincidencia de carpeta (+0.05) cuando `path_scope` coincide con el archivo actual.',
				stats: ['idioma +0.1', 'carpeta +0.05'],
			},
		],
	},
	cta: {
		title: '¿Listo para darle continuidad a tu agente?',
		subtitle: 'Instálalo en segundos y nunca vuelvas a explicar tu proyecto.',
		getStarted: 'Empezar',
		viewGithub: 'Ver en GitHub',
	},
		footer: {
			text: 'Licencia MIT — ',
			odalx: 'Un proyecto de código abierto de ODALX',
			odalxTag: 'Construyendo infraestructura para la era nativa de IA.',
		},
	},
	zh: {
	nav: {
		docs: '文档',
		features: '功能',
		viewer: '图谱查看器',
		benchmarks: '基准测试',
		faq: '常见问题',
		npm: 'npm',
		github: 'GitHub',
	},
	hero: {
		tagline: '面向 AI 代理的连续性层',
		subtitle:
			'AI 代理不应该在每个会话中重新学习你的项目。toon-memory 跨会话保留项目的知识、决策和约定——本地化、私密化，通过 MCP 实现。',
		poweredBy: '由 TOON 驱动',
		getStarted: '快速开始',
		viewGithub: '在 GitHub 上查看',
		copy: '复制',
		copied: '已复制！',
		installCmd: 'npm install -g toon-memory',
	},
	problem: {
		title: '为什么代理会在会话之间丢失上下文？',
		subtitle: 'AI 编程代理每次会话都从失忆开始',
		cards: [
			{ icon: '🌀', title: '上下文每天重置', body: '每次新会话，你的代理都会忘记昨天学到的决策、模式和 bug。你需要一遍又一遍地重新解释相同的上下文。' },
			{ icon: '🔍', title: '在历史中搜寻', body: '没有记忆时，代理需要搜索 git 历史并重新读取文件来重建为什么某事以特定方式构建 — 消耗 token 和时间。' },
			{ icon: '📋', title: '复制粘贴笔记', body: '开发者在聊天之间手动粘贴上下文。这种方式脆弱、容易过时，而且永远无法传递到下一次自主运行中。' },
		],
		resolution: 'toon-memory 为你的代理提供持久的、可查询的记忆 — 让上下文在每个会话中自动存活。',
	},

	continuity: {
		kicker: '认识 toon-memory',
		title: '你编码工作流的连续性层',
		subtitle: '记忆存储事实，而连续性层保存你项目的工作方式 — 让每个会话都从上次结束的地方开始。',
		items: [
			{ icon: '🧭', title: '决策', body: '每个选择背后的"为什么" — 框架、库、权衡。在重要时刻被召回，不再重新争论。' },
			{ icon: '📏', title: '约定', body: '你的团队认可的命名、结构和风格规则。无需再次告知即可遵守。' },
			{ icon: '🧠', title: '上下文', body: '不存于任何单一文件中的架构、环境和运维知识。' },
			{ icon: '🤝', title: '共享理解', body: '项目知识和团队决策可供每个代理和每次会话使用。' },
		],
		closing: 'toon-memory 引入了连续性层的概念：一个轻量系统，在 AI 会话之间保存项目知识、决策和上下文 — 无需云服务或重型基础设施。',
	},

	benefits: {
		kicker: '为什么开发者选择 toon-memory',
		title: '围绕你真正遇到的问题构建',
		subtitle: '不是工具列表 — 而是结果集。',
		groups: [
			{ icon: '🧭', title: '持久的项目知识', items: ['记住决策及其背后的原因', '记住架构和约定', '在会话间积累 — 永不重新解释'] },
			{ icon: '🔒', title: '隐私优先', items: ['100% 本地 — 无云、无服务器、无遥测', '可选 AES-256-GCM 加密', '你拥有记忆文件，就像任何源文件'] },
			{ icon: '⚡', title: '轻量', items: ['原生 TOON 格式 — 比 JSON 少 22% 的 token', '零依赖，任何 Node.js 18+ 都可运行', '确定性逻辑 — 无 LLM 调用、无 API 密钥'] },
			{ icon: '🛰️', title: '通用', items: ['适用于 15+ 个代理：Claude Code、Codex、Gemini CLI、Cursor、OpenCode 等', '标准 MCP — 更换代理而不丢失上下文', '每个团队成员共享的项目记忆'] },
		],
	},

	features: {
		cards: [
			{
				icon: '🧩',
				title: '记忆工具集，而非协议',
				body: '你的代理记忆、召回和推理所需的一切 — 按用途分组，并提供直接读取上下文的资源和交互式图谱查看器。',
				toolGroups: [
					{ label: '核心记忆', tools: ['memory_remember', 'memory_recall', 'memory_forget', 'memory_stats', 'memory_diff', 'memory_suggest', 'memory_summary', 'memory_archive', 'memory_checkpoint', 'memory_visualize', 'memory_pin', 'memory_unpin', 'memory_tag', 'memory_reflect', 'memory_promote'] },
					{ label: '搜索与智能', tools: ['memory_smart_recall', 'memory_captured', 'memory_consolidate', 'memory_graph_path', 'memory_search'] },
					{ label: '上下文简报', tools: ['context_brief', 'context_generate', 'context_diff', 'context_focus', 'context_health', 'context_export'] },
					{ label: '压缩', tools: ['memory_compress', 'memory_primer'] },
					{ label: '会话管理', tools: ['memory_sessions', 'memory_merge_sessions'] },
					{ label: '同步与安全', tools: ['memory_export_gist', 'memory_import_gist', 'memory_encrypt', 'memory_decrypt', 'memory_backup'] },
				],
				wide: true,
			},
			{ icon: '⭐', title: '多代理', body: '支持所有主流 AI 编程代理。OpenCode、VS Code、Claude、Cursor、Windsurf、Cline、Continue — 零配置。', tags: ['OpenCode', 'Claude', 'Cursor'] },
			{ icon: '📄', title: 'TOON 格式', body: '比 JSON 减少 22% 的 token（实测）。自定义编码专为 LLM 理解和 token 效率设计。', stats: ['减少 22% token', '解析速度提升 1.3x'] },
			{ icon: '🔎', title: '智能召回', body: '基于图的召回按 BM25 相关性和图中心性重新排序（中心节点即使不包含查询词也会浮现）。按跳数衰减保持远距离上下文较低。Token 高效的 `compact` 模式返回数字索引、片段截断的结果。', stats: ['BM25', '中心性', 'compact'] },
			{ icon: '🧠', title: '智能记忆', body: '从内置词汇表和项目依赖自动推断标签、质量评分、置信度评分、合并去重、相关条目建议、记忆 diff，以及可配置的临时上下文 TTL。', stats: ['自动标签', '质量评分', '合并去重'] },
			{ icon: '🔒', title: '加密', body: 'AES-256-GCM 保护敏感数据。自动归档旧条目。Watch 模式每隔 N 分钟自动备份。', stats: ['AES-256-GCM', '自动备份'] },
		],
	},
	agents: { title: '支持 15+ 个 AI 编程代理', subtitle: '零配置 — toon-memory 自动检测并配置每个代理' },
	stats: { items: [{ number: '97.6%', label: '从前 5 名召回（R@5 0.861）' }, { number: '15', label: '代理' }, { number: '80%', label: '每次会话减少工具调用' }, { number: '0', label: '所需配置' }] },
	howItWorks: {
		title: '它是如何工作的？',
		subtitle: '从失忆到记忆的四个步骤',
		steps: [
			{ n: 1, title: '安装', body: '一条命令。15+ 个代理零配置。', code: 'npm install -g toon-memory' },
			{ n: 2, title: '记忆', body: '在工作时保存决策、模式和 bug — 支持自动标签推断和可选 TTL。', code: 'memory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})' },
			{ n: 3, title: '召回', body: '你的代理按需查询记忆 — 无需重复解释，不浪费 token。', code: 'memory_recall({ query: "validation" })\n// [decision] use-zod (a1b2c3d4)\n//   Use Zod for validation — src/types.ts' },
			{ n: 4, title: '上下文', body: '一次调用为你的代理提供全部信息：项目、git、记忆、会话。减少 80% 的工具调用。', code: 'context_generate({})\n// # Project Briefing (full)\n// ## Project — toon-memory v4.3.0\n// ## Git — branch: main, 3 commits\n// ## Memory — 26 entries, 18 edges\n// ## Sessions — 2 active' },
		],
	},
	tips: {
		title: '记忆技巧', subtitle: '通过这些模式充分利用 toon-memory',
		items: [
			{ n: 1, title: '立即保存决策', body: '当你做出选择时，立即保存。添加关于<em>为什么</em>选择 A 而非 B 的上下文 — 未来的你会感谢自己。' },
			{ n: 2, title: '使用一致的键名', body: '按领域前缀键名：<code class="inline-code">db:redis-config</code>、<code class="inline-code">auth:jwt</code>。加快召回速度并避免冲突。' },
			{ n: 3, title: '标签自动推断', body: '留空标签，系统会从内容推断 — redis、auth、api、db 等 16+ 种类别。也可以手动添加以精确控制。' },
			{ n: 4, title: '使用 TTL 处理临时上下文', body: '截止日期、冲刺计划、时间敏感的笔记 — 设置 <code class="inline-code">ttl: "7d"</code>，它们会自动过期。无需手动清理。' },
		],
	},
	comparison: {
		title: '同一个项目。两次会话。', subtitle: '你的代理记住什么会改变结果。', beforeTitle: '没有 toon-memory', afterTitle: '使用 toon-memory', thinkingBefore: '思考中…', thinkingAfter: '回忆中…',
		before: [
			{ session: '会话 1' }, { user: '使用 Sequelize。' }, { assistant: '好的。' }, { note: '保留在会话上下文中 — 会累积 token。', tone: 'warn' },
			{ session: '会话 2' }, { user: '我们的 ORM 是什么？' }, { note: '会话之间没有记忆。', tone: 'error' }, { assistant: '我不知道。' },
		],
			after: [
				{ session: '会话 1' }, { user: '使用 Sequelize。' }, { cmd: '$ memory_remember({ category: "decision", key: "orm:sequelize", content: "使用 Sequelize 作为 ORM" })' }, { assistant: '好的。' }, { note: '已保存到记忆。' },
			{ session: '会话 2' }, { user: '我们的 ORM 是什么？' }, { note: '从记忆回想。' }, { assistant: '你在使用 Sequelize。' },
		],
	},
	codeExamples: {
		quickExample: '快速示例', quickInstall: '快速安装',
		exampleCode: '// 保存决策（自动标签推断）\nmemory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})\n// 🏷️ Tags inferred: types\n\n// 带 TTL 保存（7 天后过期）\nmemory_remember({\n  category: "knowledge",\n  key: "sprint-deadline",\n  content: "Sprint ends July 18",\n  ttl: "7d"\n})\n\n// 查看自上次会话以来的变化\nmemory_diff({ since: "24h" })\n\n// 搜索记忆\nmemory_recall({ query: "redis" })\n// [bug] redis-pool-fix (i9j0k1l2)\n//   Added max_connections=20',
		installCode: '# npm\nnpm install -g toon-memory\n\n# macOS / Linux\ncurl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh\n\n# Windows (PowerShell)\nirm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex',
	},
	benchmarks: {
		title: '基准测试',
		subtitle: '实测而非假设',
		tabs: { ranking: '排序质量', workflow: '工作流节省', format: 'TOON 格式' },
		retrieval: {
			subtitle: '在 187 条真实条目冻结快照上的 LongMemEval 风格检索 — 42 条 gold queries',
			what: '统一检索管道能在前 5 名中找到正确的条目',
			metricLabel: '指标',
			linear: '线性',
			rrf: 'RRF',
			smart: '统一',
			metricRows: [
				{ metric: 'R@5', gloss: 'gold 条目在前 5 名', linear: '0.643', rrf: '0.861', smart: '0.829' },
				{ metric: 'nDCG@5', gloss: '排序质量', linear: '0.654', rrf: '0.764', smart: '0.739' },
				{ metric: 'MRR@5', gloss: '正确命中的位置', linear: '0.776', rrf: '0.788', smart: '0.760' },
			],
			result: '97.6% 的查询可从前 5 名得到答案',
			note: '真实 <code>data.toon</code> 快照（187 条，2026-08-01），<code>today</code> 确定性、只读、无代码复刻；排除 2 条 priority 元条目。可复现：<code>npm run bench:retrieval</code>。',
		},
		workflow: {
			subtitle: '在真实会话中测得的 token 与工具调用节省',
			stats: [
				{ num: '~90%', cap: '更少令牌（自动加载）' },
				{ num: '80%', cap: '更少工具调用 (25 → 5)' },
				{ num: '68%', cap: '更少令牌（紧凑召回）' },
				{ num: '58%', cap: '更少令牌（系统提示）' },
				{ num: '14%', cap: '更少令牌（批量压缩）' },
			],
			note: '自动加载：OpenCode 插件仅注入与文件相关的记忆，而不是转储所有条目。完整会话：启动 → 调试 → 实现 → 审查 → 完成。可复现：<code>npm run bench:full</code>、<code>npm run bench:primer</code>、<code>npm run bench:compress-all</code>。',
		},
		format: {
			subtitle: 'TOON 格式专为 LLM 设计，而非人类',
			stats: [{ num: '22.5%', cap: '比 JSON 减少 token' }, { num: '30.5%', cap: '单条条目' }, { num: '1.3x', cap: '解析更快' }],
			note: '使用 <code>gpt-tokenizer</code>（cl100k_base）在 16 条代表性记忆条目上测量，比较实际磁盘上的 TOON 格式与紧凑 JSON。可复现：<code>npm run bench</code>。',
		},
	},
	tools: {
		title: '完整的记忆工具集', subtitle: '你的代理记忆、召回和推理所需的一切', resourcesLabel: '资源：',
		groups: {
			core: '核心记忆',
			search: '搜索与智能',
			context: '上下文简报',
			compress: '压缩',
			sessions: '会话管理',
			sync: '同步与安全',
		},
		cards: [
			{ name: 'memory_remember', title: '保存到记忆', desc: '存储决策、模式、bug、知识或 warning（负面"不要这样做"记忆，召回时加成） — 跨会话持久化，自动质量评分。', group: 'core' },
			{ name: 'memory_recall', title: '搜索记忆', desc: '在读取文件之前查询知识图谱。质量加权结果。支持路径范围（path_scope）和预算控制（tiny/normal/deep）。explain: true 为每条结果追加原因行；budget_tokens 按估算 token 数限制输出。', group: 'core' },
			{ name: 'memory_forget', title: '从记忆中删除', desc: '通过键或 id 删除条目。', group: 'core' },
			{ name: 'memory_stats', title: '记忆统计', desc: '显示项目记忆的统计信息，包括质量分布、最常访问的条目以及命中率/重复率/废弃率指标。', group: 'core' },
			{ name: 'memory_diff', title: '记忆差异', desc: '查看自上次会话以来的变化。', group: 'core' },
			{ name: 'memory_suggest', title: '建议相关条目', desc: '为给定上下文显示相关条目。', group: 'core' },
			{ name: 'memory_summary', title: '文件摘要', desc: '保存或检索文件摘要以节省 token。', group: 'core' },
			{ name: 'memory_archive', title: '归档旧条目', desc: '移动超过 30 天的条目以保持记忆整洁。', group: 'core' },
			{ name: 'memory_smart_recall', title: '智能召回', desc: '统一搜索，在一次调用中结合 BM25 + 图中心性 + 质量评分 + 新鲜度。支持 explain: true（每条结果的原因）和 budget_tokens（输出上限）。', group: 'search' },
			{ name: 'memory_captured', title: '捕获的活动', desc: '查看 hooks 自动捕获的活动日志 — 将观察提升为记忆。', group: 'search' },
			{ name: 'memory_consolidate', title: '合并去重', desc: '通过 mode 参数以确定性方式去重相同内容、合并近似重复（Jaccard >50%）、批量移除低质量条目或淘汰旧库版本条目（mode: "versions"） — 无 LLM。', group: 'search' },
			{ name: 'context_brief', title: '上下文简报', desc: '一次调用的上下文简报：记忆 + 会话 + 健康状态，紧凑 markdown。零 LLM。', group: 'context' },
			{ name: 'context_generate', title: '完整项目简报', desc: '一次调用的简报：项目结构 + git 状态 + 记忆 + 会话。替代 6 次手动调用。节省 93% token。', group: 'context' },
			{ name: 'context_diff', title: '增量简报', desc: 'git 提交 + 修改的文件 + 自上次会话以来的新/更新记忆。节省 72% token。', group: 'context' },
			{ name: 'context_focus', title: '定向简报', desc: '特定查询的相关记忆 + 相关文件 + 调用者 + 测试文件。', group: 'context' },
			{ name: 'context_health', title: '健康审计', desc: '孤立链接、重复项、损坏的文件引用、过期 TTL、过时会话。评分 0–100。', group: 'context' },
			{ name: 'context_export', title: '导出为 Markdown', desc: '将记忆导出为可注入的 markdown 用于系统提示。节省 82% token。', group: 'context' },
			{ name: 'memory_sessions', title: '会话', desc: '显示活跃的代理会话并检测软冲突。', group: 'sessions' },
			{ name: 'memory_compress', title: 'LLM 压缩', desc: 'LLM 驱动的两步压缩：摘要 + 覆盖。如果可用则使用 Anthropic/OpenAI CLI。', group: 'compress' },
			{ name: 'memory_primer', title: '上下文引导', desc: '一次调用的上下文引导：主要记忆 + 分类 + 会话文件变化。会话开始时自动注入。', group: 'compress' },
			{ name: 'memory_merge_sessions', title: '合并会话', desc: '合并文件的并行会话中的观察。去重并自动提升。', group: 'sessions' },
			{ name: 'memory_export_gist', title: '导出到 Gist', desc: '将条目导出到 GitHub Gist（公开或私有）。使用 GITHUB_TOKEN 或 gh CLI。', group: 'sync' },
			{ name: 'memory_import_gist', title: '从 Gist 导入', desc: '从 GitHub Gist 导入条目。与现有条目合并（标签联合，最大置信度）。', group: 'sync' },
			{ name: 'memory_encrypt', title: '启用加密', desc: '使用自动生成密钥的 AES-256-GCM 加密。', group: 'sync' },
			{ name: 'memory_decrypt', title: '禁用加密', desc: '解密并禁用加密。', group: 'sync' },
			{ name: 'memory_backup', title: '备份记忆', desc: '创建带时间戳的记忆文件备份。自动修剪至最近 10 条。', group: 'sync' },
			{ name: 'memory_visualize', title: '打开图谱查看器', desc: '在兼容 MCP Apps 的主机中内联渲染交互式记忆图谱。力导向图、统计、时间线、详情面板。', group: 'core' },
			{ name: 'memory_pin', title: '固定条目', desc: '固定重要条目，使其始终出现在召回结果顶部，即使没有关键字匹配。', group: 'core' },
			{ name: 'memory_unpin', title: '取消固定', desc: '移除条目的固定标记。', group: 'core' },
			{ name: 'memory_search', title: '统一搜索', desc: '使用类别、标签和日期范围过滤器搜索记忆。标签过滤使用 AND 逻辑。', group: 'search' },
			{ name: 'memory_tag', title: '批量标签操作', desc: '在单次调用中按 key 或 id 对一个或多个条目添加、删除或设置标签。', group: 'core' },
			{ name: 'memory_reflect', title: '记忆反思', desc: '按过期程度、质量和过度连接对条目进行确定性排名，以发现需要关注或清理的内容。零 LLM。', group: 'core' },
			{ name: 'memory_promote', title: '自动提升', desc: '确定性提升低置信度草稿为活跃条目（阈值 0.65，Jaccard 去重 > 0.5）。默认 dryRun。', group: 'core' },
		],
	},
	graphSection: {
		title: '你的记忆，以图谱形式',
		subtitle: '将决策与规格、bug 和架构连接起来。召回返回正确的上下文 — 不仅仅是关键词匹配。',
		points: ['使用 `links` 或 `[[key]]` 引用连接条目 — 无需嵌入，无需 LLM', '`memory_recall({ mode: "graph" })` 展开关系感知的子图'],
		launchLabel: '打开交互式查看器',
	},
	viewerSection: {
		title: '记忆图谱查看器',
		subtitle: '将你的记忆可视化成一个交互式力导向图。一目了然看到条目、连接、类别和访问模式。',
		capsLabel: '查看器内：',
		caps: ['搜索', '路径查找', '导出 PNG / SVG', '深色与浅色主题'],
		features: [
			'<strong>CLI 查看器：</strong><code>npx toon-memory viewer</code> 启动 HTTP 服务器',
			'<strong>内联 MCP Apps 查看器：</strong>调用 <code>memory_visualize()</code> 直接在兼容 MCP Apps 的主机中渲染图 — 无需服务器',
			'悬停节点查看包含内容预览和质量分数的 tooltips',
			'点击选择并居中；双击打开详情',
			'搜索过滤条目并以脉动光晕高亮匹配节点',
			'路径查找器查找并高亮两个条目之间的最短连接',
			'可调物理、深色/浅色主题、PNG/SVG 导出',
		],
	},
	smartRecallSection: {
		title: '智能、高 token 效率的召回',
		subtitle: '召回通过 BM25 相关性和图中心性离线重新排序 — 然后在 token 重要时压缩为紧凑形式。质量评分和新鲜度提升最佳条目。',
		points: ['在 id + 类别 + 键 + 内容 + 标签上进行 BM25 评分', '图中心性使中心条目即使不包含查询词也会浮现', '质量评分 (0-1) 和新鲜度衰减提升最佳、最新的条目', '`compact: true` → 数字索引，省略 id/日期/文件，片段截断的邻居'],
		standardCode: 'memory_recall({ query: "riesgo", mode: "graph" })\n[decision] risk-engine-priority (a1b2c3d4)\n  The engine prioritizes risk over speed.\n  File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01\n  links: engine-arch',
		compactCode: 'memory_recall({ query: "riesgo", mode: "graph", compact: true })\n[1] decision/risk-engine-priority\n  The engine prioritizes risk over speed.\n  tags: risk;spec · edges: ->2, ->3',
		caption: 'compact 模式以更少的 token 保留相同的上下文 — .toon 文件从不被修改。',
	},
	faq: {
		title: '常见问题', subtitle: '关于为你的代理提供记忆你需要知道的一切',
		items: [
			{ q: '什么是 toon-memory？', a: '面向 AI 编程代理的持久记忆层，包含 35 个 MCP 工具。它以紧凑的 TOON 格式存储决策、模式、bug 和上下文，让你的代理在会话之间记住一切 — 每次会话减少 80% 的工具调用。' },
			{ q: '支持哪些代理？', a: 'OpenCode、VS Code、Claude Code、Cursor、Windsurf、Cline、Continue、Codex、Gemini、Zed、Antigravity、Aider、KiloCode、OpenClaw 和 Kiro — 通过 MCP 服务器零配置支持 15+ 个代理。' },
			{ q: '我的数据如何存储？', a: '条目写入本地 TOON 文件（一种 token 高效的格式，比 JSON 小约 22%，实测）。你拥有该文件，可以像任何其他源文件一样提交、diff 或备份。' },
			{ q: '我的记忆是加密的吗？', a: '是的。使用 memory_encrypt 工具启用加密，通过 AES-256-GCM 保护敏感条目。密钥自动生成并保持在本地。' },
			{ q: '它能离线工作吗？', a: '完全可以。toon-memory 在本地运行，无需外部服务或账户。Watch 模式甚至可以按计划自动创建备份。' },
			{ q: '多个代理可以共享相同的记忆吗？', a: '可以。因为记忆存储在项目中的普通文件中，为该项目配置的每个代理都读写相同的上下文。' },
			{ q: '如何备份我的记忆？', a: '使用 watch 模式进行定时自动备份，或者直接将 TOON 文件提交到 git。旧条目在 30 天后自动归档以保持整洁。' },
			{ q: '它是免费和开源的吗？', a: '是的。toon-memory 采用 MIT 许可证，免费使用。源代码在 GitHub 上，包发布在 npm 上。' },
			{ q: '它与代理内置记忆有什么不同？', a: '内置记忆通常是临时的或特定于供应商的。toon-memory 提供一个可移植、可 diff、加密的记忆文件，你完全控制，跨代理和项目使用。' },
			{ q: '我可以设置临时上下文过期吗？', a: '可以。在任何条目上设置 TTL（例如 ttl: "7d"），它会自动过期 — 非常适合冲刺计划、截止日期和时间敏感的笔记。' },
			{ q: '什么是智能召回？', a: 'memory_smart_recall 在一次调用中结合 BM25 关键词搜索、图中心性、质量评分和新鲜度衰减 — 无需手动编排的最佳排名策略。' },
			{ q: '质量评分是如何工作的？', a: '每条条目自动获得质量评分 (0-1)，基于标签覆盖率、链接丰富度、内容详细度、新鲜度和特定度。高质量条目在召回结果中首先出现。' },
			{ q: '如果我两次保存相同的键会怎样？', a: '系统合并属性而非替换：标签和链接取并集，质量和置信度取最大值，日期更新。你的条目随时间变得更丰富。' },
			{ q: '什么是记忆压缩？', a: 'memory_compress 允许 LLM 将相关条目摘要为简洁的总结。memory_consolidate(mode: "low-quality") 可确定性地移除低质量条目（无标签、短内容）— 无需 LLM。两者都减少令牌数量。' },
			{ q: '可以在机器之间同步记忆吗？', a: '可以。使用 memory_export_gist 将条目推送到 GitHub Gist，然后在另一台机器上使用 memory_import_gist。条目会自动合并（标签并集、最大置信度）。' },
		],
	},
	whatNew: {
		title: 'v4.3.0 新功能',
		subtitle: '显式重要性等级，外加 Explain WHY、Token 预算、版本取代和更智能的排序',
		cards: [
			{
				icon: '🎯',
				title: '显式重要性',
				body: '`memory_remember({ importance })` 设置 `critical`、`high`、`medium` 或 `low` — 关键决策优先显示（+0.3），低级笔记不占位置（−0.1）。留空 = 自动（时效 + 频率）。',
				stats: ['critical +0.3', 'high +0.15', 'low −0.1'],
			},
			{
				icon: '🤔',
				title: '解释原因',
				body: '`memory_recall`/`memory_smart_recall` 接受 `explain: true`，为每条返回的条目追加确定性的原因行（`↳ 100% relevance · used 14× · used today · importance HIGH`）——说明*为什么*被检索到，无需 LLM。',
				stats: ['↳ 原因行', '无需 LLM'],
			},
			{
				icon: '🧮',
				title: 'Token 预算',
				body: '`budget_tokens` 按估算的 token 数限制召回输出；条目贪心累积，超出预算的尾部会被丢弃（`0` = 无限制）。',
				stats: ['0 = 无限制', '贪心截断'],
			},
			{
				icon: '🔄',
				title: '版本取代',
				body: '`memory_consolidate(mode: "versions")` 检测描述同一主题在不同库版本的条目（如"使用 React 18" vs "使用 React 19"），并淘汰旧条目、保留最新版本。',
				stats: ['"versions" 模式', 'dryRun'],
			},
			{
				icon: '🚫',
				title: '负面记忆',
				body: '提供 `warning` 分类，用于"不要这样做"的事实——反模式和雷区。`warning` 条目获得召回加成，让 Agent 在重复犯错之前看到这些错误。',
				stats: ['warning 加成', '反模式'],
			},
			{
				icon: '📊',
				title: '扩展统计',
				body: '`memory_stats` 现在报告命中率（至少被召回一次的条目百分比）、重复率（完全重复内容百分比）和废弃率（过时条目百分比）。',
				stats: ['命中率', '重复率', '废弃率'],
			},
			{
				icon: '🎯',
				title: '更智能的排序',
				body: '召回增加了语言家族加成（+0.1），用于使用相同文字体系（latin/CJK/cyrillic/…）书写的条目；以及文件夹匹配加成（+0.05），当 `path_scope` 与当前文件匹配时。',
				stats: ['语言 +0.1', '文件夹 +0.05'],
			},
		],
	},
	cta: { title: '准备好为你的代理带来连续性了吗？', subtitle: '几秒内完成安装，再也不必重新解释你的项目。', getStarted: '快速开始', viewGithub: '在 GitHub 上查看' },
	footer: { text: 'MIT 许可证 — ', odalx: 'ODALX 的开源项目', odalxTag: '为 AI 原生时代构建基础设施。' },
},
	ja: {
	nav: { docs: 'ドキュメント', features: '機能', viewer: 'ビューアー', benchmarks: 'ベンチマーク', faq: 'FAQ', npm: 'npm', github: 'GitHub' },
	hero: {
		tagline: 'AIエージェントのための継続性レイヤー',
		subtitle:
			'AIエージェントは毎セッションでプロジェクトを学び直すべきではありません。toon-memory はプロジェクトの知識、決定、規約をセッションを超えて保存します — MCP 経由で、ローカルかつプライベートに。',
		poweredBy: 'TOON を採用',
		getStarted: 'はじめに', viewGithub: 'GitHub で見る', copy: 'コピー', copied: 'コピーしました！', installCmd: 'npm install -g toon-memory',
	},
	problem: {
		title: 'なぜエージェントはセッション間でコンテキストを失うのか？', subtitle: 'AI コーディングエージェントは毎セッション記憶喪失から始める',
		cards: [
			{ icon: '🌀', title: 'コンテキストが毎日リセットされる', body: '新しいセッションごとに、エージェントは昨日学んだ意思決定、パターン、バグを忘れます。同じコンテキストを何度も繰り返し説明する必要があります。' },
			{ icon: '🔍', title: '履歴の中を検索', body: 'メモリがなければ、エージェントは git 履歴を検索し、ファイルを再読み込みして、なぜそのような方法で構築されたのかを再構築します — トークンと時間を消費します。' },
			{ icon: '📋', title: 'コピー＆ペーストのメモ', body: '開発者はチャット間で手動でコンテキストを貼り付けます。これは脆く、古くなりやすく、次の自律的な実行には伝わりません。' },
		],
		resolution: 'toon-memory はエージェントに永続的でクエリ可能なメモリを提供します — コンテキストが自動的にすべてのセッションで生存します。',
	},

	continuity: {
		kicker: 'toon-memory を知る',
		title: 'コーディングワークフローのための継続性レイヤー',
		subtitle: 'メモリは事実を保存しますが、継続性レイヤーはプロジェクトの働き方を保存します — 各セッションが前回の終わりから始まるように。',
		items: [
			{ icon: '🧭', title: '決定', body: 'すべての選択の「理由」— フレームワーク、ライブラリ、トレードオフ。必要な時に想起され、再議論されることはありません。' },
			{ icon: '📏', title: '規約', body: 'チームが合意した命名、構造、スタイルのルール。言われなくても守られます。' },
			{ icon: '🧠', title: 'コンテキスト', body: '単一のファイルには存在しない、アーキテクチャ・環境・運用の知識。' },
			{ icon: '🤝', title: '共有された理解', body: 'プロジェクト知識とチームの決定が、すべてのエージェントとセッションで利用可能。' },
		],
		closing: 'toon-memory は継続性レイヤーの概念を導入します：AI セッション間でプロジェクトの知識・決定・コンテキストを保存する軽量システム — クラウドサービスも重いインフラも不要。',
	},

	benefits: {
		kicker: '開発者が toon-memory を選ぶ理由',
		title: '実際にある問題を中心に設計',
		subtitle: 'ツールのリストではなく、成果のセット。',
		groups: [
			{ icon: '🧭', title: '持続的なプロジェクト知識', items: ['決定とその理由を記憶', 'アーキテクチャと規約を記憶', 'セッションをまたいで蓄積 — 再説明不要'] },
			{ icon: '🔒', title: 'プライバシー優先', items: ['100% ローカル — クラウドなし、サーバーなし、テレメトリなし', 'オプションの AES-256-GCM 暗号化', '記憶ファイルはソースファイル同様、あなたのもの'] },
			{ icon: '⚡', title: '軽量', items: ['ネイティブ TOON 形式 — JSON より 22% 少ないトークン', '依存関係ゼロ、Node.js 18+ で動作', '決定論的ロジック — LLM 呼び出しなし、API キー不要'] },
			{ icon: '🛰️', title: 'ユニバーサル', items: ['15+ のエージェントに対応: Claude Code、Codex、Gemini CLI、Cursor、OpenCode など', '標準 MCP — コンテキストを失わずにエージェントを変更', 'チーム全員が共有するプロジェクト別メモリ'] },
		],
	},

	features: {
		cards: [
			{
				icon: '🧩',
				title: 'プロトコルではなくメモリツールキット',
				body: 'エージェントが記憶、リコール、推論するために必要なすべて — 目的ごとにグループ化され、直接コンテキスト読み取り用のリソースと対話型グラフビューアを備えています。',
				toolGroups: [
					{ label: 'コアメモリ', tools: ['memory_remember', 'memory_recall', 'memory_forget', 'memory_stats', 'memory_diff', 'memory_suggest', 'memory_summary', 'memory_archive', 'memory_checkpoint', 'memory_visualize', 'memory_pin', 'memory_unpin', 'memory_tag', 'memory_reflect', 'memory_promote'] },
					{ label: '検索＆インテリジェンス', tools: ['memory_smart_recall', 'memory_captured', 'memory_consolidate', 'memory_graph_path', 'memory_search'] },
					{ label: 'コンテキストブリーフィング', tools: ['context_brief', 'context_generate', 'context_diff', 'context_focus', 'context_health', 'context_export'] },
					{ label: '圧縮', tools: ['memory_compress', 'memory_primer'] },
					{ label: 'セッション', tools: ['memory_sessions', 'memory_merge_sessions'] },
					{ label: '同期＆セキュリティ', tools: ['memory_export_gist', 'memory_import_gist', 'memory_encrypt', 'memory_decrypt', 'memory_backup'] },
				],
				wide: true,
			},
			{ icon: '⭐', title: 'マルチエージェント', body: 'すべての主要 AI コーディングエージェントに対応。OpenCode、VS Code、Claude、Cursor、Windsurf、Cline、Continue — ゼロコンフィグ。', tags: ['OpenCode', 'Claude', 'Cursor'] },
			{ icon: '📄', title: 'TOON フォーマット', body: 'JSON より 22% トークン削減（実測）。LLM 理解とトークン効率のために設計されたカスタムエンコーディング。', stats: ['トークン 22% 削減', 'パース速度 1.3x 向上'] },
			{ icon: '🔎', title: 'スマートリコール', body: 'グラフベースのリコールが BM25 関連性とグラフ中心性で再順位付けされます（クエリワードがなくてもハブが浮上）。ホップごとの減衰で遠いコンテキストを低く維持。トークン効率の高い `compact` モードは数字インデックス、スニペット切り詰めの結果を返します。', stats: ['BM25', '中心性', 'compact'] },
			{ icon: '🧠', title: 'スマートメモリ', body: '組み込み語彙とプロジェクト依存関係からの自動タグ推論、品質スコア、信頼度スコア、マージ重複排除、関連エントリの提案、メモリ diff、および一時コンテキスト用の設定可能な TTL。', stats: ['自動タグ', '品質評価', 'マージ重複排除'] },
			{ icon: '🔒', title: '暗号化', body: 'AES-256-GCM による機密データ保護。古いエントリの自動アーカイブ。Watch モードで N 分ごとに自動バックアップ。', stats: ['AES-256-GCM', '自動バックアップ'] },
		],
	},
	agents: { title: '15 以上の AI コーディングエージェントに対応', subtitle: 'ゼロコンフィグ — toon-memory が自動検出し、各エージェントを設定' },
	stats: { items: [				{ number: '97.6%', label: 'トップ5からのリコール (R@5 0.861)' }, { number: '15', label: 'エージェント' }, { number: '80%', label: 'セッションあたりツール呼び出し削減' }, { number: '0', label: '必要な設定' }] },
	howItWorks: {
		title: 'どのように機能するのか？', subtitle: '記憶喪失からメモリへの 4 つのステップ',
		steps: [
			{ n: 1, title: 'インストール', body: 'ワンコマンド。15 以上のエージェントにゼロコンフィグ。', code: 'npm install -g toon-memory' },
			{ n: 2, title: '記憶する', body: '作業しながら意思決定、パターン、バグを保存 — 自動タグ推論とオプションの TTL 対応。', code: 'memory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})' },
			{ n: 3, title: 'リコール', body: 'エージェントがオンデマンドでメモリをクエリ — 再説明不要、トークン浪費なし。', code: 'memory_recall({ query: "validation" })\n// [decision] use-zod (a1b2c3d4)\n//   Use Zod for validation — src/types.ts' },
			{ n: 4, title: 'コンテキスト', body: '1 回の呼び出しでエージェントにすべてを提供：プロジェクト、git、メモリ、セッション。ツール呼び出しを 80% 削減。', code: 'context_generate({})\n// # Project Briefing (full)\n// ## Project — toon-memory v4.3.0\n// ## Git — branch: main, 3 commits\n// ## Memory — 26 entries, 18 edges\n// ## Sessions — 2 active' },
		],
	},
	tips: {
		title: 'メモリのヒント', subtitle: 'これらのパターンで toon-memory を最大限に活用',
		items: [
			{ n: 1, title: '意思決定はすぐに保存', body: '選択をしたら、すぐに保存します。<em>なぜ</em>オプション A を B に選んだのかのコンテキストを追加 — 未来の自分が感謝します。' },
			{ n: 2, title: '一貫したキーを使用', body: 'ドメインごとにキーにプレフィックス：<code class="inline-code">db:redis-config</code>、<code class="inline-code">auth:jwt</code>。リコールを高速化し、衝突を回避。' },
			{ n: 3, title: 'タグは自動推論', body: 'タグを空のままにすると、システムが内容から推論 — redis、auth、api、db など 16 以上のカテゴリ。手動で追加して正確に制御することも可能。' },
			{ n: 4, title: '一時コンテキストに TTL を使用', body: '締め切り、スプリント、時間制約のあるメモ — <code class="inline-code">ttl: "7d"</code> を設定すると自動的に期限切れに。手動クリーンアップ不要。' },
		],
	},
	comparison: {
		title: '同じプロジェクト。2つのセッション。', subtitle: 'エージェントが覚えていることが結果を変えます。', beforeTitle: 'toon-memory なし', afterTitle: 'toon-memory あり', thinkingBefore: '考えています…', thinkingAfter: '思い出しています…',
		before: [
			{ session: 'セッション 1' }, { user: 'Sequelize を使う。' }, { assistant: 'OK。' }, { note: 'セッションのコンテキストに保持 — トークンが蓄積されます。', tone: 'warn' },
			{ session: 'セッション 2' }, { user: 'ORM は何ですか？' }, { note: 'セッション間の記憶がありません。', tone: 'error' }, { assistant: '分かりません。' },
		],
			after: [
				{ session: 'セッション 1' }, { user: 'Sequelize を使う。' }, { cmd: '$ memory_remember({ category: "decision", key: "orm:sequelize", content: "Sequelize を ORM として使用" })' }, { assistant: 'OK。' }, { note: 'メモリに保存されました。' },
			{ session: 'セッション 2' }, { user: 'ORM は何ですか？' }, { note: 'メモリから思い出しました。' }, { assistant: 'Sequelize を使っています。' },
		],
	},
	codeExamples: {
		quickExample: 'クイック例', quickInstall: 'クイックインストール',
		exampleCode: '// 意思決定を保存（自動タグ推論）\nmemory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})\n// 🏷️ Tags inferred: types\n\n// TTL 付きで保存（7 日後に期限切れ）\nmemory_remember({\n  category: "knowledge",\n  key: "sprint-deadline",\n  content: "Sprint ends July 18",\n  ttl: "7d"\n})\n\n// 前回セッション以降の変更を確認\nmemory_diff({ since: "24h" })\n\n// メモリを検索\nmemory_recall({ query: "redis" })\n// [bug] redis-pool-fix (i9j0k1l2)\n//   Added max_connections=20',
		installCode: '# npm\nnpm install -g toon-memory\n\n# macOS / Linux\ncurl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh\n\n# Windows (PowerShell)\nirm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex',
	},
	benchmarks: {
		title: 'ベンチマーク',
		subtitle: '推測ではなく実測',
		tabs: { ranking: 'ランキング品質', workflow: 'ワークフロー削減', format: 'TOON フォーマット' },
		retrieval: {
			subtitle: '187件の実スナップショットでのLongMemEval式検索 — 42 gold queries',
			what: '統合リコールパイプラインが正しいエントリをトップ5で見つける',
			metricLabel: '指標',
			linear: '線形',
			rrf: 'RRF',
			smart: '統合',
			metricRows: [
				{ metric: 'R@5', gloss: 'goldエントリがトップ5以内', linear: '0.643', rrf: '0.861', smart: '0.829' },
				{ metric: 'nDCG@5', gloss: '順序の品質', linear: '0.654', rrf: '0.764', smart: '0.739' },
				{ metric: 'MRR@5', gloss: '正解の位置', linear: '0.776', rrf: '0.788', smart: '0.760' },
			],
			result: '97.6%のクエリがトップ5から回答可能',
			note: '実 <code>data.toon</code> スナップショット（187件、2026-08-01）、<code>today</code> で決定論的、読み取り専用・コピーなし；priority メタエントリ2件除外。再現: <code>npm run bench:retrieval</code>。',
		},
		workflow: {
			subtitle: '実際のセッションで測定したトークンとツール呼び出しの削減',
			stats: [
				{ num: '~90%', cap: 'トークン削減（自動ロード）' },
				{ num: '80%', cap: 'ツール呼び出し削減 (25 → 5)' },
				{ num: '68%', cap: 'トークン削減（コンパクト recall）' },
				{ num: '58%', cap: 'トークン削減（システム primer）' },
				{ num: '14%', cap: 'トークン削減（バッチ圧縮）' },
			],
			note: '自動ロード：OpenCode プラグインは全エントリをダンプせず、ファイル関連のメモリのみを注入します。フルセッション：開始 → デバッグ → 実装 → レビュー → 終了。再現可能：<code>npm run bench:full</code>、<code>npm run bench:primer</code>、<code>npm run bench:compress-all</code>。',
		},
		format: {
			subtitle: 'TOON フォーマットは人間のためではなく、LLM のために構築された',
			stats: [{ num: '22.5%', cap: 'JSON よりトークン削減' }, { num: '30.5%', cap: '単一エントリ' }, { num: '1.3x', cap: 'パース速度向上' }],
			note: '<code>gpt-tokenizer</code>（cl100k_base）で 16 件の代表的なメモリエントリを測定。実際の TOON フォーマットとコンパクト JSON を比較。再現可能：<code>npm run bench</code>。',
		},
	},
	tools: {
		title: '完全なメモリツールキット', subtitle: 'エージェントが記憶、リコール、推論するために必要なすべて', resourcesLabel: 'リソース：',
		groups: {
			core: 'コアメモリ',
			search: '検索＆インテリジェンス',
			context: 'コンテキストブリーフィング',
			compress: '圧縮',
			sessions: 'セッション',
			sync: '同期＆セキュリティ',
		},
		cards: [
			{ name: 'memory_remember', title: 'メモリに保存', desc: '意思決定、パターン、バグ、知識、またはwarning（「これはやらない」否定的メモリ、ブースト付きでリコール）を保存 — 自動品質スコアリング付きでセッション間永続化。', group: 'core' },
			{ name: 'memory_recall', title: 'メモリを検索', desc: 'ファイルを読む前にナレッジグラフをクエリ。品質加重の結果。path_scope と予算制御（tiny/normal/deep）をサポート。explain: true でエントリごとの理由行、budget_tokens で推定トークン数による出力制限。', group: 'core' },
			{ name: 'memory_forget', title: 'メモリから削除', desc: 'キーまたは id でエントリを削除。', group: 'core' },
			{ name: 'memory_stats', title: 'メモリ統計', desc: '品質分布と最もアクセスされたエントリに加え、ヒット率/重複/廃止メトリクスを含むプロジェクトメモリの統計を表示。', group: 'core' },
			{ name: 'memory_diff', title: 'メモリ差分', desc: '前回セッション以降の変更を確認。', group: 'core' },
			{ name: 'memory_suggest', title: '関連を提案', desc: '指定されたコンテキストの関連エントリを表示。', group: 'core' },
			{ name: 'memory_summary', title: 'ファイル要約', desc: 'トークン節約のためにファイル要約を保存または取得。', group: 'core' },
			{ name: 'memory_archive', title: '古いものをアーカイブ', desc: 'メモリをきれいに保つために 30 日以上のエントリを移動。', group: 'core' },
			{ name: 'memory_smart_recall', title: 'スマートリコール', desc: 'BM25 + グラフ中心性 + 品質スコア + 新鮮度を 1 回の呼び出しで統合検索。explain: true（エントリごとの理由）と budget_tokens（出力上限）をサポート。', group: 'search' },
			{ name: 'memory_captured', title: 'キャプチャされたアクティビティ', desc: 'フックによって自動キャプチャされたアクティビティログを表示 — オブザベーションをメモリに昇格。', group: 'search' },
			{ name: 'memory_consolidate', title: '統合', desc: 'mode パラメータで、同一内容の重複を除去し、近似重複（Jaccard >50%）をマージし、低品質エントリを一括削除し、古いライブラリバージョンのエントリを退役させます（mode: "versions"） — 決定的、LLM 不要。', group: 'search' },
			{ name: 'context_brief', title: 'コンテキストブリーフィング', desc: '1 回呼び出しのコンテキストブリーフィング：メモリ + セッション + ヘルス。コンパクト markdown。ゼロ LLM。', group: 'context' },
			{ name: 'context_generate', title: '完全プロジェクトブリーフィング', desc: '1 回呼び出しのブリーフィング：プロジェクト構造 + git 状態 + メモリ + セッション。6 回の手動呼び出しを置換。トークン 93% 節約。', group: 'context' },
			{ name: 'context_diff', title: 'インクリメンタルブリーフィング', desc: 'git コミット + 変更ファイル + 前回セッション以降の新規/更新メモリ。トークン 72% 節約。', group: 'context' },
			{ name: 'context_focus', title: 'ターゲットブリーフィング', desc: '特定クエリの関連メモリ + 関連ファイル + 呼び出し元 + テストファイル。', group: 'context' },
			{ name: 'context_health', title: 'ヘルス監査', desc: 'オーファンリンク、重複、壊れたファイル参照、期限切れ TTL、古いセッション。スコア 0–100。', group: 'context' },
			{ name: 'context_export', title: 'Markdown としてエクスポート', desc: 'メモリをシステムプロンプト用の注入可能な markdown としてエクスポート。トークン 82% 節約。', group: 'context' },
			{ name: 'memory_compress', title: 'LLM 圧縮', desc: 'LLM 駆動の2段階圧縮：要約 + 上書き。Anthropic/OpenAI CLI が利用可能な場合は使用。', group: 'compress' },
			{ name: 'memory_primer', title: 'コンテキストプライマー', desc: '1 回呼び出しのコンテキストプライマー：主要メモリ + カテゴリ + セッションファイル変更。セッション開始時に自動注入。', group: 'compress' },
			{ name: 'memory_sessions', title: 'セッション', desc: 'アクティブなエージェントセッションを表示し、ソフト衝突を検出。', group: 'sessions' },
			{ name: 'memory_merge_sessions', title: 'セッションマージ', desc: 'ファイルの並列セッション間でオブザベーションをマージ。重複排除し、自動昇格。', group: 'sessions' },
			{ name: 'memory_export_gist', title: 'Gist にエクスポート', desc: 'エントリを GitHub Gist（公開/非公開）にエクスポート。GITHUB_TOKEN または gh CLI を使用。', group: 'sync' },
			{ name: 'memory_import_gist', title: 'Gist からインポート', desc: 'GitHub Gist からエントリをインポート。既存エントリとマージ（タグ联合、最大信頼度）。', group: 'sync' },
			{ name: 'memory_encrypt', title: '暗号化を有効にする', desc: '自動生成キーによる AES-256-GCM 暗号化。', group: 'sync' },
			{ name: 'memory_decrypt', title: '暗号化を無効にする', desc: '復号化して暗号化を無効にします。', group: 'sync' },
			{ name: 'memory_backup', title: 'メモリバックアップ', desc: 'タイムスタンプ付きメモリファイルバックアップを作成。最新 10 件に自動修剪。', group: 'sync' },
			{ name: 'memory_pin', title: 'エントリをピン留め', desc: '重要なエントリをピン留めして、キーワード一致がなくても常にリコール結果の先頭に表示。', group: 'core' },
			{ name: 'memory_unpin', title: 'ピン留めを解除', desc: 'エントリのピン留めフラグを削除。', group: 'core' },
			{ name: 'memory_search', title: '統合検索', desc: 'カテゴリ、タグ、日付範囲フィルタでメモリを検索。タグフィルタは AND 論理 — 指定した全タグが一致する必要があります。', group: 'search' },
			{ name: 'memory_tag', title: '一括タグ操作', desc: '1 回の呼び出しで key または id で 1 つ以上のエントリにタグを追加、削除、設定。', group: 'core' },
			{ name: 'memory_reflect', title: 'メモリリフレクト', desc: '古さ、品質、過剰接続に基づいてエントリを決定的にランク付けし、注目やクリーンアップが必要なものを明らかにします。ゼロ LLM。', group: 'core' },
			{ name: 'memory_promote', title: '自動昇格', desc: '低信頼度の下書きを決定的にアクティブエントリへ昇格（閾値 0.65、Jaccard 重複排除 > 0.5）。デフォルトは dryRun。', group: 'core' },
		],
	},
	graphSection: {
		title: 'メモリをグラフで', subtitle: '意思決定を仕様、バグ、アーキテクチャに接続。リコールは正しいコンテキストを返す — 単なるキーワード一致ではない。',
		points: ['`links` または `[[key]]` 参照でエントリを接続 — 埋め込み不要、LLM 不要', '`memory_recall({ mode: "graph" })` がリレーションシップを考慮したサブグラフを展開'],
		launchLabel: 'インタラクティブビューアを開く',
	},
	viewerSection: {
		title: 'メモリグラフビューア',
		subtitle: 'メモリをインタラクティブな力指向グラフとして可視化。エントリ、接続、カテゴリ、アクセスパターンを一目で。',
		capsLabel: 'ビューア内：',
		caps: ['検索', 'パスファインダー', 'PNG / SVG エクスポート', 'ダーク＆ライトテーマ'],
		features: [
			'<strong>CLI ビューア：</strong><code>npx toon-memory viewer</code> が HTTP サーバーを起動',
			'<strong>インライン MCP Apps ビューア：</strong><code>memory_visualize()</code> を呼び出すと MCP Apps 互換ホストにグラフを直接レンダリング — サーバー不要',
			'ノードにホバーするとコンテンツプレビューと品質スコア付きのツールチップ表示',
			'クリックで選択・中央表示、ダブルクリックで詳細を開く',
			'検索はエントリをフィルタし、一致ノードを脈動グローでハイライト',
			'パスファインダーが2つのエントリ間の最短接続を発見・ハイライト',
			'物理調整、ダーク/ライトテーマ、PNG/SVGエクスポート',
		],
	},
	smartRecallSection: {
		title: 'スマートでトークン効率の高いリコール',
		subtitle: 'リコールは BM25 関連性とグラフ中心性でオフラインで再順位付けされた後、トークンが重要な場合は紧凑な形式に圧縮。品質スコアと新鮮度が最良のエントリを押し上げる。',
		points: ['id + カテゴリ + キー + 内容 + タグに対する BM25 スコアリング', 'グラフ中心性がクエリワードがなくてもハブエントリを浮上', '品質スコア（0-1）と新鮮度の減衰が最良の最新エントリを押し上げ', '`compact: true` → 数字インデックス、id/日付/ファイル省略、スニペット切り詰めの近隣'],
		standardCode: 'memory_recall({ query: "riesgo", mode: "graph" })\n[decision] risk-engine-priority (a1b2c3d4)\n  The engine prioritizes risk over speed.\n  File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01\n  links: engine-arch',
		compactCode: 'memory_recall({ query: "riesgo", mode: "graph", compact: true })\n[1] decision/risk-engine-priority\n  The engine prioritizes risk over speed.\n  tags: risk;spec · edges: ->2, ->3',
		caption: 'compact モードは同じコンテキストをより少ないトークンで保持 — .toon ファイルは変更されない。',
	},
	faq: {
		title: 'よくある質問', subtitle: 'エージェントにメモリを与えるために知っておくべきことすべて',
		items: [
			{ q: 'toon-memory とは？', a: '35 個の MCP ツールを備えた AI コーディングエージェント向けの永続メモリレイヤー。意思決定、パターン、バグ、コンテキストをコンパクトな TOON フォーマットで保存し、エージェントがセッション間ですべてを記憶 — セッションあたり 80% ツール呼び出し削減。' },
			{ q: 'どのエージェントがサポートされているか？', a: 'OpenCode、VS Code、Claude Code、Cursor、Windsurf、Cline、Continue、Codex、Gemini、Zed、Antigravity、Aider、KiloCode、OpenClaw、Kiro — MCP サーバー経由でゼロコンフィグの 15 以上のエージェント。' },
			{ q: 'データはどのように保存されるか？', a: 'エントリはローカル TOON ファイル（JSON より約 22% 小さいトークン効率のフォーマット、実測）に書き込まれます。ファイルはあなたのもので、他のソースファイルと同様にコミット、diff、バックアップが可能。' },
			{ q: 'メモリは暗号化されているか？', a: 'はい。memory_encrypt ツールで暗号化を有効にし、AES-256-GCM で機密エントリを保護。キーは自動生成され、ローカルに保持。' },
			{ q: 'オフラインで動作するか？', a: '完全に。toon-memory は外部サービスやアカウント不要でローカルで実行。Watch モードではスケジュールに従って自動バックアップも作成。' },
			{ q: '複数のエージェントが同じメモリを共有できるか？', a: 'はい。メモリがプロジェクト内のプレーンファイルに存在するため、そのプロジェクトに設定されたすべてのエージェントが同じコンテキストを読み書き。' },
			{ q: 'メモリのバックアップはどうすればいいか？', a: 'Watch モードで定期的な自動バックアップ、または TOON ファイルを git にコミットするだけ。古いエントリは 30 日後に自動アーカイブ。' },
			{ q: '無料でオープンソースか？', a: 'はい。toon-memory は MIT ライセンスで無料使用。ソースは GitHub にあり、パッケージは npm に公開。' },
			{ q: 'エージェントの組み込みメモリとの違いは？', a: '組み込みメモリはエフェメラルまたはベンダー固有の場合が多い。toon-memory はエージェントやプロジェクト全体で完全にコントロールできる、ポータブルで diff 可能、暗号化されたメモリファイルを提供。' },
			{ q: '一時コンテキストを期限切れにできるか？', a: 'はい。任意のエントリに TTL（例：ttl: "7d"）を設定すると自動的に期限切れ — スプリント、締め切り、時間制約のあるメモに最適。' },
			{ q: 'スマートリコールとは？', a: 'memory_smart_recall は BM25 キーワード検索、グラフ中心性、品質スコアリング、新鮮度の減衰を 1 回の呼び出しで組み合わせ — 手動オーケストレーションなしですべてのランキング戦略の最良を実現。' },
			{ q: '品質スコアリングはどのように機能するか？', a: '各エントリはタグカバレッジ、リンクの豊かさ、コンテンツの詳細度、新鮮度、特異性に基づいて自動的に品質スコア（0-1）を取得。高品質エントリがリコール結果で最初に表示。' },
			{ q: '同じキーを 2 回保存するとどうなるか？', a: 'システムは属性をマージして置換しない：タグとリンクは和集合、品質と信頼度は最大値、日付は更新。エントリは時間とともに豊かになる。' },
			{ q: 'メモリ圧縮とは？', a: 'memory_compressはLLMに関連するエントリを簡潔な要約にまとめるさせます。memory_consolidate(mode: "low-quality")は低品質なエントリ（タグなし、短いコンテンツ）を決定論的に削除します — LLM不要。どちらもトークン数を削減します。' },
			{ q: 'マシン間でメモリを同期できますか？', a: 'はい。memory_export_gistでGitHub Gistにエントリをプッシュし、別のマシンでmemory_import_gistを使用します。エントリは自動的にマージされます（タグの和集合、最大信頼度）。' },
		],
	},
	whatNew: {
		title: 'v4.3.0 新機能',
		subtitle: '明示的な重要度レベル、WHYを説明、トークンバジェット、バージョンスーパーセード、よりスマートなランキング',
		cards: [
			{
				icon: '🎯',
				title: '明示的な重要度',
				body: '`memory_remember({ importance })`で`critical`、`high`、`medium`、`low`を設定 — 重要な意思決定は最初に表示（+0.3）、低いメモは邪魔になりません（−0.1）。空＝自動（鮮度＋頻度）。',
				stats: ['critical +0.3', 'high +0.15', 'low −0.1'],
			},
			{
				icon: '🤔',
				title: 'WHYを説明',
				body: '`memory_recall`/`memory_smart_recall`は`explain: true`を受け付け、返される各エントリに決定論的な理由行（`↳ 100% relevance · used 14× · used today · importance HIGH`）を追加します — なぜ取得されたか、LLM不使用。',
				stats: ['↳ 理由行', 'LLM不使用'],
			},
			{
				icon: '🧮',
				title: 'トークンバジェット',
				body: '`budget_tokens`は推定トークン数でリコール出力を制限します；エントリは貪欲に蓄積され、バジェットを超える末尾は切り捨てられます（`0`＝制限なし）。',
				stats: ['0＝制限なし', '末尾切り捨て'],
			},
			{
				icon: '🔄',
				title: 'バージョンスーパーセード',
				body: '`memory_consolidate(mode: "versions")`は同じ主題を異なるライブラリバージョンで説明するエントリ（例：「React 18を使う」vs「React 19を使う」）を検出し、古い方を新しい方のために退役させます。',
				stats: ['"versions" モード', 'dryRun'],
			},
			{
				icon: '🚫',
				title: '否定的メモリ',
				body: '「これはやらないこと」という事実のための`warning`カテゴリ — アンチパターンと地雷。`warning`エントリはリコールブーストを受け、エージェントが失敗を繰り返す前に間違いを確認できます。',
				stats: ['warningブースト', 'アンチパターン'],
			},
			{
				icon: '📊',
				title: '拡張統計',
				body: '`memory_stats`は現在、ヒット率（少なくとも1回リコールされたエントリの%）・重複（完全一致コンテンツの%）・廃止（obsoleteエントリの%）を報告します。',
				stats: ['ヒット率', '重複', '廃止'],
			},
			{
				icon: '🎯',
				title: 'よりスマートなランキング',
				body: 'リコールは同じ文字体系（ラテン/CJK/キリルなど）で書かれたエントリに+0.1の言語ファミリーブースト、`path_scope`が現在のファイルと一致する場合に+0.05のフォルダマッチブーストを追加します。',
				stats: ['言語 +0.1', 'フォルダ +0.05'],
			},
		],
	},
	cta: { title: 'エージェントに継続性を持たせませんか？', subtitle: '数秒でインストール。プロジェクトを再説明する必要はもうありません。', getStarted: 'はじめに', viewGithub: 'GitHub で見る' },
	footer: { text: 'MIT ライセンス — ', odalx: 'ODALX によるオープンソースプロジェクト', odalxTag: 'AI ネイティブ時代のインフラストラクチャを構築。' },
},
	ko: {
	nav: { docs: '문서', features: '기능', viewer: '뷰어', benchmarks: '벤치마크', faq: 'FAQ', npm: 'npm', github: 'GitHub' },
	hero: {
		tagline: 'AI 에이전트를 위한 연속성 레이어',
		subtitle:
			'AI 에이전트는 매 세션마다 프로젝트를 다시 배우지 않아야 합니다. toon-memory는 세션을 넘어 프로젝트의 지식, 결정, 관례를 보존합니다 — MCP를 통해, 로컬에서 안전하게.',
		poweredBy: 'TOON 기반',
		getStarted: '시작하기', viewGithub: 'GitHub에서 보기', copy: '복사', copied: '복사됨!', installCmd: 'npm install -g toon-memory',
	},
	problem: {
		title: '왜 에이전트가 세션 간에 컨텍스트를 잃는가?', subtitle: 'AI 코딩 에이전트는 매 세션 기억 상실로 시작합니다',
		cards: [
			{ icon: '🌀', title: '컨텍스트가 매일 리셋됨', body: '새 세션마다 에이전트는 어제 배운 결정, 패턴, 버그를 잊어버립니다. 같은 컨텍스트를 반복해서 설명해야 합니다.' },
			{ icon: '🔍', title: '기록에서 검색', body: '메모리가 없으면 에이전트는 git 기록을 검색하고 파일을 다시 읽어서 왜 특정 방식으로 구축되었는지를 재구성합니다 — 토큰과 시간을 소모합니다.' },
			{ icon: '📋', title: '복사-붙여넣기 메모', body: '개발자가 채팅 간에 수동으로 컨텍스트를 붙여넣습니다. 이는 취약하고, 오래되고, 다음 자동 실행에는 전달되지 않습니다.' },
		],
		resolution: 'toon-memory는 에이전트에 지속적이고 쿼리 가능한 메모리를 제공합니다 — 컨텍스트가 자동으로 모든 세션에서 살아남습니다.',
	},

	continuity: {
		kicker: 'toon-memory 소개',
		title: '코딩 워크플로우를 위한 연속성 레이어',
		subtitle: '메모리는 사실을 저장하지만, 연속성 레이어는 프로젝트가 작동하는 방식을 보존합니다 — 모든 세션이 이전 세션이 끝난 곳에서 시작되도록.',
		items: [
			{ icon: '🧭', title: '결정', body: '모든 선택의 "이유" — 프레임워크, 라이브러리, 트레이드오프. 중요할 때 회상되고, 다시 논쟁되지 않습니다.' },
			{ icon: '📏', title: '관례', body: '팀이 합의한 명명, 구조, 스타일 규칙. 다시 말하지 않아도 지켜집니다.' },
			{ icon: '🧠', title: '컨텍스트', body: '단일 파일에 존재하지 않는 아키텍처, 환경, 운영 지식.' },
			{ icon: '🤝', title: '공유된 이해', body: '모든 에이전트와 세션에서 사용할 수 있는 프로젝트 지식과 팀 결정.' },
		],
		closing: 'toon-memory는 연속성 레이어의 개념을 소개합니다: AI 세션 간에 프로젝트 지식, 결정, 컨텍스트를 보존하는 가벼운 시스템 — 클라우드 서비스도 무거운 인프라도 필요 없습니다.',
	},

	benefits: {
		kicker: '개발자가 toon-memory를 선택하는 이유',
		title: '실제로 겪는 문제를 중심으로 설계',
		subtitle: '도구 목록이 아니라 결과의 집합입니다.',
		groups: [
			{ icon: '🧭', title: '지속적인 프로젝트 지식', items: ['결정과 그 이유를 기억', '아키텍처와 관례를 기억', '세션 간에 축적 — 다시 설명할 필요 없음'] },
			{ icon: '🔒', title: '프라이버시 우선', items: ['100% 로컬 — 클라우드, 서버, 텔레메트리 없음', '선택적 AES-256-GCM 암호화', '메모리 파일은 소스 파일처럼 당신의 것입니다'] },
			{ icon: '⚡', title: '가벼움', items: ['네이티브 TOON 형식 — JSON보다 22% 적은 토큰', '의존성 제로, Node.js 18+에서 동작', '결정적 로직 — LLM 호출 없음, API 키 불필요'] },
			{ icon: '🛰️', title: '유니버설', items: ['15+ 에이전트 지원: Claude Code, Codex, Gemini CLI, Cursor, OpenCode 등', '표준 MCP — 컨텍스트를 잃지 않고 에이전트 변경', '팀 전체가 공유하는 프로젝트별 메모리'] },
		],
	},

	features: {
		cards: [
			{
				icon: '🧩',
				title: '프로토콜이 아닌 메모리 도구 키트',
				body: '에이전트가 기억하고, 회상하고, 추론하는 데 필요한 모든 것 — 용도별로 그룹화, 직접 컨텍스트 읽기를 위한 리소스와 인터랙티브 그래프 뷰어 포함.',
				toolGroups: [
					{ label: '핵심 메모리', tools: ['memory_remember', 'memory_recall', 'memory_forget', 'memory_stats', 'memory_diff', 'memory_suggest', 'memory_summary', 'memory_archive', 'memory_checkpoint', 'memory_visualize', 'memory_pin', 'memory_unpin', 'memory_tag', 'memory_reflect', 'memory_promote'] },
					{ label: '검색 및 인텔리전스', tools: ['memory_smart_recall', 'memory_captured', 'memory_consolidate', 'memory_graph_path', 'memory_search'] },
					{ label: '컨텍스트 브리핑', tools: ['context_brief', 'context_generate', 'context_diff', 'context_focus', 'context_health', 'context_export'] },
					{ label: '압축', tools: ['memory_compress', 'memory_primer'] },
					{ label: '세션', tools: ['memory_sessions', 'memory_merge_sessions'] },
					{ label: '동기화 및 보안', tools: ['memory_export_gist', 'memory_import_gist', 'memory_encrypt', 'memory_decrypt', 'memory_backup'] },
				],
				wide: true,
			},
			{ icon: '⭐', title: '멀티 에이전트', body: '모든 주요 AI 코딩 에이전트와 호환. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue — 제로 구성.', tags: ['OpenCode', 'Claude', 'Cursor'] },
			{ icon: '📄', title: 'TOON 형식', body: 'JSON보다 22% 적은 토큰 (실측). LLM 이해와 토큰 효율성을 위해 설계된 맞춤 인코딩.', stats: ['토큰 22% 절감', '파싱 속도 1.3x 향상'] },
			{ icon: '🔎', title: '스마트 리콜', body: '그래프 기반 리콜이 BM25 관련성과 그래프 중심성으로 재순위화됨 (쿼리 단어 없이도 허브가 부상). 홉당 감쇠로 먼 컨텍스트를 낮게 유지. 토큰 효율적인 `compact` 모드는 숫자 인덱스, 스니펫 잘린 결과를 반환.', stats: ['BM25', '중심성', 'compact'] },
			{ icon: '🧠', title: '스마트 메모리', body: '내장 어휘와 프로젝트 의존성에서 자동 태그 추론, 품질 점수, 신뢰도 점수, 병합 중복 제거, 관련 항목 제안, 메모리 diff, 및 구성 가능한 임시 컨텍스트 TTL.', stats: ['자동 태그', '품질 점수', '병합 중복 제거'] },
			{ icon: '🔒', title: '암호화', body: 'AES-256-GCM로 민감한 데이터 보호. 오래된 항목 자동 아카이브. Watch 모드로 N분마다 자동 백업.', stats: ['AES-256-GCM', '자동 백업'] },
		],
	},
	agents: { title: '15개 이상의 AI 코딩 에이전트 지원', subtitle: '제로 구성 — toon-memory가 각 에이전트를 자동 감지하고 구성' },
	stats: { items: [				{ number: '97.6%', label: '상위 5개에서 리콜 (R@5 0.861)' }, { number: '15', label: '에이전트' }, { number: '80%', label: '세션당 도구 호출 절감' }, { number: '0', label: '필요한 구성' }] },
	howItWorks: {
		title: '어떻게 작동하나요?', subtitle: '기억 상실에서 메모리까지 4단계',
		steps: [
			{ n: 1, title: '설치', body: '하나의 명령어. 15개 이상의 에이전트에 제로 구성.', code: 'npm install -g toon-memory' },
			{ n: 2, title: '기억', body: '작업하면서 결정, 패턴, 버그를 저장 — 자동 태그 추론과 선택적 TTL 포함.', code: 'memory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})' },
			{ n: 3, title: '리콜', body: '에이전트가 필요할 때 메모리를 쿼리 — 재설명 불필요, 토큰 낭비 없음.', code: 'memory_recall({ query: "validation" })\n// [decision] use-zod (a1b2c3d4)\n//   Use Zod for validation — src/types.ts' },
			{ n: 4, title: '컨텍스트', body: '한 번의 호출로 에이전트에 모든 것을 제공: 프로젝트, git, 메모리, 세션. 도구 호출 80% 절감.', code: 'context_generate({})\n// # Project Briefing (full)\n// ## Project — toon-memory v4.3.0\n// ## Git — branch: main, 3 commits\n// ## Memory — 26 entries, 18 edges\n// ## Sessions — 2 active' },
		],
	},
	tips: {
		title: '메모리 팁', subtitle: '이 패턴으로 toon-memory를 최대한 활용',
		items: [
			{ n: 1, title: '즉시 결정 저장', body: '선택을 하면 즉시 저장합니다. 왜 옵션 A를 B보다 선택했는지에 대한 <em>이유</em> 컨텍스트를 추가 — 미래의 자신이 감사할 것입니다.' },
			{ n: 2, title: '일관된 키 사용', body: '도메인별 키 접두사: <code class="inline-code">db:redis-config</code>, <code class="inline-code">auth:jwt</code>. 리콜 속도를 높이고 충돌을 방지.' },
			{ n: 3, title: '태그 자동 추론', body: '태그를 비워두면 시스템이 내용에서 추론 — redis, auth, api, db 등 16개 이상의 카테고리. 수동으로 추가하여 정밀 제어도 가능.' },
			{ n: 4, title: '임시 컨텍스트에 TTL 사용', body: '마감일, 스프린트, 시간 제한 메모 — <code class="inline-code">ttl: "7d"</code>를 설정하면 자동 만료. 수동 정리 불필요.' },
		],
	},
	comparison: {
		title: '같은 프로젝트. 두 세션.', subtitle: '에이전트가 기억하는 것이 결과를 바꿉니다.', beforeTitle: 'toon-memory 없이', afterTitle: 'toon-memory 사용', thinkingBefore: '생각 중…', thinkingAfter: '기억 중…',
		before: [
			{ session: '세션 1' }, { user: 'Sequelize를 사용하세요.' }, { assistant: '알겠습니다.' }, { note: '세션 컨텍스트에 보관 — 토큰이 축적됩니다.', tone: 'warn' },
			{ session: '세션 2' }, { user: '우리 ORM은 무엇인가요?' }, { note: '세션 간 메모리가 없습니다.', tone: 'error' }, { assistant: '모르겠습니다.' },
		],
			after: [
				{ session: '세션 1' }, { user: 'Sequelize를 사용하세요.' }, { cmd: '$ memory_remember({ category: "decision", key: "orm:sequelize", content: "ORM으로 Sequelize를 사용" })' }, { assistant: '알겠습니다.' }, { note: '메모리에 저장되었습니다.' },
			{ session: '세션 2' }, { user: '우리 ORM은 무엇인가요?' }, { note: '메모리에서 기억해냈습니다.' }, { assistant: 'Sequelize를 사용 중입니다.' },
		],
	},
	codeExamples: {
		quickExample: '빠른 예제', quickInstall: '빠른 설치',
		exampleCode: '// 결정 저장 (자동 태그 추론)\nmemory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})\n// 🏷️ Tags inferred: types\n\n// TTL 포함 저장 (7일 후 만료)\nmemory_remember({\n  category: "knowledge",\n  key: "sprint-deadline",\n  content: "Sprint ends July 18",\n  ttl: "7d"\n})\n\n// 마지막 세션 이후 변경 사항 확인\nmemory_diff({ since: "24h" })\n\n// 메모리 검색\nmemory_recall({ query: "redis" })\n// [bug] redis-pool-fix (i9j0k1l2)\n//   Added max_connections=20',
		installCode: '# npm\nnpm install -g toon-memory\n\n# macOS / Linux\ncurl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh\n\n# Windows (PowerShell)\nirm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex',
	},
	benchmarks: {
		title: '벤치마크',
		subtitle: '추측이 아닌 실측',
		tabs: { ranking: '순위 품질', workflow: '워크플로 절감', format: 'TOON 형식' },
		retrieval: {
			subtitle: '187개 실제 항목 스냅샷에서 LongMemEval 스타일 검색 — gold queries 42개',
			what: '통합 리콜 파이프라인이 올바른 항목을 상위 5개 안에서 찾는다',
			metricLabel: '지표',
			linear: '선형',
			rrf: 'RRF',
			smart: '통합',
			metricRows: [
				{ metric: 'R@5', gloss: 'gold 항목이 상위 5개 안', linear: '0.643', rrf: '0.861', smart: '0.829' },
				{ metric: 'nDCG@5', gloss: '순서 품질', linear: '0.654', rrf: '0.764', smart: '0.739' },
				{ metric: 'MRR@5', gloss: '정답의 위치', linear: '0.776', rrf: '0.788', smart: '0.760' },
			],
			result: '97.6%의 쿼리가 상위 5개에서 답변 가능',
			note: '실제 <code>data.toon</code> 스냅샷(187개, 2026-08-01), <code>today</code> 결정적, 읽기 전용·복사본 없음; priority 메타 항목 2개 제외. 재현: <code>npm run bench:retrieval</code>.',
		},
		workflow: {
			subtitle: '실제 세션에서 측정한 토큰 및 도구 호출 절감',
			stats: [
				{ num: '~90%', cap: '토큰 절감 (자동 로딩)' },
				{ num: '80%', cap: '도구 호출 절감 (25 → 5)' },
				{ num: '68%', cap: '토큰 절감 (컴팩트 리콜)' },
				{ num: '58%', cap: '토큰 절감 (시스템 프라이머)' },
				{ num: '14%', cap: '토큰 절감 (배치 압축)' },
			],
			note: '자동 로딩: OpenCode 플러그인은 모든 항목을 덤프하는 대신 파일 관련 메모리만 주입합니다. 전체 세션: 시작 → 디버그 → 구현 → 검토 → 마무리. 재현 가능: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
		},
		format: {
			subtitle: 'TOON 형식은 인간을 위해 만들어진 것이 아니라 LLM을 위해 만들어짐',
			stats: [{ num: '22.5%', cap: 'JSON보다 토큰 절감' }, { num: '30.5%', cap: '단일 항목' }, { num: '1.3x', cap: '파싱 속도 향상' }],
			note: '<code>gpt-tokenizer</code> (cl100k_base)로 16개의 대표적인 메모리 항목을 측정. 실제 TOON 형식과 컴팩트 JSON 비교. 재현 가능: <code>npm run bench</code>.',
		},
	},
	tools: {
		title: '완전한 메모리 도구 키트', subtitle: '에이전트의 기억, 리콜, 추론에 필요한 모든 것', resourcesLabel: '리소스:',
		groups: {
			core: '핵심 메모리',
			search: '검색 및 인텔리전스',
			context: '컨텍스트 브리핑',
			compress: '압축',
			sessions: '세션',
			sync: '동기화 및 보안',
		},
		cards: [
			{ name: 'memory_remember', title: '메모리에 저장', desc: '결정, 패턴, 버그, 지식 또는 warning("하지 마세요" 부정적 메모리, 부스트와 함께 리콜) 저장 — 자동 품질 점수와 함께 세션 간 지속.', group: 'core' },
			{ name: 'memory_recall', title: '메모리 검색', desc: '파일을 읽기 전에 지식 그래프를 쿼리. 품질 가중 결과. path_scope와 예산 제어(tiny/normal/deep) 지원. explain: true는 항목별 이유 줄 추가, budget_tokens는 예상 토큰으로 출력 제한.', group: 'core' },
			{ name: 'memory_forget', title: '메모리에서 삭제', desc: '키 또는 id로 항목 삭제.', group: 'core' },
			{ name: 'memory_stats', title: '메모리 통계', desc: '품질 분포와 가장 많이 접근한 항목, 그리고 적중률/중복/폐기 지표를 포함한 프로젝트 메모리 통계 표시.', group: 'core' },
			{ name: 'memory_diff', title: '메모리 차이', desc: '마지막 세션 이후 변경 사항 확인.', group: 'core' },
			{ name: 'memory_suggest', title: '관련 항목 제안', desc: '지정된 컨텍스트의 관련 항목을 표시.', group: 'core' },
			{ name: 'memory_summary', title: '파일 요약', desc: '토큰 절약을 위한 파일 요약 저장 또는 검색.', group: 'core' },
			{ name: 'memory_archive', title: '오래된 항목 아카이브', desc: '메모리를 깨끗하게 유지하기 위해 30일 이상 된 항목 이동.', group: 'core' },
			{ name: 'memory_smart_recall', title: '스마트 리콜', desc: 'BM25 + 그래프 중심성 + 품질 점수 + 신선도를 하나의 호출로 통합 검색. explain: true(항목별 이유)와 budget_tokens(출력 상한) 지원.', group: 'search' },
			{ name: 'memory_captured', title: '캡처된 활동', desc: '훅에 의해 자동 캡처된 활동 로그 표시 — 관찰을 메모리로 승격.', group: 'search' },
			{ name: 'memory_consolidate', title: '통합', desc: 'mode 매개변수로 동일한 중복 항목을 제거하고 근사 중복(Jaccard >50%)을 병합하며 저품질 항목을 일괄 제거하고 오래된 라이브러리 버전 항목을 은퇴시킵니다(mode: "versions") — 결정적, LLM 불필요.', group: 'search' },
			{ name: 'context_brief', title: '컨텍스트 브리핑', desc: '한 번의 호출 컨텍스트 브리핑: 메모리 + 세션 + 헬스를 컴팩트 markdown으로. 제로 LLM.', group: 'context' },
			{ name: 'context_generate', title: '전체 프로젝트 브리핑', desc: '한 번의 호출 브리핑: 프로젝트 구조 + git 상태 + 메모리 + 세션. 6회 수동 호출 대체. 토큰 93% 절약.', group: 'context' },
			{ name: 'context_diff', title: '점증 브리핑', desc: 'git 커밋 + 수정된 파일 + 마지막 세션 이후 신규/업데이트 메모리. 토큰 72% 절약.', group: 'context' },
			{ name: 'context_focus', title: '타겟 브리핑', desc: '특정 쿼리에 대한 관련 메모리 + 관련 파일 + 호출자 + 테스트 파일.', group: 'context' },
			{ name: 'context_health', title: '헬스 감사', desc: '고아 링크, 중복, 깨진 파일 참조, 만료된 TTL, 오래된 세션. 점수 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Markdown으로 내보내기', desc: '시스템 프롬프트용 주입 가능한 markdown으로 메모리 내보내기. 토큰 82% 절약.', group: 'context' },
			{ name: 'memory_compress', title: 'LLM 압축', desc: 'LLM 기반 2단계 압축: 요약 + 덮어쓰기. 사용 가능한 경우 Anthropic/OpenAI CLI 사용.', group: 'compress' },
			{ name: 'memory_primer', title: '컨텍스트 프라이머', desc: '한 번의 호출 컨텍스트 프라이머: 상위 메모리 + 카테고리 + 세션 파일 변경 사항. 세션 시작 시 자동 주입.', group: 'compress' },
			{ name: 'memory_sessions', title: '세션', desc: '활성 에이전트 세션을 표시하고 소프트 충돌을 감지.', group: 'sessions' },
			{ name: 'memory_merge_sessions', title: '세션 병합', desc: '파일에 걸친 병렬 세션의 관찰을 병합. 중복 제거 및 자동 승격.', group: 'sessions' },
			{ name: 'memory_export_gist', title: 'Gist로 내보내기', desc: '메모리 항목을 GitHub Gist(공개 또는 비공개)로 내보내기. GITHUB_TOKEN 또는 gh CLI 사용.', group: 'sync' },
			{ name: 'memory_import_gist', title: 'Gist에서 가져오기', desc: 'GitHub Gist에서 항목 가져오기. 기존 항목과 병합 (태그 합집합, 최대 신뢰도).', group: 'sync' },
			{ name: 'memory_encrypt', title: '암호화 활성화', desc: '자동 생성 키로 AES-256-GCM 암호화.', group: 'sync' },
			{ name: 'memory_decrypt', title: '암호화 비활성화', desc: '복호화하고 암호화를 비활성화.', group: 'sync' },
			{ name: 'memory_backup', title: '메모리 백업', desc: '타임스탬프가 있는 메모리 파일 백업 생성. 최신 10개로 자동 정리.', group: 'sync' },
			{ name: 'memory_pin', title: '항목 고정', desc: '중요한 항목을 고정하여 키워드 일치가 없어도 항상 리콜 결과의 상단에 표시.', group: 'core' },
			{ name: 'memory_unpin', title: '고정 해제', desc: '항목의 고정 플래그를 제거.', group: 'core' },
			{ name: 'memory_search', title: '통합 검색', desc: '카테고리, 태그, 날짜 범위 필터로 메모리 검색. 태그 필터는 AND 로직 사용 — 지정된 모든 태그가 일치해야 함.', group: 'search' },
			{ name: 'memory_tag', title: '일괄 태그 작업', desc: '한 번의 호출로 key 또는 id로 하나 이상의 항목에 태그 추가, 제거 또는 설정.', group: 'core' },
			{ name: 'memory_reflect', title: '메모리 점검', desc: '지연도, 품질, 과도한 연결을 기준으로 항목을 결정적으로 순위화하여 주의나 정리가 필요한 부분을 드러냅니다. 제로 LLM.', group: 'core' },
			{ name: 'memory_promote', title: '자동 승격', desc: '낮은 신뢰도의 초안을 결정적으로 활성 항목으로 승격(임계값 0.65, Jaccard 중복 제거 > 0.5). 기본값은 dryRun.', group: 'core' },
		],
	},
	graphSection: {
		title: '메모리를 그래프로', subtitle: '결정을 사양, 버그, 아키텍처에 연결. 리콜은 올바른 컨텍스트를 반환 — 단순한 키워드 일치가 아님.',
		points: ['`links` 또는 `[[key]]` 참조로 항목 연결 — 임베딩 불필요, LLM 불필요', '`memory_recall({ mode: "graph" })`가 관계 인식 서브그래프를 확장'],
		launchLabel: '대화형 뷰어 열기',
	},
	viewerSection: {
		title: '메모리 그래프 뷰어',
		subtitle: '메모리를 대화형 힘-방향 그래프로 시각화. 항목, 연결, 카테고리, 접근 패턴을 한눈에.',
		capsLabel: '뷰어 내부:',
		caps: ['검색', '경로 찾기', 'PNG / SVG 내보내기', '다크 & 라이트 테마'],
		features: [
			'<strong>CLI 뷰어:</strong> <code>npx toon-memory viewer</code>가 HTTP 서버를 시작합니다',
			'<strong>인라인 MCP Apps 뷰어:</strong> <code>memory_visualize()</code>를 호출하면 MCP Apps 호환 호스트에서 그래프를 직접 렌더링 — 서버 불필요',
			'노드에 호버하면 콘텐츠 미리보기와 품질 점수가 있는 툴팁 표시',
			'클릭으로 선택·중앙 정렬, 더블 클릭으로 세부정보 열기',
			'검색은 항목을 필터링하고 일치 노드를 맥동하는 글로우로 강조',
			'경로 찾기는 두 항목 사이의 최단 연결을 찾아 강조',
			'물리 조정, 다크/라이트 테마, PNG/SVG 내보내기',
		],
	},
	smartRecallSection: {
		title: '스마트하고 토큰 효율적인 리콜',
		subtitle: '리콜이 BM25 관련성과 그래프 중심성으로 오프라인에서 재순위화된 후, 토큰이 중요할 때 컴팩트 형태로 축소. 품질 점수와 신선도가 최고의 항목을 밀어올림.',
		points: ['id + 카테고리 + 키 + 내용 + 태그에 대한 BM25 스코어링', '그래프 중심성이 쿼리 단어 없이도 허브 항목을 부상', '품질 점수 (0-1)와 신선도 감쇠가 최고의 최신 항목을 밀어올림', '`compact: true` → 숫자 인덱스, id/날짜/파일 생략, 스니펫 잘린 이웃'],
		standardCode: 'memory_recall({ query: "riesgo", mode: "graph" })\n[decision] risk-engine-priority (a1b2c3d4)\n  The engine prioritizes risk over speed.\n  File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01\n  links: engine-arch',
		compactCode: 'memory_recall({ query: "riesgo", mode: "graph", compact: true })\n[1] decision/risk-engine-priority\n  The engine prioritizes risk over speed.\n  tags: risk;spec · edges: ->2, ->3',
		caption: 'compact 모드는 동일한 컨텍스트를 더 적은 토큰으로 유지 — .toon 파일은 변경되지 않음.',
	},
	faq: {
		title: '자주 묻는 질문', subtitle: '에이전트에 메모리를 부여하기 위해 알아야 할 모든 것',
		items: [
			{ q: 'toon-memory란?', a: '35개 MCP 도구를 갖춘 AI 코딩 에이전트용 지속적 메모리 레이어. 결정, 패턴, 버그, 컨텍스트를 컴팩트 TOON 형식으로 저장하여 에이전트가 세션 간에 모든 것을 기억 — 세션당 80% 도구 호출 절감.' },
			{ q: '지원되는 에이전트는?', a: 'OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex, Gemini, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro — MCP 서버를 통한 제로 구성의 15개 이상 에이전트.' },
			{ q: '데이터는 어떻게 저장되나요?', a: '항목은 로컬 TOON 파일 (JSON보다 ~22% 작은 토큰 효율 형식, 실측)에 기록됩니다. 파일은 귀하의 것이며 다른 소스 파일처럼 커밋, diff, 백업이 가능합니다.' },
			{ q: '메모리가 암호화되나요?', a: '네. memory_encrypt 도구로 암호화를 활성화하여 AES-256-GCM로 민감한 항목을 보호합니다. 키는 자동 생성되고 로컬에 유지됩니다.' },
			{ q: '오프라인에서 작동하나요?', a: '완전히. toon-memory는 외부 서비스나 계정 없이 로컬에서 실행됩니다. Watch 모드는 예약에 따라 자동 백업도 생성합니다.' },
			{ q: '여러 에이전트가 같은 메모리를 공유할 수 있나요?', a: '네. 메모리가 프로젝트의 일반 파일에 존재하기 때문에 해당 프로젝트에 설정된 모든 에이전트가 같은 컨텍스트를 읽고 씁니다.' },
			{ q: '메모리 백업은 어떻게 하나요?', a: 'Watch 모드로 예약된 자동 백업을 사용하거나 TOON 파일을 git에 커밋하기만 하면 됩니다. 오래된 항목은 30일 후 자동 아카이브됩니다.' },
			{ q: '무료이고 오픈 소스인가요?', a: '네. toon-memory는 MIT 라이선스로 무료 사용 가능합니다. 소스는 GitHub에 있고 패키지는 npm에 게시됩니다.' },
			{ q: '에이전트의 내장 메모리와 어떻게 다른가요?', a: '내장 메모리는 일반적으로 임시적이거나 벤더별입니다. toon-memory는 에이전트와 프로젝트 전반에서 완전히 제어할 수 있는 이식 가능하고 diff 가능한 암호화된 메모리 파일을 제공합니다.' },
			{ q: '임시 컨텍스트를 만료시킬 수 있나요?', a: '네. 모든 항목에 TTL (예: ttl: "7d")을 설정하면 자동 만료 — 스프린트, 마감일, 시간 제한 메모에 적합합니다.' },
			{ q: '스마트 리콜이란?', a: 'memory_smart_recall은 BM25 키워드 검색, 그래프 중심성, 품질 스코어링, 신선도 감쇠를 하나의 호출로 결합 — 수동 오케스트레이션 없이 모든 순위 전략의 최고를 실현.' },
			{ q: '품질 스코어링은 어떻게 작동하나요?', a: '모든 항목은 태그 커버리지, 링크 풍부함, 내용 상세도, 신선도, 구체성에 따라 자동 품질 점수 (0-1)를 받습니다. 고품질 항목이 리콜 결과에서 먼저 표시됩니다.' },
			{ q: '같은 키를 두 번 저장하면 어떻게 되나요?', a: '시스템이 속성을 대체하지 않고 병합합니다: 태그와 링크는 합집합, 품질과 신뢰도는 최댓값, 날짜가 업데이트됩니다. 항목이 시간이 지남에 따라 풍부해집니다.' },
			{ q: '메모리 압축이란 무엇인가요?', a: 'memory_compress는 LLM이 관련 항목을 간결한 요약으로 압축하도록 합니다. memory_consolidate(mode: "low-quality")은 저품질 항목(태그 없음, 짧은 콘텐츠)을 결정적으로 제거합니다 — LLM 불필요. 둘 다 토큰 수를 줄입니다.' },
			{ q: '머신 간에 메모리를 동기화할 수 있나요?', a: '네. memory_export_gist로 GitHub Gist에 항목을 푸시한 다음 다른 머신에서 memory_import_gist를 사용합니다. 항목은 자동으로 병합됩니다(태그 합집합, 최대 신뢰도).' },
		],
	},
	whatNew: {
		title: 'v4.3.0 새로운 기능',
		subtitle: '명시적 중요도 수준, 그리고 Explain WHY, 토큰 예산, 버전 대체, 더 똑똑한 순위',
		cards: [
			{
				icon: '🎯',
				title: '명시적 중요도',
				body: '`memory_remember({ importance })`는 `critical`, `high`, `medium`, `low`를 설정합니다 — 중요한 결정이 먼저 표시되고(+0.3), 낮은 메모는 방해하지 않습니다(−0.1). 비워 두면 자동(최신성 + 빈도).',
				stats: ['critical +0.3', 'high +0.15', 'low −0.1'],
			},
			{
				icon: '🤔',
				title: 'WHY 설명',
				body: '`memory_recall`/`memory_smart_recall`이 `explain: true`를 받아 모든 반환 항목에 결정론적 이유 줄(`↳ 100% 관련성 · 14회 사용 · 오늘 사용됨 · 중요도 HIGH`)을 추가 — 왜 가져왔는지, LLM 불필요.',
				stats: ['↳ 이유 줄', 'LLM 불필요'],
			},
			{
				icon: '🧮',
				title: '토큰 예산',
				body: '`budget_tokens`가 예상 토큰 수로 리콜 출력을 제한. 항목이 탐욕적으로 누적되고 예산을 초과할 꼬리는 버려짐(`0` = 제한 없음).',
				stats: ['0 = 제한 없음', '꼬리 버림'],
			},
			{
				icon: '🔄',
				title: '버전 대체',
				body: '`memory_consolidate(mode: "versions")`가 다른 라이브러리 버전에서 같은 주제를 설명하는 항목(예: "React 18 사용" vs "React 19 사용")을 감지하고 이전 항목을 최신 항목 대신 은퇴시킴.',
				stats: ['"versions" 모드', 'dryRun'],
			},
			{
				icon: '🚫',
				title: '부정적 메모리',
				body: '"하지 마세요" 사실을 위한 `warning` 카테고리 — 안티패턴과 지뢰. `warning` 항목은 리콜 부스트를 받아 에이전트가 실수를 반복하기 전에 확인할 수 있음.',
				stats: ['warning 부스트', '안티패턴'],
			},
			{
				icon: '📊',
				title: '확장 통계',
				body: '`memory_stats`는 이제 적중률(최소 1회 리콜된 항목 %), 중복(완전 동일 콘텐츠 %), 폐기(obsolete 항목 %)를 보고합니다.',
				stats: ['적중률', '중복', '폐기'],
			},
			{
				icon: '🎯',
				title: '더 똑똑한 순위',
				body: '리콜이 같은 문자 체계(latin/CJK/cyrillic/…)로 작성된 항목에 +0.1 언어 패밀리 부스트, `path_scope`가 현재 파일과 일치할 때 +0.05 폴더 매치 부스트를 추가.',
				stats: ['언어 +0.1', '폴더 +0.05'],
			},
		],
	},
	cta: { title: '에이전트에 연속성을 부여할 준비가 되셨나요?', subtitle: '몇 초 만에 설치하고 프로젝트를 다시 설명할 일이 없습니다.', getStarted: '시작하기', viewGithub: 'GitHub에서 보기' },
	footer: { text: 'MIT 라이선스 — ', odalx: 'ODALX의 오픈소스 프로젝트', odalxTag: 'AI 네이티브 시대의 인프라를 구축합니다.' },
},
	'pt-br': {
	nav: {
		docs: 'Documentação',
		features: 'Recursos',
		viewer: 'Visualizador',
		benchmarks: 'Métricas',
		faq: 'FAQ',
		npm: 'npm',
		github: 'GitHub',
	},
	hero: {
		tagline: 'A camada de continuidade para agentes de IA',
		subtitle:
			'Agentes de IA não deveriam ter que reaprender seu projeto a cada sessão. O toon-memory preserva o conhecimento, as decisões e as convenções do seu projeto entre sessões — localmente e de forma privada, via MCP.',
		poweredBy: 'Desenvolvido com TOON',
		getStarted: 'Começar',
		viewGithub: 'Ver no GitHub',
		copy: 'Copiar',
		copied: 'Copiado!',
		installCmd: 'npm install -g toon-memory',
	},
	problem: {
		title: 'Por que os agentes perdem contexto entre sessões?',
		subtitle: 'Agentes de IA começam cada sessão com amnésia',
		cards: [
			{
				icon: '🌀',
				title: 'Contexto reseta diariamente',
				body: 'A cada nova sessão, seu agente esquece as decisões, padrões e bugs que aprendeu ontem. Você reexplica o mesmo contexto repetidamente.',
			},
			{
				icon: '🔍',
				title: 'Caçando no histórico',
				body: 'Sem memória, os agentes fazem grep no histórico do git e relêem arquivos para reconstruir por que algo foi feito de certa forma — gastando tokens e tempo.',
			},
			{
				icon: '📋',
				title: 'Notas de copiar e colar',
				body: 'Desenvolvedores colam contexto manualmente entre chats. É frágil, fica obsoleto e nunca chega à próxima execução autônoma.',
			},
		],
		resolution:
			'toon-memory dá ao seu agente uma memória persistente e consultável — para que o contexto sobreviva a cada sessão, automaticamente.',
	},

	continuity: {
		kicker: 'Conheça o toon-memory',
		title: 'A camada de continuidade para seu fluxo de trabalho',
		subtitle:
			'Enquanto uma memória armazena fatos, uma camada de continuidade preserva como seu projeto funciona — para que cada sessão comece onde a anterior terminou.',
		items: [
			{ icon: '🧭', title: 'Decisões', body: 'O "porquê" por trás de cada escolha — frameworks, bibliotecas, trade-offs. Lembrado quando importa, nunca re-litigado.' },
			{ icon: '📏', title: 'Convenções', body: 'Regras de nomenclatura, estrutura e estilo que seu time acordou. Seguidas sem precisar ser ditas de novo.' },
			{ icon: '🧠', title: 'Contexto', body: 'Conhecimento de arquitetura, ambiente e operação que não vive em nenhum arquivo isolado.' },
			{ icon: '🤝', title: 'Entendimento compartilhado', body: 'Conhecimento do projeto e decisões do time disponíveis para cada agente e cada sessão.' },
		],
		closing:
			'toon-memory introduz o conceito de camada de continuidade: um sistema leve que preserva conhecimento, decisões e contexto do projeto entre sessões de IA — sem serviços em nuvem nem infraestrutura pesada.',
	},

	benefits: {
		kicker: 'Por que os desenvolvedores escolhem o toon-memory',
		title: 'Construído em torno dos problemas reais',
		subtitle: 'Não é uma lista de ferramentas — é um conjunto de resultados.',
		groups: [
			{ icon: '🧭', title: 'Conhecimento persistente do projeto', items: ['Lembra decisões e as razões por trás delas', 'Lembra arquitetura e convenções', 'Acumula entre sessões — nunca reexplicado'] },
			{ icon: '🔒', title: 'Privacidade em primeiro lugar', items: ['100% local — sem nuvem, sem servidor, sem telemetria', 'Criptografia opcional AES-256-GCM', 'Você é dono do arquivo de memória, como qualquer fonte'] },
			{ icon: '⚡', title: 'Leve', items: ['Formato TOON nativo — 22% menos tokens que JSON', 'Zero dependências, roda em qualquer Node.js 18+', 'Lógica determinística — sem chamadas LLM, sem chaves de API'] },
			{ icon: '🛰️', title: 'Universal', items: ['Funciona com 15+ agentes: Claude Code, Codex, Gemini CLI, Cursor, OpenCode e mais', 'MCP padrão — troque de agente sem perder contexto', 'Memória por projeto compartilhada por todo o time'] },
		],
	},

	features: {
		cards: [
			{
			icon: '🧩',
			title: 'Um kit de memória, não um protocolo',
			body: 'Tudo o que seu agente precisa para lembrar, recuperar e raciocinar — agrupado por propósito, com recursos para leitura direta de contexto e um visualizador de grafo interativo.',
				toolGroups: [
					{ label: 'Memória Principal', tools: ['memory_remember', 'memory_recall', 'memory_forget', 'memory_stats', 'memory_diff', 'memory_suggest', 'memory_summary', 'memory_archive', 'memory_checkpoint', 'memory_visualize', 'memory_pin', 'memory_unpin', 'memory_tag', 'memory_reflect', 'memory_promote'] },
					{ label: 'Busca & Inteligência', tools: ['memory_smart_recall', 'memory_captured', 'memory_consolidate', 'memory_graph_path', 'memory_search'] },
					{ label: 'Briefing de Contexto', tools: ['context_brief', 'context_generate', 'context_diff', 'context_focus', 'context_health', 'context_export'] },
					{ label: 'Compressão', tools: ['memory_compress', 'memory_primer'] },
					{ label: 'Sessões', tools: ['memory_sessions', 'memory_merge_sessions'] },
					{ label: 'Sincronização & Segurança', tools: ['memory_export_gist', 'memory_import_gist', 'memory_encrypt', 'memory_decrypt', 'memory_backup'] },
				],
				wide: true,
			},
			{
				icon: '⭐',
				title: 'Multi-agente',
				body: 'Funciona com todos os principais agentes de IA. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue — zero configuração.',
				tags: ['OpenCode', 'Claude', 'Cursor'],
			},
			{
				icon: '📄',
				title: 'Formato TOON',
				body: '22% menos tokens que JSON (medido). Codificação personalizada projetada para compreensão de LLMs e eficiência de tokens.',
				stats: ['22% menos tokens', '1.3x mais rápido para parsear'],
			},
			{
				icon: '🔎',
				title: 'Recall inteligente',
				body: 'Recall baseado em grafo reordenado por relevância BM25 e centralidade do grafo (hubs aparecem mesmo sem a palavra de busca). Decaimento por hop mantém contexto distante baixo. Modo `compact` retorna resultados com índices numéricos e trechos.',
				stats: ['BM25', 'Centralidade', 'compact'],
			},
			{
				icon: '🧠',
				title: 'Memória inteligente',
				body: 'Inferência automática de tags a partir de vocabulário integrado e dependências do projeto, pontuação de qualidade, escores de confiança, merge-dedup, sugestões de entradas relacionadas, diff de memória e TTL configurável para contexto temporário.',
				stats: ['Auto-tags', 'Qualidade', 'Merge-dedup'],
			},
			{
				icon: '🔒',
				title: 'Criptografia',
				body: 'AES-256-GCM para dados sensíveis. Auto-arquivamento de entradas antigas. Modo watch para backup automático a cada N minutos.',
				stats: ['AES-256-GCM', 'Auto-backup'],
			},
		],
	},
	agents: {
		title: 'Funciona com 15+ agentes de IA',
		subtitle: 'Zero configuração — toon-memory detecta e configura cada um automaticamente',
	},
	stats: {
		items: [
			{ number: '97.6%', label: 'Recall no top-5 (R@5 0.861)' },
			{ number: '15', label: 'Agentes' },
			{ number: '80%', label: 'Menos chamadas de ferramenta/sessão' },
			{ number: '0', label: 'Configuração necessária' },
		],
	},
	howItWorks: {
		title: 'Como funciona?',
		subtitle: 'Quatro passos da amnésia à memória',
		steps: [
			{ n: 1, title: 'Instalar', body: 'Um comando. Zero configuração para 15+ agentes.', code: 'npm install -g toon-memory' },
			{
				n: 2,
				title: 'Lembrar',
				body: 'Salve decisões, padrões e bugs enquanto trabalha — com inferência automática de tags e TTL opcional.',
				code: `memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  file: "src/types.ts"
})`,
			},
			{
				n: 3,
				title: 'Recall',
				body: 'Seu agente consulta a memória sob demanda — sem reexplicar, sem desperdiçar tokens.',
				code: `memory_recall({ query: "validation" })
// [decision] use-zod (a1b2c3d4)
//   Use Zod for validation — src/types.ts`,
			},
			{
				n: 4,
				title: 'Contexto',
				body: 'Uma chamada dá ao seu agente tudo: projeto, git, memória, sessões. 80% menos chamadas de ferramenta.',
				code: `context_generate({})
// # Project Briefing (full)
// ## Project — toon-memory v4.3.0
// ## Git — branch: main, 3 commits
// ## Memory — 26 entries, 18 edges
// ## Sessions — 2 active`,
			},
		],
	},
	tips: {
		title: 'Dicas de memória',
		subtitle: 'Aproveite ao máximo o toon-memory com estes padrões',
		items: [
			{
				n: 1,
				title: 'Salve decisões imediatamente',
				body: 'Quando fizer uma escolha, salve imediatamente. Adicione contexto sobre <em>por que</em> escolheu a opção A sobre B — seu eu futuro vai agradecer.',
			},
			{
				n: 2,
				title: 'Use chaves consistentes',
				body: 'Prefixe chaves por domínio: <code class="inline-code">db:redis-config</code>, <code class="inline-code">auth:jwt</code>. Torna o recall mais rápido e evita colisões.',
			},
			{
				n: 3,
				title: 'Tags são inferidas automaticamente',
				body: 'Deixe as tags vazias e o sistema infere a partir do conteúdo — redis, auth, api, db e 16+ categorias. Ou adicione manualmente para controle preciso.',
			},
			{
				n: 4,
				title: 'Use TTL para contexto temporário',
				body: 'Prazos, sprints, notas sensíveis ao tempo — defina um <code class="inline-code">ttl: "7d"</code> e expiram automaticamente. Sem limpeza manual necessária.',
			},
		],
	},
	comparison: {
		title: 'Mesmo projeto. Duas sessões.',
		subtitle: 'O que seu agente lembra muda o resultado.',
		beforeTitle: 'Sem toon-memory',
		afterTitle: 'Com toon-memory',
		thinkingBefore: 'Pensando…',
		thinkingAfter: 'Lembrando…',
		before: [
			{ session: 'Sessão 1' },
			{ user: 'Use Sequelize.' },
			{ assistant: 'OK.' },
			{ note: 'Mantido no contexto da sessão — acumula tokens.', tone: 'warn' },
			{ session: 'Sessão 2' },
			{ user: 'Qual é o nosso ORM?' },
			{ note: 'Sem memória entre sessões.', tone: 'error' },
			{ assistant: 'Não sei.' },
		],
			after: [
				{ session: 'Sessão 1' },
				{ user: 'Use Sequelize.' },
				{ cmd: '$ memory_remember({ category: "decision", key: "orm:sequelize", content: "Usar Sequelize como ORM" })' },
				{ assistant: 'OK.' },
				{ note: 'Salvo na memória.' },
			{ session: 'Sessão 2' },
			{ user: 'Qual é o nosso ORM?' },
			{ note: 'Recuperado da memória.' },
			{ assistant: 'Você está usando Sequelize.' },
		],
	},
	codeExamples: {
		quickExample: 'Exemplo rápido',
		quickInstall: 'Instalação rápida',
		exampleCode: `// Salvar uma decisão (com inferência automática de tags)
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  file: "src/types.ts"
})
// 🏷️ Tags inferidas: types

// Salvar com TTL (expira em 7 dias)
memory_remember({
  category: "knowledge",
  key: "sprint-deadline",
  content: "Sprint ends July 18",
  ttl: "7d"
})

// Ver o que mudou desde a última sessão
memory_diff({ since: "24h" })

// Buscar na memória
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20`,
		installCode: `# npm
npm install -g toon-memory

# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex`,
	},
	benchmarks: {
		title: 'Benchmarks',
		subtitle: 'Medido, não assumido',
		tabs: { ranking: 'Qualidade do ranking', workflow: 'Economia no fluxo', format: 'Formato TOON' },
		retrieval: {
			subtitle: 'Busca estilo LongMemEval sobre snapshot real congelado de 187 entradas — 42 gold queries',
			what: 'O pipeline de recall unificado encontra a entrada correta no top 5',
			metricLabel: 'Métrica',
			linear: 'Linear',
			rrf: 'RRF',
			smart: 'Unificado',
			metricRows: [
				{ metric: 'R@5', gloss: 'entrada gold no top 5', linear: '0.643', rrf: '0.861', smart: '0.829' },
				{ metric: 'nDCG@5', gloss: 'qualidade do ordenamento', linear: '0.654', rrf: '0.764', smart: '0.739' },
				{ metric: 'MRR@5', gloss: 'posição do acerto', linear: '0.776', rrf: '0.788', smart: '0.760' },
			],
			result: '97,6% das queries respondidas a partir do top-5',
			note: 'Snapshot real do <code>data.toon</code> (187 entradas, 2026-08-01), <code>today</code> determinístico, somente leitura e sem cópias; excluídas 2 meta-entradas priority. Reproduzível: <code>npm run bench:retrieval</code>.',
		},
		workflow: {
			subtitle: 'Economia de tokens e chamadas medida em uma sessão real',
			stats: [
				{ num: '~90%', cap: 'menos tokens (auto-loading)' },
				{ num: '80%', cap: 'menos chamadas (25 → 5)' },
				{ num: '68%', cap: 'menos tokens (recall compacto)' },
				{ num: '58%', cap: 'menos tokens (system primer)' },
				{ num: '14%', cap: 'menos tokens (compressão em lote)' },
			],
			note: 'Auto-loading: o plugin do OpenCode injeta apenas memória relevante ao arquivo em vez de despejar todas as entradas. Sessão completa: início → depuração → implementação → revisão → encerramento. Reprodutível: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
		},
		format: {
			subtitle: 'O formato TOON é feito para LLMs, não para humanos',
			stats: [
				{ num: '22.5%', cap: 'menos tokens que JSON' },
				{ num: '30.5%', cap: 'em uma única entrada' },
				{ num: '1.3x', cap: 'mais rápido para parsear' },
			],
			note: 'Medido com <code>gpt-tokenizer</code> (cl100k_base) em 16 entradas de memória representativas, comparando o formato TOON real em disco contra JSON compacto. Reproduzível: <code>npm run bench</code>.',
		},
	},
	tools: {
		title: 'Um kit de memória completo',
		subtitle: 'Tudo que seu agente precisa para lembrar, recuperar e raciocinar',
		resourcesLabel: 'Recursos:',
		groups: {
			core: 'Memória Principal',
			search: 'Busca & Inteligência',
			context: 'Briefing de Contexto',
			compress: 'Compressão',
			sessions: 'Sessões',
			sync: 'Sincronização & Segurança',
		},
		cards: [
			{ name: 'memory_remember', title: 'Salvar na memória', desc: 'Armazena decisões, padrões, bugs, conhecimento ou warnings (memórias negativas "NÃO faça isso", recuperadas com impulso) — persistente entre sessões com pontuação de qualidade automática.', group: 'core' },
			{ name: 'memory_recall', title: 'Buscar memória', desc: 'Consulta o grafo de conhecimento antes de ler arquivos. Resultados ponderados por qualidade. Suporta path scoping (path_scope) e controle de orçamento (tiny/normal/deep). explain: true anexa uma linha de motivo por entrada; budget_tokens limita a saída por tokens estimados.', group: 'core' },
			{ name: 'memory_forget', title: 'Excluir da memória', desc: 'Exclui entradas por chave ou id.', group: 'core' },
			{ name: 'memory_stats', title: 'Estatísticas', desc: 'Mostra estatísticas da memória do projeto, incluindo distribuição de qualidade, entradas mais acessadas e métricas de hit-rate/duplicatas/obsoletas.', group: 'core' },
			{ name: 'memory_diff', title: 'Diff da memória', desc: 'Veja o que mudou desde sua última sessão.', group: 'core' },
			{ name: 'memory_suggest', title: 'Sugerir relacionados', desc: 'Mostra entradas relacionadas para um contexto dado.', group: 'core' },
			{ name: 'memory_summary', title: 'Resumo do arquivo', desc: 'Salva ou recupera um resumo de arquivo para economizar tokens.', group: 'core' },
			{ name: 'memory_archive', title: 'Arquivar antigos', desc: 'Move entradas com mais de 30 dias para manter a memória limpa.', group: 'core' },
			{ name: 'memory_smart_recall', title: 'Recall inteligente', desc: 'Busca unificada combinando BM25 + centralidade + qualidade + frescor em uma chamada. Suporta explain: true (motivos por entrada) e budget_tokens (limite de saída).', group: 'search' },
			{ name: 'memory_captured', title: 'Atividade capturada', desc: 'Exibe log de atividade capturado por hooks — promova observações para memória.', group: 'search' },
			{ name: 'memory_consolidate', title: 'Consolidar', desc: 'Mescla entradas duplicadas com conteúdo idêntico, detecta quase-duplicatas via similaridade Jaccard (>50%), remove entradas de baixa qualidade em lote ou aposenta entradas de versões antigas de bibliotecas (mode: "versions") — via parâmetro mode, sem LLM.', group: 'search' },
			{ name: 'context_brief', title: 'Briefing de contexto', desc: 'Briefing de contexto em uma chamada: memória + sessões + saúde em markdown compacto. Zero LLM.', group: 'context' },
			{ name: 'context_generate', title: 'Briefing completo', desc: 'Briefing em uma chamada: estrutura do projeto + estado git + memória + sessões. Substitui 6 chamadas manuais. Economiza 93% tokens.', group: 'context' },
			{ name: 'context_diff', title: 'Briefing incremental', desc: 'Commits git + arquivos modificados + memória nova/atualizada desde a última sessão. Economiza 72% tokens.', group: 'context' },
			{ name: 'context_focus', title: 'Briefing direcionado', desc: 'Memória relevante + arquivos relacionados + callers + arquivos de teste para uma query específica.', group: 'context' },
			{ name: 'context_health', title: 'Auditoria de saúde', desc: 'Links órfãos, duplicatas, referências quebradas, TTL expirados, sessões obsoletas. Nota 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Exportar como Markdown', desc: 'Exporta memória como markdown injetável para system prompts. Economiza 82% tokens.', group: 'context' },
			{ name: 'memory_sessions', title: 'Sessões', desc: 'Mostra sessões ativas do agente e detecta conflitos leves.', group: 'sessions' },
			{ name: 'memory_compress', title: 'Compressão LLM', desc: 'Compressão em duas etapas com LLM: resumir + sobrescrever. Usa Anthropic/OpenAI CLI se disponível.', group: 'compress' },
			{ name: 'memory_primer', title: 'Primer de contexto', desc: 'Primer de contexto em uma chamada: memórias principais + categorias + alterações de arquivos da sessão. Injetado automaticamente no início da sessão.', group: 'compress' },
			{ name: 'memory_merge_sessions', title: 'Mesclar sessões', desc: 'Mescla observações entre sessões paralelas para um arquivo. Deduplica e promove automaticamente.', group: 'sessions' },
			{ name: 'memory_export_gist', title: 'Exportar para Gist', desc: 'Exporta entradas de memória para um GitHub Gist (público ou privado). Usa GITHUB_TOKEN ou gh CLI.', group: 'sync' },
			{ name: 'memory_import_gist', title: 'Importar de Gist', desc: 'Importa entradas de um GitHub Gist. Mescla com entradas existentes (união de tags, confiança máxima).', group: 'sync' },
			{ name: 'memory_encrypt', title: 'Ativar criptografia', desc: 'Criptografia AES-256-GCM com chave auto-gerada.', group: 'sync' },
			{ name: 'memory_decrypt', title: 'Desativar criptografia', desc: 'Descriptografa e desativa a criptografia.', group: 'sync' },
			{ name: 'memory_backup', title: 'Backup da memória', desc: 'Cria backup com timestamp do arquivo de memória. Auto-poduz para os 10 mais recentes.', group: 'sync' },
			{ name: 'memory_pin', title: 'Fixar entrada', desc: 'Fixa entradas importantes para que apareçam sempre no topo dos resultados, mesmo sem correspondência de palavras-chave.', group: 'core' },
			{ name: 'memory_unpin', title: 'Desfixar entrada', desc: 'Remove a marca de fixação de uma entrada.', group: 'core' },
			{ name: 'memory_search', title: 'Busca unificada', desc: 'Pesquisa na memória com filtros de categoria, tags e intervalo de datas. Filtro de tags usa lógica AND.', group: 'search' },
			{ name: 'memory_tag', title: 'Operações em lote', desc: 'Adiciona, remove ou define tags em uma ou mais entradas por key ou id em uma única chamada.', group: 'core' },
			{ name: 'memory_reflect', title: 'Memory Reflect', desc: 'Ranqueia entradas de forma determinística por obsolescência, qualidade e sobre-conexão para revelar o que precisa de atenção ou limpeza. Zero LLM.', group: 'core' },
			{ name: 'memory_promote', title: 'Promoção Automática', desc: 'Promove rascunhos de baixa confiança a entradas ativas de forma determinística (limiar 0.65, dedup Jaccard > 0.5). dryRun por padrão.', group: 'core' },
		],
	},
	graphSection: {
		title: 'Sua memória, como um grafo',
		subtitle:
			'Conecte decisões a suas specs, bugs e arquitetura. O recall retorna o contexto correto — não apenas correspondência de palavras.',
		points: [
			'Vincule entradas com `links` ou referências `[[key]]` — sem embeddings, sem LLM',
			'`memory_recall({ mode: "graph" })` expande um subgrafo consciente de relações',
		],
		launchLabel: 'Abrir visualizador interativo',
	},
	viewerSection: {
		title: 'Visualizador do grafo de memória',
		subtitle: 'Visualize sua memória como um grafo interativo de força dirigida. Veja entradas, conexões, categorias e padrões de acesso de relance.',
		capsLabel: 'Dentro do visualizador:',
		caps: ['Busca', 'Localizador de caminhos', 'Exportar PNG / SVG', 'Temas claro e escuro'],
		features: [
			'<strong>Visualizador CLI:</strong> <code>npx toon-memory viewer</code> inicia um servidor HTTP',
			'<strong>Visualizador inline MCP Apps:</strong> chame <code>memory_visualize()</code> para renderizar o grafo diretamente em hosts compatíveis com MCP Apps — sem servidor',
			'Passe o mouse sobre nós para tooltips com pré-visualização e pontuação de qualidade',
			'Clique para selecionar e centralizar; duplo clique para abrir detalhes',
			'A busca filtra entradas e destaca nós correspondentes com um brilho pulsante',
			'O localizador de caminhos encontra e destaca a conexão mais curta entre duas entradas',
			'Física ajustável, tema escuro/claro, exportação PNG/SVG',
		],
	},
	smartRecallSection: {
		title: 'Recall inteligente e eficiente em tokens',
		subtitle:
			'O recall é reordenado offline por relevância BM25 e centralidade do grafo — depois comprimido em forma compacta quando tokens importam. Pontuações de qualidade e frescor impulsionam as melhores entradas.',
		points: [
			'Pontuação BM25 sobre id + categoria + key + conteúdo + tags',
			'Centralidade do grafo faz hubs aparecerem mesmo sem a palavra de busca',
			'Pontuação de qualidade (0-1) e decaimento de frescor impulsionam as melhores entradas mais recentes',
			'`compact: true` → índices numéricos, sem id/data/arquivo, vizinhos como trecho',
		],
		standardCode: `memory_recall({ query: "riesgo", mode: "graph" })
[decision] risk-engine-priority (a1b2c3d4)
  The engine prioritizes risk over speed.
  File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01
  links: engine-arch`,
		compactCode: `memory_recall({ query: "riesgo", mode: "graph", compact: true })
[1] decision/risk-engine-priority
  The engine prioritizes risk over speed.
  tags: risk;spec · edges: ->2, ->3`,
		caption: 'O modo compact mantém o mesmo contexto em menos tokens — o arquivo .toon nunca é alterado.',
	},
	faq: {
		title: 'Perguntas frequentes',
		subtitle: 'Tudo que você precisa saber para dar memória ao seu agente',
		items: [
			{
				q: 'O que é toon-memory?',
				a: 'Uma camada de memória persistente para agentes de IA com 35 ferramentas MCP. Armazena decisões, padrões, bugs e contexto em um formato TOON compacto para que seu agente lembre tudo entre sessões — com 80% menos chamadas de ferramenta por sessão.',
			},
			{
				q: 'Quais agentes são suportados?',
				a: 'OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex, Gemini, Zed, Antigravity, Aider, KiloCode, OpenClaw e Kiro — 15+ agentes com zero configuração via servidor MCP.',
			},
			{
				q: 'Como meus dados são armazenados?',
				a: 'Entradas são gravadas em um arquivo TOON local (um formato eficiente em tokens ~22% menor que JSON, medido). Você é dono do arquivo e pode commitar, diffar ou fazer backup como qualquer outro arquivo fonte.',
			},
			{
				q: 'Minha memória é criptografada?',
				a: 'Sim. Ative a criptografia com a ferramenta memory_encrypt para proteger entradas sensíveis com AES-256-GCM. A chave é gerada automaticamente e mantida local.',
			},
			{
				q: 'Funciona offline?',
				a: 'Completamente. toon-memory roda localmente sem serviços externos ou contas. O modo watch até cria backups automáticos em horário agendado.',
			},
			{
				q: 'Vários agentes podem compartilhar a mesma memória?',
				a: 'Sim. Como a memória vive em um arquivo simples no seu projeto, cada agente configurado para aquele projeto lê e escreve o mesmo contexto.',
			},
			{
				q: 'Como faço backup da minha memória?',
				a: 'Use o modo watch para backups automáticos agendados, ou simplesmente commite o arquivo TOON no git. Entradas antigas são auto-arquivadas após 30 dias para manter tudo limpo.',
			},
			{
				q: 'É gratuito e open source?',
				a: 'Sim. toon-memory é licenciado MIT e gratuito. O código está no GitHub e o pacote é publicado no npm.',
			},
			{
				q: 'Como isso difere da memória embutida do meu agente?',
				a: 'A memória embutida geralmente é efêmera ou específica do fornecedor. toon-memory dá a você um arquivo de memória portátil, com diff e criptografado que você controla totalmente entre agentes e projetos.',
			},
			{
				q: 'Posso expirar contexto temporário?',
				a: 'Sim. Defina um TTL (ex: ttl: "7d") em qualquer entrada e ela expira automaticamente — perfeito para sprints, prazos e notas sensíveis ao tempo.',
			},
			{
				q: 'O que é smart recall?',
				a: 'memory_smart_recall combina busca BM25 por palavras-chave, centralidade do grafo, pontuação de qualidade e decaimento de frescor em uma chamada — o melhor de todas as estratégias de ranking sem orquestração manual.',
			},
			{
				q: 'Como funciona a pontuação de qualidade?',
				a: 'Cada entrada recebe automaticamente uma pontuação de qualidade (0-1) baseada em cobertura de tags, riqueza de links, detalhe do conteúdo, frescor e especificidade. Entradas de alta qualidade aparecem primeiro nos resultados.',
			},
			{
				q: 'O que acontece se eu salvar a mesma chave duas vezes?',
				a: 'O sistema mescla atributos em vez de substituir: tags e links são unidos, qualidade e confiança tomam o máximo, e a data é atualizada. Sua entrada fica mais rica com o tempo.',
			},
			{
				q: 'O que é compressão de memória?',
				a: 'memory_compress permite que um LLM resuma entradas relacionadas em um resumo conciso. memory_consolidate(mode: "low-quality") remove entradas de baixa qualidade (sem tags, conteúdo curto) de forma determinística — sem LLM. Ambas reduzem a contagem de tokens.',
			},
			{
				q: 'Posso sincronizar a memória entre máquinas?',
				a: 'Sim. Use memory_export_gist para enviar entradas para um GitHub Gist, depois memory_import_gist em outra máquina. As entradas são mescladas automaticamente (união de tags, confiança máxima).',
			},
		],
	},
	whatNew: {
		title: 'Novidades na v4.3.0',
		subtitle: 'Níveis de importância explícitos, além de Explain WHY, orçamento de tokens, supersessão por versão e ranking mais inteligente',
		cards: [
			{
				icon: '🎯',
				title: 'Importância explícita',
				body: '`memory_remember({ importance })` define `critical`, `high`, `medium` ou `low` — decisões críticas aparecem primeiro (+0.3), notas de baixa importância ficam fora do caminho (−0.1). Vazio = automático (recência + frequência).',
				stats: ['critical +0.3', 'high +0.15', 'low −0.1'],
			},
			{
				icon: '🤔',
				title: 'Explicar POR QUÊ',
				body: '`memory_recall`/`memory_smart_recall` aceitam `explain: true` e anexam uma linha de motivo determinística (`↳ 100% relevance · used 14× · used today · importance HIGH`) a cada entrada retornada — *por que* foi recuperada, sem LLM.',
				stats: ['↳ linha de motivo', 'sem LLM'],
			},
			{
				icon: '🧮',
				title: 'Orçamento de tokens',
				body: '`budget_tokens` limita a saída do recall pela contagem estimada de tokens; as entradas se acumulam de forma gulosa e a cauda que excederia o orçamento é descartada (`0` = sem limite).',
				stats: ['0 = sem limite', 'descarte guloso'],
			},
			{
				icon: '🔄',
				title: 'Supersessão por versão',
				body: '`memory_consolidate(mode: "versions")` detecta entradas descrevendo o mesmo assunto em versões diferentes de bibliotecas (ex.: "Use React 18" vs "Use React 19") e aposenta as mais antigas em favor da mais nova.',
				stats: ['modo "versions"', 'dryRun'],
			},
			{
				icon: '🚫',
				title: 'Memórias negativas',
				body: 'Uma categoria `warning` para fatos do tipo "NÃO faça isso" — antipadrões e armadilhas. Entradas `warning` recebem um impulso no recall para que o agente veja os erros antes de repeti-los.',
				stats: ['impulso warning', 'antipadrões'],
			},
			{
				icon: '📊',
				title: 'Estatísticas estendidas',
				body: '`memory_stats` agora reporta Hit rate (% de entradas recuperadas pelo menos uma vez), Duplicate (% de duplicatas de conteúdo exato) e Dead (% de entradas obsoletas).',
				stats: ['hit rate', 'duplicatas', 'obsoletas'],
			},
			{
				icon: '🎯',
				title: 'Ranking mais inteligente',
				body: 'O recall adiciona um impulso de família de idioma (+0.1) para entradas escritas na mesma escrita (latim/CJK/cirílico/…) e um impulso de correspondência de pasta (+0.05) quando o `path_scope` corresponde ao arquivo atual.',
				stats: ['idioma +0.1', 'pasta +0.05'],
			},
		],
	},
	cta: {
		title: 'Pronto para dar continuidade ao seu agente?',
		subtitle: 'Instale em segundos e nunca mais reexplique seu projeto.',
		getStarted: 'Começar',
		viewGithub: 'Ver no GitHub',
	},
	footer: {
		text: 'Licença MIT — ',
		odalx: 'Um projeto de código aberto da ODALX',
		odalxTag: 'Construindo infraestrutura para a era nativa de IA.',
	},
},
	de: {
	nav: {
		docs: 'Dokumentation',
		features: 'Funktionen',
		viewer: 'Viewer',
		benchmarks: 'Benchmarks',
		faq: 'FAQ',
		npm: 'npm',
		github: 'GitHub',
	},
	hero: {
		tagline: 'Die Kontinuitätsschicht für KI-Agenten',
		subtitle:
			'KI-Agenten sollten dein Projekt nicht in jeder Sitzung neu lernen müssen. toon-memory bewahrt das Wissen, die Entscheidungen und die Konventionen deines Projekts über Sitzungen hinweg — lokal und privat, über MCP.',
		poweredBy: 'Bereitgestellt von TOON',
		getStarted: 'Loslegen',
		viewGithub: 'Auf GitHub ansehen',
		copy: 'Kopieren',
		copied: 'Kopiert!',
		installCmd: 'npm install -g toon-memory',
	},
	problem: {
		title: 'Warum verlieren Agenten Kontext zwischen Sitzungen?',
		subtitle: 'KI-Coding-Agenten starten jede Sitzung mit Gedächtnisverlust',
		cards: [
			{
				icon: '🌀',
				title: 'Kontext wird täglich zurückgesetzt',
				body: 'Bei jeder neuen Sitzung vergisst dein Agent die Entscheidungen, Muster und Bugs, die er gelernt hat. Du erklärst denselben Kontext immer und immer wieder.',
			},
			{
				icon: '🔍',
				title: 'In der Geschichte stöbern',
				body: 'Ohne Speicher durchsuchen Agenten den Git-Verlauf und lesen Dateien neu, um zu rekonstruieren, warum etwas auf eine bestimmte Weise gebaut wurde — und verbrennen Token und Zeit.',
			},
			{
				icon: '📋',
				title: 'Copy-Paste-Notizen',
				body: 'Entwickler fügen Kontext manuell zwischen Chats ein. Es ist zerbrechlich, veraltet und erreicht nie den nächsten autonomen Lauf.',
			},
		],
		resolution:
			'toon-memory gibt deinem Agenten einen persistenten, abfragbaren Speicher — sodass Kontext automatisch jede Sitzung überlebt.',
	},

	continuity: {
		kicker: 'Lerne toon-memory kennen',
		title: 'Die Kontinuitätsebene für deinen Workflow',
		subtitle:
			'Während ein Speicher Fakten ablegt, bewahrt eine Kontinuitätsebene, wie dein Projekt funktioniert — damit jede Sitzung dort beginnt, wo die letzte endete.',
		items: [
			{ icon: '🧭', title: 'Entscheidungen', body: 'Das "Warum" hinter jeder Wahl — Frameworks, Bibliotheken, Kompromisse. Abgerufen, wenn es zählt, nie neu aufgerollt.' },
			{ icon: '📏', title: 'Konventionen', body: 'Namens-, Struktur- und Stilregeln, auf die sich dein Team geeinigt hat. Befolgt, ohne erneut gesagt zu werden.' },
			{ icon: '🧠', title: 'Kontext', body: 'Architektur-, Umgebungs- und Betriebswissen, das in keiner einzelnen Datei lebt.' },
			{ icon: '🤝', title: 'Geteiltes Verständnis', body: 'Projektwissen und Team-Entscheidungen, verfügbar für jeden Agenten und jede Sitzung.' },
		],
		closing:
			'toon-memory führt das Konzept einer Kontinuitätsebene ein: ein leichtes System, das Projektwissen, Entscheidungen und Kontext zwischen KI-Sitzungen bewahrt — ohne Cloud-Dienste und schwere Infrastruktur.',
	},

	benefits: {
		kicker: 'Warum Entwickler toon-memory wählen',
		title: 'Gebaut um die Probleme, die du wirklich hast',
		subtitle: 'Keine Liste von Werkzeugen — ein Satz von Ergebnissen.',
		groups: [
			{ icon: '🧭', title: 'Persistentes Projektwissen', items: ['Erinnert Entscheidungen und die Gründe dahinter', 'Erinnert Architektur und Konventionen', 'Sammelt sich zwischen Sitzungen an — nie wieder erklärt'] },
			{ icon: '🔒', title: 'Datenschutz zuerst', items: ['100% lokal — kein Cloud, kein Server, keine Telemetrie', 'Optionale AES-256-GCM-Verschlüsselung', 'Du besitzt die Speicherdatei wie jede Quelldatei'] },
			{ icon: '⚡', title: 'Leichtgewichtig', items: ['Natives TOON-Format — 22% weniger Tokens als JSON', 'Keine Abhängigkeiten, läuft auf jedem Node.js 18+', 'Deterministische Logik — keine LLM-Aufrufe, keine API-Schlüssel'] },
			{ icon: '🛰️', title: 'Universell', items: ['Funktioniert mit 15+ Agenten: Claude Code, Codex, Gemini CLI, Cursor, OpenCode und mehr', 'Standard-MCP — Agenten wechseln, ohne Kontext zu verlieren', 'Projektweiter Speicher, den jedes Teammitglied teilt'] },
		],
	},

	features: {
		cards: [
			{
			icon: '🧩',
			title: 'Ein Speicher-Toolkit, kein Protokoll',
			body: 'Alles, was dein Agent zum Merken, Abrufen und Denken braucht — nach Zweck gruppiert, mit Ressourcen für direktes Kontext-Lesen und einem interaktiven Graph-Viewer.',
				toolGroups: [
					{ label: 'Kernspeicher', tools: ['memory_remember', 'memory_recall', 'memory_forget', 'memory_stats', 'memory_diff', 'memory_suggest', 'memory_summary', 'memory_archive', 'memory_checkpoint', 'memory_visualize', 'memory_pin', 'memory_unpin', 'memory_tag', 'memory_reflect', 'memory_promote'] },
					{ label: 'Suche & Intelligenz', tools: ['memory_smart_recall', 'memory_captured', 'memory_consolidate', 'memory_graph_path', 'memory_search'] },
					{ label: 'Kontext-Briefing', tools: ['context_brief', 'context_generate', 'context_diff', 'context_focus', 'context_health', 'context_export'] },
					{ label: 'Komprimierung', tools: ['memory_compress', 'memory_primer'] },
					{ label: 'Sitzungen', tools: ['memory_sessions', 'memory_merge_sessions'] },
					{ label: 'Sync & Sicherheit', tools: ['memory_export_gist', 'memory_import_gist', 'memory_encrypt', 'memory_decrypt', 'memory_backup'] },
				],
				wide: true,
			},
			{
				icon: '⭐',
				title: 'Multi-Agent',
				body: 'Funktioniert mit allen großen KI-Coding-Agenten. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue — Null Konfiguration.',
				tags: ['OpenCode', 'Claude', 'Cursor'],
			},
			{
				icon: '📄',
				title: 'TOON-Format',
				body: '22% weniger Token als JSON (gemessen). Benutzerdefinierte Kodierung für LLM-Verständnis und Token-Effizienz.',
				stats: ['22% weniger Token', '1.3x schnelleres Parsen'],
			},
			{
				icon: '🔎',
				title: 'Smart Recall',
				body: 'Graph-basierter Recall, neu sortiert nach BM25-Relevanz und Graph-Zentralität (Hubs tauchen auch ohne Suchwort auf). Hop-Weiser Decay hält fernen Kontext niedrig. Token-effizienter `compact`-Modus gibt numerisch indexierte, snippet-abgeschnittene Ergebnisse zurück.',
				stats: ['BM25', 'Zentralität', 'compact'],
			},
			{
				icon: '🧠',
				title: 'Intelligenter Speicher',
				body: 'Automatische Tag-Inferenz aus integriertem Vokabular plus Projekt-Abhängigkeiten, Qualitäts-Bewertung, Konfidenz-Scores, Merge-Dedup, verwandte Eintrags-Vorschläge, Speicher-Diff und konfigurierbare TTL für temporären Kontext.',
				stats: ['Auto-Tags', 'Qualität', 'Merge-Dedup'],
			},
			{
				icon: '🔒',
				title: 'Verschlüsselung',
				body: 'AES-256-GCM für sensible Daten. Automatisches Archiv alter Einträge. Watch-Modus für automatische Sicherung alle N Minuten.',
				stats: ['AES-256-GCM', 'Auto-Backup'],
			},
		],
	},
	agents: {
		title: 'Funktioniert mit 15+ KI-Coding-Agenten',
		subtitle: 'Null Konfiguration — toon-memory erkennt und konfiguriert jeden automatisch',
	},
	stats: {
		items: [
			{ number: '97.6%', label: 'Recall aus den Top-5 (R@5 0.861)' },
			{ number: '15', label: 'Agenten' },
			{ number: '80%', label: 'Weniger Tool-Aufrufe/Sitzung' },
			{ number: '0', label: 'Benötigte Konfiguration' },
		],
	},
	howItWorks: {
		title: 'Wie funktioniert das?',
		subtitle: 'Vier Schritte von Gedächtnisverlust zu Speicher',
		steps: [
			{ n: 1, title: 'Installieren', body: 'Ein Befehl. Null Konfiguration für 15+ Agenten.', code: 'npm install -g toon-memory' },
			{
				n: 2,
				title: 'Merken',
				body: 'Speichere Entscheidungen, Muster und Bugs während der Arbeit — mit automatischer Tag-Inferenz und optionalem TTL.',
				code: `memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  file: "src/types.ts"
})`,
			},
			{
				n: 3,
				title: 'Abrufen',
				body: 'Dein Agent fragt den Speicher bei Bedarf ab — keine Neuerklärung, kein Token-Verschwendung.',
				code: `memory_recall({ query: "validation" })
// [decision] use-zod (a1b2c3d4)
//   Use Zod for validation — src/types.ts`,
			},
			{
				n: 4,
				title: 'Kontext',
				body: 'Ein Aufruf gibt deinem Agenten alles: Projekt, Git, Speicher, Sitzungen. 80% weniger Tool-Aufrufe.',
				code: `context_generate({})
// # Project Briefing (full)
// ## Project — toon-memory v4.3.0
// ## Git — branch: main, 3 commits
// ## Memory — 26 entries, 18 edges
// ## Sessions — 2 active`,
			},
		],
	},
	tips: {
		title: 'Speicher-Tipps',
		subtitle: 'Hole das Beste aus toon-memory mit diesen Mustern',
		items: [
			{
				n: 1,
				title: 'Entscheidungen sofort speichern',
				body: 'Wenn du eine Wahl triffst, speichere sie sofort. Füge Kontext hinzu, <em>warum</em> du Option A über B gewählt hast — dein zukünftiges Ich wird dir danken.',
			},
			{
				n: 2,
				title: 'Konsistente Keys verwenden',
				body: 'Präfixe nach Domäne: <code class="inline-code">db:redis-config</code>, <code class="inline-code">auth:jwt</code>. Macht Recall schneller und vermeidet Kollisionen.',
			},
			{
				n: 3,
				title: 'Tags werden automatisch inferiert',
				body: 'Lasse Tags leer und das System inferiert sie aus dem Inhalt — redis, auth, api, db und 16+ weitere Kategorien. Oder füge sie manuell für präzise Kontrolle hinzu.',
			},
			{
				n: 4,
				title: 'TTL für temporären Kontext verwenden',
				body: 'Deadlines, Sprints, zeitkritische Notizen — setze ein <code class="inline-code">ttl: "7d"</code> und sie laufen automatisch ab. Kein manuelles Aufräumen nötig.',
			},
		],
	},
	comparison: {
		title: 'Gleiches Projekt. Zwei Sitzungen.',
		subtitle: 'Was dein Agent sich merkt, ändert das Ergebnis.',
		beforeTitle: 'Ohne toon-memory',
		afterTitle: 'Mit toon-memory',
		thinkingBefore: 'Denke nach…',
		thinkingAfter: 'Erinnere…',
		before: [
			{ session: 'Sitzung 1' },
			{ user: 'Verwende Sequelize.' },
			{ assistant: 'OK.' },
			{ note: 'Im Sitzungskontext gehalten — Tokens sammeln sich an.', tone: 'warn' },
			{ session: 'Sitzung 2' },
			{ user: 'Was ist unser ORM?' },
			{ note: 'Keine Erinnerung zwischen Sitzungen.', tone: 'error' },
			{ assistant: 'Ich weiß es nicht.' },
		],
			after: [
				{ session: 'Sitzung 1' },
				{ user: 'Verwende Sequelize.' },
				{ cmd: '$ memory_remember({ category: "decision", key: "orm:sequelize", content: "Sequelize als ORM verwenden" })' },
				{ assistant: 'OK.' },
				{ note: 'Im Speicher gespeichert.' },
			{ session: 'Sitzung 2' },
			{ user: 'Was ist unser ORM?' },
			{ note: 'Aus dem Speicher erinnert.' },
			{ assistant: 'Du verwendest Sequelize.' },
		],
	},
	codeExamples: {
		quickExample: 'Schnelles Beispiel',
		quickInstall: 'Schnelle Installation',
		exampleCode: `// Entscheidung speichern (mit auto Tag-Inferenz)
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  file: "src/types.ts"
})
// 🏷️ Tags inferiert: types

// Mit TTL speichern (läuft in 7 Tagen ab)
memory_remember({
  category: "knowledge",
  key: "sprint-deadline",
  content: "Sprint ends July 18",
  ttl: "7d"
})

// Änderungen seit letzter Sitzung ansehen
memory_diff({ since: "24h" })

// Speicher durchsuchen
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20`,
		installCode: `# npm
npm install -g toon-memory

# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex`,
	},
	benchmarks: {
		title: 'Benchmarks',
		subtitle: 'Gemessen, nicht angenommen',
		tabs: { ranking: 'Ranking-Qualität', workflow: 'Workflow-Ersparnis', format: 'TOON-Format' },
		retrieval: {
			subtitle: 'LongMemEval-artige Suche über einen eingefrorenen 187-Einträge-Snapshot — 42 Gold-Queries',
			what: 'Die vereinheitlichte Recall-Pipeline findet den richtigen Eintrag in den Top 5',
			metricLabel: 'Metrik',
			linear: 'Linear',
			rrf: 'RRF',
			smart: 'Vereinheitlicht',
			metricRows: [
				{ metric: 'R@5', gloss: 'Gold-Eintrag in den Top 5', linear: '0.643', rrf: '0.861', smart: '0.829' },
				{ metric: 'nDCG@5', gloss: 'Ordnungsqualität', linear: '0.654', rrf: '0.764', smart: '0.739' },
				{ metric: 'MRR@5', gloss: 'Position des Treffers', linear: '0.776', rrf: '0.788', smart: '0.760' },
			],
			result: '97,6 % der Queries aus den Top 5 beantwortet',
			note: 'Echter <code>data.toon</code>-Snapshot (187 Einträge, 2026-08-01), deterministisches <code>today</code>, schreibgeschützt, keine Kopien; 2 Priority-Meta-Einträge ausgeschlossen. Reproduzierbar: <code>npm run bench:retrieval</code>.',
		},
		workflow: {
			subtitle: 'Token- und Tool-Call-Ersparnis, gemessen in einer realen Sitzung',
			stats: [
				{ num: '~90%', cap: 'weniger Tokens (Auto-Loading)' },
				{ num: '80%', cap: 'weniger Tool-Calls (25 → 5)' },
				{ num: '68%', cap: 'weniger Tokens (kompakter Recall)' },
				{ num: '58%', cap: 'weniger Tokens (System-Primer)' },
				{ num: '14%', cap: 'weniger Tokens (Batch-Komprimierung)' },
			],
			note: 'Auto-Loading: Das OpenCode-Plugin injiziert nur dateirelevante Erinnerungen statt alle Einträge zu laden. Volle Sitzung: Start → Debug → Implementierung → Review → Abschluss. Reproduzierbar: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
		},
		format: {
			subtitle: 'Das TOON-Format ist für LLMs gebaut, nicht für Menschen',
			stats: [
				{ num: '22.5%', cap: 'weniger Token als JSON' },
				{ num: '30.5%', cap: 'bei einem einzelnen Eintrag' },
				{ num: '1.3x', cap: 'schnelleres Parsen' },
			],
			note: 'Gemessen mit <code>gpt-tokenizer</code> (cl100k_base) über 16 repräsentative Speicher-Einträge, vergleicht das echte TOON-Format auf Disk mit kompaktem JSON. Reproduzierbar: <code>npm run bench</code>.',
		},
	},
	tools: {
		title: 'Ein vollständiges Speicher-Toolkit',
		subtitle: 'Alles, was dein Agent zum Merken, Abrufen und Denken braucht',
		resourcesLabel: 'Ressourcen:',
		groups: {
			core: 'Kernspeicher',
			search: 'Suche & Intelligenz',
			context: 'Kontext-Briefing',
			compress: 'Komprimierung',
			sessions: 'Sitzungen',
			sync: 'Sync & Sicherheit',
		},
		cards: [
			{ name: 'memory_remember', title: 'Im Speicher speichern', desc: 'Speichere Entscheidungen, Muster, Bugs, Wissen oder warnings (negative „Tu das NICHT"-Erinnerungen, mit Boost abgerufen) — persistiert über Sitzungen mit automatischer Qualitätsbewertung.', group: 'core' },
			{ name: 'memory_recall', title: 'Speicher durchsuchen', desc: 'Befrage den Wissensgraph vor dem Datei-Lesen. Qualitätsgewichtete Ergebnisse. Unterstützt path_scope und Budget-Steuerung (tiny/normal/deep). explain: true fügt eine Begründungszeile pro Eintrag hinzu; budget_tokens begrenzt die Ausgabe nach geschätzten Token.', group: 'core' },
			{ name: 'memory_forget', title: 'Aus dem Speicher löschen', desc: 'Lösche Einträge per Schlüssel oder id.', group: 'core' },
			{ name: 'memory_stats', title: 'Speicher-Statistiken', desc: 'Zeigt Statistiken über den Projekt-Speicher inklusive Qualitätsverteilung, meistbesuchte Einträge und Hit-Rate-/Duplikat-/Veraltet-Metriken.', group: 'core' },
			{ name: 'memory_diff', title: 'Speicher-Diff', desc: 'Sieh, was sich seit deiner letzten Sitzung geändert hat.', group: 'core' },
			{ name: 'memory_suggest', title: 'Ähnliche vorschlagen', desc: 'Zeigt verwandte Einträge für einen gegebenen Kontext.', group: 'core' },
			{ name: 'memory_summary', title: 'Datei-Zusammenfassung', desc: 'Speichere oder rufe eine Datei-Zusammenfassung ab, um Token zu sparen.', group: 'core' },
			{ name: 'memory_archive', title: 'Alte archivieren', desc: 'Verschiebt Einträge älter als 30 Tage, um den Speicher sauber zu halten.', group: 'core' },
			{ name: 'memory_smart_recall', title: 'Smart Recall', desc: 'Einheitliche Suche kombiniert BM25 + Graph-Zentralität + Qualität + Frische in einem Aufruf. Unterstützt explain: true (Begründungen pro Eintrag) und budget_tokens (Ausgabe-Limit).', group: 'search' },
			{ name: 'memory_captured', title: 'Erfasste Aktivität', desc: 'Zeigt automatisch erfasste Hook-Aktivität an — befördere Beobachtungen zum Speicher.', group: 'search' },
			{ name: 'memory_consolidate', title: 'Konsolidieren', desc: 'Führt doppelte Einträge mit identischem Inhalt deterministisch zusammen, erkennt Near-Duplicates über Jaccard-Ähnlichkeit (>50%), entfernt Einträge niedriger Qualität im Batch oder mustert Einträge älterer Bibliotheksversionen aus (mode: "versions") — über den mode-Parameter, ohne LLM.', group: 'search' },
			{ name: 'context_brief', title: 'Kontext-Briefing', desc: 'Ein-Aufruf-Kontext-Briefing: Speicher + Sitzungen + Gesundheit in kompaktem Markdown. Null LLM.', group: 'context' },
			{ name: 'context_generate', title: 'Vollständiges Projektbriefing', desc: 'Ein-Aufruf-Briefing: Projektstruktur + Git-Zustand + Speicher + Sitzungen. Ersetzt 6 manuelle Aufrufe. Spart 93% Token.', group: 'context' },
			{ name: 'context_diff', title: 'Inkrementelles Briefing', desc: 'Git-Commits + geänderte Dateien + neue/aktualisierte Speicher-Einträge seit letzter Sitzung. Spart 72% Token.', group: 'context' },
			{ name: 'context_focus', title: 'Gezieltes Briefing', desc: 'Relevanter Speicher + verwandte Dateien + Aufrufer + Testdateien für eine bestimmte Anfrage.', group: 'context' },
			{ name: 'context_health', title: 'Gesundheits-Audit', desc: 'Verwaiste Links, Duplikate, defekte Dateiverweise, abgelaufene TTL, veraltete Sitzungen. Score 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Als Markdown exportieren', desc: 'Exportiert Speicher als injizierbares Markdown für System-Prompts. Spart 82% Token.', group: 'context' },
			{ name: 'memory_compress', title: 'LLM-Komprimierung', desc: 'LLM-gestützte Zwei-Schritt-Komprimierung: Zusammenfassen + Überschreiben. Verwendet Anthropic/OpenAI CLI wenn verfügbar.', group: 'compress' },
			{ name: 'memory_primer', title: 'Kontext-Primer', desc: 'Ein-Aufruf-Kontext-Primer: Top-Speicher + Kategorien + Sitzungsdatei-Änderungen. Wird automatisch zu Sitzungsbeginn injiziert.', group: 'compress' },
			{ name: 'memory_sessions', title: 'Sitzungen', desc: 'Zeigt aktive Agenten-Sitzungen und erkennt weiche Konflikte.', group: 'sessions' },
			{ name: 'memory_merge_sessions', title: 'Sitzungen zusammenführen', desc: 'Führt Beobachtungen über parallele Sitzungen für eine Datei zusammen. Dedupliziert und befördert automatisch.', group: 'sessions' },
			{ name: 'memory_export_gist', title: 'Als Gist exportieren', desc: 'Exportiert Speicher-Einträge in einen GitHub Gist (öffentlich oder privat). Verwendet GITHUB_TOKEN oder gh CLI.', group: 'sync' },
			{ name: 'memory_import_gist', title: 'Vom Gist importieren', desc: 'Importiert Einträge aus einem GitHub Gist. Führt mit bestehenden Einträge zusammen (Tags-Vereinigung, max. Konfidenz).', group: 'sync' },
			{ name: 'memory_encrypt', title: 'Verschlüsselung aktivieren', desc: 'AES-256-GCM-Verschlüsselung mit automatisch generiertem Schlüssel.', group: 'sync' },
			{ name: 'memory_decrypt', title: 'Verschlüsselung deaktivieren', desc: 'Entschlüsselt und deaktiviert die Verschlüsselung.', group: 'sync' },
			{ name: 'memory_backup', title: 'Speicher sichern', desc: 'Erstellt einen zeitgestempelten Backup der Speicherdatei. Automatisch auf die 10 neuesten gekürzt.', group: 'sync' },
			{ name: 'memory_pin', title: 'Eintrag anheften', desc: 'Heftet wichtige Einträge an, sodass sie immer oben in den Ergebnissen erscheinen, auch ohne Keyword-Übereinstimmung.', group: 'core' },
			{ name: 'memory_unpin', title: 'Eintrag lösen', desc: 'Entfernt die Anheft-Markierung eines Eintrags.', group: 'core' },
			{ name: 'memory_search', title: 'Einheitliche Suche', desc: 'Durchsucht den Speicher mit Kategorie-, Tag- und Datumsbereichsfiltern. Tag-Filter verwendet UND-Logik.', group: 'search' },
			{ name: 'memory_tag', title: 'Batch-Tag-Operationen', desc: 'Fügt Tags hinzu, entfernt oder setzt sie bei einem oder mehreren Einträgen per Key oder ID in einem Aufruf.', group: 'core' },
			{ name: 'memory_reflect', title: 'Memory Reflect', desc: 'Sortiert Einträge deterministisch nach Veraltung, Qualität und Über-Verbindung, um aufzuzeigen, was Aufmerksamkeit oder Aufräumen braucht. Zero LLM.', group: 'core' },
			{ name: 'memory_promote', title: 'Auto-Befördern', desc: 'Befördert Entwürfe mit geringer Konfidenz deterministisch zu aktiven Einträgen (Schwelle 0.65, Jaccard-Dedup > 0.5). Standardmäßig dryRun.', group: 'core' },
		],
	},
	graphSection: {
		title: 'Dein Speicher als Graph',
		subtitle:
			'Verbinde Entscheidungen mit Specs, Bugs und Architektur. Recall gibt den richtigen Kontext zurück — nicht nur Übereinstimmung.',
		points: [
			'Verbinde Einträge mit `links` oder `[[key]]`-Referenzen — keine Embeddings, kein LLM',
			'`memory_recall({ mode: "graph" })` erweitert einen beziehungsbewussten Subgraphen',
		],
		launchLabel: 'Interaktiven Viewer öffnen',
	},
	viewerSection: {
		title: 'Memory-Graph-Viewer',
		subtitle: 'Visualisiere dein Gedächtnis als interaktiven kraftgerichteten Graphen. Sieh Einträge, Verbindungen, Kategorien und Zugriffsmuster auf einen Blick.',
		capsLabel: 'Im Viewer:',
		caps: ['Suche', 'Pfadfinder', 'PNG / SVG-Export', 'Dunkles & helles Thema'],
		features: [
			'<strong>CLI-Viewer:</strong> <code>npx toon-memory viewer</code> startet einen HTTP-Server',
			'<strong>Inline MCP-Apps-Viewer:</strong> rufe <code>memory_visualize()</code> auf, um den Graphen direkt in MCP-Apps-kompatiblen Hosts zu rendern — ohne Server',
			'Hover über Knoten zeigt Tooltips mit Inhaltsvorschau und Qualitätspunktzahl',
			'Klicken zum Auswählen und Zentrieren; Doppelklick öffnet Details',
			'Suche filtert Einträge und hebt passende Knoten mit pulsierendem Glühen hervor',
			'Pfadfinder findet und hebt die kürzeste Verbindung zwischen zwei Einträgen hervor',
			'Einstellbare Physik, dunkles/helles Thema, PNG/SVG-Export',
		],
	},
	smartRecallSection: {
		title: 'Intelligenter, token-effizienter Recall',
		subtitle:
			'Recall wird offline nach BM25-Relevanz und Graph-Zentralität neu sortiert — dann zu kompakter Form komprimiert, wenn Token wichtig sind. Qualitäts-Scores und Frische heben die besten Einträge hervor.',
		points: [
			'BM25-Bewertung über id + Kategorie + Key + Inhalt + Tags',
			'Graph-Zentralität lässt Hubs erscheinen, auch ohne Suchwort',
			'Qualitäts-Score (0-1) und Frische-Decay heben die besten, neuesten Einträge hervor',
			'`compact: true` → numerische Indizes, ohne id/Datum/Datei, snippet-abgeschnittene Nachbarn',
		],
		standardCode: `memory_recall({ query: "riesgo", mode: "graph" })
[decision] risk-engine-priority (a1b2c3d4)
  The engine prioritizes risk over speed.
  File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01
  links: engine-arch`,
		compactCode: `memory_recall({ query: "riesgo", mode: "graph", compact: true })
[1] decision/risk-engine-priority
  The engine prioritizes risk over speed.
  tags: risk;spec · edges: ->2, ->3`,
		caption: 'Kompakter Modus behält den selben Kontext in weniger Token — die .toon-Datei wird nie geändert.',
	},
	faq: {
		title: 'Häufig gestellte Fragen',
		subtitle: 'Alles, was du wissen musst, um deinem Agenten einen Speicher zu geben',
		items: [
			{
				q: 'Was ist toon-memory?',
				a: 'Eine persistente Speicherschicht für KI-Coding-Agenten mit 35 MCP-Tools. Es speichert Entscheidungen, Muster, Bugs und Kontext in einem kompakten TOON-Format, damit dein Agent sich an alles zwischen Sitzungen erinnert — mit 80% weniger Tool-Aufrufen pro Sitzung.',
			},
			{
				q: 'Welche Agenten werden unterstützt?',
				a: 'OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex, Gemini, Zed, Antigravity, Aider, KiloCode, OpenClaw und Kiro — 15+ Agenten mit Null Konfiguration über den MCP-Server.',
			},
			{
				q: 'Wie werden meine Daten gespeichert?',
				a: 'Einträge werden in eine lokale TOON-Datei geschrieben (ein token-effizientes Format, ~22% kleiner als JSON, gemessen). Du besitzt die Datei und kannst sie committen, diffen oder sichern wie jede andere Quelldatei.',
			},
			{
				q: 'Ist mein Speicher verschlüsselt?',
				a: 'Ja. Aktiviere Verschlüsselung mit dem memory_encrypt-Tool, um sensible Einträge mit AES-256-GCM zu sichern. Der Schlüssel wird automatisch generiert und lokal gehalten.',
			},
			{
				q: 'Funktioniert es offline?',
				a: 'Völlig. toon-memory läuft lokal ohne externe Dienste oder Konten. Watch-Modus erstellt sogar automatische Sicherungen nach Zeitplan.',
			},
			{
				q: 'Können mehrere Agenten denselben Speicher teilen?',
				a: 'Ja. Da der Speicher in einer normalen Datei in deinem Projekt lebt, lesen und schreiben alle für dieses Projekt konfigurierten Agenten denselben Kontext.',
			},
			{
				q: 'Wie sichere ich meinen Speicher?',
				a: 'Verwende den Watch-Modus für geplante automatische Sicherungen oder committe einfach die TOON-Datei in Git. Alte Einträge werden nach 30 Tagen automatisch archiviert.',
			},
			{
				q: 'Ist es frei und Open Source?',
				a: 'Ja. toon-memory ist MIT-lizenziert und kostenlos nutzbar. Der Quellcode ist auf GitHub und das Paket wird auf npm veröffentlicht.',
			},
			{
				q: 'Wie unterscheidet es sich vom eingebauten Speicher meines Agenten?',
				a: 'Eingebauter Speicher ist oft flüchtig oder anbieterspezifisch. toon-memory gibt dir eine portable, diffbare, verschlüsselte Speicherdatei, die du vollständig kontrollierst — über Agenten und Projekte hinweg.',
			},
			{
				q: 'Kann ich temporären Kontext ablaufen lassen?',
				a: 'Ja. Setze ein TTL (z.B. ttl: "7d") auf einen Eintrag und er läuft automatisch ab — perfekt für Sprints, Deadlines und zeitkritische Notizen.',
			},
			{
				q: 'Was ist Smart Recall?',
				a: 'memory_smart_recall kombiniert BM25-Suche, Graph-Zentralität, Qualitätsbewertung und Frische-Decay in einem Aufruf — das Beste aller Ranking-Strategien ohne manuelle Orchestrierung.',
			},
			{
				q: 'Wie funktioniert die Qualitätsbewertung?',
				a: 'Jeder Eintrag erhält automatisch einen Qualitäts-Score (0-1) basierend auf Tag-Abdeckung, Link-Reichtum, Inhaltsdetail, Frische und Spezifität. Hochwertige Einträge tauchen zuerst in Recall-Ergebnissen auf.',
			},
			{
				q: 'Was passiert, wenn ich denselben Key zweimal speichere?',
				a: 'Das System vermergt Attribute statt zu ersetzen: Tags und Links werden vereint, Qualität und Konfidenz nehmen den Maximalwert, und das Datum wird aktualisiert. Dein Eintrag wird im Laufe der Zeit reicher.',
		},
		{
			q: 'Was ist Speicherkomprimierung?',
			a: 'memory_compress lässt ein LLM verwandte Einträge zu einer knappen Zusammenfassung verdichten. memory_consolidate(mode: "low-quality") entfernt Einträge niedriger Qualität (kein Tags, kurzer Inhalt) deterministisch — kein LLM nötig. Beide reduzieren die Token-Anzahl.',
		},
		{
			q: 'Kann ich Speicher zwischen Maschinen synchronisieren?',
			a: 'Ja. Verwenden Sie memory_export_gist, um Einträge an einen GitHub Gist zu senden, dann memory_import_gist auf einer anderen Maschine. Einträge werden automatisch fusioniert (Vereinigung von Tags, maximale Konfidenz).',
		},
	],
},
whatNew: {
	title: 'Neu in v4.3.0',
	subtitle: 'Explizite Wichtigkeitsstufen, plus Explain WHY, Token-Budgets, Versions-Ersetzung und intelligenteres Ranking',
	cards: [
		{
			icon: '🎯',
			title: 'Explizite Wichtigkeit',
			body: '`memory_remember({ importance })` setzt `critical`, `high`, `medium` oder `low` — kritische Entscheidungen erscheinen zuerst (+0.3), niedrige Notizen bleiben im Hintergrund (−0.1). Leer = automatisch (Aktualität + Häufigkeit).',
			stats: ['critical +0.3', 'high +0.15', 'low −0.1'],
		},
		{
			icon: '🤔',
			title: 'Explain WHY',
			body: '`memory_recall`/`memory_smart_recall` akzeptieren `explain: true` und hängen jedem zurückgegebenen Eintrag eine deterministische Begründungszeile an (`↳ 100% relevance · used 14× · used today · importance HIGH`) — *warum* er abgerufen wurde, kein LLM.',
			stats: ['↳ Begründungszeile', 'kein LLM'],
		},
		{
			icon: '🧮',
			title: 'Token-Budgets',
			body: '`budget_tokens` begrenzt die Recall-Ausgabe nach geschätzter Token-Anzahl; Einträge werden gierig akkumuliert und der Überschuss am Ende, der das Budget überschreiten würde, wird verworfen (`0` = kein Limit).',
			stats: ['0 = kein Limit', 'gieriger Überlauf'],
		},
		{
			icon: '🔄',
			title: 'Versions-Ersetzung',
			body: '`memory_consolidate(mode: "versions")` erkennt Einträge, die dasselbe Thema in verschiedenen Bibliotheksversionen beschreiben (z. B. „React 18 verwenden" vs. „React 19 verwenden") und archiviert die älteren zugunsten der neuesten.',
			stats: ['"versions"-Modus', 'dryRun'],
		},
		{
			icon: '🚫',
			title: 'Negative Erinnerungen',
			body: 'Eine `warning`-Kategorie für „Tu das NICHT"-Fakten — Anti-Patterns und Minen. `warning`-Einträge erhalten einen Recall-Boost, damit der Agent die Fehler sieht, bevor er sie wiederholt.',
			stats: ['warning-Boost', 'Anti-Patterns'],
		},
		{
			icon: '📊',
			title: 'Erweiterte Statistiken',
			body: '`memory_stats` meldet jetzt Hit-Rate (% der mindestens einmal abgerufenen Einträge), Duplikate (% exakter Inhaltsduplikate) und Veraltet (% obsoleter Einträge).',
			stats: ['Hit-Rate', 'Duplikate', 'Veraltet'],
		},
		{
			icon: '🎯',
			title: 'Intelligenteres Ranking',
			body: 'Recall fügt einen Sprach-Familien-Boost (+0.1) für Einträge hinzu, die in derselben Schrift (lateinisch/CJK/kyrillisch/…) geschrieben sind, sowie einen Ordner-Boost (+0.05), wenn `path_scope` zur aktuellen Datei passt.',
			stats: ['Sprache +0.1', 'Ordner +0.05'],
		},
	],
},
cta: {
	title: 'Bereit, deinem Agenten Kontinuität zu geben?',
	subtitle: 'In Sekunden installiert — erkläre dein Projekt nie wieder.',
	getStarted: 'Loslegen',
	viewGithub: 'Auf GitHub ansehen',
},
	footer: {
		text: 'MIT-Lizenz — ',
		odalx: 'Ein Open-Source-Projekt von ODALX',
		odalxTag: 'Infrastruktur für das KI-native Zeitalter aufbauen.',
	},
},
	fr: {
	nav: {
		docs: 'Documentation',
		features: 'Fonctionnalités',
		viewer: 'Visualiseur',
		benchmarks: 'Benchmarks',
		faq: 'FAQ',
		npm: 'npm',
		github: 'GitHub',
	},
	hero: {
		tagline: 'La couche de continuité pour les agents IA',
		subtitle:
			"Les agents IA ne devraient pas avoir à réapprendre votre projet à chaque session. toon-memory préserve le savoir, les décisions et les conventions de votre projet entre les sessions — localement et en privé, via MCP.",
		poweredBy: 'Propulsé par TOON',
		getStarted: 'Commencer',
		viewGithub: 'Voir sur GitHub',
		copy: 'Copier',
		copied: 'Copié !',
		installCmd: 'npm install -g toon-memory',
	},
	problem: {
		title: 'Pourquoi les agents perdent-ils le contexte entre les sessions ?',
		subtitle: 'Les agents de code IA commencent chaque session avec une amnésie',
		cards: [
			{
				icon: '🌀',
				title: 'Le contexte se réinitialise quotidiennement',
				body: 'À chaque nouvelle session, votre agent oublie les décisions, motifs et bugs appris hier. Vous réexpliquez le même contexte encore et encore.',
			},
			{
				icon: '🔍',
				title: 'Chercher dans l\'historique',
				body: 'Sans mémoire, les agents fouillent l\'historique git et relisent les fichiers pour reconstruire pourquoi quelque chose a été construit d\'une certaine façon — en brûlant des tokens et du temps.',
			},
			{
				icon: '📋',
				title: 'Notes copier-coller',
				body: 'Les développeurs collent le contexte manuellement entre les chats. C\'est fragile, ça devient obsolète et n\'arrive jamais à la prochaine exécution autonome.',
			},
		],
		resolution:
			'toon-memory donne à votre agent une mémoire persistante et interrogeable — le contexte survit automatiquement à chaque session.',
	},
	continuity: {
		kicker: 'Découvrez toon-memory',
		title: 'La couche de continuité pour votre flux de travail',
		subtitle: 'Une mémoire stocke des faits ; une couche de continuité préserve le fonctionnement de votre projet — pour que chaque session commence là où la précédente s\'est arrêtée.',
		items: [
			{ icon: '🧭', title: 'Décisions', body: 'Le « pourquoi » derrière chaque choix — frameworks, bibliothèques, compromis. Rappelé quand il compte, jamais re-débattu.' },
			{ icon: '📏', title: 'Conventions', body: 'Règles de nommage, de structure et de style adoptées par votre équipe. Respectées sans être répétées.' },
			{ icon: '🧠', title: 'Contexte', body: 'Connaissances d\'architecture, d\'environnement et d\'exploitation qui ne vivent dans aucun fichier unique.' },
			{ icon: '🤝', title: 'Compréhension partagée', body: 'Connaissances du projet et décisions d\'équipe disponibles pour chaque agent et chaque session.' },
		],
			closing: 'toon-memory introduit le concept de couche de continuité : un système léger qui préserve le savoir, les décisions et le contexte d\'un projet entre les sessions IA — sans services cloud ni infrastructure lourde.',
	},
	benefits: {
		kicker: 'Pourquoi les développeurs choisissent toon-memory',
		title: 'Construit autour des vrais problèmes',
			subtitle: 'Pas une liste d\'outils — un ensemble de résultats.',
		groups: [
				{ icon: '🧭', title: 'Connaissance persistante du projet', items: ['Retient les décisions et les raisons qui les motivent', 'Retient l\'architecture et les conventions', 'S\'accumule entre les sessions — jamais réexpliqué'] },
				{ icon: '🔒', title: 'Confidentialité d\'abord', items: ['100% local — aucun cloud, aucun serveur, aucune télémétrie', 'Chiffrement AES-256-GCM optionnel', 'Vous possédez le fichier mémoire, comme n\'importe quel fichier source'] },
			{ icon: '⚡', title: 'Léger', items: ['Format TOON natif — 22% de tokens en moins que JSON', 'Zéro dépendance, fonctionne sur tout Node.js 18+', 'Logique déterministe — aucun appel LLM, aucune clé API'] },
				{ icon: '🛰️', title: 'Universel', items: ['Fonctionne avec 15+ agents : Claude Code, Codex, Gemini CLI, Cursor, OpenCode et plus', 'MCP standard — changez d\'agent sans perdre le contexte', 'Mémoire par projet partagée par toute l\'équipe'] },
		],
	},
	features: {
		cards: [
			{
			icon: '🧩',
			title: 'Un kit de mémoire, pas un protocole',
			body: 'Tout ce dont votre agent a besoin pour mémoriser, rappeler et raisonner — groupé par fonction, avec des ressources pour la lecture directe du contexte et un visualiseur de graphe interactif.',
				toolGroups: [
					{ label: 'Mémoire Principale', tools: ['memory_remember', 'memory_recall', 'memory_forget', 'memory_stats', 'memory_diff', 'memory_suggest', 'memory_summary', 'memory_archive', 'memory_checkpoint', 'memory_visualize', 'memory_pin', 'memory_unpin', 'memory_tag', 'memory_reflect', 'memory_promote'] },
					{ label: 'Recherche & Intelligence', tools: ['memory_smart_recall', 'memory_captured', 'memory_consolidate', 'memory_graph_path', 'memory_search'] },
					{ label: 'Briefing Contexte', tools: ['context_brief', 'context_generate', 'context_diff', 'context_focus', 'context_health', 'context_export'] },
					{ label: 'Compression', tools: ['memory_compress', 'memory_primer'] },
					{ label: 'Sessions', tools: ['memory_sessions', 'memory_merge_sessions'] },
					{ label: 'Synchronisation & Sécurité', tools: ['memory_export_gist', 'memory_import_gist', 'memory_encrypt', 'memory_decrypt', 'memory_backup'] },
				],
				wide: true,
			},
			{
				icon: '⭐',
				title: 'Multi-agent',
				body: 'Fonctionne avec tous les principaux agents de code IA. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue — zéro configuration.',
				tags: ['OpenCode', 'Claude', 'Cursor'],
			},
			{
				icon: '📄',
				title: 'Format TOON',
				body: '22% de tokens en moins que JSON (mesuré). Encodage personnalisé conçu pour la compréhension des LLMs et l\'efficacité des tokens.',
				stats: ['22% moins de tokens', '1.3x plus rapide à parser'],
			},
			{
				icon: '🔎',
				title: 'Rappel intelligent',
				body: 'Rappel basé sur le graph, rerangé par pertinence BM25 et centralité du graph (les hubs émergent même sans le mot de recherche). La décroissance par hop maintient le contexte distant bas. Le mode `compact` retourne des résultats avec indices numériques et extraits tronqués.',
				stats: ['BM25', 'Centralité', 'compact'],
			},
			{
				icon: '🧠',
				title: 'Mémoire intelligente',
				body: 'Inférence automatique de tags à partir d\'un vocabulaire intégré et des dépendances du projet, notation de qualité, scores de confiance, merge-dedup, suggestions d\'entrées liées, diff de mémoire et TTL configurable pour le contexte temporaire.',
				stats: ['Auto-tags', 'Qualité', 'Merge-dedup'],
			},
			{
				icon: '🔒',
				title: 'Chiffrement',
				body: 'AES-256-GCM pour les données sensibles. Archivage automatique des anciennes entrées. Mode watch pour sauvegarde automatique toutes les N minutes.',
				stats: ['AES-256-GCM', 'Auto-backup'],
			},
		],
	},
	agents: {
		title: 'Fonctionne avec 15+ agents de code IA',
		subtitle: 'Zéro configuration — toon-memory détecte et configure chacun automatiquement',
	},
	stats: {
		items: [
			{ number: '97.6%', label: 'Rappel depuis le top-5 (R@5 0.861)' },
			{ number: '15', label: 'Agents' },
			{ number: '80%', label: 'Moins d\'appels d\'outil/session' },
			{ number: '0', label: 'Configuration requise' },
		],
	},
	howItWorks: {
		title: 'Comment ça marche ?',
		subtitle: 'Quatre étapes de l\'amnésie à la mémoire',
		steps: [
			{ n: 1, title: 'Installer', body: 'Une commande. Zéro configuration pour 15+ agents.', code: 'npm install -g toon-memory' },
			{
				n: 2,
				title: 'Mémoriser',
				body: 'Enregistrez décisions, motifs et bugs au fur et à mesure — avec inférence automatique de tags et TTL optionnel.',
				code: `memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  file: "src/types.ts"
})`,
			},
			{
				n: 3,
				title: 'Rappeler',
				body: 'Votre agent interroge la mémoire à la demande — plus besoin de réexpliquer, plus de tokens gaspillés.',
				code: `memory_recall({ query: "validation" })
// [decision] use-zod (a1b2c3d4)
//   Use Zod for validation — src/types.ts`,
			},
			{
				n: 4,
				title: 'Contexte',
				body: 'Un seul appel donne à votre agent tout : projet, git, mémoire, sessions. 80% moins d\'appels d\'outil.',
				code: `context_generate({})
// # Project Briefing (full)
// ## Project — toon-memory v2.6.0
// ## Git — branch: main, 3 commits
// ## Memory — 26 entries, 18 edges
// ## Sessions — 2 active`,
			},
		],
	},
	tips: {
		title: 'Astuces mémoire',
		subtitle: 'Tirez le meilleur de toon-memory avec ces patterns',
		items: [
			{
				n: 1,
				title: 'Enregistrez les décisions immédiatement',
				body: 'Quand vous faites un choix, enregistrez-le tout de suite. Ajoutez le contexte du <em>pourquoi</em> vous avez choisi l\'option A plutôt que B — votre vous futur vous remerciera.',
			},
			{
				n: 2,
				title: 'Utilisez des clés cohérentes',
				body: 'Préfixez les clés par domaine : <code class="inline-code">db:redis-config</code>, <code class="inline-code">auth:jwt</code>. Accélère le rappel et évite les collisions.',
			},
			{
				n: 3,
				title: 'Les tags s\'infèrent automatiquement',
				body: 'Laissez les tags vides et le système les infère du contenu — redis, auth, api, db et 16+ catégories. Ou ajoutez-les manuellement pour un contrôle précis.',
			},
			{
				n: 4,
				title: 'Utilisez le TTL pour le contexte temporaire',
				body: 'Échéances, sprints, notes sensibles au temps — définissez un <code class="inline-code">ttl: "7d"</code> et elles expirent automatiquement. Pas de nettoyage manuel nécessaire.',
			},
		],
	},
	comparison: {
		title: 'Même projet. Deux sessions.',
		subtitle: 'Ce que votre agent retient change le résultat.',
		beforeTitle: 'Sans toon-memory',
		afterTitle: 'Avec toon-memory',
		thinkingBefore: 'Réflexion…',
		thinkingAfter: 'Rappel…',
		before: [
			{ session: 'Session 1' },
			{ user: 'Utilise Sequelize.' },
			{ assistant: 'OK.' },
			{ note: 'Conservé dans le contexte de session — les tokens s\'accumulent.', tone: 'warn' },
			{ session: 'Session 2' },
			{ user: 'Quel est notre ORM ?' },
			{ note: 'Aucune mémoire entre les sessions.', tone: 'error' },
			{ assistant: 'Je ne sais pas.' },
		],
			after: [
				{ session: 'Session 1' },
				{ user: 'Utilise Sequelize.' },
				{ cmd: '$ memory_remember({ category: "decision", key: "orm:sequelize", content: "Utiliser Sequelize comme ORM" })' },
				{ assistant: 'OK.' },
				{ note: 'Enregistré en mémoire.' },
			{ session: 'Session 2' },
			{ user: 'Quel est notre ORM ?' },
			{ note: 'Rappelé de la mémoire.' },
			{ assistant: 'Vous utilisez Sequelize.' },
		],
	},
	codeExamples: {
		quickExample: 'Exemple rapide',
		quickInstall: 'Installation rapide',
		exampleCode: `// Enregistrer une décision (avec inférence auto de tags)
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  file: "src/types.ts"
})
// 🏷️ Tags inférés : types

// Enregistrer avec TTL (expire dans 7 jours)
memory_remember({
  category: "knowledge",
  key: "sprint-deadline",
  content: "Sprint ends July 18",
  ttl: "7d"
})

// Voir les changements depuis la dernière session
memory_diff({ since: "24h" })

// Rechercher dans la mémoire
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20`,
		installCode: `# npm
npm install -g toon-memory

# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex`,
	},
	benchmarks: {
		title: 'Benchmarks',
		subtitle: 'Mesuré, pas supposé',
		tabs: { ranking: 'Qualité du classement', workflow: 'Économies de flux', format: 'Format TOON' },
		retrieval: {
			subtitle: 'Recherche type LongMemEval sur un snapshot figé de 187 entrées réelles — 42 gold queries',
			what: 'Le pipeline de recall unifié trouve la bonne entrée dans le top 5',
			metricLabel: 'Métrique',
			linear: 'Linéaire',
			rrf: 'RRF',
			smart: 'Unifié',
			metricRows: [
				{ metric: 'R@5', gloss: 'entrée gold dans le top 5', linear: '0.643', rrf: '0.861', smart: '0.829' },
				{ metric: 'nDCG@5', gloss: 'qualité du classement', linear: '0.654', rrf: '0.764', smart: '0.739' },
				{ metric: 'MRR@5', gloss: 'position du bon résultat', linear: '0.776', rrf: '0.788', smart: '0.760' },
			],
			result: '97,6 % des requêtes répondues depuis le top-5',
			note: 'Snapshot réel de <code>data.toon</code> (187 entrées, 2026-08-01), <code>today</code> déterministe, lecture seule et sans copies ; 2 méta-entrées priority exclues. Reproductible : <code>npm run bench:retrieval</code>.',
		},
		workflow: {
			subtitle: 'Économies de tokens et d\'appels mesurées sur une session réelle',
			stats: [
				{ num: '~90%', cap: 'moins de tokens (auto-loading)' },
				{ num: '80%', cap: 'moins d\'appels (25 → 5)' },
				{ num: '68%', cap: 'moins de tokens (recall compact)' },
				{ num: '58%', cap: 'moins de tokens (system primer)' },
				{ num: '14%', cap: 'moins de tokens (compression par lot)' },
			],
			note: 'Auto-loading : le plugin OpenCode injecte uniquement la mémoire pertinente au fichier au lieu de vider toutes les entrées. Session complète : démarrage → débogage → implémentation → révision → clôture. Reproductible : <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
		},
		format: {
			subtitle: 'Le format TOON est conçu pour les LLMs, pas pour les humains',
			stats: [
				{ num: '22.5%', cap: 'moins de tokens que JSON' },
				{ num: '30.5%', cap: 'sur une seule entrée' },
				{ num: '1.3x', cap: 'plus rapide à parser' },
			],
			note: 'Mesuré avec <code>gpt-tokenizer</code> (cl100k_base) sur 16 entrées de mémoire représentatives, comparant le format TOON réel sur disque au JSON compact. Reproductible : <code>npm run bench</code>.',
		},
	},
	tools: {
		title: 'Un kit mémoire complet',
		subtitle: 'Tout ce dont votre agent a besoin pour mémoriser, rappeler et raisonner',
		resourcesLabel: 'Ressources :',
		groups: {
			core: 'Mémoire Principale',
			search: 'Recherche & Intelligence',
			context: 'Briefing Contexte',
			compress: 'Compression',
			sessions: 'Sessions',
			sync: 'Synchronisation & Sécurité',
		},
		cards: [
			{ name: 'memory_remember', title: 'Enregistrer en mémoire', desc: 'Stockez décisions, motifs, bugs, connaissances ou warnings (mémoires négatives « ne PAS faire ceci », rappelées avec un boost) — persistant entre les sessions avec notation de qualité automatique.', group: 'core' },
			{ name: 'memory_recall', title: 'Rechercher en mémoire', desc: 'Interrogez le graphe de connaissances avant de lire les fichiers. Résultats pondérés par la qualité. Prend en charge path_scope et le contrôle de budget (tiny/normal/deep). explain: true ajoute une ligne de raison par entrée ; budget_tokens plafonne la sortie par tokens estimés.', group: 'core' },
			{ name: 'memory_forget', title: 'Supprimer de la mémoire', desc: 'Supprime des entrées par clé ou id.', group: 'core' },
			{ name: 'memory_stats', title: 'Statistiques', desc: 'Affiche les statistiques de la mémoire du projet, incluant la distribution de qualité, les entrées les plus consultées et les métriques de taux d\'accès/doublons/obsolètes.', group: 'core' },
			{ name: 'memory_diff', title: 'Diff de mémoire', desc: 'Voyez ce qui a changé depuis votre dernière session.', group: 'core' },
			{ name: 'memory_suggest', title: 'Suggérer des liés', desc: 'Affiche les entrées liées pour un contexte donné.', group: 'core' },
			{ name: 'memory_summary', title: 'Résumé de fichier', desc: 'Enregistrez ou récupérez un résumé de fichier pour économiser des tokens.', group: 'core' },
			{ name: 'memory_archive', title: 'Archiver les anciens', desc: 'Déplace les entrées de plus de 30 jours pour garder la mémoire propre.', group: 'core' },
			{ name: 'memory_smart_recall', title: 'Rappel intelligent', desc: 'Recherche unifiée combinant BM25 + centralité + qualité + fraîcheur en un seul appel. Prend en charge explain: true (raisons par entrée) et budget_tokens (limite de sortie).', group: 'search' },
			{ name: 'memory_captured', title: 'Activité capturée', desc: 'Affiche le journal d\'activité capturé par les hooks — promouvez les observations en mémoire.', group: 'search' },
			{ name: 'memory_consolidate', title: 'Consolider', desc: 'Fusionne les entrées en doublon avec un contenu identique, détecte les quasi-doublons via similarité de Jaccard (>50%), supprime par lot les entrées de faible qualité ou retire les entrées d\'anciennes versions de bibliothèque (mode: "versions") — via le paramètre mode, sans LLM.', group: 'search' },
			{ name: 'context_brief', title: 'Brief de contexte', desc: 'Brief de contexte en un appel : mémoire + sessions + santé en markdown compact. Zéro LLM.', group: 'context' },
			{ name: 'context_generate', title: 'Brief complet du projet', desc: 'Brief en un appel : structure du projet + état git + mémoire + sessions. Remplace 6 appels manuels. Économise 93% de tokens.', group: 'context' },
			{ name: 'context_diff', title: 'Brief incrémental', desc: 'Commits git + fichiers modifiés + mémoire nouvelle/mise à jour depuis la dernière session. Économise 72% de tokens.', group: 'context' },
			{ name: 'context_focus', title: 'Brief ciblé', desc: 'Mémoire pertinente + fichiers liés + appelants + fichiers de test pour une requête spécifique.', group: 'context' },
			{ name: 'context_health', title: 'Audit santé', desc: 'Liens orphelins, doublons, références cassées, TTL expirés, sessions obsolètes. Score 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Exporter en Markdown', desc: 'Exporte la mémoire en markdown injectable pour les system prompts. Économise 82% de tokens.', group: 'context' },
			{ name: 'memory_compress', title: 'Compression LLM', desc: 'Compression en deux étapes par LLM : résumer + écraser. Utilise Anthropic/OpenAI CLI si disponible.', group: 'compress' },
			{ name: 'memory_primer', title: 'Amorce de contexte', desc: 'Amorce de contexte en un appel : mémoires principales + catégories + modifications de fichiers de session. Injecté automatiquement au début de la session.', group: 'compress' },
			{ name: 'memory_sessions', title: 'Sessions', desc: 'Affiche les sessions agent actives et détecte les conflits doux.', group: 'sessions' },
			{ name: 'memory_merge_sessions', title: 'Fusionner les sessions', desc: 'Fusionne les observations entre sessions parallèles pour un fichier. Déduplique et promeut automatiquement.', group: 'sessions' },
			{ name: 'memory_export_gist', title: 'Exporter vers Gist', desc: 'Exporte les entrées mémoire vers un GitHub Gist (public ou privé). Utilise GITHUB_TOKEN ou gh CLI.', group: 'sync' },
			{ name: 'memory_import_gist', title: 'Importer depuis Gist', desc: 'Importe les entrées depuis un GitHub Gist. Fusionne avec les entrées existantes (union des tags, confiance maximale).', group: 'sync' },
			{ name: 'memory_encrypt', title: 'Activer le chiffrement', desc: 'Chiffrement AES-256-GCM avec clé auto-générée.', group: 'sync' },
			{ name: 'memory_decrypt', title: 'Désactiver le chiffrement', desc: 'Déchiffre et désactive le chiffrement.', group: 'sync' },
			{ name: 'memory_backup', title: 'Sauvegarder la mémoire', desc: 'Crée une sauvegarde horodatée du fichier mémoire. Auto-nettoyage aux 10 plus récents.', group: 'sync' },
			{ name: 'memory_pin', title: 'Épingler une entrée', desc: 'Épingle les entrées importantes pour qu\'elles apparaissent toujours en haut des résultats, même sans correspondance de mot-clé.', group: 'core' },
			{ name: 'memory_unpin', title: 'Détacher une entrée', desc: 'Supprime le marqueur d\'épingle d\'une entrée.', group: 'core' },
			{ name: 'memory_search', title: 'Recherche unifiée', desc: 'Recherche dans la mémoire avec filtres par catégorie, tags et plage de dates. Le filtre de tags utilise la logique ET.', group: 'search' },
			{ name: 'memory_tag', title: 'Opérations par lots', desc: 'Ajoute, supprime ou définit des tags sur une ou plusieurs entrées par key ou id en un seul appel.', group: 'core' },
			{ name: 'memory_reflect', title: 'Réflexion mémoire', desc: 'Classe de manière déterministe les entrées par obsolescence, qualité et sur-connectivité pour révéler ce qui mérite attention ou nettoyage. Zéro LLM.', group: 'core' },
			{ name: 'memory_promote', title: 'Promotion automatique', desc: 'Promeut les brouillons à faible confiance en entrées actives de manière déterministe (seuil 0.65, déduplication Jaccard > 0.5). dryRun par défaut.', group: 'core' },
		],
	},
	graphSection: {
		title: 'Votre mémoire, en graphe',
		subtitle:
			'Connectez les décisions à leurs specs, bugs et architecture. Le rappel retourne le bon contexte — pas seulement les correspondances de mots.',
		points: [
			'Connectez les entrées avec `links` ou références `[[key]]` — sans embeddings, sans LLM',
			'`memory_recall({ mode: "graph" })` étend un sous-graphe conscient des relations',
		],
		launchLabel: 'Ouvrir la visionneuse interactive',
	},
	viewerSection: {
		title: 'Visionneuse du graphe de mémoire',
		subtitle: 'Visualisez votre mémoire sous forme de graphe interactif à force dirigée. Voyez entrées, connexions, catégories et schémas d\'accès d\'un coup d\'œil.',
		capsLabel: 'Dans la visionneuse :',
		caps: ['Recherche', 'Recherche de chemin', 'Export PNG / SVG', 'Thèmes clair & sombre'],
		features: [
			'<strong>Visionneuse CLI :</strong> <code>npx toon-memory viewer</code> démarre un serveur HTTP',
			'<strong>Visionneuse inline MCP Apps :</strong> appelez <code>memory_visualize()</code> pour rendre le graphe directement dans les hôtes compatibles MCP Apps — sans serveur',
			'Survolez les nœuds pour des infobulles avec aperçu du contenu et score de qualité',
			'Cliquez pour sélectionner et centrer ; double-cliquez pour ouvrir les détails',
			'La recherche filtre les entrées et met en évidence les nœuds correspondants avec une lueur pulsante',
			'Le chercheur de chemins trouve et met en évidence la connexion la plus courte entre deux entrées',
			'Physique ajustable, thème sombre/clair, export PNG/SVG',
		],
	},
	smartRecallSection: {
		title: 'Rappel intelligent et économe en tokens',
		subtitle:
			'Le rappel est rerangé offline par pertinence BM25 et centralité du graphe — puis compressé en forme compacte quand les tokens comptent. Les scores de qualité et de fraîcheur boostent les meilleures entrées.',
		points: [
			'Scoring BM25 sur id + catégorie + key + contenu + tags',
			'La centralité du graphe fait émerger les hubs même sans le mot de recherche',
			'Le score de qualité (0-1) et la décroissance de fraîcheur boostent les meilleures entrées récentes',
			'`compact: true` → indices numériques, sans id/date/fichier, voisins en extrait',
		],
		standardCode: `memory_recall({ query: "riesgo", mode: "graph" })
[decision] risk-engine-priority (a1b2c3d4)
  The engine prioritizes risk over speed.
  File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01
  links: engine-arch`,
		compactCode: `memory_recall({ query: "riesgo", mode: "graph", compact: true })
[1] decision/risk-engine-priority
  The engine prioritizes risk over speed.
  tags: risk;spec · edges: ->2, ->3`,
		caption: 'Le mode compact conserve le même contexte en moins de tokens — le fichier .toon n\'est jamais modifié.',
	},
	faq: {
		title: 'Foire aux questions',
		subtitle: 'Tout ce que vous devez savoir pour donner une mémoire à votre agent',
		items: [
			{
				q: 'Qu\'est-ce que toon-memory ?',
				a: 'Une couche de mémoire persistante pour les agents de code IA avec 35 outils MCP. Elle stocke les décisions, motifs, bugs et contexte dans un format TOON compact pour que votre agent se souvienne de tout entre les sessions — avec 80% moins d\'appels d\'outil par session.',
			},
			{
				q: 'Quels agents sont supportés ?',
				a: 'OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex, Gemini, Zed, Antigravity, Aider, KiloCode, OpenClaw et Kiro — 15+ agents avec zéro configuration via le serveur MCP.',
			},
			{
				q: 'Comment mes données sont-elles stockées ?',
				a: 'Les entrées sont écrites dans un fichier TOON local (un format économe en tokens ~22% plus petit que JSON, mesuré). Vous possédez le fichier et pouvez le commit, le differ ou le sauvegarder comme n\'importe quel autre fichier source.',
			},
			{
				q: 'Ma mémoire est-elle chiffrée ?',
				a: 'Oui. Activez le chiffrement avec l\'outil memory_encrypt pour sécuriser les entrées sensibles avec AES-256-GCM. La clé est générée automatiquement et conservée localement.',
			},
			{
				q: 'Ça fonctionne hors ligne ?',
				a: 'Complètement. toon-memory tourne localement sans services externes ni comptes. Le mode watch crée même des sauvegardes automatiques selon un calendrier.',
			},
			{
				q: 'Plusieurs agents peuvent-ils partager la même mémoire ?',
				a: 'Oui. Comme la mémoire vit dans un fichier simple de votre projet, chaque agent configuré pour ce projet lit et écrit le même contexte.',
			},
			{
				q: 'Comment sauvegarder ma mémoire ?',
				a: 'Utilisez le mode watch pour des sauvegardes automatiques programmées, ou commitez simplement le fichier TOON dans git. Les anciennes entrées sont auto-archivées après 30 jours pour garder les choses propres.',
			},
			{
				q: 'C\'est gratuit et open source ?',
				a: 'Oui. toon-memory est sous licence MIT et gratuit. Le code source est sur GitHub et le package est publié sur npm.',
			},
			{
				q: 'Comment est-ce différent de la mémoire intégrée de mon agent ?',
				a: 'La mémoire intégrée est souvent éphémère ou spécifique au fournisseur. toon-memory vous donne un fichier mémoire portable, diffable et chiffré que vous contrôlez totalement — entre agents et projets.',
			},
			{
				q: 'Puis-je faire expirer le contexte temporaire ?',
				a: 'Oui. Définissez un TTL (ex : ttl: "7d") sur n\'importe quelle entrée et elle expire automatiquement — parfait pour les sprints, échéances et notes sensibles au temps.',
			},
			{
				q: 'Qu\'est-ce que le rappel intelligent ?',
				a: 'memory_smart_recall combine la recherche BM25 par mots-clés, la centralité du graphe, la notation de qualité et la décroissance de fraîcheur en un seul appel — le meilleur de toutes les stratégies de classement sans orchestration manuelle.',
			},
			{
				q: 'Comment fonctionne la notation de qualité ?',
				a: 'Chaque entrée reçoit automatiquement un score de qualité (0-1) basé sur la couverture des tags, la richesse des liens, le détail du contenu, la fraîcheur et la spécificité. Les entrées de haute qualité apparaissent en premier dans les résultats de rappel.',
			},
			{
				q: 'Que se passe-t-il si j\'enregistre la même clé deux fois ?',
				a: 'Le système fusionne les attributs au lieu de remplacer : les tags et liens sont unis, la qualité et la confiance prennent le maximum, et la date est mise à jour. Votre entrée s\'enrichit avec le temps.',
		},
		{
			q: 'Que se passe-t-il si j\'enregistre la même clé deux fois ?',
			a: 'Le système fusionne les attributs au lieu de remplacer : les tags et liens sont unis, la qualité et la confiance prennent le maximum, et la date est mise à jour. Votre entrée s\'enrichit avec le temps.',
		},
		{
			q: 'Qu\'est-ce que la compression mémoire ?',
			a: 'memory_compress permet à un LLM de résumer des entrées similaires en un résumé concis. memory_consolidate(mode: "low-quality") supprime les entrées de faible qualité (pas de tags, contenu court) de manière déterministe — sans LLM. Les deux réduisent le nombre de tokens.',
		},
		{
			q: 'Puis-je synchroniser la mémoire entre machines ?',
			a: 'Oui. Utilisez memory_export_gist pour pousser les entrées vers un GitHub Gist, puis memory_import_gist sur une autre machine. Les entrées fusionnent automatiquement (union des tags, confiance maximale).',
		},
	],
},
whatNew: {
	title: 'Nouveautés dans v4.3.0',
	subtitle: 'Niveaux d\'importance explicites, plus Explain WHY, budgets de tokens, remplacement par version et classement plus intelligent',
	cards: [
		{
			icon: '🎯',
			title: 'Importance explicite',
			body: '`memory_remember({ importance })` définit `critical`, `high`, `medium` ou `low` — les décisions critiques remontent en premier (+0.3), les notes de faible importance restent discrètes (−0.1). Vide = automatique (récence + fréquence).',
			stats: ['critical +0.3', 'high +0.15', 'low −0.1'],
		},
		{
			icon: '🤔',
			title: 'Explain WHY',
			body: '`memory_recall`/`memory_smart_recall` acceptent `explain: true` et ajoutent une ligne de raison déterministe (`↳ 100% relevance · used 14× · used today · importance HIGH`) à chaque entrée retournée — *pourquoi* elle a été récupérée, sans LLM.',
			stats: ['↳ ligne de raison', 'sans LLM'],
		},
		{
			icon: '🧮',
			title: 'Budgets de tokens',
			body: '`budget_tokens` plafonne la sortie du rappel par estimation du nombre de tokens ; les entrées s\'accumulent de manière gourmande et la queue qui dépasserait le budget est abandonnée (`0` = pas de limite).',
			stats: ['0 = pas de limite', 'abandon gourmand'],
		},
		{
			icon: '🔄',
			title: 'Remplacement par version',
			body: '`memory_consolidate(mode: "versions")` détecte les entrées décrivant le même sujet à différentes versions de bibliothèque (par ex. « Utilisez React 18 » vs « Utilisez React 19 ») et retire les plus anciennes en faveur de la plus récente.',
			stats: ['mode "versions"', 'dryRun'],
		},
		{
			icon: '🚫',
			title: 'Mémoires négatives',
			body: 'Une catégorie `warning` pour les faits « ne PAS faire ceci » — anti-modèles et pièges. Les entrées `warning` reçoivent un boost de rappel pour que l\'agent voie les erreurs avant de les répéter.',
			stats: ['boost warning', 'anti-modèles'],
		},
		{
			icon: '📊',
			title: 'Statistiques étendues',
			body: '`memory_stats` rapporte désormais le taux d\'accès (% d\'entrées rappelées au moins une fois), les doublons (% de doublons de contenu exact) et les entrées obsolètes (% d\'entrées obsolètes).',
			stats: ['taux d\'accès', 'doublons', 'obsolètes'],
		},
		{
			icon: '🎯',
			title: 'Classement plus intelligent',
			body: 'Le rappel ajoute un boost de famille de langue (+0.1) pour les entrées écrites dans la même écriture (latin/CJK/cyrillique/…) et un boost de correspondance de dossier (+0.05) quand `path_scope` correspond au fichier courant.',
			stats: ['langue +0.1', 'dossier +0.05'],
		},
	],
},
cta: {
	title: 'Prêt à donner de la continuité à votre agent ?',
	subtitle: 'Installez en quelques secondes et ne réexpliquez plus jamais votre projet.',
	getStarted: 'Commencer',
	viewGithub: 'Voir sur GitHub',
},
	footer: {
		text: 'Licence MIT — ',
		odalx: 'Un projet open source de ODALX',
		odalxTag: "Construire l'infrastructure de l'ère native IA.",
	},
},
} as const;

export type Lang = keyof typeof content;

export function getContent(lang: string): (typeof content)[Lang] {
	return (content as Record<string, (typeof content)[Lang]>)[lang] ?? content.en;
}
