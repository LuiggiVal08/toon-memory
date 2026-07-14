# Contributing to toon-memory

Thanks for your interest in contributing! This guide will help you get started.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
```

### Build & Test

```bash
npm run build    # Build all targets (bin, mcp, cli)
npm test         # Run tests
```

Build must complete before tests — `tests/cli.test.ts` executes the built `bin/toon-memory.js`.

## Development Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes

3. Build and test:
   ```bash
   npm run build && npm test
   ```

4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new memory tool"
   git commit -m "fix: handle empty memory file"
   git commit -m "docs: update CLI examples"
   ```

5. Push and open a Pull Request

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix    | Use case                        |
|-----------|---------------------------------|
| `feat:`   | New feature                     |
| `fix:`    | Bug fix                         |
| `docs:`   | Documentation only              |
| `refactor:` | Code change (no feature/fix)  |
| `test:`   | Adding or updating tests        |
| `chore:`  | Maintenance, deps, CI           |

## Project Structure

```
src/
├── bin/toon-memory.ts       # Entry point
├── cli/
│   ├── setup.ts             # CLI commands
│   └── toon-memory.ts       # CLI runner
├── mcp/server.ts            # MCP server (13 tools + 3 resources)
tests/
├── cli.test.ts
└── memory.test.ts
```

## PR Guidelines

- Keep PRs focused — one feature or fix per PR
- Include tests for new functionality
- Ensure `npm run build && npm test` passes
- Update documentation if changing CLI behavior or MCP tools
- Keep PR descriptions concise and clear

## Reporting Issues

Use [GitHub Issues](https://github.com/LuiggiVal08/toon-memory/issues) for bugs and feature requests. For security issues, see [SECURITY.md](SECURITY.md).
