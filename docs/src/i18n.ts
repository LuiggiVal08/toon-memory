export const content = {
	en: {
		nav: {
			docs: 'Docs',
			npm: 'npm',
			github: 'GitHub',
		},
		hero: {
			tagline: 'MCP memory server for AI coding agents — recall context across sessions',
			subtitle: 'Your agent remembers decisions, patterns, and bugs between sessions.',
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
		features: {
			cards: [
			{
				icon: '🧩',
				title: '35 MCP Tools + 4 Resources',
				body: 'Full memory management via MCP — remember, recall, forget, stats, summary, archive, diff, suggest, smart_recall, encrypt, decrypt, captured, checkpoint, consolidate, sessions, compress, compress_all, primer, merge_sessions, export_gist, import_gist, merge_similar, graph_path, context_brief, context_generate, context_diff, context_focus, context_health, context_export, visualize, pin, unpin, search, tag. Plus resources for direct context reading including an interactive graph viewer.',
				tags: ['remember', 'recall', 'context', 'diff'],
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
				{ number: '35', label: 'MCP Tools' },
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
// ## Project — toon-memory v3.0.0
// ## Git — branch: main, 3 commits
// ## Memory — 30 entries, 18 edges
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
			title: 'Before vs After',
			subtitle: 'See how toon-memory changes your workflow',
			beforeTitle: 'Before',
			afterTitle: 'After',
			before: [
				'Repeat explanations every session',
				'Forget why a decision was made',
				'Hunt through git history for context',
				'Copy-paste notes between chats',
			],
			after: [
				'Agent remembers everything',
				'One call gives full project context',
				'80% fewer tool calls per session',
				'Zero context loss between sessions',
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
		tokenSavings: {
			title: '22% fewer tokens, by design',
			subtitle: 'The TOON format is built for LLMs, not for humans',
			stats: [
				{ num: '22.5%', cap: 'fewer tokens than JSON' },
				{ num: '30.5%', cap: 'on a single entry' },
				{ num: '1.3x', cap: 'faster to parse' },
			],
			note: 'Measured with <code>gpt-tokenizer</code> (cl100k_base) over 16 representative memory entries, comparing the real on-disk TOON format against compact JSON. Reproducible: <code>npm run bench</code>.',
		},
		benchmarks: {
			title: 'Benchmarks',
			subtitle: 'Token efficiency of the TOON format — measured, not assumed',
			fewerTokens: 'fewer tokens than JSON',
			onSingle: 'on a single entry',
			entriesMeasured: 'entries measured',
			note: 'Measured with <code>gpt-tokenizer</code> (cl100k_base) over 16 representative memory entries, comparing the real on-disk TOON format against compact JSON. Reproducible: <code>npm run bench</code>.',
		},
		impactSection: {
			title: 'Up to 90% fewer tokens per interaction',
			subtitle:
				'Five benchmarks: auto-loading saves ~90%, compact recall saves 68%, full session saves 80% tool calls, system primer saves 58%, batch compression saves 14%.',
			stats: [
				{ num: '~90%', cap: 'fewer tokens (auto-loading)' },
				{ num: '80%', cap: 'fewer tool calls (25 → 5)' },
				{ num: '68%', cap: 'fewer tokens (compact recall)' },
				{ num: '58%', cap: 'fewer tokens (system primer)' },
				{ num: '14%', cap: 'fewer tokens (batch compress)' },
			],
			note: 'Auto-loading benchmark: OpenCode plugin injects only file-relevant memory instead of dumping all entries. Full session: start → debug → implement → review → wrap-up. Reproducible: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
		},
		tools: {
			title: '35 MCP tools, 4 resources',
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
				{ name: 'memory_remember', title: 'Save to Memory', desc: 'Store decisions, patterns, bugs, or knowledge — persisted across sessions with auto quality scoring.', group: 'core' },
				{ name: 'memory_recall', title: 'Search Memory', desc: 'Query the knowledge graph before reading files. Quality-weighted results.', group: 'core' },
				{ name: 'memory_forget', title: 'Delete from Memory', desc: 'Remove an entry by key or id.', group: 'core' },
				{ name: 'memory_stats', title: 'Memory Stats', desc: 'Show statistics about the project memory, including quality distribution and most accessed entries.', group: 'core' },
				{ name: 'memory_diff', title: 'Memory Diff', desc: 'See what changed since your last session.', group: 'core' },
				{ name: 'memory_suggest', title: 'Suggest Related', desc: 'Surface related entries for a given context.', group: 'core' },
				{ name: 'memory_summary', title: 'File Summary', desc: 'Save or retrieve a file summary to save tokens.', group: 'core' },
				{ name: 'memory_archive', title: 'Archive Old', desc: 'Move entries older than 30 days to keep memory clean.', group: 'core' },
				{ name: 'memory_smart_recall', title: 'Smart Recall', desc: 'Unified search combining BM25 + graph centrality + quality score + freshness + session bias in one call.', group: 'search' },
				{ name: 'memory_captured', title: 'Captured Activity', desc: 'View auto-captured hook activity log — promote observations to memory.', group: 'search' },
				{ name: 'memory_checkpoint', title: 'Session Checkpoint', desc: 'Snapshot the current memory state with 7d TTL — rollback reference for long sessions.', group: 'core' },
				{ name: 'memory_consolidate', title: 'Consolidate', desc: 'Merge duplicate entries with identical content deterministically.', group: 'search' },
				{ name: 'memory_merge_similar', title: 'Merge Similar', desc: 'Find and merge near-duplicates via Jaccard similarity (>50%). Deterministic, no LLM — deduplicates your memory in one pass.', group: 'search' },
				{ name: 'memory_graph_path', title: 'Graph Path', desc: 'BFS shortest-path between two entries. Trace knowledge chains across your graph without embeddings or LLM.', group: 'search' },
				{ name: 'context_brief', title: 'Context Briefing', desc: 'One-call context briefing: memory + sessions + health in compact markdown. Zero LLM.', group: 'context' },
				{ name: 'context_generate', title: 'Full Project Briefing', desc: 'One-call briefing: project structure + git state + memory + sessions. Replaces 6 manual calls. Saves 93% tokens.', group: 'context' },
				{ name: 'context_diff', title: 'Incremental Briefing', desc: 'Git commits + modified files + new/updated memory since last session. Saves 72% tokens.', group: 'context' },
				{ name: 'context_focus', title: 'Targeted Briefing', desc: 'Relevant memory + related files + callers + test files for a specific query.', group: 'context' },
				{ name: 'context_health', title: 'Health Audit', desc: 'Orphan links, duplicates, broken file refs, expired TTL, stale sessions. Score 0–100.', group: 'context' },
				{ name: 'context_export', title: 'Export as Markdown', desc: 'Export memory as injectable markdown for system prompts. Saves 82% tokens.', group: 'context' },
				{ name: 'memory_compress', title: 'LLM Compress', desc: 'LLM-powered two-step compression: summarize + overwrite. Uses Anthropic/OpenAI CLI if available.', group: 'compress' },
				{ name: 'memory_compress_all', title: 'Batch Compress', desc: 'Batch compression: overwrites all entries under 100 tokens with a compressed version. Deterministic, no LLM.', group: 'compress' },
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
			],
		},
		graphSection: {
			title: 'Your memory, as a graph',
			subtitle:
				'Connect decisions to their specs, bugs, and architecture. Recall returns the right context — not just keyword matches.',
			points: [
				'Link entries with `links` or `[[key]]` refs — no embeddings, no LLM',
				'`memory_recall({ mode: "graph" })` expands a relationship-aware subgraph',
				'Fewer tokens, higher precision, fully offline and deterministic',
			],
			caption: 'A decision ripples to its spec and architecture — the agent sees the whole picture.',
		},
		viewerSection: {
			title: 'Memory Graph Viewer',
			subtitle: 'Visualize your memory as an interactive force-directed graph. See entries, connections, categories, and access patterns at a glance.',
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
					a: 'A persistent memory layer for AI coding agents with 34 MCP tools. It stores decisions, patterns, bugs, and context in a compact TOON format so your agent remembers everything between sessions — with 80% fewer tool calls per session.',
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
					a: 'memory_compress lets an LLM summarize related entries into one concise summary. memory_compress_all removes low-quality entries (no tags, short content) deterministically — no LLM needed. Both reduce token count.',
				},
				{
					q: 'Can I sync memory across machines?',
					a: 'Yes. Use memory_export_gist to push entries to a GitHub Gist, then memory_import_gist on another machine. Entries merge automatically (union of tags, max confidence).',
				},
			],
		},
		whatNew: {
			title: "What's New in v3.5.0",
			subtitle: 'Priority pin, session checkpoints, session bias, cold memories, detailed merge preview',
			cards: [
				{
					icon: '📌',
					title: 'Priority Pinning',
					body: 'Pin entries with priority 1-5 — higher priority entries appear first in recall results sorted by priority. Backward compatible with old pinned boolean.',
					stats: ['1-5 priority', 'Sorted', 'Backward compatible'],
				},
				{
					icon: '⏱️',
					title: 'Session Checkpoint',
					body: 'Create a snapshot of current memory state with 7d TTL. Useful for rollback reference during long complex sessions. Use memory_checkpoint.',
					stats: ['memory_checkpoint', '7d TTL', 'Rollback'],
				},
				{
					icon: '🧬',
					title: 'Session Bias in Recall',
					body: 'memory_recall, memory_search, and memory_smart_recall now accept sessionBias parameter — boosts entries from the current git branch above others.',
					stats: ['sessionBias', 'Git branch', 'Smart recall'],
				},
				{
					icon: '🥶',
					title: 'Cold Memories in Stats',
					body: 'memory_stats now shows cold memories — entries below quality and access thresholds — so you know what to archive or improve.',
					stats: ['memory_stats', 'Cold memories', 'Quality threshold'],
				},
				{
					icon: '🔍',
					title: 'Detailed Merge Preview',
					body: 'memory_merge_similar dryRun: true now shows which entries would merge, which stay, and how content and tags combine — no surprises.',
					stats: ['dryRun', 'Merge preview', 'No surprises'],
				},
				{
					icon: '🧩',
					title: '35 MCP Tools + 4 Resources',
					body: 'Adds memory_checkpoint. Updates memory_pin with priority (1-5). Total: 35 tools + 4 resources.',
					stats: ['+1 tool', '35 total'],
				},
			],
		},
		cta: {
			title: 'Ready to give your agent a memory?',
			subtitle: 'Install in seconds and never re-explain context to your agent again.',
			getStarted: 'Get Started',
			viewGithub: 'View on GitHub',
		},
		footer: {
			text: 'MIT License — ',
		},
	},
	es: {
		nav: {
			docs: 'Documentación',
			npm: 'npm',
			github: 'GitHub',
		},
		hero: {
			tagline: 'Servidor de memoria MCP para agentes de IA — recupera contexto entre sesiones',
			subtitle: 'Tu agente recuerda decisiones, patrones y bugs entre sesiones.',
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
		features: {
			cards: [
			{
				icon: '🧩',
				title: '35 herramientas MCP + 4 recursos',
				body: 'Gestión completa de memoria vía MCP — remember, recall, forget, stats, summary, archive, diff, suggest, smart_recall, encrypt, decrypt, captured, checkpoint, consolidate, sessions, compress, compress_all, primer, merge_sessions, export_gist, import_gist, merge_similar, graph_path, context_brief, context_generate, context_diff, context_focus, context_health, context_export, visualize, pin, unpin, search, tag. Más recursos para lectura directa de contexto.',
				tags: ['remember', 'recall', 'context', 'diff'],
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
				{ number: '35', label: 'Herramientas MCP' },
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
// ## Proyecto — toon-memory v2.6.0
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
			title: 'Antes vs Después',
			subtitle: 'Mira cómo toon-memory cambia tu flujo de trabajo',
			beforeTitle: 'Antes',
			afterTitle: 'Después',
			before: [
				'Repites explicaciones en cada sesión',
				'Olividas por qué se tomó una decisión',
				'Rebuscas en el historial de git el contexto',
				'Copias y pegas notas entre chats',
			],
			after: [
				'El agente recuerda todo',
				'Una llamada da el contexto completo del proyecto',
				'80% menos tool calls por sesión',
				'Cero pérdida de contexto entre sesiones',
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
		tokenSavings: {
			title: '22% menos tokens, por diseño',
			subtitle: 'El formato TOON está hecho para LLMs, no para humanos',
			stats: [
				{ num: '22.5%', cap: 'menos tokens que JSON' },
				{ num: '30.5%', cap: 'en una sola entrada' },
				{ num: '1.3x', cap: 'más rápido de parsear' },
			],
			note: 'Medido con <code>gpt-tokenizer</code> (cl100k_base) sobre 16 entradas de memoria representativas, comparando el formato TOON real en disco contra JSON compacto. Reproducible: <code>npm run bench</code>.',
		},
		benchmarks: {
			title: 'Benchmarks',
			subtitle: 'Eficiencia de tokens del formato TOON — medida, no asumida',
			fewerTokens: 'menos tokens que JSON',
			onSingle: 'en una sola entrada',
			entriesMeasured: 'entradas medidas',
			note: 'Medido con <code>gpt-tokenizer</code> (cl100k_base) sobre 16 entradas de memoria representativas, comparando el formato TOON real en disco contra JSON compacto. Reproducible: <code>npm run bench</code>.',
		},
		impactSection: {
			title: 'Hasta 90% menos tokens por interacción',
			subtitle:
				'Cinco benchmarks: auto-carga ahorra ~90%, recall compacto ahorra 68%, sesión completa ahorra 80% tool calls, system primer ahorra 58%, compresión por lotes ahorra 14%.',
			stats: [
				{ num: '~90%', cap: 'menos tokens (auto-carga)' },
				{ num: '80%', cap: 'menos tool calls (25 → 5)' },
				{ num: '68%', cap: 'menos tokens (recall compacto)' },
				{ num: '58%', cap: 'menos tokens (system primer)' },
				{ num: '14%', cap: 'menos tokens (compresión por lotes)' },
			],
			note: 'Benchmark de auto-carga: el plugin de OpenCode inyecta solo memoria relevante al file path en vez de volcar todas las entradas. Sesión completa: inicio → debug → implementar → revisar → cerrar. Reproducible: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
		},
	tools: {
		title: '35 herramientas MCP, 4 recursos',
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
			{ name: 'memory_remember', title: 'Guardar en memoria', desc: 'Almacena decisiones, patrones, bugs o conocimiento — persistente entre sesiones con puntuación de calidad automática.', group: 'core' },
			{ name: 'memory_recall', title: 'Buscar en memoria', desc: 'Consulta el grafo de conocimiento antes de leer archivos. Resultados ponderados por calidad.', group: 'core' },
			{ name: 'memory_forget', title: 'Eliminar de memoria', desc: 'Elimina una entrada por key o id.', group: 'core' },
			{ name: 'memory_stats', title: 'Estadísticas', desc: 'Muestra estadísticas sobre la memoria del proyecto, incluyendo distribución de calidad y entradas más accedidas.', group: 'core' },
			{ name: 'memory_diff', title: 'Diff de memoria', desc: 'Mira qué cambió desde tu última sesión.', group: 'core' },
			{ name: 'memory_suggest', title: 'Sugerir relacionados', desc: 'Muestra entradas relacionadas para un contexto dado.', group: 'core' },
			{ name: 'memory_summary', title: 'Resumen de archivo', desc: 'Guarda o recupera un resumen de archivo para ahorrar tokens.', group: 'core' },
			{ name: 'memory_archive', title: 'Archivar antiguos', desc: 'Mueve entradas de más de 30 días para mantener la memoria limpia.', group: 'core' },
			{ name: 'memory_smart_recall', title: 'Recuperación inteligente', desc: 'Búsqueda unificada combinando BM25 + centralidad + calidad + frescura + sesgo de sesión en una sola llamada.', group: 'search' },
			{ name: 'memory_captured', title: 'Actividad capturada', desc: 'Muestra el log de actividad capturado por hooks — promueve observaciones a memoria.', group: 'search' },
			{ name: 'memory_checkpoint', title: 'Punto de control', desc: 'Crea una instantánea del estado actual de memoria con TTL de 7d. Útil para referencia de restauración durante sesiones largas.', group: 'core' },
			{ name: 'memory_consolidate', title: 'Consolidar', desc: 'Combina entradas duplicadas con contenido idéntico de forma determinista.', group: 'search' },
			{ name: 'memory_merge_similar', title: 'Fusionar similares', desc: 'Encuentra y fusiona casi-duplicados vía similitud Jaccard (>50%). Determinístico, sin LLM — limpia tu memoria de un solo paso.', group: 'search' },
			{ name: 'memory_graph_path', title: 'Ruta del grafo', desc: 'BFS shortest-path entre dos entradas. Traza cadenas de conocimiento a través de tu grafo sin embeddings ni LLM.', group: 'search' },
			{ name: 'context_brief', title: 'Briefing de contexto', desc: 'Briefing de contexto en una sola llamada: memoria + sesiones + salud en markdown compacto. Cero LLM.', group: 'context' },
			{ name: 'context_generate', title: 'Briefing completo', desc: 'Briefing en una llamada: estructura del proyecto + estado git + memoria + sesiones. Reemplaza 6 llamadas manuales. Ahorra 93% tokens.', group: 'context' },
			{ name: 'context_diff', title: 'Briefing incremental', desc: 'Commits git + archivos modificados + memoria nueva/actualizada desde la última sesión. Ahorra 72% tokens.', group: 'context' },
			{ name: 'context_focus', title: 'Briefing dirigido', desc: 'Memoria relevante + archivos relacionados + callers + archivos de test para una query específica.', group: 'context' },
			{ name: 'context_health', title: 'Auditoría de salud', desc: 'Links huérfanos, duplicados, referencias rotas, TTL expirados, sesiones obsoletas. Puntaje 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Exportar como Markdown', desc: 'Exporta memoria como markdown inyectable para system prompts. Ahorra 82% tokens.', group: 'context' },
			{ name: 'memory_compress', title: 'Compresión con LLM', desc: 'Compresión con LLM en dos pasos: resumir + sobrescribir. Usa Anthropic/OpenAI CLI si están disponibles.', group: 'compress' },
			{ name: 'memory_compress_all', title: 'Compresión por lotes', desc: 'Compresión por lotes: sobrescribe entradas bajo 100 tokens con versión comprimida. Determinístico, sin LLM.', group: 'compress' },
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
		],
	},
		graphSection: {
			title: 'Tu memoria, como un grafo',
			subtitle:
				'Conecta decisiones con sus specs, bugs y arquitectura. El recall devuelve el contexto correcto, no solo coincidencias de palabras.',
			points: [
				'Enlaza entries con `links` o referencias `[[key]]` — sin embeddings, sin LLM',
				'`memory_recall({ mode: "graph" })` expande un subgrafo consciente de las relaciones',
				'Menos tokens, más precisión, 100% offline y determinista',
			],
			caption: 'Una decisión se propaga a su spec y arquitectura — el agente ve el cuadro completo.',
		},
		viewerSection: {
			title: 'Visor del grafo de memoria',
			subtitle: 'Visualiza tu memoria como un grafo interactivo de fuerza dirigida. Ve entradas, conexiones, categorías y patrones de acceso de un vistazo.',
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
				a: 'memory_compress permite a un LLM resumir entradas relacionadas en un resumen conciso. memory_compress_all elimina entradas de baja calidad (sin tags, contenido corto) de forma determinista — sin LLM. Ambas reducen el conteo de tokens.',
			},
			{
				q: '¿Puedo sincronizar la memoria entre máquinas?',
				a: 'Sí. Usa memory_export_gist para subir entradas a un GitHub Gist, luego memory_import_gist en otra máquina. Las entradas se fusionan automáticamente (unión de tags, confianza máxima).',
			},
		],
	},
	whatNew: {
		title: 'Novedades en v3.5.0',
		subtitle: 'Pin con prioridad, puntos de control, sesgo de sesión, memorias frías, vista previa detallada de fusión',
		cards: [
			{
				icon: '📌',
				title: 'Pin con Prioridad',
				body: 'Fija entradas con prioridad 1-5 — las entradas con mayor prioridad aparecen primero en resultados de recall ordenadas por prioridad. Compatible con el pin booleano anterior.',
				stats: ['Prioridad 1-5', 'Ordenado', 'Compatibilidad'],
			},
			{
				icon: '⏱️',
				title: 'Punto de Control',
				body: 'Crea una instantánea del estado actual de memoria con TTL de 7d. Útil para referencia de restauración durante sesiones complejas largas. Usa memory_checkpoint.',
				stats: ['memory_checkpoint', 'TTL 7d', 'Restauración'],
			},
			{
				icon: '🧬',
				title: 'Sesgo de Sesión en Recall',
				body: 'memory_recall, memory_search y memory_smart_recall ahora aceptan sessionBias — potencia entradas de la rama git actual sobre otras.',
				stats: ['sessionBias', 'Rama git', 'Smart recall'],
			},
			{
				icon: '🥶',
				title: 'Memorias Frías en Stats',
				body: 'memory_stats ahora muestra memorias frías — entradas por debajo de umbrales de calidad y acceso — para que sepas qué archivar o mejorar.',
				stats: ['memory_stats', 'Memorias frías', 'Umbral calidad'],
			},
			{
				icon: '🔍',
				title: 'Vista Previa Detallada de Fusión',
				body: 'memory_merge_similar dryRun: true ahora muestra qué entradas se fusionarían, cuáles se quedan, y cómo se combinan contenido y tags — sin sorpresas.',
				stats: ['dryRun', 'Vista previa', 'Sin sorpresas'],
			},
			{
				icon: '🧩',
				title: '35 Herramientas MCP + 4 Recursos',
				body: 'Añade memory_checkpoint. Actualiza memory_pin con prioridad (1-5). Total: 35 herramientas + 4 recursos.',
				stats: ['+1 herramienta', '35 total'],
			},
		],
	},
	cta: {
		title: '¿Listo para darle memoria a tu agente?',
		subtitle: 'Instálalo en segundos y nunca más repitas contexto a tu agente.',
		getStarted: 'Empezar',
		viewGithub: 'Ver en GitHub',
	},
		footer: {
			text: 'Licencia MIT — ',
		},
	},
	zh: {
	nav: {
		docs: '文档',
		npm: 'npm',
		github: 'GitHub',
	},
	hero: {
		tagline: '面向 AI 编程代理的 MCP 记忆服务器 — 跨会话召回上下文',
		subtitle: '你的代理在会话之间记住决策、模式和 bug。',
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
	features: {
		cards: [
			{ icon: '🧩', title: '34 个 MCP 工具 + 4 个资源', body: '通过 MCP 实现完整的记忆管理 — remember、recall、forget、stats、summary、archive、diff、suggest、smart_recall、encrypt、decrypt、captured、consolidate、sessions、compress、compress_all、primer、merge_sessions、export_gist、import_gist、merge_similar、graph_path、context_brief、context_generate、context_diff、context_focus、context_health、context_export、visualize、pin、unpin、search、tag。外加直接上下文读取的资源。', tags: ['remember', 'recall', 'context', 'diff'] },
			{ icon: '⭐', title: '多代理', body: '支持所有主流 AI 编程代理。OpenCode、VS Code、Claude、Cursor、Windsurf、Cline、Continue — 零配置。', tags: ['OpenCode', 'Claude', 'Cursor'] },
			{ icon: '📄', title: 'TOON 格式', body: '比 JSON 减少 22% 的 token（实测）。自定义编码专为 LLM 理解和 token 效率设计。', stats: ['减少 22% token', '解析速度提升 1.3x'] },
			{ icon: '🔎', title: '智能召回', body: '基于图的召回按 BM25 相关性和图中心性重新排序（中心节点即使不包含查询词也会浮现）。按跳数衰减保持远距离上下文较低。Token 高效的 `compact` 模式返回数字索引、片段截断的结果。', stats: ['BM25', '中心性', 'compact'] },
			{ icon: '🧠', title: '智能记忆', body: '从内置词汇表和项目依赖自动推断标签、质量评分、置信度评分、合并去重、相关条目建议、记忆 diff，以及可配置的临时上下文 TTL。', stats: ['自动标签', '质量评分', '合并去重'] },
			{ icon: '🔒', title: '加密', body: 'AES-256-GCM 保护敏感数据。自动归档旧条目。Watch 模式每隔 N 分钟自动备份。', stats: ['AES-256-GCM', '自动备份'] },
		],
	},
	agents: { title: '支持 15+ 个 AI 编程代理', subtitle: '零配置 — toon-memory 自动检测并配置每个代理' },
	stats: { items: [{ number: '31', label: 'MCP 工具' }, { number: '15', label: '代理' }, { number: '80%', label: '每次会话减少工具调用' }, { number: '0', label: '所需配置' }] },
	howItWorks: {
		title: '它是如何工作的？',
		subtitle: '从失忆到记忆的四个步骤',
		steps: [
			{ n: 1, title: '安装', body: '一条命令。15+ 个代理零配置。', code: 'npm install -g toon-memory' },
			{ n: 2, title: '记忆', body: '在工作时保存决策、模式和 bug — 支持自动标签推断和可选 TTL。', code: 'memory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})' },
			{ n: 3, title: '召回', body: '你的代理按需查询记忆 — 无需重复解释，不浪费 token。', code: 'memory_recall({ query: "validation" })\n// [decision] use-zod (a1b2c3d4)\n//   Use Zod for validation — src/types.ts' },
			{ n: 4, title: '上下文', body: '一次调用为你的代理提供全部信息：项目、git、记忆、会话。减少 80% 的工具调用。', code: 'context_generate({})\n// # Project Briefing (full)\n// ## Project — toon-memory v2.6.0\n// ## Git — branch: main, 3 commits\n// ## Memory — 26 entries, 18 edges\n// ## Sessions — 2 active' },
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
		title: '之前 vs 之后', subtitle: '看看 toon-memory 如何改变你的工作流程', beforeTitle: '之前', afterTitle: '之后',
		before: ['每次会话都要重复解释', '忘记为什么做了某个决策', '在 git 历史中搜寻上下文', '在聊天之间复制粘贴笔记'],
		after: ['代理记住一切', '一次调用获得完整项目上下文', '每次会话减少 80% 的工具调用', '会话之间零上下文丢失'],
	},
	codeExamples: {
		quickExample: '快速示例', quickInstall: '快速安装',
		exampleCode: '// 保存决策（自动标签推断）\nmemory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})\n// 🏷️ Tags inferred: types\n\n// 带 TTL 保存（7 天后过期）\nmemory_remember({\n  category: "knowledge",\n  key: "sprint-deadline",\n  content: "Sprint ends July 18",\n  ttl: "7d"\n})\n\n// 查看自上次会话以来的变化\nmemory_diff({ since: "24h" })\n\n// 搜索记忆\nmemory_recall({ query: "redis" })\n// [bug] redis-pool-fix (i9j0k1l2)\n//   Added max_connections=20',
		installCode: '# npm\nnpm install -g toon-memory\n\n# macOS / Linux\ncurl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh\n\n# Windows (PowerShell)\nirm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex',
	},
	tokenSavings: {
		title: '减少 22% 的 token，设计如此', subtitle: 'TOON 格式专为 LLM 设计，而非人类',
		stats: [{ num: '22.5%', cap: '比 JSON 减少 token' }, { num: '30.5%', cap: '单条条目' }, { num: '1.3x', cap: '解析更快' }],
		note: '使用 <code>gpt-tokenizer</code>（cl100k_base）在 16 条代表性记忆条目上测量，比较实际磁盘上的 TOON 格式与紧凑 JSON。可复现：<code>npm run bench</code>。',
	},
	benchmarks: {
		title: '基准测试', subtitle: 'TOON 格式的 token 效率 — 实测而非假设',
		fewerTokens: '比 JSON 减少 token', onSingle: '单条条目', entriesMeasured: '条目已测量',
		note: '使用 <code>gpt-tokenizer</code>（cl100k_base）在 16 条代表性记忆条目上测量，比较实际磁盘上的 TOON 格式与紧凑 JSON。可复现：<code>npm run bench</code>。',
	},
	impactSection: {
		title: '每会话减少 80% 工具调用',
		subtitle: '四项基准测试：紧凑召回节省 68%，完整会话节省 80% 工具调用，批量压缩节省 14%，系统提示节省 58%。',
		stats: [{ num: '80%', cap: '更少工具调用 (25 → 5)' }, { num: '68%', cap: '更少令牌 (紧凑召回)' }, { num: '58%', cap: '更少令牌 (系统提示)' }, { num: '14%', cap: '更少令牌 (批量压缩)' }],
		note: '完整会话基准测试：启动 → 调试 → 实现 → 审查 → 完成。<code>context_*</code> 工具以约 318 个额外令牌换取 7 次更少调用——更丰富的上下文意味着更少的重新阅读。可复现：<code>npm run bench:full</code>、<code>npm run bench:primer</code>、<code>npm run bench:compress-all</code>。',
	},
	tools: {
		title: '34 个 MCP 工具，4 个资源', subtitle: '你的代理记忆、召回和推理所需的一切', resourcesLabel: '资源：',
		groups: {
			core: '核心记忆',
			search: '搜索与智能',
			context: '上下文简报',
			compress: '压缩',
			sessions: '会话管理',
			sync: '同步与安全',
		},
		cards: [
			{ name: 'memory_remember', title: '保存到记忆', desc: '存储决策、模式、bug 或知识 — 跨会话持久化，自动质量评分。', group: 'core' },
			{ name: 'memory_recall', title: '搜索记忆', desc: '在读取文件之前查询知识图谱。质量加权结果。', group: 'core' },
			{ name: 'memory_forget', title: '从记忆中删除', desc: '通过键或 id 删除条目。', group: 'core' },
			{ name: 'memory_stats', title: '记忆统计', desc: '显示项目记忆的统计信息，包括质量分布和最常访问的条目。', group: 'core' },
			{ name: 'memory_diff', title: '记忆差异', desc: '查看自上次会话以来的变化。', group: 'core' },
			{ name: 'memory_suggest', title: '建议相关条目', desc: '为给定上下文显示相关条目。', group: 'core' },
			{ name: 'memory_summary', title: '文件摘要', desc: '保存或检索文件摘要以节省 token。', group: 'core' },
			{ name: 'memory_archive', title: '归档旧条目', desc: '移动超过 30 天的条目以保持记忆整洁。', group: 'core' },
			{ name: 'memory_smart_recall', title: '智能召回', desc: '统一搜索，在一次调用中结合 BM25 + 图中心性 + 质量评分 + 新鲜度。', group: 'search' },
			{ name: 'memory_captured', title: '捕获的活动', desc: '查看 hooks 自动捕获的活动日志 — 将观察提升为记忆。', group: 'search' },
			{ name: 'memory_consolidate', title: '合并去重', desc: '以确定性方式合并内容相同的重复条目。通过 Jaccard 相似度检测近似重复。', group: 'search' },
			{ name: 'context_brief', title: '上下文简报', desc: '一次调用的上下文简报：记忆 + 会话 + 健康状态，紧凑 markdown。零 LLM。', group: 'context' },
			{ name: 'context_generate', title: '完整项目简报', desc: '一次调用的简报：项目结构 + git 状态 + 记忆 + 会话。替代 6 次手动调用。节省 93% token。', group: 'context' },
			{ name: 'context_diff', title: '增量简报', desc: 'git 提交 + 修改的文件 + 自上次会话以来的新/更新记忆。节省 72% token。', group: 'context' },
			{ name: 'context_focus', title: '定向简报', desc: '特定查询的相关记忆 + 相关文件 + 调用者 + 测试文件。', group: 'context' },
			{ name: 'context_health', title: '健康审计', desc: '孤立链接、重复项、损坏的文件引用、过期 TTL、过时会话。评分 0–100。', group: 'context' },
			{ name: 'context_export', title: '导出为 Markdown', desc: '将记忆导出为可注入的 markdown 用于系统提示。节省 82% token。', group: 'context' },
			{ name: 'memory_sessions', title: '会话', desc: '显示活跃的代理会话并检测软冲突。', group: 'sessions' },
			{ name: 'memory_compress', title: 'LLM 压缩', desc: 'LLM 驱动的两步压缩：摘要 + 覆盖。如果可用则使用 Anthropic/OpenAI CLI。', group: 'compress' },
			{ name: 'memory_compress_all', title: '批量压缩', desc: '批量压缩：将所有低于 100 token 的条目覆盖为压缩版本。确定性，无 LLM。', group: 'compress' },
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
		],
	},
	graphSection: {
		title: '你的记忆，以图谱形式',
		subtitle: '将决策与规格、bug 和架构连接起来。召回返回正确的上下文 — 不仅仅是关键词匹配。',
		points: ['使用 `links` 或 `[[key]]` 引用连接条目 — 无需嵌入，无需 LLM', '`memory_recall({ mode: "graph" })` 展开关系感知的子图', '更少的 token，更高的精度，完全离线且确定性'],
		caption: '一个决策传播到其规格和架构 — 代理看到全貌。',
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
			{ q: '什么是 toon-memory？', a: '面向 AI 编程代理的持久记忆层，包含 34 个 MCP 工具。它以紧凑的 TOON 格式存储决策、模式、bug 和上下文，让你的代理在会话之间记住一切 — 每次会话减少 80% 的工具调用。' },
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
			{ q: '什么是记忆压缩？', a: 'memory_compress 允许 LLM 将相关条目摘要为简洁的总结。memory_compress_all 确定性地移除低质量条目（无标签、短内容）— 无需 LLM。两者都减少令牌数量。' },
			{ q: '可以在机器之间同步记忆吗？', a: '可以。使用 memory_export_gist 将条目推送到 GitHub Gist，然后在另一台机器上使用 memory_import_gist。条目会自动合并（标签并集、最大置信度）。' },
		],
	},
	whatNew: {
		title: 'v3.5.0 新功能',
		subtitle: '优先级固定、会话检查点、会话偏差、冷记忆、详细合并预览',
		cards: [
			{
				icon: '📌',
				title: '优先级固定',
				body: '使用优先级 1-5 固定条目 — 优先级越高的条目在召回结果中排序越靠前。向后兼容旧的布尔类型固定。',
				stats: ['优先级 1-5', '排序', '向后兼容'],
			},
			{
				icon: '⏱️',
				title: '会话检查点',
				body: '创建当前内存状态的快照，有效期为 7 天。在长时间的复杂会话中用于回滚参考。使用 memory_checkpoint。',
				stats: ['memory_checkpoint', '7 天 TTL', '回滚'],
			},
			{
				icon: '🧬',
				title: '召回中的会话偏差',
				body: 'memory_recall、memory_search 和 memory_smart_recall 现在支持 sessionBias 参数 — 提升当前 git 分支条目的权重。',
				stats: ['sessionBias', 'Git 分支', '智能召回'],
			},
			{
				icon: '🥶',
				title: '统计中的冷记忆',
				body: 'memory_stats 现在显示冷记忆 — 低于质量和访问阈值的条目 — 让您知道需要归档或改进的内容。',
				stats: ['memory_stats', '冷记忆', '质量阈值'],
			},
			{
				icon: '🔍',
				title: '详细合并预览',
				body: 'memory_merge_similar 的 dryRun: true 现在显示哪些条目会被合并、哪些保持不变、以及内容和标签如何组合 — 无意外。',
				stats: ['dryRun', '合并预览', '无意外'],
			},
			{
				icon: '🧩',
				title: '35 个 MCP 工具 + 4 个资源',
				body: '新增 memory_checkpoint。更新 memory_pin 支持优先级 (1-5)。总计：35 个工具 + 4 个资源。',
				stats: ['+1 工具', '35 总计'],
			},
		],
	},
	cta: { title: '准备好为你的代理提供记忆了吗？', subtitle: '几秒钟内安装，再也不用向代理重复解释上下文。', getStarted: '快速开始', viewGithub: '在 GitHub 上查看' },
	footer: { text: 'MIT 许可证 — ' },
},
	ja: {
	nav: { docs: 'ドキュメント', npm: 'npm', github: 'GitHub' },
	hero: {
		tagline: 'AI コーディングエージェント向け MCP メモリサーバー — セッション間でコンテキストを取得',
		subtitle: 'エージェントがセッション間で意思決定、パターン、バグを記憶します。',
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
	features: {
		cards: [
			{ icon: '🧩', title: '31 個の MCP ツール + 3 個のリソース', body: 'MCP 経由で完全なメモリ管理 — remember、recall、forget、stats、summary、archive、diff、suggest、smart_recall、encrypt、decrypt、captured、consolidate、sessions、compress、compress_all、primer、merge_sessions、export_gist、import_gist、context_brief、context_generate、context_diff、context_focus、context_health、context_export。加えて直接コンテキスト読み取り用リソース。', tags: ['remember', 'recall', 'context', 'diff'] },
			{ icon: '⭐', title: 'マルチエージェント', body: 'すべての主要 AI コーディングエージェントに対応。OpenCode、VS Code、Claude、Cursor、Windsurf、Cline、Continue — ゼロコンフィグ。', tags: ['OpenCode', 'Claude', 'Cursor'] },
			{ icon: '📄', title: 'TOON フォーマット', body: 'JSON より 22% トークン削減（実測）。LLM 理解とトークン効率のために設計されたカスタムエンコーディング。', stats: ['トークン 22% 削減', 'パース速度 1.3x 向上'] },
			{ icon: '🔎', title: 'スマートリコール', body: 'グラフベースのリコールが BM25 関連性とグラフ中心性で再順位付けされます（クエリワードがなくてもハブが浮上）。ホップごとの減衰で遠いコンテキストを低く維持。トークン効率の高い `compact` モードは数字インデックス、スニペット切り詰めの結果を返します。', stats: ['BM25', '中心性', 'compact'] },
			{ icon: '🧠', title: 'スマートメモリ', body: '組み込み語彙とプロジェクト依存関係からの自動タグ推論、品質スコア、信頼度スコア、マージ重複排除、関連エントリの提案、メモリ diff、および一時コンテキスト用の設定可能な TTL。', stats: ['自動タグ', '品質評価', 'マージ重複排除'] },
			{ icon: '🔒', title: '暗号化', body: 'AES-256-GCM による機密データ保護。古いエントリの自動アーカイブ。Watch モードで N 分ごとに自動バックアップ。', stats: ['AES-256-GCM', '自動バックアップ'] },
		],
	},
	agents: { title: '15 以上の AI コーディングエージェントに対応', subtitle: 'ゼロコンフィグ — toon-memory が自動検出し、各エージェントを設定' },
	stats: { items: [{ number: '31', label: 'MCP ツール' }, { number: '15', label: 'エージェント' }, { number: '80%', label: 'セッションあたりツール呼び出し削減' }, { number: '0', label: '必要な設定' }] },
	howItWorks: {
		title: 'どのように機能するのか？', subtitle: '記憶喪失からメモリへの 4 つのステップ',
		steps: [
			{ n: 1, title: 'インストール', body: 'ワンコマンド。15 以上のエージェントにゼロコンフィグ。', code: 'npm install -g toon-memory' },
			{ n: 2, title: '記憶する', body: '作業しながら意思決定、パターン、バグを保存 — 自動タグ推論とオプションの TTL 対応。', code: 'memory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})' },
			{ n: 3, title: 'リコール', body: 'エージェントがオンデマンドでメモリをクエリ — 再説明不要、トークン浪費なし。', code: 'memory_recall({ query: "validation" })\n// [decision] use-zod (a1b2c3d4)\n//   Use Zod for validation — src/types.ts' },
			{ n: 4, title: 'コンテキスト', body: '1 回の呼び出しでエージェントにすべてを提供：プロジェクト、git、メモリ、セッション。ツール呼び出しを 80% 削減。', code: 'context_generate({})\n// # Project Briefing (full)\n// ## Project — toon-memory v2.6.0\n// ## Git — branch: main, 3 commits\n// ## Memory — 26 entries, 18 edges\n// ## Sessions — 2 active' },
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
		title: 'Before vs After', subtitle: 'toon-memory がワークフローをどう変えるか', beforeTitle: 'Before', afterTitle: 'After',
		before: ['毎セッション説明を繰り返す', '意思決定の理由を忘れる', 'git 履歴からコンテキストを探す', 'チャット間でメモをコピー＆ペースト'],
		after: ['エージェントがすべてを記憶', '1 回の呼び出しで完全なプロジェクトコンテキスト', 'セッションあたり 80% ツール呼び出し削減', 'セッション間でコンテキスト損失ゼロ'],
	},
	codeExamples: {
		quickExample: 'クイック例', quickInstall: 'クイックインストール',
		exampleCode: '// 意思決定を保存（自動タグ推論）\nmemory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})\n// 🏷️ Tags inferred: types\n\n// TTL 付きで保存（7 日後に期限切れ）\nmemory_remember({\n  category: "knowledge",\n  key: "sprint-deadline",\n  content: "Sprint ends July 18",\n  ttl: "7d"\n})\n\n// 前回セッション以降の変更を確認\nmemory_diff({ since: "24h" })\n\n// メモリを検索\nmemory_recall({ query: "redis" })\n// [bug] redis-pool-fix (i9j0k1l2)\n//   Added max_connections=20',
		installCode: '# npm\nnpm install -g toon-memory\n\n# macOS / Linux\ncurl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh\n\n# Windows (PowerShell)\nirm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex',
	},
	tokenSavings: {
		title: '設計によりトークンを 22% 削減', subtitle: 'TOON フォーマットは人間のためではなく、LLM のために構築された',
		stats: [{ num: '22.5%', cap: 'JSON よりトークン削減' }, { num: '30.5%', cap: '単一エントリ' }, { num: '1.3x', cap: 'パース速度向上' }],
		note: '<code>gpt-tokenizer</code>（cl100k_base）で 16 件の代表的なメモリエントリを測定。実際の TOON フォーマットとコンパクト JSON を比較。再現可能：<code>npm run bench</code>。',
	},
	benchmarks: {
		title: 'ベンチマーク', subtitle: 'TOON フォーマットのトークン効率 — 推測ではなく実測',
		fewerTokens: 'JSON よりトークン削減', onSingle: '単一エントリ', entriesMeasured: 'エントリを測定',
		note: '<code>gpt-tokenizer</code>（cl100k_base）で 16 件の代表的なメモリエントリを測定。実際の TOON フォーマットとコンパクト JSON を比較。再現可能：<code>npm run bench</code>。',
	},
	impactSection: {
		title: 'セッションあたり80% fewer tool calls',
		subtitle: '4つのベンチマーク：コンパクトrecallは68%節約、フルセッションは80% fewer tool calls、バッチ圧縮は14%節約、システムprimerは58%節約。',
		stats: [{ num: '80%', cap: 'fewer tool calls (25 → 5)' }, { num: '68%', cap: 'fewer tokens (compact recall)' }, { num: '58%', cap: 'fewer tokens (system primer)' }, { num: '14%', cap: 'fewer tokens (batch compress)' }],
		note: 'フルセッションベンチマーク：開始 → デバッグ → 実装 → レビュー → 終了。<code>context_*</code>ツールは追加~318トークンで7回 fewer callsと引き換え — より豊かなコンテキストはより少ない再読み込みを意味します。再現可能：<code>npm run bench:full</code>、<code>npm run bench:primer</code>、<code>npm run bench:compress-all</code>。',
	},
	tools: {
		title: '31 個の MCP ツール、3 個のリソース', subtitle: 'エージェントが記憶、リコール、推論するために必要なすべて', resourcesLabel: 'リソース：',
		groups: {
			core: 'コアメモリ',
			search: '検索＆インテリジェンス',
			context: 'コンテキストブリーフィング',
			compress: '圧縮',
			sessions: 'セッション',
			sync: '同期＆セキュリティ',
		},
		cards: [
			{ name: 'memory_remember', title: 'メモリに保存', desc: '意思決定、パターン、バグ、知識を保存 — 自動品質スコアリング付きでセッション間永続化。', group: 'core' },
			{ name: 'memory_recall', title: 'メモリを検索', desc: 'ファイルを読む前にナレッジグラフをクエリ。品質加重の結果。', group: 'core' },
			{ name: 'memory_forget', title: 'メモリから削除', desc: 'キーまたは id でエントリを削除。', group: 'core' },
			{ name: 'memory_stats', title: 'メモリ統計', desc: '品質分布と最もアクセスされたエントリを含むプロジェクトメモリの統計を表示。', group: 'core' },
			{ name: 'memory_diff', title: 'メモリ差分', desc: '前回セッション以降の変更を確認。', group: 'core' },
			{ name: 'memory_suggest', title: '関連を提案', desc: '指定されたコンテキストの関連エントリを表示。', group: 'core' },
			{ name: 'memory_summary', title: 'ファイル要約', desc: 'トークン節約のためにファイル要約を保存または取得。', group: 'core' },
			{ name: 'memory_archive', title: '古いものをアーカイブ', desc: 'メモリをきれいに保つために 30 日以上のエントリを移動。', group: 'core' },
			{ name: 'memory_smart_recall', title: 'スマートリコール', desc: 'BM25 + グラフ中心性 + 品質スコア + 新鮮度を 1 回の呼び出しで統合検索。', group: 'search' },
			{ name: 'memory_captured', title: 'キャプチャされたアクティビティ', desc: 'フックによって自動キャプチャされたアクティビティログを表示 — オブザベーションをメモリに昇格。', group: 'search' },
			{ name: 'memory_consolidate', title: '統合', desc: '内容が同一の重複エントリを決定的にマージ。Jaccard 類似度による近似重複検出。', group: 'search' },
			{ name: 'context_brief', title: 'コンテキストブリーフィング', desc: '1 回呼び出しのコンテキストブリーフィング：メモリ + セッション + ヘルス。コンパクト markdown。ゼロ LLM。', group: 'context' },
			{ name: 'context_generate', title: '完全プロジェクトブリーフィング', desc: '1 回呼び出しのブリーフィング：プロジェクト構造 + git 状態 + メモリ + セッション。6 回の手動呼び出しを置換。トークン 93% 節約。', group: 'context' },
			{ name: 'context_diff', title: 'インクリメンタルブリーフィング', desc: 'git コミット + 変更ファイル + 前回セッション以降の新規/更新メモリ。トークン 72% 節約。', group: 'context' },
			{ name: 'context_focus', title: 'ターゲットブリーフィング', desc: '特定クエリの関連メモリ + 関連ファイル + 呼び出し元 + テストファイル。', group: 'context' },
			{ name: 'context_health', title: 'ヘルス監査', desc: 'オーファンリンク、重複、壊れたファイル参照、期限切れ TTL、古いセッション。スコア 0–100。', group: 'context' },
			{ name: 'context_export', title: 'Markdown としてエクスポート', desc: 'メモリをシステムプロンプト用の注入可能な markdown としてエクスポート。トークン 82% 節約。', group: 'context' },
			{ name: 'memory_compress', title: 'LLM 圧縮', desc: 'LLM 駆動の2段階圧縮：要約 + 上書き。Anthropic/OpenAI CLI が利用可能な場合は使用。', group: 'compress' },
			{ name: 'memory_compress_all', title: '一括圧縮', desc: '一括圧縮：100 トークン未満のすべてのエントリを圧縮バージョンで上書き。決定的、LLM 不要。', group: 'compress' },
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
		],
	},
	graphSection: {
		title: 'メモリをグラフで', subtitle: '意思決定を仕様、バグ、アーキテクチャに接続。リコールは正しいコンテキストを返す — 単なるキーワード一致ではない。',
		points: ['`links` または `[[key]]` 参照でエントリを接続 — 埋め込み不要、LLM 不要', '`memory_recall({ mode: "graph" })` がリレーションシップを考慮したサブグラフを展開', 'トークン削減、精度向上、完全オフラインで決定的'],
		caption: '意思決定が仕様とアーキテクチャに波及 — エージェントが全体像を把握。',
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
			{ q: 'toon-memory とは？', a: '31 個の MCP ツールを備えた AI コーディングエージェント向けの永続メモリレイヤー。意思決定、パターン、バグ、コンテキストをコンパクトな TOON フォーマットで保存し、エージェントがセッション間ですべてを記憶 — セッションあたり 80% ツール呼び出し削減。' },
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
			{ q: 'メモリ圧縮とは？', a: 'memory_compressはLLMに関連するエントリを簡潔な要約にまとめるさせます。memory_compress_allは低品質なエントリ（タグなし、短いコンテンツ）を決定論的に削除します — LLM不要。どちらもトークン数を削減します。' },
			{ q: 'マシン間でメモリを同期できますか？', a: 'はい。memory_export_gistでGitHub Gistにエントリをプッシュし、別のマシンでmemory_import_gistを使用します。エントリは自動的にマージされます（タグの和集合、最大信頼度）。' },
		],
	},
	whatNew: {
		title: 'v3.5.0 新機能',
		subtitle: '優先度ピン留め、セッションチェックポイント、セッションバイアス、コールドメモリ、詳細マージプレビュー',
		cards: [
			{
				icon: '📌',
				title: '優先度ピン留め',
				body: '優先度1-5でエントリをピン留め — 優先度が高いエントリがリコール結果の上部に表示されます。従来のブール型ピンと互換性あり。',
				stats: ['優先度1-5', 'ソート', '互換性あり'],
			},
			{
				icon: '⏱️',
				title: 'セッションチェックポイント',
				body: '現在のメモリ状態のスナップショットを7日間のTTLで作成。長時間の複雑なセッションでのロールバック参照に便利。memory_checkpoint を使用。',
				stats: ['memory_checkpoint', '7日TTL', 'ロールバック'],
			},
			{
				icon: '🧬',
				title: 'リコールのセッションバイアス',
				body: 'memory_recall、memory_search、memory_smart_recall が sessionBias パラメータをサポート — 現在のgitブランチのエントリを優先。',
				stats: ['sessionBias', 'Gitブランチ', 'スマートリコール'],
			},
			{
				icon: '🥶',
				title: '統計のコールドメモリ',
				body: 'memory_stats がコールドメモリを表示 — 品質とアクセスしきい値を下回るエントリ — アーカイブや改善が必要なものがわかります。',
				stats: ['memory_stats', 'コールドメモリ', '品質しきい値'],
			},
			{
				icon: '🔍',
				title: '詳細マージプレビュー',
				body: 'memory_merge_similar の dryRun:true が、どのエントリがマージされ、どれが残り、コンテンツとタグがどう結合されるかを表示 — 驚きなし。',
				stats: ['dryRun', 'マージプレビュー', '驚きなし'],
			},
			{
				icon: '🧩',
				title: '35 MCPツール + 4 リソース',
				body: 'memory_checkpoint を追加。memory_pin を優先度(1-5)対応に更新。合計：35ツール + 4リソース。',
				stats: ['+1 ツール', '35 合計'],
			},
		],
	},
	cta: { title: 'エージェントにメモリを与える準備はできましたか？', subtitle: '数秒でインストールし、二度とエージェントにコンテキストを再説明することはありません。', getStarted: 'はじめに', viewGithub: 'GitHub で見る' },
	footer: { text: 'MIT ライセンス — ' },
},
	ko: {
	nav: { docs: '문서', npm: 'npm', github: 'GitHub' },
	hero: {
		tagline: 'AI 코딩 에이전트를 위한 MCP 메모리 서버 — 세션 간 컨텍스트 회수',
		subtitle: '에이전트가 세션 간에 결정, 패턴, 버그를 기억합니다.',
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
	features: {
		cards: [
			{ icon: '🧩', title: '34개 MCP 도구 + 4개 리소스', body: 'MCP를 통한 완전한 메모리 관리 — remember, recall, forget, stats, summary, archive, diff, suggest, smart_recall, encrypt, decrypt, captured, consolidate, sessions, compress, compress_all, primer, merge_sessions, export_gist, import_gist, merge_similar, graph_path, context_brief, context_generate, context_diff, context_focus, context_health, context_export, visualize, pin, unpin, search, tag. 직접 컨텍스트 읽기를 위한 리소스 포함.', tags: ['remember', 'recall', 'context', 'diff'] },
			{ icon: '⭐', title: '멀티 에이전트', body: '모든 주요 AI 코딩 에이전트와 호환. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue — 제로 구성.', tags: ['OpenCode', 'Claude', 'Cursor'] },
			{ icon: '📄', title: 'TOON 형식', body: 'JSON보다 22% 적은 토큰 (실측). LLM 이해와 토큰 효율성을 위해 설계된 맞춤 인코딩.', stats: ['토큰 22% 절감', '파싱 속도 1.3x 향상'] },
			{ icon: '🔎', title: '스마트 리콜', body: '그래프 기반 리콜이 BM25 관련성과 그래프 중심성으로 재순위화됨 (쿼리 단어 없이도 허브가 부상). 홉당 감쇠로 먼 컨텍스트를 낮게 유지. 토큰 효율적인 `compact` 모드는 숫자 인덱스, 스니펫 잘린 결과를 반환.', stats: ['BM25', '중심성', 'compact'] },
			{ icon: '🧠', title: '스마트 메모리', body: '내장 어휘와 프로젝트 의존성에서 자동 태그 추론, 품질 점수, 신뢰도 점수, 병합 중복 제거, 관련 항목 제안, 메모리 diff, 및 구성 가능한 임시 컨텍스트 TTL.', stats: ['자동 태그', '품질 점수', '병합 중복 제거'] },
			{ icon: '🔒', title: '암호화', body: 'AES-256-GCM로 민감한 데이터 보호. 오래된 항목 자동 아카이브. Watch 모드로 N분마다 자동 백업.', stats: ['AES-256-GCM', '자동 백업'] },
		],
	},
	agents: { title: '15개 이상의 AI 코딩 에이전트 지원', subtitle: '제로 구성 — toon-memory가 각 에이전트를 자동 감지하고 구성' },
	stats: { items: [{ number: '31', label: 'MCP 도구' }, { number: '15', label: '에이전트' }, { number: '80%', label: '세션당 도구 호출 절감' }, { number: '0', label: '필요한 구성' }] },
	howItWorks: {
		title: '어떻게 작동하나요?', subtitle: '기억 상실에서 메모리까지 4단계',
		steps: [
			{ n: 1, title: '설치', body: '하나의 명령어. 15개 이상의 에이전트에 제로 구성.', code: 'npm install -g toon-memory' },
			{ n: 2, title: '기억', body: '작업하면서 결정, 패턴, 버그를 저장 — 자동 태그 추론과 선택적 TTL 포함.', code: 'memory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})' },
			{ n: 3, title: '리콜', body: '에이전트가 필요할 때 메모리를 쿼리 — 재설명 불필요, 토큰 낭비 없음.', code: 'memory_recall({ query: "validation" })\n// [decision] use-zod (a1b2c3d4)\n//   Use Zod for validation — src/types.ts' },
			{ n: 4, title: '컨텍스트', body: '한 번의 호출로 에이전트에 모든 것을 제공: 프로젝트, git, 메모리, 세션. 도구 호출 80% 절감.', code: 'context_generate({})\n// # Project Briefing (full)\n// ## Project — toon-memory v2.6.0\n// ## Git — branch: main, 3 commits\n// ## Memory — 26 entries, 18 edges\n// ## Sessions — 2 active' },
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
		title: 'Before vs After', subtitle: 'toon-memory가 워크플로우를 어떻게 바꾸는지 확인', beforeTitle: 'Before', afterTitle: 'After',
		before: ['매 세션 설명을 반복', '결정 이유를 잊음', 'git 기록에서 컨텍스트 검색', '채팅 간에 메모를 복사-붙여넣기'],
		after: ['에이전트가 모든 것을 기억', '한 번의 호출로 전체 프로젝트 컨텍스트', '세션당 80% 도구 호출 절감', '세션 간 컨텍스트 손실 제로'],
	},
	codeExamples: {
		quickExample: '빠른 예제', quickInstall: '빠른 설치',
		exampleCode: '// 결정 저장 (자동 태그 추론)\nmemory_remember({\n  category: "decision",\n  key: "use-zod",\n  content: "Use Zod for validation",\n  file: "src/types.ts"\n})\n// 🏷️ Tags inferred: types\n\n// TTL 포함 저장 (7일 후 만료)\nmemory_remember({\n  category: "knowledge",\n  key: "sprint-deadline",\n  content: "Sprint ends July 18",\n  ttl: "7d"\n})\n\n// 마지막 세션 이후 변경 사항 확인\nmemory_diff({ since: "24h" })\n\n// 메모리 검색\nmemory_recall({ query: "redis" })\n// [bug] redis-pool-fix (i9j0k1l2)\n//   Added max_connections=20',
		installCode: '# npm\nnpm install -g toon-memory\n\n# macOS / Linux\ncurl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh\n\n# Windows (PowerShell)\nirm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex',
	},
	tokenSavings: {
		title: '설계에 의해 토큰 22% 절감', subtitle: 'TOON 형식은 인간을 위해 만들어진 것이 아니라 LLM을 위해 만들어짐',
		stats: [{ num: '22.5%', cap: 'JSON보다 토큰 절감' }, { num: '30.5%', cap: '단일 항목' }, { num: '1.3x', cap: '파싱 속도 향상' }],
		note: '<code>gpt-tokenizer</code> (cl100k_base)로 16개의 대표적인 메모리 항목을 측정. 실제 TOON 형식과 컴팩트 JSON 비교. 재현 가능: <code>npm run bench</code>.',
	},
	benchmarks: {
		title: '벤치마크', subtitle: 'TOON 형식의 토큰 효율성 — 추측이 아닌 실측',
		fewerTokens: 'JSON보다 토큰 절감', onSingle: '단일 항목', entriesMeasured: '항목 측정됨',
		note: '<code>gpt-tokenizer</code> (cl100k_base)로 16개의 대표적인 메모리 항목을 측정. 실제 TOON 형식과 컴팩트 JSON 비교. 재현 가능: <code>npm run bench</code>.',
	},
	impactSection: {
		title: '세션당 80% fewer tool calls',
		subtitle: '4개 벤치마크: 컴팩트 recall은 68% 절약, 전체 세션은 80% fewer tool calls, 배치 압축은 14% 절약, 시스템 primer은 58% 절약.',
		stats: [{ num: '80%', cap: 'fewer tool calls (25 → 5)' }, { num: '68%', cap: 'fewer tokens (compact recall)' }, { num: '58%', cap: 'fewer tokens (system primer)' }, { num: '14%', cap: 'fewer tokens (batch compress)' }],
		note: '전체 세션 벤치마크: 시작 → 디버그 → 구현 → 검토 → 마무리. <code>context_*</code> 도구는 추가 ~318 토큰으로 7번 fewer calls와 교환 — 더 풍부한 컨텍스트는 fewer 재읽기를 의미합니다. 재현 가능: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
	},
	tools: {
		title: '34개 MCP 도구, 4개 리소스', subtitle: '에이전트의 기억, 리콜, 추론에 필요한 모든 것', resourcesLabel: '리소스:',
		groups: {
			core: '핵심 메모리',
			search: '검색 및 인텔리전스',
			context: '컨텍스트 브리핑',
			compress: '압축',
			sessions: '세션',
			sync: '동기화 및 보안',
		},
		cards: [
			{ name: 'memory_remember', title: '메모리에 저장', desc: '결정, 패턴, 버그, 지식 저장 — 자동 품질 점수와 함께 세션 간 지속.', group: 'core' },
			{ name: 'memory_recall', title: '메모리 검색', desc: '파일을 읽기 전에 지식 그래프를 쿼리. 품질 가중 결과.', group: 'core' },
			{ name: 'memory_forget', title: '메모리에서 삭제', desc: '키 또는 id로 항목 삭제.', group: 'core' },
			{ name: 'memory_stats', title: '메모리 통계', desc: '품질 분포와 가장 많이 접근한 항목을 포함한 프로젝트 메모리 통계 표시.', group: 'core' },
			{ name: 'memory_diff', title: '메모리 차이', desc: '마지막 세션 이후 변경 사항 확인.', group: 'core' },
			{ name: 'memory_suggest', title: '관련 항목 제안', desc: '지정된 컨텍스트의 관련 항목을 표시.', group: 'core' },
			{ name: 'memory_summary', title: '파일 요약', desc: '토큰 절약을 위한 파일 요약 저장 또는 검색.', group: 'core' },
			{ name: 'memory_archive', title: '오래된 항목 아카이브', desc: '메모리를 깨끗하게 유지하기 위해 30일 이상 된 항목 이동.', group: 'core' },
			{ name: 'memory_smart_recall', title: '스마트 리콜', desc: 'BM25 + 그래프 중심성 + 품질 점수 + 신선도를 하나의 호출로 통합 검색.', group: 'search' },
			{ name: 'memory_captured', title: '캡처된 활동', desc: '훅에 의해 자동 캡처된 활동 로그 표시 — 관찰을 메모리로 승격.', group: 'search' },
			{ name: 'memory_consolidate', title: '통합', desc: '동일한 내용의 중복 항목을 결정적으로 병합. 자카드 유사도를 통한 근사 중복 감지.', group: 'search' },
			{ name: 'context_brief', title: '컨텍스트 브리핑', desc: '한 번의 호출 컨텍스트 브리핑: 메모리 + 세션 + 헬스를 컴팩트 markdown으로. 제로 LLM.', group: 'context' },
			{ name: 'context_generate', title: '전체 프로젝트 브리핑', desc: '한 번의 호출 브리핑: 프로젝트 구조 + git 상태 + 메모리 + 세션. 6회 수동 호출 대체. 토큰 93% 절약.', group: 'context' },
			{ name: 'context_diff', title: '점증 브리핑', desc: 'git 커밋 + 수정된 파일 + 마지막 세션 이후 신규/업데이트 메모리. 토큰 72% 절약.', group: 'context' },
			{ name: 'context_focus', title: '타겟 브리핑', desc: '특정 쿼리에 대한 관련 메모리 + 관련 파일 + 호출자 + 테스트 파일.', group: 'context' },
			{ name: 'context_health', title: '헬스 감사', desc: '고아 링크, 중복, 깨진 파일 참조, 만료된 TTL, 오래된 세션. 점수 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Markdown으로 내보내기', desc: '시스템 프롬프트용 주입 가능한 markdown으로 메모리 내보내기. 토큰 82% 절약.', group: 'context' },
			{ name: 'memory_compress', title: 'LLM 압축', desc: 'LLM 기반 2단계 압축: 요약 + 덮어쓰기. 사용 가능한 경우 Anthropic/OpenAI CLI 사용.', group: 'compress' },
			{ name: 'memory_compress_all', title: '일괄 압축', desc: '일괄 압축: 100 토큰 미만의 모든 항목을 압축 버전으로 덮어쓰기. 결정적, LLM 불필요.', group: 'compress' },
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
		],
	},
	graphSection: {
		title: '메모리를 그래프로', subtitle: '결정을 사양, 버그, 아키텍처에 연결. 리콜은 올바른 컨텍스트를 반환 — 단순한 키워드 일치가 아님.',
		points: ['`links` 또는 `[[key]]` 참조로 항목 연결 — 임베딩 불필요, LLM 불필요', '`memory_recall({ mode: "graph" })`가 관계 인식 서브그래프를 확장', '토큰 절감, 정확도 향상, 완전 오프라인이고 결정적'],
		caption: '결정이 사양과 아키텍처로 파급 — 에이전트가 전체 그림을 파악.',
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
			{ q: 'toon-memory란?', a: '34개 MCP 도구를 갖춘 AI 코딩 에이전트용 지속적 메모리 레이어. 결정, 패턴, 버그, 컨텍스트를 컴팩트 TOON 형식으로 저장하여 에이전트가 세션 간에 모든 것을 기억 — 세션당 80% 도구 호출 절감.' },
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
			{ q: '메모리 압축이란 무엇인가요?', a: 'memory_compress는 LLM이 관련 항목을 간결한 요약으로 압축하도록 합니다. memory_compress_all은 저품질 항목(태그 없음, 짧은 콘텐츠)을 결정적으로 제거합니다 — LLM 불필요. 둘 다 토큰 수를 줄입니다.' },
			{ q: '머신 간에 메모리를 동기화할 수 있나요?', a: '네. memory_export_gist로 GitHub Gist에 항목을 푸시한 다음 다른 머신에서 memory_import_gist를 사용합니다. 항목은 자동으로 병합됩니다(태그 합집합, 최대 신뢰도).' },
		],
	},
	whatNew: {
		title: 'v3.5.0 새로운 기능',
		subtitle: '우선순위 고정, 세션 체크포인트, 세션 편향, 콜드 메모리, 상세 병합 미리보기',
		cards: [
			{
				icon: '📌',
				title: '우선순위 고정',
				body: '우선순위 1-5로 항목 고정 — 우선순위가 높은 항목이 리콜 결과 상단에 정렬됩니다. 이전 불리언 고정과 호환 가능.',
				stats: ['우선순위 1-5', '정렬', '호환 가능'],
			},
			{
				icon: '⏱️',
				title: '세션 체크포인트',
				body: '7일 TTL로 현재 메모리 상태의 스냅샷 생성. 긴 복잡한 세션 중 롤백 참조에 유용. memory_checkpoint 사용.',
				stats: ['memory_checkpoint', '7일 TTL', '롤백'],
			},
			{
				icon: '🧬',
				title: '리콜의 세션 편향',
				body: 'memory_recall, memory_search, memory_smart_recall이 sessionBias 매개변수 지원 — 현재 git 브랜치의 항목 가중치 상향.',
				stats: ['sessionBias', 'Git 브랜치', '스마트 리콜'],
			},
			{
				icon: '🥶',
				title: '통계의 콜드 메모리',
				body: 'memory_stats가 콜드 메모리 표시 — 품질 및 액세스 임계값 아래의 항목 — 보관하거나 개선해야 할 항목을 알 수 있습니다.',
				stats: ['memory_stats', '콜드 메모리', '품질 임계값'],
			},
			{
				icon: '🔍',
				title: '상세 병합 미리보기',
				body: 'memory_merge_similar dryRun:true가 병합될 항목, 유지될 항목, 콘텐츠와 태그 결합 방식을 표시 — 놀라움 없음.',
				stats: ['dryRun', '병합 미리보기', '놀라움 없음'],
			},
			{
				icon: '🧩',
				title: '35개 MCP 도구 + 4개 리소스',
				body: 'memory_checkpoint 추가. memory_pin을 우선순위(1-5)로 업데이트. 총계: 35개 도구 + 4개 리소스.',
				stats: ['+1 도구', '35 총계'],
			},
		],
	},
	cta: { title: '에이전트에 메모리를 부여할 준비가 되셨나요?', subtitle: '몇 초 만에 설치하고 에이전트에 컨텍스트를 재설명하지 마세요.', getStarted: '시작하기', viewGithub: 'GitHub에서 보기' },
	footer: { text: 'MIT 라이선스 — ' },
},
	'pt-br': {
	nav: {
		docs: 'Documentação',
		npm: 'npm',
		github: 'GitHub',
	},
	hero: {
		tagline: 'Servidor de memória MCP para agentes de IA — recupere contexto entre sessões',
		subtitle: 'Seu agente lembra decisões, padrões e bugs entre sessões.',
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
	features: {
		cards: [
			{
			icon: '🧩',
			title: '34 ferramentas MCP + 4 recursos',
			body: 'Gerenciamento completo de memória via MCP — remember, recall, forget, stats, summary, archive, diff, suggest, smart_recall, encrypt, decrypt, captured, consolidate, sessions, compress, compress_all, primer, merge_sessions, export_gist, import_gist, merge_similar, graph_path, context_brief, context_generate, context_diff, context_focus, context_health, context_export, visualize, pin, unpin, search, tag. Mais recursos para leitura direta de contexto.',
				tags: ['remember', 'recall', 'context', 'diff'],
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
			{ number: '31', label: 'Ferramentas MCP' },
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
// ## Project — toon-memory v2.6.0
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
		title: 'Antes vs Depois',
		subtitle: 'Veja como o toon-memory muda seu fluxo de trabalho',
		beforeTitle: 'Antes',
		afterTitle: 'Depois',
		before: [
			'Repetir explicações a cada sessão',
			'Esquecer por que uma decisão foi tomada',
			'Procurar no histórico do git por contexto',
			'Copiar e colar notas entre chats',
		],
		after: [
			'Agente lembra tudo',
			'Uma chamada dá o contexto completo do projeto',
			'80% menos chamadas de ferramenta por sessão',
			'Zero perda de contexto entre sessões',
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
	tokenSavings: {
		title: '22% menos tokens, por design',
		subtitle: 'O formato TOON é feito para LLMs, não para humanos',
		stats: [
			{ num: '22.5%', cap: 'menos tokens que JSON' },
			{ num: '30.5%', cap: 'em uma única entrada' },
			{ num: '1.3x', cap: 'mais rápido para parsear' },
		],
		note: 'Medido com <code>gpt-tokenizer</code> (cl100k_base) em 16 entradas de memória representativas, comparando o formato TOON real em disco contra JSON compacto. Reproduzível: <code>npm run bench</code>.',
	},
	benchmarks: {
		title: 'Benchmarks',
		subtitle: 'Eficiência de tokens do formato TOON — medido, não assumido',
		fewerTokens: 'menos tokens que JSON',
		onSingle: 'em uma única entrada',
		entriesMeasured: 'entradas medidas',
		note: 'Medido com <code>gpt-tokenizer</code> (cl100k_base) em 16 entradas de memória representativas, comparando o formato TOON real em disco contra JSON compacto. Reproduzível: <code>npm run bench</code>.',
	},
	impactSection: {
		title: '80% menos chamadas de ferramentas por sessão',
		subtitle:
			'Quatro benchmarks: recall compacto economiza 68%, sessão completa economiza 80% de chamadas, compressão em lote economiza 14%, system primer economiza 58%.',
		stats: [
			{ num: '80%', cap: 'menos chamadas (25 → 5)' },
			{ num: '68%', cap: 'menos tokens (recall compacto)' },
			{ num: '58%', cap: 'menos tokens (system primer)' },
			{ num: '14%', cap: 'menos tokens (compressão em lote)' },
		],
		note: 'Benchmark de sessão completa: início → depuração → implementação → revisão → encerramento. As ferramentas <code>context_*</code> trocam ~318 tokens extras por 7 chamadas a menos — contexto mais rico significa menos re-leituras. Reprodutível: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
	},
	tools: {
		title: '34 ferramentas MCP, 4 recursos',
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
			{ name: 'memory_remember', title: 'Salvar na memória', desc: 'Armazena decisões, padrões, bugs ou conhecimento — persistente entre sessões com pontuação de qualidade automática.', group: 'core' },
			{ name: 'memory_recall', title: 'Buscar memória', desc: 'Consulta o grafo de conhecimento antes de ler arquivos. Resultados ponderados por qualidade.', group: 'core' },
			{ name: 'memory_forget', title: 'Excluir da memória', desc: 'Remove uma entrada por key ou id.', group: 'core' },
			{ name: 'memory_stats', title: 'Estatísticas', desc: 'Mostra estatísticas da memória do projeto, incluindo distribuição de qualidade e entradas mais acessadas.', group: 'core' },
			{ name: 'memory_diff', title: 'Diff da memória', desc: 'Veja o que mudou desde sua última sessão.', group: 'core' },
			{ name: 'memory_suggest', title: 'Sugerir relacionados', desc: 'Mostra entradas relacionadas para um contexto dado.', group: 'core' },
			{ name: 'memory_summary', title: 'Resumo do arquivo', desc: 'Salva ou recupera um resumo de arquivo para economizar tokens.', group: 'core' },
			{ name: 'memory_archive', title: 'Arquivar antigos', desc: 'Move entradas com mais de 30 dias para manter a memória limpa.', group: 'core' },
			{ name: 'memory_smart_recall', title: 'Recall inteligente', desc: 'Busca unificada combinando BM25 + centralidade + qualidade + frescor em uma chamada.', group: 'search' },
			{ name: 'memory_captured', title: 'Atividade capturada', desc: 'Exibe log de atividade capturado por hooks — promova observações para memória.', group: 'search' },
			{ name: 'memory_consolidate', title: 'Consolidar', desc: 'Mescla entradas duplicadas com conteúdo idêntico de forma determinística. Detecção de quase-duplicatas via similaridade Jaccard.', group: 'search' },
			{ name: 'context_brief', title: 'Briefing de contexto', desc: 'Briefing de contexto em uma chamada: memória + sessões + saúde em markdown compacto. Zero LLM.', group: 'context' },
			{ name: 'context_generate', title: 'Briefing completo', desc: 'Briefing em uma chamada: estrutura do projeto + estado git + memória + sessões. Substitui 6 chamadas manuais. Economiza 93% tokens.', group: 'context' },
			{ name: 'context_diff', title: 'Briefing incremental', desc: 'Commits git + arquivos modificados + memória nova/atualizada desde a última sessão. Economiza 72% tokens.', group: 'context' },
			{ name: 'context_focus', title: 'Briefing direcionado', desc: 'Memória relevante + arquivos relacionados + callers + arquivos de teste para uma query específica.', group: 'context' },
			{ name: 'context_health', title: 'Auditoria de saúde', desc: 'Links órfãos, duplicatas, referências quebradas, TTL expirados, sessões obsoletas. Nota 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Exportar como Markdown', desc: 'Exporta memória como markdown injetável para system prompts. Economiza 82% tokens.', group: 'context' },
			{ name: 'memory_sessions', title: 'Sessões', desc: 'Mostra sessões ativas do agente e detecta conflitos leves.', group: 'sessions' },
			{ name: 'memory_compress', title: 'Compressão LLM', desc: 'Compressão em duas etapas com LLM: resumir + sobrescrever. Usa Anthropic/OpenAI CLI se disponível.', group: 'compress' },
			{ name: 'memory_compress_all', title: 'Compressão em lote', desc: 'Compressão em lote: sobrescreve todas as entradas abaixo de 100 tokens com versão comprimida. Determinístico, sem LLM.', group: 'compress' },
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
		],
	},
	graphSection: {
		title: 'Sua memória, como um grafo',
		subtitle:
			'Conecte decisões a suas specs, bugs e arquitetura. O recall retorna o contexto correto — não apenas correspondência de palavras.',
		points: [
			'Vincule entradas com `links` ou referências `[[key]]` — sem embeddings, sem LLM',
			'`memory_recall({ mode: "graph" })` expande um subgrafo consciente de relações',
			'Menos tokens, mais precisão, totalmente offline e determinístico',
		],
		caption: 'Uma decisão se propaga para sua spec e arquitetura — o agente vê o quadro completo.',
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
				a: 'Uma camada de memória persistente para agentes de IA com 34 ferramentas MCP. Armazena decisões, padrões, bugs e contexto em um formato TOON compacto para que seu agente lembre tudo entre sessões — com 80% menos chamadas de ferramenta por sessão.',
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
				a: 'memory_compress permite que um LLM resuma entradas relacionadas em um resumo conciso. memory_compress_all remove entradas de baixa qualidade (sem tags, conteúdo curto) de forma determinística — sem LLM. Ambas reduzem a contagem de tokens.',
			},
			{
				q: 'Posso sincronizar a memória entre máquinas?',
				a: 'Sim. Use memory_export_gist para enviar entradas para um GitHub Gist, depois memory_import_gist em outra máquina. As entradas são mescladas automaticamente (união de tags, confiança máxima).',
			},
		],
	},
	whatNew: {
		title: 'Novidades na v3.5.0',
		subtitle: 'Fixação por prioridade, checkpoint de sessão, viés de sessão, memórias frias, prévia detalhada de mesclagem',
		cards: [
			{
				icon: '📌',
				title: 'Fixação por Prioridade',
				body: 'Fixe entradas com prioridade 1-5 — entradas com maior prioridade aparecem primeiro nos resultados de recall ordenados por prioridade. Compatível com o antigo booleano de fixação.',
				stats: ['Prioridade 1-5', 'Ordenado', 'Compatível'],
			},
			{
				icon: '⏱️',
				title: 'Checkpoint de Sessão',
				body: 'Crie um snapshot do estado atual da memória com TTL de 7d. Útil para referência de rollback durante sessões complexas longas. Use memory_checkpoint.',
				stats: ['memory_checkpoint', 'TTL 7d', 'Rollback'],
			},
			{
				icon: '🧬',
				title: 'Viés de Sessão no Recall',
				body: 'memory_recall, memory_search e memory_smart_recall agora aceitam sessionBias — aumenta entradas do branch git atual acima das demais.',
				stats: ['sessionBias', 'Branch git', 'Smart recall'],
			},
			{
				icon: '🥶',
				title: 'Memórias Frias nas Stats',
				body: 'memory_stats agora mostra memórias frias — entradas abaixo dos limites de qualidade e acesso — para você saber o que arquivar ou melhorar.',
				stats: ['memory_stats', 'Memórias frias', 'Limite qualidade'],
			},
			{
				icon: '🔍',
				title: 'Prévia Detalhada de Mesclagem',
				body: 'memory_merge_similar dryRun:true agora mostra quais entradas seriam mescladas, quais ficam, e como conteúdo e tags se combinam — sem surpresas.',
				stats: ['dryRun', 'Prévia mesclagem', 'Sem surpresas'],
			},
			{
				icon: '🧩',
				title: '35 Ferramentas MCP + 4 Recursos',
				body: 'Adiciona memory_checkpoint. Atualiza memory_pin com prioridade (1-5). Total: 35 ferramentas + 4 recursos.',
				stats: ['+1 ferramenta', '35 total'],
			},
		],
	},
	cta: {
		title: 'Pronto para dar memória ao seu agente?',
		subtitle: 'Instale em segundos e nunca mais reexplique contexto ao seu agente.',
		getStarted: 'Começar',
		viewGithub: 'Ver no GitHub',
	},
	footer: {
		text: 'Licença MIT — ',
	},
},
	de: {
	nav: {
		docs: 'Dokumentation',
		npm: 'npm',
		github: 'GitHub',
	},
	hero: {
		tagline: 'MCP-Speicherserver für KI-Coding-Agenten — Kontext über Sitzungen hinweg abrufen',
		subtitle: 'Dein Agent erinnert sich an Entscheidungen, Muster und Bugs zwischen Sitzungen.',
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
	features: {
		cards: [
			{
			icon: '🧩',
			title: '34 MCP-Tools + 4 Ressourcen',
			body: 'Vollständiges Speicher-Management über MCP — remember, recall, forget, stats, summary, archive, diff, suggest, smart_recall, encrypt, decrypt, captured, consolidate, sessions, compress, compress_all, primer, merge_sessions, export_gist, import_gist, merge_similar, graph_path, context_brief, context_generate, context_diff, context_focus, context_health, context_export, visualize, pin, unpin, search, tag. Plus Ressourcen für direktes Kontext-Lesen.',
				tags: ['remember', 'recall', 'context', 'diff'],
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
			{ number: '31', label: 'MCP-Tools' },
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
// ## Project — toon-memory v2.6.0
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
		title: 'Vorher vs Nachher',
		subtitle: 'Sieh, wie toon-memory deinen Workflow ändert',
		beforeTitle: 'Vorher',
		afterTitle: 'Nachher',
		before: [
			'Erklärungen in jeder Sitzung wiederholen',
			'Vergessen, warum eine Entscheidung getroffen wurde',
			'Im Git-Verlauf nach Kontext suchen',
			'Notizen zwischen Chats kopieren und einfügen',
		],
		after: [
			'Agent erinnert sich an alles',
			'Ein Aufruf gibt vollständigen Projekt-Kontext',
			'80% weniger Tool-Aufrufe pro Sitzung',
			'Kein Kontextverlust zwischen Sitzungen',
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
	tokenSavings: {
		title: '22% weniger Token, durch Design',
		subtitle: 'Das TOON-Format ist für LLMs gebaut, nicht für Menschen',
		stats: [
			{ num: '22.5%', cap: 'weniger Token als JSON' },
			{ num: '30.5%', cap: 'bei einem einzelnen Eintrag' },
			{ num: '1.3x', cap: 'schnelleres Parsen' },
		],
		note: 'Gemessen mit <code>gpt-tokenizer</code> (cl100k_base) über 16 repräsentative Speicher-Einträge, vergleicht das echte TOON-Format auf Disk mit kompaktem JSON. Reproduzierbar: <code>npm run bench</code>.',
	},
	benchmarks: {
		title: 'Benchmarks',
		subtitle: 'Token-Effizienz des TOON-Formats — gemessen, nicht angenommen',
		fewerTokens: 'weniger Token als JSON',
		onSingle: 'bei einem einzelnen Eintrag',
		entriesMeasured: 'Einträge gemessen',
		note: 'Gemessen mit <code>gpt-tokenizer</code> (cl100k_base) über 16 repräsentative Speicher-Einträge, vergleicht das echte TOON-Format auf Disk mit kompaktem JSON. Reproduzierbar: <code>npm run bench</code>.',
	},
	impactSection: {
		title: '80% weniger Tool-Calls pro Sitzung',
		subtitle:
			'Vier Benchmarks: Kompakter Recall spart 68%, volle Sitzung spart 80% Tool-Calls, Batch-Komprimierung spart 14%, System-Primer spart 58%.',
		stats: [
			{ num: '80%', cap: 'weniger Tool-Calls (25 → 5)' },
			{ num: '68%', cap: 'weniger Tokens (kompakter Recall)' },
			{ num: '58%', cap: 'weniger Tokens (System-Primer)' },
			{ num: '14%', cap: 'weniger Tokens (Batch-Komprimierung)' },
		],
		note: 'Vollständiger Sitzungs-Benchmark: Start → Debug → Implementierung → Review → Abschluss. <code>context_*</code>-Tools tauschen ~318 zusätzliche Tokens gegen 7 weniger Aufrufe — reicherer Kontext bedeutet weniger Nachlesevorgänge. Reproduzierbar: <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
	},
	tools: {
		title: '34 MCP-Tools, 4 Ressourcen',
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
			{ name: 'memory_remember', title: 'Im Speicher speichern', desc: 'Speichere Entscheidungen, Muster, Bugs oder Wissen — persistiert über Sitzungen mit automatischer Qualitätsbewertung.', group: 'core' },
			{ name: 'memory_recall', title: 'Speicher durchsuchen', desc: 'Befrage den Wissensgraph vor dem Datei-Lesen. Qualitätsgewichtete Ergebnisse.', group: 'core' },
			{ name: 'memory_forget', title: 'Aus Speicher löschen', desc: 'Entfernt einen Eintrag per Key oder ID.', group: 'core' },
			{ name: 'memory_stats', title: 'Speicher-Statistiken', desc: 'Zeigt Statistiken über den Projekt-Speicher inklusive Qualitätsverteilung und meistbesuchte Einträge.', group: 'core' },
			{ name: 'memory_diff', title: 'Speicher-Diff', desc: 'Sieh, was sich seit deiner letzten Sitzung geändert hat.', group: 'core' },
			{ name: 'memory_suggest', title: 'Ähnliche vorschlagen', desc: 'Zeigt verwandte Einträge für einen gegebenen Kontext.', group: 'core' },
			{ name: 'memory_summary', title: 'Datei-Zusammenfassung', desc: 'Speichere oder rufe eine Datei-Zusammenfassung ab, um Token zu sparen.', group: 'core' },
			{ name: 'memory_archive', title: 'Alte archivieren', desc: 'Verschiebt Einträge älter als 30 Tage, um den Speicher sauber zu halten.', group: 'core' },
			{ name: 'memory_smart_recall', title: 'Smart Recall', desc: 'Einheitliche Suche kombiniert BM25 + Graph-Zentralität + Qualität + Frische in einem Aufruf.', group: 'search' },
			{ name: 'memory_captured', title: 'Erfasste Aktivität', desc: 'Zeigt automatisch erfasste Hook-Aktivität an — befördere Beobachtungen zum Speicher.', group: 'search' },
			{ name: 'memory_consolidate', title: 'Konsolidieren', desc: 'Führt doppelte Einträge mit identischem Inhalt deterministisch zusammen. Near-Duplicate-Erkennung über Jaccard-Ähnlichkeit.', group: 'search' },
			{ name: 'context_brief', title: 'Kontext-Briefing', desc: 'Ein-Aufruf-Kontext-Briefing: Speicher + Sitzungen + Gesundheit in kompaktem Markdown. Null LLM.', group: 'context' },
			{ name: 'context_generate', title: 'Vollständiges Projektbriefing', desc: 'Ein-Aufruf-Briefing: Projektstruktur + Git-Zustand + Speicher + Sitzungen. Ersetzt 6 manuelle Aufrufe. Spart 93% Token.', group: 'context' },
			{ name: 'context_diff', title: 'Inkrementelles Briefing', desc: 'Git-Commits + geänderte Dateien + neue/aktualisierte Speicher-Einträge seit letzter Sitzung. Spart 72% Token.', group: 'context' },
			{ name: 'context_focus', title: 'Gezieltes Briefing', desc: 'Relevanter Speicher + verwandte Dateien + Aufrufer + Testdateien für eine bestimmte Anfrage.', group: 'context' },
			{ name: 'context_health', title: 'Gesundheits-Audit', desc: 'Verwaiste Links, Duplikate, defekte Dateiverweise, abgelaufene TTL, veraltete Sitzungen. Score 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Als Markdown exportieren', desc: 'Exportiert Speicher als injizierbares Markdown für System-Prompts. Spart 82% Token.', group: 'context' },
			{ name: 'memory_compress', title: 'LLM-Komprimierung', desc: 'LLM-gestützte Zwei-Schritt-Komprimierung: Zusammenfassen + Überschreiben. Verwendet Anthropic/OpenAI CLI wenn verfügbar.', group: 'compress' },
			{ name: 'memory_compress_all', title: 'Batch-Komprimierung', desc: 'Batch-Komprimierung: Überschreibt alle Einträge unter 100 Token mit komprimierter Version. Deterministisch, kein LLM.', group: 'compress' },
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
		],
	},
	graphSection: {
		title: 'Dein Speicher als Graph',
		subtitle:
			'Verbinde Entscheidungen mit Specs, Bugs und Architektur. Recall gibt den richtigen Kontext zurück — nicht nur Übereinstimmung.',
		points: [
			'Verbinde Einträge mit `links` oder `[[key]]`-Referenzen — keine Embeddings, kein LLM',
			'`memory_recall({ mode: "graph" })` erweitert einen beziehungsbewussten Subgraphen',
			'Weniger Token, höhere Präzision, vollständig offline und deterministisch',
		],
		caption: 'Eine Entscheidung verbreitet sich auf Spec und Architektur — der Agent sieht das Gesamtbild.',
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
				a: 'Eine persistente Speicherschicht für KI-Coding-Agenten mit 34 MCP-Tools. Es speichert Entscheidungen, Muster, Bugs und Kontext in einem kompakten TOON-Format, damit dein Agent sich an alles zwischen Sitzungen erinnert — mit 80% weniger Tool-Aufrufen pro Sitzung.',
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
			a: 'memory_compress lässt ein LLM verwandte Einträge zu einer knappen Zusammenfassung verdichten. memory_compress_all entfernt Einträge niedriger Qualität (kein Tags, kurzer Inhalt) deterministisch — kein LLM nötig. Beide reduzieren die Token-Anzahl.',
		},
		{
			q: 'Kann ich Speicher zwischen Maschinen synchronisieren?',
			a: 'Ja. Verwenden Sie memory_export_gist, um Einträge an einen GitHub Gist zu senden, dann memory_import_gist auf einer anderen Maschine. Einträge werden automatisch fusioniert (Vereinigung von Tags, maximale Konfidenz).',
		},
	],
},
whatNew: {
	title: 'Neu in v3.5.0',
	subtitle: 'Priorisierte Fixierung, Sitzungs-Checkpoint, Sitzungs-Bias, kalte Speicher, detaillierte Zusammenführungsvorschau',
	cards: [
		{
			icon: '📌',
			title: 'Priorisierte Fixierung',
			body: 'Fixiere Einträge mit Priorität 1-5 — Einträge mit höherer Priorität erscheinen zuerst in den Recall-Ergebnissen, sortiert nach Priorität. Rückwärtskompatibel mit alter boolescher Fixierung.',
			stats: ['Priorität 1-5', 'Sortiert', 'Rückwärtskompatibel'],
		},
		{
			icon: '⏱️',
			title: 'Sitzungs-Checkpoint',
			body: 'Erstelle einen Snapshot des aktuellen Speicherzustands mit 7d TTL. Nützlich als Rollback-Referenz während langer komplexer Sitzungen. Verwende memory_checkpoint.',
			stats: ['memory_checkpoint', '7d TTL', 'Rollback'],
		},
		{
			icon: '🧬',
			title: 'Sitzungs-Bias im Recall',
			body: 'memory_recall, memory_search und memory_smart_recall akzeptieren jetzt sessionBias — hebt Einträge des aktuellen Git-Branches über andere hervor.',
			stats: ['sessionBias', 'Git-Branch', 'Smart recall'],
		},
		{
			icon: '🥶',
			title: 'Kalte Speicher in Stats',
			body: 'memory_stats zeigt jetzt kalte Speicher — Einträge unterhalb der Qualitäts- und Zugriffsschwellenwerte — damit du weißt, was archiviert oder verbessert werden sollte.',
			stats: ['memory_stats', 'Kalte Speicher', 'Qualitätsschwelle'],
		},
		{
			icon: '🔍',
			title: 'Detaillierte Zusammenführungsvorschau',
			body: 'memory_merge_similar dryRun:true zeigt jetzt, welche Einträge zusammengeführt würden, welche bleiben und wie Inhalt und Tags kombiniert werden — keine Überraschungen.',
			stats: ['dryRun', 'Zusammenführungsvorschau', 'Keine Überraschungen'],
		},
		{
			icon: '🧩',
			title: '35 MCP-Tools + 4 Ressourcen',
			body: 'Fügt memory_checkpoint hinzu. Aktualisiert memory_pin mit Priorität (1-5). Gesamt: 35 Tools + 4 Ressourcen.',
			stats: ['+1 Tool', '35 gesamt'],
		},
	],
},
cta: {
	title: 'Bereit, deinem Agenten einen Speicher zu geben?',
	subtitle: 'In Sekunden installieren und nie wieder Kontext an deinen Agenten erklären.',
	getStarted: 'Loslegen',
	viewGithub: 'Auf GitHub ansehen',
},
	footer: {
		text: 'MIT-Lizenz — ',
	},
},
	fr: {
	nav: {
		docs: 'Documentation',
		npm: 'npm',
		github: 'GitHub',
	},
	hero: {
		tagline: 'Serveur de mémoire MCP pour agents de code IA — récupérez le contexte entre les sessions',
		subtitle: 'Votre agent se souvient des décisions, motifs et bugs entre les sessions.',
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
	features: {
		cards: [
			{
			icon: '🧩',
			title: '34 outils MCP + 4 ressources',
			body: 'Gestion complète de la mémoire via MCP — remember, recall, forget, stats, summary, archive, diff, suggest, smart_recall, encrypt, decrypt, captured, consolidate, sessions, compress, compress_all, primer, merge_sessions, export_gist, import_gist, merge_similar, graph_path, context_brief, context_generate, context_diff, context_focus, context_health, context_export, visualize, pin, unpin, search, tag. Plus des ressources pour la lecture directe du contexte.',
				tags: ['remember', 'recall', 'context', 'diff'],
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
			{ number: '31', label: 'Outils MCP' },
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
		title: 'Avant vs Après',
		subtitle: 'Voyez comment toon-memory change votre flux de travail',
		beforeTitle: 'Avant',
		afterTitle: 'Après',
		before: [
			'Répéter les explications à chaque session',
			'Oublier pourquoi une décision a été prise',
			'Fouiller l\'historique git pour le contexte',
			'Copier-coller des notes entre les chats',
		],
		after: [
			'L\'agent se souvient de tout',
			'Un seul appel donne le contexte complet du projet',
			'80% moins d\'appels d\'outil par session',
			'Zéro perte de contexte entre les sessions',
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
	tokenSavings: {
		title: '22% moins de tokens, par conception',
		subtitle: 'Le format TOON est conçu pour les LLMs, pas pour les humains',
		stats: [
			{ num: '22.5%', cap: 'moins de tokens que JSON' },
			{ num: '30.5%', cap: 'sur une seule entrée' },
			{ num: '1.3x', cap: 'plus rapide à parser' },
		],
		note: 'Mesuré avec <code>gpt-tokenizer</code> (cl100k_base) sur 16 entrées de mémoire représentatives, comparant le format TOON réel sur disque au JSON compact. Reproductible : <code>npm run bench</code>.',
	},
	benchmarks: {
		title: 'Benchmarks',
		subtitle: 'Efficacité token du format TOON — mesuré, pas supposé',
		fewerTokens: 'moins de tokens que JSON',
		onSingle: 'sur une seule entrée',
		entriesMeasured: 'entrées mesurées',
		note: 'Mesuré avec <code>gpt-tokenizer</code> (cl100k_base) sur 16 entrées de mémoire représentatives, comparant le format TOON réel sur disque au JSON compact. Reproductible : <code>npm run bench</code>.',
	},
	impactSection: {
		title: '80% moins d\'appels d\'outils par session',
		subtitle:
			'Quatre benchmarks : recall compact économise 68%, session complète économise 80% d\'appels, compression par lot économise 14%, system primer économise 58%.',
		stats: [
			{ num: '80%', cap: 'moins d\'appels (25 → 5)' },
			{ num: '68%', cap: 'moins de tokens (recall compact)' },
			{ num: '58%', cap: 'moins de tokens (system primer)' },
			{ num: '14%', cap: 'moins de tokens (compression par lot)' },
		],
		note: 'Benchmark de session complète : démarrage → débogage → implémentation → révision → clôture. Les outils <code>context_*</code> échangent ~318 tokens supplémentaires pour 7 appels en moins — un contexte plus riche signifie moins de re-lectures. Reproductible : <code>npm run bench:full</code>, <code>npm run bench:primer</code>, <code>npm run bench:compress-all</code>.',
	},
	tools: {
		title: '34 outils MCP, 4 ressources',
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
			{ name: 'memory_remember', title: 'Enregistrer en mémoire', desc: 'Stockez décisions, motifs, bugs ou connaissances — persistant entre les sessions avec notation de qualité automatique.', group: 'core' },
			{ name: 'memory_recall', title: 'Rechercher en mémoire', desc: 'Interrogez le graphe de connaissances avant de lire les fichiers. Résultats pondérés par la qualité.', group: 'core' },
			{ name: 'memory_forget', title: 'Supprimer de la mémoire', desc: 'Supprime une entrée par key ou id.', group: 'core' },
			{ name: 'memory_stats', title: 'Statistiques', desc: 'Affiche les statistiques de la mémoire du projet, incluant la distribution de qualité et les entrées les plus consultées.', group: 'core' },
			{ name: 'memory_diff', title: 'Diff de mémoire', desc: 'Voyez ce qui a changé depuis votre dernière session.', group: 'core' },
			{ name: 'memory_suggest', title: 'Suggérer des liés', desc: 'Affiche les entrées liées pour un contexte donné.', group: 'core' },
			{ name: 'memory_summary', title: 'Résumé de fichier', desc: 'Enregistrez ou récupérez un résumé de fichier pour économiser des tokens.', group: 'core' },
			{ name: 'memory_archive', title: 'Archiver les anciens', desc: 'Déplace les entrées de plus de 30 jours pour garder la mémoire propre.', group: 'core' },
			{ name: 'memory_smart_recall', title: 'Rappel intelligent', desc: 'Recherche unifiée combinant BM25 + centralité + qualité + fraîcheur en un seul appel.', group: 'search' },
			{ name: 'memory_captured', title: 'Activité capturée', desc: 'Affiche le journal d\'activité capturé par les hooks — promouvez les observations en mémoire.', group: 'search' },
			{ name: 'memory_consolidate', title: 'Consolider', desc: 'Fusionne les entrées en doublon avec un contenu identique de façon déterministe. Détection de quasi-doublons via similarité de Jaccard.', group: 'search' },
			{ name: 'context_brief', title: 'Brief de contexte', desc: 'Brief de contexte en un appel : mémoire + sessions + santé en markdown compact. Zéro LLM.', group: 'context' },
			{ name: 'context_generate', title: 'Brief complet du projet', desc: 'Brief en un appel : structure du projet + état git + mémoire + sessions. Remplace 6 appels manuels. Économise 93% de tokens.', group: 'context' },
			{ name: 'context_diff', title: 'Brief incrémental', desc: 'Commits git + fichiers modifiés + mémoire nouvelle/mise à jour depuis la dernière session. Économise 72% de tokens.', group: 'context' },
			{ name: 'context_focus', title: 'Brief ciblé', desc: 'Mémoire pertinente + fichiers liés + appelants + fichiers de test pour une requête spécifique.', group: 'context' },
			{ name: 'context_health', title: 'Audit santé', desc: 'Liens orphelins, doublons, références cassées, TTL expirés, sessions obsolètes. Score 0–100.', group: 'context' },
			{ name: 'context_export', title: 'Exporter en Markdown', desc: 'Exporte la mémoire en markdown injectable pour les system prompts. Économise 82% de tokens.', group: 'context' },
			{ name: 'memory_compress', title: 'Compression LLM', desc: 'Compression en deux étapes par LLM : résumer + écraser. Utilise Anthropic/OpenAI CLI si disponible.', group: 'compress' },
			{ name: 'memory_compress_all', title: 'Compression par lot', desc: 'Compression par lot : écrase toutes les entrées sous 100 tokens avec une version compressée. Déterministe, sans LLM.', group: 'compress' },
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
		],
	},
	graphSection: {
		title: 'Votre mémoire, en graphe',
		subtitle:
			'Connectez les décisions à leurs specs, bugs et architecture. Le rappel retourne le bon contexte — pas seulement les correspondances de mots.',
		points: [
			'Connectez les entrées avec `links` ou références `[[key]]` — sans embeddings, sans LLM',
			'`memory_recall({ mode: "graph" })` étend un sous-graphe conscient des relations',
			'Moins de tokens, plus de précision, totalement offline et déterministe',
		],
		caption: 'Une décision se propage à sa spec et architecture — l\'agent voit le tableau complet.',
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
				a: 'Une couche de mémoire persistante pour les agents de code IA avec 34 outils MCP. Elle stocke les décisions, motifs, bugs et contexte dans un format TOON compact pour que votre agent se souvienne de tout entre les sessions — avec 80% moins d\'appels d\'outil par session.',
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
			a: 'memory_compress permet à un LLM de résumer des entrées similaires en un résumé concis. memory_compress_all supprime les entrées de faible qualité (pas de tags, contenu court) de manière déterministe — sans LLM. Les deux réduisent le nombre de tokens.',
		},
		{
			q: 'Puis-je synchroniser la mémoire entre machines ?',
			a: 'Oui. Utilisez memory_export_gist pour pousser les entrées vers un GitHub Gist, puis memory_import_gist sur une autre machine. Les entrées fusionnent automatiquement (union des tags, confiance maximale).',
		},
	],
},
whatNew: {
	title: 'Nouveautés dans v3.5.0',
	subtitle: 'Épinglage prioritaire, point de contrôle de session, biais de session, mémoires froides, aperçu détaillé de la fusion',
	cards: [
		{
			icon: '📌',
			title: 'Épinglage Prioritaire',
			body: 'Épinglez des entrées avec priorité 1-5 — les entrées à priorité plus élevée apparaissent en premier dans les résultats de recall triés par priorité. Rétrocompatible avec l\'ancien booléen d\'épinglage.',
			stats: ['Priorité 1-5', 'Trié', 'Rétrocompatible'],
		},
		{
			icon: '⏱️',
			title: 'Point de Contrôle de Session',
			body: 'Créez un instantané de l\'état actuel de la mémoire avec une TTL de 7j. Utile pour référence de restauration lors de sessions complexes longues. Utilisez memory_checkpoint.',
			stats: ['memory_checkpoint', 'TTL 7j', 'Restauration'],
		},
		{
			icon: '🧬',
			title: 'Biais de Session dans le Recall',
			body: 'memory_recall, memory_search et memory_smart_recall acceptent maintenant sessionBias — booste les entrées de la branche git actuelle.',
			stats: ['sessionBias', 'Branche git', 'Smart recall'],
		},
		{
			icon: '🥶',
			title: 'Mémoires Froides dans les Stats',
			body: 'memory_stats affiche maintenant les mémoires froides — entrées sous les seuils de qualité et d\'accès — pour savoir quoi archiver ou améliorer.',
			stats: ['memory_stats', 'Mémoires froides', 'Seuil qualité'],
		},
		{
			icon: '🔍',
			title: 'Aperçu Détaillé de la Fusion',
			body: 'memory_merge_similar dryRun:true montre maintenant quelles entrées seraient fusionnées, lesquelles restent, et comment le contenu et les tags se combinent — sans surprises.',
			stats: ['dryRun', 'Aperçu fusion', 'Sans surprises'],
		},
		{
			icon: '🧩',
			title: '35 Outils MCP + 4 Ressources',
			body: 'Ajoute memory_checkpoint. Met à jour memory_pin avec priorité (1-5). Total : 35 outils + 4 ressources.',
			stats: ['+1 outil', '35 total'],
		},
	],
},
cta: {
	title: 'Prêt à donner une mémoire à votre agent ?',
	subtitle: 'Installez en quelques secondes et n\'expliquez plus jamais le contexte à votre agent.',
	getStarted: 'Commencer',
	viewGithub: 'Voir sur GitHub',
},
	footer: {
		text: 'Licence MIT — ',
	},
},
} as const;

export type Lang = keyof typeof content;

export function getContent(lang: string): (typeof content)[Lang] {
	return (content as Record<string, (typeof content)[Lang]>)[lang] ?? content.en;
}
