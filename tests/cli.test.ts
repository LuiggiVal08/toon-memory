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

  it("should init with local scope", () => {
    const output = execSync(`node ${cliPath} init local`, {
      cwd: testDir,
      encoding: "utf-8",
      env: { ...process.env, HOME: testDir },
    })

    expect(output).toContain("toon-memory init")
    expect(output).toContain("opencode:")
    expect(output).toContain("vscode/copilot:")

    // Check that files were created
    expect(existsSync(join(testDir, ".opencode", "tools", "memory.ts"))).toBe(true)
    expect(existsSync(join(testDir, ".opencode", "memory", "data.toon"))).toBe(true)
    expect(existsSync(join(testDir, ".opencode", "opencode.json"))).toBe(true)
    expect(existsSync(join(testDir, ".vscode", "mcp.json"))).toBe(true)

    // Check opencode.json content
    const opencodeConfig = JSON.parse(readFileSync(join(testDir, ".opencode", "opencode.json"), "utf-8"))
    expect(opencodeConfig.mcp?.["toon-memory"]).toBeDefined()
    expect(opencodeConfig.mcp["toon-memory"].command).toBe("npx")

    // Check vscode/mcp.json content
    const vscodeConfig = JSON.parse(readFileSync(join(testDir, ".vscode", "mcp.json"), "utf-8"))
    expect(vscodeConfig.servers?.["toon-memory"]).toBeDefined()
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
    expect(output).toContain("✅ Removed from")

    // Check that MCP config was removed
    const opencodeConfig = JSON.parse(readFileSync(join(testDir, ".opencode", "opencode.json"), "utf-8"))
    expect(opencodeConfig.mcp?.["toon-memory"]).toBeUndefined()
  })
})
