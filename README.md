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
- [CLI Commands](#cli-commands)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [Why TOON?](#why-toon)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## What is toon-memory?

AI agents forget everything between sessions. toon-memory fixes this by providing persistent memory that survives restarts.

📖 **[Read the documentation](https://luiggival08.github.io/toon-memory/)**

**Use cases:**
- Remember design decisions ("Why did we choose X over Y?")
- Track patterns ("This project uses Zod for validation")
- Store bug resolutions ("Redis pool exhaustion fix")
- Save project knowledge ("Broker uses RESP protocol")

---

## Blog Post

Read [How toon-memory Makes Your AI Agent Smarter](https://luiggival08.github.io/toon-memory/blog) to see a real-world demo of persistent memory in action.

---

## Features

- **8 MCP tools** — Full memory management via Model Context Protocol
- **7 agents supported** — OpenCode, VS Code/Copilot, Claude Code, Cursor, Windsurf, Cline, Continue
- **TOON format** — 40% fewer tokens than JSON, better LLM comprehension
- **Per-project memory** — Each project gets its own memory file
- **Zero config** — Just install and use
- **Auto gitignore** — Automatically adds `.opencode/memory/` to `.gitignore`
- **Date filtering** — Search memory by date range
- **Auto-archive** — Old entries (>30 days) moved to archive automatically
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

### 2. Configure your agent(s)

```bash
# Interactive installer — detects agents and configures MCP
npx toon-memory
```

### 3. Use it

```bash
# In your next session, run:
memory_stats      # See what's in memory
memory_recall     # Search memory before reading files
memory_remember   # Save important decisions
```

---

## Supported Agents

| Agent | Config Location | Auto-Setup |
|-------|-----------------|------------|
| **OpenCode** | `.opencode/opencode.json` | ✅ |
| **VS Code / Copilot** | `.vscode/mcp.json` | ✅ |
| **Claude Code** | `.claude/settings.json` | ✅ |
| **Cursor** | `.cursor/mcp.json` | ✅ |
| **Windsurf** | `.windsurfrules` | ✅ |
| **Cline** | `.cline/mcp.json` | ✅ |
| **Continue** | `.continue/config.json` | ✅ |
| **Aider** | `.aider.conf.yml` | ⚠️ Manual |

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
  content: "Use Zod for validation",
  file: "src/types.ts",
  tags: "validation;types"
})
// 🧠 Guardado: decision/use-zod (a1b2c3d4)
```

#### Search memory

```typescript
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

#### Search with date filter

```typescript
memory_recall({
  query: "redis",
  from_date: "2026-07-01",
  to_date: "2026-07-31"
})
```

#### Archive old entries

```typescript
memory_archive()
// 📦 Archivadas 5 entradas antiguas
// 📋 Quedan 42 entradas activas
```

#### Enable encryption

```typescript
memory_encrypt()
// 🔐 Encriptación habilitada
// ⚠️ Guarda esta clave (no se puede recuperar):
// a1b2c3d4...
```

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
npx toon-memory watch [mins] # Auto-backup every N minutes (default: 5)
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

#### Export

```bash
$ npx toon-memory export

🧠 toon-memory export

Exported 45 entries to:
  /path/to/project/toon-memory-export.json
```

#### Import

```bash
$ npx toon-memory import backup.json

🧠 toon-memory import

Imported 3 new entries
Skipped 2 duplicates
```

#### Watch

```bash
$ npx toon-memory watch 10

🧠 toon-memory watch

Watching memory file every 10 minutes...
Press Ctrl+C to stop

📦 Backup #1 created: 2026-07-11T16-00-00-000Z
📦 Backup #2 created: 2026-07-11T16-10-00-000Z
^C
✅ Watch stopped. 2 backups created.
```

---

## Configuration

### Global (all projects)

Add to `~/.config/opencode/opencode.json`:

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

### Project-level

Add to `.opencode/opencode.json`:

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

### VS Code

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

---

## How It Works

1. **MCP Server** — Runs locally, talks to your agent via stdio
2. **TOON Format** — Stores data in Token-Oriented Object Notation (~40% fewer tokens than JSON)
3. **Per-project memory** — Each project gets `.opencode/memory/data.toon`
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
.opencode/
├── memory/
│   ├── data.toon        # Main memory file
│   ├── archive.toon     # Archived entries (>30 days)
│   ├── config.json      # Encryption settings
│   └── backups/         # Watch mode backups
│       ├── backup-2026-07-11T16-00-00-000Z.toon
│       └── backup-2026-07-11T16-10-00-000Z.toon
└── opencode.json        # MCP server config
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

Contributions are welcome! Please read our [Code of Conduct](CODE_OF_CONDUCT.md) first.

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
