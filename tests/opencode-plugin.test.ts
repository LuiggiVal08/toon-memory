import { describe, it, expect } from "vitest"
import { opencodePluginContent } from "../src/cli/opencode-plugin"

function bodyOf(src: string): string {
	// Strip ESM import/export so the plugin body can be parsed as a function.
	return src
		.replace(/^import[^\n]*\n/gm, "")
		.replace(/^export /m, "")
}

describe("opencode plugin source", () => {
	it("generates a syntactically valid plugin body", () => {
		const src = opencodePluginContent()
		expect(() => new Function(bodyOf(src))).not.toThrow()
	})

	it("keeps the existing auto-load hooks", () => {
		const src = opencodePluginContent()
		expect(src).toContain('"session.created"')
		expect(src).toContain('"experimental.session.compacting"')
		expect(src).toContain('"tool.execute.after"')
		expect(src).toContain("npx -y toon-memory mcp")
	})

	it("adds a pre-edit risk hook backed by warning-category recall", () => {
		const src = opencodePluginContent()
		expect(src).toContain('"tool.execute.before"')
		expect(src).toContain('category: "warning"')
		expect(src).toContain("KNOWN RISKS for")
		expect(src).toContain("risks")
	})

	it("only surfaces risks for edit/write-ish tools", () => {
		const src = opencodePluginContent()
		expect(src).toContain("isEditTool")
		expect(src).toContain('name.includes("edit")')
		expect(src).toContain('name.includes("patch")')
	})

	it("guards context injection with a typeof check", () => {
		const src = opencodePluginContent()
		expect(src).toContain('typeof ctx?.setContext === "function"')
	})

	it("keeps the file-path extraction helpers shared between hooks", () => {
		const src = opencodePluginContent()
		expect(src).toContain("pickPath")
		expect(src).toContain("buildQuery")
		expect(src).toContain("inject")
	})
})
