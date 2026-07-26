import type { McpServer } from "@modelcontextprotocol/server"
import { readMemory } from "./memory-io"
import { isExpired } from "./entries"
import { generateSystemPrimer } from "../lib/quality"

/**
 * Register memory MCP resources (entries, stats, summaries).
 */
export function registerResources(server: McpServer): void {
  server.registerResource(
    "memory-entries",
    "toon://memory/entries",
    { title: "Memory Entries", mimeType: "text/plain" },
    async (uri) => {
      const data = readMemory()
      return { contents: [{ uri: uri.href, text: data }] }
    }
  )

  server.registerResource(
    "memory-stats",
    "toon://memory/stats",
    { title: "Memory Stats", mimeType: "text/plain" },
    async (uri) => {
      const data = readMemory()
      const lines = data.split("\n").filter((l) => l.startsWith("  ") && l.includes("|") && !l.startsWith("  summaries:"))
      const entries = lines.map((l) => {
        const parts = l.trim().split("|")
        return { category: parts[1] || "unknown", ttl: parts[7] || "" }
      })
      const byCategory: Record<string, number> = {}
      for (const e of entries) {
        byCategory[e.category] = (byCategory[e.category] || 0) + 1
      }
      const withTtl = entries.filter((e) => e.ttl).length
      const expired = entries.filter((e) => e.ttl && isExpired(e.ttl)).length
      const text = [
        `Total entries: ${entries.length}`,
        `TTL: ${withTtl} with expiration, ${expired} expired`,
        "By category:",
        ...Object.entries(byCategory).map(([k, v]) => `  ${k}: ${v}`),
      ].join("\n")
      return { contents: [{ uri: uri.href, text }] }
    }
  )

  server.registerResource(
    "memory-summaries",
    "toon://memory/summaries",
    { title: "Memory Summaries", mimeType: "text/plain" },
    async (uri) => {
      const data = readMemory()
      const primer = generateSystemPrimer(data)
      return { contents: [{ uri: uri.href, text: primer }] }
    }
  )
}
