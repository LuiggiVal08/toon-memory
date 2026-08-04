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
- `src/mcp/server.ts` — MCP server (38 tools + 4 resources + 1 prompt).
- `src/mcp/tools.ts` — Tool implementations. Each tool is registered with the MCP server.
- `src/mcp/vault.ts` — Encrypted secrets sidecar (`secrets.toon`, AES-256-GCM): store/get/list/forget.
- `src/lib/evidence.ts` — Write-path evidence: contradiction detection + evidence levels (verified/unverified/conflict) with recall boosts.
- `src/mcp/consolidation.ts` — Cleanup ops plus `mergeMemoryFiles` (global import merge).
- `src/mcp/scoring.ts` — Entry scoring and access tracking (bumpAccessed).
- `src/lib/quality.ts` — Quality scoring with staleness decay, merge-dedup, smart recall.
- `src/lib/graph.ts` — Knowledge graph: adjacency, BM25, centrality, graph recall.
- `src/cli/setup.ts` — CLI commands: init, status, stats, export, import, watch, upgrade, uninstall. Also installs hooks per agent.
- `src/cli/opencode-plugin.ts` — OpenCode plugin with intelligent auto-loading (recall by file path on tool.execute.after).

Build outputs (`bin/`, `mcp/`, `dist/`) are gitignored. `tsconfig.json` type-checks `src/` (excluding `tests`).

## Smarter Memory Pattern

When working on files, use `memory_recall` with the file path to get relevant context:
```
memory_recall(query: "src/cli/config-writer.ts")  → relevant entries about that file
```
Instead of dumping ALL memory at session start (wastes tokens), recall only what's relevant to the current task.

## Visual Memory Pattern

When the user asks to see the memory graph, or at session start to get a visual overview, call `memory_visualize`:
```
memory_visualize(query: "")  → renders interactive graph inline in VS Code Copilot
memory_visualize(query: "auth")  → opens graph with search pre-filled
```
This renders a D3.js force-directed graph inline in any MCP Apps-compatible host. No server needed.

## Testing

Tests use temp directories and clean up automatically. No external services required.

## Docs

`docs/` is a separate Astro site. See `docs/AGENTS.md` for dev server instructions.

## CI

- **test**: Node 20/22 matrix, runs `npm run build && npm test`
- **lint**: Runs `npx tsc --noEmit` (no ESLint configured)
