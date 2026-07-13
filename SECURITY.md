# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.8.x   | :white_check_mark: |
| < 1.8   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly. **Do not open a public GitHub issue.**

Instead, email: **luiggival08@gmail.com** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: within 48 hours
- **Initial assessment**: within 1 week
- **Fix or mitigation**: depends on severity, but typically within 2 weeks for critical issues

## Scope

In scope:
- MCP server vulnerabilities (remote code execution, injection)
- Encryption bypass or key leakage
- Memory file tampering or data exposure
- CLI command injection
- Path traversal in file operations

Out of scope:
- Denial of service (this is a local CLI tool)
- Issues in third-party dependencies (report upstream)
- Social engineering attacks

## Security Measures

- Memory encryption uses **AES-256-GCM**
- Encryption key is read from `TOON_MEMORY_KEY` environment variable, never exposed to MCP clients
- Memory files are stored locally in `.toon-memory/memory/`
- No telemetry or remote data collection
- All data stays on the user's machine

## Disclosure Policy

We follow coordinated disclosure. Please give us reasonable time to address the issue before making it public.
