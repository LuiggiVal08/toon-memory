# toon-memory

Persistent memory for AI coding agents — remember decisions, patterns, and bugs between sessions.

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml)

---

## What is toon-memory?

AI agents forget everything between sessions. toon-memory fixes this by providing persistent memory that survives restarts.

**Use cases:**
- Remember design decisions ("Why did we choose X over Y?")
- Track patterns ("This project uses Zod for validation")
- Store bug resolutions ("Redis pool exhaustion fix")
- Save project knowledge ("Broker uses RESP protocol")

---

## Features

- **5 MCP tools** — `memory_remember`, `memory_recall`, `memory_forget`, `memory_stats`, `memory_summary`
- **7 agents supported** — OpenCode, VS Code/Copilot, Claude Code, Cursor, Windsurf, Cline, Continue
- **TOON format** — 40% fewer tokens than JSON, better LLM comprehension
- **Per-project memory** — each project gets its own memory file
- **Zero config** — just install and use

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

## Tools

| Tool | Description |
|------|-------------|
| `memory_remember` | Save a decision, pattern, bug, or knowledge |
| `memory_recall` | Search memory (use BEFORE reading files) |
| `memory_forget` | Remove an entry by key or id |
| `memory_stats` | View memory state |
| `memory_summary` | Save/retrieve file summaries |

---

## How It Works

1. **MCP Server** — runs locally, talks to your agent via stdio
2. **TOON Format** — stores data in Token-Oriented Object Notation (~40% fewer tokens than JSON)
3. **Per-project memory** — each project gets `.opencode/memory/data.toon`
4. **Zero config** — just install and use

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

---

## CLI Commands

```bash
npx toon-memory          # Interactive installer
npx toon-memory init     # Quick setup (no prompts)
npx toon-memory mcp      # Run MCP server directly
npx toon-memory status   # Check installation status
npx toon-memory upgrade  # Update to latest version
npx toon-memory uninstall # Remove from all agents
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

## Why TOON?

TOON (Token-Oriented Object Notation) is designed for LLMs:

| Format | Token Count | LLM Accuracy |
|--------|-------------|--------------|
| JSON | 100 | 75% |
| YAML | 95 | 72% |
| **TOON** | **60** | **76.4%** |

- **40% fewer tokens** than JSON
- **Lossless roundtrip** — no data loss
- **Better LLM comprehension** — structured for AI consumption

---

## Development

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
npm run build
npm test
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
