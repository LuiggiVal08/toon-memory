import { describe, it, expect } from "vitest"
import { tokenize, normalize } from "../src/lib/utils"

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
