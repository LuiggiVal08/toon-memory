import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { existsSync, readFileSync, rmSync, mkdirSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

const KEY = "1".repeat(64)

describe("secrets vault (F3)", () => {
  const testDir = join(tmpdir(), "toon-memory-vault-" + Date.now())
  const memoryDir = join(testDir, ".toon-memory", "memory")
  const vaultFile = join(memoryDir, "secrets.toon")
  let cwd = process.cwd()
  let vault: typeof import("../src/mcp/vault")

  beforeEach(async () => {
    mkdirSync(memoryDir, { recursive: true })
    cwd = process.cwd()
    process.chdir(testDir)
    process.env.TOON_MEMORY_KEY = KEY
    // SECRETS_FILE is derived from process.cwd() at module load — re-import
    // after chdir so the vault targets the temp dir.
    vi.resetModules()
    vault = await import("../src/mcp/vault")
  })

  afterEach(() => {
    delete process.env.TOON_MEMORY_KEY
    process.chdir(cwd)
    rmSync(testDir, { recursive: true, force: true })
  })

  it("round-trips a stored secret", () => {
    vault.storeSecret("gh_token", "super-secret-value", { tags: "github;ci", file: "ci.yml" })
    const got = vault.getSecret("gh_token")
    expect(got).not.toBeNull()
    expect(got!.value).toBe("super-secret-value")
    expect(got!.tags).toEqual(["github", "ci"])
    expect(got!.file).toBe("ci.yml")
  })

  it("never stores plaintext at rest — the whole file is encrypted", () => {
    vault.storeSecret("api_key", "plaintext-must-not-leak")
    expect(existsSync(vaultFile)).toBe(true)
    const raw = readFileSync(vaultFile, "utf-8")
    expect(raw).not.toContain("plaintext-must-not-leak")
    expect(raw).not.toContain("api_key")
  })

  it("returns null for a missing secret and lists metadata only", () => {
    expect(vault.getSecret("nope")).toBeNull()
    vault.storeSecret("token_a", "value-a")
    const list = vault.listSecrets()
    expect(list).toHaveLength(1)
    expect(list[0].key).toBe("token_a")
    expect(JSON.stringify(list)).not.toContain("value-a")
  })

  it("overwrites in place keeping the same id", () => {
    const first = vault.storeSecret("db_pw", "old")
    vault.storeSecret("db_pw", "new")
    const second = vault.listSecrets().find((s) => s.key === "db_pw")
    expect(second!.id).toBe(first.id)
    expect(vault.getSecret("db_pw")!.value).toBe("new")
  })

  it("forget removes the secret", () => {
    vault.storeSecret("tmp", "value")
    expect(vault.forgetSecret("tmp")).toBe(true)
    expect(vault.forgetSecret("tmp")).toBe(false)
    expect(vault.getSecret("tmp")).toBeNull()
  })

  it("survives readVault/writeVault across module instances (real file round-trip)", async () => {
    vault.storeSecret("k1", "v1")
    vi.resetModules()
    const reloaded = await import("../src/mcp/vault")
    expect(reloaded.getSecret("k1")!.value).toBe("v1")
  })

  it("throws a friendly error when TOON_MEMORY_KEY is missing", () => {
    delete process.env.TOON_MEMORY_KEY
    expect(() => vault.storeSecret("k", "v")).toThrow(/TOON_MEMORY_KEY/)
  })
})
