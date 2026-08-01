[English](README.md) | [Español](README.es.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português (BR)](README.pt-br.md) | [Deutsch](README.de.md) | [Français](README.fr.md)

# toon-memory

> AI 코딩 에이전트를 위한 MCP 메모리 서버 — 세션 간에 의사결정, 패턴, 버그를 기억합니다.

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://luiggival08.github.io/toon-memory/)

---

## 목차

- [toon-memory란?](#toon-memory란)
- [블로그 포스트](#블로그-포스트)
- [기능](#기능)
- [빠른 시작](#빠른-시작)
- [지원하는 에이전트](#지원하는-에이전트)
- [MCP 도구](#mcp-도구)
- [다세션 협업](#다세션-협업)
- [메모리 그래프 (그래프 기반 리콜)](#메모리-그래프-그래프-기반-리콜)
- [팁과 모범 사례](#팁과-모범-사례)
- [CLI 명령어](#cli-명령어)
- [설정](#설정)
- [작동 원리](#작동-원리)
- [왜 TOON인가?](#왜-toon인가)
- [문제 해결](#문제-해결)
- [FAQ](#faq)
- [개발](#개발)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

---

## toon-memory란?

어제 세션에서 AI 에이전트가 모든 것을 잊어버린 경험 있으신가요? 같은 아키텍처 결정을 세 번째로 설명하는데, 이미 거절한 접근법을 또 제안하나요?

**toon-memory는 이 문제를 해결합니다.** 재시작 후에도 유지되는 영구 메모리를 에이전트에 제공하여, 프로젝트에서 점진적으로 학습할 수 있게 합니다.

📖 **[문서 읽기](https://luiggival08.github.io/toon-memory/)**

### 실제 사용 사례

| 시나리오 | toon-memory의 역할 |
|----------|----------------------|
| 설계 토론 | "pub/sub 지원 때문에 Memcached 대신 Redis를 선택했습니다" |
| 프레임워크 선택 | "이 프로젝트는 검증에 Joi가 아닌 Zod를 사용합니다" |
| 버그 수정 | "Redis 풀 고갈 — max_connections=20으로 수정" |
| 아키텍처 노트 | "Broker 서비스는 HTTP가 아닌 RESP 프로토콜을 사용합니다" |
| 온보딩 | "배포 스크립트는 scripts/deploy.sh에 있습니다" |
| 팀 컨텍스트 | "PR #142에서 캐싱 변경사항을 되돌렸습니다 — 다시 추가하지 마세요" |

---

## 블로그 포스트

[how toon-memory가 AI 에이전트를 더 똑똑하게 만드는가](https://luiggival08.github.io/toon-memory/blog)에서 영구 메모리의 실제 동작 데모를 확인하세요.

---

## 기능

- **MCP 도구 35개** — Model Context Protocol을 통한 전체 메모리 관리. `memory_smart_recall` (통합 리콜), `memory_sessions` 다세션 협업, `context_*` 도구를 통한 원 호출 컨텍스트 생성(브리핑, 차이점, 집중, 건강 감사, 내보내기) 포함
- **MCP 리소스** — 도구 호출 없이 컨텍스트로 메모리 읽기. 시스템 프라이머(자동 생성 지식 맵) 포함
- **에이전트 15개 지원** — OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex CLI, Gemini CLI, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro
- **인터랙티브 설치기** — 메뉴에서 설정할 에이전트 선택
- **SessionStart 훅** — Claude Code, Codex CLI, Gemini CLI, Antigravity용 자동 리마인더
- **TOON 형식** — JSON보다 22% 적은 토큰 (실측), LLM 이해도 향상
- **프로젝트별 메모리** — 각 프로젝트마다 고유 메모리 파일
- **제로 설정** — 설치만 하면 바로 사용
- **자동 gitignore** — `.toon-memory/memory/`를 `.gitignore`에 자동 추가
- **날짜 필터링** — 날짜 범위로 메모리 검색
- **자동 아카이브** — 오래된 항목(30일 초과), 만료된 TTL 항목, 또는 100개 이상의 항목이 자동으로 아카이브로 이동
- **암호화** — 민감한 데이터를 위한 AES-256-GCM 암호화
- **워치 모드** — N분마다 자동 백업
- **메모리 TTL** — 항목별 만료 시간 설정 가능 (7d, 30d, 또는 정확한 날짜)
- **태그 추론** — 태그가 비어 있을 때 콘텐츠에서 태그 자동 감지 (내장 어휘 + 프로젝트 의존성)
- **메모리 차이점** — 이전 세션 이후 변경사항 확인
- **관련 항목** — 저장 시 관련 메모리 자동 제안
- **메모리 그래프** — `links`/`[[key]]` 참조로 항목 연결. `memory_recall`이 관계 인식 서브그래프를 확장하여 더 정확하고 적은 토큰으로 리콜 (임베딩 불필요, LLM 불필요)
- **토큰 효율적 리콜** — `memory_recall({ compact: true })`는 숫자 인덱스로 항목을 반환하고, `id`/`date`/`file`을 제거하며, 그래프 엣지를 `->2`로 렌더링하고, 그래프 이웃을 스니펫으로 잘라냄
- **BM25 + 중심성 순위** — BM25 관련성과 그래프 중심성으로 리콜 재순위 (쿼리 단어 없이도 허브가 표시됨). 홉별 감쇠로 먼 노드 순위를 낮춤
- **의존성 기반 자동 태깅** — `toon-memory init`이 `package.json`/`Cargo.toml`/`requirements.txt`/`go.mod`을 스캔하여 프로젝트 어휘를 작성. 의존성을 언급한 항목이 자동으로 해당 태그를 받음
- **스마트 리콜** — `memory_smart_recall`이 BM25 + 그래프 + 감쇠 + 품질을 하나의 호출로 결합. LLM이 모든 작업 시작 시 호출
- **품질 점수** — 모든 항목에 구조(태그, 링크, 콘텐츠 구체성, 최신성)를 기반으로 0–1 품질 점수 자동 부여. 고품질 항목이 먼저 표시
- **병합-중복제거** — 같은 `key`로 저장하면 속성을 덮어쓰지 않고 병합 (태그 합집합, 최대 신뢰도, 최신 날짜, 결합된 링크)
- **신뢰도 점수** — 각 항목이 정보의 신뢰성을 추적: 사용자 주장 = 1.0, 추론 = 0.65–0.75
- **컨텍스트 생성 도구** — `context_generate` (전체 브리핑), `context_diff` (증분), `context_focus` (집중), `context_health` (감사), `context_export` (마크다운) — 각각 5-6개의 수동 도구 호출을 대체. LLM 불필요, 순수 결정론적 집계
- **시스템 프라이머** — MCP 리소스로 노출되는 자동 생성 지식 맵. 에이전트가 세션 시작 시 로드하여 즉시 컨텍스트 확보

---

## 빠른 시작

### 1. 설치

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex

# 또는 npm으로 설치 (모든 플랫폼)
npm i -g toon-memory
```

> **팁:** npm 설치가 가장 안정적인 방법입니다. curl/irm 스크립트는 편의 래퍼입니다.

### 2. 에이전트 설정

```bash
# 인터랙티브 설치기 — 에이전트를 감지하고 MCP 설정
npx toon-memory
```

설치기가 다음을 수행합니다:
1. 설치된 AI 에이전트 감지
2. 설정할 에이전트 선택 요청
3. MCP 서버 설정 자동 추가

### 3. 사용하기

끝입니다! 다음 에이전트 세션에서 다음을 시도하세요:

```bash
memory_stats      # 메모리 내용 확인
memory_recall     # 파일 읽기 전 메모리 검색
memory_remember   # 중요한 결정 저장
```

> **팁:** 세션 시작 시 항상 `memory_recall`을 실행하세요. 이전 세션의 컨텍스트를 즉시 확보할 수 있습니다.

---

## 지원하는 에이전트

| 에이전트 | 설정 위치 | 형식 | 훅 | 자동 설정 |
|-------|-----------------|--------|-------|------------|
| **OpenCode** | `.opencode/opencode.json` + `.opencode/plugins/toon-memory.ts` | 플러그인 | SessionStart (플러그인, 최상위 `hooks` 없음) | ✅ |
| **VS Code / Copilot** | `.vscode/mcp.json` | JSON | — | ✅ |
| **Claude Code** | `.mcp.json` (MCP) + `.claude/settings.json` (hooks) | JSON | SessionStart + PostToolUse + Stop | ✅ |
| **Cursor** | `.cursor/mcp.json` | JSON | — | ✅ |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | JSON | — | ✅ |
| **Cline** | `.cline/mcp.json` | JSON | — | ✅ |
| **Continue** | `.continue/config.json` | JSON | — | ✅ |
| **Codex CLI** | `.codex/config.toml` | TOML | SessionStart + PostToolUse + Stop (`[[hooks]] event=`) | ✅ |
| **Gemini CLI** | `.gemini/settings.json` | JSON | SessionStart + PostToolUse + Stop (`hooks.*`) | ✅ |
| **Zed** | `~/.config/zed/settings.json` | JSONC | — | ✅ |
| **Antigravity** | `.agents/mcp_config.json` + `.agents/hooks.json` | hooks.json | PreInvocation + PostToolUse + Stop (SessionStart 이벤트 없음) | ✅ |
| **Aider** | — | — | — | 📝 설명서 |
| **KiloCode** | `~/.kilocode/mcp_settings.json` | JSON | — | ✅ |
| **OpenClaw** | `.openclaw.json` | JSON | — | ✅ |
| **Kiro** | `.kiro/settings/mcp.json` | JSON | — | ✅ |

> **팁:** 여러 에이전트에 동시에 toon-memory를 설정할 수 있습니다. 각 에이전트는 `.toon-memory/memory/`의 동일한 공유 메모리 파일을 사용합니다.

---

## MCP 도구

| 도구 | 설명 |
|------|-------------|
| `memory_remember` | 결정, 패턴, 버그, 또는 지식 저장 (선택적 TTL, 자동 태그 추론, 메모리 그래프 구축을 위한 `links`, 같은 키에서 병합-중복제거, 자동 품질 점수 및 신뢰도) |
| `memory_recall` | 메모리 검색 (파일 읽기 전 사용, 만료된 TTL 필터링). `mode: "graph"`는 더 정확한 관계 인식 서브그래프를 확장. `compact: true`는 토큰 효율적 숫자 인덱스 형식 반환. 품질 가중 순위. `sessionBias`로 현재 git 브랜치의 항목 부스트 |
| `memory_smart_recall` | **통합 리콜**: BM25 + 그래프 + 감쇠 + 품질을 하나의 호출로 결합. 모든 작업 시작 시 사용. `sessionBias`로 현재 git 브랜치의 항목 부스트. 컴팩트하고 토큰 효율적인 출력 |
| `memory_forget` | 키 또는 ID로 항목 삭제 |
| `memory_stats` | 메모리 상태 확인 (TTL 통계 및 품질 분포 포함, 품질/액세스 임계값 미만의 콜드 메모리) |
| `memory_summary` | 파일 요약 저장/조회 |
| `memory_archive` | 오래된 항목(30일 초과) 및 만료된 TTL 항목 아카이브 |
| `memory_diff` | 특정 날짜 이후 변경사항 표시 (24h, 7d, 또는 정확한 날짜) |
| `memory_suggest` | 주어진 컨텍스트와 관련된 항목 검색 |
| `memory_encrypt` | AES-256-GCM 암호화 활성화 |
| `memory_decrypt` | 암호화 비활성화 |
| `memory_backup` | 메모리 파일의 타임스탬프 백업 생성 (최근 10개로 자동 정리) |
| `memory_captured` | 훅에 의해 자동 캡처된 활동 목록 (선택적) 또는 로그 지우기 |
| `memory_checkpoint` | **세션 체크포인트**: 7d TTL로 현재 메모리 상태의 스냅샷 생성. 긴 세션 중 롤백 참조에 유용 |
| `memory_consolidate` | **정리 작업** (결정론적, LLM 불필요): `mode: "identical"`(기본) 동일 콘텐츠 항목 중복 제거, `"similar"` 거의 중복(Jaccard >50%) 병합, `"low-quality"` 저품질 항목 일괄 정리(`minQuality`, `dryRun`) |
| `memory_sessions` | 활성 에이전트 세션(브랜치, 파일, 마지막 확인) 및 병렬 작업 시 소프트 충돌 표시 |
| `memory_compress` | LLM 기반 2단계 압축: 요약 + 덮어쓰기. Anthropic/OpenAI CLI 사용 가능 시 사용 |
| `memory_primer` | 원 호출 컨텍스트 프라이머: 주요 메모리 + 카테고리 + 세션 파일 변경. 세션 시작 시 자동 주입 |
| `memory_merge_sessions` | 파일의 병렬 세션 간 관찰 병합. 중복 제거 및 자동 승격 |
| `memory_export_gist` | 항목을 GitHub Gist(공개/비공개)로 내보내기. GITHUB_TOKEN 또는 gh CLI 사용 |
| `memory_import_gist` | GitHub Gist에서 항목 가져오기. 기존 항목과 병합(태그 합집합, 최대 신뢰도) |
| `memory_graph_path` | 지식 그래프에서 두 항목 간의 BFS 최단 경로 |
| `context_brief` | **원 호출 컨텍스트 브리핑**: 컴팩트 마크다운에 메모리 + 세션 + 건강 상태. 별도의 5-6개 memory_* 호출 대신 사용. LLM 불필요, 순수 결정론적 집계 |
| `context_generate` | **전체 프로젝트 브리핑**: 프로젝트 구조, git 상태, 메모리 항목, 활성 세션을 하나의 호출로 결합. 5-6개의 수동 도구 호출 대체 |
| `context_diff` | **증분 브리핑**: git 커밋 + 수정된 파일 + 신규/업데이트된 메모리 + 이전 세션 이후 활성 세션 |
| `context_focus` | **집중 브리핑**: 쿼리에 관련된 메모리 + 소스 파일 + 호출자 + 테스트 파일만 반환 |
| `context_health` | **메모리 건강 감사**: 고아 링크, 중복, 깨진 파일 참조, 만료된 TTL, 오래된 세션, 점수 0–100 |
| `context_export` | **메모리를 마크다운으로 내보내기**: 시스템 프롬프트용 주입 가능한 컨텍스트 (전체 또는 컴팩트) |
| `memory_pin` | **우선순위 1-5로 항목 핀 고정**: 핀 고정된 항목은 키워드 일치가 없어도 항상 리콜 결과에서 우선순위별로 정렬되어 먼저 표시됨 |
| `memory_unpin` | **항목 핀 해제**: 우선순위 플래그 제거 |
| `memory_search` | **필터가 있는 통합 검색**: `memory_recall`과 동일한 기능에 `category`, `tags`, `from_date`, `to_date` 필터 추가. 태그 필터는 AND 논리 사용 — 지정된 모든 태그가 일치해야 함. `sessionBias`로 현재 git 브랜치의 항목 부스트 |
| `memory_tag` | **일괄 태그 작업**: 키 또는 ID로 하나 이상의 항목에 태그 추가, 제거 또는 설정 |

### MCP 리소스

메모리는 직접적인 컨텍스트 읽기를 위해 MCP 리소스로도 노출됩니다:

| 리소스 | URI | 설명 |
|----------|-----|-------------|
| 메모리 항목 | `toon://memory/entries` | 전체 메모리 덤프 |
| 메모리 통계 | `toon://memory/stats` | 카테고리별 개수 및 TTL 정보 |
| 시스템 프라이머 | `toon://memory/summaries` | 자동 생성 지식 맵 (상위 항목, 카테고리, 패턴) |

### 예시

#### 결정 저장

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

> **팁:** `validation` 같은 모호한 키 대신 `use-zod` 같은 설명적인 키를 사용하세요. 에이전트는 키와 콘텐츠로 검색하므로 구체적인 것이 도움이 됩니다. 같은 키로 저장하면 자동으로 병합됩니다 (태그 합집합, 최대 신뢰도).

#### TTL을 포함한 저장

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

> **팁:** 마감일, 스프린트 정보, 시간 제한이 있는 메모와 같은 임시 컨텍스트에는 TTL을 사용하세요. 만료된 TTL 항목은 검색 결과에서 자동으로 필터링됩니다.

#### 자동 추론 태그

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

> **팁:** `tags`를 비워 두면 시스템이 20개 이상의 카테고리(redis, auth, api, db, security 등)의 내장 어휘와 `init` 시 프로젝트 의존성에서 파생된 프로젝트 어휘를 사용하여 콘텐츠에서 태그를 추론합니다. 프로젝트가 `redis`에 의존하면 "redis"를 언급한 모든 항목이 자동으로 `redis` 태그를 받습니다.

#### 메모리 검색

```typescript
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **팁:** 파일을 읽기 전에 검색하세요. 토큰을 절약하고 코드만으로는 얻을 수 없는 에이전트 컨텍스트를 제공합니다. 품질 가중 순위가 가장 유용한 항목이 먼저 표시되도록 합니다. 또는 더 포괄적인 결과를 위해 `memory_smart_recall`을 사용하세요.

#### 날짜 필터로 검색

```typescript
memory_recall({
  query: "redis",
  from_date: "2026-07-01",
  to_date: "2026-07-31"
})
```

> **팁:** 대략 *언제* 일어났는지 기억나지만 정확히 *무엇*이었는지 모를 때 날짜 필터를 사용하세요. 품질 가중 순위는 여전히 적용됩니다.

#### 오래된 항목 아카이브

```typescript
memory_archive()
// 📦 Archivadas 5 entradas antiguas
// 📋 Quedan 42 entradas activas
```

> **팁:** 메모리를 깔끔하게 유지하려면 정기적으로 실행하세요. 아카이브된 항목은 날짜 필터를 사용하여 `memory_recall`로 여전히 검색할 수 있습니다. 만료된 TTL 항목도 자동으로 아카이브됩니다. 저품질 항목은 리콜 우선순위가 낮아집니다.

#### 이전 세션 이후 변경사항 표시

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

> **팁:** 세션 시작 시 `memory_diff`를 사용하여 이전 작업 이후 에이전트가 학습한 내용을 확인하세요. 새 항목에는 품질 점수가 포함됩니다.

#### 관련 항목 검색

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

> **팁:** 주제에 대한 컨텍스트가 필요하지만 무엇을 검색할지 확실하지 않을 때 `memory_suggest`를 사용하세요. 또는 더 포괄적인 결과를 위해 `memory_smart_recall`을 사용하세요.

#### 스마트 리콜 (통합)

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

> **팁:** 모든 작업 시작 시 `memory_smart_recall`을 사용하세요. BM25 + 그래프 + 감쇠 + 품질을 하나의 호출로 결합 — 무엇을 검색할지 추측할 필요가 없습니다.

#### 전체 프로젝트 브리핑 (원 호출)

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

> **팁:** 세션 시작 시 `context_generate`를 사용하여 하나의 호출로 전체 컨텍스트를 확보하세요. 별도의 5-6개 도구 호출을 대체합니다.

#### 메모리 건강 감사

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

> **팁:** 메모리가 지저분하다고 느낄 때 `context_health`를 실행하세요. 고아 링크, 중복, 만료된 TTL 항목, 깨진 파일 참조를 표시합니다.

#### 병합-중복제거 (자동)

같은 `key`로 저장하면 속성이 덮어쓰지 않고 병합됩니다:

```typescript
// First save
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  tags: "types"
})
// 🧠 Guardado: decision/use-zod (a1b2c3d4)

// Later save with same key — merges automatically
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

> **팁:** 설명적이고 안정적인 키를 사용하세요. 같은 키 = 병합, 다른 키 = 새 항목.

#### 품질 점수

모든 항목은 구조를 기반으로 자동으로 품질 점수(0–1)를 받습니다:

| 요소 | 가중치 | 측정 내용 |
|--------|--------|------------------|
| 태그 | 최대 0.3 | 더 구체적인 태그 = 더 높은 품질 |
| 링크 | 최대 0.2 | 연결된 항목 = 더 높은 품질 |
| 콘텐츠 길이 | 최대 0.3 | 상세 > 모호 |
| 최신성 | 최대 0.1 | 최근 항목이 더 높은 점수 |
| 구체성 | 최대 0.1 | 고유 단어 대 반복 단어 |

리콜 시 고품질 항목이 먼저 표시됩니다. `memory_stats`로 품질을 확인하세요:

```typescript
memory_stats()
// ...
// Calidad promedio: 0.58 (12 con score)
```

#### 신뢰도 점수

각 항목은 정보의 신뢰성을 추적합니다:

| 출처 | 신뢰도 | 의미 |
|--------|-----------|---------|
| 사용자 주장 | 1.0 | "우리는 Postgres를 사용합니다" — 직접적인 진술 |
| 추론 | 0.65–0.75 | 에이전트가 컨텍스트에서 추론 |
| 불확실 | 0.50 | 에이전트가 추측 |

신뢰도는 병합 시 보존됩니다 (두 항목 중 최대값).

#### 시스템 프라이머

시스템 프라이머는 MCP 리소스로 노출되는 자동 생성 지식 맵입니다. 에이전트가 세션 시작 시 로드하여 즉시 컨텍스트를 확보합니다:

```typescript
// Exposed as toon://memory/summaries
// Auto-regenerates on every read
// Contains: top entries, categories, patterns
```

> **팁:** 세션 시작 시 즉시 컨텍스트를 얻으려면 에이전트의 시스템 프롬프트에 `toon://memory/summaries`를 추가하세요.

#### 암호화 활성화

```typescript
// First, set TOON_MEMORY_KEY in your environment (or .env file):
// export TOON_MEMORY_KEY="your-secret-key-here"

memory_encrypt()
// 🔐 Encriptación habilitada
```

> **주의:** 암호화하기 전에 `TOON_MEMORY_KEY` 환경 변수를 설정해야 합니다. 안전한 곳에 저장하세요 — 분실하면 메모리 데이터를 영구적으로 잃게 됩니다. 품질 점수와 신뢰도는 암호화를 통해서도 보존됩니다.

---

## 다세션 협업

**여러 AI 에이전트 세션을 병렬로 실행**할 때(예: 같은 리포지토리에서 세 개의 OpenCode 세션), 서로의 작업을 실수로 덮어쓸 수 있습니다. toon-memory에는 **`memory_sessions`**라는 파일 기반 협업 도구가 포함되어 있어 모든 세션이 다른 세션이 무엇을 하고 있는지 확인할 수 있습니다 — **서버, 네트워크, LLM 호출 없이**.

### 작동 방식

- 시작 시 `SessionStart` 훅이 `.toon-memory/memory/sessions/<id>.json`에 세션의 **하트비트 파일**을 작성합니다. 각 프로세스는 *자신의 파일만* 작성하므로 잠금 경쟁이 없습니다.
- 하트비트에는 에이전트 이름, **git 브랜치**, **접근한 파일**, **마지막 확인** 타임스탬프가 기록됩니다.
- 모든 파일을 읽으면 다른 활성 세션의 공유되고 최종적으로 일관된 보기를 모든 세션에 제공합니다.
- 죽은 세션(프로세스 PID가 더 이상 살아 있지 **않고** TTL 창을 지난 오래된 하트비트)은 지연적으로 정리됩니다.

### `memory_sessions` 도구

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

- 세션 목록을 건너뛰고 소프트 충돌만 표시하려면 `conflictsOnly: true`를 전달하세요:
  ```typescript
  memory_sessions({ conflictsOnly: true })
  // 🔥 Conflictos suaves (1):
  //
  // ⚠️ src/types.ts
  //    ↔ opencode @ feature/auth (a1b2c3d4), claude @ feature/db (e5f6g7h8)
  ```
- **소프트 충돌**이란 2개 이상의 활성 세션이 접근한 파일 — 같은 코드를 편집하고 있을 수 있다는 경고입니다. 강제 잠금이 아닌 협업을 위한 경고일 뿐입니다.

### 권장 병렬 세션 습관

1. 매 세션 시작 시 `SessionStart` 훅이 이미 다른 활성 세션과 소프트 충돌을 출력합니다.
2. `memory_smart_recall({ intent: "what I'm working on" })`을 실행하여 전체 컨텍스트(메모리 + 그래프 + 품질)를 확보합니다.
3. `memory_sessions()`을 실행하여 전체 상황(브랜치, 파일, 마지막 확인)을 확인하고, 충돌만 관심이 있다면 `memory_sessions({ conflictsOnly: true })`를 실행합니다.
4. 다른 세션과 파일을 공유하는 경우 편집 전에 동기화하여 서로의 변경사항을 덮어쓰지 않도록 합니다.

> **팁:** 이 기능은 순수하게 로컬이고 잠금이 없으므로 원하는 만큼 자주 실행해도 안전합니다. 세션 시작 시 `memory_smart_recall({ intent: "project context" })`과 결합하면 세션 간 *메모리*와 세션 간 *존재감*을 모두 확보할 수 있습니다. 시스템 프라이머(MCP 리소스)도 즉시 컨텍스트를 제공합니다.

---

## 메모리 그래프 (그래프 기반 리콜)

메모리가 많아지면 평탄한 키워드 검색은 너무 많은 결과(모든 매치)를 반환하거나 잘못된 컨텍스트(관계 없음)를 반환할 수 있습니다. toon-memory는 메모리를 **경량 지식 그래프**로 취급하여 리콜이 적은 토큰으로 *올바른* 항목을 반환할 수 있게 합니다. 품질 점수와 결합하면 가장 유용한 항목이 먼저 표시됩니다.

순수하게 **결정론적이고 오프라인**입니다 — 임베딩, 벡터 DB, LLM, 서버가 없습니다. 엣지는 두 가지 출처에서 나옵니다:

- **명시적 `links`** — 항목 저장 시 선언하는 키.
- **암시적 `[[key]]` 참조** — 콘텐츠 내의 `[[some-key]]` 언급.

### 작동 방식

1. `memory_remember`가 항목에 `links`를 저장합니다 (공백 또는 `;`로 구분된 키). 품질 점수가 자동으로 계산됩니다.
2. `memory_recall({ mode: "graph" })`가 키워드 매치(시드)를 찾은 다음, 엣지를 따라 `hops`(1 또는 2)까지 **ego-서브그래프**를 확장합니다.
3. 관련성이 시드에서 이웃으로 전파되므로, 쿼리 단어를 포함하지 않아도 관련 결정이나 사양이 표시됩니다. 품질 가중 순위가 가장 유용한 항목이 먼저 나타나도록 합니다.
4. 결과 집합은 (`limit`, 기본값 6)으로 제한됩니다 → 에이전트를 위한 **더 작고 정확한 컨텍스트**. 또는 통합 호출을 위해 `memory_smart_recall`을 사용하세요.

#### 링크를 포함한 저장

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

#### 그래프 모드로 리콜

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

> **팁:** 결정이 여러 항목(아키텍처, 사양, 관련 버그)에 영향을 미칠 때 `mode: "graph"`를 사용하세요. 고립된 사실에는 기본 `flat` 모드로 충분합니다. 또는 그래프 + BM25 + 품질을 자동으로 결합하는 `memory_smart_recall`을 사용하세요.

#### 토큰 효율적 리콜 (`compact`)

모든 토큰이 중요할 때, 더 밀도 높은 출력을 얻으려면 `compact: true`를 전달하세요:

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

`compact`가 출력을 변경하는 방식:

- 각 항목은 점수 순서로 안정적인 숫자 인덱스(`[1]`, `[2]`, …)를 받습니다.
- `id`, `date`, `file`이 제거됩니다 — `tags`만 유지됩니다.
- `graph` 모드에서 엣지는 `->2`로 렌더링됩니다 (숫자, 키 이름이 아님).
- 그래프를 통해 도달한 이웃(시드가 아닌)은 생략 기호가 포함된 짧은 스니펫으로 잘리고, 직접 매치된 시드는 전체 콘텐츠를 유지합니다.
- 품질 가중 순위가 가장 유용한 항목이 먼저 나타나도록 합니다.
- 저장된 `.toon` 파일은 **절대** 변경되지 않습니다 — `compact`는 응답만 재구성합니다.

> **팁:** 대규모 연결된 메모리에서 리콜할 때 가장 작은 컨텍스트 윈도우를 얻으려면 `compact: true`와 `mode: "graph"`를 결합하세요. 또는 자동으로 수행하는 `memory_smart_recall`을 사용하세요.

### 리콜이 결과를 순위 매기는 방식

리콜은 결정론적이고 오프라인입니다 (임베딩 불필요, LLM 불필요). 각 후보 항목은 합산 점수를 받습니다:

- **BM25 관련성** — 쿼리에 대한 고전적 확률적 용어 빈도 점수. `id` + `category` + `key` + `content` + `file` + `tags` + `quality` + `confidence`를 사용.
- **그래프 중심성** — 차수 정규화(0..1); 많은 항목에 연결된 허브는 1에 가까운 점수를 받아 쿼리 단어 없이도 표시됩니다.
- **중요도** — 최신성 + 접근 빈도 (다른 곳에서 사용되는 동일한 신호).
- **품질 부스트** — 더 높은 품질 점수를 가진 항목(더 많은 태그, 링크, 세부사항)이 순위 부스트를 받습니다.
- **시드 보너스** — 쿼리와 직접 매치된 항목이 고정 부스트를 받습니다.
- **홉별 감쇠** — 시드에서 `d`홉 떨어진 노드는 `0.5^d`로 곱해져 먼 컨텍스트의 순위가 근처 컨텍스트 아래로 떨어집니다.

`graph` 모드에서 리콜은 키워드 매치를 시드로 사용하고, ego-서브그래프를 `hops`까지 확장한 다음, 합산 점수 기준 상위 `limit`(기본값 6)을 반환합니다. `memory_smart_recall`은 이 모든 신호를 하나의 호출로 결합합니다.

### 프로젝트 의존성으로 자동 태깅

`toon-memory init` 시 CLI가 의존성 매니페스트를 스캔하고 `.toon-memory/memory/config.json`에 `vocab` 테이블을 작성합니다:

```json
{
  "vocab": {
    "react": ["react"],
    "zod": ["zod"],
    "redis": ["redis"]
  }
}
```

그런 다음 `memory_remember`가 내장 어휘 외에 이 어휘를 사용하여 새 항목과 매칭하므로, 콘텐츠에서 의존성을 언급하면 해당 태그가 자동으로 첨부됩니다. 더 많은 태그 = 더 높은 품질 점수. 지원하는 매니페스트: `package.json`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, `go.mod`.

> **팁:** 주요 의존성을 추가한 후 `toon-memory init`을 다시 실행하여 어휘를 새로고치세요. `vocab` 키는 `config.json`의 `encrypted`/`capture` 플래그와 병합됩니다 (덮어쓰지 않음). 더 많은 태그 = 더 높은 품질 점수.

---

## 팁과 모범 사례

toon-memory와 잘 작동하는 몇 가지 패턴입니다:

### "세션 시작" 습관

새 세션의 시작 부분에서 다음을 실행하세요:
```
memory_smart_recall({ intent: "what I was working on" })
```
이것이 BM25, 그래프, 품질, 감쇠를 하나의 호출로 결합하여 이전에 무엇이 있었는지에 대한 즉시 컨텍스트를 제공합니다.

### "세션 종료" 습관

세션을 닫기 전에 중요한 것을 모두 저장하세요:
```
memory_remember({
  category: "decision",
  key: "auth-approach",
  content: "Chose JWT over sessions — stateless, works across microservices",
  file: "src/auth.ts",
  tags: "auth;architecture"
})
```
항목은 구조(태그, 콘텐츠 세부사항, 링크)를 기반으로 자동으로 품질 점수를 받습니다.

### 카테고리 선택

| 카테고리 | 사용 시점 |
|----------|-------------|
| `decision` | 아키텍처 선택, 트레이드오프, "왜 X 대신 Y인가" |
| `pattern` | 관례, 프레임워크, 코딩 스타일 규칙 |
| `bug` | 수정한 문제와 수정 방법 |
| `knowledge` | 프로젝트 사실, 도메인 정보, 팀 컨텍스트 |

> **팁:** 너무 걱정하지 마세요. 미래의 자신(또는 에이전트)이 알고 싶어 할 것이라면 저장하세요. 구체적인 태그가 있는 상세한 항목은 품질 점수가 더 높습니다.

### 효과적인 태그 사용

세미콜론으로 구분된 태그를 사용하면 필터링이 쉽습니다:
```
tags: "redis;performance;fix"
tags: "auth;jwt;security"
tags: "api;rest;versioning"
```

> **팁:** 태그는 짧고 일관되게 유지하세요. 해시태그가 아닙니다 — 검색 필터입니다. 더 구체적인 태그 = 더 높은 품질 점수.

### 저장하면 안 되는 것

- 코드를 읽으면 명백한 것은 저장하지 마세요
- 임시 디버깅 메모를 저장하지 마세요
- 비밀, API 키, 인증 정보를 저장하지 마세요 (대신 환경 변수를 사용하세요)
- 다른 키로 같은 정보를 중복 저장하지 마세요 (같은 키의 병합-중복제거가 자동으로 처리)
- 태그 없는 모호한 항목은 품질 점수가 낮습니다 — 구체적으로 작성하세요

### 메모리를 깔끔하게 유지

`memory_archive()`를 매월 실행하여 오래된 항목을 아카이브로 이동하세요. `memory_stats()`를 실행하여 크기와 품질 분포를 확인하세요. 저품질 항목(모호한 콘텐츠, 태그 없음)은 자동으로 리콜 우선순위가 낮아집니다. 중복을 병합하려면 `memory_consolidate`를 사용하세요.

---

## CLI 명령어

```bash
npx toon-memory              # 인터랙티브 설치기
npx toon-memory init         # 빠른 설정 (프롬프트 없음)
npx toon-memory mcp          # MCP 서버 직접 실행
npx toon-memory status       # 설치 상태 확인
npx toon-memory stats        # 메모리 통계 보기
npx toon-memory export       # 메모리를 JSON으로 내보내기
npx toon-memory import <file> # JSON에서 메모리 가져오기
npx toon-memory watch [options] # 옵션과 함께 자동 백업
npx toon-memory upgrade      # 최신 버전으로 업데이트
npx toon-memory uninstall    # 모든 에이전트에서 제거
```

### 예시

#### 통계

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

> **팁:** 메모리가 너무 커지면(100개 이상 항목) 아카이브하거나 `memory_forget`으로 오래된 항목을 제거하는 것을 고려하세요.

#### 내보내기

```bash
$ npx toon-memory export

🧠 toon-memory export

Exported 45 entries to:
  /path/to/project/toon-memory-export.json
```

> **팁:** 대규모 리팩토링 전에 내보내세요. 문제가 생기면 나중에 백업을 가져올 수 있습니다.

#### 가져오기

```bash
$ npx toon-memory import backup.json

🧠 toon-memory import

Imported 3 new entries
Skipped 2 duplicates
```

> **팁:** 중복은 키로 감지됩니다. 항목을 다시 가져오려면 먼저 `memory_forget`으로 이전 항목을 삭제하세요.

#### 워치

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

> **팁:** 워치 모드는 장시간 실행되는 세션에 적합합니다. 압축하려면 `-c`를, 백업 5개만 유지하려면 `-m 5`를 사용하세요.

**워치 옵션:**

| 옵션 | 설명 | 기본값 |
|--------|-------------|---------|
| `[interval]` | 백업 간격(분) | 5 |
| `-c, --compress` | gzip 암호화 활성화 | 꺼짐 |
| `-l, --log [path]` | 파일 로깅 활성화 | 꺼짐 |
| `-m, --max-backups <n>` | 유지할 최대 백업 수 (0=무제한) | 10 |

---

## 설정

### 인터랙티브 설치기 (권장)

```bash
npx toon-memory
```

설치기(터미널 필요)는 다음을 수행합니다:
1. 감지 상태(`✓` 설정 발견)와 지원 범위(`local/global` 또는 `solo local`)와 함께 지원하는 15개 에이전트를 모두 표시
2. 설정할 에이전트 선택 — 번호(`1,3,5`), 이름(`claude,codex`), `all`, Enter로 전체 선택 또는 `q`로 종료
3. 설치 범위 요청: **(1) 로컬** (프로젝트: `.toon-memory` + 리포지토리의 에이전트 설정) 또는 **(2) 글로벌** (`~home` 설정)
4. 확인 요약(`에이전트 → 범위 → 경로(MCP/플러그인/훅/설명서)`)을 표시하고 `¿계속할까요? [Y/n]` 확인
5. MCP 서버, 설명서 파일, 훅을 자동으로 설정

> 터미널이 없는 경우(CI/파이프) `npx toon-memory`는 비인터랙티브 설치 도움말을 출력합니다. 프롬프트 없이 설치하려면 `npx toon-memory init [local|global]`을 사용하세요. 알 수 없는 명령어는 사용법을 출력하고 오류로 종료됩니다.

### OpenCode

`.opencode/opencode.json` 또는 `~/.config/opencode/opencode.json`에 추가:

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

> **훅은 최상위 `hooks` 키가 아닌 플러그인을 통해 전달됩니다.** OpenCode 1.17+는 설정에서 `"Unrecognized key: hooks"`를 거부합니다 — `toon-memory init`은 대신 `.opencode/plugins/toon-memory.ts`를 작성합니다. `opencode.json`에 `hooks`를 추가하지 마세요.

### Claude Code

`.mcp.json`(프로젝트 루트)에 추가:

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

`.vscode/mcp.json`에 추가:

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

`.codex/config.toml`에 추가:

```toml
[mcpServers.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
```

### Gemini CLI

`.gemini/settings.json`에 추가:

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

`~/.config/zed/settings.json`에 추가:

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

> **팁:** 모든 프로젝트에 메모리를 원하면 글로벌 설정을 사용하세요. 특정 프로젝트에만 원하면 프로젝트 수준 설정을 사용하세요.

---

## 작동 원리

1. **MCP 서버** — 로컬에서 실행, stdio를 통해 에이전트와 통신
2. **TOON 형식** — Token-Oriented Object Notation으로 데이터 저장 (JSON보다 약 22.5% 적은 토큰, gpt-tokenizer로 16개 항목 측정). 각 항목은 품질(0–1)과 신뢰도(0–1)를 자동으로 추적합니다.
3. **프로젝트별 메모리** — 각 프로젝트에 `.toon-memory/memory/data.toon`
4. **제로 설정** — 설치만 하면 바로 사용

### 메모리 파일 형식

```
version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1b2c3d4|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10||0||0.65|1.0
  e5f6g7h8|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10||0||0.55|1.0
  i9j0k1l2|bug|redis-pool-fix|Added max_connections=20 (see [[use-zod]])|redis.ts|redis;fix|2026-07-10|7d|0|use-zod|0.70|0.9
summaries:
  src/services/redis.ts: Redis connection pool with retry logic
```

### 파일 구조

```
.toon-memory/
├── memory/
│   ├── data.toon        # 기본 메모리 파일
│   ├── archive.toon     # 아카이브된 항목 (30일 초과)
│   ├── config.json      # 암호화 설정
│   └── backups/         # 워치 모드 백업
│       ├── backup-2026-07-11T16-00-00-000Z.toon
│       └── backup-2026-07-11T16-10-00-000Z.toon
└── hooks/
    ├── session-start-claude.sh
    ├── session-start-codex.sh
    ├── session-start-gemini.sh
    └── session-start-antigravity.sh
```

---

## 왜 TOON인가?

TOON (Token-Oriented Object Notation)은 LLM을 위해 설계되었습니다:

| 형식 | 토큰 (16개 항목) |
|--------|---------------------|
| JSON | 1097 |
| **TOON** | **850** |

`gpt-tokenizer` (cl100k_base)로 16개의 대표 메모리 항목에서 측정 — `scripts/benchmark-toon.mjs` (`npm run bench`) 참조.

토큰 절약은 세션 시 누적됩니다: `npm run bench:impact`는 메모리 **있이 vs 없이** 컨텍스트를 가져오는 것을 시뮬레이션하고 같은 컨텍스트를 얻기 위해 약 68% 적은 토큰을 측정합니다 (소스 파일을 다시 읽는 대신 리콜 `compact`). 전체 세션 벤치마크(`npm run bench:full`)는 context_* 도구 사용 시 **80% 적은 도구 호출**과 **47% 적은 토큰**을 보여줍니다.

- 파일 수준에서 JSON보다 **22.5% 적은 토큰** (단일 항목에서 최대 30.5%)
- **무손실 왕복** — 데이터 손실 없음
- **더 나은 LLM 이해도** — AI 소비를 위한 구조화
- **품질 및 신뢰도** — 모든 항목이 구조 품질(0–1)과 신뢰성(0–1)을 자동으로 추적

> **팁:** 적은 토큰 =更快 응답 + 더 낮은 API 비용. 에이전트는 매 세션 시작 시 메모리 파일을 읽으므로 효율성이 중요합니다.

---

## 벤치마크: toon-memory vs 대안

| 기능 | toon-memory | @modelcontextprotocol/server-memory | mem0 | shodh-memory |
|---------|-------------|--------------------------------------|------|--------------|
| **저장소** | 로컬 파일 (TOON) | 로컬 파일 (JSON) | 클라우드 | RocksDB |
| **의존성** | 제로 | 제로 | 클라우드 API | sentence-transformers, RocksDB |
| **검색** | BM25 + 그래프 + 품질 | 기본 키워드 | 벡터만 | 하이브리드 (벡터 + 그래프) |
| **토큰 효율성** | JSON보다 22.5% 적음 | 기본값 (JSON) | 해당 없음 (클라우드) | 유사 |
| **품질 점수** | 자동 (0–1, 휴리스틱) | 없음 | 없음 | BND 알고리즘 |
| **병합-중복제거** | 태그 합집합 + 최대 신뢰도 | 없음 | 없음 | 콘텐츠 중복제거 |
| **신뢰도 추적** | 항목별 (0–1) | 없음 | 없음 | 항목별 |
| **시스템 프라이머** | 자동 생성 | 없음 | 없음 | 없음 |
| **다세션** | 파일 기반 협업 | 없음 | 해당 없음 | 없음 |
| **훅** | 15개 에이전트 | 없음 | 없음 | Claude만 |
| **암호화** | AES-256-GCM | 없음 | 클라우드 관리 | 없음 |
| **설정 시간** | `npx toon-memory` | 수동 JSON | 클라우드 가입 | Docker + 설정 |

### 토큰 효율성 (측정)

```
형식            토큰 (16개 항목)       vs JSON
──────────────  ───────────────────    ───────
JSON            1097                   기본값
TOON            850                    -22.5%
```

### 리콜 효율성 (측정)

```
방법                              컨텍스트를 가져오기 위한 토큰    vs 파일 다시 읽기
─────────────────────────────  ─────────────────────    ───────────────────
소스 파일 다시 읽기              ~3000                    기본값
memory_recall (flat)            ~1200                    -60%
memory_recall (graph, compact)  ~900                     -70%
memory_smart_recall             ~850                     -72%
```

### 컨텍스트 도구 벤치마크 (측정)

`context_*` 도구는 별도의 3–6개 도구 호출을 단일 호출로 대체하여 토큰과 도구 호출 오버헤드를 모두 절약합니다.

```
시나리오                           없이        있음      절약       도구
───────────────────────────────  ────────  ──────  ───────  ──────
context_generate (전체 브리핑)      5,556     378    93.2%   6 → 1
context_diff (증분)                  533     152    71.5%   4 → 1
context_focus (집중)                  413     225    45.5%   4 → 1
context_health (감사)                 322     246    23.6%   5 → 1
context_export (주입 가능 md)      1,178     218    81.5%   3 → 1
───────────────────────────────  ────────  ──────  ───────  ──────
합계                              8,002   1,219    84.8%  22 → 5
```

**각 시나리오가 측정하는 것:**

| 도구 | 없이 (수동 경로) | 있음 (단일 호출) | 절약 이유 |
|------|----------------------|-------------------|-------------|
| `context_generate` | `package.json` + `README` + `tsconfig.json` + 전체 메모리 덤프 + 메모리 통계 + 세션 = 6회 호출 | 모든 것이 포함된 하나의 컴팩트 브리핑 | 5개의 중복 읽기 제거; 출력이 중복제거되고 컴팩트 |
| `context_diff` | `git log` + `git diff --name-only` + `memory_diff` + 세션 = 4회 호출 | 하나의 증분 차이점 | git 상태 + 메모리 변경을 하나의 출력으로 결합; 중복 없음 |
| `context_focus` | `memory_recall` + `findCallers` + `findRelatedFiles` + `findTestFiles` = 4회 호출 | 하나의 집중 브리핑 | 관련된 것만 반환; 전체 메모리 스캔 불필요 |
| `context_health` | `memory_stats` + 고아 스캔 + 중복 스캔 + 파일 참조 검증 + 오래된 세션 = 5회 호출 | 하나의 건강 보고서 | 각 검사가 한 번에 수행되고 중복제거됨; 중복 쿼리 없음 |
| `context_export` | `memory_stats` + `memory_recall({ compact: true, mode: "graph" })` + 수동 포맷 = 3회 호출 | 하나의 마크다운 내보내기 | 출력을 직접 포맷; 에이전트가 "마크다운으로 포맷" 단계를 건너뜀 |

> **팁:** 세션 시작 시 `context_generate`를 사용하세요 (93% 토큰 절약). "마지막 이후 무엇이 바뀌었나?"에는 `context_diff`를 사용하세요 (72% 절약). 특정 주제에 대한 심층 분석에는 `context_focus`를 사용하세요 (45% 절약).

`gpt-tokenizer` (cl100k_base)로 실제 프로젝트 시나리오에서 측정 — `scripts/bench-context-tools.mjs` (`npm run bench:context`) 참조.

### 전체 세션 영향 (측정)

메모리 없이, `memory_recall` 사용, `context_*` 도구 사용의 3가지 접근법으로 전체 5단계 에이전트 세션(세션 시작 → 디버깅 → 구현 → 코드 리뷰 → 마무리)을 시뮬레이션합니다.

```
단계                                      메모리 없이         memory_recall      context_* 도구
─────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
단계 1: 세션 시작                         516 t /  6 c       409 t /  3 c       373 t /  1 c
단계 2: 이슈 디버깅                        176 t /  4 c       182 t /  2 c       252 t /  1 c
단계 3: 기능 구현                          189 t /  6 c       183 t /  3 c       305 t /  1 c
단계 4: 코드 리뷰                          316 t /  4 c       130 t /  2 c       243 t /  1 c
단계 5: 마무리                           1,214 t /  5 c        68 t /  2 c       117 t /  1 c
─────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
합계                                  2,411 t / 25 c       972 t / 12 c     1,290 t /  5 c
```

**주요 발견:**

| 지표 | 메모리 없이 | memory_recall 사용 | context_* 도구 사용 |
|--------|---------------|-------------------|---------------------|
| 세션당 토큰 | 2,411 | 972 (-60%) | 1,290 (-47%) |
| 세션당 도구 호출 | 25 | 12 (-52%) | **5 (-80%)** |
| 세션당 비용 (GPT-4) | $0.072 | $0.029 | $0.039 |

**트레이드오프:** `memory_recall`은 매칭된 항목만 반환하므로 더 적은 토큰(972 vs 1,290)을 사용합니다. `context_*` 도구는 **더 풍부한 컨텍스트**(호출자, 관련 파일, 테스트 파일, 건강 감사)를 반환합니다 — 호출당 더 많은 토큰이지만 **80% 적은 도구 호출**. 실제로 에이전트는 `context_focus`에 이미 포함된 3-4개의 후속 "관련 항목 찾기" 호출을 피하게 됩니다.

**context_*가 크게 이기는 부분:**
- **세션 시작** (단계 1): 28% 적은 토큰 + 6→1 호출 — 하나의 브리핑이 6개 파일 읽기를 대체
- **마무리** (단계 5): 90% 적은 토큰 — `context_health`가 5개의 수동 스캔을 대체
- **도구 호출**: 25→5 호출 = 세션당 **80% 적은 지연 오버헤드**

> **팁:** 특정 항목이 필요하면 `memory_recall`을 사용하세요 (더 적은 토큰). 더 적은 왕복으로 포괄적인 컨텍스트가 필요하면 `context_*`를 사용하세요 (더 적은 호출).

`gpt-tokenizer` (cl100k_base)로 측정 — `scripts/bench-full-impact.mjs` (`npm run bench:full`) 참조.

> **팁:** `memory_smart_recall`은 BM25 + 그래프 + 품질을 하나의 호출로 결합하여 토큰과 도구 호출 오버헤드를 모두 절약합니다. 모든 작업 시작 시 사용하세요.

---

## 문제 해결

### 설치 후 메모리를 찾을 수 없음

**증상:** 에이전트가 메모리 도구가 없다고 말합니다.

**해결:**
1. `npx toon-memory status`를 실행하여 설치 확인
2. 에이전트를 완전히 재시작 (닫고 다시 열기)
3. MCP 설정 파일이 존재하고 유효한 JSON인지 확인

### 메모리 파일이 비어 있음

**증상:** `memory_stats`가 0개 항목을 표시합니다.

**해결:** 이것은 첫 설치 시 정상입니다. `memory_remember`를 사용하여 항목을 저장하기 시작하세요.

### 중복 항목

**증상:** 같은 키가 여러 번 나타납니다.

**해결:** 같은 키로 `memory_remember`하면 이제 자동으로 병합됩니다 (태그 합집합, 최대 신뢰도, 최신 날짜). 모든 같은 키 항목을 병합하고 동일한 콘텐츠의 중복을 제거하려면 `memory_consolidate`를 사용하세요. 수동 정리를 위해서는 `memory_forget`을 사용하세요.

### 암호화 키 분실

**증상:** 메모리를 복호화할 수 없습니다.

**해결:** 안타깝게도 복구는 불가능합니다. 암호화 키는 생성 후 어디에도 저장되지 않습니다. 이것이 보안을 위한 설계입니다. 새로 시작하거나 암호화되지 않은 백업에서 복원해야 합니다.

### 메모리가 너무 큼

**증상:** 에이전트 응답이 느립니다.

**해결:**
1. `memory_archive()`를 실행하여 오래된 항목을 아카이브로 이동
2. `memory_forget`을 사용하여 관련 없는 항목 제거
3. 항목을 간결하게 유지 — 대화 전체가 아닌 결정을 저장
4. 저품질 항목(모호함, 태그 없음)은 자동으로 리콜 우선순위가 낮아집니다

---

## FAQ

### 어떤 AI 에이전트와도 작동하나요?

네, MCP(Model Context Protocol)를 지원하는 모든 에이전트와 작동합니다. 15개 에이전트에 자동 설정을 지원하며, 다른 에이전트는 수동 설정이 가능합니다.

### 데이터가 외부로 전송되나요?

아니요. 모든 것이 로컬에 유지됩니다. MCP 서버는 로컬에서 stdio를 통해 실행됩니다 — 네트워크 호출, 텔레메트리, 클라우드가 없습니다.

### 여러 머신에서 사용할 수 있나요?

네, `.toon-memory/memory/` 디렉토리를 동기화하면 됩니다 (예: Git 또는 공유 폴더). 각 머신에 toon-memory가 설치되어야 하지만, 메모리 파일은 이동식입니다.

### 여러 프로젝트가 있으면 어떻게 되나요?

각 프로젝트는 고유 메모리 파일을 가집니다. 메모리는 프로젝트 간에 유출되지 않습니다.

### 특정 항목만 암호화할 수 있나요?

아니요, 암호화는 전체 메모리 파일에 적용됩니다. 선택적 암호화가 필요하면 민감한 데이터를 별도의 도구에 보관하세요.

### 마크다운 파일을 그냥 사용하는 것과 무엇이 다른가요?

마크다운 파일은 구조화되어 있지 않으며, 에이전트가 같은 방식으로 검색할 수 없고, MCP를 통해 통합되지 않으며, 아카이빙, 날짜 필터링, 품질 점수, 병합-중복제거, 신뢰도 추적, 암호화 등의 기능이 없습니다. toon-memory는 AI 에이전트를 위해 특별히 제작되었습니다.

---

## 개발

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
npm run build
npm test
```

### 프로젝트 구조

```
toon-memory/
├── src/
│   ├── bin/
│   │   └── toon-memory.ts      # 진입점
│   ├── cli/
│   │   ├── setup.ts             # CLI 명령어
│   │   └── toon-memory.ts       # CLI 러너
│   ├── mcp/
│   │   └── server.ts            # MCP 서버 (35개 도구 + 4개 리소스)
│   ├── lib/
│   │   ├── lock.ts              # 조언 파일 잠금 + 원자적 쓰기
│   │   ├── sessions.ts          # 다세션 협업
│   │   ├── graph.ts             # 메모리 그래프 (파싱, 구축, BM25, 중심성, 컴팩트 렌더링)
│   │   ├── quality.ts           # 품질 점수, 병합-중복제거, 스마트 리콜, 시스템 프라이머
│   │   ├── context.ts           # 컨텍스트 브리핑 생성기 (원 호출 컨텍스트)
│   │   └── vocab.ts             # 의존성에서 프로젝트 어휘 탐지
├── tests/
│   ├── cli.test.ts              # CLI 테스트
│   ├── memory.test.ts           # 메모리 테스트
│   ├── sessions.test.ts         # 다세션 테스트
│   ├── graph.test.ts            # 메모리 그래프 테스트
│   └── quality.test.ts          # 품질 점수, 병합-중복제거, 스마트 리콜, 시스템 프라이머 테스트
├── .github/workflows/
│   ├── ci.yml                   # CI (Node.js 20/22)
│   └── publish.yml              # 릴리스 시 자동 게시
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 기여하기

기여를 환영합니다! 먼저 [행동 강령](CODE_OF_CONDUCT.md)과 [기여 가이드](CONTRIBUTING.md)를 읽어주세요.

1. 리포지토리 포크
2. 피처 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. 풀 리퀘스트 열기

---

## 라이선스

MIT

---

## 크레딧

[@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon)과 [@modelcontextprotocol/server](https://www.npmjs.com/package/@modelcontextprotocol/server)로 제작되었습니다.
