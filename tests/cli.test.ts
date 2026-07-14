import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "fs"
import { join } from "path"
import { execSync } from "child_process"
import { tmpdir } from "os"

describe("CLI Commands", () => {
  const testDir = join(tmpdir(), "toon-memory-cli-test-" + Date.now())
  const cliPath = join(__dirname, "..", "bin", "toon-memory.js")

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it("should show status", () => {
    const output = execSync(`node ${cliPath} status`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    expect(output).toContain("toon-memory status")
    expect(output).toContain("Version:")
    expect(output).toContain("Memory:")
    expect(output).toContain("Agent configs:")
  })

  it("should print version with -v", () => {
    const output = execSync(`node ${cliPath} -v`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/)
  })

  it("should print version with --version", () => {
    const output = execSync(`node ${cliPath} --version`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })
    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/)
  })

  it("should print help with -h", () => {
    const output = execSync(`node ${cliPath} -h`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })
    expect(output).toContain("toon-memory — MCP memory server for AI coding agents")
    expect(output).toContain("Usage:")
    expect(output).toContain("--version")
    expect(output).toContain("--help")
  })

  it("should print help with --help", () => {
    const output = execSync(`node ${cliPath} --help`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })
    expect(output).toContain("toon-memory — MCP memory server for AI coding agents")
    expect(output).toContain("Commands:")
  })

  it("should init with local scope", () => {
    const output = execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    expect(output).toContain("toon-memory init")

    // Check that memory directory was created
    expect(existsSync(join(testDir, ".toon-memory", "memory", "data.toon"))).toBe(true)

    // Check OpenCode config
    expect(existsSync(join(testDir, ".opencode", "opencode.json"))).toBe(true)
    const opencodeConfig = JSON.parse(readFileSync(join(testDir, ".opencode", "opencode.json"), "utf-8"))
    expect(opencodeConfig.mcp?.["toon-memory"]).toBeDefined()
    expect(opencodeConfig.mcp["toon-memory"].enabled).toBe(true)
    expect(opencodeConfig.mcp["toon-memory"].type).toBe("local")
    expect(opencodeConfig.mcp["toon-memory"].command).toEqual(["npx", "-y", "toon-memory", "mcp"])
    // OpenCode must use a plugin, never a top-level `hooks` key (rejected by OpenCode 1.17+)
    expect(opencodeConfig.hooks).toBeUndefined()
    expect(existsSync(join(testDir, ".opencode", "plugins", "toon-memory.ts"))).toBe(true)

    // Check VS Code config
    expect(existsSync(join(testDir, ".vscode", "mcp.json"))).toBe(true)
    const vscodeConfig = JSON.parse(readFileSync(join(testDir, ".vscode", "mcp.json"), "utf-8"))
    expect(vscodeConfig.servers?.["toon-memory"]).toBeDefined()

    // Check Claude Code config + instructions + hooks
    expect(existsSync(join(testDir, ".claude", "settings.json"))).toBe(true)
    const claudeConfig = JSON.parse(readFileSync(join(testDir, ".claude", "settings.json"), "utf-8"))
    expect(claudeConfig.mcpServers?.["toon-memory"]).toBeDefined()
    expect(existsSync(join(testDir, ".claude", "AGENTS.md"))).toBe(true)

    // Check Codex CLI TOML
    expect(existsSync(join(testDir, ".codex", "config.toml"))).toBe(true)
    const codexConfig = readFileSync(join(testDir, ".codex", "config.toml"), "utf-8")
    expect(codexConfig).toContain("toon-memory")
    expect(codexConfig).toContain("npx")
    expect(existsSync(join(testDir, ".codex", "AGENTS.md"))).toBe(true)
    // Codex hooks use the stable [[hooks]] event= format (not [hooks.*] tables)
    expect(codexConfig).toContain('[[hooks]]')
    expect(codexConfig).toContain('event = "SessionStart"')
    expect(codexConfig).toContain('event = "PostToolUse"')
    expect(codexConfig).toContain('event = "Stop"')
    expect(codexConfig).not.toContain('[hooks.session_start]')

    // Check Gemini CLI config + instructions
    expect(existsSync(join(testDir, ".gemini", "settings.json"))).toBe(true)
    const geminiConfig = JSON.parse(readFileSync(join(testDir, ".gemini", "settings.json"), "utf-8"))
    expect(geminiConfig.mcpServers?.["toon-memory"]).toBeDefined()
    expect(existsSync(join(testDir, ".gemini", "GEMINI.md"))).toBe(true)
    // Gemini uses hooks.SessionStart (not the legacy session_start_hooks key)
    expect(geminiConfig.hooks?.SessionStart).toBeDefined()
    expect(Array.isArray(geminiConfig.hooks.SessionStart)).toBe(true)
    expect(geminiConfig.hooks.SessionStart.length).toBeGreaterThan(0)
    expect(existsSync(geminiConfig.hooks.SessionStart[0].command)).toBe(true)

    // Check Antigravity hooks.json (official schema: hook-name -> events -> handlers)
    expect(existsSync(join(testDir, ".gemini", "config", "hooks.json"))).toBe(true)
    const agyHooks = JSON.parse(readFileSync(join(testDir, ".gemini", "config", "hooks.json"), "utf-8"))
    expect(agyHooks["toon-memory"]).toBeDefined()
    expect(Array.isArray(agyHooks["toon-memory"].PreInvocation)).toBe(true)
    expect(Array.isArray(agyHooks["toon-memory"].PostToolUse)).toBe(true)
    expect(Array.isArray(agyHooks["toon-memory"].Stop)).toBe(true)
    expect(agyHooks["toon-memory"].PreInvocation[0].command).toBeDefined()
    expect(agyHooks["toon-memory"].PostToolUse[0].hooks[0].command).toBeDefined()

    // Check .gitignore
    expect(existsSync(join(testDir, ".gitignore"))).toBe(true)
    const gitignore = readFileSync(join(testDir, ".gitignore"), "utf-8")
    expect(gitignore).toContain(".toon-memory/memory/")
  })

  it("should init OpenCode with correct format", () => {
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    const opencodeConfig = JSON.parse(readFileSync(join(testDir, ".opencode", "opencode.json"), "utf-8"))
    expect(opencodeConfig.mcp["toon-memory"]).toEqual({
      enabled: true,
      type: "local",
      command: ["npx", "-y", "toon-memory", "mcp"]
    })
  })

  it("should init Codex CLI with TOML format", () => {
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    const toml = readFileSync(join(testDir, ".codex", "config.toml"), "utf-8")
    expect(toml).toContain("[mcpServers.toon-memory]")
    expect(toml).toContain('command = "npx"')
    expect(toml).toContain('"-y", "toon-memory", "mcp"')
  })

  it("should init Gemini CLI with hooks.SessionStart (not session_start_hooks)", () => {
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    const geminiConfig = JSON.parse(readFileSync(join(testDir, ".gemini", "settings.json"), "utf-8"))
    expect(geminiConfig.session_start_hooks).toBeUndefined()
    expect(geminiConfig.hooks?.SessionStart).toBeDefined()
    expect(Array.isArray(geminiConfig.hooks.SessionStart)).toBe(true)
    expect(geminiConfig.hooks.SessionStart.length).toBeGreaterThan(0)

    // Check hook script exists
    const hookPath = geminiConfig.hooks.SessionStart[0].command
    expect(existsSync(hookPath)).toBe(true)
  })

  it("should init OpenCode with plugin and no top-level hooks key", () => {
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    const opencodeConfig = JSON.parse(readFileSync(join(testDir, ".opencode", "opencode.json"), "utf-8"))
    expect(opencodeConfig.hooks).toBeUndefined()
    expect(existsSync(join(testDir, ".opencode", "plugins", "toon-memory.ts"))).toBe(true)
  })

  it("should init Codex with stable [[hooks]] event= format", () => {
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    const toml = readFileSync(join(testDir, ".codex", "config.toml"), "utf-8")
    expect(toml).toContain('[[hooks]]')
    expect(toml).toContain('event = "SessionStart"')
    expect(toml).toContain('event = "PostToolUse"')
    expect(toml).toContain('event = "Stop"')
    expect(toml).not.toContain('[hooks.session_start]')
  })

  it("should init Antigravity with hooks.json (PreToolUse/PostToolUse/Stop)", () => {
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    const agyHooks = JSON.parse(readFileSync(join(testDir, ".gemini", "config", "hooks.json"), "utf-8"))
    expect(agyHooks["toon-memory"]).toBeDefined()
    expect(Array.isArray(agyHooks["toon-memory"].PreInvocation)).toBe(true)
    expect(Array.isArray(agyHooks["toon-memory"].PostToolUse)).toBe(true)
    expect(Array.isArray(agyHooks["toon-memory"].Stop)).toBe(true)
    expect(agyHooks["toon-memory"].PreInvocation[0].command).toBeDefined()
    expect(agyHooks["toon-memory"].PostToolUse[0].hooks[0].command).toBeDefined()
    // Antigravity has no SessionStart event: PreInvocation is the start-of-session hook
    expect(agyHooks["toon-memory"].PreInvocation[0].command).toBeDefined()
  })

  it("should init Claude Code with hooks", () => {
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    const claudeConfig = JSON.parse(readFileSync(join(testDir, ".claude", "settings.json"), "utf-8"))
    expect(claudeConfig.hooks?.SessionStart).toBeDefined()
    expect(Array.isArray(claudeConfig.hooks.SessionStart)).toBe(true)
    expect(claudeConfig.hooks.SessionStart.length).toBeGreaterThan(0)
  })

  it("should create Aider CONVENTIONS.md", () => {
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    expect(existsSync(join(testDir, "CONVENTIONS.md"))).toBe(true)
    const content = readFileSync(join(testDir, "CONVENTIONS.md"), "utf-8")
    expect(content).toContain("memory_recall")
    expect(content).toContain("memory_remember")
  })

  it("should uninstall from all agents", () => {
    // First init
    execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    // Then uninstall
    const output = execSync(`node ${cliPath} uninstall`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    expect(output).toContain("toon-memory uninstaller")
    expect(output).toContain("Removed")

    // Check that MCP config was removed from OpenCode
    const opencodeConfig = JSON.parse(readFileSync(join(testDir, ".opencode", "opencode.json"), "utf-8"))
    expect(opencodeConfig.mcp?.["toon-memory"]).toBeUndefined()

    // Check hooks were removed
    expect(existsSync(join(testDir, ".toon-memory", "hooks"))).toBe(false)
  })

  it("should show non-interactive hint when no TTY (no args)", () => {
    // In CI/tests stdin is piped (not a TTY), so the installer must not hang.
    const output = execSync(`node ${cliPath}`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })
    expect(output).toContain("instalación interactiva")
    expect(output).toContain("init [local|global]")
  })

  it("should report unknown command with usage", () => {
    let output = ""
    try {
      execSync(`node ${cliPath} bogus-cmd`, {
        cwd: testDir,
        encoding: "utf-8",
        env: { ...process.env, HOME: testDir },
      })
    } catch (e: any) {
      output = e.stdout?.toString() || ""
    }
    expect(output).toContain("Comando desconocido")
    expect(output).toContain("Uso:")
  })
})
