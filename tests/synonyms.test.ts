import { describe, it, expect } from "vitest"
import { expandSynonyms, SYNONYMS } from "../src/lib/synonyms"

describe("expandSynonyms", () => {
	it("returns original tokens when no synonyms exist", () => {
		const result = expandSynonyms(["xyz"])
		expect(result).toEqual(["xyz"])
	})

	it("expands a single token with its synonyms", () => {
		const result = expandSynonyms(["error"])
		expect(result).toContain("error")
		expect(result).toContain("bug")
		expect(result).toContain("exception")
		expect(result).toContain("fail")
	})

	it("expands multiple tokens", () => {
		const result = expandSynonyms(["cache", "pool"])
		expect(result).toContain("redis")
		expect(result).toContain("connection pool")
	})

	it("deduplicates tokens", () => {
		const result = expandSynonyms(["error", "bug"])
		const unique = new Set(result)
		expect(result.length).toBe(unique.size)
	})

	it("handles empty input", () => {
		expect(expandSynonyms([])).toEqual([])
	})

	it("handles Spanish synonyms", () => {
		const result = expandSynonyms(["conexión"])
		expect(result).toContain("timeout")
		expect(result).toContain("red")
		expect(result).toContain("connection")
	})

	it("handles architecture terms", () => {
		const result = expandSynonyms(["auth"])
		expect(result).toContain("authentication")
		expect(result).toContain("jwt")
		expect(result).toContain("oauth")
	})
})

describe("SYNONYMS dictionary", () => {
	it("has entries for common coding terms", () => {
		expect(SYNONYMS["error"]).toBeDefined()
		expect(SYNONYMS["cache"]).toBeDefined()
		expect(SYNONYMS["deploy"]).toBeDefined()
		expect(SYNONYMS["auth"]).toBeDefined()
	})

	it("each synonym list is non-empty", () => {
		for (const [key, syns] of Object.entries(SYNONYMS)) {
			expect(syns.length).toBeGreaterThan(0)
		}
	})
})
