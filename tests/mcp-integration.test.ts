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

	async getToolDefinitions(): Promise<Array<{ name: string; _meta?: Record<string, unknown> }>> {
		const res = await this.request("tools/list")
		expect(res.result).toBeDefined()
		return (res.result as { tools: Array<{ name: string; _meta?: Record<string, unknown> }> }).tools
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

  it("lists all 30 tools", async () => {
    const tools = await client.listTools()
    expect(tools.length).toBe(30)
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
    expect(tools).toContain("memory_compress_all")
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
    expect(tools).toContain("memory_merge_similar")
    expect(tools).toContain("memory_graph_path")
    expect(tools).toContain("memory_visualize")
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

		// Delete it
		const deleteResult = await client.callTool("memory_forget", { key: "to-delete" })
		expect(deleteResult).toContain("to-delete")

		// Verify it's gone (no entry content, only the "no results" echo)
		const recallAfter = await client.callTool("memory_recall", { query: "to-delete" })
		expect(recallAfter).not.toContain("Entry that will be deleted")
	})

	// ── memory_consolidate ────────────────────────────────────────

	it("memory_consolidate runs without error", async () => {
		const result = await client.callTool("memory_consolidate")
		expect(result).toContain("consolidat")
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
})
