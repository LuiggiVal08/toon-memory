import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from "fs"
import { dirname, join } from "path"
import { gzipSync } from "zlib"
import type { WatchOptions } from "./types"
import { MEMORY_DIR, projectRoot } from "./constants"

/** Parse watch CLI arguments into WatchOptions */
export function parseWatchOptions(args: string[]): WatchOptions {
  const opts: WatchOptions = {
    interval: 5,
    maxBackups: 10,
    compress: false,
    logFile: false,
    logPath: ""
  }

  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--compress" || arg === "-c") {
      opts.compress = true
    } else if (arg === "--log" || arg === "-l") {
      opts.logFile = true
      opts.logPath = args[++i] || join(MEMORY_DIR, "watch.log")
    } else if (arg === "--max-backups" || arg === "-m") {
      opts.maxBackups = parseInt(args[++i]) || 10
    } else if (!arg.startsWith("-")) {
      opts.interval = parseInt(arg) || 5
    }
  }

  return opts
}

/** Write a line to the watch log file */
export function writeWatchLog(logPath: string, message: string): void {
  if (!logPath) return
  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] ${message}\n`
  writeFileSync(logPath, logLine, { flag: "a" })
}

/** Get list of backup files sorted by creation time (oldest first) */
export function getBackupFiles(backupDir: string): string[] {
  if (!existsSync(backupDir)) return []

  return readdirSync(backupDir)
    .filter(f => f.startsWith("backup-") && (f.endsWith(".toon") || f.endsWith(".gz")))
    .map(f => join(backupDir, f))
    .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs)
}

/** Remove oldest backups if we exceed maxBackups */
export function pruneBackups(backupDir: string, maxBackups: number): number {
  if (maxBackups <= 0) return 0

  const files = getBackupFiles(backupDir)
  const excess = files.length - maxBackups

  if (excess <= 0) return 0

  for (let i = 0; i < excess; i++) {
    unlinkSync(files[i])
  }

  return excess
}

/** Compress content with gzip */
export function compressData(data: string): Buffer {
  return gzipSync(Buffer.from(data, "utf-8"))
}

/** Simple hash for change detection (not cryptographic) */
function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

/**
 * Watch mode - backup memory every N minutes
 */
export function watch(args: string[]): void {
  console.log("\n🧠 toon-memory watch\n")

  const memoryFile = join(MEMORY_DIR, "data.toon")
  const backupDir = join(MEMORY_DIR, "backups")

  if (!existsSync(memoryFile)) {
    console.log("Memory not initialized. Run 'npx toon-memory init' first.\n")
    return
  }

  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true })

  const opts = parseWatchOptions(args)

  if (opts.logFile) {
    const logDir = dirname(opts.logPath)
    if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })
  }

  console.log(`Watching memory file every ${opts.interval} minutes...`)
  console.log(`Max backups: ${opts.maxBackups === 0 ? "unlimited" : opts.maxBackups}`)
  console.log(`Compression: ${opts.compress ? "enabled" : "disabled"}`)
  console.log(`Logging: ${opts.logFile ? `enabled (${opts.logPath})` : "disabled"}`)
  console.log(`Press Ctrl+C to stop\n`)

  let lastContent = readFileSync(memoryFile, "utf-8")
  let lastHash = hashContent(lastContent)
  let backupCount = 0

  if (opts.logFile) writeWatchLog(opts.logPath, "Watch started")

  const backup = () => {
    try {
      const currentContent = readFileSync(memoryFile, "utf-8")
      const currentHash = hashContent(currentContent)

      if (currentHash !== lastHash) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        const ext = opts.compress ? ".toon.gz" : ".toon"
        const backupFile = join(backupDir, `backup-${timestamp}${ext}`)

        if (opts.compress) {
          writeFileSync(backupFile, compressData(currentContent))
        } else {
          writeFileSync(backupFile, currentContent)
        }

        backupCount++
        console.log(`📦 Backup #${backupCount} created: ${timestamp}`)
        if (opts.logFile) writeWatchLog(opts.logPath, `Backup #${backupCount}: ${timestamp}`)

        lastContent = currentContent
        lastHash = currentHash

        const pruned = pruneBackups(backupDir, opts.maxBackups)
        if (pruned > 0) {
          console.log(`🗑️  Pruned ${pruned} old backup(s)`)
          if (opts.logFile) writeWatchLog(opts.logPath, `Pruned ${pruned} old backup(s)`)
        }
      }
    } catch (err) {
      const msg = `Error creating backup: ${(err as Error).message}`
      console.error(`❌ ${msg}`)
      if (opts.logFile) writeWatchLog(opts.logPath, msg)
    }
  }

  backup()
  const interval = setInterval(backup, opts.interval * 60 * 1000)

  process.on("SIGINT", () => {
    clearInterval(interval)
    console.log(`\n✅ Watch stopped. ${backupCount} backups created.\n`)
    if (opts.logFile) writeWatchLog(opts.logPath, `Watch stopped. ${backupCount} backups created.`)
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    clearInterval(interval)
    process.exit(0)
  })
}
