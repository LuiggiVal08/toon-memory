import { captureToggle } from "./capture-toggle"
import { init, uninstall, status, upgrade, stats, exportMemory, importMemory, dumpMemory, interactiveInstall } from "./commands"
import { watch } from "./watch"
import { viewer, viewerExport } from "../viewer"
import { printBrief, printDoctor, recordSignal, runPromotion } from "./ambient"
import { runSleep } from "./sleep"
import { runDense } from "./dense"

const args = process.argv.slice(2)

if (args[0] === "brief") {
  printBrief(args.slice(1).join(" ") || process.env.TOON_MEMORY_TASK || "")
  process.exit(0)
}

if (args[0] === "doctor") {
  printDoctor()
  process.exit(0)
}

if (args[0] === "signal") {
  recordSignal(args.slice(1))
  process.exit(0)
}

if (args[0] === "promote") {
  runPromotion(args.slice(1))
  process.exit(0)
}

if (args[0] === "sleep") {
  const result = runSleep()
  console.log(result.ran
    ? `Sleep complete: ${result.promoted} promoted, ${result.edges} edges, ${result.pruned} pruned, ${result.duplicates} duplicates.`
    : "Sleep is disabled (config.sleep.enabled or TOON_MEMORY_SLEEP=1).")
  process.exit(0)
}

if (args[0] === "dense") {
  await runDense(args.slice(1))
  process.exit(0)
}

if (args[0] === "capture") {
  captureToggle(args[1] === "on")
  process.exit(0)
}

if (args[0] === "uninstall") {
  uninstall()
  process.exit(0)
}

if (args[0] === "init") {
  if (args.includes("-h") || args.includes("--help")) {
    printUsage()
    process.exit(0)
  }
  const rest = args.slice(1)
  const agentNames: string[] = []
  const scopes = new Set(["local", "global"])
  const addAgents = (value: string) =>
    value.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean).forEach((a) => agentNames.push(a))
  let scope: string | undefined
  let i = 0
  while (i < rest.length) {
    if (rest[i] === "--agent" && rest[i + 1]) {
      addAgents(rest[i + 1])
      i += 2
    } else if (rest[i] === "--scope" && rest[i + 1]) {
      scope = rest[i + 1]
      i += 2
    } else if (rest[i] !== "--agent" && rest[i] !== "--scope") {
      const token = rest[i].toLowerCase()
      if (scopes.has(token) && !scope) scope = token
      else addAgents(token)
      i++
    } else {
      i++
    }
  }
  await init(scope, agentNames.length > 0 ? agentNames : undefined)
  process.exit(0)
}

if (args[0] === "status") {
  status()
  process.exit(0)
}

if (args[0] === "upgrade") {
  upgrade()
  process.exit(0)
}

if (args[0] === "stats") {
  stats()
  process.exit(0)
}

if (args[0] === "dump") {
  dumpMemory()
  process.exit(0)
}

if (args[0] === "export") {
  exportMemory()
  process.exit(0)
}

if (args[0] === "import") {
  importMemory()
  process.exit(0)
}

if (args[0] === "watch") {
  watch(args)
  process.exit(0)
}

if (args[0] === "viewer") {
  if (args.includes("-h") || args.includes("--help")) {
    printViewerUsage()
    process.exit(0)
  }
  const portIdx = args.indexOf("--port")
  if (portIdx !== -1 && !args[portIdx + 1]) {
    console.error("Missing value for --port\n")
    printViewerUsage()
    process.exit(1)
  }
  const port = portIdx !== -1 ? args[portIdx + 1] : undefined
  if (args.includes("--export")) {
    if (port) console.log("Note: --port is ignored with --export")
    viewerExport()
  } else {
    viewer(port)
  }
} else if (args.length === 0) {
  await interactiveInstall()
  process.exit(0)
} else {
  console.log(`Unknown command: '${args[0]}'\n`)
  printUsage()
  process.exit(1)
}

/** Viewer-specific usage. */
function printViewerUsage(): void {
  console.log(`Usage: toon-memory viewer [options]
Options:
  --export               Save a static HTML viewer to .toon-memory/viewer/index.html
  --port <n>             Port to serve on (default: 3000, or $PORT)
  -h, --help             Show this help

Press 'r' in the terminal while serving to reload the graph.`)
}

/** Minimal usage string for unknown commands. */
function printUsage(): void {
  console.log(`Usage: toon-memory <command> [options]
Commands: init, status, stats, export, import, watch, viewer, uninstall, capture, upgrade, brief, doctor, signal, promote, sleep, dense, mcp
  brief [task]                   — Print the compact handoff brief injected at session start
  doctor                         — Check memory path, signals and injection channel
  signal --type <t> --summary <s> [--file <f>] — Append one deterministic signal
  promote [--threshold <0-1>]    — Promote high-confidence signals into memory
  sleep                          — Deterministic consolidation (opt-in: config.sleep.enabled)
  dense <status|enable|disable|build|install> — Optional local embeddings with BM25 fallback
  viewer [--export] [--port <n>]  — Start an HTTP server with the graph viewer (press 'r' to reload). --export saves static HTML.
Init: toon-memory init [local|global] [agent...] | --agent <name>[,<name>...] [--scope local|global]
  Without --agent: interactive agent and scope selector.
  With --agent: non-interactive installation (default: scope local).
Options: -v/--version, -h/--help
No arguments starts the interactive installer.`)
}
