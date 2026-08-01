import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { execSync } from "child_process"
import { buildViewerData } from "./data"
import { generateHtml } from "./html"
import { createServer, type IncomingMessage, type ServerResponse } from "http"

export { buildViewerData } from "./data"

function openBrowser(url: string): void {
  const platform = process.platform
  try {
    if (platform === "darwin") execSync(`open "${url}"`)
    else if (platform === "win32") execSync(`start "" "${url}"`)
    else execSync(`xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}"`, { stdio: "ignore" })
  } catch {
    console.log(`Open in browser: ${url}`)
  }
}

function resolvePort(portArg?: string): number {
  const raw = portArg ?? process.env.PORT
  if (raw === undefined || raw === "") return 3000
  const port = Number(raw)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`Invalid port: '${raw}'. Expected an integer between 1 and 65535.`)
    process.exit(1)
  }
  return port
}

const MAX_PORT_ATTEMPTS = 20

export function viewer(portArg?: string): void {
  const startPort = resolvePort(portArg)
  let port = startPort
  let currentHtml = generateHtml(buildViewerData())

  const server = createServer((_req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    res.end(currentHtml)
  })

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && port < startPort + MAX_PORT_ATTEMPTS) {
      port += 1
      console.log(`Port ${port - 1} in use, trying ${port}...`)
      server.listen(port, "127.0.0.1", onListen)
    } else if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} already in use. Try: toon-memory viewer --port ${port + 1} (or PORT=${port + 1} toon-memory viewer)`)
      process.exit(1)
    } else {
      console.error(`Server error: ${err.message}`)
      process.exit(1)
    }
  })

  function onListen(): void {
    const url = `http://127.0.0.1:${port}`
    const data = buildViewerData()
    console.log(`\ntoon-memory viewer`)
    console.log(`   Entries: ${data.totalEntries} | Edges: ${data.edges.length}`)
    console.log(`   Serving at: ${url}`)
    console.log(`   Press 'r' in terminal to reload | Ctrl+C to stop\n`)
    openBrowser(url)
  }

  server.listen(startPort, "127.0.0.1", onListen)

  if (process.stdin.isTTY) {
    process.stdin.setRawMode?.(true)
    process.stdin.resume()
    process.stdin.on("data", (buf) => {
      const key = buf.toString()
      if (key === "r" || key === "R") {
        const data = buildViewerData()
        currentHtml = generateHtml(data)
        console.log(`   Reloaded: ${data.totalEntries} entries, ${data.edges.length} edges`)
      }
      if (key === "\u0003") process.exit(0)
    })
  }
}

export function viewerExport(): void {
  const viewerData = buildViewerData()
  const html = generateHtml(viewerData)

  const projectRoot = process.cwd()
  const outDir = join(projectRoot, ".toon-memory", "viewer")
  mkdirSync(outDir, { recursive: true })
  const outFile = join(outDir, "index.html")
  writeFileSync(outFile, html, "utf-8")
  console.log(`Viewer saved: ${outFile}`)
  console.log(`Entries: ${viewerData.totalEntries} | Edges: ${viewerData.edges.length}`)
  openBrowser(outFile)
}
