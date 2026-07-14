# AGENTS.md

## Build & Verify

```bash
npm run build   # esbuild: bin → mcp → cli (sequential)
npm test        # vitest run
npx tsc --noEmit  # type check (CI runs this, no npm script)
```

Build must complete before tests — `tests/cli.test.ts` executes `bin/toon-memory.js`.

## Architecture

- `src/bin/toon-memory.ts` — Entry point. Routes `mcp` arg to MCP server, everything else to CLI.
- `src/mcp/server.ts` — MCP server with 8 tools (memory_remember, memory_recall, memory_forget, memory_stats, memory_summary, memory_archive, memory_encrypt, memory_decrypt).
- `src/cli/setup.ts` — CLI commands: init, status, stats, export, import, watch, upgrade, uninstall. Also installs hooks per agent (Claude/Codex/Gemini via config, Antigravity via `hooks.json`, OpenCode via an embedded plugin template written to `.opencode/plugins/toon-memory.ts`). The OpenCode plugin template is inlined here — there is no separate `src/memory.ts` anymore.

Build outputs (`bin/`, `mcp/`, `dist/`) are gitignored. `tsconfig.json` type-checks `src/` (excluding `tests`).

Build outputs (`bin/`, `mcp/`, `dist/`) are gitignored.

## Testing

Tests use temp directories and clean up automatically. No external services required.

## Docs

`docs/` is a separate Astro site. See `docs/AGENTS.md` for dev server instructions.

## CI

- **test**: Node 20/22 matrix, runs `npm run build && npm test`
- **lint**: Runs `npx tsc --noEmit` (no ESLint configured)
