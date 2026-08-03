import { describe, it, expect } from "vitest"
import { fileImportURL } from "../src/cli/entry"

/**
 * Regression guard for ERR_UNSUPPORTED_ESM_URL_SCHEME on Windows:
 * `import("C:\\...")` is parsed as a URL with scheme "c:" and crashes.
 * fileImportURL must always yield a file:// URL so dynamic imports of
 * absolute paths work on every platform (including the Linux CI runner).
 */
describe("fileImportURL (Windows/ESM path compatibility)", () => {
  it("turns a Windows-style absolute path into a file:// URL", () => {
    const href = fileImportURL("C:\\Users\\E.N.D\\toon-memory\\bin", "..", "mcp", "server.js")
    expect(new URL(href).protocol).toBe("file:")
    expect(href.startsWith("file://")).toBe(true)
  })

  it("never yields a drive-letter scheme", () => {
    const href = fileImportURL("C:\\Development\\Fliiper\\agenda-native", "dist", "cli", "setup.js")
    expect(href.startsWith("file://")).toBe(true)
    expect(href.startsWith("c:")).toBe(false)
  })

  it("turns a POSIX absolute path into a file:// URL", () => {
    const href = fileImportURL("/home/user/toon-memory/bin", "..", "mcp", "server.js")
    expect(href).toBe("file:///home/user/toon-memory/mcp/server.js")
  })
})
