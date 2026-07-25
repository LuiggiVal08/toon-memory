import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { dirname } from "path"
import type { Agent } from "./types"
import { INSTRUCTION_CONTENT, OPENCODE_PASSIVE_INSTRUCTION } from "./constants"

/**
 * Install instruction files for an agent.
 * Creates AGENTS.md, GEMINI.md, CONVENTIONS.md, etc. with
 * reminders to use toon-memory tools.
 */
export function installInstructions(agent: Agent): void {
  if (!agent.needsInstructions || !agent.instructionFile) return

  const filePath = agent.instructionFile
  const fileDir = dirname(filePath)

  if (!existsSync(fileDir)) mkdirSync(fileDir, { recursive: true })

  const content = agent.name === "opencode"
    ? OPENCODE_PASSIVE_INSTRUCTION
    : INSTRUCTION_CONTENT

  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, "utf-8")
    if (existing.includes("toon-memory") || existing.includes("memory_recall")) {
      console.log(`  Instructions already present in ${filePath}`)
      return
    }
    writeFileSync(filePath, `${existing.trim()}\n\n${content}`)
    console.log(`  Appended toon-memory instructions to ${filePath}`)
  } else {
    writeFileSync(filePath, content)
    console.log(`  Created ${filePath}`)
  }
}
