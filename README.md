# toon-memory

> Persistent memory for AI coding agents — remember decisions, patterns, and bugs between sessions.

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://luiggival08.github.io/toon-memory/)

---

## Table of Contents

- [What is toon-memory?](#what-is-toon-memory)
- [Blog Post](#blog-post)
- [Features](#features)
- [Quick Start](#quick-start)
- [Supported Agents](#supported-agents)
- [MCP Tools](#mcp-tools)
- [Coordinación multi-sesión](#coordinación-multi-sesión)
- [Memory Graph (recall basado en grafo)](#memory-graph-recall-basado-en-grafo)
- [Tips & Best Practices](#tips--best-practices)
- [CLI Commands](#cli-commands)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [Why TOON?](#why-toon)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## What is toon-memory?

Ever had that feeling where your AI agent forgets everything from yesterday's session? You explain the same architecture decision for the third time, and it still suggests the approach you already rejected?

**toon-memory fixes this.** It gives your AI agent a persistent memory that survives restarts, so it actually learns from your project over time.

📖 **[Read the documentation](https://luiggival08.github.io/toon-memory/)**

### Real-world use cases

| Scenario | What toon-memory does |
|----------|----------------------|
| Design debates | "We chose Redis over Memcached because of pub/sub support" |
| Framework choices | "This project uses Zod for validation, not Joi" |
| Bug fixes | "Redis pool exhaustion — fix was max_connections=20" |
| Architecture notes | "Broker service uses RESP protocol, not HTTP" |
| Onboarding | "The deploy script lives in scripts/deploy.sh" |
| Team context | "PR #142 reverted the caching change — don't re-add it" |

---

## Blog Post

Read [How toon-memory Makes Your AI Agent Smarter](https://luiggival08.github.io/toon-memory/blog) to see a real-world demo of persistent memory in action.

---

## Features

- **13 MCP tools** — Full memory management via Model Context Protocol, including `memory_sessions` for multi-session coordination
- **MCP Resources** — Read memory as context without tool invocations
- **15 agents supported** — OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex CLI, Gemini CLI, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro
- **Interactive installer** — Select which agents to configure from a menu
- **SessionStart hooks** — Auto-reminders for Claude Code, Codex CLI, Gemini CLI, Antigravity
- **TOON format** — 22% fewer tokens than JSON (measured), better LLM comprehension
- **Per-project memory** — Each project gets its own memory file
- **Zero config** — Just install and use
- **Auto gitignore** — Automatically adds `.toon-memory/memory/` to `.gitignore`
- **Date filtering** — Search memory by date range
- **Auto-archive** — Old entries (>30 days), expired TTL entries, or 100+ entries moved to archive automatically
- **Encryption** — AES-256-GCM encryption for sensitive data
- **Watch mode** — Auto-backup every N minutes
- **Memory TTL** — Configurable per-entry expiration (7d, 30d, or exact dates)
- **Tag inference** — Auto-detect tags from content when tags are empty (built-in vocabulary + project dependencies)
- **Memory diff** — See what changed since your last session
- **Related entries** — Auto-suggest related memories when saving
- **Memory graph** — Connect entries with `links`/`[[key]]` refs; `memory_recall` can expand a relationship-aware subgraph for more precise, lower-token recall (no embeddings, no LLM)
- **Token-efficient recall** — `memory_recall({ compact: true })` returns numeric-indexed entries, drops `id`/`date`/`file`, renders graph edges as `->2`, and truncates graph neighbors to snippets
- **BM25 + centrality ranking** — Recall re-ranks by BM25 relevance and graph centrality (hubs surface even without the query word); per-hop decay keeps distant nodes low
- **Auto-tag from dependencies** — `toon-memory init` scans `package.json`/`Cargo.toml`/`requirements.txt`/`go.mod` and writes a project vocabulary so entries mentioning a dependency get auto-tagged with it

---

## Quick Start

### 1. Install

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex

# Or with npm (any platform)
npm i -g toon-memory
```

> **Tip:** The npm install is the most reliable method. The curl/irm scripts are convenience wrappers.

### 2. Configure your agent(s)

```bash
# Interactive installer — detects agents and configures MCP
npx toon-memory
```

The installer will:
1. Detect which AI agents you have installed
2. Ask which ones to configure
3. Add the MCP server config automatically

### 3. Use it

That's it! In your next agent session, try:

```bash
memory_stats      # See what's in memory
memory_recall     # Search memory before reading files
memory_remember   # Save important decisions
```

> **Tip:** Always run `memory_recall` at the start of a session. Your agent will have context from previous sessions instantly.

---

## Supported Agents

| Agent | Config Location | Format | Hooks | Auto-Setup |
|-------|-----------------|--------|-------|------------|
| **OpenCode** | `.opencode/opencode.json` | JSON | — | ✅ |
| **VS Code / Copilot** | `.vscode/mcp.json` | JSON | — | ✅ |
| **Claude Code** | `.claude/settings.json` | JSON | SessionStart | ✅ |
| **Cursor** | `.cursor/mcp.json` | JSON | — | ✅ |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | JSON | — | ✅ |
| **Cline** | `.cline/mcp.json` | JSON | — | ✅ |
| **Continue** | `.continue/config.json` | JSON | — | ✅ |
| **Codex CLI** | `.codex/config.toml` | TOML | SessionStart | ✅ |
| **Gemini CLI** | `.gemini/settings.json` | JSON | SessionStart | ✅ |
| **Zed** | `~/.config/zed/settings.json` | JSONC | — | ✅ |
| **Antigravity** | `.gemini/config/mcp_config.json` | JSON | SessionStart | ✅ |
| **Aider** | — | — | — | 📝 Instructions |
| **KiloCode** | `~/.kilocode/mcp_settings.json` | JSON | — | ✅ |
| **OpenClaw** | `.openclaw.json` | JSON | — | ✅ |
| **Kiro** | `.kiro/settings/mcp.json` | JSON | — | ✅ |

> **Tip:** You can configure toon-memory for multiple agents at the same time. Each agent gets the same shared memory file at `.toon-memory/memory/`.

---

## MCP Tools

| Tool | Description |
|------|-------------|
| `memory_remember` | Save a decision, pattern, bug, or knowledge (optional TTL, auto-tag inference, and `links` to build the memory graph) |
| `memory_recall` | Search memory (use BEFORE reading files, filters expired TTL). `mode: "graph"` expands a relationship-aware subgraph for higher precision. `compact: true` returns a token-efficient, numeric-indexed format |
| `memory_forget` | Remove an entry by key or id |
| `memory_stats` | View memory state (including TTL stats) |
| `memory_summary` | Save/retrieve file summaries |
| `memory_archive` | Archive old entries (>30 days) and expired TTL entries |
| `memory_diff` | Show changes since a date (24h, 7d, or exact date) |
| `memory_suggest` | Find related entries for a given context |
| `memory_encrypt` | Enable AES-256-GCM encryption |
| `memory_decrypt` | Disable encryption |
| `memory_captured` | List activity auto-captured by hooks (opt-in) or clear the log |
| `memory_consolidate` | De-duplicate entries with identical content (deterministic, no LLM) |
| `memory_sessions` | Show active agent sessions (branch, files, last-seen) and soft conflicts for parallel work |

### MCP Resources

Memory is also exposed as MCP resources for direct context reading:

| Resource | URI | Description |
|----------|-----|-------------|
| Memory Entries | `toon://memory/entries` | Full memory dump |
| Memory Stats | `toon://memory/stats` | Category counts and TTL info |
| Memory Summaries | `toon://memory/summaries` | File summaries

### Examples

#### Remember a decision

```typescript
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation — simpler than Joi, better TS support",
  file: "src/types.ts",
  tags: "validation;types"
})
// 🧠 Guardado: decision/use-zod (a1b2c3d4)
// 🔗 Entradas relacionadas:
//   [pattern] zod-schemas — Shared Zod schemas for API validation
```

> **Tip:** Use descriptive keys like `use-zod` instead of vague ones like `validation`. Your agent searches by key and content, so specificity helps.

#### Remember with TTL

```typescript
memory_remember({
  category: "knowledge",
  key: "sprint-deadline",
  content: "Sprint ends July 18, feature freeze is July 16",
  ttl: "7d"
})
// 🧠 Guardado: knowledge/sprint-deadline (x1y2z3w4)
// ⏰ TTL: 2026-07-19
```

> **Tip:** Use TTL for temporary context like deadlines, sprint info, or time-sensitive notes. Entries with expired TTL are automatically filtered from search results.

#### Auto-inferred tags

```typescript
memory_remember({
  category: "bug",
  key: "redis-connection-timeout",
  content: "Redis connection timeout in production, increased pool size"
  // tags left empty — auto-inferred from content
})
// 🧠 Guardado: bug/redis-connection-timeout (a1b2c3d4)
// 🏷️ Tags inferidos: redis
```

> **Tip:** Leave `tags` empty and the system will infer them from your content using a built-in vocabulary of 20+ categories (redis, auth, api, db, security, etc.) **plus** a project vocabulary derived from your dependencies at `init` time. So if your project depends on `redis`, any entry mentioning "redis" gets auto-tagged `redis`.

#### Search memory

```typescript
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **Tip:** Search before you read files. This saves tokens and gives your agent context it wouldn't get from code alone.

#### Search with date filter

```typescript
memory_recall({
  query: "redis",
  from_date: "2026-07-01",
  to_date: "2026-07-31"
})
```

> **Tip:** Use date filters when you remember roughly *when* something happened but not exactly *what*.

#### Archive old entries

```typescript
memory_archive()
// 📦 Archivadas 5 entradas antiguas
// 📋 Quedan 42 entradas activas
```

> **Tip:** Run this periodically to keep memory lean. Archived entries are still searchable via `memory_recall` with date filters. Entries with expired TTL are also archived automatically.

#### Show changes since last session

```typescript
memory_diff({ since: "24h" })
// 📋 Cambios desde 2026-07-11:
//
// ➕ Nuevas (2):
//   [decision] use-zod (a1b2c3d4)
//     Use Zod for validation
//   [bug] redis-timeout (e5f6g7h8)
//     Redis connection timeout fix
```

> **Tip:** Use `memory_diff` at the start of a session to see what your agent learned since you last worked on the project.

#### Find related entries

```typescript
memory_suggest({ context: "redis cache configuration" })
// 🔍 Sugerencias para "redis cache configuration":
//
// [decision] redis-cache-config (a1b2c3d4)
//   Redis cache layer for session storage
//   File: src/cache.ts | Tags: redis;cache | Date: 2026-07-10
//
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **Tip:** Use `memory_suggest` when you need context about a topic but aren't sure what to search for.

#### Enable encryption

```typescript
memory_encrypt()
// 🔐 Encriptación habilitada
// ⚠️ Guarda esta clave (no se puede recuperar):
// a1b2c3d4...
```

> **Warning:** Save the encryption key somewhere safe. If you lose it, your memory data is gone forever.

---

## Coordinación multi-sesión

When you run **several AI agent sessions in parallel** (e.g. three OpenCode sessions on the same repo at once), they can accidentally clobber each other's work. toon-memory ships with **`memory_sessions`**, a file-based coordination tool that lets every session see what its siblings are doing — with **no server, no network, and no LLM calls**.

### How it works

- On startup, a `SessionStart` hook writes a **heartbeat file** for the session at `.toon-memory/memory/sessions/<id>.json`. Each process writes *only its own* file, so there's no lock contention.
- The heartbeat records the agent name, the **git branch**, the **files touched**, and a **last-seen** timestamp.
- Reading across all those files gives every session a shared, eventually-consistent view of who else is active.
- Dead sessions (process PID no longer alive **and** a stale heartbeat past the TTL window) are pruned lazily.

### The `memory_sessions` tool

```typescript
memory_sessions({ conflictsOnly: false })
// 🧭 Sesiones activas (2) — ventana 30 min:
//
// • opencode @ feature/auth (tú)
//   id: a1b2c3d4
//   hace 2 min
//   Archivos:
//     • src/auth.ts
//
// • claude @ feature/db
//   id: e5f6g7h8
//   hace 9 min
//     • src/db.ts
//
// 🔥 Conflictos suaves (1):
//   ⚠️ src/types.ts  ↔  opencode @ feature/auth, claude @ feature/db
```

- Pass `conflictsOnly: true` to skip the session list and show only soft conflicts:
  ```typescript
  memory_sessions({ conflictsOnly: true })
  // 🔥 Conflictos suaves (1):
  //
  // ⚠️ src/types.ts
  //    ↔ opencode @ feature/auth (a1b2c3d4), claude @ feature/db (e5f6g7h8)
  ```
- A **soft conflict** is any file touched by 2+ active sessions — a heads-up that you might be editing the same code. It's not a hard lock, just a warning to coordinate.

### Recommended parallel-session habit

1. At the start of every session, the `SessionStart` hook already prints the other active sessions and any soft conflicts.
2. Run `memory_sessions()` to see the full picture (branches, files, last-seen) and `memory_sessions({ conflictsOnly: true })` if you only care about clashes.
3. If you share a file with another session, sync up before editing so you don't overwrite each other's changes.

> **Tip:** This is purely local and lock-free — safe to run as often as you like. Combine it with `memory_recall({ query: "project context" })` at session start for both cross-session *memory* and cross-session *presence*.

---

## Memory Graph (recall basado en grafo)

When your memory grows, a flat keyword search can return either too much (every match) or the wrong context (no relationships). toon-memory can treat memory as a **lightweight knowledge graph** so recall returns the *right* entries with fewer tokens.

It's fully **deterministic and offline** — no embeddings, no vector DB, no LLM, no server. Edges come from two sources:

- **Explicit `links`** — keys you declare when saving an entry.
- **Implicit `[[key]]` refs** — any `[[some-key]]` mention inside the content.

### How it works

1. `memory_remember` stores `links` on the entry (space- or `;`-separated keys).
2. `memory_recall({ mode: "graph" })` finds keyword matches (seeds), then expands the **ego-subgraph** up to `hops` (1 or 2) along the edges.
3. Relevance propagates from the seeds to their neighbors, so a related decision or spec surfaces even if it doesn't contain the query word.
4. The result set is capped (`limit`, default 6) → **smaller, more precise context** for the agent.

### Remember with links

```typescript
memory_remember({
  category: "decision",
  key: "risk-engine-priority",
  content: "The engine prioritizes risk over speed (see [[risk-spec]]).",
  file: "spec.md:10",
  tags: "risk;spec",
  links: "engine-arch"          // explicit edge to another entry
})
// 🧠 Guardado: decision/risk-engine-priority (a1b2c3d4)
```

### Recall with graph mode

```typescript
memory_recall({ query: "riesgo", mode: "graph", hops: 2 })
// [decision] risk-engine-priority (a1b2c3d4)
//   The engine prioritizes risk over speed (see [[risk-spec]]).
//   File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01
//   links: engine-arch
//
// [knowledge] risk-spec (a2b3c4d5)
//   Risk specification for the engine.
//   links: risk-engine-priority;engine-arch
//
// [pattern] engine-arch (e6f7g8h9)
//   Engine architecture.
//   links: risk-spec
```

> **Tip:** Use `mode: "graph"` when a decision ripples across several entries (architecture, specs, related bugs). For isolated facts, the default `flat` mode is enough. The graph is built on read, so there's no extra index file to maintain.

### Token-efficient recall (`compact`)

When every token counts, pass `compact: true` to get a denser output:

```typescript
memory_recall({ query: "riesgo", mode: "graph", hops: 2, compact: true })
// [1] decision/risk-engine-priority
//   The engine prioritizes risk over speed (see [[risk-spec]]).
//   tags: risk;spec · edges: ->2, ->3
//
// [2] knowledge/risk-spec
//   Risk specification for the engine.
//   tags: risk · edges: ->1
//
// [3] pattern/engine-arch
//   Engine architecture.
//   tags: engine · edges: ->1
```

How `compact` changes the output:

- Each entry gets a stable numeric index (`[1]`, `[2]`, …) in score order.
- `id`, `date`, and `file` are dropped — only `tags` is kept.
- In `graph` mode, edges render as `->2` (numeric, not key names).
- Neighbors reached via the graph (non-seeds) are truncated to a short snippet with an ellipsis, while directly-matched seeds keep their full content.
- The stored `.toon` file is **never** mutated — `compact` only reshapes the response.

> **Tip:** Combine `compact: true` with `mode: "graph"` for the smallest possible context window when recalling from a large, interconnected memory.

### How recall ranks results

Recall is deterministic and offline (no embeddings, no LLM). Each candidate entry gets a combined score:

- **BM25 relevance** — classic probabilistic term-frequency score against the query, using `id` + `category` + `key` + `content` + `file` + `tags`.
- **Graph centrality** — degree-normalized (0..1); a hub connected to many entries scores near 1, so it surfaces even without the query word.
- **Importance** — recency + access frequency (same signal used elsewhere).
- **Seed bonus** — entries that directly match the query get a flat boost.
- **Per-hop decay** — nodes `d` hops from a seed are multiplied by `0.5^d`, so distant context ranks below nearby context.

In `graph` mode, recall seeds on keyword matches, expands the ego-subgraph up to `hops`, and returns the top `limit` (default 6) by combined score.

### Auto-tag from project dependencies

On `toon-memory init`, the CLI scans your dependency manifests and writes a `vocab` table into `.toon-memory/memory/config.json`:

```json
{
  "vocab": {
    "react": ["react"],
    "zod": ["zod"],
    "redis": ["redis"]
  }
}
```

`memory_remember` then matches new entries against this vocabulary on top of the built-in one, so mentioning a dependency in your content auto-attaches its tag. Supported manifests: `package.json`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, `go.mod`.

> **Tip:** Re-run `toon-memory init` after adding major dependencies to refresh the vocabulary. The `vocab` key is merged (never clobbered) with the `encrypted`/`capture` flags in `config.json`.

---

## Tips & Best Practices

Here are some patterns that work well with toon-memory:

### The "start of session" habit

At the beginning of every new session, run:
```
memory_recall({ query: "project context" })
```
This gives your agent instant context about what happened before.

### The "end of session" habit

Before closing a session, save anything important:
```
memory_remember({
  category: "decision",
  key: "auth-approach",
  content: "Chose JWT over sessions — stateless, works across microservices",
  file: "src/auth.ts",
  tags: "auth;architecture"
})
```

### Choosing categories

| Category | When to use |
|----------|-------------|
| `decision` | Architecture choices, trade-offs, "why X over Y" |
| `pattern` | Conventions, frameworks, code style rules |
| `bug` | Issues you fixed and how |
| `knowledge` | Project facts, domain info, team context |

> **Tip:** Don't overthink it. If it's something your future self (or agent) would want to know, save it.

### Tags that work well

Use semicolon-separated tags for easy filtering:
```
tags: "redis;performance;fix"
tags: "auth;jwt;security"
tags: "api;rest;versioning"
```

> **Tip:** Keep tags short and consistent. They're not hashtags — they're search filters.

### What NOT to save

- Don't save things that are obvious from reading the code
- Don't save temporary debugging notes
- Don't save secrets, API keys, or credentials (use env vars instead)
- Don't duplicate the same information with different keys

### Keep memory clean

Run `memory_archive()` monthly to move old entries to the archive. Run `memory_stats()` to check the size.

---

## CLI Commands

```bash
npx toon-memory              # Interactive installer
npx toon-memory init         # Quick setup (no prompts)
npx toon-memory mcp          # Run MCP server directly
npx toon-memory status       # Check installation status
npx toon-memory stats        # View memory statistics
npx toon-memory export       # Export memory to JSON
npx toon-memory import <file> # Import memory from JSON
npx toon-memory watch [options] # Auto-backup with options
npx toon-memory upgrade      # Update to latest version
npx toon-memory uninstall    # Remove from all agents
```

### Examples

#### Stats

```bash
$ npx toon-memory stats

🧠 toon-memory stats

📊 Memory Stats
━━━━━━━━━━━━━━━━━━
Total entries: 45
├── decision: 12
├── pattern: 18
├── bug: 8
└── knowledge: 7
Last updated: 2026-07-10
File size: 12.4 KB
```

> **Tip:** If memory gets too large (100+ entries), consider archiving or removing outdated entries with `memory_forget`.

#### Export

```bash
$ npx toon-memory export

🧠 toon-memory export

Exported 45 entries to:
  /path/to/project/toon-memory-export.json
```

> **Tip:** Export before major refactors. You can always import the backup later if something goes wrong.

#### Import

```bash
$ npx toon-memory import backup.json

🧠 toon-memory import

Imported 3 new entries
Skipped 2 duplicates
```

> **Tip:** Duplicates are detected by key. If you want to re-import an entry, delete the old one first with `memory_forget`.

#### Watch

```bash
$ npx toon-memory watch 15 -c -m 20

🧠 toon-memory watch

Watching memory file every 15 minutes...
Max backups: 20
Compression: enabled
Logging: disabled
Press Ctrl+C to stop

📦 Backup #1 created: 2026-07-11T16-00-00-000Z
📦 Backup #2 created: 2026-07-11T16-15-00-000Z
^C
✅ Watch stopped. 2 backups created.
```

> **Tip:** Watch mode is great for long-running sessions. Use `-c` to compress and `-m 5` to keep only 5 backups.

**Watch Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `[interval]` | Backup interval in minutes | 5 |
| `-c, --compress` | Enable gzip compression | off |
| `-l, --log [path]` | Enable file logging | off |
| `-m, --max-backups <n>` | Max backups to keep (0=unlimited) | 10 |

---

## Configuration

### Interactive installer (recommended)

```bash
npx toon-memory
```

The installer will:
1. Show all 15 supported agents with detection status
2. Let you select which ones to configure (comma-separated, `all`, or Enter)
3. Ask for local or global installation scope
4. Configure MCP server, instruction files, and hooks automatically

### OpenCode

Add to `.opencode/opencode.json` or `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "toon-memory": {
      "type": "local",
      "command": ["npx", "-y", "toon-memory", "mcp"],
      "enabled": true
    }
  }
}
```

### Claude Code

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

### VS Code / Copilot

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

### Codex CLI

Add to `.codex/config.toml`:

```toml
[mcpServers.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
```

### Gemini CLI

Add to `.gemini/settings.json`:

```json
{
  "mcpServers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

### Zed

Add to `~/.config/zed/settings.json`:

```json
{
  "mcp_servers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

> **Tip:** Use global config if you want memory for every project. Use project-level config if you only want it for specific projects.

---

## How It Works

1. **MCP Server** — Runs locally, talks to your agent via stdio
2. **TOON Format** — Stores data in Token-Oriented Object Notation (~22.5% fewer tokens than JSON, measured over 16 entries with gpt-tokenizer)
3. **Per-project memory** — Each project gets `.toon-memory/memory/data.toon`
4. **Zero config** — Just install and use

### Memory File Format

```
version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links}:
  a1b2c3d4|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10||0|
  e5f6g7h8|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10||0|
  i9j0k1l2|bug|redis-pool-fix|Added max_connections=20 (see [[use-zod]])|redis.ts|redis;fix|2026-07-10|7d|0|use-zod
summaries:
  src/services/redis.ts: Redis connection pool with retry logic
```

### File Structure

```
.toon-memory/
├── memory/
│   ├── data.toon        # Main memory file
│   ├── archive.toon     # Archived entries (>30 days)
│   ├── config.json      # Encryption settings
│   └── backups/         # Watch mode backups
│       ├── backup-2026-07-11T16-00-00-000Z.toon
│       └── backup-2026-07-11T16-10-00-000Z.toon
└── hooks/
    ├── session-start-claude.sh
    ├── session-start-codex.sh
    ├── session-start-gemini.sh
    └── session-start-antigravity.sh
```

---

## Why TOON?

TOON (Token-Oriented Object Notation) is designed for LLMs:

| Format | Tokens (16 entries) |
|--------|---------------------|
| JSON | 1097 |
| **TOON** | **850** |

Measured with `gpt-tokenizer` (cl100k_base) over 16 representative memory entries — see `scripts/benchmark-toon.mjs` (`npm run bench`).

The token savings compound at session time: `npm run bench:impact` simulates retrieving context **with vs without** memory and measures ~68% fewer tokens to get the same context (recall `compact` instead of re-reading source files).

- **22.5% fewer tokens** than JSON at file level (up to 30.5% on a single entry)
- **Lossless roundtrip** — No data loss
- **Better LLM comprehension** — Structured for AI consumption

> **Tip:** Fewer tokens = faster responses + lower API costs. Your agent reads memory files on every session start, so efficiency matters.

---

## Troubleshooting

### Memory not found after install

**Symptom:** Agent says it doesn't have memory tools.

**Fix:**
1. Run `npx toon-memory status` to verify installation
2. Restart your agent completely (close and reopen)
3. Check that the MCP config file exists and is valid JSON

### Memory file is empty

**Symptom:** `memory_stats` shows 0 entries.

**Fix:** This is normal on first install. Start using `memory_remember` to save entries.

### Duplicate entries

**Symptom:** Same key appears multiple times.

**Fix:** Use `memory_forget` to remove duplicates. Import skips duplicates by key, but `memory_remember` with the same key creates a new entry with a different ID.

### Encryption key lost

**Symptom:** Can't decrypt memory.

**Fix:** Unfortunately, there's no recovery. The encryption key is not stored anywhere after generation. This is by design for security. You'll need to start fresh or restore from a non-encrypted backup.

### Memory too large

**Symptom:** Agent responses are slow.

**Fix:**
1. Run `memory_archive()` to move old entries to archive
2. Use `memory_forget` to remove irrelevant entries
3. Keep entries concise — save the decision, not the entire conversation

---

## FAQ

### Does this work with any AI agent?

Yes, as long as it supports MCP (Model Context Protocol). We have auto-setup for 15 agents, with manual configuration available for others.

### Is my data sent anywhere?

No. Everything stays on your machine. The MCP server runs locally over stdio — no network calls, no telemetry, no cloud.

### Can I use this across multiple machines?

Yes, if you sync the `.toon-memory/memory/` directory (e.g., via Git or a shared folder). Each machine needs toon-memory installed, but the memory file is portable.

### What happens if I have multiple projects?

Each project gets its own memory file. Memory doesn't leak between projects.

### Can I encrypt specific entries only?

No, encryption applies to the entire memory file. If you need selective encryption, keep sensitive data in a separate tool.

### How is this different from just using a markdown file?

Markdown files aren't structured, aren't searchable by your agent in the same way, don't integrate via MCP, and don't have features like archiving, date filtering, or encryption. toon-memory is purpose-built for AI agents.

---

## Development

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
npm run build
npm test
```

### Project Structure

```
toon-memory/
├── src/
│   ├── bin/
│   │   └── toon-memory.ts      # Entry point
│   ├── cli/
│   │   ├── setup.ts             # CLI commands
│   │   └── toon-memory.ts       # CLI runner
│   ├── mcp/
│   │   └── server.ts            # MCP server (13 tools + 3 resources)
│   ├── lib/
│   │   ├── lock.ts              # Advisory file lock + atomic write
│   │   ├── sessions.ts          # Multi-session coordination
│   │   ├── graph.ts             # Memory graph (parse, build, BM25, centrality, compact render)
│   │   └── vocab.ts             # Project-vocabulary discovery from dependencies
│   └── memory.ts                # Custom tool (OpenCode)
├── tests/
│   ├── cli.test.ts              # CLI tests
│   ├── memory.test.ts           # Memory tests
│   ├── sessions.test.ts         # Multi-session tests
│   └── graph.test.ts            # Memory graph tests
├── .github/workflows/
│   ├── ci.yml                   # CI (Node.js 20/22)
│   └── publish.yml              # Auto-publish on release
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Contributing

Contributions are welcome! Please read our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT

---

## Credits

Built with [@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon) and [@modelcontextprotocol/server](https://www.npmjs.com/package/@modelcontextprotocol/server).
