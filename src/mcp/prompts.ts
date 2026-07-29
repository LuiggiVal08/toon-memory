import type { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"
import { readMemory } from "./memory-io"
import { parseEntries } from "../lib/graph"

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "summarize_project_context",
    {
      title: "Summarize Project Context",
      description: "Analyze the current TOON memory state and generate a compact summary of project knowledge.",
      argsSchema: { intent: z.string().optional().describe("Optional focus area (e.g. 'auth', 'database')") },
    },
    ({ intent }: { intent?: string }) => {
      const data = readMemory()
      const entries = parseEntries(data)
      const byCategory: Record<string, number> = {}
      for (const e of entries) {
        byCategory[e.category] = (byCategory[e.category] || 0) + 1
      }
      const total = entries.length
      let summary = `This project has ${total} memory entr${total === 1 ? "y" : "ies"}`
      if (byCategory.decision) summary += `, ${byCategory.decision} decision${byCategory.decision === 1 ? "" : "s"}`
      if (byCategory.pattern) summary += `, ${byCategory.pattern} pattern${byCategory.pattern === 1 ? "" : "s"}`
      if (byCategory.bug) summary += `, ${byCategory.bug} bug${byCategory.bug === 1 ? "" : "s"}`
      if (byCategory.knowledge) summary += `, ${byCategory.knowledge} knowledge entr${byCategory.knowledge === 1 ? "y" : "ies"}`
      if (byCategory.architecture) summary += `, ${byCategory.architecture} architecture note${byCategory.architecture === 1 ? "" : "s"}`
      summary += "."

      let filtered = entries
      if (intent) {
        const q = intent.toLowerCase()
        filtered = entries.filter((e) =>
          e.key.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
        )
      }

      const recent = [...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
      let detail = recent.length > 0
        ? "\n\nMost relevant entries:\n" + recent.map((e) =>
            `  [${e.category}] ${e.key}: ${e.content.slice(0, 100)}`
          ).join("\n")
        : ""

      return {
        messages: [{
          role: "user" as const,
          content: { type: "text" as const, text: summary + detail },
        }],
      }
    }
  )
}
