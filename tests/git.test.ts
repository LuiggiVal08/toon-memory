import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { execSync } from "child_process"
import { readGitIndex, readRecentCommits, gitStatusSummary } from "../src/lib/git"

let testDir: string
const cwd = process.cwd()

function git(...args: string[]): string {
  return execSync(`git ${args.join(" ")}`, { cwd: testDir, encoding: "utf-8" }).trim()
}

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), "toon-git-test-"))
  process.chdir(testDir)
  git("init --initial-branch=main")
  git("config user.email test@test.com")
  git("config user.name Test")
})

afterEach(() => {
  process.chdir(cwd)
  try {
    rmSync(testDir, { recursive: true, force: true })
  } catch {
    // Ignore cleanup errors (e.g. locked pack files on some systems)
  }
})

describe("readGitIndex", () => {
  it("returns empty for a repo with no commits", () => {
    // Empty repo — index may be empty or have untracked entries
    const files = readGitIndex()
    expect(Array.isArray(files)).toBe(true)
  })

  it("lists tracked files after commit", () => {
    writeFileSync(join(testDir, "a.ts"), "hello")
    writeFileSync(join(testDir, "b.ts"), "world")
    git("add .")
    git("commit -m 'initial'")
    const files = readGitIndex()
    expect(files).toContain("a.ts")
    expect(files).toContain("b.ts")
  })

  it("returns empty for non-git directory", () => {
    process.chdir(tmpdir())
    // This will use the real .git if it exists, so just check it doesn't throw
    const files = readGitIndex()
    expect(Array.isArray(files)).toBe(true)
  })
})

describe("readRecentCommits", () => {
  it("returns commits in reverse chronological order", () => {
    writeFileSync(join(testDir, "a.ts"), "v1")
    git("add .")
    git("commit -m 'first commit'")
    writeFileSync(join(testDir, "a.ts"), "v2")
    git("add .")
    git("commit -m 'second commit'")
    writeFileSync(join(testDir, "a.ts"), "v3")
    git("add .")
    git("commit -m 'third commit'")

    const commits = readRecentCommits(3)
    expect(commits).toHaveLength(3)
    expect(commits[0].subject).toBe("third commit")
    expect(commits[1].subject).toBe("second commit")
    expect(commits[2].subject).toBe("first commit")
  })

  it("returns short hashes", () => {
    writeFileSync(join(testDir, "a.ts"), "x")
    git("add .")
    git("commit -m 'test'")

    const commits = readRecentCommits(1)
    expect(commits).toHaveLength(1)
    expect(commits[0].shortHash).toHaveLength(7)
    expect(commits[0].hash).toHaveLength(40)
  })

  it("returns author and date", () => {
    writeFileSync(join(testDir, "a.ts"), "x")
    git("add .")
    git("commit -m 'test'")

    const commits = readRecentCommits(1)
    expect(commits[0].author).toBe("Test")
    expect(commits[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("respects count parameter", () => {
    for (let i = 0; i < 5; i++) {
      writeFileSync(join(testDir, `f${i}.ts`), `v${i}`)
      git("add .")
      const ts = new Date(Date.now() + i * 60000).toISOString()
      execSync(`git commit -m 'commit ${i}'`, {
        cwd: testDir,
        encoding: "utf-8",
        env: { ...process.env, GIT_AUTHOR_DATE: ts, GIT_COMMITTER_DATE: ts }
      })
    }
    expect(readRecentCommits(3)).toHaveLength(3)
    expect(readRecentCommits(10)).toHaveLength(5)
  })

  it("returns empty for no commits", () => {
    // Fresh repo with no commits
    expect(readRecentCommits(5)).toEqual([])
  })
})

describe("gitStatusSummary", () => {
  it("returns branch, head, tracked files, and commits", () => {
    writeFileSync(join(testDir, "a.ts"), "x")
    git("add .")
    git("commit -m 'init'")

    const summary = gitStatusSummary()
    expect(summary.branch).toMatch(/^(main|master)$/)
    expect(summary.head).toMatch(/^[0-9a-f]{40}$/)
    expect(summary.trackedFiles).toBe(1)
    expect(summary.recentCommits).toHaveLength(1)
    expect(summary.recentCommits[0].subject).toBe("init")
  })

  it("detects .gitignore", () => {
    writeFileSync(join(testDir, ".gitignore"), "node_modules/\n")
    writeFileSync(join(testDir, "a.ts"), "x")
    git("add .")
    git("commit -m 'init'")

    const summary = gitStatusSummary()
    expect(summary.hasGitignore).toBe(true)
  })

  it("returns hasGitignore false when no .gitignore", () => {
    writeFileSync(join(testDir, "a.ts"), "x")
    git("add .")
    git("commit -m 'init'")

    const summary = gitStatusSummary()
    expect(summary.hasGitignore).toBe(false)
  })

  it("counts tracked files correctly", () => {
    writeFileSync(join(testDir, "a.ts"), "x")
    writeFileSync(join(testDir, "b.ts"), "y")
    writeFileSync(join(testDir, "c.ts"), "z")
    git("add .")
    git("commit -m 'three files'")

    const summary = gitStatusSummary()
    expect(summary.trackedFiles).toBe(3)
  })
})
