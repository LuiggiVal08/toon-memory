import { describe, it, expect } from "vitest"
import { mkdtempSync, writeFileSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { extractProjectDeps, mergeVocab } from "../src/lib/vocab"

function makeProject(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "toon-vocab-"))
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(root, name), content)
  }
  return root
}

describe("extractProjectDeps", () => {
  it("reads npm dependencies from package.json (scoped names stripped)", () => {
    const root = makeProject({
      "package.json": JSON.stringify({
        dependencies: { react: "^18", "@scope/pkg": "^1" },
        devDependencies: { vitest: "^1" },
      }),
    })
    const vocab = extractProjectDeps(root)
    expect(vocab.react).toEqual(["react"])
    expect(vocab.pkg).toEqual(["@scope/pkg", "pkg"])
    expect(vocab.vitest).toEqual(["vitest"])
    rmSync(root, { recursive: true, force: true })
  })

  it("reads Cargo dependencies from Cargo.toml", () => {
    const root = makeProject({
      "Cargo.toml": `[package]\nname = "x"\n\n[dependencies]\nserde = "1"\ntokio = { version = "1" }\n`,
    })
    const vocab = extractProjectDeps(root)
    expect(vocab.serde).toEqual(["serde"])
    expect(vocab.tokio).toEqual(["tokio"])
    rmSync(root, { recursive: true, force: true })
  })

  it("reads python deps from requirements.txt", () => {
    const root = makeProject({
      "requirements.txt": "fastapi==0.110\n# comment\npydantic\n",
    })
    const vocab = extractProjectDeps(root)
    expect(vocab.fastapi).toEqual(["fastapi"])
    expect(vocab.pydantic).toEqual(["pydantic"])
    rmSync(root, { recursive: true, force: true })
  })

  it("returns an empty vocab when no manifest is present", () => {
    const root = makeProject({ "README.md": "nothing" })
    expect(extractProjectDeps(root)).toEqual({})
    rmSync(root, { recursive: true, force: true })
  })
})

describe("mergeVocab", () => {
  it("merges and lets the second argument win on collisions", () => {
    const a = { redis: ["redis"], db: ["postgres"] }
    const b = { db: ["mysql"], cache: ["memcached"] }
    expect(mergeVocab(a, b)).toEqual({
      redis: ["redis"],
      db: ["mysql"],
      cache: ["memcached"],
    })
  })
})
