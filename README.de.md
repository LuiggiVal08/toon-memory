[English](README.md) | [Español](README.es.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português (BR)](README.pt-br.md) | [Deutsch](README.de.md) | [Français](README.fr.md)

# toon-memory

> Gib deinem KI-Coding-Agenten ein Gedächtnis, das die Sitzung überdauert — Entscheidungen, Muster und Fehler, in jeder Sitzung gemerkt.

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://luiggival08.github.io/toon-memory/)
[![MCP Badge](https://lobehub.com/badge/mcp/luiggival08-toon-memory)](https://lobehub.com/mcp/luiggival08-toon-memory)

---

## Inhaltsverzeichnis

- [Was ist toon-memory?](#was-ist-toon-memory)
- [Blog-Beitrag](#blog-beitrag)
- [Funktionen](#funktionen)
- [Schnellstart](#schnellstart)
- [Unterstützte Agenten](#unterstützte-agenten)
- [MCP-Werkzeuge](#mcp-werkzeuge)
- [Mehrzellen-Koordination](#mehrzellen-koordination)
- [Memory-Graph (grafbasierter Recall)](#memory-graph-grafbasierter-recall)
- [Memory-Graph-Viewer](#memory-graph-viewer)
- [Tipps & Best Practices](#tipps--best-practices)
- [CLI-Befehle](#cli-befehle)
- [Konfiguration](#konfiguration)
- [Funktionsweise](#funktionsweise)
- [Warum TOON?](#warum-toon)
- [Fehlerbehebung](#fehlerbehebung)
- [FAQ](#faq)
- [Entwicklung](#entwicklung)
- [Beitragen](#beitragen)
- [Sicherheit & Datenschutz](#sicherheit--datenschutz)
- [Lizenz](#lizenz)

---

## Was ist toon-memory?

Kannst du dich an diesen Moment erinnern, in dem dein KI-Agent alles aus der Sitzung von gestern vergessen hat? Du erklärst zum dritten Mal dieselbe Architekturentscheidung, und er schlägt immer noch den Ansatz vor, den du bereits abgelehnt hast?

**toon-memory löst dieses Problem.** Es gibt deinem KI-Agenten Kontinuität — ein Gedächtnis, das Neustarts überlebt, sodass er tatsächlich im Laufe der Zeit aus deinem Projekt lernt. Du erklärst dieselbe Entscheidung nie zweimal.

📖 **[Dokumentation lesen](https://luiggival08.github.io/toon-memory/)**

### Anwendungsfälle aus der Praxis

| Szenario | Was toon-memory macht |
|----------|----------------------|
| Design-Diskussionen | „Wir haben Redis statt Memcached wegen der Pub/Sub-Unterstützung gewählt" |
| Framework-Auswahl | „Dieses Projekt verwendet Zod für die Validierung, nicht Joi" |
| Bugfixes | „Erschöpfung des Redis-Connection-Pools — Lösung war max_connections=20" |
| Architektur-Notizen | „Der Broker-Dienst verwendet das RESP-Protokoll, nicht HTTP" |
| Onboarding | „Das Deployment-Skript liegt unter scripts/deploy.sh" |
| Team-Kontext | „PR #142 hat die Caching-Änderung reverted — nicht erneut einfügen" |

---

## Blog-Beitrag

Lies [So macht toon-memory deinen KI-Agenten klüger](https://luiggival08.github.io/toon-memory/blog), um eine Live-Demonstration von persistentem Speicher in der Praxis zu sehen.

---

## Funktionen

- **Ein vollständiges Speicher-Toolkit** — Vollständige Speicherverwaltung über das Model Context Protocol, inklusive `memory_smart_recall` (einheitlicher Recall mit Session-Bias), `memory_sessions` zur Mehrzellen-Koordination, `context_*`-Werkzeuge zur Kontextgenerierung mit einem Aufruf (Briefing, Diff, Focus, Gesundheitsprüfung, Export), `memory_compress` (LLM-gesteuerte Komprimierung), `memory_consolidate` (deterministische Deduplizierung/Zusammenführung/Bereinigung), `memory_primer` (automatisch injizierter Kontext), `memory_merge_sessions` (sitzungsübergreifende Zusammenführung), `memory_pin`/`memory_unpin` (Wichtige Einträge mit Priorität 1-5 anpinnen), `memory_checkpoint` (Sitzungs-Momentaufnahme mit 7d TTL), `memory_search` (einheitliche Suche mit Tag-Filtern + Session-Bias), `memory_tag` (Batch-Tag-Operationen), `memory_export_gist`/`memory_import_gist` (GitHub-Gist-Synchronisierung), `memory_forget` (Soft/Hard-Delete, Wiederherstellen, Ersetzen), `memory_reflect` (Reflexion über Veraltetheit/Qualität) und `memory_promote` (automatisches Befördern von Low-Confidence-Entwürfen)
- **MCP-Ressourcen** — Lese Speicher als Kontext ohne Werkzeugaufrufe, inklusive eines System-Primers (automatisch generierte Wissenskarte)
- **15 unterstützte Agenten** — OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex CLI, Gemini CLI, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro
- **Interaktiver Installer** — Wähle aus einem Menü, welche Agenten konfiguriert werden sollen
- **SessionStart-Hooks** — Automatische Erinnerungen für Claude Code, Codex CLI, Gemini CLI, Antigravity
- **TOON-Format** — 22 % weniger Token als JSON (gemessen), bessere LLM-Verarbeitung
- **Projektweiter Speicher** — Jedes Projekt erhält seine eigene Speicherdatei
- **Null Konfiguration** — Einfach installieren und verwenden
- **Automatisches gitignore** — Fügt `.toon-memory/memory/` automatisch zur `.gitignore` hinzu
- **Datumsfilterung** — Durchsuche den Speicher nach Zeiträumen
- **Automatisches Archivieren** — Alte Einträge (>30 Tage), abgelaufene TTL-Einträge oder mehr als 100 Einträge werden automatisch archiviert
- **Verschlüsselung** — AES-256-GCM-Verschlüsselung für sensible Daten
- **Watch-Modus** — Automatisches Backup alle N Minuten
- **Speicher-TTL** — Konfigurierbares Ablaufdatum pro Eintrag (7d, 30d oder genaue Daten)
- **Tag-Inferenz** — Automatische Tag-Erkennung aus dem Inhalt, wenn keine Tags angegeben sind (eingebautes Vokabular + Projekt-Abhängigkeiten)
- **Speicher-Diff** — Zeige Änderungen seit der letzten Sitzung an
- **Verwandte Einträge** — Automatische Vorschläge verwandter Einträge beim Speichern
- **Speicher-Graph** — Verbinde Einträge mit `links`/`[[key]]`-Referenzen; `memory_recall` kann einen beziehungsbewussten Subgraphen für genaueren Recall mit weniger Token erweitern (keine Embeddings, kein LLM)
- **Token-effizienter Recall** — `memory_recall({ compact: true })` gibt nummerisch indexierte Einträge zurück, lässt `id`/`date`/`file` weg, rendet Graph-Kanten als `->2` und kürzt Graph-Nachbarn auf kurze Auszüge
- **BM25 + Zentralitäts-Ranking** — Recall wird nach BM25-Relevanz und Graph-Zentralität neu sortiert (Hubs tauchen auch ohne Suchbegriff auf); Hop-Abfall hält entfernte Knoten unten
- **Auto-Tags aus Abhängigkeiten** — `toon-memory init`扫描t `package.json`/`Cargo.toml`/`requirements.txt`/`go.mod` und schreibt ein Projektvokabular, sodass Einträge, die eine Abhängigkeit erwähnen, automatisch mit dem entsprechenden Tag versehen werden
- **Smart Recall** — `memory_smart_recall` kombiniert BM25 + Graph + Decay + Qualität in einem Aufruf; das LLM ruft dies am Anfang jeder Aufgabe auf
- **Qualitätsbewertung** — Jeder Eintrag erhält einen Qualitäts-Score (0–1) basierend auf Struktur (Tags, Links, Inhaltsspezifität, Aktualität); hochwertige Einträge werden zuerst angezeigt
- **Zusammenführung & Deduplizierung** — Beim Speichern mit demselben `key` werden Attribute zusammengeführt (Vereinigung der Tags, maximaler Confidence-Wert, neuestes Datum, kombinierte Links) anstatt überschrieben
- **Confidence-Score** — Jeder Eintrag verfolgt die Verlässlichkeit: Benutzerbehauptung = 1.0, abgeleitet = 0.65–0.75
- **Erkennung von Fast-Duplikaten** — Konsolidierung erkennt Fast-Duplikate über Jaccard-Ähnlichkeit (Schwellenwert 0.7) und führt sie zusammen
- **LLM-gesteuerte Komprimierung** — `memory_compress` verwendet KI, um lange Einträge zusammenzufassen; `memory_consolidate(mode: "low-quality")` führt die Batch-Bereinigung deterministisch durch
- **Sitzungsübergreifende Zusammenführung** — `memory_merge_sessions` führt Beobachtungen aus parallelen Sitzungen für eine Datei zusammen
- **GitHub-Gist-Synchronisierung** — `memory_export_gist` und `memory_import_gist` synchronisieren Speichereinträge über GitHub Gist (keine Abhängigkeiten)
- **Verbatim-Modus** — `config.verbatim` behält ursprüngliche Einträge, anstatt sie beim Speichern zu überschreiben
- **Kontextgenerierungs-Werkzeuge** — `context_generate` (vollständiges Briefing), `context_diff` (inkrementell), `context_focus` (gezielt), `context_health` (Gesundheitsprüfung), `context_export` (Markdown) — jedes ersetzt 5–6 manuelle Werkzeugaufrufe. Kein LLM, rein deterministische Aggregation
- **System-Primer** — Automatisch generierte Wissenskarte, die als MCP-Ressource bereitgestellt wird; Agenten laden sie beim Sitzungsstart für sofortigen Kontext
- **Pfad-Begrenzung** — Einträge können über Glob-Muster auf Dateipfade begrenzt werden (`path_scope`); der Recall filtert automatisch nach Bereich
- **Budget-Kontrolle** — Drei Ausgabestufen: `budget: "tiny"` (Key + 1 Zeile, ~50 Token), `"normal"` (kompakt mit Tags/Kanten), `"deep"` (alle Felder mit Ursprung/Bereich/Status). Rückwärtskompatibel mit `compact: true`
- **Ursprungs-Verfolgung** — Jeder Eintrag verfolgt seinen Ursprung (`human`, `agent`, `inferred`); Benutzerbehauptungen erhalten einen Qualitäts-Boost
- **Soft Delete** — `memory_forget` führt standardmäßig einen Soft-Delete durch (setzt `status=obsolete`). Wiederherstellen mit `memory_forget(key, action: "restore")`, Ausblenden mit `action: "soft"`, endgültiges Entfernen über `action: "hard"`
- **Erweiterte Gesundheitsprüfung** — `context_health` erkennt jetzt fehlende Evidenz (path_scope ohne Datei) und veraltete Behauptungen (überlappender Inhalt in derselben Kategorie)
- **Typisierte Graph-Kanten** — Kanten tragen Typen (`superseded_by`, `supersedes`, `relates`), im Graphen als `type:key` geschrieben. Explizite `links` werden zu `relates:key`, sodass du erkennen kannst, *wie* Einträge zusammenhängen, nicht nur, dass sie zusammenhängen
- **RRF-Ranking** — Recall fusioniert BM25- (×3) und Graph-Zentralitäts-Rankings mit Reciprocal Rank Fusion und einem adaptiven `k = clamp(3..60, round(sqrt(n)))`. Benchmark (8 Gold-Queries): nDCG 0.776, MRR 0.917 — exakt gleichwertig mit der vorherigen linearen Bewertung. Übergebe `rrf: false`, um zurückzufallen
- **Memory reflect** — `memory_reflect` sortiert Einträge nach Veraltetheit, Qualität und übermäßiger Vernetzung, um aufzuzeigen, was Aufmerksamkeit oder Bereinigung braucht. Deterministisch, kein LLM
- **Memory supersede** — `memory_forget(key, action: "supersede", new_key)` markiert einen Eintrag als durch einen neueren ersetzt (`superseded_by`-Link + `supersededOn`-Datum). `memory_recall({ as_of })` schließt alte Einträge für Punkt-in-Zeit-Abfragen vor ihrer Ersetzung wieder ein
- **Auto-Promote** — `memory_promote` befördert Low-Confidence-Entwürfe deterministisch zu aktiven Einträgen (Schwellenwert 0.65, Jaccard-Deduplizierung), standardmäßig mit `dryRun`
- **Explain WHY** — `memory_recall`/`memory_smart_recall` akzeptieren `explain: true` und hängen jedem zurückgegebenen Eintrag eine deterministische Begründungszeile an (`↳ 100% relevance · used 14× · used today · importance HIGH`) — *warum* er abgerufen wurde, kein LLM
- **Token-Budgets** — `budget_tokens` begrenzt die Recall-Ausgabe nach geschätzter Token-Anzahl; Einträge werden gierig akkumuliert und der Überschuss am Ende, der das Budget überschreiten würde, wird verworfen (`0` = kein Limit)
- **Versions-Ersetzung** — `memory_consolidate(mode: "versions")` erkennt Einträge, die dasselbe Thema in verschiedenen Bibliotheksversionen beschreiben (z. B. „React 18 verwenden" vs. „React 19 verwenden") und archiviert die älteren zugunsten der neuesten
- **Negative Erinnerungen** — eine `warning`-Kategorie für „Tu das NICHT"-Fakten; `warning`-Einträge erhalten einen Recall-Boost, damit der Agent die Minen sieht, bevor er sie wiederholt
- **Sprach- + Ordner-Ranking** — Recall verstärkt Einträge, die in derselben Schriftfamilie (lateinisch/CJK/kyrillisch/…) geschrieben sind, sowie Einträge, deren `path_scope` mit der aktuellen Datei übereinstimmt
- **Explizite Wichtigkeit** — `memory_remember({ importance })` setzt `critical`, `high`, `medium` oder `low`. Kritische Entscheidungen erscheinen zuerst (+0.3), niedrige Notizen bleiben im Hintergrund (−0.1); leer = automatisch (Aktualität + Häufigkeit). Erneutes Speichern behält die höhere Stufe

---

## Schnellstart

### 1. Installation

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex

# Oder mit npm (jede Plattform)
npm i -g toon-memory
```

> **Tipp:** Die npm-Installation ist die zuverlässigste Methode. Die curl/irm-Skripte sind bequeme Wrapper.

### 2. Konfiguriere deine Agenten

```bash
# Interaktiver Installer — erkennt Agenten und konfiguriert MCP
npx toon-memory
```

Der Installer wird:
1. Erkennen, welche KI-Agenten installiert sind
2. Fragen, welche konfiguriert werden sollen
3. Die MCP-Server-Konfiguration automatisch hinzufügen

### 3. Loslegen

Das war's! Probiere es in deiner nächsten Agenten-Sitzung:

```bash
memory_stats      # Sieh, was im Speicher ist
memory_recall     # Durchsuche den Speicher, bevor du Dateien liest
memory_remember   # Speichere wichtige Entscheidungen
```

> **Tipp:** Führe zu Beginn jeder Sitzung `memory_recall` aus. Dein Agent hat sofort den Kontext aus vorherigen Sitzungen.

### MCP-Client-Schnelleinrichtung

#### Cursor

Füge zu `.cursor/mcp.json` hinzu:

```json
{
  "mcpServers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

#### Claude Desktop

Füge zu `claude_desktop_config.json` hinzu:

```json
{
  "mcpServers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

#### Windsurf

Füge zu `~/.codeium/windsurf/mcp_config.json` hinzu:

```json
{
  "mcpServers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

---

## Unterstützte Agenten

| Agent | Konfigurationspfad | Format | Hooks | Auto-Setup |
|-------|-------------------|--------|-------|------------|
| **OpenCode** | `.opencode/opencode.json` + `.opencode/plugins/toon-memory.ts` | Plugin | SessionStart (Plugin, kein übergeordnetes `hooks`) | ✅ |
| **VS Code / Copilot** | `.vscode/mcp.json` | JSON | — | ✅ |
| **Claude Code** | `.mcp.json` (MCP) + `.claude/settings.json` (hooks) | JSON | SessionStart + PostToolUse + Stop | ✅ |
| **Cursor** | `.cursor/mcp.json` | JSON | — | ✅ |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | JSON | — | ✅ |
| **Cline** | `.cline/mcp.json` | JSON | — | ✅ |
| **Continue** | `.continue/config.json` | JSON | — | ✅ |
| **Codex CLI** | `.codex/config.toml` | TOML | SessionStart + PostToolUse + Stop (`[[hooks]] event=`) | ✅ |
| **Gemini CLI** | `.gemini/settings.json` | JSON | SessionStart + PostToolUse + Stop (`hooks.*`) | ✅ |
| **Zed** | `~/.config/zed/settings.json` | JSONC | — | ✅ |
| **Antigravity** | `.agents/mcp_config.json` + `.agents/hooks.json` | hooks.json | PreInvocation + PostToolUse + Stop (kein SessionStart-Event) | ✅ |
| **Aider** | — | — | — | 📝 Anleitung |
| **KiloCode** | `~/.kilocode/mcp_settings.json` | JSON | — | ✅ |
| **OpenClaw** | `.openclaw.json` | JSON | — | ✅ |
| **Kiro** | `.kiro/settings/mcp.json` | JSON | — | ✅ |

> **Tipp:** Du kannst toon-memory gleichzeitig für mehrere Agenten konfigurieren. Jeder Agent nutzt dieselbe gemeinsame Speicherdatei unter `.toon-memory/memory/`.

---

## MCP-Werkzeuge

| Werkzeug | Beschreibung |
|----------|-------------|
| `memory_remember` | Speichere eine Entscheidung, ein Muster, einen Bug, Wissen oder eine **Warnung** (`warning`, negative „Tu das NICHT"-Erinnerung, wird mit einem Boost abgerufen) — optionales TTL, automatische Tag-Inferenz, `links` zum Aufbau des Speicher-Graphen, Zusammenführung & Deduplizierung bei gleichem Key, automatische Qualitäts- und Confidence-Bewertung |
| `memory_recall` | Durchsuche den Speicher (VOR dem Lesen von Dateien verwenden, abgelaufene TTL wird gefiltert). `mode: "graph"` erweitert einen beziehungsbewussten Subgraphen für höhere Präzision. `budget: "tiny"|"normal"|"deep"` steuert die Ausführlichkeit der Ausgabe (rückwärtskompatibel mit `compact: true`). `path_scope` filtert nach Glob-Muster. `sessionBias` verstärkt Einträge aus dem aktuellen Git-Branch. `explain: true` hängt jedem Eintrag eine Begründungszeile an (warum er abgerufen wurde). `budget_tokens` begrenzt die Ausgabe nach geschätzten Token (`0` = kein Limit). Qualitätsbewertetes Ranking |
| `memory_smart_recall` | **Einheitlicher Recall**: BM25 + Graph + Decay + Qualität in einem Aufruf. `sessionBias` verstärkt Einträge aus dem aktuellen Git-Branch. `explain: true` hängt Begründungen pro Eintrag an, `budget_tokens` begrenzt die Ausgabe nach geschätzten Token. Am ANFANG jeder Aufgabe verwenden. Gibt kompaktes, token-effizientes Ergebnis zurück |
| `memory_forget` | **Lebenszyklus-Operationen** per Key oder ID: `action: "soft"` (Standard) markiert als veraltet, `"hard"` entfernt dauerhaft, `"restore"` stellt wieder her, `"supersede"` archiviert den Eintrag mit einem `superseded_by`-Link auf `new_key` |
| `memory_stats` | Zeige den Speicherzustand (inklusive TTL-Statistiken, Qualitätsverteilung, Ursprungs-/Status-Aufschlüsselung, kalte Erinnerungen unter Qualitäts-/Zugriffsschwellen und **Hit-Rate-/Duplikat-/Veraltet-Metriken**) |
| `memory_summary` | Speichere/rufe Dateizusammenfassungen ab |
| `memory_archive` | Archiviere alte Einträge (>30 Tage) und abgelaufene TTL-Einträge |
| `memory_diff` | Zeige Änderungen seit einem Datum (24h, 7d oder genaues Datum) |
| `memory_suggest` | Finde verwandte Einträge für einen bestimmten Kontext |
| `memory_encrypt` | Aktiviere AES-256-GCM-Verschlüsselung |
| `memory_decrypt` | Deaktiviere Verschlüsselung |
| `memory_backup` | Erstelle ein zeitgestempeltes Backup der Speicherdatei (automatisch auf die 10 neuesten beschränkt) |
| `memory_captured` | Zeige die automatisch durch Hooks erfasste Aktivität an (Opt-in) oder lösche das Protokoll |
| `memory_checkpoint` | **Sitzungs-Checkpoint**: erstellt eine Momentaufnahme des aktuellen Speicherzustands mit 7d TTL. Nützlich als Rollback-Referenz während langer Sitzungen |
| `memory_consolidate` | **Aufräumoperationen** deterministisch (kein LLM): `mode: "identical"` (Standard) dedupliziert inhaltlich identische Einträge, `"similar"` mergt Fast-Duplikate (Jaccard >50%), `"low-quality"` entfernt Low-Quality-Einträge in einem Durchgang (`minQuality`, `dryRun`), `"versions"` archiviert ältere Bibliotheksversion-Einträge zugunsten der neuesten |
| `memory_sessions` | Zeige aktive Agenten-Sitzungen (Branch, Dateien, zuletzt gesehen) und weiche Konflikte für parallele Arbeit |
| `memory_compress` | LLM-gesteuerte Zwei-Schritt-Komprimierung: zusammenfassen + überschreiben. Verwendet die `anthropic`/`openai`-CLI, falls verfügbar, andernfalls gibt sie einen Prompt für die manuelle Komprimierung zurück |
| `memory_primer` | Ein-Aufruf-Kontext-Primer: Hauptgedächtnis + Kategorien + Sitzungsdatei-Änderungen. Wird beim Sitzungsstart automatisch injiziert |
| `memory_merge_sessions` | Fusioniert Beobachtungen aus parallelen Sitzungen für eine Datei. Dedupliziert und befördert optionalerweise in den Speicher |
| `memory_export_gist` | Exportiert Einträge zu einem GitHub Gist (öffentlich oder privat). Verwendet GITHUB_TOKEN oder gh CLI |
| `memory_import_gist` | Importiert Einträge von einem GitHub Gist. Fusioniert mit bestehenden Einträgen (Tag-Vereinigung, max. Vertrauen) |
| `memory_graph_path` | Kürzester BFS-Pfad zwischen zwei Einträgen im Wissensgraph. Zeigt, wie Konzepte verbunden sind |
| `context_brief` | **Kontext-Briefing mit einem Aufruf**: Speicher + Sitzungen + Gesundheit als kompaktes Markdown. Ersetzt 5–6 separate `memory_*`-Aufrufe. Kein LLM, rein deterministische Aggregation |
| `context_generate` | **Vollständiges Projekt-Briefing**: Kombiniert Projektstruktur, Git-Zustand, Speichereinträge und aktive Sitzungen in einem Aufruf. Ersetzt 5–6 manuelle Werkzeugaufrufe |
| `context_diff` | **Inkrementelles Briefing**: Git-Commits + geänderte Dateien + neue/aktualisierte Speichereinträge + aktive Sitzungen seit der letzten Sitzung |
| `context_focus` | **Hyper-fokussiertes Briefing**: Nur relevanter Speicher + zugehörige Quelldateien + Aufrufer + Testdateien für eine Anfrage |
| `context_health` | **Speicher-Gesundheitsprüfung**: Verwaiste Links, Duplikate, defekte Dateireferenzen, abgelaufene TTL, veraltete Sitzungen, Score 0–100 |
| `context_export` | **Exportiere Speicher als Markdown**: Injizierbarer Kontext für System-Prompts (vollständig oder kompakt) |
| `memory_pin` | **Pinne einen Eintrag mit Priorität 1-5**: angepinnte Einträge erscheinen immer zuerst in den Suchergebnissen, nach Priorität sortiert, auch ohne Suchbegriff |
| `memory_unpin` | **Eintrag lösen**: entferne die Prioritätsmarkierung |
| `memory_search` | **Einheitliche Suche mit Filtern**: wie `memory_recall` plus `category`, `tags`, `from_date`, `to_date`-Filter. Der Tag-Filter verwendet AND-Logik — alle angegebenen Tags müssen übereinstimmen. `budget` steuert die Ausführlichkeit der Ausgabe. `path_scope` filtert nach Glob-Muster. `sessionBias` verstärkt Einträge aus dem aktuellen Git-Branch. |
| `memory_tag` | **Batch-Tag-Operationen**: `add`, `remove` oder `set` Tags für einen oder mehrere Einträge per key oder id |

### MCP-Ressourcen

Der Speicher wird auch als MCP-Ressourcen für direktes Lesen von Kontext bereitgestellt:

| Ressource | URI | Beschreibung |
|----------|-----|-------------|
| Speichereinträge | `toon://memory/entries` | Vollständiger Speicherdump |
| Aktueller Speicher | `toon://memory/current` | Aktueller Speicherzustand mit den neuesten Einträgen |
| Speicher-Statistik | `toon://memory/stats` | Kategorie-Zählungen und TTL-Informationen |
| System-Primer | `toon://memory/summaries` | Automatisch generierte Wissenskarte (Top-Einträge, Kategorien, Muster) |

### MCP-Prompts

| Prompt | Beschreibung |
|--------|--------------|
| `summarize_project_context` | Analysiert den aktuellen TOON-Speicher und generiert eine kompakte Projektzusammenfassung. Optionaler `intent`-Parameter, um sich auf einen bestimmten Bereich zu fokussieren |

### Beispiele

#### Eine Entscheidung speichern

```typescript
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation — simpler than Joi, better TS support",
  file: "src/types.ts",
  tags: "validation;types"
})
// 🧠 Guardado: decision/use-zod (a1b2c3d4)
// Quality score: 0.65 (2 tags, detailed content)
// 🔗 Entradas relacionadas:
//   [pattern] zod-schemas — Shared Zod schemas for API validation
```

> **Tipp:** Verwende aussagekräftige Keys wie `use-zod` statt vager Begriffe wie `validation`. Dein Agent sucht nach Key und Inhalt, daher hilft Spezifität. Speichern mit demselben Key führt automatisch zusammen (Tag-Vereinigung, maximaler Confidence-Wert).

#### Mit TTL speichern

```typescript
memory_remember({
  category: "knowledge",
  key: "sprint-deadline",
  content: "Sprint ends July 18, feature freeze is July 16",
  ttl: "7d"
})
// 🧠 Guardado: knowledge/sprint-deadline (x1y2z3w4)
// ⏰ TTL: 2026-07-19
// Quality score is calculated automatically.
```

> **Tipp:** Verwende TTL für temporären Kontext wie Deadlines, Sprint-Infos oder zeitkritische Notizen. Einträge mit abgelaufener TTL werden automatisch aus den Suchergebnissen gefiltert.

#### Explizite Wichtigkeit festlegen

```typescript
memory_remember({
  category: "decision",
  key: "db-choice",
  content: "We chose Postgres over MySQL — JSONB for flexible schemas, better extension ecosystem",
  importance: "critical"
})
// 🧠 Guardado: decision/db-choice (a1b2c3d4)
// 🎯 Importance: critical (+0.3 boost) — surfaces above routine entries
```

> **Tipp:** Markiere grundlegende Entscheidungen als `critical`, damit sie immer nahe der Spitze des Recalls rangieren. `importance` akzeptiert `critical`, `high`, `medium` oder `low`; lasse es leer, damit das System automatisch nach Aktualität und Häufigkeit rangiert.

#### Automatisch inferierte Tags

```typescript
memory_remember({
  category: "bug",
  key: "redis-connection-timeout",
  content: "Redis connection timeout in production, increased pool size"
  // tags left empty — auto-inferred from content
})
// 🧠 Guardado: bug/redis-connection-timeout (a1b2c3d4)
// 🏷️ Tags inferidos: redis
// Quality score is calculated automatically based on inferred tags and content.
```

> **Tipp:** Lass `tags` leer, und das System inferiert sie aus deinem Inhalt mithilfe eines eingebauten Vokabulars mit über 20 Kategorien (redis, auth, api, db, security usw.) **plus** einem Projektvokabular, das aus deinen Abhängigkeiten bei der Initialisierung abgeleitet wird. Wenn dein Projekt also von `redis` abhängt, erhält jeder Eintrag, der „redis" erwähnt, automatisch das Tag `redis`.

#### Speicher durchsuchen

```typescript
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **Tipp:** Suche, bevor du Dateien liest. Das spart Token und gibt deinem Agenten Kontext, den er allein aus dem Code nicht hätte. Qualitätsbewertetes Ranking stellt sicher, dass die nützlichsten Einträge zuerst erscheinen. Oder verwende `memory_smart_recall` für ein umfassenderes Ergebnis.

#### Suche mit Datumsfilter

```typescript
memory_recall({
  query: "redis",
  from_date: "2026-07-01",
  to_date: "2026-07-31"
})
```

> **Tipp:** Verwende Datumsfilter, wenn du dich grob daran erinnern *kannst*, *wann* etwas passiert ist, aber nicht genau *was*. Das qualitätsbewertete Ranking gilt weiterhin.

#### Alte Einträge archivieren

```typescript
memory_archive()
// 📦 Archivadas 5 entradas antiguas
// 📋 Quedan 42 entradas activas
```

> **Tipp:** Führe dies regelmäßig aus, um den Speicher schlank zu halten. Archivierte Einträge sind weiterhin über `memory_recall` mit Datumsfiltern durchsuchbar. Einträge mit abgelaufener TTL werden ebenfalls automatisch archiviert. Einträge mit niedriger Qualität erhalten eine niedrigere Priorität beim Recall.

#### Änderungen seit der letzten Sitzung anzeigen

```typescript
memory_diff({ since: "24h" })
// 📋 Cambios desde 2026-07-11:
//
// ➕ Nuevas (2):
//   [decision] use-zod (a1b2c3d4)
//     Use Zod for validation
//   [bug] redis-timeout (e5f6g7h8)
//     Redis connection timeout fix
```

> **Tipp:** Verwende `memory_diff` am Anfang einer Sitzung, um zu sehen, was dein Agent seit deiner letzten Arbeit am Projekt gelernt hat. Neue Einträge enthalten Qualitäts-Scores.

#### Verwandte Einträge finden

```typescript
memory_suggest({ context: "redis cache configuration" })
// 🔍 Sugerencias para "redis cache configuration":
//
// [decision] redis-cache-config (a1b2c3d4)
//   Redis cache layer for session storage
//   File: src/cache.ts | Tags: redis;cache | Date: 2026-07-10
//
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **Tipp:** Verwende `memory_suggest`, wenn du Kontext zu einem Thema brauchst, aber nicht sicher bist, wonach du suchen sollst. Oder verwende `memory_smart_recall` für ein umfassenderes Ergebnis.

#### Smart Recall (einheitlich)

```typescript
memory_smart_recall({ intent: "diseño de base de datos para backend" })
// [1] decision/use-postgres
//   Choose Postgres for ACID compliance and JSON support
//   tags: db;decision · edges: ->2
//
// [2] pattern/db-migrations
//   Use sequential migration files, never edit committed ones
//   tags: db;pattern · edges: ->1
//
// [3] bug/redis-timeout
//   Redis connection timeout — increased pool to 20
//   tags: redis;bug
```

> **Tipp:** Verwende `memory_smart_recall` am ANFANG jeder Aufgabe. Es kombiniert BM25 + Graph + Decay + Qualität in einem Aufruf — kein Rätselraten nötig, wonach du suchen sollst.

#### Erkläre, warum ein Ergebnis zurückgegeben wurde

```typescript
memory_recall({ query: "redis", explain: true })
// [decision] redis-cache-config (a1b2c3d4)
//   Redis cache layer for session storage
//   File: src/cache.ts | Tags: redis;cache | Date: 2026-07-10
//   ↳ 92% relevance · used 14× · used today · importance HIGH
```

Die `↳`-Begründungszeile ist deterministisch (Relevanz in %, Anzahl der Zugriffe, zuletzt verwendet, Bedeutung) — kein LLM beteiligt. Verwende `explain: true`, wenn du wissen willst, *warum* dem Agenten diese Einträge angezeigt wurden.

#### Ausgabe mit `budget_tokens` begrenzen

```typescript
memory_recall({ query: "redis", budget_tokens: 300 })
// Entries accumulate greedily; the tail that would exceed the estimate is dropped.
// budget_tokens: 0 (default) = no limit.
```

> **Tipp:** Kombiniere `budget_tokens` mit `budget: "deep"` für ein Kontextfenster, das unabhängig von der Speichergröße innerhalb einer festen Token-Obergrenze bleibt.

#### Vollständiges Projekt-Briefing (ein Aufruf)

```typescript
context_generate({})
// # Project Briefing (full)
//
// ## Project
// - Name: my-app
// - Root: /path/to/project
// - Package Manager: npm
// - TypeScript: ✓ (v5.3)
//
// ## Git Status
// - Branch: main
// - 3 uncommitted, 0 untracked
//
// ## Memory (42 entries, 12 patterns, 8 bugs)
// [1] decision/use-postgres
//   Choose Postgres for ACID compliance
//   tags: db;decision
//
// ## Sessions
// - egraterol (main, 2m ago): 42 files touched
```

> **Tipp:** Verwende `context_generate` am Anfang einer Sitzung, um vollständigen Kontext in einem Aufruf zu erhalten. Ersetzt 5–6 separate Werkzeugaufrufe.

#### Speicher-Gesundheitsprüfung

```typescript
context_health({})
// # Memory Health (score: 87/100)
//
// ## Summary
// - 42 entries (12 patterns, 8 bugs, 15 decisions, 7 knowledge)
// - 65.3% average quality
//
// ## Issues (3)
// - Orphan link: pattern/db-migrations → pattern/db-seed (key not found)
// - Duplicate: [bug] redis-pool-fix has identical content
// - Expired TTL: [knowledge] sprint-deadline (expired 2026-07-20)
//
// ## Stale Files (1)
// - src/legacy.ts (deleted, 2 refs)
```

> **Tipp:** Führe `context_health` aus, wenn der Speicher unübersichtlich wird. Zeigt verwaiste Links, Duplikate, abgelaufene TTL-Einträge und defekte Dateireferenzen.

#### Zusammenführung & Deduplizierung (automatisch)

Beim Speichern mit demselben `key` werden Attribute zusammengeführt statt überschrieben:

```typescript
// Erstes Speichern
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  tags: "types"
})
// 🧠 Guardado: decision/use-zod (a1b2c3d4)

// Späteres Speichern mit gleichem Key — wird automatisch zusammengeführt
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation — also handles API response parsing",
  tags: "types;api"
})
// 🧠 Actualizado: decision/use-zod (a1b2c3d4)
// 🔗 Merge: tags combinados, fecha y links actualizados
// Tags now: "types;api" (union of both)
```

> **Tipp:** Verwende aussagekräftige, stabile Keys. Gleicher Key = Zusammenführung, anderer Key = neuer Eintrag.

#### Qualitätsbewertung

Jeder Eintrag erhält automatisch einen Qualitäts-Score (0–1) basierend auf der Struktur:

| Faktor | Gewichtung | Was gemessen wird |
|--------|------------|-------------------|
| Tags | max. 0,3 | Spezifischere Tags = höhere Qualität |
| Links | max. 0,2 | Verbundene Einträge = höhere Qualität |
| Inhaltslänge | max. 0,3 | Detailliert > vage |
| Aktualität | max. 0,1 | Neuere Einträge schneiden besser ab |
| Spezifität | max. 0,1 | Einzigartige Wörter vs. wiederholte Wörter |
| Ursprung | +0,1/−0,05 | Benutzerbehauptungen werden verstärkt, abgeleitete leicht abgewertet |

Hochwertige Einträge werden beim Recall zuerst angezeigt. Überprüfe die Qualität mit `memory_stats`:

```typescript
memory_stats()
// ...
// Calidad promedio: 0.58 (12 con score)
```

#### Confidence-Score

Jeder Eintrag verfolgt, wie zuverlässig die Information ist:

| Quelle | Confidence | Bedeutung |
|--------|-----------|-----------|
| Benutzerbehauptung | 1.0 | „Wir verwenden Postgres" — direkte Aussage |
| Abgeleitet | 0,65–0,75 | Agent hat es aus dem Kontext abgeleitet |
| Unsicher | 0,50 | Agent vermutet |

Der Confidence-Wert wird bei der Zusammenführung beibehalten (Maximum beider Einträge).

#### System-Primer

Der System-Primer ist eine automatisch generierte Wissenskarte, die als MCP-Ressource bereitgestellt wird. Agenten laden sie beim Sitzungsstart für sofortigen Kontext:

```typescript
// Exposed as toon://memory/summaries
// Auto-regenerates on every read
// Contains: top entries, categories, patterns
```

> **Tipp:** Füge `toon://memory/summaries` zur System-Prompt deines Agenten hinzu, um beim Sitzungsstart sofortigen Kontext zu erhalten.

#### Verschlüsselung aktivieren

```typescript
// First, set TOON_MEMORY_KEY in your environment (or .env file):
// export TOON_MEMORY_KEY="your-secret-key-here"

memory_encrypt()
// 🔐 Encriptación habilitada
```

> **Warnung:** Der Verschlüsselungsschlüssel muss vor der Verschlüsselung über die Umgebungsvariable `TOON_MEMORY_KEY` gesetzt werden. Speichere ihn an einem sicheren Ort — wenn du ihn verlierst, sind deine Speicherdaten für immer verloren. Qualitäts-Scores und Confidence-Werte bleiben durch die Verschlüsselung erhalten.

---

## Mehrzellen-Koordination

Wenn du **mehrere KI-Agenten-Sitzungen parallel ausführst** (z. B. drei OpenCode-Sitzungen im selben Repo gleichzeitig), können sie versehentlich die Arbeit der anderen überschreiben. toon-memory liefert **`memory_sessions`**, ein dateibasiertes Koordinationstool, mit dem jede Sitzung sehen kann, was die anderen tun — **ohne Server, ohne Netzwerk und ohne LLM-Aufrufe**.

### So funktioniert es

- Beim Start schreibt ein `SessionStart`-Hook eine **Heartbeat-Datei** für die Sitzung unter `.toon-memory/memory/sessions/<id>.json`. Jeder Prozess schreibt *nur seine eigene* Datei, sodass es keine Lock-Konkurrenz gibt.
- Der Heartbeat zeichnet den Agentennamen, den **Git-Branch**, die **berührten Dateien** und einen **Zuletzt-gesehen-Zeitstempel** auf.
- Das Lesen all dieser Dateien gibt jeder Sitzung eine gemeinsame, letztlich konsistente Ansicht darüber, wer noch aktiv ist.
- Tote Sitzungen (Prozess-PID nicht mehr aktiv **und** veralteter Heartbeat über das TTL-Fenster hinaus) werden nachlässig bereinigt.

### Das `memory_sessions`-Werkzeug

```typescript
memory_sessions({ conflictsOnly: false })
// 🧭 Sesiones activas (2) — ventana 30 min:
//
// • opencode @ feature/auth (tú)
//   id: a1b2c3d4
//   hace 2 min
//   Archivos:
//     • src/auth.ts
//
// • claude @ feature/db
//   id: e5f6g7h8
//   hace 9 min
//     • src/db.ts
//
// 🔥 Conflictos suaves (1):
//   ⚠️ src/types.ts  ↔  opencode @ feature/auth, claude @ feature/db
```

- Übergebe `conflictsOnly: true`, um die Sitzungsliste zu überspringen und nur weiche Konflikte anzuzeigen:
  ```typescript
  memory_sessions({ conflictsOnly: true })
  // 🔥 Conflictos suaves (1):
  //
  // ⚠️ src/types.ts
  //    ↔ opencode @ feature/auth (a1b2c3d4), claude @ feature/db (e5f6g7h8)
  ```
- Ein **weicher Konflikt** ist jede Datei, die von 2+ aktiven Sitzungen bearbeitet wird — ein Hinweis darauf, dass ihr möglicherweise denselben Code bearbeitet. Es ist kein harter Lock, nur eine Warnung zur Koordination.

### Empfohlene Vorgehensweise bei parallelen Sitzungen

1. Zu Beginn jeder Sitzung zeigt der `SessionStart`-Hook bereits die anderen aktiven Sitzungen und etwaige weiche Konflikte an.
2. Führe `memory_smart_recall({ intent: "woran ich arbeite" })` aus, um vollständigen Kontext zu erhalten (Speicher + Graph + Qualität).
3. Führe `memory_sessions()` aus, um das Gesamtbild zu sehen (Branches, Dateien, zuletzt gesehen) und `memory_sessions({ conflictsOnly: true })`, wenn dich nur Konflikte interessieren.
4. Wenn du eine Datei mit einer anderen Sitzung teilst, synchronisiere dich vor dem Bearbeiten, damit ihr euch nicht gegenseitig die Änderungen überschreibt.

> **Tipp:** Dies ist rein lokal und lock-frei — es ist sicher, es so oft wie nötig auszuführen. Kombiniere es mit `memory_smart_recall({ intent: "Projektkontext" })` beim Sitzungsstart für sowohl zellsübergreifenden *Speicher* als auch zellsübergreifende *Anwesenheit*. Der System-Primer (MCP-Ressource) liefert ebenfalls sofortigen Kontext.

---

## Memory-Graph (grafbasierter Recall)

Wenn dein Speicher wächst, kann eine flache Stichwortsuche entweder zu viel (jeden Treffer) oder den falschen Kontext (keine Beziehungen) zurückgeben. toon-memory kann den Speicher als **leichtgewichtige Wissenskarte** behandeln, sodass Recall die *richtigen* Einträge mit weniger Token zurückgibt. Kombiniert mit der Qualitätsbewertung werden die nützlichsten Einträge zuerst angezeigt.

Es ist vollständig **deterministisch und offline** — keine Embeddings, kein Vektor-DB, kein LLM, kein Server. Kanten stammen aus zwei Quellen:

- **Explizite `links`** — Keys, die beim Speichern eines Eintrags angegeben werden.
- **Implizite `[[key]]`-Referenzen** — Jede Erwähnung von `[[some-key]]` im Inhalt.

### So funktioniert es

1. `memory_remember` speichert `links` im Eintrag (durch Leerzeichen oder `;` getrennte Keys). Der Qualitäts-Score wird automatisch berechnet.
2. `memory_recall({ mode: "graph" })` findet Stichworttreffer (Seeds) und erweitert dann den **Ego-Subgraphen** bis zu `hops` (1 oder 2) entlang der Kanten.
3. Relevanz pflanzt sich von den Seeds zu ihren Nachbarn fort, sodass eine verwandte Entscheidung oder Spezifikation auch dann auftaucht, wenn sie den Suchbegriff nicht enthält. Qualitätsbewertetes Ranking stellt sicher, dass die nützlichsten Einträge zuerst erscheinen.
4. Die Ergebnismenge ist begrenzt (`limit`, Standard 6) → **kleinerer, präziserer Kontext** für den Agenten. Oder verwende `memory_smart_recall` für einen einheitlichen Aufruf.

#### Mit Links speichern

```typescript
memory_remember({
  category: "decision",
  key: "risk-engine-priority",
  content: "The engine prioritizes risk over speed (see [[risk-spec]]).",
  file: "spec.md:10",
  tags: "risk;spec",
  links: "engine-arch"          // explicit edge to another entry
})
// 🧠 Guardado: decision/risk-engine-priority (a1b2c3d4)
// Quality score is calculated automatically based on tags, links, and content detail.
```

#### Recall im Graph-Modus

```typescript
memory_recall({ query: "riesgo", mode: "graph", hops: 2 })
// [decision] risk-engine-priority (a1b2c3d4)
//   The engine prioritizes risk over speed (see [[risk-spec]]).
//   File: spec.md:10 | Tags: risk;spec | Date: 2026-07-01
//   links: engine-arch
//
// [knowledge] risk-spec (a2b3c4d5)
//   Risk specification for the engine.
//   links: risk-engine-priority;engine-arch
//
// [pattern] engine-arch (e6f7g8h9)
//   Engine architecture.
//   links: risk-spec
```

> **Tipp:** Verwende `mode: "graph"`, wenn eine Entscheidung mehrere Einträge betrifft (Architektur, Spezifikationen, verwandte Bugs). Für isolierte Fakten reicht der Standardmodus `flat`. Oder verwende `memory_smart_recall`, das Graph + BM25 + Qualität automatisch kombiniert.

#### Token-effizienter Recall (`compact`)

Wenn jeder Token zählt, übergebe `compact: true` für dichtere Ausgabe:

```typescript
memory_recall({ query: "riesgo", mode: "graph", hops: 2, compact: true })
// [1] decision/risk-engine-priority
//   The engine prioritizes risk over speed (see [[risk-spec]]).
//   tags: risk;spec · edges: ->2, ->3
//
// [2] knowledge/risk-spec
//   Risk specification for the engine.
//   tags: risk · edges: ->1
//
// [3] pattern/engine-arch
//   Engine architecture.
//   tags: engine · edges: ->1
```

So verändert `compact` die Ausgabe:

- Jeder Eintrag erhält einen stabilen numerischen Index (`[1]`, `[2]`, …) in Reihenfolge des Scores.
- `id`, `date` und `file` werden weggelassen — nur `tags` bleibt erhalten.
- Im `graph`-Modus werden Kanten als `->2` gerendert (numerisch, nicht als Key-Namen).
- Nachbarn, die über den Graphen erreicht werden (keine Seeds), werden auf einen kurzen Auszug mit Ellipsis gekürzt, während direkt getroffene Seeds ihren vollen Inhalt behalten.
- Qualitätsbewertetes Ranking stellt sicher, dass die nützlichsten Einträge zuerst erscheinen.
- Die gespeicherte `.toon`-Datei wird **nie** verändert — `compact` formt nur die Antwort um.

> **Tipp:** Kombiniere `compact: true` mit `mode: "graph"` für das kleinste mögliche Kontextfenster beim Recall aus einem großen, vernetzten Speicher. Oder verwende einfach `memory_smart_recall`, das dies automatisch macht.

### Wie Recall Ergebnisse rangiert

Recall ist deterministisch und offline (keine Embeddings, kein LLM). Jeder Kandidateneintrag erhält einen kombinierten Score:

- **BM25-Relevanz** — Klassischer probabilistischer Term-Frequenz-Score gegen die Anfrage, unter Verwendung von `id` + `category` + `key` + `content` + `file` + `tags` + `quality` + `confidence`.
- **Graph-Zentralität** — Grad-normalisiert (0..1); ein Hub, der mit vielen Einträgen verbunden ist, erreicht einen Score nahe 1, sodass er auch ohne Suchbegriff auftaucht.
- **Bedeutung** — Aktualität + Zugriffshäufigkeit (dasselbe Signal wird auch anderswo verwendet).
- **Qualitäts-Boost** — Einträge mit höheren Qualitäts-Scores (mehr Tags, Links, Detail) erhalten einen Ranking-Boost.
- **Seed-Bonus** — Einträge, die direkt mit der Anfrage übereinstimmen, erhalten einen festen Bonus.
- **Hop-Abfall** — Knoten, die `d` Hops von einem Seed entfernt sind, werden mit `0.5^d` multipliziert, sodass ferner Kontext unter nahem Kontext rangiert.

Im `graph`-Modus startet Recall mit Stichworttreffern, erweitert den Ego-Subgraphen bis zu `hops` und gibt die Top-`limit` (Standard 6) nach kombiniertem Score zurück. `memory_smart_recall` kombiniert all diese Signale in einem Aufruf.

### Auto-Tags aus Projekt-Abhängigkeiten

Bei `toon-memory init` scannt die CLI deine Abhängigkeitsmanifeste und schreibt eine `vocab`-Tabelle in `.toon-memory/memory/config.json`:

```json
{
  "vocab": {
    "react": ["react"],
    "zod": ["zod"],
    "redis": ["redis"]
  }
}
```

`memory_remember` gleicht dann neue Einträge gegen dieses Vokabular zusätzlich zum eingebauten Vokabular ab, sodass das Erwähnen einer Abhängigkeit in deinem Inhalt automatisch deren Tag anhängt. Mehr Tags = höherer Qualitäts-Score. Unterstützte Manifeste: `package.json`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, `go.mod`.

> **Tipp:** Führe `toon-memory init` erneut aus, nachdem du größere Abhängigkeiten hinzugefügt hast, um das Vokabular zu aktualisieren. Der `vocab`-Schlüssel wird zusammengeführt (nie überschrieben) mit den `encrypted`/`capture`-Flags in `config.json`. Mehr Tags = höherer Qualitäts-Score.

---

## Memory-Graph-Viewer

Visualisiere deinen Speicher als interaktiven, kraftbasierten Graphen. Sieh Einträge, ihre Verbindungen, Kategorien und Zugriffsmuster auf einen Blick.

### CLI-Viewer (eigenständiger HTTP-Server)

```bash
npx toon-memory viewer          # HTTP-Server starten + Browser öffnen
npx toon-memory viewer --port 3001  # Eigener Port
npx toon-memory viewer --export     # Als statisches HTML speichern
```

Sobald er geöffnet ist, drücke `r` im Terminal, um von der Festplatte neu zu laden, oder `r` / ↻ im Browser, um die Seite zu aktualisieren.

### Inline-Viewer (MCP Apps)

Rufe `memory_visualize` in jedem MCP-Apps-kompatiblen Host auf, um den Graphen inline zu rendern — kein Server nötig. Der Viewer erscheint als interaktives Panel in der Chat-Oberfläche.

### Funktionen

| Interaktion | Beschreibung |
|---|---|
| **Über einen Knoten fahren** | Tooltip mit Inhaltsvorschau, Qualität und Zugriffsanzahl anzeigen |
| **Knoten anklicken** | Auswählen + zentrieren + Nachbarn hervorheben |
| **Doppelklick auf einen Knoten** | Detail-Panel öffnen |
| **Knoten ziehen** | Manuell neu positionieren (Rechtsklick zum Lösen) |
| **Suche** | Einträge filtern; passende Knoten pulsieren mit Glühen |
| **⇿ Pfadfinder** | Zwei Knoten anklicken, um den kürzesten Pfad zu finden und hervorzuheben |
| **Zoom/Pan** | Mausrad oder +/−-Tasten |
| **⚙ Physik** | Ladung, Verbindungsabstand, Zentrumsschwerkraft anpassen |
| **Design-Umschalter** | Dunkler/heller Modus (gespeichert) |
| **Export** | Graphen als PNG oder SVG speichern |

### Screenshots

| Graphansicht | Such-Hervorhebungen | Pfadfinder | Detail-Panel |
|---|---|---|---|
| ![Full graph](docs/public/viewer/graph-full.png) | ![Search](docs/public/viewer/graph-search.png) | ![Path](docs/public/viewer/graph-path.png) | ![Detail](docs/public/viewer/graph-detail.png) |

![Viewer demo animation](docs/public/viewer/viewer-demo.gif)

### Eigene Screenshots erstellen

```bash
npm run capture:viewer
```

Erfordert [Playwright](https://playwright.dev) (`npx playwright install chromium`) und `ffmpeg`.

---

## Tipps & Best Practices

Hier sind einige Muster, die mit toon-memory gut funktionieren:

### Die „Sitzungsanfang"-Gewohnheit

Beginne jede neue Sitzung mit:
```
memory_smart_recall({ intent: "woran ich gearbeitet habe" })
```
Dies gibt deinem Agenten sofortigen Kontext über das, was vorher passiert ist — kombiniert BM25, Graph, Qualität und Decay in einem Aufruf.

### Die „Sitzungsende"-Gewohnheit

Bevor du eine Sitzung schließt, speichere alles Wichtige:
```
memory_remember({
  category: "decision",
  key: "auth-approach",
  content: "Chose JWT over sessions — stateless, works across microservices",
  file: "src/auth.ts",
  tags: "auth;architecture"
})
```
Der Eintrag erhält automatisch einen Qualitäts-Score basierend auf seiner Struktur (Tags, Inhaltsdetail, Links).

### Kategorien wählen

| Kategorie | Wann verwenden |
|-----------|----------------|
| `decision` | Architekturentscheidungen, Abwägungen, „warum X statt Y" |
| `pattern` | Konventionen, Frameworks, Code-Style-Regeln |
| `bug` | Behobene Probleme und wie sie gelöst wurden |
| `knowledge` | Projekt-Fakten, Domäneninformationen, Team-Kontext |
| `warning` | „Tu das NICHT" — Anti-Patterns, Minen, Fehler, die vermieden werden sollten (wird mit einem Boost abgerufen) |

> **Tipp:** Übertreibe es nicht. Wenn es etwas ist, das dein zukünftiges Ich (oder dein Agent) wissen möchte, speichere es. Detaillierte Einträge mit spezifischen Tags erhalten in der Qualitätsbewertung höhere Werte.

### Gut funktionierende Tags

Verwende Semikolon-getrennte Tags für einfaches Filtern:
```
tags: "redis;performance;fix"
tags: "auth;jwt;security"
tags: "api;rest;versioning"
```

> **Tipp:** Halte Tags kurz und konsistent. Es sind keine Hashtags — es sind Suchfilter. Spezifischere Tags = höherer Qualitäts-Score.

### Was NICHT gespeichert werden sollte

- Speichere nichts, das offensichtlich ist, wenn man den Code liest
- Speichere keine temporären Debugging-Notizen
- Speichere keine Geheimnisse, API-Schlüssel oder Zugangsdaten (verwende stattdessen Umgebungsvariablen)
- Dupliziere nicht dieselben Informationen mit verschiedenen Keys (Zusammenführung & Deduplizierung behandelt gleiche Keys automatisch)
- Vage Einträge ohne Tags erhalten in der Qualitätsbewertung niedrige Werte — sei spezifisch

### Halte den Speicher sauber

Führe monatlich `memory_archive()` aus, um alte Einträge zu archivieren. Führe `memory_stats()` aus, um Größe und Qualitätsverteilung zu prüfen. Einträge mit niedriger Qualität (vager Inhalt, keine Tags) erhalten automatisch eine niedrigere Priorität beim Recall. Verwende `memory_consolidate`, um Duplikate zusammenzuführen, und `mode: "versions"`, um Notizen zu archivieren, die durch neuere Bibliotheksversionen ersetzt wurden.

---

## CLI-Befehle

```bash
npx toon-memory              # Interaktiver Installer
npx toon-memory init         # Schnelleinrichtung (keine Fragen)
npx toon-memory mcp          # MCP-Server direkt starten
npx toon-memory status       # Installationsstatus prüfen
npx toon-memory stats        # Speicherstatistiken anzeigen
npx toon-memory export       # Speicher als JSON exportieren
npx toon-memory import <file> # Speicher aus JSON importieren
npx toon-memory viewer       # Öffne den Speicher-Graph-Viewer (HTTP-Server)
npx toon-memory viewer --export # Viewer als statisches HTML speichern
npx toon-memory viewer --port 3001 # Eigener Port
npx toon-memory watch [options] # Automatisches Backup mit Optionen
npx toon-memory upgrade      # Auf neueste Version aktualisieren
npx toon-memory uninstall    # Von allen Agenten entfernen
```

### Beispiele

#### Statistik

```bash
$ npx toon-memory stats

🧠 toon-memory stats

📊 Memory Stats
━━━━━━━━━━━━━━━━━━
Total entries: 45
├── decision: 12
├── pattern: 18
├── bug: 8
└── knowledge: 7
Last updated: 2026-07-10
File size: 12.4 KB
```

> **Tipp:** Wenn der Speicher zu groß wird (100+ Einträge), erwäge, alte Einträge zu archivieren oder mit `memory_forget` zu entfernen.

#### Export

```bash
$ npx toon-memory export

🧠 toon-memory export

Exported 45 entries to:
  /path/to/project/toon-memory-export.json
```

> **Tipp:** Exportiere vor größeren Refactorings. Du kannst das Backup später immer noch importieren, falls etwas schiefgeht.

#### Import

```bash
$ npx toon-memory import backup.json

🧠 toon-memory import

Imported 3 new entries
Skipped 2 duplicates
```

> **Tipp:** Duplikate werden anhand des Keys erkannt. Wenn du einen Eintrag erneut importieren möchtest, lösche zuerst den alten mit `memory_forget`.

#### Watch

```bash
$ npx toon-memory watch 15 -c -m 20

🧠 toon-memory watch

Watching memory file every 15 minutes...
Max backups: 20
Compression: enabled
Logging: disabled
Press Ctrl+C to stop

📦 Backup #1 created: 2026-07-11T16-00-00-000Z
📦 Backup #2 created: 2026-07-11T16-15-00-000Z
^C
✅ Watch stopped. 2 backups created.
```

> **Tipp:** Der Watch-Modus eignet sich hervorragend für lang laufende Sitzungen. Verwende `-c` zum Komprimieren und `-m 5`, um nur 5 Backups aufzubewahren.

**Watch-Optionen:**

| Option | Beschreibung | Standard |
|--------|-------------|----------|
| `[interval]` | Backup-Intervall in Minuten | 5 |
| `-c, --compress` | gzip-Komprimierung aktivieren | aus |
| `-l, --log [path]` | Dateiprotokollierung aktivieren | aus |
| `-m, --max-backups <n>` | Maximale aufzubewahrende Backups (0=unbegrenzt) | 10 |

---

## Konfiguration

### Interaktiver Installer (empfohlen)

```bash
npx toon-memory
```

Der Installer (benötigt ein Terminal) wird:
1. Alle 15 unterstützten Agenten mit Erkennungsstatus (`✓` Konfiguration gefunden) und ihrem unterstützten Geltungsbereich (`local/global` oder `solo local`) anzeigen
2. Dich fragen, welche konfiguriert werden sollen — nach Nummer (`1,3,5`), nach Name (`claude,codex`), `all`, Enter für alle oder `q` zum Beenden
3. Den Installationsbereich abfragen: **(1) Lokal** (Projekt: `.toon-memory` + Agenten-Konfigurationen im Repo) oder **(2) Global** (`~home`-Konfigurationen)
4. Eine Bestätigungsübersicht anzeigen (`Agent → Bereich → Pfad (MCP/Plugin/Hooks/Anleitung)`) und fragen `Fortfahren? [Y/n]`
5. MCP-Server, Anleitungsdateien und Hooks automatisch konfigurieren

> Ohne Terminal (CI/Pipes) gibt `npx toon-memory` die nicht-interaktive Installationshilfe aus. Verwende `npx toon-memory init [local|global]`, um ohne Fragen zu installieren. Unbekannte Befehle geben eine Verwendungshilfe aus und beenden mit einem Fehler.

### OpenCode

Füge zu `.opencode/opencode.json` oder `~/.config/opencode/opencode.json` hinzu:

```json
{
  "mcp": {
    "toon-memory": {
      "type": "local",
      "command": ["npx", "-y", "toon-memory", "mcp"],
      "enabled": true
    }
  }
}
```

> **Hooks werden über ein Plugin bereitgestellt**, nicht über einen übergeordneten `hooks`-Schlüssel. OpenCode 1.17+ lehnt `"Unrecognized key: hooks"` in seiner Konfiguration ab — `toon-memory init` schreibt stattdessen `.opencode/plugins/toon-memory.ts`. Füge kein `hooks` zu `opencode.json` hinzu.

### Claude Code

Füge zu `.mcp.json` (Projektroot) hinzu:

```json
{
  "mcpServers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

### VS Code / Copilot

Füge zu `.vscode/mcp.json` hinzu:

```json
{
  "servers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

### Codex CLI

Füge zu `.codex/config.toml` hinzu:

```toml
[mcpServers.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
```

### Gemini CLI

Füge zu `.gemini/settings.json` hinzu:

```json
{
  "mcpServers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

### Zed

Füge zu `~/.config/zed/settings.json` hinzu:

```json
{
  "mcp_servers": {
    "toon-memory": {
      "command": "npx",
      "args": ["-y", "toon-memory", "mcp"]
    }
  }
}
```

> **Tipp:** Verwende die globale Konfiguration, wenn du den Speicher für jedes Projekt möchtest. Verwende die projektspezifische Konfiguration, wenn du ihn nur für bestimmte Projekte möchtest.

---

## Funktionsweise

1. **MCP-Server** — Läuft lokal und kommuniziert mit deinem Agenten über stdio
2. **TOON-Format** — Speichert Daten in Token-Oriented Object Notation (etwa 22,5 % weniger Token als JSON, gemessen über 16 Einträge mit gpt-tokenizer). Jeder Eintrag verfolgt automatisch Qualität (0–1) und Confidence (0–1).
3. **Projektweiter Speicher** — Jedes Projekt erhält `.toon-memory/memory/data.toon`
4. **Null Konfiguration** — Einfach installieren und verwenden

### Speicherdatei-Format

```
version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|priority|path_scope|origin|status}:
  a1b2c3d4|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10||0||0.65|1.0||0||agent|active
  e5f6g7h8|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10||0||0.55|1.0||0||agent|active
  i9j0k1l2|bug|redis-pool-fix|Added max_connections=20 (see [[use-zod]])|redis.ts|redis;fix|2026-07-10|7d|0|use-zod|0.70|0.9||0||agent|active
summaries:
  src/services/redis.ts: Redis connection pool with retry logic
```

### Dateistruktur

```
.toon-memory/
├── memory/
│   ├── data.toon        # Haupt-Speicherdatei
│   ├── archive.toon     # Archivierte Einträge (>30 Tage)
│   ├── config.json      # Verschlüsselungseinstellungen
│   └── backups/         # Watch-Modus-Backups
│       ├── backup-2026-07-11T16-00-00-000Z.toon
│       └── backup-2026-07-11T16-10-00-000Z.toon
└── hooks/
    ├── session-start-claude.sh
    ├── session-start-codex.sh
    ├── session-start-gemini.sh
    └── session-start-antigravity.sh
```

---

## Warum TOON?

TOON (Token-Oriented Object Notation) ist für LLMs konzipiert:

| Format | Token (16 Einträge) |
|--------|---------------------|
| JSON | 1097 |
| **TOON** | **850** |

Gemessen mit `gpt-tokenizer` (cl100k_base) über 16 repräsentative Speichereinträge — siehe `scripts/benchmark-toon.mjs` (`npm run bench`).

Die Token-Einsparungen addieren sich zur Sitzungszeit: `npm run bench:impact` simuliert die Abfrage von Kontext **mit vs. ohne** Speicher und misst etwa 68 % weniger Token, um denselben Kontext zu erhalten (Recall `compact` statt erneutes Lesen von Quelldateien). Das vollständige Sitzungs-Benchmark (`npm run bench:full`) zeigt **80 % weniger Werkzeugaufrufe** und **47 % weniger Token** mit context_*-Werkzeugen.

- **22,5 % weniger Token** als JSON auf Dateiebene (bis zu 30,5 % bei einem einzelnen Eintrag)
- **Verlustloser Roundtrip** — Kein Datenverlust
- **Bessere LLM-Verarbeitung** — Strukturiert für KI-Konsum
- **Qualität & Confidence** — Jeder Eintrag verfolgt automatisch Strukturqualität (0–1) und Zuverlässigkeit (0–1)

> **Tipp:** Weniger Token = schnellere Antworten + niedrigere API-Kosten. Dein Agent liest Speicherdateien bei jedem Sitzungsstart, daher ist Effizienz wichtig.

---

## Benchmark: toon-memory vs. Alternativen

| Funktion | toon-memory | @modelcontextprotocol/server-memory | mem0 | shodh-memory |
|----------|-------------|--------------------------------------|------|--------------|
| **Speicher** | Lokale Datei (TOON) | Lokale Datei (JSON) | Cloud | RocksDB |
| **Abhängigkeiten** | Keine | Keine | Cloud-API | sentence-transformers, RocksDB |
| **Suche** | BM25 + Graph + Qualität | Einfache Stichwortsuche | Nur Vektor | Hybrid (Vektor + Graph) |
| **Token-Effizienz** | 22,5 % weniger als JSON | Basis (JSON) | N/A (Cloud) | Ähnlich |
| **Qualitätsbewertung** | Automatisch (0–1, Heuristiken) | Keine | Keine | BND-Algorithmus |
| **Zusammenführung & Deduplizierung** | Tag-Vereinigung + max Confidence | Keine | Keine | Inhalts-Deduplizierung |
| **Confidence-Verfolgung** | Pro Eintrag (0–1) | Keine | Keine | Pro Eintrag |
| **System-Primer** | Automatisch generiert | Keine | Keine | Keine |
| **Mehrzellen-Unterstützung** | Dateibasierte Koordination | Keine | N/A | Keine |
| **Hooks** | 15 Agenten | Keine | Keine | Nur Claude |
| **Verschlüsselung** | AES-256-GCM | Keine | Cloud-verwaltet | Keine |
| **Einrichtungszeit** | `npx toon-memory` | Manuelles JSON | Cloud-Registrierung | Docker + Konfiguration |

### Token-Effizienz (gemessen)

```
Format          Token (16 Einträge)   vs. JSON
──────────────  ───────────────────   ───────
JSON            1097                  Basis
TOON            850                   -22,5%
```

### Recall-Effizienz (gemessen)

```
Methode                          Token für Kontext   vs. erneutes Lesen von Dateien
───────────────────────────────  ──────────────────   ─────────────────────────────
Quelldateien erneut lesen        ~3000                Basis
memory_recall (flat)             ~1200                -60%
memory_recall (graph, compact)   ~900                 -70%
memory_smart_recall              ~850                 -72%
```

### Context-Werkzeuge-Benchmark (gemessen)

Die `context_*`-Werkzeuge ersetzen 3–6 separate Werkzeugaufrufe durch einen einzigen Aufruf und sparen sowohl Token als auch Overhead durch Werkzeugaufrufe.

```
Szenario                         Ohne     Mit     Gespart  Werkzeuge
───────────────────────────────  ────────  ──────  ───────  ────────
context_generate (vollst.)         5,556     378    93,2%   6 → 1
context_diff (inkrementell)          533     152    71,5%   4 → 1
context_focus (gezielt)              413     225    45,5%   4 → 1
context_health (Prüfung)             322     246    23,6%   5 → 1
context_export (injizierbar md)    1,178     218    81,5%   3 → 1
───────────────────────────────  ────────  ──────  ───────  ────────
GESAMT                           8,002   1,219    84,8%  22 → 5
```

**Was jedes Szenario misst:**

| Werkzeug | Ohne (manueller Pfad) | Mit (einzelner Aufruf) | Warum es spart |
|----------|----------------------|------------------------|----------------|
| `context_generate` | `package.json` + `README` + `tsconfig.json` + vollständiger Speicherdump + Speicherstatistiken + Sitzungen = 6 Aufrufe | Ein kompaktes Briefing mit allem | Eliminiert 5 redundante Lesevorgänge; Ausgabe ist dedupliziert und kompakt |
| `context_diff` | `git log` + `git diff --name-only` + `memory_diff` + Sitzungen = 4 Aufrufe | Ein inkrementeller Diff | Kombiniert Git-Zustand + Speicheränderungen in einer Ausgabe; kein Überlapp |
| `context_focus` | `memory_recall` + `findCallers` + `findRelatedFiles` + `findTestFiles` = 4 Aufrufe | Ein gezieltes Briefing | Gibt nur Relevantes zurück; kein vollständiger Speicherscan nötig |
| `context_health` | `memory_stats` + Verwaist-Scan + Duplikat-Scan + Dateireferenzvalidierung + veraltete Sitzungen = 5 Aufrufe | Ein Gesundheitsbericht | Jede Prüfung wird einmalig ausgeführt und dedupliziert; keine redundanten Abfragen |
| `context_export` | `memory_stats` + `memory_recall({ compact: true, mode: "graph" })` + manuelle Formatierung = 3 Aufrufe | Ein Markdown-Export | Formatiert Ausgabe direkt; Agent überspringt den „Als Markdown formatieren"-Schritt |

> **Tipp:** Verwende `context_generate` beim Sitzungsstart (93 % Token-Einsparung). Verwende `context_diff` für „Was hat sich seit dem letzten Mal geändert?" (72 % Einsparung). Verwende `context_focus` für tiefe Einblicke in bestimmte Themen (45 % Einsparung).

Gemessen mit `gpt-tokenizer` (cl100k_base) über realistische Projectszenarien — siehe `scripts/bench-context-tools.mjs` (`npm run bench:context`).

### Vollständige Sitzungsauswirkung (gemessen)

Simuliert eine vollständige 5-Phasen-Agentensitzung (Sitzungsstart → Debugging → Implementierung → Code-Review → Abschluss) über 3 Ansätze: ohne Speicher, mit `memory_recall` und mit context_*-Werkzeugen.

```
Phase                                  Ohne Speicher   memory_recall    context_*-Werkzeuge
─────────────────────────────────────  ──────────────  ──────────────  ───────────────────
Phase 1: Sitzungsstart                  516 t /  6 c    409 t /  3 c    373 t /  1 c
Phase 2: Problem debuggen               176 t /  4 c    182 t /  2 c    252 t /  1 c
Phase 3: Feature implementieren         189 t /  6 c    183 t /  3 c    305 t /  1 c
Phase 4: Code Review                    316 t /  4 c    130 t /  2 c    243 t /  1 c
Phase 5: Abschluss                    1,214 t /  5 c     68 t /  2 c    117 t /  1 c
─────────────────────────────────────  ──────────────  ──────────────  ───────────────────
GESAMT                                2,411 t / 25 c    972 t / 12 c  1,290 t /  5 c
```

**Wichtige Ergebnisse:**

| Metrik | Ohne Speicher | Mit memory_recall | Mit context_*-Werkzeugen |
|--------|---------------|-------------------|--------------------------|
| Token pro Sitzung | 2,411 | 972 (-60 %) | 1,290 (-47 %) |
| Werkzeugaufrufe pro Sitzung | 25 | 12 (-52 %) | **5 (-80 %)** |
| Kosten pro Sitzung (GPT-4) | $0,072 | $0,029 | $0,039 |

**Der Kompromiss:** `memory_recall` verwendet weniger Token (972 vs. 1.290), da es nur übereinstimmende Einträge zurückgibt. `context_*`-Werkzeuge liefern **reicheren Kontext** (Aufrufer, verwandte Dateien, Testdateien, Gesundheitsprüfung) — mehr Token pro Aufruf, aber **80 % weniger Werkzeugaufrufe**. In der Praxis vermeidet der Agent 3–4 nachfolgende „Verwandte suchen"-Aufrufe, die `context_focus` bereits enthält.

**Wo context_* große Vorteile bietet:**
- **Sitzungsstart** (Phase 1): 28 % weniger Token + 6→1 Aufrufe — ein Briefing ersetzt das Lesen von 6 Dateien
- **Abschluss** (Phase 5): 90 % weniger Token — `context_health` ersetzt 5 manuelle Scans
- **Werkzeugaufrufe**: 25→5 Aufrufe = **80 % weniger Latenz-Overhead** pro Sitzung

> **Tipp:** Verwende `memory_recall`, wenn du spezifische Einträge brauchst (weniger Token). Verwende `context_*`, wenn du umfassenden Kontext mit weniger Hin- und Herfahren brauchst (weniger Aufrufe).

Gemessen mit `gpt-tokenizer` (cl100k_base) — siehe `scripts/bench-full-impact.mjs` (`npm run bench:full`).

> **Tipp:** `memory_smart_recall` kombiniert BM25 + Graph + Qualität in einem Aufruf und spart sowohl Token als auch Overhead durch Werkzeugaufrufe. Verwende es am Anfang jeder Aufgabe.

### RRF-Ranking-Benchmark (gemessen)

Seit v3.7.0 rangiert Recall Ergebnisse mit **Reciprocal Rank Fusion** über BM25- (×3) und Graph-Zentralitäts-Rankings, mit einem adaptiven `k = clamp(3..60, round(sqrt(n)))`. Gemessen über 8 Gold-Standard-Queries mit handmarkierter Relevanz (siehe `scripts/bench-rrf.mjs`, `npm run bench:rrf`):

```
Metric        linear (v3.6.x)     RRF (v3.7.0)
────────────  ─────────────────   ────────────────
nDCG@10       0.776               0.776   (parity)
MRR           0.917               0.917   (parity)
```

RRF erreicht den bisherigen linearen gewichteten Score zu **null Ranking-Kosten**, während die Scoring-Pipeline vereinfacht wird (BM25×3 + Zentralität, kein Importance-/Recency-Rauschen). Die Ersetzung im Graph-Modus wird beachtet: veraltete Einträge bleiben ausgeschlossen, außer für `as_of`-Punkt-in-Zeit-Abfragen.

### Retrieval-Benchmark (LongMemEval-Stil, gemessen)

Seit v4.1.0 wird Retrieval gegen eine **eingefrorene Momentaufnahme eines echten Projektspeichers** gemessen — ein Testset im LongMemEval-Stil mit manuell verfassten Gold-Queries. Korpus: 187 echte `data.toon`-Einträge (Momentaufnahme `2026-08-01`), 42 Gold-Queries über 6 Kategorien (core-fact, temporal, knowledge-updating, multi-hop, meta/session, distractor). Der gemessene Code ist die **Produktionspipeline** (`src/lib`), mit esbuild im Speicher gebündelt — keine nachgebauten Kopien. Ein deterministischer `today`-Parameter fixiert Aktualität/Decay, sodass Ergebnisse nicht mit der Wanduhr driften können; die Läufe sind schreibgeschützt (kein Zugriffs-Tracking). Zwei Prioritäts-Meta-Einträge, die die Datendatei selbst beschreiben, sind ausgeschlossen. Siehe `benchmarks/retrieval-corpus.toon`, `benchmarks/gold-queries.json` (`npm run bench:retrieval`):

```
Mode            R@5     nDCG@5  MRR@5   answerable
─────────────   ─────   ─────   ─────   ──────────
linear         0.643   0.654   0.776   81.0%
rrf            0.861   0.764   0.788   97.6%
smart (unified) 0.829  0.739   0.760   92.5%
```

RRF ist der am höchsten gerankte Modus (0.861 R@5, 97.6 % der Queries aus den Top-5 beantwortbar); `memory_smart_recall` bleibt mit einem einzigen Aufruf konkurrenzfähig.

---

## Fehlerbehebung

### Speicher nach Installation nicht gefunden

**Symptom:** Der Agent gibt an, keine Speicherwerkzeuge zu haben.

**Lösung:**
1. Führe `npx toon-memory status` aus, um die Installation zu überprüfen
2. Starte deinen Agenten vollständig neu (schließen und wieder öffnen)
3. Prüfe, ob die MCP-Konfigurationsdatei existiert und gültiges JSON enthält

### Speicherdatei ist leer

**Symptom:** `memory_stats` zeigt 0 Einträge an.

**Lösung:** Das ist beim ersten Start normal. Beginne, `memory_remember` zum Speichern von Einträgen zu verwenden.

### Doppelte Einträge

**Symptom:** Derselbe Key erscheint mehrfach.

**Lösung:** `memory_remember` mit demselben Key führt jetzt automatisch zusammen (Tag-Vereinigung, maximaler Confidence-Wert, neuestes Datum). Verwende `memory_consolidate`, um alle Einträge mit gleichem Key zusammenzuführen und inhaltlich identische Duplikate zu entfernen. Für manuelle Bereinigung verwende `memory_forget`.

### Verschlüsselungsschlüssel verloren

**Symptom:** Speicher kann nicht entschlüsselt werden.

**Lösung:** Leider gibt es keine Wiederherstellung. Der Verschlüsselungsschlüssel wird nach der Erzeugung nirgendwo gespeichert. Dies ist aus Sicherheitsgründen so. Du musst von vorne beginnen oder von einem nicht verschlüsselten Backup wiederherstellen.

### Speicher zu groß

**Symptom:** Die Antworten des Agenten sind langsam.

**Lösung:**
1. Führe `memory_archive()` aus, um alte Einträge zu archivieren
2. Verwende `memory_forget`, um irrelevante Einträge zu entfernen
3. Halte Einträge knapp — speichere die Entscheidung, nicht das gesamte Gespräch
4. Einträge mit niedriger Qualität (vage, keine Tags) erhalten automatisch eine niedrigere Priorität beim Recall

---

## FAQ

### Funktioniert das mit jedem KI-Agenten?

Ja, solange er MCP (Model Context Protocol) unterstützt. Wir bieten Auto-Setup für 15 Agenten, mit manueller Konfiguration für weitere.

### Werden meine Daten irgendwohin gesendet?

Nein. Alles bleibt auf deinem Rechner. Der MCP-Server läuft lokal über stdio — keine Netzwerkaufrufe, kein Telemetrie, keine Cloud.

### Kann ich das über mehrere Rechner hinweg verwenden?

Ja, wenn du das Verzeichnis `.toon-memory/memory/` synchronisierst (z. B. über Git oder einen gemeinsamen Ordner). Jeder Rechner benötigt toon-memory installiert, aber die Speicherdatei ist portabel.

### Was passiert, wenn ich mehrere Projekte habe?

Jedes Projekt erhält seine eigene Speicherdatei. Speicher leckt nicht zwischen Projekten.

### Kann ich einzelne Einträge verschlüsseln?

Nein, die Verschlüsselung gilt für die gesamte Speicherdatei. Wenn du selektive Verschlüsselung benötigst, verwahre sensible Daten in einem separaten Werkzeug.

### Wie unterscheidet sich das von der Verwendung einer Markdown-Datei?

Markdown-Dateien sind nicht strukturiert, werden von deinem Agenten nicht auf dieselbe Weise durchsuchbar, integrieren sich nicht über MCP und verfügen nicht über Funktionen wie Archivierung, Datumsfilterung, Qualitätsbewertung, Zusammenführung & Deduplizierung, Confidence-Verfolgung oder Verschlüsselung. toon-memory wurde speziell für KI-Agenten entwickelt.

---

## Entwicklung

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
npm run build
npm test
```

### Projektstruktur

```
toon-memory/
├── src/
│   ├── bin/
│   │   └── toon-memory.ts      # Einstiegspunkt
│   ├── cli/
│   │   ├── setup.ts             # CLI-Befehle
│   │   └── toon-memory.ts       # CLI-Läufer
│   ├── mcp/
│   │   ├── server.ts            # MCP-Server (35 Werkzeuge + 4 Ressourcen + 1 Prompt)
│   │   ├── tools.ts             # Werkzeugregistrierung (35 Werkzeuge)
│   │   ├── resources.ts         # Ressourcenregistrierung (4 Ressourcen)
│   │   ├── prompts.ts           # Prompt-Registrierung (1 Prompt)
│   │   ├── session-store.ts     # Sitzungsebene (Auto-Promote, Bereinigung)
│   │   ├── memory-io.ts         # Lesen/Schreiben der Speicherdatei
│   │   ├── entries.ts           # Eintrags-Parsing & Hilfsfunktionen
│   │   ├── scoring.ts           # Eintragsbewertung & Zugriffsverfolgung
│   │   ├── archive.ts           # Archivverwaltung
│   │   ├── consolidation.ts     # Duplikat-Konsolidierung
│   │   ├── config.ts            # Laden & Speichern der Konfiguration
│   │   └── crypto.ts            # AES-256-GCM-Verschlüsselung
│   ├── lib/
│   │   ├── lock.ts              # Beratender Dateilock + atomares Schreiben
│   │   ├── sessions.ts          # Mehrzellen-Koordination
│   │   ├── graph.ts             # Speicher-Graph (parsen, aufbauen, BM25, Zentralität, kompakte Darstellung)
│   │   ├── quality.ts           # Qualitätsbewertung, Zusammenführung & Deduplizierung, Smart Recall, System-Primer
│   │   ├── context.ts           # Kontextbriefing-Generator (Kontext mit einem Aufruf)
│   │   └── vocab.ts             # Projektvokabular-Entdeckung aus Abhängigkeiten
├── tests/
│   ├── cli.test.ts              # CLI-Tests
│   ├── memory.test.ts           # Speicher-Tests
│   ├── sessions.test.ts         # Mehrzellen-Tests
│   ├── graph.test.ts            # Speicher-Graph-Tests
│   └── quality.test.ts          # Qualitätsbewertung, Zusammenführung & Deduplizierung, Smart Recall, System-Primer-Tests
├── .github/workflows/
│   ├── ci.yml                   # CI (Node.js 20/22)
│   └── publish.yml              # Automatische Veröffentlichung bei Release
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Beitragen

Beiträge sind willkommen! Bitte lies zuerst unseren [Verhaltenskodex](CODE_OF_CONDUCT.md) und unseren [Beitragsleitfaden](CONTRIBUTING.md).

1. Forke das Repository
2. Erstelle deinen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'feat: add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

---

## Sicherheit & Datenschutz

toon-memory ist mit Sicherheit und Datenschutz als Kernprinzip konzipiert.

- **100 % lokale Speicherung** — Der gesamte Speicher wird lokal auf deinem Rechner in `.toon-memory/memory/` gespeichert. Es werden niemals Daten an externe Server, Cloud-Dienste oder Dritte gesendet.
- **Keine Telemetrie** — Das Projekt hat keinerlei Telemetrie, Analytik oder Tracking. Es werden keine Nutzungsdaten erfasst.
- **Keine Remote-Codeausführung** — toon-memory läuft als standardmäßiger MCP-Server über stdio. Es lädt, führt oder bewertet keinen Remote-Code.
- **Verschlüsselung im Ruhezustand** — Optionale AES-256-GCM-Verschlüsselung für die gesamte Speicherdatei. Aktiviere sie mit `memory_encrypt` (erfordert die Umgebungsvariable `TOON_MEMORY_KEY`).
- **Der Verschlüsselungsschlüssel wird nie gespeichert** — Der Verschlüsselungsschlüssel muss über eine Umgebungsvariable bereitgestellt werden und wird von toon-memory niemals persistiert. Wenn er verloren geht, können Daten nicht wiederhergestellt werden.
- **Projektweise Isolierung** — Jedes Projekt hat seine eigene isolierte Speicherdatei. Speicher leckt nicht zwischen Projekten.
- **Automatisches `.gitignore`** — Der Installer fügt `.toon-memory/memory/` zur `.gitignore` hinzu, um versehentliche Commits von Speicherdaten zu verhindern.

---

## Lizenz

MIT

---

## Danksagung

Erstellt mit [@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon) und [@modelcontextprotocol/server](https://www.npmjs.com/package/@modelcontextprotocol/server).
