# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: developers who spend multiple sessions per day with AI coding agents (OpenCode, Claude Code, Cursor, Windsurf, Cline, Continue, Codex CLI, Gemini CLI, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro, VS Code). Each session loses all context from previous sessions — architecture decisions, bug fixes, framework choices, and team conventions must be re-explained every time.

Secondary: small teams (2-10 developers) who need shared project context across multiple agent sessions. Memory is per-project, so the team's accumulated decisions survive across all members' sessions.

## Product Purpose

toon-memory is the **Continuity Layer for AI Agents** — a lightweight system that preserves a project's knowledge, decisions, and conventions across sessions, so every session starts where the last one ended. It exists because developers waste time re-explaining the same architecture decisions, bug fixes, and conventions to their AI agents in every new session.

Success means the agent remembers everything from previous sessions — what was decided, why it was decided, what was rejected, and what was learned — without any cloud service, API key, or configuration beyond installation.

## Positioning

toon-memory is the Continuity Layer: AI agents shouldn't have to relearn your project every session. It is the only persistent memory layer for AI agents that requires zero configuration, works 100% offline with no server or API dependency, and is always free (MIT license). Competitors require cloud accounts, API keys, or server infrastructure. toon-memory installs once, runs locally, and the agent has full continuity from the first session.

Unlike LLM, RAG, or vector-database memory, toon-memory is a deterministic project-knowledge layer: it preserves the "why" behind decisions, the conventions your team follows, and the bugs you've already fixed — not just facts, but the working knowledge of the project itself. The native TOON format uses 22% fewer tokens than JSON, and the context generation tools (`context_*`) reduce tool calls by 80% compared to manual recall patterns — saving real money per session.

## Operating Context

- Developers install toon-memory via `curl | sh`, `npm i -g toon-memory`, or PowerShell
- They run `npx toon-memory` to configure which agents to set up (interactive menu)
- The agent automatically remembers decisions, patterns, bugs, and knowledge across sessions
- Memory lives in `.toon-memory/` per-project, gitignored by default
- No server runs — toon-memory is an MCP server that the agent connects to via stdio
- Developers may also use `toon-memory watch` for periodic backups, or `toon-memory export/import` for portability

## Capabilities and Constraints

- 20 MCP tools for full memory lifecycle: remember, recall, forget, archive, encrypt, sessions, smart recall, context generation (5 tools), stats, summary, diff, and more
- MCP Resources for read-only context (System Primer auto-generated knowledge map)
- 15 agent support with automatic configuration
- TOON format: 22% fewer tokens than JSON, purpose-built for LLM comprehension
- BM25 + graph centrality ranking for recall, no embeddings required
- AES-256-GCM encryption for sensitive memory entries
- Auto-archive of old/expired entries, auto-tagging from project dependencies
- Memory graph with relationship-aware subgraph expansion
- Quality scoring (0-1) and confidence tracking per entry
- Zero LLM calls in all tool logic — fully deterministic, no API keys needed
- Zero shell commands — reads `.git/` directly via Node.js fs + zlib
- Requires Node.js >= 18; no external services or databases

## Brand Commitments

- **Always free**: MIT license, no premium tier, no SaaS, no cloud dependency
- **Zero configuration**: Install and use, no manual setup beyond selecting agents
- **Privacy-first**: All memory stays local, no telemetry, no analytics, no external calls
- **Developer experience**: Install in one command, configure in one menu, forget it exists while it works

## Evidence on Hand

- 199 tests across 12 test files, all green
- Benchmark data: 68.5% token savings on recall, 84.8% on context_* tools, 80% fewer tool calls in full session simulation
- Real-world use cases documented: design decisions, framework choices, bug fixes, architecture notes, onboarding, team context
- GitHub repository with CI/CD, npm publishing via GitHub Actions
- Bilingual documentation (English/Spanish) at https://luiggival08.github.io/toon-memory/

## Product Principles

1. **Token efficiency is the product** — every design decision optimizes for fewer tokens, fewer tool calls, lower cost per session
2. **Zero dependencies** — no servers, no APIs, no cloud, no telemetry, nothing beyond Node.js
3. **Deterministic over intelligent** — all heuristics are pure logic, no LLM calls in tool implementation
4. **Install and forget** — the product succeeds when the developer never thinks about it again
5. **Per-project by default** — each project gets its own isolated memory, context stays relevant
