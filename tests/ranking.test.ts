import { describe, it, expect } from "vitest"
import { normalize, tokenize } from "../src/lib/utils"
import { parseRelativeDate } from "../src/mcp/entries"
import { entryQuality, parseEntries, graphRecallDetailed } from "../src/lib/graph"

const HEADER = "version: 1\nentries[2|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|pinned|path_scope|origin|status|supersededOn|importance|evidence}:"

describe("accent-aware tokenization", () => {
  it("normalizes diacritics so queries match across languages", () => {
    expect(normalize("Protección de Datos")).toBe("proteccion de datos")
    expect(tokenize("Protección-de_datos")).toContain("proteccion")
  })

  it("drops stopwords but keeps negations, which are meaningful directives", () => {
    expect(tokenize("la protección de los datos")).toEqual(["proteccion", "datos"])
    expect(tokenize("never edit generated files")).toContain("never")
  })
})

describe("natural-language relative dates", () => {
  it("keeps compact formats", () => {
    expect(parseRelativeDate("7d")).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(parseRelativeDate("24h")).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(parseRelativeDate("2026-07-10")).toBe("2026-07-10")
  })

  it("understands Spanish and English phrases", () => {
    const today = new Date().toISOString().split("T")[0]
    expect(parseRelativeDate("hoy")).toBe(today)
    expect(parseRelativeDate("ayer")).not.toBe(today)
    expect(parseRelativeDate("la semana pasada")).not.toBe(today)
    expect(parseRelativeDate("hace 3 dias")).not.toBe(today)
    expect(parseRelativeDate("last 2 weeks")).not.toBe(today)
  })
})

describe("recomputed quality in ranking", () => {
  const entries = parseEntries(
    `${HEADER}\n` +
    `  q1|knowledge|fresh-human|Proteccion de datos verificada y documentada con ejemplo concreto.|src/a.ts|quality;security|2026-11-20||3|decision-fresh|0.9|1.0||0||human|active|||high|verified\n` +
    `  q2|knowledge|old-inferred|nota vaga|src/b.ts|tag|2026-01-01||0||0.2|0.2||0||inferred|active||||unverified`
  )

  it("scores a recent human verified entry above an old inferred one", () => {
    const [fresh, old] = entries
    expect(entryQuality(fresh, "2026-11-26")).toBeGreaterThan(entryQuality(old, "2026-11-26"))
  })

  it("matches an unaccented query against accented content", () => {
    const detail = graphRecallDetailed(
      `version: 1\nentries[1|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|pinned|path_scope|origin|status|supersededOn|importance|evidence}:\n  a1|knowledge|proteccion|La protección de datos exige cifrado.|src/a.ts|seguridad|2026-11-20||0||0.9|1.0||0||human|active|||high|verified`,
      "proteccion cifrado",
      { today: "2026-11-26" }
    )
    expect(detail.entries.map((e) => e.key)).toContain("proteccion")
  })
})
