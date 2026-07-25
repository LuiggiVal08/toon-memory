import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { execSync } from "child_process"
import {
	generateContextGenerate,
	generateContextDiff,
	generateContextFocus,
	generateContextHealth,
	generateContextExport,
} from "../src/lib/context"

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

function makeProject(files: Record<string, string>): string {
	const root = mkdtempSync(join(tmpdir(), "toon-ctx-tools-"))
	for (const [name, content] of Object.entries(files)) {
		const fullPath = join(root, name)
		const dir = fullPath.split("/").slice(0, -1).join("/")
		mkdirSync(dir, { recursive: true })
		writeFileSync(fullPath, content)
	}
	return root
}

describe("generateContextGenerate", () => {
	it("includes project info when package.json exists", () => {
		const root = makeProject({
			"package.json": JSON.stringify({ name: "my-app", version: "1.0.0", dependencies: { react: "^18" } }),
			"src/index.ts": "export {}",
		})
		const result = generateContextGenerate(SAMPLE, root)
		expect(result).toContain("my-app")
		expect(result).toContain("1.0.0")
		expect(result).toContain("react")
		rmSync(root, { recursive: true, force: true })
	})

	it("includes git info", () => {
		const root = makeProject({
			"package.json": JSON.stringify({ name: "test" }),
		})
		// Init git in this dir
		try { execSync("git init && git config user.email t@t.com && git config user.name T", { cwd: root, stdio: "ignore" }) } catch {}
		const result = generateContextGenerate(SAMPLE, root)
		expect(result).toContain("Git")
		rmSync(root, { recursive: true, force: true })
	})

	it("includes memory overview", () => {
		const root = makeProject({ "README.md": "hello" })
		const result = generateContextGenerate(SAMPLE, root)
		expect(result).toContain("Memoria (5 entradas)")
		rmSync(root, { recursive: true, force: true })
	})

	it("includes entries relevant to task in task mode", () => {
		const root = makeProject({ "README.md": "hello" })
		const result = generateContextGenerate(SAMPLE, root, { task: "redis" })
		expect(result).toContain("Entradas relevantes")
		rmSync(root, { recursive: true, force: true })
	})

	it("handles empty memory", () => {
		const root = makeProject({ "README.md": "hello" })
		const result = generateContextGenerate(EMPTY, root)
		expect(result).toContain("Memoria: vacía")
		rmSync(root, { recursive: true, force: true })
	})
})

describe("generateContextDiff", () => {
	it("returns a string", () => {
		const root = makeProject({ "README.md": "hello" })
		const result = generateContextDiff(SAMPLE, root)
		expect(typeof result).toBe("string")
		expect(result.length).toBeGreaterThan(0)
		rmSync(root, { recursive: true, force: true })
	})

	it("includes memory changes for today", () => {
		const root = makeProject({ "README.md": "hello" })
		const result = generateContextDiff(SAMPLE, root)
		// All sample entries are from today
		expect(result).toContain("Memoria")
		rmSync(root, { recursive: true, force: true })
	})

	it("returns 'sin cambios' when no changes", () => {
		const root = makeProject({ "README.md": "hello" })
		try { execSync("git init && git config user.email t@t.com && git config user.name T", { cwd: root, stdio: "ignore" }) } catch {}
		// Use a date far in the future so nothing matches
		const result = generateContextDiff(EMPTY, root, "2099-01-01")
		expect(result).toContain("Sin cambios")
		rmSync(root, { recursive: true, force: true })
	})
})

describe("generateContextFocus", () => {
	it("includes relevant entries for the task", () => {
		const root = makeProject({ "README.md": "hello" })
		const result = generateContextFocus(SAMPLE, root, "redis cache")
		expect(result).toContain("redis-cache")
		rmSync(root, { recursive: true, force: true })
	})

	it("finds related files", () => {
		const root = makeProject({
			"src/auth.ts": "export function auth() {}",
			"src/auth.test.ts": "import { auth } from './auth'",
			"src/user.ts": "export {}",
		})
		const result = generateContextFocus(SAMPLE, root, "auth")
		expect(result).toContain("src/auth.ts")
		rmSync(root, { recursive: true, force: true })
	})

	it("finds callers", () => {
		const root = makeProject({
			"src/caller.ts": "import { authenticate } from './auth'\nauthenticate()",
			"src/auth.ts": "export function authenticate() { return true }",
		})
		const result = generateContextFocus(SAMPLE, root, "authenticate")
		expect(result).toContain("Referencias")
		rmSync(root, { recursive: true, force: true })
	})

	it("handles no results gracefully", () => {
		const root = makeProject({ "README.md": "hello" })
		const result = generateContextFocus(EMPTY, root, "zzz_nonexistent_zzz")
		expect(result).toContain("Sin contexto encontrado")
		rmSync(root, { recursive: true, force: true })
	})
})

describe("generateContextHealth", () => {
	it("returns report and markdown", () => {
		const root = makeProject({ "README.md": "hello" })
		const { report, markdown } = generateContextHealth(SAMPLE, root)
		expect(report).toHaveProperty("score")
		expect(report).toHaveProperty("warnings")
		expect(report).toHaveProperty("info")
		expect(typeof markdown).toBe("string")
		rmSync(root, { recursive: true, force: true })
	})

	it("detects orphan links", () => {
		const data = `version: 1
entries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|knowledge|foo|Content.|f.ts|tag|${today}||0|nonexistent|0.50|1.0
  a2|knowledge|bar|Content.|f.ts|tag|${today}||0||0.50|1.0
`
		const root = makeProject({ "README.md": "hello" })
		const { report } = generateContextHealth(data, root)
		expect(report.warnings.some((w) => w.includes("huérfanos"))).toBe(true)
		expect(report.score).toBeLessThan(100)
		rmSync(root, { recursive: true, force: true })
	})

	it("detects duplicate content", () => {
		const data = `version: 1
entries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|knowledge|foo|Same content here.|f.ts|tag|${today}||0||0.50|1.0
  a2|knowledge|bar|Same content here.|f.ts|tag|${today}||0||0.50|1.0
`
		const root = makeProject({ "README.md": "hello" })
		const { report } = generateContextHealth(data, root)
		expect(report.warnings.some((w) => w.includes("duplicadas"))).toBe(true)
		rmSync(root, { recursive: true, force: true })
	})

	it("detects broken file refs", () => {
		const data = `version: 1
entries[1|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1|knowledge|foo|Content.|nonexistent.ts:10|tag|${today}||0||0.50|1.0
`
		const root = makeProject({ "README.md": "hello" })
		const { report } = generateContextHealth(data, root)
		expect(report.warnings.some((w) => w.includes("archivos inexistentes"))).toBe(true)
		rmSync(root, { recursive: true, force: true })
	})

	it("gives score 100 for clean memory", () => {
		const root = makeProject({
			"README.md": "hello",
			"cache.ts": "",
			"redis.ts": "",
			"src/auth.ts": "",
			"db.ts": "",
			"api.ts": "",
		})
		const { report } = generateContextHealth(SAMPLE, root)
		expect(report.score).toBe(100)
		rmSync(root, { recursive: true, force: true })
	})

	it("handles empty memory", () => {
		const root = makeProject({ "README.md": "hello" })
		const { report, markdown } = generateContextHealth(EMPTY, root)
		expect(report.score).toBeGreaterThan(0)
		expect(markdown).toContain("Memory Health")
		rmSync(root, { recursive: true, force: true })
	})
})

describe("generateContextExport", () => {
	it("exports full format with all sections", () => {
		const result = generateContextExport(SAMPLE, "full")
		expect(result).toContain("toon-memory export")
		expect(result).toContain("Decisiones")
		expect(result).toContain("Patrones")
		expect(result).toContain("redis-cache")
	})

	it("exports compact format", () => {
		const result = generateContextExport(SAMPLE, "compact")
		expect(result).toContain("toon-memory export")
		expect(result).toContain("redis-cache")
		// Compact should be shorter than full
		const full = generateContextExport(SAMPLE, "full")
		expect(result.length).toBeLessThanOrEqual(full.length)
	})

	it("handles empty memory", () => {
		const result = generateContextExport(EMPTY, "full")
		expect(result).toContain("Memoria vacía")
	})

	it("includes category labels in Spanish", () => {
		const result = generateContextExport(SAMPLE, "full")
		expect(result).toContain("Decisiones")
		expect(result).toContain("Bugs")
		expect(result).toContain("Conocimiento")
	})
})
