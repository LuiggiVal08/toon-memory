import { describe, it, expect } from "vitest"
import { tokenize, normalize, isPrivate, escField, unescField, parseToonLine, toToonLine } from "../src/lib/utils"

describe("tokenize", () => {
	it("splits camelCase identifiers", () => {
		expect(tokenize("getConnectionTimeout")).toEqual(["get", "connection", "timeout"])
	})

	it("splits hyphenated identifiers", () => {
		expect(tokenize("redis-pool-fix")).toEqual(["redis", "pool", "fix"])
	})

	it("splits underscored identifiers", () => {
		expect(tokenize("rate_limiter_crash")).toEqual(["rate", "limiter", "crash"])
	})

	it("handles mixed separators", () => {
		expect(tokenize("my-CamelCase_field")).toEqual(["my", "camel", "case", "field"])
	})

	it("lowercases and normalizes", () => {
		expect(tokenize("  Hello World  ")).toEqual(["hello", "world"])
	})

	it("handles empty string", () => {
		expect(tokenize("")).toEqual([])
	})

	it("preserves exact tokens that are already split", () => {
		expect(tokenize("redis cache")).toEqual(["redis", "cache"])
	})
})

describe("normalize", () => {
	it("lowercases and replaces hyphens/underscores with spaces", () => {
		expect(normalize("Redis-Pool_Cache")).toBe("redis pool cache")
	})

	it("collapses whitespace", () => {
		expect(normalize("  too   many   spaces  ")).toBe("too many spaces")
	})
})

describe("isPrivate", () => {
	it("returns true when tags contain 'private'", () => {
		expect(isPrivate({ tags: ["secret", "private"] })).toBe(true)
	})

	it("returns true for case-insensitive match", () => {
		expect(isPrivate({ tags: ["PRIVATE"] })).toBe(true)
		expect(isPrivate({ tags: ["Private"] })).toBe(true)
	})

	it("returns false when tags do not contain 'private'", () => {
		expect(isPrivate({ tags: ["redis", "cache"] })).toBe(false)
	})

	it("returns false for empty tags", () => {
		expect(isPrivate({ tags: [] })).toBe(false)
	})
})

describe("escField / unescField", () => {
	it("round-trips a plain string", () => {
		const s = "hello world"
		expect(unescField(escField(s))).toBe(s)
	})

	it("escapes literal newlines as \\n", () => {
		expect(escField("line1\nline2")).toBe("line1\\nline2")
		expect(unescField("line1\\nline2")).toBe("line1\nline2")
	})

	it("normalizes CR and CRLF to a single \\n", () => {
		expect(escField("a\r\nb")).toBe("a\\nb")
		expect(escField("a\rb")).toBe("a\\nb")
	})

	it("escapes literal pipes so they are not delimiters", () => {
		expect(escField('tiny|normal|deep')).toBe("tiny\\|normal\\|deep")
		expect(unescField("tiny\\|normal\\|deep")).toBe("tiny|normal|deep")
	})

	it("escapes backslashes and keeps \\n/\\| literal sequences intact", () => {
		expect(escField("a\\nb")).toBe("a\\\\nb")
		expect(unescField("a\\\\nb")).toBe("a\\nb")
	})

	it("round-trips mixed hazards", () => {
		const s = "C:\\path\nline with | pipe \\ and newline"
		expect(unescField(escField(s))).toBe(s)
	})
})

describe("parseToonLine / toToonLine", () => {
	it("serializes and parses fields, ignoring the leading indent", () => {
		const parts = ["id", "knowledge", "some-key", "content", "", "tag1;tag2", "2026-07-30", "", "0", "", "0.9", "1"]
		const line = toToonLine(parts)
		expect(line.startsWith("  ")).toBe(true)
		expect(parseToonLine(line)).toEqual(parts)
	})

	it("keeps multi-line content in a single field", () => {
		const parts = ["id", "knowledge", "multi", "line one\nline two\nline three", "file.ts", "tags", "2026-07-30", "", "0", "", "0.8", "1"]
		const line = toToonLine(parts)
		expect(line.split("\n").length).toBe(1)
		expect(parseToonLine(line)).toEqual(parts)
	})

	it("keeps literal pipes inside content in the content field", () => {
		const parts = ["id", "decision", "budget", 'budget: "tiny"|"normal"|"deep"', "graph.ts", "budget", "2026-07-30", "", "0", "", "0.7", "1"]
		expect(parseToonLine(toToonLine(parts))).toEqual(parts)
	})

	it("parses a line without trailing pipe", () => {
		expect(parseToonLine("  a|b|c")).toEqual(["a", "b", "c"])
	})

	it("parses trailing empty fields", () => {
		expect(parseToonLine("  a|b|c|")).toEqual(["a", "b", "c", ""])
		expect(parseToonLine("  a||")).toEqual(["a", "", ""])
	})
})
