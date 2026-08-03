import { describe, it, expect, afterEach } from "vitest"
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "fs"
import { tmpdir } from "os"
import { join, dirname } from "path"
import { installJSONConfig } from "../src/cli/config-writer"
import type { Agent } from "../src/cli/types"

const dirs: string[] = []

function tmpAgent(): { dir: string; agent: Agent } {
  const dir = mkdtempSync(join(tmpdir(), "tm-cw-"))
  dirs.push(dir)
  const agent: Agent = {
    name: "opencode",
    local: join(dir, ".opencode", "opencode.json"),
    global: join(dir, ".config", "opencode", "opencode.json"),
    mcpKey: "mcp",
    format: "json",
    needsHooks: false,
    needsPlugin: true,
    needsInstructions: true,
    instructionFile: join(dir, "AGENTS.md")
  }
  return { dir, agent }
}

afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

describe("installJSONConfig", () => {
  it("preserves $schema and other MCP servers, and migrates an old-format toon-memory entry", () => {
    const { agent } = tmpAgent()
    const cfgPath = agent.local!
    mkdirSync(dirname(cfgPath), { recursive: true })
    writeFileSync(
      cfgPath,
      JSON.stringify({
        $schema: "https://opencode.ai/config.json",
        mcp: {
          "some-other": { type: "local", command: ["npx", "-y", "other-mcp"], enabled: true },
          "toon-memory": { command: "npx", args: ["-y", "toon-memory", "mcp"] }
        }
      })
    )

    installJSONConfig(agent, "local")

    const after = JSON.parse(readFileSync(cfgPath, "utf-8"))
    expect(after.$schema).toBe("https://opencode.ai/config.json")
    expect(after.mcp["some-other"]).toEqual({
      type: "local",
      command: ["npx", "-y", "other-mcp"],
      enabled: true
    })
    expect(after.mcp["toon-memory"]).toEqual({
      enabled: true,
      type: "local",
      command: ["npx", "-y", "toon-memory", "mcp"]
    })
  })

  it("does not overwrite an existing config that is not valid JSON", () => {
    const { agent } = tmpAgent()
    const cfgPath = agent.local!
    mkdirSync(dirname(cfgPath), { recursive: true })
    writeFileSync(cfgPath, "{ this is not json ")

    installJSONConfig(agent, "local")

    expect(readFileSync(cfgPath, "utf-8")).toBe("{ this is not json ")
  })
})
