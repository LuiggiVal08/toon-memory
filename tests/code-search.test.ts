import { describe, it, expect } from "vitest"
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { findFilesByPattern, searchCode, findCallers, findTestFiles } from "../src/lib/code-search"

function makeProject(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "toon-search-"))
  for (const [name, content] of Object.entries(files)) {
    const fullPath = join(root, name)
    const dir = fullPath.split("/").slice(0, -1).join("/")
    mkdirSync(dir, { recursive: true })
    writeFileSync(fullPath, content)
  }
  return root
}

describe("findFilesByPattern", () => {
  it("finds files by substring match", () => {
    const root = makeProject({
      "src/auth.ts": "export {}",
      "src/auth.test.ts": "import {}",
      "src/user.ts": "export {}",
    })
    const results = findFilesByPattern(root, "auth")
    expect(results).toContain("src/auth.ts")
    expect(results).toContain("src/auth.test.ts")
    expect(results).not.toContain("src/user.ts")
    rmSync(root, { recursive: true, force: true })
  })

  it("returns empty for no matches", () => {
    const root = makeProject({
      "src/app.ts": "export {}",
    })
    expect(findFilesByPattern(root, "nonexistent")).toEqual([])
    rmSync(root, { recursive: true, force: true })
  })

  it("skips node_modules", () => {
    const root = makeProject({
      "node_modules/pkg/auth.ts": "export {}",
      "src/auth.ts": "export {}",
    })
    const results = findFilesByPattern(root, "auth")
    expect(results).toEqual(["src/auth.ts"])
    rmSync(root, { recursive: true, force: true })
  })
})

describe("searchCode", () => {
  it("finds matching lines in source files", () => {
    const root = makeProject({
      "src/auth.ts": "export function authenticate() {\n  return true\n}\nexport function login() {\n  return authenticate()\n}",
      "src/user.ts": "export function getUser() {\n  return null\n}",
    })
    const results = searchCode(root, "authenticate")
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((r) => r.file === "src/auth.ts")).toBe(true)
    rmSync(root, { recursive: true, force: true })
  })

  it("respects maxResults", () => {
    const root = makeProject({
      "src/a.ts": "export const x = 'test'\nexport const y = 'test'",
      "src/b.ts": "export const z = 'test'",
    })
    const results = searchCode(root, "test", { maxResults: 2 })
    expect(results).toHaveLength(2)
    rmSync(root, { recursive: true, force: true })
  })

  it("returns line numbers", () => {
    const root = makeProject({
      "src/a.ts": "line1\nline2\nfindme\nline4",
    })
    const results = searchCode(root, "findme")
    expect(results).toHaveLength(1)
    expect(results[0].line).toBe(3)
    rmSync(root, { recursive: true, force: true })
  })

  it("skips non-source files", () => {
    const root = makeProject({
      "src/a.ts": "findme",
      "data.json": "findme",
      "README.md": "findme",
    })
    const results = searchCode(root, "findme")
    expect(results).toHaveLength(1)
    expect(results[0].file).toBe("src/a.ts")
    rmSync(root, { recursive: true, force: true })
  })
})

describe("findCallers", () => {
  it("finds word-boundary matches for a symbol", () => {
    const root = makeProject({
      "src/caller.ts": "import { authenticate } from './auth'\nauthenticate()",
      "src/auth.ts": "export function authenticate() {\n  return true\n}",
    })
    const results = findCallers(root, "authenticate")
    expect(results.length).toBeGreaterThanOrEqual(2)
    rmSync(root, { recursive: true, force: true })
  })

  it("does not match partial words", () => {
    const root = makeProject({
      "src/a.ts": "export function authenticateUser() {}\nauthenticate()",  // partial match
    })
    const results = findCallers(root, "authenticate")
    // Should match line 2 (authenticate()) but NOT line 1 (authenticateUser)
    expect(results).toHaveLength(1)
    expect(results[0].line).toBe(2)
    rmSync(root, { recursive: true, force: true })
  })
})

describe("findTestFiles", () => {
  it("finds test files related to a pattern", () => {
    const root = makeProject({
      "src/auth.ts": "export {}",
      "tests/auth.test.ts": "import {}",
      "tests/user.test.ts": "import {}",
    })
    const results = findTestFiles(root, "auth")
    expect(results.some((f) => f.includes("auth.test"))).toBe(true)
    rmSync(root, { recursive: true, force: true })
  })
})
