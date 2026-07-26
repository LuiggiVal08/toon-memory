import { captureToggle } from "./capture-toggle"
import { init, uninstall, status, upgrade, stats, exportMemory, importMemory, dumpMemory, interactiveInstall } from "./commands"
import { watch } from "./watch"

const args = process.argv.slice(2)

if (args[0] === "capture") {
  captureToggle(args[1] === "on")
  process.exit(0)
}

if (args[0] === "uninstall") {
  uninstall()
  process.exit(0)
}

if (args[0] === "init") {
  const rest = args.slice(1)
  const agentNames: string[] = []
  let scope: string | undefined
  let i = 0
  while (i < rest.length) {
    if (rest[i] === "--agent" && rest[i + 1]) {
      agentNames.push(rest[i + 1].toLowerCase())
      i += 2
    } else if (rest[i] === "--scope" && rest[i + 1]) {
      scope = rest[i + 1]
      i += 2
    } else if (rest[i] !== "--agent" && rest[i] !== "--scope") {
      scope = rest[i]
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

// Interactive installer when no command is given; otherwise report unknown command.
if (args.length === 0) {
  await interactiveInstall()
  process.exit(0)
}

console.log(`Unknown command: '${args[0]}'\n`)
printUsage()
process.exit(1)

/** Minimal usage string for unknown commands. */
function printUsage(): void {
  console.log(`Usage: toon-memory <command> [options]
Commands: init, status, stats, export, import, watch, uninstall, capture, upgrade, mcp
Init: toon-memory init [--agent <name> --agent <name>...] [--scope local|global]
  Without --agent: interactive agent and scope selector.
  With --agent: non-interactive installation (default: scope local).
Options: -v/--version, -h/--help
No arguments starts the interactive installer.`)
}
