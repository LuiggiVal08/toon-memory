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

  it("uses supported hooks and the compact brief", () => {
    const src = opencodePluginContent()
    expect(src).toContain('"experimental.chat.system.transform"')
    expect(src).toContain('"experimental.session.compacting"')
    expect(src).toContain('"tool.execute.after"')
    expect(src).toContain("npx -y toon-memory brief")
    expect(src).toContain("npx -y toon-memory mcp")
    expect(src).not.toContain("memory-autoload.md")
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

  it("injects through the supported system.transform output channel", () => {
    const src = opencodePluginContent()
    expect(src).toContain("output.system.push(text)")
    expect(src).not.toContain("setContext")
  })

  it("records directives, edits and errors, then promotes at session idle", () => {
    const src = opencodePluginContent()
    expect(src).toContain('"chat.message"')
    expect(src).toContain('record("user_directive"')
    expect(src).toContain('record("diff_pattern"')
    expect(src).toContain('record("error_fix"')
    expect(src).toContain('"session.idle"')
    expect(src).toContain("npx -y toon-memory promote")
  })

	it("keeps the file-path extraction helpers shared between hooks", () => {
		const src = opencodePluginContent()
		expect(src).toContain("pickPath")
		expect(src).toContain("buildQuery")
		expect(src).toContain("inject")
	})
})
