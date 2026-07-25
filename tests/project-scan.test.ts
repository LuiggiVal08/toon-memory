import { describe, it, expect } from "vitest"
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { scanProjectStructure, readEnvExample, readManifest } from "../src/lib/project-scan"

function makeProject(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "toon-scan-"))
  for (const [name, content] of Object.entries(files)) {
    const fullPath = join(root, name)
    const dir = fullPath.split("/").slice(0, -1).join("/")
    mkdirSync(dir, { recursive: true })
    writeFileSync(fullPath, content)
  }
  return root
}

describe("scanProjectStructure", () => {
  it("lists top-level directories", () => {
    const root = makeProject({
      "src/index.ts": "export {}",
      "src/utils.ts": "export {}",
      "tests/test.ts": "import {}",
      "package.json": "{}",
    })
    const structure = scanProjectStructure(root)
    expect(structure.dirs).toContain("src")
    expect(structure.dirs).toContain("tests")
    rmSync(root, { recursive: true, force: true })
  })

  it("skips node_modules and .git", () => {
    const root = makeProject({
      "node_modules/pkg/index.js": "module.exports = {}",
      ".git/HEAD": "ref: refs/heads/main",
      "src/app.ts": "export {}",
    })
    const structure = scanProjectStructure(root)
    expect(structure.dirs).not.toContain("node_modules")
    expect(structure.dirs).not.toContain(".git")
    rmSync(root, { recursive: true, force: true })
  })

  it("counts source files", () => {
    const root = makeProject({
      "src/a.ts": "",
      "src/b.ts": "",
      "src/c.js": "",
    })
    const structure = scanProjectStructure(root)
    expect(structure.sourceFileCount).toBe(3)
    rmSync(root, { recursive: true, force: true })
  })

  it("tracks extension breakdown", () => {
    const root = makeProject({
      "src/a.ts": "",
      "src/b.ts": "",
      "src/c.js": "",
    })
    const structure = scanProjectStructure(root)
    expect(structure.extensions[".ts"]).toBe(2)
    expect(structure.extensions[".js"]).toBe(1)
    rmSync(root, { recursive: true, force: true })
  })

  it("lists root files", () => {
    const root = makeProject({
      "package.json": "{}",
      "tsconfig.json": "{}",
      "src/index.ts": "",
    })
    const structure = scanProjectStructure(root)
    expect(structure.rootFiles).toContain("package.json")
    expect(structure.rootFiles).toContain("tsconfig.json")
    rmSync(root, { recursive: true, force: true })
  })
})

describe("readEnvExample", () => {
  it("parses .env.example", () => {
    const root = makeProject({
      ".env.example": "DATABASE_URL=postgres://localhost/db # Main database\nAPI_KEY= # Required for auth\nPORT=3000\n",
    })
    const vars = readEnvExample(root)
    expect(vars).toHaveLength(3)
    expect(vars[0].name).toBe("DATABASE_URL")
    expect(vars[0].comment).toBe("Main database")
    expect(vars[1].name).toBe("API_KEY")
    expect(vars[2].name).toBe("PORT")
    expect(vars[2].default).toBe("3000")
    rmSync(root, { recursive: true, force: true })
  })

  it("returns empty when no env file exists", () => {
    const root = makeProject({ "README.md": "hello" })
    expect(readEnvExample(root)).toEqual([])
    rmSync(root, { recursive: true, force: true })
  })

  it("tries .env.template as fallback", () => {
    const root = makeProject({
      ".env.template": "SECRET=changeme\n",
    })
    const vars = readEnvExample(root)
    expect(vars).toHaveLength(1)
    expect(vars[0].name).toBe("SECRET")
    rmSync(root, { recursive: true, force: true })
  })
})

describe("readManifest", () => {
  it("reads package.json", () => {
    const root = makeProject({
      "package.json": JSON.stringify({
        name: "my-app",
        version: "1.0.0",
        description: "A test app",
        scripts: { dev: "vite" },
        dependencies: { react: "^18" },
        devDependencies: { vitest: "^1" },
      }),
    })
    const manifest = readManifest(root)
    expect(manifest).not.toBeNull()
    expect(manifest!.name).toBe("my-app")
    expect(manifest!.version).toBe("1.0.0")
    expect(manifest!.language).toBe("javascript")
    expect(manifest!.deps).toContain("react")
    expect(manifest!.devDeps).toContain("vitest")
    rmSync(root, { recursive: true, force: true })
  })

  it("reads Cargo.toml", () => {
    const root = makeProject({
      "Cargo.toml": '[package]\nname = "my-crate"\nversion = "0.1.0"\n\n[dependencies]\nserde = "1"\ntokio = { version = "1" }\n',
    })
    const manifest = readManifest(root)
    expect(manifest).not.toBeNull()
    expect(manifest!.name).toBe("my-crate")
    expect(manifest!.language).toBe("rust")
    expect(manifest!.deps).toContain("serde")
    rmSync(root, { recursive: true, force: true })
  })

  it("returns null for no manifest", () => {
    const root = makeProject({ "README.md": "hello" })
    expect(readManifest(root)).toBeNull()
    rmSync(root, { recursive: true, force: true })
  })
})
