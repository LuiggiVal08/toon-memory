[English](README.md) | [Español](README.es.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português (BR)](README.pt-br.md) | [Deutsch](README.de.md) | [Français](README.fr.md)

# toon-memory

> AIコーディングエージェント向けのMCPメモリサーバー — セッション間で意思決定、パターン、バグを記憶します。

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://luiggival08.github.io/toon-memory/)

---

## 目次

- [toon-memoryとは？](#toon-memoryとは)
- [ブログ記事](#ブログ記事)
- [主な機能](#主な機能)
- [クイックスタート](#クイックスタート)
- [対応エージェント一覧](#対応エージェント一覧)
- [MCPツール](#mcpツール)
- [マルチセッション連携](#マルチセッション連携)
- [メモリグラフ（グラフベースのリコール）](#メモリグラフグラフベースのリコール)
- [ヒントとベストプラクティス](#ヒントとベストプラクティス)
- [CLIコマンド](#cliコマンド)
- [設定方法](#設定方法)
- [仕組み](#仕組み)
- [なぜTOONなのか？](#なぜtoonなのか)
- [トラブルシューティング](#トラブルシューティング)
- [よくある質問](#よくある質問)
- [開発](#開発)
- [コントリビューション](#コントリビューション)
- [ライセンス](#ライセンス)

---

## toon-memoryとは？

AIエージェントが昨日のセッションの内容を全て忘れてしまう経験はありますか？同じアーキテクチャの意思決定を3回目の説明しても、すでに却下したアプローチを再び提案されてしまう……

**toon-memoryはこの問題を解決します。** エージェントに永続的なメモリを与え、再起動後もデータが残るため、プロジェクトについて学び続けることができます。

📖 **[ドキュメントを読む](https://luiggival08.github.io/toon-memory/)**

### 実践ユースケース

| シナリオ | toon-memoryの活用方法 |
|----------|----------------------|
| 設計の議論 | "pub/subサポートが理由でRedisを選んだ" |
| フレームワーク選定 | "このプロジェクトはバリデーションにZodを使用しており、Joiではない" |
| バグ修正 | "Redisプール枯渇 — 修正はmax_connections=20" |
| アーキテクチャメモ | "ブローカーサービスはHTTPではなくRESPプロトコルを使用" |
| オンボーディング | "デプロイスクリプトはscripts/deploy.shにある" |
| チーム情報 | "PR #142はキャッシュ変更を reverted — 再追加しないこと" |

---

## ブログ記事

[toon-memoryでAIエージェントを賢くする方法](https://luiggival08.github.io/toon-memory/blog)で、永続メモリの実際のデモをご覧ください。

---

## 主な機能

- **29個のMCPツール** — Model Context Protocolによる完全なメモリ管理。`memory_smart_recall`（統一リコール）、マルチセッション連携用の`memory_sessions`、ワンコールでコンテキストを生成する`context_*`ツール（ブリーフィング、差分、フォーカス、ヘルス監査、エクスポート）を含みます
- **MCPリソース** — ツール呼び出しせずにメモリをコンテキストとして読み取れます。システムプライマー（自動生成されたナレッジマップ）を含みます
- **15のエージェントに対応** — OpenCode、VS Code、Claude Code、Cursor、Windsurf、Cline、Continue、Codex CLI、Gemini CLI、Zed、Antigravity、Aider、KiloCode、OpenClaw、Kiro
- **インタラクティブインストーラー** — メニューから設定するエージェントを選択できます
- **SessionStartフック** — Claude Code、Codex CLI、Gemini CLI、Antigravity用の自動リマインダー
- **TOONフォーマット** — JSONより22%トークン数が少ない（実測値）、LLMの理解度が向上
- **プロジェクトごとのメモリ** — 各プロジェクトに専用のメモリファイルが割り当てられます
- **ゼロコンフィグ** — インストールしてすぐに使えます
- **自動gitignore** — `.toon-memory/memory/`を自動的に`.gitignore`に追加します
- **日付フィルター** — 日付範囲でメモリを検索できます
- **自動アーカイブ** — 古いエントリ（30日以上）、有効期限切れのTTLエントリ、100件以上のエントリが自動的にアーカイブに移動されます
- **暗号化** — 機密データのAES-256-GCM暗号化
- **ウォッチモード** — N分ごとに自動バックアップ
- **メモリTTL** — エントリごとに有効期限を設定可能（7日、30日、または正確な日付）
- **タグ推論** — タグが空の場合、コンテンツからタグを自動検出（内蔵語彙＋プロジェクト依存関係）
- **メモリ差分** — 前回のセッション以降の変更を確認
- **関連エントリ** — 保存時に関連するメモリを自動提案
- **メモリグラフ** — `links`/`[[key]]`参照でエントリを接続；`memory_recall`は関係を考慮したサブグラフを展開し、より正確でトークン効率の高いリコールを実現（埋め込みなし、LLMなし）
- **トークン効率の高いリコール** — `memory_recall({ compact: true })`で数値インデックス付きエントリを返し、`id`/`date`/`file`を省略し、グラフエッジを`->2`として描画し、グラフ近隣ノードをスニペットに切り詰めます
- **BM25＋中心性ランキング** — BM25関連度とグラフ中心性でリコール結果を再ランキング（ハブはクエリワードがなくても上位に表示）；ホップごとの減衰により遠いノードのスコアが低くなります
- **依存関係からの自動タグ** — `toon-memory init`で`package.json`/`Cargo.toml`/`requirements.txt`/`go.mod`をスキャンし、プロジェクト語彙を書き込みます。依存関係を記述したエントリには自動的にタグが付与されます
- **スマートリコール** — `memory_smart_recall`はBM25＋グラフ＋減衰＋品質を1回の呼び出しで組み合わせます；LLMは各タスクの開始時にこれを呼び出します
- **品質スコア** — 各エントリに構造（タグ、リンク、コンテンツの詳細度、鮮度）に基づいて0〜1の品質スコアが自動付与されます；高品質なエントリが優先的に表示されます
- **マージ・重複排除** — 同じ`key`で保存すると、上書きではなく属性をマージします（タグの和集合、最大信頼度、最新日付、リンクの結合）
- **信頼度スコア** — 各エントリは信頼性を追跡します：ユーザー宣言=1.0、推論=0.65〜0.75
- **コンテキスト生成ツール** — `context_generate`（完全ブリーフィング）、`context_diff`（インクリメンタル）、`context_focus`（特定ターゲット）、`context_health`（監査）、`context_export`（マークダウン）— それぞれ5〜6回の手動ツール呼び出しに相当。LLM不使用、純粋な決定論的集約
- **システムプライマー** — MCPリソースとして公開される自動生成ナレッジマップ；エージェントはセッション開始時に読み込み、即座にコンテキストを入手します

---

## クイックスタート

### 1. インストール

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex

# またはnpmでインストール（全プラットフォーム対応）
npm i -g toon-memory
```

> **ヒント:** npmインストールが最も信頼性の高い方法です。curl/irmスクリプトは簡易ラッパーです。

### 2. エージェントを設定する

```bash
# インタラクティブインストーラー — エージェントを検出しMCPを設定
npx toon-memory
```

インストーラーは以下を行います：
1. インストールされているAIエージェントを検出
2. 設定するエージェントを選択
3. MCPサーバー設定を自動追加

### 3. 使い始める

これで完了です！次のエージェントセッションで試してください：

```bash
memory_stats      # メモリの内容を確認
memory_recall     # ファイルを読む前にメモリを検索
memory_remember   # 重要な意思決定を保存
```

> **ヒント:** セッションの開始時に必ず`memory_recall`を実行してください。エージェントは直前のセッションのコンテキストを即座に入手できます。

---

## 対応エージェント一覧

| エージェント | 設定ファイルの場所 | フォーマット | フック | 自動セットアップ |
|-------|-----------------|--------|-------|------------|
| **OpenCode** | `.opencode/opencode.json` + `.opencode/plugins/toon-memory.ts` | プラグイン | SessionStart（プラグイン方式、トップレベル`hooks`なし） | ✅ |
| **VS Code / Copilot** | `.vscode/mcp.json` | JSON | — | ✅ |
| **Claude Code** | `.mcp.json` (MCP) + `.claude/settings.json` (hooks) | JSON | SessionStart + PostToolUse + Stop | ✅ |
| **Cursor** | `.cursor/mcp.json` | JSON | — | ✅ |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | JSON | — | ✅ |
| **Cline** | `.cline/mcp.json` | JSON | — | ✅ |
| **Continue** | `.continue/config.json` | JSON | — | ✅ |
| **Codex CLI** | `.codex/config.toml` | TOML | SessionStart + PostToolUse + Stop（`[[hooks]] event=`） | ✅ |
| **Gemini CLI** | `.gemini/settings.json` | JSON | SessionStart + PostToolUse + Stop（`hooks.*`） | ✅ |
| **Zed** | `~/.config/zed/settings.json` | JSONC | — | ✅ |
| **Antigravity** | `.agents/mcp_config.json` + `.agents/hooks.json` | hooks.json | PreInvocation + PostToolUse + Stop（SessionStartイベントなし） | ✅ |
| **Aider** | — | — | — | 📝 手動設定 |
| **KiloCode** | `~/.kilocode/mcp_settings.json` | JSON | — | ✅ |
| **OpenClaw** | `.openclaw.json` | JSON | — | ✅ |
| **Kiro** | `.kiro/settings/mcp.json` | JSON | — | ✅ |

> **ヒント:** 複数のエージェントに同時にtoon-memoryを設定できます。各エージェントは`.toon-memory/memory/`に同じ共有メモリファイルを使用します。

---

## MCPツール

| ツール | 説明 |
|------|-------------|
| `memory_remember` | 意思決定、パターン、バグ、ナレッジを保存（TTL任意、自動タグ推論、`links`でメモリグラフを構築、同一キーのマージ・重複排除、品質スコアと信頼度の自動付与） |
| `memory_recall` | メモリを検索（ファイルを読む前に使用。期限切れTTLをフィルタリング）。`mode: "graph"`で関係を考慮したサブグラフを展開し精度向上。`compact: true`でトークン効率の高い数値インデックス形式を返却。品質重み付きランキング |
| `memory_smart_recall` | **統一リコール**：BM25＋グラフ＋減衰＋品質を1回の呼び出しで実行。各タスクの開始時に使用。コンパクトでトークン効率の高い出力 |
| `memory_forget` | キーまたはIDでエントリを削除 |
| `memory_stats` | メモリの状態を確認（TTL統計と品質分布を含む） |
| `memory_summary` | ファイルのサマリを保存/取得 |
| `memory_archive` | 古いエントリ（30日以上）と期限切れTTLエントリをアーカイブ |
| `memory_diff` | 指定日以降の変更を表示（24h、7d、または正確な日付） |
| `memory_suggest` | 指定コンテキストに関連するエントリを検索 |
| `memory_encrypt` | AES-256-GCM暗号化を有効化 |
| `memory_decrypt` | 暗号化を無効化 |
| `memory_backup` | メモリファイルのタイムスタンプ付きバックアップを作成（最新10件に自動整理） |
| `memory_captured` | フックで自動キャプチャされたアクティビティを表示（オプトイン）またはログをクリア |
| `memory_consolidate` | マージ・重複排除：同一キーのエントリをマージ（タグの和集合、最大信頼度、最新日付）、その後コンテンツが完全に一致する重複を削除（決定論的、LLM不使用） |
| `memory_sessions` | アクティブなエージェントセッションを表示（ブランチ、ファイル、最終確認時刻）並列作業時のソフトコンフリクトを検出 |
| `memory_compress` | LLM 駆動の2段階圧縮：要約 + 上書き。Anthropic/OpenAI CLI が利用可能な場合は使用 |
| `memory_compress_all` | 一括圧縮：100 トークン未満のすべてのエントリを圧縮バージョンで上書き。決定的、LLM 不要 |
| `memory_primer` | 1 回呼び出しのコンテキストプライマー：主要メモリ + カテゴリ + セッションファイル変更。セッション開始時に自動注入 |
| `memory_merge_sessions` | ファイルの並列セッション間でオブザベーションをマージ。重複排除し、自動昇格 |
| `memory_export_gist` | エントリを GitHub Gist（公開/非公開）にエクスポート。GITHUB_TOKEN または gh CLI を使用 |
| `memory_import_gist` | GitHub Gist からエントリをインポート。既存エントリとマージ（タグ联合、最大信頼度） |
| `memory_merge_similar` | 語彙類似度>50%（Jaccard）のエントリを見つけて決定論的にマージ |
| `memory_graph_path` | ナレッジグラフ内の2つのエントリ間のBFS最短経路 |
| `context_brief` | **ワンコールコンテキストブリーフィング**：メモリ＋セッション＋ヘルスをコンパクトマークダウンで提供。5〜6回の個別`memory_*`呼び出しの代替。LLM不使用、純粋な決定論的集約 |
| `context_generate` | **完全プロジェクトブリーフィング**：プロジェクト構造、git状態、メモリエントリ、アクティブセッションを1回の呼び出しで統合。5〜6回の手動ツール呼び出しの代替 |
| `context_diff` | **インクリメンタルブリーフィング**：gitコミット＋変更ファイル＋新規/更新メモリ＋前回セッション以降のアクティブセッション |
| `context_focus` | **高度にフォーカスされたブリーフィング**：クエリにのみ関連するメモリ＋関連ソースファイル＋呼び出し元＋テストファイル |
| `context_health` | **メモリヘルス監査**：孤立リンク、重複、壊れたファイル参照、期限切れTTL、古いセッション、スコア0〜100 |
| `context_export` | **メモリをマークダウンとしてエクスポート**：システムプロンプト向けの注入可能なコンテキスト（完全版またはコンパクト版） |

### MCPリソース

メモリはMCPリソースとして直接コンテキスト読み取り用に公開されています：

| リソース | URI | 説明 |
|----------|-----|-------------|
| メモリエントリ | `toon://memory/entries` | メモリの完全ダンプ |
| メモリ統計 | `toon://memory/stats` | カテゴリ件数とTTL情報 |
| システムプライマー | `toon://memory/summaries` | 自動生成されたナレッジマップ（トップエントリ、カテゴリ、パターン） |

### 使用例

#### 意思決定を保存する

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

> **ヒント:** `validation`のような曖昧なキーではなく、`use-zod`のような具体的なキーを付けてください。エージェントはキーとコンテンツで検索するため、具体的な名前が役立ちます。同じキーで保存すると自動的にマージされます（タグの和集合、最大信頼度）。

#### TTL付きで保存する

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

> **ヒント:** デッドライン、スプリント情報、時間依存のメモなど一時的なコンテキストにはTTLを使用してください。期限切れのTTLエントリは検索結果から自動的にフィルタリングされます。

#### 自動推論タグ

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

> **ヒント:** `tags`を空のままにすると、システムが20以上のカテゴリ（redis、auth、api、db、securityなど）の内蔵語彙と、`init`時に依存関係から生成されたプロジェクト語彙を使用して自動的にタグを推論します。プロジェクトが`redis`に依存している場合、"redis"を含むエントリには`redis`タグが自動付与されます。

#### メモリを検索する

```typescript
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **ヒント:** ファイルを読む前に検索してください。トークンを節約でき、コードだけでは得られないコンテキストをエージェントに提供できます。品質重み付きランキングにより、最も有用なエントリが優先的に表示されます。より包括的な結果が必要な場合は`memory_smart_recall`をご利用ください。

#### 日付フィルター付きで検索する

```typescript
memory_recall({
  query: "redis",
  from_date: "2026-07-01",
  to_date: "2026-07-31"
})
```

> **ヒント:** いつ起きたかは覚えているが正確な内容が思い出せない場合に日付フィルターを使用してください。品質重み付きランキングは引き続き適用されます。

#### 古いエントリをアーカイブする

```typescript
memory_archive()
// 📦 Archivadas 5 entradas antiguas
// 📋 Quedan 42 entradas activas
```

> **ヒント:** 定期的に実行してメモリをコンパクトに保ちましょう。アーカイブされたエントリは日付フィルター付きの`memory_recall`で引き続き検索可能です。期限切れのTTLエントリも自動的にアーカイブされます。低品質なエントリはリコール優先度が自動的に下がります。

#### 前回のセッション以降の変更を表示する

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

> **ヒント:** セッション開始時に`memory_diff`を実行して、前回の作業以降にエージェントが学んだ内容を確認してください。新規エントリには品質スコアが含まれます。

#### 関連エントリを検索する

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

> **ヒント:** トピックに関するコンテキストが必要だが何を検索すべきか分からない場合に`memory_suggest`を使用してください。より包括的な結果が必要な場合は`memory_smart_recall`をご利用ください。

#### スマートリコール（統一）

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

> **ヒント:** 各タスクの開始時に`memory_smart_recall`を使用してください。BM25＋グラフ＋減衰＋品質を1回の呼び出しで組み合わせます — 何を検索すべきか考える必要がありません。

#### 完全プロジェクトブリーフィング（ワンコール）

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

> **ヒント:** セッション開始時に`context_generate`を使用すると、1回の呼び出しで完全なコンテキストを取得できます。5〜6回の個別ツール呼び出しの代替になります。

#### メモリヘルス監査

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

> **ヒント:** メモリが散らかってきた時に`context_health`を実行してください。孤立リンク、重複、期限切れTTLエントリ、壊れたファイル参照を表示します。

#### マージ・重複排除（自動）

同じ`key`で保存すると、上書きではなく属性がマージされます：

```typescript
// 最初の保存
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  tags: "types"
})
// 🧠 Guardado: decision/use-zod (a1b2c3d4)

// 同じキーで後から保存 — 自動マージ
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

> **ヒント:** 記述的で安定したキーを使用してください。同じキー=マージ、異なるキー=新規エントリ。

#### 品質スコア

各エントリには構造に基づいて自動的に品質スコア（0〜1）が付与されます：

| 要因 | 重み | 測定内容 |
|--------|--------|------------------|
| タグ | 最大0.3 | より具体的なタグ＝より高い品質 |
| リンク | 最大0.2 | 接続されたエントリ＝より高い品質 |
| コンテンツ長さ | 最大0.3 | 詳細な内容 ＞ 曖昧な内容 |
| 鮮度 | 最大0.1 | 新しいエントリほどスコアが高い |
| 特異性 | 最大0.1 | ユニークな単語の割合 |

高品質なエントリはリコール時に優先的に表示されます。`memory_stats`で品質を確認できます：

```typescript
memory_stats()
// ...
// Calidad promedio: 0.58 (12 con score)
```

#### 信頼度スコア

各エントリは情報の信頼性を追跡します：

| ソース | 信頼度 | 意味 |
|--------|-----------|---------|
| ユーザーの宣言 | 1.0 | 「Postgresを使っている」 — 直接的な記述 |
| 推論 | 0.65〜0.75 | エージェントがコンテキストから推論 |
| 不確実 | 0.50 | エージェントが推測 |

信頼度はマージ時にも保持されます（両エントリの最大値）。

#### システムプライマー

システムプライマーはMCPリソースとして公開される自動生成ナレッジマップです。エージェントはセッション開始時に読み込み、即座にコンテキストを入手します：

```typescript
// Exposed as toon://memory/summaries
// Auto-regenerates on every read
// Contains: top entries, categories, patterns
```

> **ヒント:** エージェントのシステムプロンプトに`toon://memory/summaries`を追加すると、セッション開始時に即座にコンテキストを入手できます。

#### 暗号化を有効にする

```typescript
// まず、環境変数（または.envファイル）でTOON_MEMORY_KEYを設定してください：
// export TOON_MEMORY_KEY="your-secret-key-here"

memory_encrypt()
// 🔐 Encriptación habilitada
```

> **注意:** 暗号化前に`TOON_MEMORY_KEY`環境変数を設定する必要があります。安全な場所に保管してください — 万が一紛失した場合、メモリデータは永久に復元できではありません。品質スコアと信頼度は暗号化後も保持されます。

---

## マルチセッション連携

**複数のAIエージェントセッションを並列で実行する**（例：同じリポジトリで3つのOpenCodeセッションを同時に起動）場合、相互に作業を上書きしてしまうことがあります。toon-memoryには**`memory_sessions`**が同梱されており、ファイルベースの連携ツールです。各セッションが他のセッションの状況を把握でき、**サーバー、ネットワーク、LLM呼び出しなし**で動作します。

### 仕組み

- 起動時に、`SessionStart`フックが`.toon-memory/memory/sessions/<id>.json`にセッションの**ハートビートファイル**を書き込みます。各プロセスは自分のファイルのみを書き込むため、ロック競合がありません。
- ハートビートにはエージェント名、**gitブランチ**、**変更ファイル**、**最終確認時刻**が記録されます。
- 全ファイルを読み取ることで、全セッションが他セッションのアクティブ状況を共有の最終的に一貫したビューで確認できます。
- 死んだセッション（プロセスPIDが生存していない**かつ**TTLウィンドウを過ぎた古いハートビート）は遅延的に削除されます。

### `memory_sessions`ツール

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

- `conflictsOnly: true`を渡すとセッション一覧をスキップし、ソフトコンフリクトのみを表示します：
  ```typescript
  memory_sessions({ conflictsOnly: true })
  // 🔥 Conflictos suaves (1):
  //
  // ⚠️ src/types.ts
  //    ↔ opencode @ feature/auth (a1b2c3d4), claude @ feature/db (e5f6g7h8)
  ```
- **ソフトコンフリクト**は、2つ以上のアクティブセッションが同じファイルに変更を加えた場合に発生します — 同じコードを編集している可能性があるという警告です。ハードロックではなく、連携のための警告です。

### 推奨される並列セッションの習慣

1. 各セッションの開始時に、`SessionStart`フックが他のアクティブセッションとソフトコンフリクトを自動表示します。
2. `memory_smart_recall({ intent: "what I'm working on" })`を実行して完全なコンテキスト（メモリ＋グラフ＋品質）を入手します。
3. `memory_sessions()`で全体像（ブランチ、ファイル、最終確認時刻）を確認し、コンフリクトが気になる場合は`memory_sessions({ conflictsOnly: true })`を実行します。
4. 他のセッションとファイルを共有している場合は、編集前に同期して相互の変更を上書きしないようにしてください。

> **ヒント:** これは完全にローカルでロックフリーです — 好きな頻度で安全に実行できます。セッション開始時に`memory_smart_recall({ intent: "project context" })`と組み合わせると、セッション間の*メモリ*と*存在状況*の両方を把握できます。システムプライマー（MCPリソース）も即座にコンテキストを提供します。

---

## メモリグラフ（グラフベースのリコール）

メモリが増えてくると、フラットなキーワード検索では結果が多すぎたり、関係性が含まれない間違ったコンテキストが返されたりすることがあります。toon-memoryはメモリを**軽量ナレッジグラフ**として扱い、リコール時にトークン数を抑えつつ*正しい*エントリを返します。品質スコアと組み合わせることで、最も有用なエントリが優先的に表示されます。

完全に**決定論的でオフライン**です — 埋め込み、ベクトルDB、LLM、サーバーを使用しません。エッジは2つのソースから取得します：

- **明示的`links`** — エントリ保存時に宣言するキー。
- **暗黙的`[[key]]`参照** — コンテンツ内の`[[some-key]]`記述。

### 仕組み

1. `memory_remember`はエントリに`links`を保存します（スペースまたは`;`区切りのキー）。品質スコアは自動計算されます。
2. `memory_recall({ mode: "graph" })`がキーワード一致（シード）を検出し、`hops`（1または2）の範囲で**エゴサブグラフ**を展開します。
3. 関連度がシードから近隣ノードに伝播するため、クエリワードを含まない関連する意思決定や仕様も表示されます。品質重み付きランキングにより、最も有用なエントリが優先的に表示されます。
4. 結果セットは`limit`（デフォルト6）で制限されます → エージェント向けの*より小さく、より正確な*コンテキスト。統一呼び出しなら`memory_smart_recall`を使用できます。

#### links付きで保存する

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

#### グラフモードでリコールする

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

> **ヒント:** 意思決定が複数のエントリ（アーキテクチャ、仕様、関連バグ）に波及する場合は`mode: "graph"`を使用してください。単離した事実にはデフォルトの`flat`モードで十分です。自動的にグラフ＋BM25＋品質を組み合わせる`memory_smart_recall`もあります。

#### トークン効率の高いリコール（`compact`）

トークンを節約したい場合は、`compact: true`でより密な出力を得られます：

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

`compact`が出力をどのように変更するか：

- 各エントリにスコア順の安定した数値インデックス（`[1]`、`[2]`、…）が付与されます。
- `id`、`date`、`file`は省略され、`tags`のみ保持されます。
- `graph`モードではエッジが`->2`（数値、キー名ではなく）として描画されます。
- グラフ経由で到達した近隣ノード（非シード）は短いスニペットに切り詰められ、直接一致したシードは完全な内容を保持します。
- 品質重み付きランキングにより、最も有用なエントリが優先的に表示されます。
- 保存された`.toon`ファイルは**決して**変更されません — `compact`はレスポンスの再整形のみを行います。

> **ヒント:** 大規模で相互接続されたメモリからリコールする際に、`compact: true`を`mode: "graph"`と組み合わせると最もコンパクトなコンテキストウィンドウになります。自動的にこれを実行する`memory_smart_recall`もあります。

### リコールのランキング方法

リコールは決定論的でオフラインです（埋め込みなし、LLMなし）。各候補エントリには以下を組み合わせたスコアが付与されます：

- **BM25関連度** — クエリに対する古典的な確率的用語頻度スコア。`id`＋`category`＋`key`＋`content`＋`file`＋`tags`＋`quality`＋`confidence`を使用。
- **グラフ中心性** — 度数正規化（0..1）；多くのエントリに接続したハブは1に近いスコアを持ち、クエリワードがなくても上位に表示されます。
- **重要度** — 鮮度＋アクセス頻度（他の場所と同じシグナル）。
- **品質ブースト** — より高い品質スコアを持つエントリ（タグ、リンク、詳細が多い）はランキングブーストを受けます。
- **シードボーナス** — クエリに直接一致したエントリは一定のブーストを受けます。
- **ホップごとの減衰** — シードから`d`ホップ離れたノードは`0.5^d`で乗算されるため、遠いコンテキストは近くのコンテキストより下位のランキングになります。

`graph`モードでは、キーワード一致からシードを開始し、`hops`の範囲でエゴサブグラフを展開し、スコアの上位`limit`（デフォルト6）を返します。`memory_smart_recall`はこれらのシグナルをすべて1回の呼び出しで組み合わせます。

### プロジェクト依存関係からの自動タグ

`toon-memory init`でCLIが依存関係マニフェストをスキャンし、`.toon-memory/memory/config.json`に`vocab`テーブルを書き込みます：

```json
{
  "vocab": {
    "react": ["react"],
    "zod": ["zod"],
    "redis": ["redis"]
  }
}
```

`memory_remember`は新規エントリをこの語彙と内蔵語彙の両方で照合するため、コンテンツに依存関係を記述すると自動的にタグが付与されます。タグが多いほど品質スコアが高くなります。対応マニフェスト：`package.json`、`Cargo.toml`、`requirements.txt`、`pyproject.toml`、`go.mod`。

> **ヒント:** 主要な依存関係を追加した後、`toon-memory init`を再実行して語彙を更新してください。`vocab`キーは`config.json`の`encrypted`/`capture`フラグとマージされます（上書きされません）。タグが多いほど品質スコアが高くなります。

---

## ヒントとベストプラクティス

toon-memoryで効果的なパターンを紹介します。

### 「セッション開始時」の習慣

新しいセッションを始めるたびに、以下を実行します：
```
memory_smart_recall({ intent: "what I was working on" })
```
これにより、BM25、グラフ、品質、減衰を1回の呼び出しで組み合わせ、以前の出来事に関する即座のコンテキストを入手できます。

### 「セッション終了時」の習慣

セッションを閉じる前に、重要な内容を保存します：
```
memory_remember({
  category: "decision",
  key: "auth-approach",
  content: "Chose JWT over sessions — stateless, works across microservices",
  file: "src/auth.ts",
  tags: "auth;architecture"
})
```
エントリには構造（タグ、コンテンツの詳細度、リンク）に基づいて自動的に品質スコアが付与されます。

### カテゴリの選び方

| カテゴリ | 用途 |
|----------|-------------|
| `decision` | アーキテクチャの選択、トレードオフ、「なぜXではなくYなのか」 |
| `pattern` | 約束事、フレームワーク、コードスタイルルール |
| `bug` | 修正した問題とその修正方法 |
| `knowledge` | プロジェクトの事実、ドメイン情報、チーム情報 |

> **ヒント:** 深く考えすぎないでください。将来の自分（またはエージェント）が知りたいと思えば保存してください。具体的なタグを持つ詳細なエントリは品質スコアが高くなります。

### 効果的なタグの付け方

セミコロン区切りでタグを付けるとフィルタリングが容易になります：
```
tags: "redis;performance;fix"
tags: "auth;jwt;security"
tags: "api;rest;versioning"
```

> **ヒント:** タグは短く一貫性を保ってください。ハッシュタグではなく検索フィルターです。より具体的なタグ＝より高い品質スコア。

### 保存すべきでないこと

- コードを読んで明らかにわかることを保存しない
- 一時的なデバッグメモを保存しない
- シークレット、APIキー、クレデンシャルを保存しない（代わりに環境変数を使用）
- 同じ情報を異なるキーで重複して保存しない（マージ・重複排除が同一キーを自動処理）
- タグのない曖昧なエントリは品質スコアが低くなります — 具体的に記述してください

### メモリを清潔に保つ

毎月`memory_archive()`を実行して古いエントリをアーカイブに移動してください。`memory_stats()`でサイズと品質分布を確認できます。低品質なエントリ（曖昧な内容、タグなし）はリコール優先度が自動的に下がります。`memory_consolidate`で重複をマージしてください。

---

## CLIコマンド

```bash
npx toon-memory              # インタラクティブインストーラー
npx toon-memory init         # クイックセットアップ（プロンプトなし）
npx toon-memory mcp          # MCPサーバーを直接実行
npx toon-memory status       # インストール状態を確認
npx toon-memory stats        # メモリ統計を表示
npx toon-memory export       # メモリをJSONにエクスポート
npx toon-memory import <file> # JSONからメモリをインポート
npx toon-memory watch [options] # オプション付き自動バックアップ
npx toon-memory upgrade      # 最新バージョンに更新
npx toon-memory uninstall    # 全エージェントから削除
```

### 使用例

#### 統計

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

> **ヒント:** メモリが大きくなりすぎた場合（100エントリ以上）、アーカイブするか`memory_forget`で古いエントリを削除することを検討してください。

#### エクスポート

```bash
$ npx toon-memory export

🧠 toon-memory export

Exported 45 entries to:
  /path/to/project/toon-memory-export.json
```

> **ヒント:** 大規模なリファクタリングの前にエクスポートしてください。問題が発生してもバックアップからインポートできます。

#### インポート

```bash
$ npx toon-memory import backup.json

🧠 toon-memory import

Imported 3 new entries
Skipped 2 duplicates
```

> **ヒント:** 重複はキーで検出されます。エントリを再インポートしたい場合は、まず`memory_forget`で古いエントリを削除してください。

#### ウォッチ

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

> **ヒント:** ウォッチモードは長時間実行セッションに最適です。`-c`で圧縮、`-m 5`でバックアップを5件のみ保持できます。

**ウォッチオプション：**

| オプション | 説明 | デフォルト |
|--------|-------------|---------|
| `[interval]` | バックアップ間隔（分） | 5 |
| `-c, --compress` | gzip圧縮を有効化 | オフ |
| `-l, --log [path]` | ファイルログを有効化 | オフ |
| `-m, --max-backups <n>` | 保持する最大バックアップ数（0=無制限） | 10 |

---

## 設定方法

### インタラクティブインストーラー（推奨）

```bash
npx toon-memory
```

インストーラー（ターミナルが必要）は以下を行います：
1. 検出状態（`✓` 設定ファイル検出済み）と対応スコープ（`local/global`または`solo local`）付きで15の対応エージェントを表示
2. 設定するエージェントを選択 — 番号（`1,3,5`）、名前（`claude,codex`）、`all`、Enterで全選択、`q`で終了
3. インストールスコープを選択：**(1) Local**（プロジェクト：`.toon-memory`＋リポジトリ内のエージェント設定）または**(2) Global**（`~home`の設定）
4. 確認サマリー（`agent → scope → path (MCP/plugin/hooks/instructions)`）を表示し、` Proceed? [Y/n]`を確認
5. MCPサーバー、設定ファイル、フックを自動的に設定

> ターミナルがない場合（CI/パイプ）、`npx toon-memory`は非対話型インストールヘルプを表示します。`npx toon-memory init [local|global]`でプロンプトなしでインストールできます。不明なコマンドは使用方法を表示し、エラーで終了します。

### OpenCode

`.opencode/opencode.json`または`~/.config/opencode/opencode.json`に追加：

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

> **フックはプラグインで提供されます**（トップレベルの`hooks`キーではありません）。OpenCode 1.17+は設定内の`"Unrecognized key: hooks"`を拒否します — `toon-memory init`は代わりに`.opencode/plugins/toon-memory.ts`を書き込みます。`opencode.json`に`hooks`を追加しないでください。

### Claude Code

`.mcp.json`（プロジェクトルート）に追加：

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

`.vscode/mcp.json`に追加：

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

`.codex/config.toml`に追加：

```toml
[mcpServers.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
```

### Gemini CLI

`.gemini/settings.json`に追加：

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

`~/.config/zed/settings.json`に追加：

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

> **ヒント:** 全プロジェクトでメモリを使用したい場合はグローバル設定を、特定のプロジェクトのみに使用したい場合はプロジェクトレベルの設定を使用してください。

---

## 仕組み

1. **MCPサーバー** — ローカルで実行、stdio経由でエージェントと通信
2. **TOONフォーマット** — Token-Oriented Object Notationでデータを保存（JSONより約22.5%トークン数が少ない、16エントリでgpt-tokenizerを使用して実測）。各エントリは品質（0〜1）と信頼度（0〜1）を自動的に追跡します。
3. **プロジェクトごとのメモリ** — 各プロジェクトに`.toon-memory/memory/data.toon`が割り当てられます
4. **ゼロコンフィグ** — インストールしてすぐに使えます

### メモリファイルフォーマット

```
version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1b2c3d4|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10||0||0.65|1.0
  e5f6g7h8|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10||0||0.55|1.0
  i9j0k1l2|bug|redis-pool-fix|Added max_connections=20 (see [[use-zod]])|redis.ts|redis;fix|2026-07-10|7d|0|use-zod|0.70|0.9
summaries:
  src/services/redis.ts: Redis connection pool with retry logic
```

### ファイル構成

```
.toon-memory/
├── memory/
│   ├── data.toon        # メインメモリファイル
│   ├── archive.toon     # アーカイブエントリ（30日以上）
│   ├── config.json      # 暗号化設定
│   └── backups/         # ウォッチモードバックアップ
│       ├── backup-2026-07-11T16-00-00-000Z.toon
│       └── backup-2026-07-11T16-10-00-000Z.toon
└── hooks/
    ├── session-start-claude.sh
    ├── session-start-codex.sh
    ├── session-start-gemini.sh
    └── session-start-antigravity.sh
```

---

## なぜTOONなのか？

TOON（Token-Oriented Object Notation）はLLMのために設計されています：

| フォーマット | トークン数（16エントリ） |
|--------|---------------------|
| JSON | 1097 |
| **TOON** | **850** |

16の代表性あるメモリエントリで`gpt-tokenizer`（cl100k_base）を使用して実測 — `scripts/benchmark-toon.mjs`（`npm run bench`）を参照。

セッション時のトークン節約は累積効果があります：`npm run bench:impact`はメモリあり/なしでコンテキストを取得する際の約68%のトークン節約をシミュレーション（ソースファイルの再読み込みではなくリコールの`compact`を使用）。フルセッションベンチマーク（`npm run bench:full`）では、context_*ツールで**ツール呼び出し80%削減**、**トークン47%削減**を達成しています。

- ファイルレベルでJSONより**22.5%トークン数が少ない**（単一エントリでは最大30.5%）
- **ロスレスな双方向変換** — データ損失なし
- **LLMによる理解度の向上** — AI向けに構造化
- **品質と信頼度** — 各エントリが構造品質（0〜1）と信頼性（0〜1）を自動的に追跡

> **ヒント:** トークンが少ない＝レスポンスが高速＋APIコストが低減。エージェントは毎セッション開始時にメモリファイルを読むため、効率が重要です。

---

## ベンチマーク：toon-memory vs 代替手段

| 機能 | toon-memory | @modelcontextprotocol/server-memory | mem0 | shodh-memory |
|---------|-------------|--------------------------------------|------|--------------|
| **ストレージ** | ローカルファイル（TOON） | ローカルファイル（JSON） | クラウド | RocksDB |
| **依存関係** | ゼロ | ゼロ | クラウドAPI | sentence-transformers、RocksDB |
| **検索** | BM25＋グラフ＋品質 | 基本キーワード | ベクトルのみ | ハイブリッド（ベクトル＋グラフ） |
| **トークン効率** | JSONより22.5%少ない | ベースライン（JSON） | N/A（クラウド） | 類似 |
| **品質スコア** | 自動（0〜1、ヒューリスティック） | なし | なし | BNDアルゴリズム |
| **マージ・重複排除** | タグ和集合＋最大信頼度 | なし | なし | コンテンツ重複排除 |
| **信頼度追跡** | エントリごと（0〜1） | なし | なし | エントリごと |
| **システムプライマー** | 自動生成 | なし | なし | なし |
| **マルチセッション** | ファイルベース連携 | なし | N/A | なし |
| **フック** | 15エージェント | なし | なし | Claudeのみ |
| **暗号化** | AES-256-GCM | なし | クラウド管理 | なし |
| **セットアップ時間** | `npx toon-memory` | 手動JSON | クラウド登録 | Docker＋設定 |

### トークン効率（実測値）

```
フォーマット          トークン数（16エントリ）    vs JSON
──────────────  ───────────────────    ───────
JSON            1097                   ベースライン
TOON            850                    -22.5%
```

### リコール効率（実測値）

```
方法                          コンテキスト取得トークン数    vs ファイル再読み込み
─────────────────────────────  ─────────────────────    ───────────────────
ソースファイル再読み込み        ~3000                    ベースライン
memory_recall (flat)            ~1200                    -60%
memory_recall (graph, compact)  ~900                     -70%
memory_smart_recall             ~850                     -72%
```

### コンテキストツールベンチマーク（実測値）

`context_*`ツールは3〜6回の個別ツール呼び出しを1回の呼び出しに置き換え、トークンとツール呼び出しオーバーヘッドの両方を節約します。

```
シナリオ                          なし       あり     節約     ツール数
───────────────────────────────  ────────  ──────  ───────  ──────
context_generate (完全ブリーフィング)    5,556     378    93.2%   6 → 1
context_diff (インクリメンタル)            533     152    71.5%   4 → 1
context_focus (ターゲット)              413     225    45.5%   4 → 1
context_health (監査)                322     246    23.6%   5 → 1
context_export (注入可能md)      1,178     218    81.5%   3 → 1
───────────────────────────────  ────────  ──────  ───────  ──────
合計                              8,002   1,219    84.8%  22 → 5
```

**各シナリオの測定内容：**

| ツール | なし（手動パス） | あり（1回呼び出し） | なぜ節約されるか |
|------|----------------------|-------------------|-------------|
| `context_generate` | `package.json`＋`README`＋`tsconfig.json`＋メモリ完全ダンプ＋メモリ統計＋セッション = 6回呼び出し | 全部入りの1回のコンパクトブリーフィング | 5回の冗長な読み込みを排除；出力は重複排除済みでコンパクト |
| `context_diff` | `git log`＋`git diff --name-only`＋`memory_diff`＋セッション = 4回呼び出し | 1回のインクリメンタル差分 | git状態＋メモリ変更を1つの出力に統合；重複なし |
| `context_focus` | `memory_recall`＋`findCallers`＋`findRelatedFiles`＋`findTestFiles` = 4回呼び出し | 1回の特定ブリーフィング | 関連するもののみ返却；フルメモリスキャン不要 |
| `context_health` | `memory_stats`＋孤立スキャン＋重複スキャン＋ファイル参照検証＋古いセッション = 5回呼び出し | 1回のヘルスレポート | 各チェックが1回で重複排除済み；冗長なクエリなし |
| `context_export` | `memory_stats`＋`memory_recall({ compact: true, mode: "graph" })`＋手動フォーマット = 3回呼び出し | 1回のマークダウンエクスポート | 出力を直接フォーマット；エージェントが「マークダウンにフォーマット」ステップをスキップ |

> **ヒント:** セッション開始時に`context_generate`を使用（93%トークン節約）。前回からの変更確認には`context_diff`を使用（72%節約）。特定トピックの深掘りには`context_focus`を使用（45%節約）。

現実的なプロジェクトシナリオで`gpt-tokenizer`（cl100k_base）を使用して実測 — `scripts/bench-context-tools.mjs`（`npm run bench:context`）を参照。

### フルセッションへの影響（実測値）

5フェーズの完全なエージェントセッション（セッション開始→デバッグ→実装→レビュー→まとめ）を3つのアプローチ（メモリなし、`memory_recall`あり、`context_*`ツールあり）でシミュレーション：

```
フェーズ                                    メモリなし            memory_recall      context_* ツール
─────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
Phase 1: セッション開始                    516 t /  6 c       409 t /  3 c       373 t /  1 c
Phase 2: 問題デバッグ                      176 t /  4 c       182 t /  2 c       252 t /  1 c
Phase 3: 機能実装                          189 t /  6 c       183 t /  3 c       305 t /  1 c
Phase 4: コードレビュー                    316 t /  4 c       130 t /  2 c       243 t /  1 c
Phase 5: まとめ                          1,214 t /  5 c        68 t /  2 c       117 t /  1 c
─────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
合計                                   2,411 t / 25 c       972 t / 12 c     1,290 t /  5 c
```

**主な結果：**

| 指標 | メモリなし | memory_recallあり | context_*ツールあり |
|--------|---------------|-------------------|---------------------|
| セッションあたりトークン数 | 2,411 | 972（-60%） | 1,290（-47%） |
| セッションあたりツール呼び出し数 | 25 | 12（-52%） | **5（-80%）** |
| セッションあたりコスト（GPT-4） | $0.072 | $0.029 | $0.039 |

**トレードオフ：** `memory_recall`は一致エントリのみを返すためトークン数が少ない（972 vs 1,290）。`context_*`ツールは**より豊かなコンテキスト**（呼び出し元、関連ファイル、テストファイル、ヘルス監査）を返します — 1回あたりのトークン数は多いですが、**ツール呼び出しを80%削減**。実際には、エージェントは`context_focus`がすでに含む3〜4回のフォローアップ「関連検索」呼び出しを回避できます。

**context_*が大きく優れる場面：**
- **セッション開始**（フェーズ1）：トークン28%削減＋6→1回呼び出し — 6ファイルの読み込みが1回のブリーフィングに
- **まとめ**（フェーズ5）：トークン90%削減 — `context_health`が5回の手動スキャンを置換
- **ツール呼び出し**：25→5回呼び出し = セッションあたり**レイテンシオーバーヘッド80%削減**

> **ヒント:** 特定のエントリが必要な場合は`memory_recall`を使用（トークン数が少ない）。包括的なコンテキストで呼び出し回数を減らしたい場合は`context_*`を使用（呼び出し回数が少ない）。

`gpt-tokenizer`（cl100k_base）を使用して実測 — `scripts/bench-full-impact.mjs`（`npm run bench:full`）を参照。

> **ヒント:** `memory_smart_recall`はBM25＋グラフ＋品質を1回の呼び出しで組み合わせ、トークンとツール呼び出しオーバーヘッドの両方を節約します。各タスクの開始時に使用してください。

---

## トラブルシューティング

### インストール後にメモリが見つからない

**症状：** エージェントがメモリツールを持っていないと言う。

**修正方法：**
1. `npx toon-memory status`を実行してインストールを確認
2. エージェントを完全に再起動（閉じて再度開く）
3. MCP設定ファイルが存在し、有効なJSONであることを確認

### メモリファイルが空

**症状：** `memory_stats`で0件と表示される。

**修正方法：** 初回インストールでは正常です。`memory_remember`を使用してエントリを保存し始めましょう。

### 重複エントリ

**症状：** 同じキーが複数回表示される。

**修正方法：** 同じキーでの`memory_remember`は自動的にマージされます（タグの和集合、最大信頼度、最新日付）。`memory_consolidate`で全同一キーエントリをマージし、コンテンツが完全に一致する重複を削除できます。手動で整理する場合は`memory_forget`を使用してください。

### 暗号化キーを紛失

**症状：** メモリを復号できない。

**修正方法：** 残念ながら、復元はできません。暗号化キーは生成後にどこにも保存されません。これはセキュリティ上の設計です。新しく作り直すか、暗号化されていないバックアップから復元する必要があります。

### メモリが大きすぎる

**症状：** エージェントのレスポンスが遅い。

**修正方法：**
1. `memory_archive()`を実行して古いエントリをアーカイブに移動
2. `memory_forget`で無関係なエントリを削除
3. エントリを簡潔に保つ — 会話全体ではなく意思決定を保存
4. 低品質なエントリ（曖昧、タグなし）はリコール優先度が自動的に下がります

---

## よくある質問

### 任意のAIエージェントで使用できますか？

はい、MCP（Model Context Protocol）をサポートしていれば使用可能です。15のエージェントに対応した自動セットアップがあり、他のエージェントには手動設定が利用可能です。

### データは外部に送信されますか？

いいえ。すべてローカルに保持されます。MCPサーバーはstdio経由でローカルで動作します — ネットワーク通信、テレメトリ、クラウドは一切ありません。

### 複数のマシンで使用できますか？

はい、`.toon-memory/memory/`ディレクトリを同期すれば（例：Gitや共有フォルダ）使用可能です。各マシンにtoon-memoryのインストールが必要ですが、メモリファイルは移植可能です。

### 複数のプロジェクトがある場合はどうなりますか？

各プロジェクトに専用のメモリファイルが割り当てられます。プロジェクト間でメモリが漏れることはありません。

### 特定のエントリのみ暗号化できますか？

いいえ、暗号化はメモリファイル全体に適用されます。選択的な暗号化が必要な場合は、機密データを別のツールに保管してください。

### 単にマークダウンファイルを使用するのと何が違うのですか？

マークダウンファイルは構造化されておらず、エージェントによる同様の検索が難しく、MCPを介した統合もできず、アーカイブ、日付フィルタリング、品質スコア、マージ・重複排除、信頼度追跡、暗号化などの機能もありません。toon-memoryはAIエージェント専用に構築されています。

---

## 開発

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
npm run build
npm test
```

### プロジェクト構成

```
toon-memory/
├── src/
│   ├── bin/
│   │   └── toon-memory.ts      # エントリポイント
│   ├── cli/
│   │   ├── setup.ts             # CLIコマンド
│   │   └── toon-memory.ts       # CLIランナー
│   ├── mcp/
│   │   └── server.ts            # MCPサーバー（29ツール＋3リソース）
│   ├── lib/
│   │   ├── lock.ts              # アドバイザリファイルロック＋アトミックライト
│   │   ├── sessions.ts          # マルチセッション連携
│   │   ├── graph.ts             # メモリグラフ（パース、構築、BM25、中心性、コンパクト描画）
│   │   ├── quality.ts           # 品質スコア、マージ・重複排除、スマートリコール、システムプライマー
│   │   ├── context.ts           # コンテキストブリーフィングジェネレーター（ワンコールコンテキスト）
│   │   └── vocab.ts             # 依存関係からのプロジェクト語彙ディスカバリー
├── tests/
│   ├── cli.test.ts              # CLIテスト
│   ├── memory.test.ts           # メモリテスト
│   ├── sessions.test.ts         # マルチセッションテスト
│   ├── graph.test.ts            # メモリグラフテスト
│   └── quality.test.ts          # 品質スコア、マージ・重複排除、スマートリコール、システムプライマーテスト
├── .github/workflows/
│   ├── ci.yml                   # CI（Node.js 20/22）
│   └── publish.yml              # リリース時に自動公開
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## コントリビューション

コントリビュートは大歓迎です！まず[行動規範](CODE_OF_CONDUCT.md)と[コントリビューションガイド](CONTRIBUTING.md)をお読みください。

1. リポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'feat: add amazing-feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

---

## ライセンス

MIT

---

## クレジット

[@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon) と [@modelcontextprotocol/server](https://www.npmjs.com/package/@modelcontextprotocol/server) で構築。
