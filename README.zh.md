[English](README.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português (BR)](README.pt-br.md) | [Deutsch](README.de.md) | [Français](README.fr.md)

# toon-memory

> 面向 AI 编程助手的 MCP 记忆服务器 — 在会话之间记住决策、模式和 Bug。

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://luiggival08.github.io/toon-memory/)

---

## 目录

- [什么 是 toon-memory？](#什么-是-toon-memory)
- [博客文章](#博客文章)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [支持的 Agent](#支持的-agent)
- [MCP 工具](#mcp-工具)
- [多会话协调](#多会话协调)
- [记忆图谱（基于图的召回）](#记忆图谱基于图的召回)
- [技巧与最佳实践](#技巧与最佳实践)
- [CLI 命令](#cli-命令)
- [配置](#配置)
- [工作原理](#工作原理)
- [为什么选择 TOON？](#为什么选择-toon)
- [故障排除](#故障排除)
- [常见问题](#常见问题)
- [开发](#开发)
- [参与贡献](#参与贡献)
- [许可证](#许可证)

---

## 什么 是 toon-memory？

你是否有过这样的经历：AI 助手完全忘记了昨天会话中的内容？你不得不第三次解释同一个架构决策，而它仍然建议你已经否决的方案？

**toon-memory 解决了这个问题。** 它为你的 AI 助手提供持久记忆，即使重启也不会丢失，让它能真正从项目中持续学习。

📖 **[阅读文档](https://luiggival08.github.io/toon-memory/)**

### 实际应用场景

| 场景 | toon-memory 的作用 |
|------|-------------------|
| 设计讨论 | "我们选择了 Redis 而非 Memcached，因为需要 pub/sub 支持" |
| 框架选型 | "本项目使用 Zod 做校验，不是 Joi" |
| Bug 修复 | "Redis 连接池耗尽 — 修复方案是 max_connections=20" |
| 架构记录 | "Broker 服务使用 RESP 协议，不是 HTTP" |
| 新人入职 | "部署脚本在 scripts/deploy.sh" |
| 团队上下文 | "PR #142 回滚了缓存变更 — 不要重新添加" |

---

## 博客文章

阅读 [toon-memory 如何让你的 AI 助手更聪明](https://luiggival08.github.io/toon-memory/blog)，了解持久记忆在实际场景中的演示。

---

## 功能特性

- **21 个 MCP 工具** — 通过 Model Context Protocol 实现完整的记忆管理，包括 `memory_smart_recall`（统一召回）、`memory_sessions`（多会话协调）以及 `context_*` 系列工具（一键生成上下文：简报、差异、聚焦、健康审计、导出）
- **MCP 资源** — 无需工具调用即可将记忆作为上下文读取，包括系统知识图谱（自动生成的知识地图）
- **支持 15 种 Agent** — OpenCode、VS Code、Claude Code、Cursor、Windsurf、Cline、Continue、Codex CLI、Gemini CLI、Zed、Antigravity、Aider、KiloCode、OpenClaw、Kiro
- **交互式安装器** — 从菜单中选择要配置的 Agent
- **SessionStart 钩子** — 为 Claude Code、Codex CLI、Gemini CLI、Antigravity 提供自动提醒
- **TOON 格式** — 比 JSON 少 22% 的 token（实测），LLM 理解效果更好
- **按项目独立记忆** — 每个项目拥有独立的记忆文件
- **零配置** — 安装即可使用
- **自动 gitignore** — 自动将 `.toon-memory/memory/` 添加到 `.gitignore`
- **日期过滤** — 按日期范围搜索记忆
- **自动归档** — 过期条目（>30 天）、TTL 过期条目或超过 100 条的条目自动移至归档
- **加密** — 使用 AES-256-GCM 加密敏感数据
- **监视模式** — 每 N 分钟自动备份
- **记忆 TTL** — 可配置每条记录的过期时间（7 天、30 天或精确日期）
- **标签推断** — 标签为空时自动从内容中检测标签（内置词汇表 + 项目依赖）
- **记忆差异** — 查看上次会话以来的变化
- **关联条目** — 保存时自动推荐相关记忆
- **记忆图谱** — 通过 `links`/`[[key]]` 引用连接条目；`memory_recall` 可展开关系感知的子图，实现更精准、更少 token 的召回（无需嵌入向量，无需 LLM）
- **Token 高效召回** — `memory_recall({ compact: true })` 返回数字索引条目，省略 `id`/`date`/`file`，图边渲染为 `->2`，并将图邻居截断为摘要
- **BM25 + 中心性排序** — 召回时按 BM25 相关性和图中心性重排（枢纽节点即使不含查询词也会浮现）；逐跳衰减确保远距离节点排名较低
- **从依赖自动打标签** — `toon-memory init` 扫描 `package.json`/`Cargo.toml`/`requirements.txt`/`go.mod` 并写入项目词汇表，提及依赖的条目会自动关联对应标签
- **智能召回** — `memory_smart_recall` 在一次调用中融合 BM25 + 图谱 + 衰减 + 质量评分；LLM 在每次任务开始时调用此工具
- **质量评分** — 每条记录根据结构（标签、链接、内容具体性、时效性）自动获得 0–1 的质量评分；高质量条目优先显示
- **合并去重** — 以相同 `key` 保存时合并属性（标签取并集、置信度取最大值、日期取最新、链接合并），而非覆盖
- **置信度评分** — 每条记录追踪信息可靠性：用户声明 = 1.0，推断 = 0.65–0.75
- **上下文生成工具** — `context_generate`（完整简报）、`context_diff`（增量简报）、`context_focus`（精准简报）、`context_health`（健康审计）、`context_export`（导出为 markdown）— 每个工具替代 5-6 次手动调用。零 LLM 开销，纯确定性聚合
- **系统知识图谱** — 自动生成的知识地图，作为 MCP 资源暴露；Agent 在会话启动时加载即可获得即时上下文

---

## 快速开始

### 1. 安装

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex

# 或通过 npm（任意平台）
npm i -g toon-memory
```

> **提示：** npm 安装是最可靠的方式。curl/irm 脚本是便捷封装。

### 2. 配置你的 Agent

```bash
# 交互式安装器 — 自动检测并配置 MCP
npx toon-memory
```

安装器将：
1. 检测你已安装的 AI Agent
2. 询问要配置哪些 Agent
3. 自动添加 MCP 服务器配置

### 3. 开始使用

就这么简单！在下一次 Agent 会话中，试试：

```bash
memory_stats      # 查看记忆状态
memory_recall     # 在读取文件前搜索记忆
memory_remember   # 保存重要决策
```

> **提示：** 始终在会话开始时运行 `memory_recall`。你的 Agent 将立即获得之前会话的上下文。

---

## 支持的 Agent

| Agent | 配置位置 | 格式 | 钩子 | 自动设置 |
|-------|---------|------|------|---------|
| **OpenCode** | `.opencode/opencode.json` + `.opencode/plugins/toon-memory.ts` | 插件 | SessionStart（插件方式，非顶层 `hooks`） | ✅ |
| **VS Code / Copilot** | `.vscode/mcp.json` | JSON | — | ✅ |
| **Claude Code** | `.claude/settings.json` | JSON | SessionStart + PostToolUse + Stop | ✅ |
| **Cursor** | `.cursor/mcp.json` | JSON | — | ✅ |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | JSON | — | ✅ |
| **Cline** | `.cline/mcp.json` | JSON | — | ✅ |
| **Continue** | `.continue/config.json` | JSON | — | ✅ |
| **Codex CLI** | `.codex/config.toml` | TOML | SessionStart + PostToolUse + Stop（`[[hooks]] event=`） | ✅ |
| **Gemini CLI** | `.gemini/settings.json` | JSON | SessionStart + PostToolUse + Stop（`hooks.*`） | ✅ |
| **Zed** | `~/.config/zed/settings.json` | JSONC | — | ✅ |
| **Antigravity** | `.gemini/config/mcp_config.json` + `.gemini/config/hooks.json` | hooks.json | PreInvocation + PostToolUse + Stop（无 SessionStart 事件） | ✅ |
| **Aider** | — | — | — | 📝 说明文档 |
| **KiloCode** | `~/.kilocode/mcp_settings.json` | JSON | — | ✅ |
| **OpenClaw** | `.openclaw.json` | JSON | — | ✅ |
| **Kiro** | `.kiro/settings/mcp.json` | JSON | — | ✅ |

> **提示：** 你可以同时为多个 Agent 配置 toon-memory。所有 Agent 共享 `.toon-memory/memory/` 下的同一记忆文件。

---

## MCP 工具

| 工具 | 说明 |
|------|------|
| `memory_remember` | 保存决策、模式、Bug 或知识（可选 TTL、自动标签推断、`links` 构建记忆图谱、同 key 自动合并去重、自动质量评分和置信度） |
| `memory_recall` | 搜索记忆（应在读取文件前使用，自动过滤已过期 TTL）。`mode: "graph"` 展开关系感知子图以提高精度。`compact: true` 返回 token 高效的数字索引格式。按质量加权排序 |
| `memory_smart_recall` | **统一召回**：一次调用融合 BM25 + 图谱 + 衰减 + 质量。在每次任务开始时使用。返回紧凑、token 高效的输出 |
| `memory_forget` | 按 key 或 id 删除条目 |
| `memory_stats` | 查看记忆状态（包括 TTL 统计和质量分布） |
| `memory_summary` | 保存/读取文件摘要 |
| `memory_archive` | 归档旧条目（>30 天）和已过期 TTL 的条目 |
| `memory_diff` | 显示自某个日期以来的变化（24 小时、7 天或精确日期） |
| `memory_suggest` | 查找与给定上下文相关的条目 |
| `memory_encrypt` | 启用 AES-256-GCM 加密 |
| `memory_decrypt` | 禁用加密 |
| `memory_backup` | 创建带时间戳的记忆文件备份（自动保留最近 10 份） |
| `memory_captured` | 列出由钩子自动捕获的活动日志（需启用）或清除日志 |
| `memory_consolidate` | 合并去重：相同 key 的条目合并（标签取并集、置信度取最大值、日期取最新），然后移除内容完全相同的重复条目（确定性处理，无需 LLM） |
| `memory_sessions` | 显示活跃的 Agent 会话（分支、文件、最后活跃时间）和并行工作时的软冲突 |
| `context_brief` | **一键上下文简报**：紧凑 markdown 格式的记忆 + 会话 + 健康状态。替代 5-6 次独立 memory_* 调用。零 LLM 开销，纯确定性聚合 |
| `context_generate` | **完整项目简报**：一次调用整合项目结构、git 状态、记忆条目和活跃会话。替代 5-6 次手动调用 |
| `context_diff` | **增量简报**：自上次会话以来的 git 提交 + 修改文件 + 新增/更新记忆 + 活跃会话 |
| `context_focus` | **精准简报**：仅返回与查询相关的记忆 + 关联源文件 + 调用方 + 测试文件 |
| `context_health` | **记忆健康审计**：孤立链接、重复项、损坏的文件引用、过期 TTL、过期会话，评分 0–100 |
| `context_export` | **导出记忆为 markdown**：可注入系统提示词的上下文（完整或紧凑格式） |

### MCP 资源

记忆也作为 MCP 资源暴露，可直接读取上下文：

| 资源 | URI | 说明 |
|------|-----|------|
| 记忆条目 | `toon://memory/entries` | 完整记忆转储 |
| 记忆统计 | `toon://memory/stats` | 分类计数和 TTL 信息 |
| 系统知识图谱 | `toon://memory/summaries` | 自动生成的知识地图（重要条目、分类、模式） |

### 示例

#### 保存决策

```typescript
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation — simpler than Joi, better TS support",
  file: "src/types.ts",
  tags: "validation;types"
})
// 🧠 已保存: decision/use-zod (a1b2c3d4)
// 质量评分: 0.65（2 个标签，内容详细）
// 🔗 相关条目：
//   [pattern] zod-schemas — Shared Zod schemas for API validation
```

> **提示：** 使用描述性的 key（如 `use-zod`），而非模糊的名称（如 `validation`）。Agent 会按 key 和内容搜索，具体的名称更有帮助。相同 key 保存会自动合并（标签取并集、置信度取最大值）。

#### 带 TTL 的保存

```typescript
memory_remember({
  category: "knowledge",
  key: "sprint-deadline",
  content: "Sprint ends July 18, feature freeze is July 16",
  ttl: "7d"
})
// 🧠 已保存: knowledge/sprint-deadline (x1y2z3w4)
// ⏰ TTL: 2026-07-19
// 质量评分会自动计算。
```

> **提示：** 对临时上下文（如截止日期、冲刺信息或时效性笔记）使用 TTL。TTL 过期的条目会自动从搜索结果中过滤。

#### 自动推断标签

```typescript
memory_remember({
  category: "bug",
  key: "redis-connection-timeout",
  content: "Redis connection timeout in production, increased pool size"
  // tags 留空 — 从内容自动推断
})
// 🧠 已保存: bug/redis-connection-timeout (a1b2c3d4)
// 🏷️ 推断标签: redis
// 质量评分会根据推断标签和内容自动计算。
```

> **提示：** 将 `tags` 留空，系统会使用内置的 20+ 分类词汇表（redis、auth、api、db、security 等）以及 `init` 时从项目依赖生成的项目词汇表来自动推断标签。因此如果你的项目依赖 `redis`，任何提及 "redis" 的条目都会自动打上 `redis` 标签。

#### 搜索记忆

```typescript
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **提示：** 在读取文件前先搜索记忆。这样可以节省 token，并让你的 Agent 获得仅从代码中无法获取的上下文。质量加权排序确保最有用的条目优先显示。或使用 `memory_smart_recall` 获得更全面的结果。

#### 带日期过滤的搜索

```typescript
memory_recall({
  query: "redis",
  from_date: "2026-07-01",
  to_date: "2026-07-31"
})
```

> **提示：** 当你大致记得某事*何时*发生但不确定*具体是什么*时，使用日期过滤。质量加权排序仍然适用。

#### 归档旧条目

```typescript
memory_archive()
// 📦 已归档 5 条旧条目
// 📋 剩余 42 条活跃条目
```

> **提示：** 定期运行此命令以保持记忆精简。归档的条目仍可通过带日期过滤的 `memory_recall` 搜索。TTL 过期的条目也会自动归档。低质量条目会降低召回优先级。

#### 显示上次会话以来的变化

```typescript
memory_diff({ since: "24h" })
// 📋 自 2026-07-11 以来的变化：
//
// ➕ 新增 (2):
//   [decision] use-zod (a1b2c3d4)
//     Use Zod for validation
//   [bug] redis-timeout (e5f6g7h8)
//     Redis connection timeout fix
```

> **提示：** 在会话开始时使用 `memory_diff` 查看你的 Agent 自上次以来学到了什么。新条目包含质量评分。

#### 查找相关条目

```typescript
memory_suggest({ context: "redis cache configuration" })
// 🔍 "redis cache configuration" 的相关建议：
//
// [decision] redis-cache-config (a1b2c3d4)
//   Redis cache layer for session storage
//   File: src/cache.ts | Tags: redis;cache | Date: 2026-07-10
//
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **提示：** 当你需要关于某个主题的上下文但不确定搜索什么时，使用 `memory_suggest`。或使用 `memory_smart_recall` 获得更全面的结果。

#### 智能召回（统一）

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

> **提示：** 在每次任务开始时使用 `memory_smart_recall`。它在一次调用中融合 BM25 + 图谱 + 衰减 + 质量 — 无需猜测该搜索什么。

#### 完整项目简报（一键调用）

```typescript
context_generate({})
// # 项目简报（完整）
//
// ## 项目
// - 名称: my-app
// - 根目录: /path/to/project
// - 包管理器: npm
// - TypeScript: ✓ (v5.3)
//
// ## Git 状态
// - 分支: main
// - 3 个未提交，0 个未跟踪
//
// ## 记忆 (42 条，12 个模式，8 个 Bug)
// [1] decision/use-postgres
//   Choose Postgres for ACID compliance
//   tags: db;decision
//
// ## 会话
// - egraterol (main, 2 分钟前): 42 个文件
```

> **提示：** 在会话开始时使用 `context_generate` 一键获取完整上下文。替代 5-6 次独立工具调用。

#### 记忆健康审计

```typescript
context_health({})
// # 记忆健康状态 (评分: 87/100)
//
// ## 摘要
// - 42 条记录 (12 个模式，8 个 Bug，15 个决策，7 个知识)
// - 平均质量 65.3%
//
// ## 问题 (3)
// - 孤立链接: pattern/db-migrations → pattern/db-seed (未找到 key)
// - 重复项: [bug] redis-pool-fix 内容相同
// - TTL 过期: [knowledge] sprint-deadline (已过期 2026-07-20)
//
// ## 过期文件 (1)
// - src/legacy.ts (已删除，2 个引用)
```

> **提示：** 当感觉记忆杂乱时运行 `context_health`。可显示孤立链接、重复项、TTL 过期条目和损坏的文件引用。

#### 合并去重（自动）

以相同 `key` 保存时，属性会合并而非覆盖：

```typescript
// 首次保存
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  tags: "types"
})
// 🧠 已保存: decision/use-zod (a1b2c3d4)

// 后续以相同 key 保存 — 自动合并
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation — also handles API response parsing",
  tags: "types;api"
})
// 🧠 已更新: decision/use-zod (a1b2c3d4)
// 🔗 合并: 标签已合并，日期和链接已更新
// 标签现在为: "types;api"（两者的并集）
```

> **提示：** 使用描述性且稳定的 key。相同 key = 合并，不同 key = 新条目。

#### 质量评分

每条记录根据结构自动获得质量评分（0–1）：

| 因素 | 权重 | 衡量内容 |
|------|------|---------|
| 标签 | 最高 0.3 | 标签越具体 = 质量越高 |
| 链接 | 最高 0.2 | 有连接的条目 = 质量越高 |
| 内容长度 | 最高 0.3 | 详细 > 模糊 |
| 时效性 | 最高 0.1 | 辑新的条目评分越高 |
| 具体性 | 最高 0.1 | 唯一词 vs 重复词 |

高质量条目在召回时优先显示。使用 `memory_stats` 查看质量：

```typescript
memory_stats()
// ...
// 平均质量: 0.58（12 条有评分）
```

#### 置信度评分

每条记录追踪信息的可靠程度：

| 来源 | 置信度 | 含义 |
|------|--------|------|
| 用户声明 | 1.0 | "我们使用 Postgres" — 直接陈述 |
| 推断 | 0.65–0.75 | Agent 从上下文推断 |
| 不确定 | 0.50 | Agent 在猜测 |

合并时置信度取两者中的最大值。

#### 系统知识图谱

系统知识图谱是自动生成的知识地图，作为 MCP 资源暴露。Agent 在会话启动时加载即可获得即时上下文：

```typescript
// 暴露为 toon://memory/summaries
// 每次读取时自动重新生成
// 包含: 重要条目、分类、模式
```

> **提示：** 将 `toon://memory/summaries` 添加到你的 Agent 系统提示中，即可在会话启动时获得即时上下文。

#### 启用加密

```typescript
// 首先，在环境变量（或 .env 文件）中设置 TOON_MEMORY_KEY：
// export TOON_MEMORY_KEY="your-secret-key-here"

memory_encrypt()
// 🔐 加密已启用
```

> **警告：** 加密前必须通过 `TOON_MEMORY_KEY` 环境变量设置密钥。请妥善保存 — 一旦丢失，记忆数据将永远无法恢复。质量评分和置信度在加密后仍然保留。

---

## 多会话协调

当你**并行运行多个 AI Agent 会话**时（例如在同一仓库上同时运行三个 OpenCode 会话），它们可能会意外地覆盖彼此的工作。toon-memory 内置了 **`memory_sessions`**，一个基于文件的协调工具，让每个会话都能看到其他会话在做什么 — **无需服务器、无需网络、无需 LLM 调用**。

### 工作原理

- 启动时，`SessionStart` 钩子在 `.toon-memory/memory/sessions/<id>.json` 为当前会话写入**心跳文件**。每个进程只写入*自己的*文件，因此没有锁竞争。
- 心跳记录 Agent 名称、**git 分支**、**修改的文件**和**最后活跃时间**。
- 读取所有这些文件可让每个会话获得共享的、最终一致的视图，了解其他活跃会话的状态。
- 已死亡的会话（进程 PID 不再存在**且**心跳超过 TTL 窗口）会被延迟清理。

### `memory_sessions` 工具

```typescript
memory_sessions({ conflictsOnly: false })
// 🧭 活跃会话 (2) — 窗口 30 分钟：
//
// • opencode @ feature/auth (当前)
//   id: a1b2c3d4
//   2 分钟前
//   修改文件：
//     • src/auth.ts
//
// • claude @ feature/db
//   id: e5f6g7h8
//   9 分钟前
//     • src/db.ts
//
// 🔥 软冲突 (1)：
//   ⚠️ src/types.ts  ↔  opencode @ feature/auth, claude @ feature/db
```

- 传入 `conflictsOnly: true` 可跳过会话列表，仅显示软冲突：
  ```typescript
  memory_sessions({ conflictsOnly: true })
  // 🔥 软冲突 (1)：
  //
  // ⚠️ src/types.ts
  //    ↔ opencode @ feature/auth (a1b2c3d4), claude @ feature/db (e5f6g7h8)
  ```
- **软冲突**是指被 2 个以上活跃会话修改的文件 — 提示你可能正在编辑相同的代码。这不是硬锁，只是协调提醒。

### 推荐的并行会话习惯

1. 在每次会话开始时，`SessionStart` 钩子已自动打印其他活跃会话和软冲突信息。
2. 运行 `memory_smart_recall({ intent: "what I'm working on" })` 获取完整上下文（记忆 + 图谱 + 质量）。
3. 运行 `memory_sessions()` 查看完整情况（分支、文件、最后活跃时间），或运行 `memory_sessions({ conflictsOnly: true })` 仅关注冲突。
4. 如果你与其他会话共享文件，在编辑前先同步，避免覆盖彼此的更改。

> **提示：** 这完全是本地化的且无锁 — 随时运行都安全。在会话开始时结合 `memory_smart_recall({ intent: "project context" })` 使用，可同时获得跨会话的*记忆*和跨会话的*存在感知*。系统知识图谱（MCP 资源）也提供即时上下文。

---

## 记忆图谱（基于图的召回）

当记忆增长后，扁平的关键词搜索可能返回太多（每个匹配项）或错误的上下文（无关联关系）。toon-memory 将记忆视为**轻量级知识图谱**，让召回返回*正确的*条目且消耗更少的 token。结合质量评分，最有用的条目优先显示。

它完全**确定性且离线** — 无需嵌入向量、无需向量数据库、无需 LLM、无需服务器。边来自两个来源：

- **显式 `links`** — 保存条目时声明的 key。
- **隐式 `[[key]]` 引用** — 内容中出现的任何 `[[some-key]]` 引用。

### 工作原理

1. `memory_remember` 在条目上存储 `links`（空格或 `;` 分隔的 key）。质量评分自动计算。
2. `memory_recall({ mode: "graph" })` 先查找关键词匹配（种子），然后沿边展开**自我子图**，最大跳数为 `hops`（1 或 2）。
3. 相关性从种子传播到邻居，因此相关的决策或规格说明即使不包含查询词也会浮现。质量加权排序确保最有用的条目优先出现。
4. 结果集有上限（`limit`，默认 6）→ 为 Agent 提供*更小、更精准*的上下文。或使用 `memory_smart_recall` 统一调用。

#### 带链接的保存

```typescript
memory_remember({
  category: "decision",
  key: "risk-engine-priority",
  content: "The engine prioritizes risk over speed (see [[risk-spec]]).",
  file: "spec.md:10",
  tags: "risk;spec",
  links: "engine-arch"          // 指向另一条目的显式边
})
// 🧠 已保存: decision/risk-engine-priority (a1b2c3d4)
// 质量评分会根据标签、链接和内容详细程度自动计算。
```

#### 图模式召回

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

> **提示：** 当决策跨越多个条目（架构、规格、相关 Bug）时使用 `mode: "graph"`。对于孤立的事实，默认的 `flat` 模式就够了。或使用自动融合图谱 + BM25 + 质量的 `memory_smart_recall`。

#### Token 高效召回（`compact`）

当每个 token 都很重要时，传入 `compact: true` 获得更紧凑的输出：

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

`compact` 对输出的改变：

- 每条记录获得稳定的数字索引（`[1]`、`[2]`…），按评分排序。
- 省略 `id`、`date` 和 `file` — 仅保留 `tags`。
- 在 `graph` 模式下，边渲染为 `->2`（数字，而非 key 名称）。
- 通过图到达的邻居（非种子）截断为带省略号的短摘要，而直接匹配的种子保留完整内容。
- 质量加权排序确保最有用的条目优先出现。
- 存储的 `.toon` 文件**永远不会**被修改 — `compact` 仅重塑响应格式。

> **提示：** 将 `compact: true` 与 `mode: "graph"` 结合使用，在从大型互联记忆中召回时获得最小的上下文窗口。或直接使用自动完成此操作的 `memory_smart_recall`。

#### 召回排名机制

召回是确定性且离线的（无嵌入向量，无 LLM）。每个候选条目获得综合评分：

- **BM25 相关性** — 经典的概率词频评分，使用 `id` + `category` + `key` + `content` + `file` + `tags` + `quality` + `confidence`。
- **图中心性** — 度归一化（0..1）；连接多个条目的枢纽节点评分接近 1，即使不含查询词也会浮现。
- **重要性** — 时效性 + 访问频率（与其他位置使用相同的信号）。
- **质量加成** — 质量评分较高的条目（更多标签、链接、细节）获得排名加成。
- **种子奖励** — 直接匹配查询的条目获得固定加成。
- **逐跳衰减** — 距种子 `d` 跳的节点乘以 `0.5^d`，因此远距离上下文排名低于近处上下文。

在 `graph` 模式下，召回先以关键词匹配为种子，展开自我子图至 `hops` 跳，然后按综合评分返回前 `limit` 条（默认 6）。`memory_smart_recall` 在一次调用中融合所有这些信号。

#### 从项目依赖自动打标签

执行 `toon-memory init` 时，CLI 扫描依赖清单并将 `vocab` 表写入 `.toon-memory/memory/config.json`：

```json
{
  "vocab": {
    "react": ["react"],
    "zod": ["zod"],
    "redis": ["redis"]
  }
}
```

`memory_remember` 会在内置词汇表之外，根据此词汇表匹配新条目，因此在内容中提及依赖会自动关联对应标签。更多标签 = 更高的质量评分。支持的清单文件：`package.json`、`Cargo.toml`、`requirements.txt`、`pyproject.toml`、`go.mod`。

> **提示：** 添加重要依赖后重新运行 `toon-memory init` 以刷新词汇表。`vocab` 键在 `config.json` 中与 `encrypted`/`capture` 标志合并（不会覆盖）。更多标签 = 更高的质量评分。

---

## 技巧与最佳实践

以下是与 toon-memory 配合良好的使用模式：

### "会话开始" 习惯

在每次新会话开始时，运行：
```
memory_smart_recall({ intent: "what I was working on" })
```
这将为你的 Agent 提供即时的上下文 — 在一次调用中融合 BM25、图谱、质量和衰减。

### "会话结束" 习惯

在关闭会话前，保存所有重要内容：
```
memory_remember({
  category: "decision",
  key: "auth-approach",
  content: "Chose JWT over sessions — stateless, works across microservices",
  file: "src/auth.ts",
  tags: "auth;architecture"
})
```
条目会根据其结构（标签、内容细节、链接）自动获得质量评分。

### 选择分类

| 分类 | 适用场景 |
|------|---------|
| `decision` | 架构选择、权衡取舍、"为什么选 X 而不是 Y" |
| `pattern` | 约定、框架、代码风格规范 |
| `bug` | 你修复的问题及修复方式 |
| `knowledge` | 项目事实、领域知识、团队上下文 |

> **提示：** 不要过度纠结。如果这是你未来的自己（或 Agent）想知道的事情，就保存它。带有具体标签的详细条目质量评分更高。

### 好用的标签格式

使用分号分隔的标签便于筛选：
```
tags: "redis;performance;fix"
tags: "auth;jwt;security"
tags: "api;rest;versioning"
```

> **提示：** 保持标签简短一致。它们不是话题标签 — 而是搜索过滤器。越具体的标签 = 越高的质量评分。

### 不要保存什么

- 不要保存从阅读代码就能明显看出的内容
- 不要保存临时调试笔记
- 不要保存密钥、API Key 或凭据（使用环境变量代替）
- 不要用不同的 key 保存相同的信息（合并去重会自动处理相同 key 的情况）
- 没有标签的模糊条目质量评分很低 — 请写具体

### 保持记忆整洁

每月运行 `memory_archive()` 将旧条目移至归档。运行 `memory_stats()` 查看大小和质量分布。低质量条目（内容模糊、无标签）会自动降低召回优先级。使用 `memory_consolidate` 合并重复项。

---

## CLI 命令

```bash
npx toon-memory              # 交互式安装器
npx toon-memory init         # 快速设置（无需交互）
npx toon-memory mcp          # 直接运行 MCP 服务器
npx toon-memory status       # 检查安装状态
npx toon-memory stats        # 查看记忆统计
npx toon-memory export       # 导出记忆为 JSON
npx toon-memory import <file> # 从 JSON 导入记忆
npx toon-memory watch [options] # 自动备份（可配置选项）
npx toon-memory upgrade      # 更新到最新版本
npx toon-memory uninstall    # 从所有 Agent 中移除
```

### 示例

#### 统计

```bash
$ npx toon-memory stats

🧠 toon-memory stats

📊 记忆统计
━━━━━━━━━━━━━━━━━━━
总条目数: 45
├── decision: 12
├── pattern: 18
├── bug: 8
└── knowledge: 7
最后更新: 2026-07-10
文件大小: 12.4 KB
```

> **提示：** 如果记忆过大（100+ 条目），考虑使用 `memory_archive` 归档或 `memory_forget` 删除过时条目。

#### 导出

```bash
$ npx toon-memory export

🧠 toon-memory export

已导出 45 条记录到：
  /path/to/project/toon-memory-export.json
```

> **提示：** 在大规模重构前导出。如果出现问题，可以随时导入备份。

#### 导入

```bash
$ npx toon-memory import backup.json

🧠 toon-memory import

已导入 3 条新记录
已跳过 2 条重复记录
```

> **提示：** 重复项按 key 检测。如果你想重新导入某条记录，先用 `memory_forget` 删除旧的。

#### 监视

```bash
$ npx toon-memory watch 15 -c -m 20

🧠 toon-memory watch

每 15 分钟监视记忆文件...
最大备份数: 20
压缩: 已启用
日志: 已禁用
按 Ctrl+C 停止

📦 备份 #1 已创建: 2026-07-11T16-00-00-000Z
📦 备份 #2 已创建: 2026-07-11T16-15-00-000Z
^C
✅ 监视已停止。共创建 2 个备份。
```

> **提示：** 监视模式适合长时间运行的会话。使用 `-c` 启用压缩，使用 `-m 5` 仅保留 5 个备份。

**监视选项：**

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `[interval]` | 备份间隔（分钟） | 5 |
| `-c, --compress` | 启用 gzip 压缩 | 关闭 |
| `-l, --log [path]` | 启用文件日志 | 关闭 |
| `-m, --max-backups <n>` | 最大备份数（0=无限制） | 10 |

---

## 配置

### 交互式安装器（推荐）

```bash
npx toon-memory
```

安装器（需要终端）将：
1. 显示所有 15 个支持的 Agent 及其检测状态（`✓` 已找到配置）和支持范围（`local/global` 或 `仅 local`）
2. 让你选择要配置的 Agent — 按编号（`1,3,5`）、按名称（`claude,codex`）、`all`、按回车选择全部，或 `q` 退出
3. 询问安装范围：**(1) 本地**（项目级：`.toon-memory` + Agent 配置在仓库中）或 **(2) 全局**（`~home` 下的配置）
4. 显示确认摘要（`Agent → 范围 → 路径（MCP/插件/钩子/说明文档）`）并询问 `确认继续？[Y/n]`
5. 自动配置 MCP 服务器、说明文件和钩子

> 在没有终端的环境（CI/管道）中，`npx toon-memory` 会打印非交互式安装帮助。使用 `npx toon-memory init [local|global]` 进行无提示安装。未知命令会打印用法并以错误退出。

### OpenCode

添加到 `.opencode/opencode.json` 或 `~/.config/opencode/opencode.json`：

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

> **钩子通过插件提供**，而非顶层 `hooks` 键。OpenCode 1.17+ 会在配置中拒绝 `"Unrecognized key: hooks"` — `toon-memory init` 会写入 `.opencode/plugins/toon-memory.ts`。不要在 `opencode.json` 中添加 `hooks`。

### Claude Code

添加到 `.claude/settings.json`：

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

添加到 `.vscode/mcp.json`：

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

添加到 `.codex/config.toml`：

```toml
[mcpServers.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
```

### Gemini CLI

添加到 `.gemini/settings.json`：

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

添加到 `~/.config/zed/settings.json`：

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

> **提示：** 如果你希望所有项目都使用记忆，使用全局配置。如果仅对特定项目启用，使用项目级配置。

---

## 工作原理

1. **MCP 服务器** — 本地运行，通过 stdio 与 Agent 通信
2. **TOON 格式** — 以 Token-Oriented Object Notation 存储数据（比 JSON 少约 22.5% 的 token，基于 16 条记录使用 gpt-tokenizer 实测）。每条记录自动追踪质量（0–1）和置信度（0–1）。
3. **按项目独立记忆** — 每个项目拥有 `.toon-memory/memory/data.toon`
4. **零配置** — 安装即可使用

### 记忆文件格式

```
version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1b2c3d4|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10||0||0.65|1.0
  e5f6g7h8|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10||0||0.55|1.0
  i9j0k1l2|bug|redis-pool-fix|Added max_connections=20 (see [[use-zod]])|redis.ts|redis;fix|2026-07-10|7d|0|use-zod|0.70|0.9
summaries:
  src/services/redis.ts: Redis connection pool with retry logic
```

### 文件结构

```
.toon-memory/
├── memory/
│   ├── data.toon        # 主记忆文件
│   ├── archive.toon     # 归档条目（>30 天）
│   ├── config.json      # 加密设置
│   └── backups/         # 监视模式备份
│       ├── backup-2026-07-11T16-00-00-000Z.toon
│       └── backup-2026-07-11T16-10-00-000Z.toon
└── hooks/
    ├── session-start-claude.sh
    ├── session-start-codex.sh
    ├── session-start-gemini.sh
    └── session-start-antigravity.sh
```

---

## 为什么选择 TOON？

TOON（Token-Oriented Object Notation）专为 LLM 设计：

| 格式 | Token 数（16 条记录） |
|------|----------------------|
| JSON | 1097 |
| **TOON** | **850** |

使用 `gpt-tokenizer`（cl100k_base）对 16 条代表性记忆记录实测 — 参见 `scripts/benchmark-toon.mjs`（`npm run bench`）。

Token 节省在会话时累积：`npm run bench:impact` 模拟**有 vs 无**记忆的上下文检索，实测获取相同上下文减少约 68% 的 token（使用 `compact` 召回替代重新读取源文件）。完整会话基准测试（`npm run bench:full`）显示使用 context_* 工具可减少 **80% 的工具调用**和 **47% 的 token**。

- **比 JSON 减少 22.5% 的 token**（文件级，单条记录最高可减少 30.5%）
- **无损往返** — 不会丢失数据
- **更好的 LLM 理解** — 结构化数据便于 AI 处理
- **质量与置信度** — 每条记录自动追踪结构质量（0–1）和可靠性（0–1）

> **提示：** 更少的 token = 更快的响应 + 更低的 API 成本。你的 Agent 在每次会话启动时都会读取记忆文件，因此效率很重要。

---

## 基准测试：toon-memory vs 替代方案

| 功能 | toon-memory | @modelcontextprotocol/server-memory | mem0 | shodh-memory |
|------|-------------|--------------------------------------|------|--------------|
| **存储** | 本地文件（TOON） | 本地文件（JSON） | 云端 | RocksDB |
| **依赖** | 零 | 零 | 云端 API | sentence-transformers, RocksDB |
| **搜索** | BM25 + 图谱 + 质量 | 基础关键词 | 仅向量 | 混合（向量 + 图谱） |
| **Token 效率** | 比 JSON 少 22.5% | 基准（JSON） | 不适用（云端） | 相近 |
| **质量评分** | 自动（0–1，启发式） | 无 | 无 | BND 算法 |
| **合并去重** | 标签并集 + 最大置信度 | 无 | 无 | 内容去重 |
| **置信度追踪** | 每条记录（0–1） | 无 | 无 | 每条记录 |
| **系统知识图谱** | 自动生成 | 无 | 无 | 无 |
| **多会话协调** | 基于文件 | 无 | 不适用 | 无 |
| **钩子** | 15 个 Agent | 无 | 无 | 仅 Claude |
| **加密** | AES-256-GCM | 无 | 云端管理 | 无 |
| **设置时间** | `npx toon-memory` | 手动 JSON | 云端注册 | Docker + 配置 |

### Token 效率（实测）

```
格式            Token 数（16 条记录）    对比 JSON
──────────────  ───────────────────    ───────
JSON            1097                   基准
TOON            850                    -22.5%
```

### 召回效率（实测）

```
方法                              获取上下文的 Token 数    对比重读文件
─────────────────────────────  ─────────────────────    ───────────────────
重读源文件                        ~3000                    基准
memory_recall (flat)            ~1200                    -60%
memory_recall (graph, compact)  ~900                     -70%
memory_smart_recall             ~850                     -72%
```

### 上下文工具基准测试（实测）

`context_*` 工具用单次调用替代 3–6 次独立工具调用，同时节省 token 和调用开销。

```
场景                              无工具    有工具    节省      工具调用
───────────────────────────────  ────────  ──────  ───────  ──────
context_generate (完整简报)        5,556     378    93.2%   6 → 1
context_diff (增量简报)              533     152    71.5%   4 → 1
context_focus (精准简报)              413     225    45.5%   4 → 1
context_health (健康审计)             322     246    23.6%   5 → 1
context_export (可注入 markdown)    1,178     218    81.5%   3 → 1
───────────────────────────────  ────────  ──────  ───────  ──────
总计                              8,002   1,219    84.8%  22 → 5
```

**各场景衡量内容：**

| 工具 | 无工具（手动路径） | 有工具（单次调用） | 节省原因 |
|------|-------------------|-------------------|---------|
| `context_generate` | 读取 `package.json` + `README` + `tsconfig.json` + 完整记忆转储 + 记忆统计 + 会话 = 6 次调用 | 一次紧凑简报包含所有内容 | 消除 5 次冗余读取；输出已去重和压缩 |
| `context_diff` | `git log` + `git diff --name-only` + `memory_diff` + 会话 = 4 次调用 | 一次增量差异 | 将 git 状态 + 记忆变化合并到一个输出中；无重叠 |
| `context_focus` | `memory_recall` + `findCallers` + `findRelatedFiles` + `findTestFiles` = 4 次调用 | 一次精准简报 | 仅返回相关内容；无需全量记忆扫描 |
| `context_health` | `memory_stats` + 孤立扫描 + 重复扫描 + 文件引用验证 + 过期会话 = 5 次调用 | 一次健康报告 | 每项检查只执行一次且已去重；无冗余查询 |
| `context_export` | `memory_stats` + `memory_recall({ compact: true, mode: "graph" })` + 手动格式化 = 3 次调用 | 一次 markdown 导出 | 直接格式化输出；Agent 跳过"格式化为 markdown"步骤 |

> **提示：** 在会话开始时使用 `context_generate`（节省 93% token）。使用 `context_diff` 查看"自上次以来有什么变化？"（节省 72%）。使用 `context_focus` 深入特定主题（节省 45%）。

使用 `gpt-tokenizer`（cl100k_base）在真实项目场景中实测 — 参见 `scripts/bench-context-tools.mjs`（`npm run bench:context`）。

### 完整会话影响（实测）

模拟完整的 5 阶段 Agent 会话（会话启动 → 调试 → 实现 → 代码审查 → 收尾），对比三种方式：无记忆、使用 `memory_recall`、使用 `context_*` 工具。

```
阶段                                    无记忆             memory_recall      context_* 工具
─────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
阶段 1: 会话启动                        516 t /  6 c       409 t /  3 c       373 t /  1 c
阶段 2: 调试问题                        176 t /  4 c       182 t /  2 c       252 t /  1 c
阶段 3: 实现功能                        189 t /  6 c       183 t /  3 c       305 t /  1 c
阶段 4: 代码审查                        316 t /  4 c       130 t /  2 c       243 t /  1 c
阶段 5: 收尾                          1,214 t /  5 c        68 t /  2 c       117 t /  1 c
─────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
总计                                  2,411 t / 25 c       972 t / 12 c     1,290 t /  5 c
```

**关键发现：**

| 指标 | 无记忆 | 使用 memory_recall | 使用 context_* 工具 |
|------|--------|-------------------|---------------------|
| 每会话 Token 数 | 2,411 | 972 (-60%) | 1,290 (-47%) |
| 每会话工具调用数 | 25 | 12 (-52%) | **5 (-80%)** |
| 每会话成本 (GPT-4) | $0.072 | $0.029 | $0.039 |

**权衡取舍：** `memory_recall` 使用更少的 token（972 vs 1,290），因为只返回匹配条目。`context_*` 工具返回**更丰富的上下文**（调用方、关联文件、测试文件、健康审计）— 每次调用 token 更多，但**工具调用减少 80%**。在实践中，Agent 避免了 3-4 次 `context_focus` 已包含的"查找相关"后续调用。

**context_* 大幅领先的场景：**
- **会话启动**（阶段 1）：token 减少 28% + 调用从 6→1 — 一次简报替代读取 6 个文件
- **收尾**（阶段 5）：token 减少 90% — `context_health` 替代 5 次手动扫描
- **工具调用**：25→5 次 = 每会话**减少 80% 的延迟开销**

> **提示：** 需要特定条目时使用 `memory_recall`（更少 token）。需要全面上下文且减少往返时使用 `context_*`（更少调用）。

使用 `gpt-tokenizer`（cl100k_base）实测 — 参见 `scripts/bench-full-impact.mjs`（`npm run bench:full`）。

> **提示：** `memory_smart_recall` 在一次调用中融合 BM25 + 图谱 + 质量，同时节省 token 和工具调用开销。在每次任务开始时使用。

---

## 故障排除

### 安装后找不到记忆

**症状：** Agent 提示没有记忆工具。

**解决方法：**
1. 运行 `npx toon-memory status` 验证安装
2. 完全重启 Agent（关闭后重新打开）
3. 检查 MCP 配置文件是否存在且 JSON 格式正确

### 记忆文件为空

**症状：** `memory_stats` 显示 0 条记录。

**解决方法：** 这在首次安装后是正常的。开始使用 `memory_remember` 保存条目即可。

### 重复条目

**症状：** 同一个 key 出现多次。

**解决方法：** 以相同 key 使用 `memory_remember` 现在会自动合并（标签取并集、置信度取最大值、日期取最新）。使用 `memory_consolidate` 合并所有相同 key 的条目并移除内容完全相同的重复项。如需手动清理，使用 `memory_forget`。

### 加密密钥丢失

**症状：** 无法解密记忆。

**解决方法：** 很遗憾，没有恢复方法。加密密钥在生成后不会存储在任何地方。这是出于安全考虑的设计。你需要从头开始或从未加密的备份恢复。

### 记忆过大

**症状：** Agent 响应变慢。

**解决方法：**
1. 运行 `memory_archive()` 将旧条目移至归档
2. 使用 `memory_forget` 删除不相关的条目
3. 保持条目简洁 — 保存决策，而非整个对话
4. 低质量条目（内容模糊、无标签）会自动降低召回优先级

---

## 常见问题

### 这个工具能与任何 AI Agent 一起使用吗？

是的，只要它支持 MCP（Model Context Protocol）。我们为 15 个 Agent 提供自动设置，其他 Agent 可手动配置。

### 我的数据会被发送到其他地方吗？

不会。所有数据都保存在你的本地机器上。MCP 服务器通过 stdio 本地运行 — 无网络调用、无遥测、无云端。

### 能在多台机器上使用吗？

可以，只要你同步 `.toon-memory/memory/` 目录（例如通过 Git 或共享文件夹）。每台机器都需要安装 toon-memory，但记忆文件是可移植的。

### 如果有多个项目会怎样？

每个项目拥有独立的记忆文件。记忆不会在项目之间泄漏。

### 能只加密特定条目吗？

不能，加密应用于整个记忆文件。如果需要选择性加密，请将敏感数据保存在单独的工具中。

### 与直接使用 markdown 文件有什么区别？

markdown 文件没有结构，无法被 Agent 以相同方式搜索，不通过 MCP 集成，也没有归档、日期过滤、质量评分、合并去重、置信度追踪或加密等功能。toon-memory 是专为 AI Agent 构建的。

---

## 开发

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
npm run build
npm test
```

### 项目结构

```
toon-memory/
├── src/
│   ├── bin/
│   │   └── toon-memory.ts      # 入口文件
│   ├── cli/
│   │   ├── setup.ts             # CLI 命令
│   │   └── toon-memory.ts       # CLI 运行器
│   ├── mcp/
│   │   └── server.ts            # MCP 服务器（21 个工具 + 3 个资源）
│   ├── lib/
│   │   ├── lock.ts              # 建议性文件锁 + 原子写入
│   │   ├── sessions.ts          # 多会话协调
│   │   ├── graph.ts             # 记忆图谱（解析、构建、BM25、中心性、紧凑渲染）
│   │   ├── quality.ts           # 质量评分、合并去重、智能召回、系统知识图谱
│   │   ├── context.ts           # 上下文简报生成器（一键上下文）
│   │   └── vocab.ts             # 从依赖发现项目词汇
├── tests/
│   ├── cli.test.ts              # CLI 测试
│   ├── memory.test.ts           # 记忆测试
│   ├── sessions.test.ts         # 多会话测试
│   ├── graph.test.ts            # 记忆图谱测试
│   └── quality.test.ts          # 质量评分、合并去重、智能召回、系统知识图谱测试
├── .github/workflows/
│   ├── ci.yml                   # CI（Node.js 20/22）
│   └── publish.yml              # 发布时自动发布
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 参与贡献

欢迎贡献！请先阅读我们的[行为准则](CODE_OF_CONDUCT.md)和[贡献指南](CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建你的功能分支（`git checkout -b feature/amazing-feature`）
3. 提交你的更改（`git commit -m 'feat: add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 创建 Pull Request

---

## 许可证

MIT

---

## 致谢

基于 [@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon) 和 [@modelcontextprotocol/server](https://www.npmjs.com/package/@modelcontextprotocol/server) 构建。
