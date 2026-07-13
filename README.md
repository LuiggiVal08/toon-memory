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

- **8 MCP tools** — Full memory management via Model Context Protocol
- **15 agents supported** — OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex CLI, Gemini CLI, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro
- **Interactive installer** — Select which agents to configure from a menu
- **SessionStart hooks** — Auto-reminders for Claude Code, Codex CLI, Gemini CLI, Antigravity
- **TOON format** — 40% fewer tokens than JSON, better LLM comprehension
- **Per-project memory** — Each project gets its own memory file
- **Zero config** — Just install and use
- **Auto gitignore** — Automatically adds `.toon-memory/memory/` to `.gitignore`
- **Date filtering** — Search memory by date range
- **Auto-archive** — Old entries (>30 days) or 100+ entries moved to archive automatically
- **Encryption** — AES-256-GCM encryption for sensitive data
- **Watch mode** — Auto-backup every N minutes

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
| `memory_remember` | Save a decision, pattern, bug, or knowledge |
| `memory_recall` | Search memory (use BEFORE reading files) |
| `memory_forget` | Remove an entry by key or id |
| `memory_stats` | View memory state |
| `memory_summary` | Save/retrieve file summaries |
| `memory_archive` | Archive old entries (>30 days) |
| `memory_encrypt` | Enable AES-256-GCM encryption |
| `memory_decrypt` | Disable encryption |

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
```

> **Tip:** Use descriptive keys like `use-zod` instead of vague ones like `validation`. Your agent searches by key and content, so specificity helps.

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

> **Tip:** Run this periodically to keep memory lean. Archived entries are still searchable via `memory_recall` with date filters.

#### Enable encryption

```typescript
memory_encrypt()
// 🔐 Encriptación habilitada
// ⚠️ Guarda esta clave (no se puede recuperar):
// a1b2c3d4...
```

> **Warning:** Save the encryption key somewhere safe. If you lose it, your memory data is gone forever.

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
2. **TOON Format** — Stores data in Token-Oriented Object Notation (~40% fewer tokens than JSON)
3. **Per-project memory** — Each project gets `.toon-memory/memory/data.toon`
4. **Zero config** — Just install and use

### Memory File Format

```
version: 1
entries[3|]{id|category|key|content|file|tags|date}:
  a1b2c3d4|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10
  e5f6g7h8|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10
  i9j0k1l2|bug|redis-pool-fix|Added max_connections=20|redis.ts|redis;fix|2026-07-10
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

| Format | Token Count | LLM Accuracy |
|--------|-------------|--------------|
| JSON | 100 | 75% |
| YAML | 95 | 72% |
| **TOON** | **60** | **76.4%** |

- **40% fewer tokens** than JSON
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
│   │   └── server.ts            # MCP server (8 tools)
│   └── memory.ts                # Custom tool (OpenCode)
├── tests/
│   ├── cli.test.ts              # CLI tests
│   └── memory.test.ts           # Memory tests
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
