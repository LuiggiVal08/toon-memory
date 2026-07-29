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

export function viewer(portArg?: string): void {
  const PORT = parseInt(portArg || process.env.PORT || "3000", 10)
  let currentHtml = generateHtml(buildViewerData())

  const server = createServer((_req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    res.end(currentHtml)
  })

  server.listen(PORT, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${PORT}`
    const data = buildViewerData()
    console.log(`\ntoon-memory viewer`)
    console.log(`   Entries: ${data.totalEntries} | Edges: ${data.edges.length}`)
    console.log(`   Serving at: ${url}`)
    console.log(`   Press 'r' in terminal to reload | Ctrl+C to stop\n`)
    openBrowser(url)
  })

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

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} already in use. Try: PORT=3001 toon-memory viewer`)
    } else {
      console.error(`Server error: ${err.message}`)
    }
    process.exit(1)
  })
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
