import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { MEMORY_DIR, CAPTURE_CONFIG } from "./constants"

/**
 * Enable or disable activity capture (the opt-in hook log).
 */
export function captureToggle(enable: boolean): void {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true })

  let config: Record<string, any> = {}
  if (existsSync(CAPTURE_CONFIG)) {
    try {
      config = JSON.parse(readFileSync(CAPTURE_CONFIG, "utf-8"))
    } catch {
      config = {}
    }
  }

  config.capture = enable
  writeFileSync(CAPTURE_CONFIG, JSON.stringify(config, null, 2))

  if (enable) {
    console.log("\n🔴 Activity capture ENABLED.")
    console.log("Hooks will write observations to .toon-memory/memory/observations.toon.")
    console.log("Review with `memory_captured` and promote with `memory_remember`.\n")
  } else {
    console.log("\n⚪ Activity capture DISABLED.\n")
  }
}
