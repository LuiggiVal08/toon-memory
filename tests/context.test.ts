import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { generateContextBrief } from "../src/lib/context"
import { join } from "path"
import { tmpdir } from "os"
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync, unlinkSync } from "fs"

const today = new Date().toISOString().split("T")[0]

const SAMPLE = `version: 1
entries[5|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|redis-cache|Usamos redis para cache de sesiones.|cache.ts|redis;cache|${today}||0||0.70|1.0
  a2|bug|redis-timeout|Redis connection timeout en producción.|redis.ts|redis;bug|${today}||0||0.55|0.9
  a3|pattern|auth-jwt|Siempre usar refresh tokens para JWT.|src/auth.ts|auth;jwt|${today}||0||0.65|1.0
  a4|knowledge|postgres-db|Postgres guarda el estado principal.|db.ts|db;postgres|${today}||0||0.60|1.0
  a5|pattern|api-versioning|Usar versionado en URLs de API.|api.ts|api;versioning|${today}||0||0.50|1.0
`

const EMPTY = `version: 1
entries[0|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
`

const EXPIRED = `version: 1
entries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|old-decision|Decisión antigua expirada.|f.ts|tag|2025-01-01|2025-06-01|0||0.50|1.0
  a2|knowledge|current|Contenido actual.|f.ts|tag|${today}||0||0.60|1.0
`

const WITH_LINKS = `version: 1
entries[4|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|decision|engine|El motor usa redis.|src/engine.ts|engine;redis|${today}||0|redis-cache|0.70|1.0
  a2|knowledge|redis-cache|Configuración de redis.|cache.ts|redis|${today}||0||0.60|1.0
  a3|knowledge|redis-timeout|Timeout de redis.|redis.ts|redis;bug|${today}||0||0.55|1.0
  a4|knowledge|orphan-link|Tiene un link roto.|x.ts|misc|${today}||0|nonexistent-key|0.40|1.0
`

describe("generateContextBrief", () => {
	const sessionsDir = join(tmpdir(), "toon-ctx-test-" + Date.now())

	beforeEach(() => {
		// Create fake session dir to avoid polluting real sessions
		mkdirSync(sessionsDir, { recursive: true })
	})

	afterEach(() => {
		rmSync(sessionsDir, { recursive: true, force: true })
	})

	it("returns a non-empty string for non-empty memory", () => {
		const result = generateContextBrief(SAMPLE)
		expect(result.length).toBeGreaterThan(0)
	})

	it("includes memory overview with entry count", () => {
		const result = generateContextBrief(SAMPLE)
		expect(result).toContain("Memory (5 entries)")
	})

	it("shows category breakdown", () => {
		const result = generateContextBrief(SAMPLE)
		expect(result).toContain("decision:")
		expect(result).toContain("bug:")
		expect(result).toContain("pattern:")
		expect(result).toContain("knowledge:")
	})

	it("includes sessions section", () => {
		const result = generateContextBrief(SAMPLE)
		expect(result).toContain("Sessions")
	})

	it("returns empty-ish message for empty memory", () => {
		const result = generateContextBrief(EMPTY)
		expect(result).toContain("Memory: empty")
	})

	it("shows expired TTL count in overview", () => {
		const result = generateContextBrief(EXPIRED)
		expect(result).toContain("1 expired")
	})

	it("lists patterns in the patterns section", () => {
		const result = generateContextBrief(SAMPLE)
		expect(result).toContain("Established patterns")
		expect(result).toContain("auth-jwt")
		expect(result).toContain("api-versioning")
	})

	it("includes top memorias in general mode (no task)", () => {
		const result = generateContextBrief(SAMPLE)
		expect(result).toContain("Top memories")
	})
})

describe("generateContextBrief — task mode", () => {
	it("ranks redis entries higher when task mentions redis", () => {
		const result = generateContextBrief(SAMPLE, { task: "redis cache" })
		expect(result).toContain("Relevant entries")
		expect(result).toContain("redis-cache")
	})

	it("returns entries relevant to auth task", () => {
		const result = generateContextBrief(SAMPLE, { task: "jwt authentication" })
		expect(result).toContain("auth-jwt")
	})

	it("respects limit parameter", () => {
		const result = generateContextBrief(SAMPLE, { task: "redis", limit: 2 })
		// Should have numeric indices [1] and [2] but not [3]
		expect(result).toContain("[1]")
		expect(result).toContain("[2]")
	})

	it("does not include expired entries in relevant results", () => {
		const result = generateContextBrief(EXPIRED, { task: "decisión" })
		// The expired entry should not appear in "Relevant entries"
		expect(result).not.toContain("old-decision")
	})

	it("includes graph edges when entries are linked", () => {
		const result = generateContextBrief(WITH_LINKS, { task: "redis" })
		// Should contain edges notation like ->2
		expect(result).toMatch(/->\d/)
	})
})

describe("generateContextBrief — health section", () => {
	it("warns about orphan links", () => {
		const result = generateContextBrief(WITH_LINKS)
		expect(result).toContain("orphan links")
		expect(result).toContain("orphan-link->nonexistent-key")
	})

	it("warns about high entry count", () => {
		// Build a data string with 85 entries
		const entries = Array.from({ length: 85 }, (_, i) =>
			`  e${String(i).padStart(2, "0")}|knowledge|key-${i}|Content for entry ${i}.|f.ts|tag|${today}||0||0.50|1.0`
		).join("\n")
		const data = `version: 1\nentries[85|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:\n${entries}\n`
		const result = generateContextBrief(data)
		expect(result).toContain("85 entries")
	})

	it("does not show health section when no warnings", () => {
		const result = generateContextBrief(EMPTY)
		expect(result).not.toContain("Health")
	})
})
