/** Tolerant argument helpers: LLMs routinely send "6" instead of 6. */

import { z } from "zod"

const toNumber = (v: unknown): unknown => {
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v)
  return v
}

/** Positive integer, optional with a fallback. Rejects 0, negatives and junk. */
export function positiveInt(fallback: number, max = 500) {
  return z.preprocess(toNumber, z.number().int().min(1).max(max).optional().default(fallback))
}

/** Positive integer, optional with no default (0 = absent). */
export function optionalPositiveInt(max = 500) {
  return z.preprocess(toNumber, z.number().int().min(1).max(max).optional())
}

/** String that must carry content — prevents silent empty-key entries. */
export function requiredText(label: string, max = 4000) {
  return z.string().trim().min(1, `${label} must not be empty`).max(max)
}

/** Normalize id lists regardless of separator, including JSON arrays. */
export function splitIds(value: string): string[] {
  if (!value) return []
  let raw = value
  if (value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) raw = parsed.map(String).join(" ")
    } catch {
      /* keep the raw string */
    }
  }
  return raw.split(/[\s,;]+/).map((t) => t.trim()).filter(Boolean)
}

/** Empty results are data, not errors. Actionable text + machine-readable payload. */
export function noMatches(query: string): { content: Array<{ type: "text"; text: string }>; structuredContent: { found: false; count: 0 } } {
  return {
    content: [{ type: "text", text: `No matching memories for "${query}". Try a shorter query, or save one first with memory_remember. A transient empty result is not an error.` }],
    structuredContent: { found: false, count: 0 },
  }
}
