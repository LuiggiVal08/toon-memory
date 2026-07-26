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
					title: '20 MCP Tools + 3 Resources',
					body: 'Full memory management via MCP — remember, recall, forget, stats, summary, archive, diff, suggest, smart_recall, encrypt, decrypt, captured, consolidate, sessions, context_brief, context_generate, context_diff, context_focus, context_health, context_export. Plus resources for direct context reading.',
					tags: ['remember', 'recall', 'context', 'diff'],
				},
				{
					icon: '⭐',
					title: 'Multi-Agent',
					body: 'Works with all major AI coding agents. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue — zero configuration.',
					tags: ['OpenCode', 'Claude', 'Cursor'],
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
					body: 'Auto-tag inference from a built-in vocabulary plus your project dependencies, quality scoring, confidence scores, merge-dedup, related entry suggestions, memory diff, and configurable TTL for temporary context.',
					stats: ['Auto-tags', 'Quality', 'Merge-dedup'],
				},
				{
					icon: '🔒',
					title: 'Encryption',
					body: 'AES-256-GCM for sensitive data. Auto-archive old entries. Watch mode for automatic backup every N minutes.',
					stats: ['AES-256-GCM', 'Auto-backup'],
				},
			],
		},
		agents: {
			title: 'Works with 15+ AI coding agents',
			subtitle: 'Zero configuration — toon-memory auto-detects and configures each one',
		},
		stats: {
			items: [
				{ number: '20', label: 'MCP Tools' },
				{ number: '15', label: 'Agents' },
				{ number: '80%', label: 'Fewer Tool Calls / session' },
				{ number: '0', label: 'Config Needed' },
			],
		},
		howItWorks: {
			title: 'How does it work?',
			subtitle: 'Four steps from amnesia to memory',
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
					title: 'Context',
					body: 'One call gives your agent everything: project, git, memory, sessions. 80% fewer tool calls.',
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
			title: '80% fewer tool calls per session',
			subtitle:
				'Simulated full session: 25 tool calls → 5 with context_* tools. 47% fewer tokens, 80% less latency.',
			stats: [
				{ num: '80%', cap: 'fewer tool calls (25 → 5)' },
				{ num: '47%', cap: 'fewer tokens per session' },
				{ num: '$20', cap: '/month saved (20 sessions/day)' },
			],
			note: 'Full session benchmark: session start → debug → implement → review → wrap-up. <code>context_*</code> tools trade ~318 extra tokens for 7 fewer calls — richer context means fewer follow-up reads. Reproducible: <code>npm run bench:full</code>.',
		},
		tools: {
			title: '20 MCP tools, 3 resources',
			subtitle: 'Everything your agent needs to remember, recall, and reason',
			resourcesLabel: 'Resources:',
			cards: [
				{ name: 'memory_remember', title: 'Save to Memory', desc: 'Store decisions, patterns, bugs, or knowledge — persisted across sessions with auto quality scoring.' },
				{ name: 'memory_recall', title: 'Search Memory', desc: 'Query the knowledge graph before reading files. Quality-weighted results.' },
				{ name: 'memory_forget', title: 'Delete from Memory', desc: 'Remove an entry by key or id.' },
				{ name: 'memory_stats', title: 'Memory Stats', desc: 'Show statistics about the project memory, including quality distribution.' },
				{ name: 'memory_diff', title: 'Memory Diff', desc: 'See what changed since your last session.' },
				{ name: 'memory_suggest', title: 'Suggest Related', desc: 'Surface related entries for a given context.' },
				{ name: 'memory_summary', title: 'File Summary', desc: 'Save or retrieve a file summary to save tokens.' },
				{ name: 'memory_archive', title: 'Archive Old', desc: 'Move entries older than 30 days to keep memory clean.' },
				{ name: 'memory_smart_recall', title: 'Smart Recall', desc: 'Unified search combining BM25 + graph centrality + quality score + freshness in one call.' },
				{ name: 'memory_captured', title: 'Captured Activity', desc: 'View auto-captured hook activity log — promote observations to memory.' },
				{ name: 'memory_consolidate', title: 'Consolidate', desc: 'Merge duplicate entries with identical content deterministically.' },
				{ name: 'memory_sessions', title: 'Sessions', desc: 'Show active agent sessions and detect soft conflicts.' },
				{ name: 'context_brief', title: 'Context Briefing', desc: 'One-call context briefing: memory + sessions + health in compact markdown. Zero LLM.' },
				{ name: 'context_generate', title: 'Full Project Briefing', desc: 'One-call briefing: project structure + git state + memory + sessions. Replaces 6 manual calls. Saves 93% tokens.' },
				{ name: 'context_diff', title: 'Incremental Briefing', desc: 'Git commits + modified files + new/updated memory since last session. Saves 72% tokens.' },
				{ name: 'context_focus', title: 'Targeted Briefing', desc: 'Relevant memory + related files + callers + test files for a specific query.' },
				{ name: 'context_health', title: 'Health Audit', desc: 'Orphan links, duplicates, broken file refs, expired TTL, stale sessions. Score 0–100.' },
				{ name: 'context_export', title: 'Export as Markdown', desc: 'Export memory as injectable markdown for system prompts. Saves 82% tokens.' },
				{ name: 'memory_encrypt', title: 'Enable Encryption', desc: 'AES-256-GCM encryption with an auto-generated key.' },
				{ name: 'memory_decrypt', title: 'Disable Encryption', desc: 'Decrypt and disable encryption.' },
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
					a: 'A persistent memory layer for AI coding agents with 20 MCP tools. It stores decisions, patterns, bugs, and context in a compact TOON format so your agent remembers everything between sessions — with 80% fewer tool calls per session.',
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
					title: '20 herramientas MCP + 3 recursos',
					body: 'Gestión completa de memoria vía MCP — remember, recall, forget, stats, summary, archive, diff, suggest, smart_recall, encrypt, decrypt, captured, consolidate, sessions, context_brief, context_generate, context_diff, context_focus, context_health, context_export. Más recursos para lectura directa de contexto.',
					tags: ['remember', 'recall', 'context', 'diff'],
				},
				{
					icon: '⭐',
					title: 'Multi-agente',
					body: 'Funciona con todos los agentes de IA principales. OpenCode, VS Code, Claude, Cursor, Windsurf, Cline, Continue — sin configuración.',
					tags: ['OpenCode', 'Claude', 'Cursor'],
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
					body: 'Inferencia automática de etiquetas desde un vocabulario integrado más tus dependencias del proyecto, puntuación de calidad, puntuaciones de confianza, merge-dedup, sugerencias de entradas relacionadas, diff de memoria y TTL configurable para contexto temporal.',
					stats: ['Auto-etiquetas', 'Calidad', 'Merge-dedup'],
				},
				{
					icon: '🔒',
					title: 'Encriptación',
					body: 'AES-256-GCM para datos sensibles. Auto-archivado de entradas antiguas. Modo watch para backup automático cada N minutos.',
					stats: ['AES-256-GCM', 'Auto-backup'],
				},
			],
		},
		agents: {
			title: 'Funciona con 15+ agentes de IA',
			subtitle: 'Sin configuración — toon-memory detecta y configura cada uno automáticamente',
		},
		stats: {
			items: [
				{ number: '20', label: 'Herramientas MCP' },
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
			title: '80% menos llamadas por sesión',
			subtitle:
				'Sesión completa simulada: 25 tool calls → 5 con context_*. 47% menos tokens, 80% menos latencia.',
			stats: [
				{ num: '80%', cap: 'menos tool calls (25 → 5)' },
				{ num: '47%', cap: 'menos tokens por sesión' },
				{ num: '$20', cap: '/mes ahorrado (20 sesiones/día)' },
			],
			note: 'Benchmark de sesión completa: inicio → debug → implementar → review → cierre. Las herramientas <code>context_*</code> intercambian ~318 tokens extra por 7 llamadas menos — contexto más rico significa menos re-lecturas. Reproducible: <code>npm run bench:full</code>.',
		},
		tools: {
			title: '20 herramientas MCP, 3 recursos',
			subtitle: 'Todo lo que tu agente necesita para recordar, recuperar y razonar',
			resourcesLabel: 'Recursos:',
			cards: [
				{ name: 'memory_remember', title: 'Guardar en memoria', desc: 'Almacena decisiones, patrones, bugs o conocimiento — persistente entre sesiones con puntuación de calidad automática.' },
				{ name: 'memory_recall', title: 'Buscar en memoria', desc: 'Consulta el grafo de conocimiento antes de leer archivos. Resultados ponderados por calidad.' },
				{ name: 'memory_forget', title: 'Eliminar de memoria', desc: 'Elimina una entrada por key o id.' },
				{ name: 'memory_stats', title: 'Estadísticas', desc: 'Muestra estadísticas sobre la memoria del proyecto, incluyendo distribución de calidad.' },
				{ name: 'memory_diff', title: 'Diff de memoria', desc: 'Mira qué cambió desde tu última sesión.' },
				{ name: 'memory_suggest', title: 'Sugerir relacionados', desc: 'Muestra entradas relacionadas para un contexto dado.' },
				{ name: 'memory_summary', title: 'Resumen de archivo', desc: 'Guarda o recupera un resumen de archivo para ahorrar tokens.' },
				{ name: 'memory_archive', title: 'Archivar antiguos', desc: 'Mueve entradas de más de 30 días para mantener la memoria limpia.' },
				{ name: 'memory_smart_recall', title: 'Recuperación inteligente', desc: 'Búsqueda unificada combinando BM25 + centralidad + calidad + frescura en una sola llamada.' },
				{ name: 'memory_captured', title: 'Actividad capturada', desc: 'Muestra el log de actividad capturado por hooks — promueve observaciones a memoria.' },
				{ name: 'memory_consolidate', title: 'Consolidar', desc: 'Combina entradas duplicadas con contenido idéntico de forma determinista.' },
				{ name: 'memory_sessions', title: 'Sesiones', desc: 'Muestra sesiones de agente activas y detecta conflictos suaves.' },
				{ name: 'context_brief', title: 'Briefing de contexto', desc: 'Briefing de contexto en una sola llamada: memoria + sesiones + salud en markdown compacto. Cero LLM.' },
				{ name: 'context_generate', title: 'Briefing completo', desc: 'Briefing en una llamada: estructura del proyecto + estado git + memoria + sesiones. Reemplaza 6 llamadas manuales. Ahorra 93% tokens.' },
				{ name: 'context_diff', title: 'Briefing incremental', desc: 'Commits git + archivos modificados + memoria nueva/actualizada desde la última sesión. Ahorra 72% tokens.' },
				{ name: 'context_focus', title: 'Briefing dirigido', desc: 'Memoria relevante + archivos relacionados + callers + archivos de test para una query específica.' },
				{ name: 'context_health', title: 'Auditoría de salud', desc: 'Links huérfanos, duplicados, referencias rotas, TTL expirados, sesiones obsoletas. Puntaje 0–100.' },
				{ name: 'context_export', title: 'Exportar como Markdown', desc: 'Exporta memoria como markdown inyectable para system prompts. Ahorra 82% tokens.' },
				{ name: 'memory_encrypt', title: 'Habilitar encriptación', desc: 'Encriptación AES-256-GCM con clave autogenerada.' },
				{ name: 'memory_decrypt', title: 'Deshabilitar encriptación', desc: 'Desencripta y deshabilita la encriptación.' },
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
} as const;

export type Lang = keyof typeof content;

export function getContent(lang: string): (typeof content)[Lang] {
	return (content as Record<string, (typeof content)[Lang]>)[lang] ?? content.en;
}
