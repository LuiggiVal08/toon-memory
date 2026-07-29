import { chromium } from "playwright"
import { spawn } from "child_process"
import { writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "..", "docs", "public", "viewer")
const PORT = 3099
const URL = `http://127.0.0.1:${PORT}`
const FRAMES_DIR = join(OUT, "frames")

mkdirSync(FRAMES_DIR, { recursive: true })

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function startServer() {
  const proc = spawn("node", [join(__dirname, "..", "bin", "toon-memory.js"), "viewer", "--port", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  })

  // Wait for server to be ready
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(URL)
      if (res.ok) return proc
    } catch {}
    await sleep(200)
  }
  throw new Error("Server did not start")
}

async function captureFrames(page, prefix, count, actions) {
  const frames = []
  for (let i = 0; i < count; i++) {
    if (actions[i]) await actions[i](page)
    await sleep(300)
    const path = join(FRAMES_DIR, `${prefix}-${String(i).padStart(3, "0")}.png`)
    await page.screenshot({ path, fullPage: false })
    frames.push(path)
  }
  return frames
}

async function framesToGif(framePaths, outputPath) {
  const listFile = join(FRAMES_DIR, "frames.txt")
  // Each frame captured ~300ms apart; play at 400ms for a smooth, natural pace
  const lines = framePaths.map((p) => `file '${p}'\nduration 0.4`).join("\n")
  writeFileSync(listFile, lines, "utf-8")

  const { execSync } = await import("child_process")
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${listFile}" -vf "split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${outputPath}"`,
    { stdio: "pipe" }
  )
}

async function main() {
  console.log("Starting viewer server...")
  const server = await startServer()
  console.log("Server ready on", URL)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
  const page = await context.newPage()

  try {
    // Navigate
    await page.goto(URL, { waitUntil: "networkidle" })
    await sleep(4000) // let D3 simulation settle

    // --- 1. Full graph screenshot ---
    console.log("Capturing full graph...")
    await page.screenshot({ path: join(OUT, "graph-full.png"), fullPage: false })

    // --- 2. Search with highlights ---
    console.log("Capturing search highlights...")
    await page.evaluate(() => {
      const input = document.querySelector('#search')
      if (input) { input.value = 'viewer'; input.dispatchEvent(new Event('input', { bubbles: true })) }
    })
    await sleep(800)
    await page.screenshot({ path: join(OUT, "graph-search.png"), fullPage: false })

    // --- 3. Clear search, then path finder ---
    await page.evaluate(() => {
      const input = document.querySelector('#search')
      if (input) { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })) }
    })
    await sleep(500)

    const circles = page.locator(".node-circle")
    const circleCount = await circles.count()

    // Click path toggle
    await page.locator("#pathToggle").click({ force: true })
    await sleep(300)

    // Click node circles to trigger path (force to skip stability check while D3 runs)
    if (circleCount >= 2) {
      console.log("Capturing path finder...")
      await page.evaluate(() => {
        const circles = document.querySelectorAll('.node-circle')
        if (circles.length > 0) circles[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
      })
      await sleep(400)
      await page.evaluate(() => {
        const circles = document.querySelectorAll('.node-circle')
        const idx = Math.min(2, circles.length - 1)
        if (circles.length > idx) circles[idx].dispatchEvent(new MouseEvent('click', { bubbles: true }))
      })
      await sleep(800)
      await page.screenshot({ path: join(OUT, "graph-path.png"), fullPage: false })
    }

    // --- 4. Detail panel (double-click) ---
    await page.evaluate(() => {
      const btn = document.querySelector('#pathToggle')
      if (btn) btn.click()
    })
    await sleep(200)
    console.log("Capturing detail panel...")
    if (circleCount > 0) {
      await page.evaluate(() => {
        const circles = document.querySelectorAll('.node-circle')
        if (circles.length > 0) {
          circles[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
        }
      })
      await sleep(600)
      await page.screenshot({ path: join(OUT, "graph-detail.png"), fullPage: false })
    }

    // --- 5. Animated GIF (smooth transitions) ---
    console.log("Capturing GIF frames...")
    // Switch back to graph tab
    await page.evaluate(() => {
      const tab = document.querySelector('[data-tab="graph"]')
      if (tab) tab.click()
    })
    await sleep(800)
    // Deselect by clicking SVG background
    await page.evaluate(() => {
      const svg = document.querySelector('#graphContainer svg[width="100%"]')
      if (svg) svg.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    await sleep(500)

    const gifActions = [
      // 0-1: initial graph
      null, null,
      // 2-7: type search character by character (with brief pause between)
      async (p) => {
        await p.evaluate(() => {
          const input = document.querySelector('#search')
          if (input) { input.value = 'v'; input.dispatchEvent(new Event('input', { bubbles: true })) }
        })
      },
      async (p) => {
        await p.evaluate(() => {
          const input = document.querySelector('#search')
          if (input) { input.value = 'vi'; input.dispatchEvent(new Event('input', { bubbles: true })) }
        })
      },
      async (p) => {
        await p.evaluate(() => {
          const input = document.querySelector('#search')
          if (input) { input.value = 'vie'; input.dispatchEvent(new Event('input', { bubbles: true })) }
        })
      },
      async (p) => {
        await p.evaluate(() => {
          const input = document.querySelector('#search')
          if (input) { input.value = 'view'; input.dispatchEvent(new Event('input', { bubbles: true })) }
        })
      },
      async (p) => {
        await p.evaluate(() => {
          const input = document.querySelector('#search')
          if (input) { input.value = 'viewe'; input.dispatchEvent(new Event('input', { bubbles: true })) }
        })
      },
      async (p) => {
        await p.evaluate(() => {
          const input = document.querySelector('#search')
          if (input) { input.value = 'viewer'; input.dispatchEvent(new Event('input', { bubbles: true })) }
        })
      },
      // 8-9: let highlights pulse
      null, null,
      // 10: clear search
      async (p) => {
        await p.evaluate(() => {
          const input = document.querySelector('#search')
          if (input) { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })) }
        })
      },
      // 11-12: click node, show selection
      async (p) => {
        await p.evaluate(() => {
          const circle = document.querySelector('.node-circle')
          if (circle) circle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        })
      }, null,
      // 13-14: double-click for detail panel
      async (p) => {
        await p.evaluate(() => {
          const circle = document.querySelector('.node-circle')
          if (circle) circle.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))
        })
      }, null,
    ]

    const gifFrames = await captureFrames(page, "gif", gifActions.length, gifActions)
    await framesToGif(gifFrames, join(OUT, "viewer-demo.gif"))
    console.log("GIF created")

    console.log("\nAll captures saved to", OUT)
  } finally {
    await browser.close()
    server.kill("SIGTERM")

    // Cleanup frames dir
    const { rmSync } = await import("fs")
    try {
      rmSync(FRAMES_DIR, { recursive: true, force: true })
    } catch {}
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
