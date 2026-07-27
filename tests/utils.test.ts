import { describe, it, expect } from "vitest"
import { tokenize, normalize, isPrivate } from "../src/lib/utils"

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
