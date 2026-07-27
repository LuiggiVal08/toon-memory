import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { join } from "path"
import { tmpdir } from "os"
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "fs"
import { withLockSync, atomicWrite, readUnderLock } from "../src/lib/lock"
import { encrypt, decrypt } from "../src/mcp/crypto"
import { entryScore, entryScoreForLine } from "../src/mcp/scoring"

let testDir: string
let testFile: string

beforeEach(() => {
  testDir = join(tmpdir(), `toon-infra-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(testDir, { recursive: true })
  testFile = join(testDir, "test.toon")
})

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true })
})

// ── Lock & Atomic Write ─────────────────────────────────────────────

describe("withLockSync", () => {
  it("executes function under lock", () => {
    let called = false
    withLockSync(testFile, () => { called = true })
    expect(called).toBe(true)
  })

  it("creates and removes lock file", () => {
    withLockSync(testFile, () => {
      expect(existsSync(`${testFile}.lock`)).toBe(true)
    })
    expect(existsSync(`${testFile}.lock`)).toBe(false)
  })

  it("is reentrant within same process", () => {
    let depth = 0
    withLockSync(testFile, () => {
      depth++
      withLockSync(testFile, () => {
        depth++
      })
      expect(depth).toBe(2)
    })
    expect(depth).toBe(2)
  })

  it("removes lock file even on error", () => {
    try {
      withLockSync(testFile, () => {
        throw new Error("test error")
      })
    } catch {
      // expected
    }
    expect(existsSync(`${testFile}.lock`)).toBe(false)
  })

  it("supports concurrent-like operations on different files", () => {
    const file2 = join(testDir, "test2.toon")
    let order = 0
    withLockSync(testFile, () => {
      expect(order).toBe(0)
      order++
    })
    withLockSync(file2, () => {
      expect(order).toBe(1)
      order++
    })
    expect(order).toBe(2)
  })
})

describe("atomicWrite", () => {
  it("writes content to file atomically", () => {
    atomicWrite(testFile, "hello world")
    expect(readFileSync(testFile, "utf-8")).toBe("hello world")
  })

  it("creates file if it doesn't exist", () => {
    expect(existsSync(testFile)).toBe(false)
    atomicWrite(testFile, "new content")
    expect(readFileSync(testFile, "utf-8")).toBe("new content")
  })

  it("overwrites existing content", () => {
    writeFileSync(testFile, "old content")
    atomicWrite(testFile, "new content")
    expect(readFileSync(testFile, "utf-8")).toBe("new content")
  })

  it("does not leave .tmp file on success", () => {
    atomicWrite(testFile, "content")
    expect(existsSync(`${testFile}.tmp`)).toBe(false)
  })

  it("handles empty content", () => {
    atomicWrite(testFile, "")
    expect(readFileSync(testFile, "utf-8")).toBe("")
  })

  it("handles large content", () => {
    const large = "x".repeat(100000)
    atomicWrite(testFile, large)
    expect(readFileSync(testFile, "utf-8")).toBe(large)
  })
})

describe("readUnderLock", () => {
  it("reads file under lock", () => {
    writeFileSync(testFile, "locked content")
    const content = readUnderLock(testFile)
    expect(content).toBe("locked content")
  })

  it("removes lock after reading", () => {
    writeFileSync(testFile, "content")
    readUnderLock(testFile)
    expect(existsSync(`${testFile}.lock`)).toBe(false)
  })

  it("works with read-modify-write pattern", () => {
    writeFileSync(testFile, "count: 0")
    withLockSync(testFile, () => {
      const data = readFileSync(testFile, "utf-8")
      const count = parseInt(data.split(": ")[1]) + 1
      writeFileSync(testFile, `count: ${count}`)
    })
    const final = readFileSync(testFile, "utf-8")
    expect(final).toBe("count: 1")
  })
})

// ── Crypto ──────────────────────────────────────────────────────────

describe("encrypt/decrypt", () => {
  const key = require("crypto").randomBytes(32).toString("hex")

  it("roundtrips plaintext", () => {
    const plaintext = "Hello, World! This is a test message."
    const encrypted = encrypt(plaintext, key)
    expect(encrypted).not.toBe(plaintext)
    const decrypted = decrypt(encrypted, key)
    expect(decrypted).toBe(plaintext)
  })

  it("produces different ciphertext each time (random IV)", () => {
    const encrypted1 = encrypt("same text", key)
    const encrypted2 = encrypt("same text", key)
    expect(encrypted1).not.toBe(encrypted2)
  })

  it("format is iv:authTag:ciphertext", () => {
    const encrypted = encrypt("test", key)
    const parts = encrypted.split(":")
    expect(parts.length).toBe(3)
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/) // 16 bytes hex
    expect(parts[1]).toMatch(/^[0-9a-f]{32}$/) // 16 bytes hex
  })

  it("throws on wrong key", () => {
    const encrypted = encrypt("secret", key)
    const wrongKey = require("crypto").randomBytes(32).toString("hex")
    expect(() => decrypt(encrypted, wrongKey)).toThrow()
  })

  it("throws on invalid format", () => {
    expect(() => decrypt("invalid", key)).toThrow("Invalid encrypted data format")
  })

  it("throws on tampered ciphertext", () => {
    const encrypted = encrypt("secret", key)
    const parts = encrypted.split(":")
    const ctBuf = Buffer.from(parts[2], "hex")
    ctBuf[0] ^= 0xff
    parts[2] = ctBuf.toString("hex")
    expect(() => decrypt(parts.join(":"), key)).toThrow()
  })

  it("throws on tampered auth tag", () => {
    const encrypted = encrypt("secret", key)
    const parts = encrypted.split(":")
    const tagBuf = Buffer.from(parts[1], "hex")
    tagBuf[0] ^= 0xff
    parts[1] = tagBuf.toString("hex")
    expect(() => decrypt(parts.join(":"), key)).toThrow()
  })

  it("throws on tampered IV", () => {
    const encrypted = encrypt("secret", key)
    const parts = encrypted.split(":")
    const ivBuf = Buffer.from(parts[0], "hex")
    ivBuf[0] ^= 0xff
    parts[0] = ivBuf.toString("hex")
    expect(() => decrypt(parts.join(":"), key)).toThrow()
  })

  it("handles unicode content", () => {
    const plaintext = "Hello 🌍! Ñoño café résumé"
    const encrypted = encrypt(plaintext, key)
    const decrypted = decrypt(encrypted, key)
    expect(decrypted).toBe(plaintext)
  })

  it("handles empty string", () => {
    const encrypted = encrypt("", key)
    const decrypted = decrypt(encrypted, key)
    expect(decrypted).toBe("")
  })
})

// ── Scoring ─────────────────────────────────────────────────────────

describe("entryScore", () => {
  const today = new Date().toISOString().split("T")[0]

  it("returns a positive number for recent entry", () => {
    const score = entryScore(today, 0)
    expect(score).toBeGreaterThan(0)
  })

  it("returns 0 for very old entry with no access", () => {
    const score = entryScore("2020-01-01", 0)
    expect(score).toBe(0)
  })

  it("scores higher for entries accessed more", () => {
    const score0 = entryScore(today, 0)
    const score5 = entryScore(today, 5)
    expect(score5).toBeGreaterThan(score0)
  })

  it("scores higher for more recent entries", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const old = entryScore("2025-01-01", 0)
    const recent = entryScore(yesterday, 0)
    expect(recent).toBeGreaterThan(old)
  })

  it("never exceeds 1.0", () => {
    const score = entryScore(today, 100)
    expect(score).toBeLessThanOrEqual(1)
  })

  it("handles edge case of accessed=0", () => {
    const score = entryScore(today, 0)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})

describe("entryScoreForLine", () => {
  const today = new Date().toISOString().split("T")[0]

  it("parses date and accessed from pipe-delimited line", () => {
    const line = `  id1|decision|test|content|file.ts|tag|${today}||5||0.50|1.0`
    const score = entryScoreForLine(line)
    expect(score).toBeGreaterThan(0)
  })

  it("handles lines with fewer fields", () => {
    const line = `  id1|decision|test|content|file.ts|tag|${today}`
    const score = entryScoreForLine(line)
    expect(score).toBeGreaterThan(0)
  })

  it("defaults accessed to 0 for missing field", () => {
    const line = `  id1|decision|test|content|file.ts|tag|${today}|||`
    const score = entryScoreForLine(line)
    expect(score).toBeGreaterThan(0)
  })

  it("handles empty line gracefully", () => {
    const line = `  `
    const score = entryScoreForLine(line)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})
