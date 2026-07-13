# toon-memory — Persistent Memory for AI Agents

## What is this?

A persistent memory system for AI coding agents. It remembers decisions, patterns, bugs, and knowledge **between sessions** using TOON format (40% fewer tokens than JSON).

## Supported Agents

| Agent | Config File | Format | Hooks |
|-------|-------------|--------|-------|
| OpenCode | `.opencode/opencode.json` | MCP server | — |
| VS Code / Copilot | `.vscode/mcp.json` | MCP server | — |
| Claude Code | `.claude/settings.json` | MCP server | SessionStart |
| Cursor | `.cursor/mcp.json` | MCP server | — |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | MCP server | — |
| Cline | `.cline/mcp.json` | MCP server | — |
| Continue | `.continue/config.json` | MCP server | — |
| Codex CLI | `.codex/config.toml` | TOML | SessionStart |
| Gemini CLI | `.gemini/settings.json` | MCP server | SessionStart |
| Zed | `~/.config/zed/settings.json` | JSONC | — |
| Antigravity | `.gemini/config/mcp_config.json` | MCP server | SessionStart |
| Aider | — | Instructions only | — |
| KiloCode | `~/.kilocode/mcp_settings.json` | MCP server | — |
| OpenClaw | `.openclaw.json` | MCP server | — |
| Kiro | `.kiro/settings/mcp.json` | MCP server | — |

## Tools

| Tool | Description |
|------|-------------|
| `memory_remember` | Save a decision, pattern, bug, or knowledge |
| `memory_recall` | Search memory (use BEFORE reading files) |
| `memory_forget` | Remove an entry by key or id |
| `memory_stats` | View memory state |
| `memory_summary` | Save/retrieve file summaries |
| `memory_archive` | Archive old entries |
| `memory_encrypt` | Enable encryption |
| `memory_decrypt` | Disable encryption |

## Installation

### Interactive installer (recommended)

```bash
npx toon-memory
```

This will:
1. Detect installed agents
2. Let you select which agents to configure
3. Ask for local or global installation
4. Configure MCP server, instructions, and hooks automatically

### Manual installation

Add to your agent's MCP config:

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

## How to use

### At the START of every session

1. Run `memory_stats` to see what's in memory.
2. If the user asks something that might be in memory → `memory_recall(query)` BEFORE reading files.

### When making decisions

- Before implementing a non-trivial change → `memory_remember(category='decision')`
- When you resolve a complex bug → `memory_remember(category='bug')`
- When you observe a code pattern → `memory_remember(category='pattern')`

### When exploring the project

1. First: `memory_recall(query="what you need to know")`
2. If no result: use grep or search tools
3. Only if both fail: read files directly

### At the END of every session

1. If you made design decisions → `memory_remember(category='decision')`
2. If you resolved a bug → `memory_remember(category='bug')`
3. If you observed a pattern → `memory_remember(category='pattern')`

## Categories

| Category | When | Example |
|----------|------|---------|
| `decision` | Non-trivial design decision | "Use pandas instead of numpy for time series" |
| `pattern` | Observed code pattern | "This project uses Pydantic v2 for configs" |
| `bug` | Complex bug resolved | "Redis pool exhaustion, missing max_connections" |
| `knowledge` | General project knowledge | "Broker uses RESP protocol, not Redis-specific" |

## File format

Data is stored in `.toon-memory/memory/data.toon` using TOON (Token-Oriented Object Notation):

```
version: 1
entries[2|]{id|category|key|content|file|tags|date}:
  a1b2c3d4|decision|risk-priority|Risk Engine has priority|spec.md:145|risk;spec|2026-07-10
  e5f6g7h8|pattern|pandas-over-numpy|Analytics uses pandas|indicators.py|python;analytics|2026-07-10
summaries:
  path/to/big-file.py: Brief summary of what this file does
```

## Anti-patterns

- Don't store trivia in memory (only important facts)
- Don't forget to save a decision before implementing
- Don't re-read files that already have a summary in `memory_summary`
