# toon-memory

Persistent memory for AI coding agents — remember decisions, patterns, and bugs between sessions.

🎉 **1.0 Released!**

Supercharge **OpenCode, VS Code Copilot, Claude Code, Cursor, Windsurf, Cline, Continue** and more with Persistent Memory

Saves context in **TOON format** (40% fewer tokens than JSON) · 5 MCP tools · Works everywhere

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What is toon-memory?

AI agents forget everything between sessions. toon-memory fixes this by providing persistent memory that survives restarts.

**Use cases:**
- Remember design decisions ("Why did we choose X over Y?")
- Track patterns ("This project uses Zod for validation")
- Store bug resolutions ("Redis pool exhaustion fix")
- Save project knowledge ("Broker uses RESP protocol")

---

## Get Started

### 1. Install (one command)

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

| Agent | Config Location | Status |
|-------|-----------------|--------|
| **OpenCode** | `.opencode/opencode.json` | ✅ Full support |
| **VS Code / Copilot** | `.vscode/mcp.json` | ✅ Full support |
| **Claude Code** | `.claude/settings.json` | ✅ Full support |
| **Cursor** | `.cursor/mcp.json` | ✅ Full support |
| **Windsurf** | `.windsurfrules` | ✅ Full support |
| **Cline** | `.cline/mcp.json` | ✅ Full support |
| **Continue** | `.continue/config.json` | ✅ Full support |
| **Aider** | `.aider.conf.yml` | ⚠️ Manual config |

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
npx toon-memory mcp      # Run MCP server directly
npx toon-memory uninstall # Remove from all agents
```

---

## Uninstall

```bash
# Remove from all agents and uninstall CLI
npx toon-memory uninstall

# Or with the global install
toon-memory uninstall
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
```

---

## License

MIT

---

## Credits

Built with [@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon) and [@modelcontextprotocol/server](https://www.npmjs.com/package/@modelcontextprotocol/server).
