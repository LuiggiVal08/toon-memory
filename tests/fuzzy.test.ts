import { describe, it, expect } from "vitest"
import { levenshtein, fuzzyMatch } from "../src/lib/fuzzy"

describe("levenshtein", () => {
	it("returns 0 for identical strings", () => {
		expect(levenshtein("hello", "hello")).toBe(0)
	})

	it("calculates single-char substitution", () => {
		expect(levenshtein("hello", "hallo")).toBe(1)
	})

	it("calculates single-char insertion", () => {
		expect(levenshtein("hell", "hello")).toBe(1)
	})

	it("calculates single-char deletion", () => {
		expect(levenshtein("hello", "hell")).toBe(1)
	})

	it("calculates multi-edit distance", () => {
		expect(levenshtein("kitten", "sitting")).toBe(3)
	})

	it("handles empty strings", () => {
		expect(levenshtein("", "abc")).toBe(3)
		expect(levenshtein("abc", "")).toBe(3)
		expect(levenshtein("", "")).toBe(0)
	})

	it("is symmetric", () => {
		expect(levenshtein("abc", "xyz")).toBe(levenshtein("xyz", "abc"))
	})
})

describe("fuzzyMatch", () => {
	it("matches tokens within distance threshold", () => {
		expect(fuzzyMatch(["tiemout"], ["timeout"])).toBe(true)
	})

	it("rejects tokens beyond distance threshold", () => {
		expect(fuzzyMatch(["xyz"], ["timeout"])).toBe(false)
	})

	it("skips very short query tokens (<=2 chars)", () => {
		expect(fuzzyMatch(["ab"], ["abc"])).toBe(false)
	})

	it("short-circuits on first match", () => {
		expect(fuzzyMatch(["tiemout", "other"], ["timeout", "foo"])).toBe(true)
	})

	it("handles empty inputs", () => {
		expect(fuzzyMatch([], ["timeout"])).toBe(false)
		expect(fuzzyMatch(["hello"], [])).toBe(false)
	})

	it("respects maxDistance parameter", () => {
		expect(fuzzyMatch(["timout"], ["timeout"], 1)).toBe(true)
		expect(fuzzyMatch(["temout"], ["timeout"], 1)).toBe(false)
	})

	it("skips tokens that differ in length by more than maxDistance", () => {
		expect(fuzzyMatch(["a"], ["abcdefgh"])).toBe(false)
	})
})
