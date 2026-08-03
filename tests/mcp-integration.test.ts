import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { spawn, type ChildProcess } from "child_process"
import { join } from "path"
import { tmpdir } from "os"
import { mkdirSync, rmSync, writeFileSync, existsSync } from "fs"

const ROOT = join(import.meta.dirname, "..")
const SERVER_BIN = join(ROOT, "bin", "toon-memory.js")

interface McpResponse {
	jsonrpc: "2.0"
	id: number
	result?: unknown
	error?: { code: number; message: string }
}

class McpClient {
	private proc: ChildProcess
	private buffer = ""
	private pending = new Map<number, { resolve: (v: McpResponse) => void; reject: (e: Error) => void }>()
	private nextId = 1

	constructor(cwd: string) {
		this.proc = spawn("node", [SERVER_BIN, "mcp"], {
			cwd,
			stdio: ["pipe", "pipe", "pipe"],
			env: { ...process.env, NODE_OPTIONS: "" },
		})

		this.proc.stdout!.on("data", (chunk: Buffer) => {
			this.buffer += chunk.toString()
			this.processBuffer()
		})

		this.proc.stderr!.on("data", () => {
			// MCP server logs to stderr — ignore
		})
	}

	private processBuffer(): void {
		const lines = this.buffer.split("\n")
		this.buffer = lines.pop() || ""
		for (const line of lines) {
			const trimmed = line.trim()
			if (!trimmed) continue
			try {
				const msg = JSON.parse(trimmed) as McpResponse
				if (msg.id !== undefined && this.pending.has(msg.id)) {
					this.pending.get(msg.id)!.resolve(msg)
					this.pending.delete(msg.id)
				}
			} catch {
				// Not JSON — ignore (server log line)
			}
		}
	}

	async request(method: string, params: Record<string, unknown> = {}): Promise<McpResponse> {
		const id = this.nextId++
		return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			this.pending.delete(id)
			reject(new Error(`MCP request ${method} timed out (id=${id})`))
		}, 20_000)

			this.pending.set(id, {
				resolve: (v) => { clearTimeout(timeout); resolve(v) },
				reject: (e) => { clearTimeout(timeout); reject(e) },
			})

			const msg = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"
			this.proc.stdin!.write(msg)
		})
	}

	async initialize(): Promise<void> {
		const res = await this.request("initialize", {
			protocolVersion: "2025-03-26",
			capabilities: {},
			clientInfo: { name: "test-client", version: "1.0.0" },
		})
		expect(res.result).toBeDefined()

		// Send initialized notification (no id — it's a notification)
		this.proc.stdin!.write(
			JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n"
		)
	}

	async callTool(name: string, args: Record<string, unknown> = {}): Promise<string> {
		const res = await this.request("tools/call", { name, arguments: args })
		expect(res.result).toBeDefined()
		const result = res.result as { content: Array<{ type: string; text?: string }> }
		expect(result.content).toBeDefined()
		expect(result.content.length).toBeGreaterThan(0)
		return result.content[0].text || ""
	}

	async listTools(): Promise<string[]> {
		const res = await this.request("tools/list")
		expect(res.result).toBeDefined()
		const result = res.result as { tools: Array<{ name: string }> }
		return result.tools.map((t) => t.name)
	}

	async getToolDefinitions(): Promise<Array<{ name: string; annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean }; _meta?: Record<string, unknown> }>> {
		const res = await this.request("tools/list")
		expect(res.result).toBeDefined()
		return (res.result as { tools: Array<{ name: string; annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean }; _meta?: Record<string, unknown> }> }).tools
	}

	async readResource(uri: string): Promise<string> {
		const res = await this.request("resources/read", { uri })
		expect(res.result).toBeDefined()
		const result = res.result as { contents: Array<{ text: string }> }
		expect(result.contents).toBeDefined()
		expect(result.contents.length).toBeGreaterThan(0)
		return result.contents[0].text
	}

	kill(): void {
		this.proc.kill("SIGTERM")
	}
}

describe("MCP Integration", () => {
	let client: McpClient
	const testDir = join(tmpdir(), "toon-mcp-integration-" + Date.now())

	beforeAll(async () => {
		mkdirSync(join(testDir, ".toon-memory", "memory"), { recursive: true })
		// Minimal TOON file with 1 entry
		writeFileSync(
			join(testDir, ".toon-memory", "memory", "data.toon"),
			`version: 1\nentries[1|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:\n  abc12345|decision|use-zod|Use Zod for validation|src/types.ts|types;validation|2026-07-25||0||0.70|1.0\n`
		)

		client = new McpClient(testDir)
		await client.initialize()
	}, 15_000)

	afterAll(() => {
		client?.kill()
		rmSync(testDir, { recursive: true, force: true })
	})

	// ── Tool listing ──────────────────────────────────────────────

  it("lists all 35 tools", async () => {
    const tools = await client.listTools()
    expect(tools.length).toBe(35)
    expect(tools).toContain("memory_remember")
    expect(tools).toContain("memory_recall")
    expect(tools).toContain("memory_forget")
    expect(tools).toContain("memory_stats")
    expect(tools).toContain("memory_summary")
    expect(tools).toContain("memory_archive")
    expect(tools).toContain("memory_encrypt")
    expect(tools).toContain("memory_decrypt")
    expect(tools).toContain("memory_suggest")
    expect(tools).toContain("memory_smart_recall")
    expect(tools).toContain("memory_diff")
    expect(tools).toContain("memory_compress")
    expect(tools).toContain("memory_consolidate")
    expect(tools).toContain("memory_backup")
    expect(tools).toContain("memory_sessions")
    expect(tools).toContain("memory_captured")
    expect(tools).toContain("memory_merge_sessions")
    expect(tools).toContain("memory_export_gist")
    expect(tools).toContain("memory_import_gist")
    expect(tools).toContain("memory_primer")
    expect(tools).toContain("context_brief")
    expect(tools).toContain("context_diff")
    expect(tools).toContain("context_focus")
    expect(tools).toContain("context_generate")
    expect(tools).toContain("context_health")
    expect(tools).toContain("context_export")
    expect(tools).toContain("memory_graph_path")
    expect(tools).toContain("memory_visualize")
    expect(tools).toContain("memory_pin")
    expect(tools).toContain("memory_unpin")
    expect(tools).toContain("memory_search")
    expect(tools).toContain("memory_tag")
    expect(tools).toContain("memory_checkpoint")
    expect(tools).toContain("memory_reflect")
    expect(tools).toContain("memory_promote")
  })

  it("annotates tools with readOnly/destructive/idempotent hints", async () => {
    const defs = await client.getToolDefinitions()
    const byName = new Map(defs.map((t) => [t.name, t]))
    // Destructive tools must be flagged
    expect(byName.get("memory_forget")!.annotations?.destructiveHint).toBe(true)
    expect(byName.get("memory_archive")!.annotations?.destructiveHint).toBe(true)
    expect(byName.get("memory_encrypt")!.annotations?.destructiveHint).toBe(true)
    expect(byName.get("memory_decrypt")!.annotations?.destructiveHint).toBe(true)
    expect(byName.get("memory_import_gist")!.annotations?.destructiveHint).toBe(true)
    expect(byName.get("memory_consolidate")!.annotations?.destructiveHint).toBe(true)
    // Read-only tools must be flagged
    for (const name of ["memory_stats", "memory_diff", "memory_suggest", "memory_primer", "context_brief", "context_health", "context_export", "context_diff", "context_focus", "context_generate", "memory_graph_path", "memory_sessions", "memory_compress", "memory_reflect", "memory_visualize"]) {
      expect(byName.get(name)!.annotations?.readOnlyHint).toBe(true)
    }
    // Every tool carries the annotations object
    for (const t of defs) {
      expect(t.annotations).toBeDefined()
      expect(typeof t.annotations?.readOnlyHint).toBe("boolean")
    }
  })

	// ── Resource listing ──────────────────────────────────────────

	it("lists 4 resources", async () => {
		const res = await client.request("resources/list")
		expect(res.result).toBeDefined()
		const result = res.result as { resources: Array<{ uri: string }> }
		expect(result.resources.length).toBe(4)
		const uris = result.resources.map((r) => r.uri)
		expect(uris).toContain("toon://memory/entries")
		expect(uris).toContain("toon://memory/stats")
		expect(uris).toContain("toon://memory/summaries")
		expect(uris).toContain("ui://viewer")
	})
	it("exposes the memory_visualize tool with UI resource metadata", async () => {
		const tools = await client.getToolDefinitions()
		const visualizeTool = tools.find((tool) => tool.name === "memory_visualize")
		expect(visualizeTool).toBeDefined()
		const meta = visualizeTool!._meta as Record<string, unknown>
		expect(meta).toBeDefined()
		const ui = meta.ui as Record<string, unknown>
		expect(ui).toBeDefined()
		expect(ui.resourceUri).toBe("ui://viewer")
	})
	// ── memory_remember + memory_recall ───────────────────────────

	it("memory_remember saves and memory_recall finds it", async () => {
		const saveResult = await client.callTool("memory_remember", {
			category: "knowledge",
			key: "test-integration",
			content: "This is an integration test entry",
			file: "test.ts",
		})
		expect(saveResult).toContain("test-integration")

		const recallResult = await client.callTool("memory_recall", {
			query: "integration test",
		})
		expect(recallResult).toContain("test-integration")
		expect(recallResult).toContain("This is an integration test entry")
	})

	// ── memory_recall progressive disclosure (index + ids) ─────────

	it("memory_recall mode:'index' lists key/id/category without content", async () => {
		await client.callTool("memory_remember", {
			category: "knowledge",
			key: "index-probe",
			content: "Index probe entry content",
			file: "probe.ts",
		})

		const index = await client.callTool("memory_recall", { query: "probe", mode: "index" })
		expect(index).toContain("index-probe")
		expect(index).toMatch(/\[1\] index-probe \(/)
		expect(index).not.toContain("Index probe entry content")

		// Extract the id shown in the index and verify ids fetch returns it.
		const idMatch = index.match(/index-probe \(([^)]+)\)/)
		expect(idMatch).not.toBeNull()
		const id = idMatch![1]

		const fetched = await client.callTool("memory_recall", { ids: id })
		expect(fetched).toContain("index-probe")
		expect(fetched).toContain("Index probe entry content")
	})

	it("memory_recall ids fetches by key and skips unknown tokens", async () => {
		const fetched = await client.callTool("memory_recall", { ids: "use-zod,no-such-entry" })
		expect(fetched).toContain("use-zod")
		expect(fetched).toContain("Use Zod for validation")
		expect(fetched).not.toContain("no-such-entry")
	})

	it("memory_recall ids preserves the requested order", async () => {
		const out = await client.callTool("memory_recall", { ids: "use-zod,index-probe", budget: "deep" })
		const idxUseZod = out.indexOf("use-zod")
		const idxProbe = out.indexOf("index-probe")
		expect(idxUseZod).toBeGreaterThan(-1)
		expect(idxProbe).toBeGreaterThan(idxUseZod)
	})

	// ── memory_stats ──────────────────────────────────────────────

	it("memory_stats returns entry counts", async () => {
		const result = await client.callTool("memory_stats")
		expect(result).toContain("Total entries:")
		// Should have at least 2 entries (the seeded one + the one we just added)
		const match = result.match(/Total entries:\s*(\d+)/)
		expect(match).not.toBeNull()
		expect(parseInt(match![1])).toBeGreaterThanOrEqual(2)
	})

	// ── memory_forget ─────────────────────────────────────────────

	it("memory_forget removes an entry", async () => {
		// First, add an entry to delete
		await client.callTool("memory_remember", {
			category: "bug",
			key: "to-delete",
			content: "Entry that will be deleted",
		})

		// Verify it exists
		const recall = await client.callTool("memory_recall", { query: "to-delete" })
		expect(recall).toContain("to-delete")

		// Delete it (hard delete to fully remove)
		const deleteResult = await client.callTool("memory_forget", { key: "to-delete", action: "hard" })
		expect(deleteResult).toContain("to-delete")

		// Verify it's gone (no entry content, only the "no results" echo)
		const recallAfter = await client.callTool("memory_recall", { query: "to-delete" })
		expect(recallAfter).not.toContain("Entry that will be deleted")
	})

	// ── memory_forget soft-delete + restore ─────────────────────────

	it("memory_forget soft-deletes and restore brings it back", async () => {
		// Add an entry
		await client.callTool("memory_remember", {
			category: "knowledge",
			key: "soft-delete-test",
			content: "Entry for soft delete test",
		})

		// Soft delete
		const softResult = await client.callTool("memory_forget", { key: "soft-delete-test" })
		expect(softResult).toContain("obsolete")

		// Should not appear in normal recall
		const recall = await client.callTool("memory_recall", { query: "soft-delete-test" })
		expect(recall).not.toContain("soft-delete-test")

		// Restore
		const resolveResult = await client.callTool("memory_forget", { key: "soft-delete-test", action: "restore" })
		expect(resolveResult).toContain("restored")

		// Should appear again
		const recallAfter = await client.callTool("memory_recall", { query: "soft-delete-test" })
		expect(recallAfter).toContain("soft-delete-test")
	})

	it("memory_forget soft action marks entry as obsolete", async () => {
		await client.callTool("memory_remember", {
			category: "knowledge",
			key: "suppress-test",
			content: "Entry to suppress",
		})

		const result = await client.callTool("memory_forget", { key: "suppress-test", action: "soft" })
		expect(result).toContain("obsolete")

		const recall = await client.callTool("memory_recall", { query: "suppress-test" })
		expect(recall).not.toContain("suppress-test")
	})

	it("memory_forget canonical restore/supersede actions work", async () => {
		await client.callTool("memory_remember", {
			category: "knowledge",
			key: "lifecycle-canary",
			content: "Entry for canonical lifecycle actions",
		})

		// Supersede via the canonical action param
		const supersede = await client.callTool("memory_forget", { key: "lifecycle-canary", action: "supersede" })
		expect(supersede).toContain("superseded")

		const recall = await client.callTool("memory_recall", { query: "lifecycle-canary" })
		expect(recall).not.toContain("Entry for canonical lifecycle actions")

		// Restore via the canonical action param
		const restore = await client.callTool("memory_forget", { key: "lifecycle-canary", action: "restore" })
		expect(restore).toContain("restored")

		const recallAfter = await client.callTool("memory_recall", { query: "lifecycle-canary" })
		expect(recallAfter).toContain("lifecycle-canary")
	})

	// ── memory_consolidate ────────────────────────────────────────

	it("memory_consolidate runs without error", async () => {
		const result = await client.callTool("memory_consolidate")
		expect(result).toContain("consolidat")
	})

	it("memory_consolidate similar and low-quality modes run", async () => {
		await client.callTool("memory_remember", {
			category: "knowledge",
			key: "similar-dup-a",
			content: "The Redis cache uses a fixed pool size with a 5s timeout for reconnects",
		})
		await client.callTool("memory_remember", {
			category: "knowledge",
			key: "similar-dup-b",
			content: "The Redis cache uses a fixed pool size with a 5s timeout for reconnects",
		})

		const similar = await client.callTool("memory_consolidate", { mode: "similar" })
		expect(similar).toContain("Merged")
		expect(similar).toContain("similar-dup")

		const lowQuality = await client.callTool("memory_consolidate", { mode: "low-quality", minQuality: 1.0, dryRun: true })
		expect(lowQuality).toContain("Compression candidates")
	})

	// ── memory_sessions ───────────────────────────────────────────

	it("memory_sessions returns session info", async () => {
		const result = await client.callTool("memory_sessions")
		// Either shows active sessions or "no other sessions" message
		expect(result.length).toBeGreaterThan(0)
	})

	// ── context_brief ─────────────────────────────────────────────

	it("context_brief returns a compact briefing", async () => {
		const result = await client.callTool("context_brief", { task: "validation" })
		expect(result).toContain("Memory")
		expect(result).toContain("Sessions")
	})

	it("context_brief works without task (general mode)", async () => {
		const result = await client.callTool("context_brief")
		expect(result).toContain("Memory")
		expect(result).toContain("Top memories")
	})

	// ── context_generate ─────────────────────────────────────────

	it("context_generate returns full context briefing", async () => {
		const result = await client.callTool("context_generate")
		expect(result).toContain("Memory")
		expect(result).toContain("Sessions")
	})

	it("context_generate with task ranks entries by relevance", async () => {
		const result = await client.callTool("context_generate", { task: "validation" })
		expect(result).toContain("Memory")
	})

	// ── context_diff ─────────────────────────────────────────────

	it("context_diff returns changes", async () => {
		const result = await client.callTool("context_diff")
		expect(result.length).toBeGreaterThan(0)
	})

	// ── context_focus ────────────────────────────────────────────

	it("context_focus returns focused context for a task", async () => {
		const result = await client.callTool("context_focus", { task: "validation" })
		expect(result.length).toBeGreaterThan(0)
	})

	// ── context_health ───────────────────────────────────────────

	it("context_health returns health audit with score", async () => {
		const result = await client.callTool("context_health")
		expect(result).toContain("Memory Health")
		expect(result).toContain("/100")
	})

	// ── context_export ───────────────────────────────────────────

	it("context_export returns full markdown export", async () => {
		const result = await client.callTool("context_export", { format: "full" })
		expect(result).toContain("toon-memory export")
	})

	it("context_export compact format works", async () => {
		const result = await client.callTool("context_export", { format: "compact" })
		expect(result).toContain("toon-memory export")
	})

	// ── memory_smart_recall ───────────────────────────────────────

	it("memory_smart_recall returns compact results", async () => {
		const result = await client.callTool("memory_smart_recall", {
			intent: "validation types",
		})
		// Should contain at least one entry
		expect(result.length).toBeGreaterThan(0)
	})

	// ── memory_diff ───────────────────────────────────────────────

	it("memory_diff returns changes since a date", async () => {
		const today = new Date().toISOString().split("T")[0]
		const result = await client.callTool("memory_diff", { since: "24h" })
		// Should contain at least the entries we added today
		expect(result.length).toBeGreaterThan(0)
	})

	// ── Resource reading ──────────────────────────────────────────

	it("toon://memory/entries resource returns TOON data", async () => {
		const data = await client.readResource("toon://memory/entries")
		expect(data).toContain("version: 1")
		expect(data).toContain("entries[")
	})

	it("toon://memory/stats resource returns stats", async () => {
		const stats = await client.readResource("toon://memory/stats")
		expect(stats).toContain("Total entries:")
	})

	it("toon://memory/summaries resource returns system primer", async () => {
		const primer = await client.readResource("toon://memory/summaries")
		expect(primer).toContain("System Primer")
	})

	// ── memory_captured ───────────────────────────────────────────

	it("memory_captured returns empty when no observations", async () => {
		const result = await client.callTool("memory_captured")
		// Should either say empty or show observations
		expect(result.length).toBeGreaterThan(0)
	})

	// ── memory_suggest ────────────────────────────────────────────

	it("memory_suggest returns related entries", async () => {
		const result = await client.callTool("memory_suggest", {
			context: "validation types",
		})
		expect(result.length).toBeGreaterThan(0)
	})

	// ── memory_forget supersede + as_of ───────────────────────────────

	it("memory_forget supersede marks old entry obsolete and as_of recalls it", async () => {
		// Seed controlled entries: use-joi created 2026-07-01, superseded today.
		const dataFile = join(testDir, ".toon-memory", "memory", "data.toon")
		writeFileSync(
			dataFile,
			`version: 1\nentries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:\n  abc12345|decision|use-zod|Use Zod for validation|src/types.ts|types;validation|2026-07-25||0||0.70|1.0\n  e1|decision|use-joi|Use Joi for validation|t.ts|validation;superseded|2026-07-01||0||0.5|1.0\n  e2|decision|use-zod-fresh|Use Zod 2 for validation|t.ts|validation|2026-07-01||0||0.9|1.0\n`
		)

		const result = await client.callTool("memory_forget", { key: "use-joi", action: "supersede", new_key: "use-zod-fresh", reason: "Zod is better" })
		expect(result).toContain("superseded")
		expect(result).toContain("use-zod-fresh")

		// Hidden from normal recall (content gone; only the supersedes link may echo the key)
		const recall = await client.callTool("memory_recall", { query: "joi" })
		expect(recall).not.toContain("Use Joi for validation")

		// Visible in the temporal as_of view (was still active on 2026-07-05)
		const asOf = await client.callTool("memory_recall", { query: "joi", as_of: "2026-07-05" })
		expect(asOf).toContain("Use Joi for validation")

		// Still restorable
		const resolveResult = await client.callTool("memory_forget", { key: "use-joi", action: "restore" })
		expect(resolveResult).toContain("restored")
	})

	// ── memory_reflect ─────────────────────────────────────────────

	it("memory_reflect returns a deterministic audit", async () => {
		const result = await client.callTool("memory_reflect")
		expect(result).toContain("Memory reflect")
		expect(result).toContain("entries")
	})

	it("memory_reflect supports category scoping", async () => {
		const result = await client.callTool("memory_reflect", { category: "decision", limit: 3 })
		expect(result).toContain("Memory reflect")
	})

	// ── memory_promote ─────────────────────────────────────────────

	it("memory_promote previews and promotes observations from the capture log", async () => {
		const obsDir = join(testDir, ".toon-memory", "memory")
		const now = new Date().toISOString()
		writeFileSync(
			join(obsDir, "observations.toon"),
			`version: 1\nobservations[2|]{ts|session|agent|branch|tool|hash|file|summary}:\n  ${now}|s1|code|main|edit|h1|src/lib/graph.ts|Added typed link parsing to graph.ts with superseded_by edges\n  ${now}|s1|code|main|read|h2||Viewed README to check docs\n`
		)

		// Dry run: no writes
		const dry = await client.callTool("memory_promote", { dryRun: true, max: 5 })
		expect(dry).toContain("Dry run")

		const res = await client.callTool("memory_promote", { dryRun: false, max: 5, minConfidence: 0.65 })
		expect(res).toContain("Promoted")
		// The edit observation is high confidence (active); the read is low (draft)
		expect(res).toContain("active")
		expect(res).toContain("draft")
	})

	it("memory_promote does not duplicate existing entries", async () => {
		const obsDir = join(testDir, ".toon-memory", "memory")
		const now = new Date().toISOString()
		writeFileSync(
			join(obsDir, "observations.toon"),
			`version: 1\nobservations[1|]{ts|session|agent|branch|tool|hash|file|summary}:\n  ${now}|s1|code|main|edit|h1||Use Zod for validation\n`
		)
		const res = await client.callTool("memory_promote", { dryRun: false, max: 5 })
		expect(res).toContain("Nothing new to promote")
	})
})
