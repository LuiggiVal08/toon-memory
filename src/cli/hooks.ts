import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "fs"
import { dirname, join } from "path"
import type { Agent } from "./types"
import { projectRoot, CAPTURE_JS, SESSION_START_JS, CAPTURE_CONFIG, ANTIGRAVITY_HOOK_NAME } from "./constants"

/**
 * Read an existing JSON config file.
 * Returns {} when the file is missing, or null when it exists but cannot be
 * parsed — callers MUST skip (never overwrite) on null to avoid wiping the
 * user's other settings.
 */
function readJSON(file: string): Record<string, any> | null {
  if (!existsSync(file)) return {}
  try {
    return JSON.parse(readFileSync(file, "utf-8"))
  } catch {
    return null
  }
}

/** Hook script content for SessionStart reminder */
export function sessionStartHookContent(agentName: string): string {
  return `#!/bin/bash
# toon-memory session-start hook for ${agentName}
# Registers this session so memory_sessions and context_* tools work.
node "${SESSION_START_JS}" ${agentName}
exit 0
`
}

/**
 * Hook script content for activity capture. It is a no-op unless capture is
 * explicitly enabled (env TOON_MEMORY_CAPTURE or config.json `"capture": true`).
 */
export function captureHookContent(agentName: string): string {
  return `#!/bin/bash
# toon-memory capture hook for ${agentName}
# Logs tool calls to observations.toon (opt-in via TOON_MEMORY_CAPTURE env or config).
CFG="${CAPTURE_CONFIG}"
if [ -z "$TOON_MEMORY_CAPTURE" ]; then
  if [ ! -f "$CFG" ]; then exit 0; fi
  grep -q '"capture"[[:space:]]*:[[:space:]]*true' "$CFG" 2>/dev/null || exit 0
fi
node "${CAPTURE_JS}" ${agentName}
exit 0
`
}

/**
 * Install SessionStart hook for agents that support it.
 * Creates a shell script and registers it in the agent's config.
 */
export function installHooks(agent: Agent): void {
  if (!agent.needsHooks) return

  const hookDir = join(projectRoot, ".toon-memory", "hooks")
  if (!existsSync(hookDir)) mkdirSync(hookDir, { recursive: true })

  const hookPath = join(hookDir, `session-start-${agent.name}.sh`)
  writeFileSync(hookPath, sessionStartHookContent(agent.name))
  chmodSync(hookPath, 0o755)
  console.log(`  Hook script created at ${hookPath}`)

  if (agent.format === "toml" && agent.local) {
    registerHookTOML(agent, hookPath)
  } else if (agent.format === "json" || agent.format === "jsonc") {
    registerHookJSON(agent, hookPath)
  }

  if (agent.captureJson && agent.format === "json") {
    const capPath = join(hookDir, `capture-${agent.name}.sh`)
    writeFileSync(capPath, captureHookContent(agent.name))
    chmodSync(capPath, 0o755)
    console.log(`  Capture hook created at ${capPath}`)
    registerCaptureHookJSON(agent, capPath)
  }
  if (agent.captureToml && agent.format === "toml" && agent.local) {
    const capPath = join(hookDir, `capture-${agent.name}.sh`)
    writeFileSync(capPath, captureHookContent(agent.name))
    chmodSync(capPath, 0o755)
    console.log(`  Capture hook created at ${capPath}`)
    registerCaptureHookTOML(agent, capPath)
  }
}

/** Register activity-capture hooks (PostToolUse/Stop) in a JSON agent config. */
export function registerCaptureHookJSON(agent: Agent, scriptPath: string): void {
  const configPath = agent.hookPath || agent.local || agent.global
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  const config = readJSON(configPath)
  if (config === null) {
    console.log(`  ⚠️ Skipping ${configPath}: existing file is not valid JSON — fix it manually, then re-run.`)
    return
  }

  if (!config.hooks) config.hooks = {}
  for (const event of agent.captureJson || []) {
    if (!config.hooks[event]) config.hooks[event] = []
    if (!config.hooks[event].some((h: any) => h.command === scriptPath)) {
      config.hooks[event].push({ command: scriptPath })
    }
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`  Capture hooks registered in ${configPath}`)
}

/** Register activity-capture hooks (PostToolUse/Stop) in a Codex TOML config. */
export function registerCaptureHookTOML(agent: Agent, scriptPath: string): void {
  const configPath = agent.local
  if (!configPath || !existsSync(configPath)) return

  let content = readFileSync(configPath, "utf-8")
  for (const event of agent.captureToml || []) {
    if (content.includes(`event = "${event}"`)) continue
    content += `\n[[hooks]]\nevent = "${event}"\ncommand = "${scriptPath}"\n`
  }

  writeFileSync(configPath, content)
  console.log(`  Capture hooks registered in ${configPath}`)
}

/** Register SessionStart hook in TOML config (Codex CLI). */
export function registerHookTOML(agent: Agent, hookPath: string): void {
  const configPath = agent.local
  if (!configPath || !existsSync(configPath)) return

  let content = readFileSync(configPath, "utf-8")
  if (content.includes('event = "SessionStart"')) {
    console.log(`  Hook already registered in ${configPath}`)
    return
  }

  content += `\n[[hooks]]\nevent = "SessionStart"\ncommand = "${hookPath}"\n`
  writeFileSync(configPath, content)
  console.log(`  Hook registered in ${configPath}`)
}

/** Register SessionStart hook in JSON config (Claude Code / Gemini CLI). */
export function registerHookJSON(agent: Agent, hookPath: string): void {
  const configPath = agent.hookPath || (agent.format === "jsonc" ? agent.global : (agent.local || agent.global))
  if (!configPath) return

  const configDir = dirname(configPath)
  if (!existsSync(configDir)) mkdirSync(configDir, { recursive: true })

  let config: Record<string, any> | null = {}
  if (existsSync(configPath)) {
    try {
      if (agent.format === "jsonc") {
        const raw = readFileSync(configPath, "utf-8")
        const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
        config = JSON.parse(stripped)
      } else {
        config = JSON.parse(readFileSync(configPath, "utf-8"))
      }
    } catch {
      config = null
    }
  }

  if (config === null) {
    console.log(`  ⚠️ Skipping ${configPath}: existing file is not valid JSON — fix it manually, then re-run.`)
    return
  }

  if (agent.name === "claude" || agent.name === "gemini") {
    if (!config.hooks) config.hooks = {}
    if (!config.hooks.SessionStart) config.hooks.SessionStart = []
    if (!config.hooks.SessionStart.some((h: any) => h.command === hookPath)) {
      config.hooks.SessionStart.push({ command: hookPath })
      writeFileSync(configPath, JSON.stringify(config, null, 2))
      console.log(`  Hook registered in ${configPath}`)
    }
    return
  }
}

/**
 * Install Antigravity hooks. Antigravity keeps hooks in a separate `hooks.json`
 * (under .gemini/config/). The official schema maps arbitrary hook NAMES to
 * event configs; each event wraps handlers in `hooks: [{ type, command }]`.
 */
export function registerAntigravityHooks(agent: Agent): void {
  const hookDir = join(projectRoot, ".toon-memory", "hooks")
  if (!existsSync(hookDir)) mkdirSync(hookDir, { recursive: true })

  const sessionPath = join(hookDir, "session-start-antigravity.sh")
  writeFileSync(sessionPath, sessionStartHookContent("antigravity"))
  chmodSync(sessionPath, 0o755)
  console.log(`  Hook script created at ${sessionPath}`)

  const capPath = join(hookDir, "capture-antigravity.sh")
  writeFileSync(capPath, captureHookContent("antigravity"))
  chmodSync(capPath, 0o755)
  console.log(`  Capture hook created at ${capPath}`)

  const base = agent.local ? dirname(agent.local) : projectRoot
  const hooksFile = join(base, "hooks.json")
  mkdirSync(base, { recursive: true })

  let cfg: Record<string, any> | null = {}
  if (existsSync(hooksFile)) {
    try {
      cfg = JSON.parse(readFileSync(hooksFile, "utf-8"))
    } catch {
      cfg = null
    }
  }

  if (cfg === null) {
    console.log(`  ⚠️ Skipping ${hooksFile}: existing file is not valid JSON — fix it manually, then re-run.`)
    return
  }

  cfg[ANTIGRAVITY_HOOK_NAME] = {
    PreInvocation: [{ type: "command", command: sessionPath }],
    PostToolUse: [{ matcher: "*", hooks: [{ type: "command", command: capPath }] }],
    Stop: [{ type: "command", command: capPath }],
  }

  writeFileSync(hooksFile, JSON.stringify(cfg, null, 2))
  console.log(`  Antigravity hooks registered in ${hooksFile}`)
}
