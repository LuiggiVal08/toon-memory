import { describe, it, expect } from "vitest"
import { fnv1a32, ngramHashes, ngramCosine, ngramScores } from "../src/lib/ngrams"

describe("fnv1a32", () => {
	it("is deterministic", () => {
		expect(fnv1a32("viewer")).toBe(fnv1a32("viewer"))
	})

	it("distinguishes different inputs", () => {
		expect(fnv1a32("autotag")).not.toBe(fnv1a32("auto tag"))
	})

	it("returns a 32-bit unsigned value", () => {
		for (const s of ["a", "tag", "recall", "serialization"]) {
			const h = fnv1a32(s)
			expect(h).toBeGreaterThanOrEqual(0)
			expect(h).toBeLessThanOrEqual(0xffffffff)
		}
	})
})

describe("ngramHashes", () => {
	it("captures boundary tri-grams via sentinels", () => {
		// "auto" padded as ^auto$: ^au, aut, uto, o$ — prefix/suffix tri-grams exist
		const h = ngramHashes("auto")
		expect(h.size).toBe(4)
	})

	it("morphology: 'autotag' and 'auto tag' share most tri-grams", () => {
		const a = ngramHashes("^autotag$")
		const b = ngramHashes("^auto$ ^tag$")
		// hand-checked shared tri-grams: aut uto tag
		expect(ngramCosine(a, b)).toBeGreaterThan(0.5)
	})

	it("plurals: 'plugin' and 'plugins' share heavily", () => {
		const p = ngramHashes("plugin")
		const ps = ngramHashes("plugins")
		expect(ngramCosine(p, ps)).toBeGreaterThan(0.6)
	})

	it("empty text yields no hashes", () => {
		expect(ngramHashes("").size).toBe(0)
		expect(ngramHashes("   ").size).toBe(0)
	})
})

describe("ngramCosine", () => {
	it("returns 0 when either set is empty", () => {
		expect(ngramCosine(new Set(), new Set([1, 2]))).toBe(0)
		expect(ngramCosine(new Set([1]), new Set())).toBe(0)
	})

	it("is symmetric", () => {
		const a = ngramHashes("serialization")
		const b = ngramHashes("serialize")
		expect(ngramCosine(a, b)).toBeCloseTo(ngramCosine(b, a), 5)
	})

	it("is 1 for identical text", () => {
		expect(ngramCosine(ngramHashes("toolcall"), ngramHashes("toolcall"))).toBe(1)
	})

	it("related entries score higher than unrelated ones", () => {
		const q = ngramHashes("auto tag entries")
		const related = ngramHashes("autotag vocab entries-module")
		const unrelated = ngramHashes("physics sliders charge distance")
		expect(ngramCosine(q, related)).toBeGreaterThan(ngramCosine(q, unrelated))
	})
})

describe("ngramScores", () => {
	const entries = [
		{ id: "1", key: "vocab-autotag", category: "pattern", content: "Auto-tag entries from package json dependencies via vocabulary", file: "x.ts", tags: ["autotag", "vocab"], path_scope: "" },
		{ id: "2", key: "viewer-physics", category: "knowledge", content: "physics sliders charge distance center defaults", file: "y.ts", tags: ["viewer"], path_scope: "" },
	]
	it("ranks the morphologically-matching entry above an unrelated one", () => {
		const scores = ngramScores(entries, "auto tag entries from package json dependencies")
		expect(scores.get("vocab-autotag")!).toBeGreaterThan(scores.get("viewer-physics")!)
	})

	it("returns a 0..1 score for every entry", () => {
		const scores = ngramScores(entries, "auto tag")
		for (const e of entries) {
			const s = scores.get(e.key)!
			expect(s).toBeGreaterThanOrEqual(0)
			expect(s).toBeLessThanOrEqual(1)
		}
	})
})