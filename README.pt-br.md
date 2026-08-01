[English](README.md) | [Español](README.es.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português (BR)](README.pt-br.md) | [Deutsch](README.de.md) | [Français](README.fr.md)

# toon-memory

> Servidor MCP de memória para agentes de IA — lembre decisões, padrões e bugs entre sessões.

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://luiggival08.github.io/toon-memory/)

---

## Índice

- [O que é toon-memory?](#o-que-é-toon-memory)
- [Post no Blog](#post-no-blog)
- [Funcionalidades](#funcionalidades)
- [Início Rápido](#início-rápido)
- [Agentes Suportados](#agentes-suportados)
- [Ferramentas MCP](#ferramentas-mcp)
- [Coordenação multi-sessão](#coordenação-multi-sessão)
- [Grafo de Memória (recall baseado em grafo)](#grafo-de-memória-recall-baseado-em-grafo)
- [Dicas e Melhores Práticas](#dicas-e-melhores-práticas)
- [Comandos CLI](#comandos-cli)
- [Configuração](#configuração)
- [Como Funciona](#como-funciona)
- [Por que TOON?](#por-que-toon)
- [Solução de Problemas](#solução-de-problemas)
- [Perguntas Frequentes](#perguntas-frequentes)
- [Desenvolvimento](#desenvolvimento)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## O que é toon-memory?

Já teve aquela sensação de que seu agente de IA esquece tudo da sessão de ontem? Você explica a mesma decisão de arquitetura pela terceira vez e ele ainda sugere a abordagem que você já rejeitou?

**toon-memory resolve isso.** Ele dá ao seu agente de IA uma memória persistente que sobrevive a reinícios, para que ele realmente aprenda com o projeto ao longo do tempo.

📖 **[Leia a documentação](https://luiggival08.github.io/toon-memory/)**

### Casos de uso reais

| Cenário | O que o toon-memory faz |
|---------|------------------------|
| Debates de design | "Escolhemos Redis ao invés de Memcached por causa do suporte a pub/sub" |
| Escolhas de framework | "Este projeto usa Zod para validação, não Joi" |
| Correções de bugs | "Esgotamento do pool de Redis — a correção foi max_connections=20" |
| Notas de arquitetura | "O serviço broker usa o protocolo RESP, não HTTP" |
| Onboarding | "O script de deploy fica em scripts/deploy.sh" |
| Contexto do time | "O PR #142 reverteu a alteração de cache — não adicione novamente" |

---

## Post no Blog

Leia [Como o toon-memory Torna Seu Agente de IA Mais Inteligente](https://luiggival08.github.io/toon-memory/blog) para ver uma demonstração real de memória persistente em ação.

---

## Funcionalidades

- **35 ferramentas MCP** — Gerenciamento completo de memória via Model Context Protocol, incluindo `memory_smart_recall` (recall unificado), `memory_sessions` para coordenação multi-sessão, e ferramentas `context_*` para geração de contexto em uma única chamada (briefing, diff, foco, auditoria de saúde, exportação)
- **Recursos MCP** — Leia memória como contexto sem invocações de ferramentas, incluindo um System Primer (mapa de conhecimento auto-gerado)
- **15 agentes suportados** — OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex CLI, Gemini CLI, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro
- **Instalador interativo** — Selecione quais agentes configurar a partir de um menu
- **Hooks SessionStart** — Lembretes automáticos para Claude Code, Codex CLI, Gemini CLI, Antigravity
- **Formato TOON** — 22% menos tokens que JSON (medido), melhor compreensão por LLMs
- **Memória por projeto** — Cada projeto recebe seu próprio arquivo de memória
- **Zero config** — Basta instalar e usar
- **Auto gitignore** — Adiciona automaticamente `.toon-memory/memory/` ao `.gitignore`
- **Filtro por data** — Busque memória por intervalo de datas
- **Auto-arquivamento** — Entradas antigas (>30 dias), entradas com TTL expirado, ou mais de 100 entradas são movidas automaticamente para o arquivo
- **Criptografia** — Criptografia AES-256-GCM para dados sensíveis
- **Modo watch** — Backup automático a cada N minutos
- **TTL da memória** — Expiração configurável por entrada (7d, 30d, ou datas exatas)
- **Inferência de tags** — Detecção automática de tags a partir do conteúdo quando as tags estão vazias (vocabulário interno + dependências do projeto)
- **Diff de memória** — Veja o que mudou desde a sua última sessão
- **Entradas relacionadas** — Sugestão automática de memórias relacionadas ao salvar
- **Grafo de memória** — Conecte entradas com refs `links`/`[[key]]`; `memory_recall` pode expandir um subgrafo consciente de relacionamentos para um recall mais preciso e com menos tokens (sem embeddings, sem LLM)
- **Recall eficiente em tokens** — `memory_recall({ compact: true })` retorna entradas com índice numérico, remove `id`/`date`/`file`, renderiza arestas do grafo como `->2`, e trunca vizinhos do grafo para trechos
- **Ranking BM25 + centralidade** — Re-ranking do recall por relevância BM25 e centralidade do grafo (hubs aparecem mesmo sem a palavra da consulta); decaimento por hop mantém nós distantes com baixa pontuação
- **Auto-tag de dependências** — `toon-memory init` escaneia seus manifestos de dependências e escreve um vocabulário do projeto, para que entradas mencionando uma dependência recebam a tag automaticamente
- **Recall inteligente** — `memory_smart_recall` combina BM25 + grafo + decaimento + qualidade em uma única chamada; o LLM chama isso no início de cada tarefa
- **Pontuação de qualidade** — Cada entrada recebe uma pontuação de qualidade (0–1) baseada na estrutura (tags, links, especificidade do conteúdo, recência); entradas de alta qualidade aparecem primeiro
- **Merge-dedup** — Salvar com a mesma `key` mescla atributos (união de tags, confiança máxima, data mais recente, links combinados) ao invés de sobrescrever
- **Pontuação de confiança** — Cada entrada rastreia a confiabilidade: declarada pelo usuário = 1.0, inferida = 0.65–0.75
- **Ferramentas de geração de contexto** — `context_generate` (briefing completo), `context_diff` (incremental), `context_focus` (direcionado), `context_health` (auditoria), `context_export` (markdown) — cada uma substitui 5-6 chamadas manuais de ferramentas. Zero LLM, pura agregação determinística
- **System Primer** — Mapa de conhecimento auto-gerado exposto como recurso MCP; agentes carregam no início da sessão para contexto instantâneo

---

## Início Rápido

### 1. Instale

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex

# Ou com npm (qualquer plataforma)
npm i -g toon-memory
```

> **Dica:** A instalação via npm é o método mais confiável. Os scripts curl/irm são wrappers de conveniência.

### 2. Configure seus agentes

```bash
# Instalador interativo — detecta agentes e configura o MCP
npx toon-memory
```

O instalador vai:
1. Detectar quais agentes de IA você tem instalados
2. Perguntar quais configurar
3. Adicionar a configuração do servidor MCP automaticamente

### 3. Use

Pronto! Na sua próxima sessão do agente, tente:

```bash
memory_stats      # Veja o que tem na memória
memory_recall     # Busque na memória antes de ler arquivos
memory_remember   # Salve decisões importantes
```

> **Dica:** Sempre execute `memory_recall` no início de uma sessão. Seu agente terá contexto das sessões anteriores instantaneamente.

---

## Agentes Suportados

| Agente | Local da Configuração | Formato | Hooks | Configuração Automática |
|--------|----------------------|---------|-------|------------------------|
| **OpenCode** | `.opencode/opencode.json` + `.opencode/plugins/toon-memory.ts` | Plugin | SessionStart (plugin, sem `hooks` de nível superior) | ✅ |
| **VS Code / Copilot** | `.vscode/mcp.json` | JSON | — | ✅ |
| **Claude Code** | `.mcp.json` (MCP) + `.claude/settings.json` (hooks) | JSON | SessionStart + PostToolUse + Stop | ✅ |
| **Cursor** | `.cursor/mcp.json` | JSON | — | ✅ |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | JSON | — | ✅ |
| **Cline** | `.cline/mcp.json` | JSON | — | ✅ |
| **Continue** | `.continue/config.json` | JSON | — | ✅ |
| **Codex CLI** | `.codex/config.toml` | TOML | SessionStart + PostToolUse + Stop (`[[hooks]] event=`) | ✅ |
| **Gemini CLI** | `.gemini/settings.json` | JSON | SessionStart + PostToolUse + Stop (`hooks.*`) | ✅ |
| **Zed** | `~/.config/zed/settings.json` | JSONC | — | ✅ |
| **Antigravity** | `.agents/mcp_config.json` + `.agents/hooks.json` | hooks.json | PreInvocation + PostToolUse + Stop (sem evento SessionStart) | ✅ |
| **Aider** | — | — | — | 📝 Instruções |
| **KiloCode** | `~/.kilocode/mcp_settings.json` | JSON | — | ✅ |
| **OpenClaw** | `.openclaw.json` | JSON | — | ✅ |
| **Kiro** | `.kiro/settings/mcp.json` | JSON | — | ✅ |

> **Dica:** Você pode configurar toon-memory para vários agentes ao mesmo tempo. Cada agente recebe o mesmo arquivo de memória compartilhada em `.toon-memory/memory/`.

---

## Ferramentas MCP

| Ferramenta | Descrição |
|------------|-----------|
| `memory_remember` | Salve uma decisão, padrão, bug ou conhecimento (TTL opcional, inferência automática de tags, `links` para construir o grafo de memória, merge-dedup na mesma chave, pontuação automática de qualidade e confiança) |
| `memory_recall` | Busque na memória (use ANTES de ler arquivos, filtra TTL expirado). `mode: "graph"` expande um subgrafo consciente de relacionamentos para maior precisão. `compact: true` retorna um formato eficiente em tokens com índice numérico. Ranking ponderado por qualidade. `sessionBias` impulsiona entradas da branch git atual |
| `memory_smart_recall` | **Recall unificado**: BM25 + grafo + decaimento + qualidade em uma chamada. Use no INÍCIO de cada tarefa. `sessionBias` impulsiona entradas da branch git atual. Retorna saída compacta e eficiente em tokens |
| `memory_forget` | Remova uma entrada por chave ou id |
| `memory_stats` | Veja o estado da memória (incluindo estatísticas de TTL e distribuição de qualidade e memórias frias abaixo dos limiares de qualidade/acesso) |
| `memory_summary` | Salve/recupere resumos de arquivos |
| `memory_archive` | Arquive entradas antigas (>30 dias) e entradas com TTL expirado |
| `memory_diff` | Mostre mudanças desde uma data (24h, 7d, ou data exata) |
| `memory_suggest` | Encontre entradas relacionadas para um determinado contexto |
| `memory_encrypt` | Ative a criptografia AES-256-GCM |
| `memory_decrypt` | Desative a criptografia |
| `memory_backup` | Crie backup com timestamp do arquivo de memória (poda automática para os 10 mais recentes) |
| `memory_captured` | Liste atividade capturada automaticamente por hooks (opt-in) ou limpe o log |
| `memory_checkpoint` | **Ponto de verificação**: cria um snapshot do estado atual da memória com TTL de 7d. Útil para referência de rollback durante sessões longas |
| `memory_consolidate` | **Operações de limpeza** determinísticas (sem LLM): `mode: "identical"` (padrão) deduplica entradas de conteúdo idêntico, `"similar"` mescla quase-duplicatas (Jaccard >50%), `"low-quality"` limpa em lote entradas de baixa qualidade (`minQuality`, `dryRun`) |
| `memory_sessions` | Mostre sessões ativas do agente (branch, arquivos, último acesso) e conflitos suaves para trabalho paralelo |
| `memory_compress` | Compressão com LLM em dois passos: resumir + sobrescrever. Usa Anthropic/OpenAI CLI se disponível |
| `memory_primer` | Primer de contexto em uma chamada: memórias principais + categorias + mudanças de arquivos. Injetado automaticamente no início da sessão |
| `memory_merge_sessions` | Mescla observações entre sessões paralelas para um arquivo. Deduplica e promove automaticamente |
| `memory_export_gist` | Exporta entradas para um GitHub Gist (público ou privado). Usa GITHUB_TOKEN ou gh CLI |
| `memory_import_gist` | Importa entradas de um GitHub Gist. Mescla com entradas existentes (união de tags, confiança máxima) |
| `memory_graph_path` | Caminho BFS mais curto entre duas entradas no grafo de conhecimento |
| `context_brief` | **Briefing de contexto em uma chamada**: memória + sessões + saúde em markdown compacto. Use no lugar de 5-6 chamadas separadas de memory_*. Zero LLM, pura agregação determinística |
| `context_generate` | **Briefing completo do projeto**: combina estrutura do projeto, estado do git, entradas de memória e sessões ativas em uma chamada. Substitui 5-6 chamadas manuais de ferramentas |
| `context_diff` | **Briefing incremental**: commits git + arquivos modificados + memória nova/atualizada + sessões ativas desde a última sessão |
| `context_focus` | **Briefing hiper-focado**: apenas memória relevante + arquivos fonte relacionados + chamadores + arquivos de teste para uma consulta |
| `context_health` | **Auditoria de saúde da memória**: links órfãos, duplicatas, refs de arquivo quebradas, TTL expirado, sessões obsoletas, pontuação 0–100 |
| `context_export` | **Exporte memória como markdown**: contexto injetável para system prompts (completo ou compacto) |
| `memory_pin` | **Fixar entrada com prioridade 1-5**: entradas fixadas sempre aparecem primeiro nos resultados de recall, classificadas por prioridade, mesmo sem correspondência de palavra-chave |
| `memory_unpin` | **Desafixar entrada**: remove a flag de prioridade |
| `memory_search` | **Pesquisa unificada com filtros**: mesmo que `memory_recall` mais filtros `category`, `tags`, `from_date`, `to_date`. O filtro de tags usa lógica AND — todas as tags especificadas devem corresponder. `sessionBias` impulsiona entradas da branch git atual |
| `memory_tag` | **Operações em lote de tags**: `add`, `remove` ou `set` tags em uma ou mais entradas por key ou id |

### Recursos MCP

A memória também é exposta como recursos MCP para leitura direta de contexto:

| Recurso | URI | Descrição |
|---------|-----|-----------|
| Entradas de Memória | `toon://memory/entries` | Dump completo da memória |
| Estatísticas de Memória | `toon://memory/stats` | Contagens por categoria e informações de TTL |
| System Primer | `toon://memory/summaries` | Mapa de conhecimento auto-gerado (principais entradas, categorias, padrões) |

### Exemplos

#### Salvar uma decisão

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

> **Dica:** Use chaves descritivas como `use-zod` ao invés de vagas como `validation`. Seu agente busca por chave e conteúdo, então especificidade ajuda. Salvar com a mesma chave mescla automaticamente (união de tags, confiança máxima).

#### Salvar com TTL

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

> **Dica:** Use TTL para contexto temporário como prazos, informações de sprint ou anotações com data de validade. Entradas com TTL expirado são automaticamente filtradas dos resultados de busca.

#### Tags inferidas automaticamente

```typescript
memory_remember({
  category: "bug",
  key: "redis-connection-timeout",
  content: "Redis connection timeout in production, increased pool size"
  // tags deixadas vazias — inferidas automaticamente do conteúdo
})
// 🧠 Guardado: bug/redis-connection-timeout (a1b2c3d4)
// 🏷️ Tags inferidos: redis
// Quality score is calculated automatically based on inferred tags and content.
```

> **Dica:** Deixe `tags` vazias e o sistema vai inferi-las a partir do seu conteúdo usando um vocabulário interno de mais de 20 categorias (redis, auth, api, db, security, etc.) **mais** um vocabulário do projeto derivado das suas dependências no momento do `init`. Então, se seu projeto depende de `redis`, qualquer entrada mencionando "redis" recebe a tag `redis` automaticamente.

#### Buscar na memória

```typescript
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **Dica:** Busque antes de ler arquivos. Isso economiza tokens e dá ao seu agente contexto que ele não obteria apenas do código. O ranking ponderado por qualidade garante que as entradas mais úteis apareçam primeiro. Ou use `memory_smart_recall` para um resultado mais abrangente.

#### Busca com filtro de data

```typescript
memory_recall({
  query: "redis",
  from_date: "2026-07-01",
  to_date: "2026-07-31"
})
```

> **Dica:** Use filtros de data quando você lembra aproximadamente *quando* algo aconteceu, mas não exatamente *o quê*. O ranking ponderado por qualidade continua se aplicando.

#### Arquivar entradas antigas

```typescript
memory_archive()
// 📦 Archivadas 5 entradas antiguas
// 📋 Quedan 42 entradas activas
```

> **Dica:** Execute isso periodicamente para manter a memória enxuta. Entradas arquivadas ainda são pesquisáveis via `memory_recall` com filtros de data. Entradas com TTL expirado também são arquivadas automaticamente. Entradas de baixa qualidade recebem menor prioridade de recall.

#### Mostrar mudanças desde a última sessão

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

> **Dica:** Use `memory_diff` no início de uma sessão para ver o que seu agente aprendeu desde a última vez que você trabalhou no projeto. Novas entradas incluem pontuações de qualidade.

#### Encontrar entradas relacionadas

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

> **Dica:** Use `memory_suggest` quando precisa de contexto sobre um tópico mas não tem certeza do que buscar. Ou use `memory_smart_recall` para um resultado mais abrangente.

#### Recall inteligente (unificado)

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

> **Dica:** Use `memory_smart_recall` no INÍCIO de cada tarefa. Ele combina BM25 + grafo + decaimento + qualidade em uma chamada — não precisa adivinhar o que buscar.

#### Briefing completo do projeto (uma chamada)

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

> **Dica:** Use `context_generate` no início de uma sessão para obter contexto completo em uma chamada. Substitui 5-6 chamadas de ferramentas separadas.

#### Auditoria de saúde da memória

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

> **Dica:** Execute `context_health` quando a memória parecer bagunçada. Mostra links órfãos, duplicatas, entradas com TTL expirado e referências de arquivo quebradas.

#### Merge-dedup (automático)

Quando você salva com a mesma `key`, os atributos são mesclados ao invés de sobrescritos:

```typescript
// Primeira salvaguarda
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  tags: "types"
})
// 🧠 Guardado: decision/use-zod (a1b2c3d4)

// Salvaguarda posterior com a mesma chave — mescla automaticamente
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation — also handles API response parsing",
  tags: "types;api"
})
// 🧠 Actualizado: decision/use-zod (a1b2c3d4)
// 🔗 Merge: tags combinados, fecha y links actualizados
// Tags agora: "types;api" (união de ambas)
```

> **Dica:** Use chaves descritivas e estáveis. A mesma chave = mesclar, chave diferente = nova entrada.

#### Pontuação de qualidade

Cada entrada recebe automaticamente uma pontuação de qualidade (0–1) baseada na estrutura:

| Fator | Peso | O que mede |
|-------|------|------------|
| Tags | 0.3 máx | Tags mais específicas = qualidade maior |
| Links | 0.2 máx | Entradas conectadas = qualidade maior |
| Tamanho do conteúdo | 0.3 máx | Detalhado > vago |
| Recência | 0.1 máx | Entradas recentes pontuam mais |
| Especificidade | 0.1 máx | Palavras únicas vs palavras repetidas |

Entradas de alta qualidade aparecem primeiro no recall. Verifique a qualidade com `memory_stats`:

```typescript
memory_stats()
// ...
// Calidad promedio: 0.58 (12 con score)
```

#### Pontuação de confiança

Cada entrada rastreia a confiabilidade da informação:

| Fonte | Confiança | Significado |
|-------|-----------|-------------|
| Afirmação do usuário | 1.0 | "Usamos Postgres" — afirmação direta |
| Inferida | 0.65–0.75 | Agente inferiu a partir do contexto |
| Incerta | 0.50 | O agente está adivinhando |

A confiança é preservada no merge (máxima das duas entradas).

#### System Primer

O System Primer é um mapa de conhecimento auto-gerado exposto como recurso MCP. Agentes carregam no início da sessão para contexto instantâneo:

```typescript
// Exposed as toon://memory/summaries
// Auto-regenerates on every read
// Contains: top entries, categories, patterns
```

> **Dica:** Adicione `toon://memory/summaries` ao system prompt do seu agente para contexto instantâneo no início da sessão.

#### Ativar criptografia

```typescript
// Primeiro, defina TOON_MEMORY_KEY no seu ambiente (ou arquivo .env):
// export TOON_MEMORY_KEY="your-secret-key-here"

memory_encrypt()
// 🔐 Encriptación habilitada
```

> **Aviso:** A chave de criptografia deve ser definida via variável de ambiente `TOON_MEMORY_KEY` antes de criptografar. Guarde-a em um local seguro — se você perdê-la, seus dados de memória serão perdidos para sempre. Pontuações de qualidade e confiança são preservadas através da criptografia.

---

## Coordenação multi-sessão

Quando você executa **várias sessões de agente de IA em paralelo** (por exemplo, três sessões do OpenCode no mesmo repositório ao mesmo tempo), elas podem acidentalmente sobrescrever o trabalho umas das outras. toon-memory vem com **`memory_sessions`**, uma ferramenta de coordenação baseada em arquivos que permite que cada sessão veja o que as outras estão fazendo — **sem servidor, sem rede e sem chamadas a LLMs**.

### Como funciona

- Na inicialização, um hook `SessionStart` escreve um **arquivo de heartbeat** para a sessão em `.toon-memory/memory/sessions/<id>.json`. Cada processo escreve *apenas seu próprio* arquivo, então não há contenção de locks.
- O heartbeat registra o nome do agente, o **branch do git**, os **arquivos tocados** e um timestamp de **último acesso**.
- Ler todos esses arquivos fornece a cada sessão uma visão compartilhada e eventualmente consistente de quem mais está ativo.
- Sessões mortas (PID do processo não está mais ativo **e** um heartbeat obsoleto passando da janela de TTL) são removidas preguiçosamente.

### A ferramenta `memory_sessions`

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

- Passe `conflictsOnly: true` para pular a lista de sessões e mostrar apenas conflitos suaves:
  ```typescript
  memory_sessions({ conflictsOnly: true })
  // 🔥 Conflictos suaves (1):
  //
  // ⚠️ src/types.ts
  //    ↔ opencode @ feature/auth (a1b2c3d4), claude @ feature/db (e5f6g7h8)
  ```
- Um **conflito suave** é qualquer arquivo tocado por 2+ sessões ativas — um aviso de que você pode estar editando o mesmo código. Não é um lock duro, apenas um aviso para coordenar.

### Hábito recomendado para sessões paralelas

1. No início de cada sessão, o hook `SessionStart` já imprime as outras sessões ativas e quaisquer conflitos suaves.
2. Execute `memory_smart_recall({ intent: "what I'm working on" })` para obter contexto completo (memória + grafo + qualidade).
3. Execute `memory_sessions()` para ver o panorama completo (branches, arquivos, último acesso) e `memory_sessions({ conflictsOnly: true })` se você só se importa com choques.
3. Se você compartilha um arquivo com outra sessão, sincronize antes de editar para não sobrescrever as alterações uma da outra.

> **Dica:** Isso é puramente local e sem locks — seguro para executar quantas vezes quiser. Combine com `memory_smart_recall({ intent: "project context" })` no início da sessão para *memória* e *presença* entre sessões. O system primer (recurso MCP) também fornece contexto instantâneo.

---

## Grafo de Memória (recall baseado em grafo)

Quando sua memória cresce, uma busca por palavras-chave plana pode retornar demais (toda correspondência) ou o contexto errado (sem relacionamentos). toon-memory pode tratar a memória como um **grafo de conhecimento leve** para que o recall retorne as entradas *certas* com menos tokens. Combinado com pontuação de qualidade, as entradas mais úteis aparecem primeiro.

É totalmente **determinístico e offline** — sem embeddings, sem banco de dados vetorial, sem LLM, sem servidor. As arestas vêm de duas fontes:

- **`links` explícitos** — chaves que você declara ao salvar uma entrada.
- **Refs `[[key]]` implícitas** — qualquer menção a `[[alguma-chave]]` dentro do conteúdo.

### Como funciona

1. `memory_remember` armazena `links` na entrada (chaves separadas por espaço ou `;`). A pontuação de qualidade é calculada automaticamente.
2. `memory_recall({ mode: "graph" })` encontra correspondências por palavra-chave (sementes), depois expande o **subgrafo ego** até `hops` (1 ou 2) ao longo das arestas.
3. A relevância se propaga das sementes para seus vizinhos, então uma decisão ou spec relacionada aparece mesmo que não contenha a palavra da consulta. O ranking ponderado por qualidade garante que as entradas mais úteis apareçam primeiro.
4. O conjunto de resultados é limitado (`limit`, padrão 6) → **menos contexto e mais preciso** para o agente. Ou use `memory_smart_recall` para uma chamada unificada.

### Salvar com links

```typescript
memory_remember({
  category: "decision",
  key: "risk-engine-priority",
  content: "The engine prioritizes risk over speed (see [[risk-spec]]).",
  file: "spec.md:10",
  tags: "risk;spec",
  links: "engine-arch"          // aresta explícita para outra entrada
})
// 🧠 Guardado: decision/risk-engine-priority (a1b2c3d4)
// Quality score is calculated automatically based on tags, links, and content detail.
```

### Recall com modo grafo

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

> **Dica:** Use `mode: "graph"` quando uma decisão se espalha por várias entradas (arquitetura, specs, bugs relacionados). Para fatos isolados, o modo padrão `flat` é suficiente. Ou use `memory_smart_recall` que combina grafo + BM25 + qualidade automaticamente.

### Recall eficiente em tokens (`compact`)

Quando cada token conta, passe `compact: true` para obter uma saída mais densa:

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

Como `compact` altera a saída:

- Cada entrada recebe um índice numérico estável (`[1]`, `[2]`, …) na ordem da pontuação.
- `id`, `date` e `file` são removidos — apenas `tags` é mantido.
- No modo `graph`, as arestas são renderizadas como `->2` (numérico, não nomes de chaves).
- Vizinhos alcançados via grafo (não-sementes) são truncados para um trecho curto com reticências, enquanto sementes correspondidas diretamente mantêm seu conteúdo completo.
- O ranking ponderado por qualidade garante que as entradas mais úteis apareçam primeiro.
- O arquivo `.toon` armazenado **nunca** é alterado — `compact` apenas remodela a resposta.

> **Dica:** Combine `compact: true` com `mode: "graph"` para a menor janela de contexto possível ao fazer recall de uma memória grande e interconectada. Ou use `memory_smart_recall` que faz isso automaticamente.

### Como o recall classifica os resultados

O recall é determinístico e offline (sem embeddings, sem LLM). Cada entrada candidata recebe uma pontuação combinada:

- **Relevância BM25** — pontuação clássica probabilística de frequência de termo em relação à consulta, usando `id` + `category` + `key` + `content` + `file` + `tags` + `quality` + `confidence`.
- **Centralidade do grafo** — normalizada por grau (0..1); um hub conectado a muitas entradas pontua próximo de 1, então aparece mesmo sem a palavra da consulta.
- **Importância** — recência + frequência de acesso (mesmo sinal usado em outro lugar).
- **Bônus de qualidade** — entradas com pontuações de qualidade mais altas (mais tags, links, detalhes) recebem um impulso no ranking.
- **Bônus de semente** — entradas que correspondem diretamente à consulta recebem um impulso fixo.
- **Decaimento por hop** — nós a `hops` de distância de uma semente são multiplicados por `0.5^d`, então contexto distante fica abaixo do contexto próximo.

No modo `graph`, o recall usa correspondências por palavras-chave como sementes, expande o subgrafo ego até `hops`, e retorna os top `limit` (padrão 6) por pontuação combinada. `memory_smart_recall` combina todos esses sinais em uma chamada.

### Auto-tag de dependências do projeto

No `toon-memory init`, o CLI escaneia seus manifestos de dependências e escreve uma tabela `vocab` em `.toon-memory/memory/config.json`:

```json
{
  "vocab": {
    "react": ["react"],
    "zod": ["zod"],
    "redis": ["redis"]
  }
}
```

`memory_remember` então compara novas entradas com esse vocabulário além do interno, para que mencionar uma dependência no seu conteúdo anexe sua tag automaticamente. Mais tags = pontuação de qualidade maior. Manifestos suportados: `package.json`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, `go.mod`.

> **Dica:** Execute novamente `toon-memory init` após adicionar dependências principais para atualizar o vocabulário. A chave `vocab` é mesclada (nunca sobrescrita) com as flags `encrypted`/`capture` em `config.json`. Mais tags = pontuação de qualidade maior.

---

## Dicas e Melhores Práticas

Aqui estão alguns padrões que funcionam bem com toon-memory:

### O hábito do "início de sessão"

No início de cada nova sessão, execute:
```
memory_smart_recall({ intent: "what I was working on" })
```
Isso dá ao seu agente contexto instantâneo sobre o que aconteceu antes — combinando BM25, grafo, qualidade e decaimento em uma chamada.

### O hábito do "fim de sessão"

Antes de encerrar uma sessão, salve qualquer coisa importante:
```
memory_remember({
  category: "decision",
  key: "auth-approach",
  content: "Chose JWT over sessions — stateless, works across microservices",
  file: "src/auth.ts",
  tags: "auth;architecture"
})
```
A entrada recebe automaticamente uma pontuação de qualidade baseada em sua estrutura (tags, detalhe do conteúdo, links).

### Escolhendo categorias

| Categoria | Quando usar |
|-----------|-------------|
| `decision` | Escolhas de arquitetura, trade-offs, "por que X ao invés de Y" |
| `pattern` | Convenções, frameworks, regras de estilo de código |
| `bug` | Problemas que você corrigiu e como |
| `knowledge` | Fatos do projeto, informações de domínio, contexto do time |

> **Dica:** Não pense demais. Se é algo que você futuro (ou agente) gostaria de saber, salve. Entradas detalhadas com tags específicas pontuam mais na qualidade.

### Tags que funcionam bem

Use tags separadas por ponto e vírgula para fácil filtragem:
```
tags: "redis;performance;fix"
tags: "auth;jwt;security"
tags: "api;rest;versioning"
```

> **Dica:** Mantenha tags curtas e consistentes. Não são hashtags — são filtros de busca. Tags mais específicas = pontuação de qualidade maior.

### O que NÃO salvar

- Não salve coisas que são óbvias ao ler o código
- Não salve anotações temporárias de debug
- Não salve senhas, chaves de API ou credenciais (use variáveis de ambiente)
- Não duplique a mesma informação com chaves diferentes (merge-dedup cuida automaticamente da mesma chave)
- Entradas vagas sem tags recebem baixa pontuação de qualidade — seja específico

### Mantenha a memória limpa

Execute `memory_archive()` mensalmente para mover entradas antigas para o arquivo. Execute `memory_stats()` para verificar o tamanho e a distribuição de qualidade. Entradas de baixa qualidade (conteúdo vago, sem tags) recebem menor prioridade de recall automaticamente. Use `memory_consolidate` para mesclar duplicatas.

---

## Comandos CLI

```bash
npx toon-memory              # Instalador interativo
npx toon-memory init         # Configuração rápida (sem perguntas)
npx toon-memory mcp          # Execute o servidor MCP diretamente
npx toon-memory status       # Verifique o status da instalação
npx toon-memory stats        # Veja estatísticas da memória
npx toon-memory export       # Exporte a memória para JSON
npx toon-memory import <file> # Importe a memória de JSON
npx toon-memory watch [options] # Backup automático com opções
npx toon-memory upgrade      # Atualize para a versão mais recente
npx toon-memory uninstall    # Remova de todos os agentes
```

### Exemplos

#### Estatísticas

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

> **Dica:** Se a memória ficar muito grande (100+ entradas), considere arquivar ou remover entradas desatualizadas com `memory_forget`.

#### Exportar

```bash
$ npx toon-memory export

🧠 toon-memory export

Exported 45 entries to:
  /path/to/project/toon-memory-export.json
```

> **Dica:** Exporte antes de refatorações grandes. Você sempre pode importar o backup depois se algo der errado.

#### Importar

```bash
$ npx toon-memory import backup.json

🧠 toon-memory import

Imported 3 new entries
Skipped 2 duplicates
```

> **Dica:** Duplicatas são detectadas por chave. Se você quiser re-importar uma entrada, delete a antiga primeiro com `memory_forget`.

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

> **Dica:** O modo watch é ótimo para sessões de longa duração. Use `-c` para comprimir e `-m 5` para manter apenas 5 backups.

**Opções do Watch:**

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `[interval]` | Intervalo de backup em minutos | 5 |
| `-c, --compress` | Ative compressão gzip | desligado |
| `-l, --log [path]` | Ative log em arquivo | desligado |
| `-m, --max-backups <n>` | Máximo de backups a manter (0=ilimitado) | 10 |

---

## Configuração

### Instalador interativo (recomendado)

```bash
npx toon-memory
```

O instalador (requer um terminal) vai:
1. Mostrar todos os 15 agentes suportados com status de detecção (`✓` configuração encontrada) e seu escopo suportado (`local/global` ou `somente local`)
2. Deixar você selecionar quais configurar — por número (`1,3,5`), por nome (`claude,codex`), `all`, Enter para todos, ou `q` para sair
3. Perguntar o escopo de instalação: **(1) Local** (projeto: `.toon-memory` + configs de agente no repositório) ou **(2) Global** (configs em `~home`)
4. Mostrar um resumo de confirmação (`agente → escopo → caminho (MCP/plugin/hooks/instruções)`) e perguntar `Prosseguir? [Y/n]`
5. Configurar o servidor MCP, arquivos de instrução e hooks automaticamente

> Sem um terminal (CI/pipes) `npx toon-memory` imprime a ajuda de instalação não interativa. Use `npx toon-memory init [local|global]` para instalar sem perguntas. Comandos desconhecidos imprimem o uso e saem com erro.



### OpenCode

Adicione ao `.opencode/opencode.json` ou `~/.config/opencode/opencode.json`:

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

> **Os hooks são entregues via um plugin**, não via chave `hooks` de nível superior. OpenCode 1.17+ rejeita `"Unrecognized key: hooks"` em sua configuração — `toon-memory init` escreve `.opencode/plugins/toon-memory.ts` ao invés. Não adicione `hooks` ao `opencode.json`.

### Claude Code

Adicione ao `.mcp.json` (raiz do projeto):

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

Adicione ao `.vscode/mcp.json`:

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

Adicione ao `.codex/config.toml`:

```toml
[mcpServers.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
```

### Gemini CLI

Adicione ao `.gemini/settings.json`:

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

Adicione ao `~/.config/zed/settings.json`:

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

> **Dica:** Use configuração global se quiser memória para todos os projetos. Use configuração no nível do projeto se quiser apenas para projetos específicos.

---

## Como Funciona

1. **Servidor MCP** — Roda localmente, comunica com seu agente via stdio
2. **Formato TOON** — Armazena dados em Token-Oriented Object Notation (~22.5% menos tokens que JSON, medido sobre 16 entradas com gpt-tokenizer). Cada entrada rastreia qualidade (0–1) e confiança (0–1) automaticamente.
3. **Memória por projeto** — Cada projeto recebe `.toon-memory/memory/data.toon`
4. **Zero config** — Basta instalar e usar

### Formato do Arquivo de Memória

```
version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:
  a1b2c3d4|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10||0||0.65|1.0
  e5f6g7h8|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10||0||0.55|1.0
  i9j0k1l2|bug|redis-pool-fix|Added max_connections=20 (see [[use-zod]])|redis.ts|redis;fix|2026-07-10|7d|0|use-zod|0.70|0.9
summaries:
  src/services/redis.ts: Redis connection pool with retry logic
```

### Estrutura de Arquivos

```
.toon-memory/
├── memory/
│   ├── data.toon        # Arquivo principal de memória
│   ├── archive.toon     # Entradas arquivadas (>30 dias)
│   ├── config.json      # Configurações de criptografia
│   └── backups/         # Backups do modo watch
│       ├── backup-2026-07-11T16-00-00-000Z.toon
│       └── backup-2026-07-11T16-10-00-000Z.toon
└── hooks/
    ├── session-start-claude.sh
    ├── session-start-codex.sh
    ├── session-start-gemini.sh
    └── session-start-antigravity.sh
```

---

## Por que TOON?

TOON (Token-Oriented Object Notation) é projetado para LLMs:

| Formato | Tokens (16 entradas) |
|---------|----------------------|
| JSON | 1097 |
| **TOON** | **850** |

Medido com `gpt-tokenizer` (cl100k_base) sobre 16 entradas representativas de memória — veja `scripts/benchmark-toon.mjs` (`npm run bench`).

A economia de tokens se acumula no momento da sessão: `npm run bench:impact` simula a recuperação de contexto **com vs sem** memória e mede ~68% menos tokens para obter o mesmo contexto (recall `compact` ao invés de reler arquivos fonte). O benchmark de sessão completo (`npm run bench:full`) mostra **80% menos chamadas de ferramentas** e **47% menos tokens** com ferramentas context_*.

- **22.5% menos tokens** que JSON no nível do arquivo (até 30.5% em uma única entrada)
- **Viagem de ida e volta sem perdas** — Sem perda de dados
- **Melhor compreensão por LLMs** — Estruturado para consumo por IA
- **Qualidade e confiança** — Cada entrada rastreia qualidade estrutural (0–1) e confiabilidade (0–1) automaticamente

> **Dica:** Menos tokens = respostas mais rápidas + custos de API menores. Seu agente lê os arquivos de memória no início de cada sessão, então eficiência importa.

---

## Benchmark: toon-memory vs Alternativas

| Recurso | toon-memory | @modelcontextprotocol/server-memory | mem0 | shodh-memory |
|---------|-------------|--------------------------------------|------|--------------|
| **Armazenamento** | Arquivo local (TOON) | Arquivo local (JSON) | Cloud | RocksDB |
| **Dependências** | Zero | Zero | API Cloud | sentence-transformers, RocksDB |
| **Busca** | BM25 + grafo + qualidade | Palavra-chave básica | Somente vetorial | Híbrido (vetorial + grafo) |
| **Eficiência de tokens** | 22.5% menos que JSON | Linha de base (JSON) | N/A (cloud) | Similar |
| **Pontuação de qualidade** | Automático (0–1, heurísticas) | Nenhum | Nenhum | Algoritmo BND |
| **Merge-dedup** | União de tags + confiança máxima | Nenhum | Nenhum | Dedup por conteúdo |
| **Rastreamento de confiança** | Por entrada (0–1) | Nenhum | Nenhum | Por entrada |
| **System Primer** | Auto-gerado | Nenhum | Nenhum | Nenhum |
| **Multi-sessão** | Coordenação baseada em arquivo | Nenhum | N/A | Nenhum |
| **Hooks** | 15 agentes | Nenhum | Nenhum | Somente Claude |
| **Criptografia** | AES-256-GCM | Nenhum | Gerenciado pela cloud | Nenhum |
| **Tempo de configuração** | `npx toon-memory` | JSON manual | Cadastro na cloud | Docker + config |

### Eficiência de tokens (medido)

```
Formato          Tokens (16 entradas)    vs JSON
──────────────  ───────────────────    ───────
JSON            1097                   linha de base
TOON            850                    -22.5%
```

### Eficiência de recall (medido)

```
Método                            Tokens para obter contexto    vs reler arquivos
───────────────────────────────  ─────────────────────    ───────────────────
Reler arquivos fonte             ~3000                    linha de base
memory_recall (flat)             ~1200                    -60%
memory_recall (graph, compact)   ~900                     -70%
memory_smart_recall              ~850                     -72%
```

### Benchmark das ferramentas de contexto (medido)

As ferramentas `context_*` substituem 3–6 chamadas de ferramentas separadas por uma única chamada, economizando tanto tokens quanto overhead de chamadas.

```
Cenário                           Sem         Com       Economia  Ferramentas
───────────────────────────────  ────────  ──────  ───────  ──────
context_generate (briefing)        5,556     378    93.2%   6 → 1
context_diff (incremental)            533     152    71.5%   4 → 1
context_focus (direcionado)           413     225    45.5%   4 → 1
context_health (auditoria)            322     246    23.6%   5 → 1
context_export (md injetável)      1,178     218    81.5%   3 → 1
───────────────────────────────  ────────  ──────  ───────  ──────
TOTAL                              8,002   1,219    84.8%  22 → 5
```

**O que cada cenário mede:**

| Ferramenta | Sem (caminho manual) | Com (chamada única) | Por que economiza |
|------------|---------------------|-------------------|-------------------|
| `context_generate` | Ler `package.json` + `README` + `tsconfig.json` + dump completo da memória + stats da memória + sessões = 6 chamadas | Um briefing compacto com tudo | Elimina 5 leituras redundantes; saída é desduplicada e compacta |
| `context_diff` | `git log` + `git diff --name-only` + `memory_diff` + sessões = 4 chamadas | Um diff incremental | Combina estado do git + alterações de memória em uma saída; sem sobreposição |
| `context_focus` | `memory_recall` + `findCallers` + `findRelatedFiles` + `findTestFiles` = 4 chamadas | Um briefing direcionado | Retorna apenas o que é relevante; sem necessidade de escaneamento completo da memória |
| `context_health` | `memory_stats` + escaneamento de órfãos + escaneamento de duplicatas + validação de refs de arquivo + sessões obsoletas = 5 chamadas | Um relatório de saúde | Cada verificação é feita uma vez e desduplicada; sem consultas redundantes |
| `context_export` | `memory_stats` + `memory_recall({ compact: true, mode: "graph" })` + formatação manual = 3 chamadas | Uma exportação markdown | Formata a saída diretamente; o agente pula o passo de "formatar como markdown" |

> **Dica:** Use `context_generate` no início da sessão (93% de economia de tokens). Use `context_diff` para "o que mudou desde a última vez?" (72% de economia). Use `context_focus` para análises aprofundadas de tópicos específicos (45% de economia).

Medido com `gpt-tokenizer` (cl100k_base) sobre cenários de projeto realistas — veja `scripts/bench-context-tools.mjs` (`npm run bench:context`).

### Impacto completo na sessão (medido)

Simula uma sessão completa de agente em 5 fases (início da sessão → debug → implementação → revisão → encerramento) em 3 abordagens: sem memória, com `memory_recall` e com ferramentas `context_*`.

```
Fase                                    Sem memória       memory_recall      ferramentas context_*
──────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
Fase 1: Início da Sessão                516 t /  6 c       409 t /  3 c       373 t /  1 c
Fase 2: Debugar Problema                176 t /  4 c       182 t /  2 c       252 t /  1 c
Fase 3: Implementar Feature             189 t /  6 c       183 t /  3 c       305 t /  1 c
Fase 4: Revisão de Código               316 t /  4 c       130 t /  2 c       243 t /  1 c
Fase 5: Encerramento                  1,214 t /  5 c        68 t /  2 c       117 t /  1 c
──────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
TOTAL                                 2,411 t / 25 c       972 t / 12 c     1,290 t /  5 c
```

**Descobertas principais:**

| Métrica | Sem memória | Com memory_recall | Com ferramentas context_* |
|---------|-------------|-------------------|---------------------------|
| Tokens por sessão | 2,411 | 972 (-60%) | 1,290 (-47%) |
| Chamadas de ferramentas por sessão | 25 | 12 (-52%) | **5 (-80%)** |
| Custo por sessão (GPT-4) | $0.072 | $0.029 | $0.039 |

**O trade-off:** `memory_recall` usa menos tokens (972 vs 1.290) porque retorna apenas entradas correspondentes. Ferramentas `context_*` retornam **contexto mais rico** (chamadores, arquivos relacionados, arquivos de teste, auditoria de saúde) — mais tokens por chamada, mas **80% menos chamadas de ferramentas**. Na prática, o agente evita 3-4 chamadas de "encontrar relacionados" que `context_focus` já inclui.

**Onde context_* ganha grande vantagem:**
- **Início da sessão** (Fase 1): 28% menos tokens + 6→1 chamadas — um briefing substitui a leitura de 6 arquivos
- **Encerramento** (Fase 5): 90% menos tokens — `context_health` substitui 5 escaneamentos manuais
- **Chamadas de ferramentas**: 25→5 chamadas = **80% menos overhead de latência** por sessão

> **Dica:** Use `memory_recall` quando precisa de entradas específicas (menos tokens). Use `context_*` quando precisa de contexto abrangente com menos idas e voltas (menos chamadas).

Medido com `gpt-tokenizer` (cl100k_base) — veja `scripts/bench-full-impact.mjs` (`npm run bench:full`).

> **Dica:** `memory_smart_recall` combina BM25 + grafo + qualidade em uma chamada, economizando tanto tokens quanto overhead de chamadas. Use no início de cada tarefa.

---

## Solução de Problemas

### Memória não encontrada após instalação

**Sintoma:** O agente diz que não tem ferramentas de memória.

**Solução:**
1. Execute `npx toon-memory status` para verificar a instalação
2. Reinicie completamente seu agente (feche e reabra)
3. Verifique se o arquivo de configuração MCP existe e é JSON válido

### Arquivo de memória está vazio

**Sintoma:** `memory_stats` mostra 0 entradas.

**Solução:** Isso é normal na primeira instalação. Comece a usar `memory_remember` para salvar entradas.

### Entradas duplicadas

**Sintoma:** A mesma chave aparece várias vezes.

**Solução:** `memory_remember` com a mesma chave agora mescla automaticamente (união de tags, confiança máxima, data mais recente). Use `memory_consolidate` para mesclar todas as entradas com mesma chave e remover duplicatas com conteúdo exato. Para limpeza manual, use `memory_forget`.

### Chave de criptografia perdida

**Sintoma:** Não é possível descriptografar a memória.

**Solução:** Infelizmente, não há recuperação. A chave de criptografia não é armazenada em lugar algum após a geração. Isso é por design por segurança. Você precisará recomeçar ou restaurar de um backup não criptografado.

### Memória muito grande

**Sintoma:** As respostas do agente estão lentas.

**Solução:**
1. Execute `memory_archive()` para mover entradas antigas para o arquivo
2. Use `memory_forget` para remover entradas irrelevantes
3. Mantenha entradas concisas — salve a decisão, não a conversa inteira
4. Entradas de baixa qualidade (vagas, sem tags) recebem menor prioridade de recall automaticamente

---

## Perguntas Frequentes

### Isso funciona com qualquer agente de IA?

Sim, desde que ele suporte MCP (Model Context Protocol). Temos configuração automática para 15 agentes, com configuração manual disponível para outros.

### Meus dados são enviados para algum lugar?

Não. Tudo fica na sua máquina. O servidor MCP roda localmente via stdio — sem chamadas de rede, sem telemetria, sem cloud.

### Posso usar isso em múltiplas máquinas?

Sim, se você sincronizar o diretório `.toon-memory/memory/` (por exemplo, via Git ou uma pasta compartilhada). Cada máquina precisa ter o toon-memory instalado, mas o arquivo de memória é portátil.

### O que acontece se eu tiver múltiplos projetos?

Cada projeto recebe seu próprio arquivo de memória. A memória não vaza entre projetos.

### Posso criptografar apenas entradas específicas?

Não, a criptografia se aplica ao arquivo de memória inteiro. Se você precisar de criptografia seletiva, mantenha dados sensíveis em uma ferramenta separada.

### Como isso é diferente de apenas usar um arquivo markdown?

Arquivos markdown não são estruturados, não são pesquisáveis pelo seu agente da mesma forma, não se integram via MCP, e não têm funcionalidades como arquivamento, filtro por data, pontuação de qualidade, merge-dedup, rastreamento de confiança ou criptografia. toon-memory é construído especificamente para agentes de IA.

---

## Desenvolvimento

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
npm run build
npm test
```

### Estrutura do Projeto

```
toon-memory/
├── src/
│   ├── bin/
│   │   └── toon-memory.ts      # Ponto de entrada
│   ├── cli/
│   │   ├── setup.ts             # Comandos CLI
│   │   └── toon-memory.ts       # Runner do CLI
│   ├── mcp/
│   │   └── server.ts            # Servidor MCP (35 ferramentas + 4 recursos)
│   ├── lib/
│   │   ├── lock.ts              # Lock de arquivo advisory + escrita atômica
│   │   ├── sessions.ts          # Coordenação multi-sessão
│   │   ├── graph.ts             # Grafo de memória (parse, build, BM25, centralidade, render compacto)
│   │   ├── quality.ts           # Pontuação de qualidade, merge-dedup, recall inteligente, system primer
│   │   ├── context.ts           # Gerador de briefing de contexto (contexto em uma chamada)
│   │   └── vocab.ts             # Descoberta de vocabulário do projeto a partir de dependências
├── tests/
│   ├── cli.test.ts              # Testes do CLI
│   ├── memory.test.ts           # Testes de memória
│   ├── sessions.test.ts         # Testes multi-sessão
│   ├── graph.test.ts            # Testes do grafo de memória
│   └── quality.test.ts          # Testes de pontuação de qualidade, merge-dedup, recall inteligente, system primer
├── .github/workflows/
│   ├── ci.yml                   # CI (Node.js 20/22)
│   └── publish.yml              # Publicação automática no release
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Contribuindo

Contribuições são bem-vindas! Por favor leia nosso [Código de Conduta](CODE_OF_CONDUCT.md) e [Guia de Contribuição](CONTRIBUTING.md) primeiro.

1. Faça fork do repositório
2. Crie sua branch de feature (`git checkout -b feature/amazing-feature`)
3. Faça commit das suas alterações (`git commit -m 'feat: add amazing feature'`)
4. Envie para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

---

## Licença

MIT

---

## Créditos

Construído com [@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon) e [@modelcontextprotocol/server](https://www.npmjs.com/package/@modelcontextprotocol/server).
