[English](README.md) | [Español](README.es.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Português (BR)](README.pt-br.md) | [Deutsch](README.de.md) | [Français](README.fr.md)

# toon-memory

> La couche de continuité pour les agents IA — les agents IA ne devraient pas avoir à réapprendre votre projet à chaque session.

[![npm version](https://img.shields.io/npm/v/toon-memory.svg)](https://www.npmjs.com/package/toon-memory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/LuiggiVal08/toon-memory/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-online-blue)](https://luiggival08.github.io/toon-memory/)
[![MCP Badge](https://lobehub.com/badge/mcp/luiggival08-toon-memory)](https://lobehub.com/mcp/luiggival08-toon-memory)

---

## Table des matières

- [Qu'est-ce que toon-memory ?](#qu_est-ce-que-toon-memory-)
- [Article de blog](#article-de-blog)
- [Fonctionnalités](#fonctionnalités)
- [Démarrage rapide](#démarrage-rapide)
- [Agents supportés](#agents-supportés)
- [Outils MCP](#outils-mcp)
- [Coordination multi-session](#coordination-multi-session)
- [Graphe mémoire (rappel basé sur le graphe)](#graphe-mémoire-rappel-basé-sur-le-graphe)
- [Conseils et bonnes pratiques](#conseils-et-bonnes-pratiques)
- [Commandes CLI](#commandes-cli)
- [Configuration](#configuration)
- [Fonctionnement](#fonctionnement)
- [Pourquoi TOON ?](#pourquoi-toon-)
- [Dépannage](#dépannage)
- [FAQ](#faq)
- [Développement](#développement)
- [Contribuer](#contribuer)
- [Sécurité et confidentialité](#sécurité-et-confidentialité)
- [Licence](#licence)

---

## Qu'est-ce que toon-memory ?

Vous avez déjà vécu cette situation où votre agent IA oublie tout de la session d'hier ? Vous lui réexpliquez la même décision d'architecture pour la troisième fois, et il propose encore l'approche que vous avez déjà rejetée ?

**toon-memory résout ce problème.** C'est la couche de continuité pour les agents IA — un système léger qui préserve le savoir, les décisions et les conventions de votre projet entre les sessions, pour que chaque session commence là où la précédente s'est arrêtée. 100% local et privé, via MCP — sans cloud, sans serveur.

📖 **[Lire la documentation](https://luiggival08.github.io/toon-memory/)**

### Cas d'usage concrets

| Scénario | Ce que toon-memory fait |
|----------|----------------------|
| Débats de conception | « Nous avons choisi Redis plutôt que Memcached à cause du support du pub/sub » |
| Choix de framework | « Ce projet utilise Zod pour la validation, pas Joi » |
| Correction de bogues | « Épuisement du pool Redis — la correction était max_connections=20 » |
| Notes d'architecture | « Le service broker utilise le protocole RESP, pas HTTP » |
| Intégration d'un nouveau membre | « Le script de déploiement se trouve dans scripts/deploy.sh » |
| Contexte d'équipe | « La PR #142 a annulé le changement de cache — ne pas le réajouter » |

---

## Article de blog

Lisez [Comment toon-memory rend votre agent IA plus intelligent](https://luiggival08.github.io/toon-memory/blog) pour voir une démo concrète de la mémoire persistante en action.

---

## Fonctionnalités

- **Un kit mémoire complet** — Gestion complète de la mémoire via le Model Context Protocol, incluant `memory_smart_recall` (rappel unifié avec biais de session), `memory_sessions` pour la coordination multi-session, les outils `context_*` pour la génération de contexte en un seul appel (briefing, diff, focus, audit de santé, export), `memory_compress` (compression propulsée par LLM), `memory_consolidate` (dédoublonnage/fusion/nettoyage déterministes), `memory_primer` (contexte auto-injecté), `memory_merge_sessions` (fusion inter-sessions), `memory_pin`/`memory_unpin` (épingler les entrées importantes avec priorité 1-5), `memory_checkpoint` (instantané de session avec TTL de 7j), `memory_search` (recherche unifiée avec filtres de tags + biais de session), `memory_tag` (opérations de tags par lot), `memory_export_gist`/`memory_import_gist` (synchronisation GitHub Gist), `memory_forget` (suppression douce/dure, restauration, remplacement), `memory_reflect` (réflexion sur l'obsolescence/qualité), et `memory_promote` (promotion automatique des brouillons à faible confiance)
- **Ressources MCP** — Lire la mémoire comme contexte sans invoquer d'outils, incluant un System Primer (carte de connaissances auto-générée)
- **15 agents supportés** — OpenCode, VS Code, Claude Code, Cursor, Windsurf, Cline, Continue, Codex CLI, Gemini CLI, Zed, Antigravity, Aider, KiloCode, OpenClaw, Kiro
- **Installateur interactif** — Sélectionnez les agents à configurer depuis un menu
- **Hooks SessionStart** — Rappels automatiques pour Claude Code, Codex CLI, Gemini CLI, Antigravity
- **Format TOON** — 22% de tokens en moins que JSON (mesuré), meilleure compréhension par les LLM
- **Mémoire par projet** — Chaque projet possède son propre fichier mémoire
- **Configuration zéro** — Installez et utilisez
- **Gitignore automatique** — Ajoute automatiquement `.toon-memory/memory/` au `.gitignore`
- **Filtrage par date** — Recherchez la mémoire par plage de dates
- **Archivage automatique** — Les anciennes entrées (>30 jours), les entrées TTL expirées, ou les entrées 100+ sont automatiquement déplacées vers les archives
- **Chiffrement** — Chiffrement AES-256-GCM pour les données sensibles
- **Mode surveillance** — Sauvegarde automatique toutes les N minutes
- **TTL de mémoire** — Expiration configurable par entrée (7j, 30j, ou dates précises)
- **Inférence de tags** — Détection automatique des tags à partir du contenu quand les tags sont vides (vocabulaire intégré + dépendances du projet)
- **Diff de mémoire** — Voyez ce qui a changé depuis votre dernière session
- **Entrées liées** — Suggestions automatiques d'entrées connexes lors de la sauvegarde
- **Graphe mémoire** — Connectez les entrées avec des refs `links`/`[[key]]` ; `memory_recall` peut étendre un sous-graphe relationnel pour un rappel plus précis avec moins de tokens (sans embeddings, sans LLM)
- **Rappel économe en tokens** — `memory_recall({ compact: true })` retourne des entrées indexées numériquement, supprime `id`/`date`/`file`, affiche les arêtes du graphe sous forme de `->2`, et tronque les voisins du graphe en extraits
- **Classement BM25 + centralité** — Reclassement par pertinence BM25 et centralité dans le graphe (les hubs remontent même sans le mot-clé de recherche) ; décroissance par saut maintient les nœuds éloignés en bas du classement
- **Auto-tag depuis les dépendances** — `toon-memory init` analyse les fichiers `package.json`/`Cargo.toml`/`requirements.txt`/`go.mod` et écrit un vocabulaire de projet afin que les entrées mentionnant une dépendance soient automatiquement taguées
- **Smart Recall** — `memory_smart_recall` combine BM25 + graphe + décroissance + qualité en un seul appel ; le LLM l'appelle au début de chaque tâche
- **Score de qualité** — Chaque entrée reçoit un score de qualité de 0 à 1 basé sur la structure (tags, liens, spécificité du contenu, récence) ; les entrées de haute qualité remontent en premier
- **Fusion-dédoublonnage** — Sauvegarder avec le même `key` fusionne les attributs (union des tags, confiance maximale, date la plus récente, liens combinés) au lieu d'écraser
- **Détection de quasi-doublons** — La consolidation détecte les quasi-doublons via la similarité de Jaccard (seuil 0.7) et les fusionne
- **Score de confiance** — Chaque entrée suit la fiabilité : affirmation utilisateur = 1.0, inféré = 0.65–0.75
- **Compression propulsée par LLM** — `memory_compress` utilise l'IA pour résumer les longues entrées ; `memory_consolidate(mode: "low-quality")` fait un nettoyage par lot déterministe
- **Fusion inter-sessions** — `memory_merge_sessions` fusionne les observations des sessions parallèles pour un fichier
- **Synchronisation GitHub Gist** — `memory_export_gist` et `memory_import_gist` synchronisent les entrées mémoire via GitHub Gist (zéro dépendance)
- **Mode verbatim** — `config.verbatim` préserve les entrées originales au lieu de les écraser lors de la sauvegarde
- **Outils de génération de contexte** — `context_generate` (briefing complet), `context_diff` (incrémental), `context_focus` (ciblé), `context_health` (audit), `context_export` (markdown) — chacun remplace 5 à 6 appels d'outils manuels. Zéro LLM, pure agrégation déterministe
- **System Primer** — Carte de connaissances auto-générée exposée en tant que ressource MCP ; les agents la chargent au démarrage de la session pour un contexte instantané
- **Portée de chemin (Path Scoping)** — Les entrées peuvent être limitées à des chemins de fichiers via des motifs glob (`path_scope`) ; le rappel filtre par portée automatiquement
- **Contrôle du budget** — Trois niveaux de sortie : `budget: "tiny"` (clé+1 ligne, ~50 tokens), `"normal"` (compact avec tags/arêtes), `"deep"` (tous les champs avec origine/portée/statut). Compatible en arrière avec `compact: true`
- **Suivi de l'origine** — Chaque entrée suit son origine (`human`, `agent`, `inferred`) ; les affirmations humaines reçoivent un boost de qualité
- **Suppression douce** — `memory_forget` supprime en douceur par défaut (définit `status=obsolete`). Restauration avec `memory_forget(key, action: "restore")`, masquage avec `action: "soft"`, suppression définitive via `action: "hard"`
- **Audit de santé renforcé** — `context_health` détecte désormais les preuves manquantes (path_scope sans fichier) et les affirmations obsolètes (contenu se chevauchant dans la même catégorie)
- **Arêtes de graphe typées** — Les arêtes portent des types (`superseded_by`, `supersedes`, `relates`), écrits sous forme `type:key` dans le graphe. Les `links` explicites deviennent `relates:key`, pour distinguer *comment* les entrées sont liées, pas seulement qu'elles le sont
- **Classement RRF** — Le rappel fusionne les rangs BM25 (×3) et de centralité du graphe avec la fusion de rangs réciproques (Reciprocal Rank Fusion) et un `k` adaptatif `= clamp(3..60, round(sqrt(n)))`. Benchmark (8 requêtes de référence) : nDCG 0.776, MRR 0.917 — parité exacte avec le scoring linéaire précédent. Passez `rrf: false` pour revenir en arrière
- **Réflexion mémoire** — `memory_reflect` classe les entrées par obsolescence, qualité et sur-connexion pour mettre en évidence ce qui nécessite de l'attention ou un nettoyage. Déterministe, zéro LLM
- **Remplacement de mémoire** — `memory_forget(key, action: "supersede", new_key)` marque une entrée comme remplacée par une plus récente (lien `superseded_by` + date `supersededOn`). `memory_recall({ as_of })` ré-inclut les anciennes entrées pour les requêtes à une date précise avant leur remplacement
- **Promotion automatique** — `memory_promote` promeut les brouillons à faible confiance en entrées actives de manière déterministe (seuil 0.65, dédoublonnage Jaccard), avec `dryRun` par défaut
- **Expliquer POURQUOI** — `memory_recall`/`memory_smart_recall` acceptent `explain: true` et ajoutent une ligne de raison déterministe à chaque entrée retournée (`↳ 100% pertinence · utilisé 14× · utilisé aujourd'hui · importance HAUTE`) — *pourquoi* elle a été récupérée, sans LLM
- **Budgets de tokens** — `budget_tokens` plafonne la sortie du rappel par estimation du nombre de tokens ; les entrées s'accumulent de manière gourmande et la queue qui dépasserait le budget est abandonnée (`0` = pas de limite)
- **Remplacement par version** — `memory_consolidate(mode: "versions")` détecte les entrées décrivant le même sujet à différentes versions de bibliothèque (par ex. « Utilisez React 18 » vs « Utilisez React 19 ») et retire les plus anciennes en faveur de la plus récente
- **Mémoires négatives** — une catégorie `warning` pour les faits « ne PAS faire ceci » ; les entrées `warning` reçoivent un boost de rappel pour que l'agent voie les pièges avant de les répéter
- **Classement langue + dossier** — le rappel booste les entrées écrites dans la même famille d'écriture (latin/CJK/cyrillique/…) et les entrées dont le `path_scope` correspond au fichier courant
- **Importance explicite** — `memory_remember({ importance })` définit `critical`, `high`, `medium` ou `low`. Les décisions critiques remontent en premier (+0.3), les notes de faible importance restent discrètes (−0.1) ; vide = automatique (récence + fréquence). Ré-enregistrer conserve le niveau le plus élevé

---

## Démarrage rapide

### 1. Installation

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/LuiggiVal08/toon-memory/main/install.ps1 | iex

# Ou avec npm (toute plateforme)
npm i -g toon-memory
```

> **Astuce :** L'installation via npm est la méthode la plus fiable. Les scripts curl/irm sont des raccourcis pratiques.

### 2. Configurez vos agents

```bash
# Installateur interactif — détecte les agents et configure le MCP
npx toon-memory
```

L'installateur va :
1. Détecter quels agents IA vous avez installés
2. Demander lesquels configurer
3. Ajouter automatiquement la configuration du serveur MCP

### 3. Utilisez-le

C'est tout ! Dans votre prochaine session d'agent, essayez :

```bash
memory_stats      # Voir ce qu'il y a dans la mémoire
memory_recall     # Chercher dans la mémoire avant de lire les fichiers
memory_remember   # Sauvegarder les décisions importantes
```

> **Astuce :** Exécutez toujours `memory_recall` au début d'une session. Votre agent aura instantanément le contexte des sessions précédentes.

### Configuration rapide du client MCP

#### Cursor

Ajoutez à `.cursor/mcp.json` :

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

Ajoutez à `claude_desktop_config.json` :

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

Ajoutez à `~/.codeium/windsurf/mcp_config.json` :

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

## Agents supportés

| Agent | Emplacement de config | Format | Hooks | Configuration auto |
|-------|-----------------|--------|-------|------------|
| **OpenCode** | `.opencode/opencode.json` + `.opencode/plugins/toon-memory.ts` | Plugin | SessionStart (plugin, pas de `hooks` au niveau racine) | ✅ |
| **VS Code / Copilot** | `.vscode/mcp.json` | JSON | — | ✅ |
| **Claude Code** | `.mcp.json` (MCP) + `.claude/settings.json` (hooks) | JSON | SessionStart + PostToolUse + Stop | ✅ |
| **Cursor** | `.cursor/mcp.json` | JSON | — | ✅ |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` | JSON | — | ✅ |
| **Cline** | `.cline/mcp.json` | JSON | — | ✅ |
| **Continue** | `.continue/config.json` | JSON | — | ✅ |
| **Codex CLI** | `.codex/config.toml` | TOML | SessionStart + PostToolUse + Stop (`[[hooks]] event=`) | ✅ |
| **Gemini CLI** | `.gemini/settings.json` | JSON | SessionStart + PostToolUse + Stop (`hooks.*`) | ✅ |
| **Zed** | `~/.config/zed/settings.json` | JSONC | — | ✅ |
| **Antigravity** | `.agents/mcp_config.json` + `.agents/hooks.json` | hooks.json | PreInvocation + PostToolUse + Stop (pas d'événement SessionStart) | ✅ |
| **Aider** | — | — | — | 📝 Instructions |
| **KiloCode** | `~/.kilocode/mcp_settings.json` | JSON | — | ✅ |
| **OpenClaw** | `.openclaw.json` | JSON | — | ✅ |
| **Kiro** | `.kiro/settings/mcp.json` | JSON | — | ✅ |

> **Astuce :** Vous pouvez configurer toon-memory pour plusieurs agents en même temps. Chaque agent utilise le même fichier mémoire partagé dans `.toon-memory/memory/`.

---

## Outils MCP

| Outil | Description |
|------|-------------|
| `memory_remember` | Sauvegarde une décision, un motif, un bogue, une connaissance ou une **alerte** (`warning` — mémoire négative « ne PAS faire ceci », rappelée avec un boost) — TTL optionnel, inférence automatique de tags, `links` pour construire le graphe mémoire, fusion-dédoublonnage sur même clé, score de qualité et confiance automatiques |
| `memory_recall` | Recherche dans la mémoire (utilisez AVANT de lire les fichiers, filtre les TTL expirés). `mode: "graph"` étend un sous-graphe relationnel pour plus de précision. `budget: "tiny"|"normal"|"deep"` contrôle la verbosité de la sortie (compatible en arrière avec `compact: true`). `path_scope` filtre par motif glob. `sessionBias` booste les entrées de la branche git actuelle. `explain: true` ajoute une ligne de raison par entrée (pourquoi elle a été récupérée). `budget_tokens` plafonne la sortie par estimation des tokens (`0` = pas de limite). Classement pondéré par la qualité |
| `memory_smart_recall` | **Rappel unifié** : BM25 + graphe + décroissance + qualité en un seul appel. `sessionBias` booste les entrées de la branche git actuelle. `explain: true` ajoute des raisons par entrée, `budget_tokens` plafonne la sortie par estimation des tokens. Utilisez au DÉBUT de chaque tâche. Retourne une sortie compacte et économe en tokens |
| `memory_forget` | **Opérations de cycle de vie** par clé ou id : `action: "soft"` (défaut) marque comme obsolète, `"hard"` supprime définitivement, `"restore"` ramène à actif, `"supersede"` le retire avec un lien `superseded_by` vers `new_key` |
| `memory_stats` | Affiche l'état de la mémoire (y compris les stats TTL, la distribution de qualité, la répartition origine/statut, les mémoires froides sous les seuils de qualité/accès, et les métriques de **taux de réussite / doublons / obsolètes**) |
| `memory_summary` | Sauvegarde/récupère les résumés de fichiers |
| `memory_archive` | Archive les anciennes entrées (>30 jours) et les entrées TTL expirées |
| `memory_diff` | Affiche les changements depuis une date (24h, 7j, ou date précise) |
| `memory_suggest` | Trouve des entrées liées pour un contexte donné |
| `memory_encrypt` | Active le chiffrement AES-256-GCM |
| `memory_decrypt` | Désactive le chiffrement |
| `memory_backup` | Crée une sauvegarde horodatée du fichier mémoire (auto-nettoyage aux 10 plus récentes) |
| `memory_captured` | Liste les activités capturées automatiquement par les hooks (opt-in) ou vide le journal |
| `memory_checkpoint` | **Point de contrôle** : crée un instantané de l'état actuel de la mémoire avec TTL de 7j. Utile pour référence de restauration pendant les longues sessions |
| `memory_consolidate` | **Opérations de nettoyage** déterministes (sans LLM) : `mode: "identical"` (défaut) dédoublonne les entrées de contenu identique, `"similar"` fusionne les quasi-doublons (Jaccard >50%), `"low-quality"` nettoie en lot les entrées de basse qualité (`minQuality`, `dryRun`), `"versions"` retire les entrées de versions de bibliothèque plus anciennes en faveur de la plus récente |
| `memory_sessions` | Affiche les sessions d'agents actives (branche, fichiers, dernière présence) et les conflits doux pour le travail en parallèle |
| `memory_compress` | Compression LLM en deux étapes : résumer + écraser. Utilise Anthropic/OpenAI CLI si disponible |
| `memory_primer` | Primer de contexte en un appel : mémoire principale + catégories + changements de fichiers. Injecté automatiquement au démarrage de session |
| `memory_merge_sessions` | Fusionne les observations entre sessions parallèles pour un fichier. Déduplique et promeut automatiquement |
| `memory_export_gist` | Exporte les entrées vers un GitHub Gist (public ou privé). Utilise GITHUB_TOKEN ou gh CLI |
| `memory_import_gist` | Importe les entrées depuis un GitHub Gist. Fusionne avec les entrées existantes (union de tags, confiance max) |
| `memory_graph_path` | Plus court chemin BFS entre deux entrées dans le graphe de connaissances |
| `context_brief` | **Briefing de contexte en un appel** : mémoire + sessions + santé en markdown compact. Remplace 5-6 appels mémoire_* séparés. Zéro LLM, pure agrégation déterministe |
| `context_generate` | **Briefing projet complet** : combine la structure du projet, l'état git, les entrées mémoire et les sessions actives en un seul appel. Remplace 5-6 appels d'outils manuels |
| `context_diff` | **Briefing incrémental** : commits git + fichiers modifiés + mémoire nouvelle/mise à jour + sessions actives depuis la dernière session |
| `context_focus` | **Briefing ciblé** : uniquement la mémoire pertinente + fichiers source liés + appelants + fichiers de test pour une requête |
| `context_health` | **Audit de santé mémoire** : liens orphelins, doublons, références fichiers cassées, TTL expirés, sessions obsolètes, score 0–100 |
| `context_export` | **Export mémoire en markdown** : contexte injectable pour les prompts système (complet ou compact) |
| `memory_pin` | **Épingler une entrée avec priorité 1-5** : les entrées épinglées apparaissent toujours en premier dans les résultats de rappel, triées par priorité, même sans correspondance de mot-clé |
| `memory_unpin` | **Désépingler une entrée** : supprimer la marque de priorité |
| `memory_search` | **Recherche unifiée avec filtres** : identique à `memory_recall` plus les filtres `category`, `tags`, `from_date`, `to_date`. Le filtre de tags utilise la logique ET — tous les tags spécifiés doivent correspondre. `sessionBias` booste les entrées de la branche git actuelle |
| `memory_tag` | **Opérations de tags par lot** : `add`, `remove` ou `set` des tags sur une ou plusieurs entrées par clé ou id |

### Ressources MCP

La mémoire est également exposée en tant que ressources MCP pour une lecture directe du contexte :

| Ressource | URI | Description |
|----------|-----|-------------|
| Entrées mémoire | `toon://memory/entries` | Dump complet de la mémoire |
| Mémoire actuelle | `toon://memory/current` | État actuel de la mémoire avec les entrées récentes |
| Stats mémoire | `toon://memory/stats` | Compteurs par catégorie et infos TTL |
| System Primer | `toon://memory/summaries` | Carte de connaissances auto-générée (entrées principales, catégories, motifs) |

### Prompts MCP

| Prompt | Description |
|--------|-------------|
| `summarize_project_context` | Analyse la mémoire TOON actuelle et génère un résumé compact du projet. Paramètre optionnel `intent` pour se concentrer sur un domaine spécifique |

### Exemples

#### Sauvegarder une décision

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

> **Astuce :** Utilisez des clés descriptives comme `use-zod` plutôt que des clés vagues comme `validation`. Votre agent recherche par clé et contenu, donc la spécificité aide. Sauvegarder avec la même clé fusionne automatiquement (union des tags, confiance maximale).

#### Sauvegarder avec TTL

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

> **Astuce :** Utilisez le TTL pour le contexte temporaire comme les délais, les informations de sprint, ou les notes à durée limitée. Les entrées avec TTL expiré sont automatiquement filtrées des résultats de recherche.

#### Définir une importance explicite

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

> **Astuce :** Marquez les décisions fondamentales comme `critical` pour qu'elles se classent toujours en haut du rappel. `importance` accepte `critical`, `high`, `medium` ou `low` ; laissez-le vide pour laisser le système classer automatiquement par récence et fréquence.

#### Tags auto-inférés

```typescript
memory_remember({
  category: "bug",
  key: "redis-connection-timeout",
  content: "Redis connection timeout in production, increased pool size"
  // tags laissés vides — inférés automatiquement depuis le contenu
})
// 🧠 Guardado: bug/redis-connection-timeout (a1b2c3d4)
// 🏷️ Tags inferidos: redis
// Quality score is calculated automatically based on inferred tags and content.
```

> **Astuce :** Laissez `tags` vide et le système les inférera à partir de votre contenu en utilisant un vocabulaire intégré de 20+ catégories (redis, auth, api, db, security, etc.) **plus** un vocabulaire de projet dérivé de vos dépendances au moment de `init`. Ainsi, si votre projet dépend de `redis`, toute entrée mentionnant « redis » sera automatiquement taguée `redis`.

#### Rechercher dans la mémoire

```typescript
memory_recall({ query: "redis" })
// [bug] redis-pool-fix (i9j0k1l2)
//   Added max_connections=20
//   File: redis.ts | Tags: redis;fix | Date: 2026-07-10
```

> **Astuce :** Recherchez avant de lire les fichiers. Cela économise des tokens et donne à votre agent un contexte qu'il n'obtiendrait pas du code seul. Le classement pondéré par la qualité assure que les entrées les plus utiles remontent en premier. Ou utilisez `memory_smart_recall` pour un résultat plus complet.

#### Recherche avec filtre de date

```typescript
memory_recall({
  query: "redis",
  from_date: "2026-07-01",
  to_date: "2026-07-31"
})
```

> **Astuce :** Utilisez les filtres de date quand vous vous souvenez approximativement de *quand* quelque chose s'est passé mais pas exactement de *quoi*. Le classement pondéré par la qualité s'applique toujours.

#### Archiver les anciennes entrées

```typescript
memory_archive()
// 📦 Archivadas 5 entradas antiguas
// 📋 Quedan 42 entradas activas
```

> **Astuce :** Exécutez ceci régulièrement pour garder la mémoire légère. Les entrées archivées restent consultables via `memory_recall` avec des filtres de date. Les entrées TTL expirées sont également archivées automatiquement. Les entrées de faible qualité ont une priorité de rappel réduite.

#### Afficher les changements depuis la dernière session

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

> **Astuce :** Utilisez `memory_diff` au début d'une session pour voir ce que votre agent a appris depuis la dernière fois que vous avez travaillé sur le projet. Les nouvelles entrées incluent les scores de qualité.

#### Trouver des entrées liées

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

> **Astuce :** Utilisez `memory_suggest` quand vous avez besoin de contexte sur un sujet mais ne savez pas exactement quoi chercher. Ou utilisez `memory_smart_recall` pour un résultat plus complet.

#### Smart Recall (unifié)

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

> **Astuce :** Utilisez `memory_smart_recall` au DÉBUT de chaque tâche. Il combine BM25 + graphe + décroissance + qualité en un seul appel — pas besoin de deviner quoi chercher.

#### Expliquer POURQUOI un résultat a été retourné

```typescript
memory_recall({ query: "redis", explain: true })
// [decision] redis-cache-config (a1b2c3d4)
//   Redis cache layer for session storage
//   File: src/cache.ts | Tags: redis;cache | Date: 2026-07-10
//   ↳ 92% relevance · used 14× · used today · importance HIGH
```

La ligne de raison `↳` est déterministe (pourcentage de pertinence, nombre d'accès, dernière utilisation, importance) — aucun LLM impliqué. Utilisez `explain: true` quand vous voulez savoir *pourquoi* ces entrées ont été montrées à l'agent.

#### Plafonner la sortie avec `budget_tokens`

```typescript
memory_recall({ query: "redis", budget_tokens: 300 })
// Entries accumulate greedily; the tail that would exceed the estimate is dropped.
// budget_tokens: 0 (default) = no limit.
```

> **Astuce :** Combinez `budget_tokens` avec `budget: "deep"` pour une fenêtre de contexte qui reste sous un plafond de tokens strict quelle que soit la taille de la mémoire.

#### Briefing projet complet (un seul appel)

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

> **Astuce :** Utilisez `context_generate` au début d'une session pour obtenir le contexte complet en un seul appel. Remplace 5 à 6 appels d'outils séparés.

#### Audit de santé mémoire

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

> **Astuce :** Exécutez `context_health` quand la mémoire semble encombrée. Affiche les liens orphelins, les doublons, les entrées TTL expirées et les références fichiers cassées.

#### Fusion-dédoublonnage (automatique)

Quand vous sauvegardez avec la même `key`, les attributs sont fusionnés au lieu d'être écrasés :

```typescript
// Première sauvegarde
memory_remember({
  category: "decision",
  key: "use-zod",
  content: "Use Zod for validation",
  tags: "types"
})
// 🧠 Guardado: decision/use-zod (a1b2c3d4)

// Sauvegarde ultérieure avec la même clé — fusion automatique
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

> **Astuce :** Utilisez des clés descriptives et stables. Même clé = fusion, clé différente = nouvelle entrée.

#### Score de qualité

Chaque entrée reçoit automatiquement un score de qualité (0–1) basé sur la structure :

| Facteur | Poids | Ce qu'il mesure |
|--------|--------|------------------|
| Tags | 0.3 max | Plus les tags sont spécifiques = qualité supérieure |
| Liens | 0.2 max | Entrées connectées = qualité supérieure |
| Longueur du contenu | 0.3 max | Détaillé > vague |
| Récence | 0.1 max | Entrées récentes = meilleur score |
| Spécificité | 0.1 max | Mots uniques vs mots répétés |
| Origine | +0.1/−0.05 | Les affirmations humaines sont boostées, les inférées légèrement pénalisées |

Les entrées de haute qualité remontent en premier lors du rappel. Vérifiez la qualité avec `memory_stats` :

```typescript
memory_stats()
// ...
// Calidad promedio: 0.58 (12 con score)
```

#### Score de confiance

Chaque entrée suit la fiabilité des informations :

| Source | Confiance | Signification |
|--------|-----------|---------|
| Affirmation utilisateur | 1.0 | « Nous utilisons Postgres » — déclaration directe |
| Inféré | 0.65–0.75 | L'agent a inféré à partir du contexte |
| Incertain | 0.50 | L'agent fait une supposition |

La confiance est préservée lors de la fusion (maximum des deux entrées).

#### System Primer

Le System Primer est une carte de connaissances auto-générée exposée en tant que ressource MCP. Les agents la chargent au démarrage de la session pour un contexte instantané :

```typescript
// Exposed as toon://memory/summaries
// Auto-regenerates on every read
// Contains: top entries, categories, patterns
```

> **Astuce :** Ajoutez `toon://memory/summaries` au prompt système de votre agent pour un contexte instantané au démarrage de la session.

#### Activer le chiffrement

```typescript
// D'abord, définissez TOON_MEMORY_KEY dans votre variable d'environnement (ou fichier .env) :
// export TOON_MEMORY_KEY="your-secret-key-here"

memory_encrypt()
// 🔐 Encriptación habilitada
```

> **Attention :** La clé de chiffrement doit être définie via la variable d'environnement `TOON_MEMORY_KEY` avant de chiffrer. Conservez-la en lieu sûr — si vous la perdez, vos données mémoire sont perdues à jamais. Les scores de qualité et de confiance sont préservés à travers le chiffrement.

---

## Coordination multi-session

Quand vous exécutez **plusieurs sessions d'agent IA en parallèle** (par exemple trois sessions OpenCode sur le même dépôt simultanément), elles peuvent accidentellement écraser le travail des autres. toon-memory intègre **`memory_sessions`**, un outil de coordination basé sur les fichiers qui permet à chaque session de voir ce que font les autres — **sans serveur, sans réseau, et sans appels LLM**.

### Fonctionnement

- Au démarrage, un hook `SessionStart` écrit un **fichier battement de cœur** pour la session dans `.toon-memory/memory/sessions/<id>.json`. Chaque processus n'écrit que *son propre* fichier, il n'y a donc pas de concurrence de verrouillage.
- Le battement de cœur enregistre le nom de l'agent, la **branche git**, les **fichiers modifiés**, et un horodatage de **dernière présence**.
- La lecture de l'ensemble de ces fichiers donne à chaque session une vue partagée et éventuellement cohérente de qui est actif.
- Les sessions mortes (le PID du processus n'est plus actif **et** un battement de cœur obsolète dépassant la fenêtre TTL) sont nettoyées paresseusement.

### L'outil `memory_sessions`

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

- Passez `conflictsOnly: true` pour ignorer la liste des sessions et n'afficher que les conflits doux :
  ```typescript
  memory_sessions({ conflictsOnly: true })
  // 🔥 Conflictos suaves (1):
  //
  // ⚠️ src/types.ts
  //    ↔ opencode @ feature/auth (a1b2c3d4), claude @ feature/db (e5f6g7h8)
  ```
- Un **conflit doux** est tout fichier modifié par 2+ sessions actives — un avertissement que vous pourriez être en train de modifier le même code. Ce n'est pas un verrou dur, juste un avertissement pour se coordonner.

### Bonne pratique pour les sessions en parallèle

1. Au début de chaque session, le hook `SessionStart` affiche déjà les autres sessions actives et les éventuels conflits doux.
2. Exécutez `memory_smart_recall({ intent: "what I'm working on" })` pour obtenir le contexte complet (mémoire + graphe + qualité).
3. Exécutez `memory_sessions()` pour voir le tableau complet (branches, fichiers, dernière présence) et `memory_sessions({ conflictsOnly: true })` si vous ne vous souciez que des conflits.
3. Si vous partagez un fichier avec une autre session, synchronisez-vous avant de modifier pour ne pas écraser les changements de l'autre.

> **Astuce :** C'est purement local et sans verrou — vous pouvez l'exécuter autant que vous le souhaitez. Combinez-le avec `memory_smart_recall({ intent: "project context" })` au début de session pour avoir à la fois la *mémoire* inter-sessions et la *présence* inter-sessions. Le system primer (ressource MCP) fournit également un contexte instantané.

---

## Graphe mémoire (rappel basé sur le graphe)

Quand votre mémoire grandit, une recherche par mots-clés plates peut retourner soit trop de résultats (toute correspondance), soit le mauvais contexte (sans relations). toon-memory peut traiter la mémoire comme un **graphe de connaissances léger** afin que le rappel retourne les *bonnes* entrées avec moins de tokens. Combiné avec le scoring de qualité, les entrées les plus utiles remontent en premier.

C'est entièrement **déterministe et hors ligne** — sans embeddings, sans base de données vectorielle, sans LLM, sans serveur. Les arêtes proviennent de deux sources :

- **`links` explicites** — clés que vous déclarez lors de la sauvegarde d'une entrée.
- **Refs `[[key]]` implicites** — toute mention de `[[quelque-clé]]` dans le contenu.

### Fonctionnement

1. `memory_remember` stocke les `links` sur l'entrées (clés séparées par des espaces ou des `;`). Le score de qualité est calculé automatiquement.
2. `memory_recall({ mode: "graph" })` trouve les correspondances de mots-clés (graines), puis étend le **sous-graphe égocentrique** jusqu'à `hops` (1 ou 2) le long des arêtes.
3. La pertinence se propage des graines à leurs voisins, donc une décision ou spécification connexe remonte même si elle ne contient pas le mot de recherche. Le classement pondéré par la qualité assure que les entrées les plus utiles apparaissent en premier.
4. L'ensemble de résultats est plafonné (`limit`, par défaut 6) → **contexte plus petit et plus précis** pour l'agent. Ou utilisez `memory_smart_recall` pour un appel unifié.

#### Sauvegarder avec des liens

```typescript
memory_remember({
  category: "decision",
  key: "risk-engine-priority",
  content: "The engine prioritizes risk over speed (see [[risk-spec]]).",
  file: "spec.md:10",
  tags: "risk;spec",
  links: "engine-arch"          // arête explicite vers une autre entrée
})
// 🧠 Guardado: decision/risk-engine-priority (a1b2c3d4)
// Quality score is calculated automatically based on tags, links, and content detail.
```

#### Rappel en mode graphe

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

> **Astuce :** Utilisez `mode: "graph"` quand une décision se répercute sur plusieurs entrées (architecture, spécifications, bogues connexes). Pour des faits isolés, le mode `flat` par défaut suffit. Ou utilisez `memory_smart_recall` qui combine automatiquement graphe + BM25 + qualité.

#### Rappel économe en tokens (`compact`）

Quand chaque token compte, passez `compact: true` pour une sortie plus dense :

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

Ce que `compact` change dans la sortie :

- Chaque entrée reçoit un index numérique stable (`[1]`, `[2]`, …) par ordre de score.
- `id`, `date` et `file` sont supprimés — seul `tags` est conservé.
- En mode `graph`, les arêtes s'affichent sous forme de `->2` (numériques, pas les noms de clés).
- Les voisins atteints via le graphe (non-graines) sont tronqués en un court extrait avec des points de suspension, tandis que les graines directement correspondantes conservent leur contenu complet.
- Le classement pondéré par la qualité assure que les entrées les plus utiles apparaissent en premier.
- Le fichier `.toon` stocké n'est **jamais** modifié — `compact` ne fait que reformater la réponse.

> **Astuce :** Combinez `compact: true` avec `mode: "graph"` pour la fenêtre de contexte la plus petite possible lors du rappel d'une mémoire grande et interconnectée. Ou utilisez simplement `memory_smart_recall` qui le fait automatiquement.

### Comment le rappel classe les résultats

Le rappel est déterministe et hors ligne (sans embeddings, sans LLM). Chaque entrée candidate reçoit un score combiné :

- **Pertinence BM25** — score classique de fréquence de terme probabiliste par rapport à la requête, utilisant `id` + `category` + `key` + `content` + `file` + `tags` + `quality` + `confidence`.
- **Centralité du graphe** — normalisée par degré (0..1) ; un hub connecté à de nombreuses entrées obtient un score proche de 1, il remonte donc même sans le mot de recherche.
- **Importance** — récence + fréquence d'accès (même signal utilisé ailleurs).
- **Bonus de qualité** — les entrées avec des scores de qualité plus élevés (plus de tags, liens, détails) reçoivent un boost de classement.
- **Bonus de graine** — les entrées qui correspondent directement à la requête reçoivent un boost fixe.
- **Décroissance par saut** — les nœuds à `d` sauts d'une graine sont multipliés par `0.5^d`, donc le contexte éloigné se classe en dessous du contexte proche.

En mode `graph`, le rappel commence par les correspondances de mots-clés, étend le sous-graphe égocentrique jusqu'à `hops`, et retourne les `limit` (par défaut 6) premiers par score combiné. `memory_smart_recall` combine tous ces signaux en un seul appel.

### Auto-tag depuis les dépendances du projet

Lors de `toon-memory init`, l'analyseur CLI examine vos fichiers de dépendances et écrit une table `vocab` dans `.toon-memory/memory/config.json` :

```json
{
  "vocab": {
    "react": ["react"],
    "zod": ["zod"],
    "redis": ["redis"]
  }
}
```

`memory_remember` compare ensuite les nouvelles entrées à ce vocabulaire en plus du vocabulaire intégré, donc mentionner une dépendance dans votre contenu attache automatiquement son tag. Plus de tags = score de qualité supérieur. Fichiers de dépendances supportés : `package.json`, `Cargo.toml`, `requirements.txt`, `pyproject.toml`, `go.mod`.

> **Astuce :** Ré-exécutez `toon-memory init` après avoir ajouté des dépendances majeures pour rafraîchir le vocabulaire. La clé `vocab` est fusionnée (jamais écrasée) avec les indicateurs `encrypted`/`capture` dans `config.json`.

---

## Visualiseur du graphe mémoire

Visualisez votre mémoire sous forme de graphe interactif à force dirigée. Voyez les entrées, leurs connexions, les catégories et les schémas d'accès d'un coup d'œil.

### Visualiseur CLI (serveur HTTP autonome)

```bash
npx toon-memory viewer          # Start HTTP server + open browser
npx toon-memory viewer --port 3001  # Custom port
npx toon-memory viewer --export     # Save as static HTML
```

Une fois ouvert, appuyez sur `r` dans le terminal pour recharger depuis le disque, ou `r` / ↻ dans le navigateur pour rafraîchir la page.

### Visualiseur intégré (MCP Apps)

Appelez `memory_visualize` dans tout hôte compatible MCP Apps pour afficher le graphe directement — aucun serveur nécessaire. Le visualiseur apparaît comme un panneau interactif dans l'interface de chat.

### Fonctionnalités

| Interaction | Description |
|---|---|
| **Survoler** un nœud | Affiche une infobulle avec l'aperçu du contenu, la qualité, le nombre d'accès |
| **Cliquer** sur un nœud | Sélectionner + centrer + mettre en évidence les voisins |
| **Double-cliquer** sur un nœud | Ouvrir le panneau de détails |
| **Faire glisser** un nœud | Repositionner manuellement (clic droit pour libérer) |
| **Recherche** | Filtrer les entrées ; les nœuds correspondants pulsent avec une lueur |
| **⇿ Recherche de chemin** | Cliquez sur deux nœuds pour trouver et mettre en évidence le plus court chemin |
| **Zoom/pan** | Molette de la souris ou boutons +/− |
| **⚙ Physique** | Ajuster la charge, la distance des liens, la gravité centrale |
| **Bascule de thème** | Mode sombre/clair (persistant) |
| **Export** | Sauvegarder le graphe en PNG ou SVG |

### Captures d'écran

| Vue du graphe | Recherche mise en évidence | Recherche de chemin | Panneau de détails |
|---|---|---|---|
| ![Graphe complet](docs/public/viewer/graph-full.png) | ![Recherche](docs/public/viewer/graph-search.png) | ![Chemin](docs/public/viewer/graph-path.png) | ![Détail](docs/public/viewer/graph-detail.png) |

![Animation de démo du visualiseur](docs/public/viewer/viewer-demo.gif)

### Capturer vos propres captures d'écran

```bash
npm run capture:viewer
```

Nécessite [Playwright](https://playwright.dev) (`npx playwright install chromium`) et `ffmpeg`.

---

## Conseils et bonnes pratiques

Voici des schémas qui fonctionnent bien avec toon-memory :

### L'habitude du « début de session »

Au début de chaque nouvelle session, exécutez :
```
memory_smart_recall({ intent: "what I was working on" })
```
Cela donne instantanément à votre agent le contexte de ce qui s'est passé avant — en combinant BM25, graphe, qualité et décroissance en un seul appel.

### L'habitude de la « fin de session »

Avant de fermer une session, sauvegardez tout ce qui est important :
```
memory_remember({
  category: "decision",
  key: "auth-approach",
  content: "Chose JWT over sessions — stateless, works across microservices",
  file: "src/auth.ts",
  tags: "auth;architecture"
})
```
L'entrée reçoit automatiquement un score de qualité basé sur sa structure (tags, détails du contenu, liens).

### Choix des catégories

| Catégorie | Quand l'utiliser |
|----------|-------------|
| `decision` | Choix d'architecture, compromis, « pourquoi X plutôt que Y » |
| `pattern` | Conventions, frameworks, règles de style de code |
| `bug` | Problèmes que vous avez corrigés et comment |
| `knowledge` | Faits du projet, informations du domaine, contexte d'équipe |
| `warning` | « Ne PAS faire ceci » — anti-motifs, pièges, erreurs à éviter (rappelés avec un boost) |

> **Astuce :** N'y réfléchissez pas trop. Si c'est quelque chose que votre futur vous (ou agent) voudrait savoir, sauvegardez-le. Les entrées détaillées avec des tags spécifiques obtiennent des scores de qualité plus élevés.

### Tags qui fonctionnent bien

Utilisez des tags séparés par des points-virgules pour un filtrage facile :
```
tags: "redis;performance;fix"
tags: "auth;jwt;security"
tags: "api;rest;versioning"
```

> **Astuce :** Gardez les tags courts et cohérents. Ce ne sont pas des hashtags — ce sont des filtres de recherche. Des tags plus spécifiques = score de qualité supérieur.

### Ce qu'il ne faut PAS sauvegarder

- Ne sauvegardez pas ce qui est évident en lisant le code
- Ne sauvegardez pas les notes de débogage temporaires
- Ne sauvegardez pas de secrets, clés API, ou identifiants (utilisez des variables d'environnement à la place)
- Ne dupliquez pas la même information avec des clés différentes (le fusion-dédoublonnage gère automatiquement les clés identiques)
- Les entrées vagues sans tags obtiennent des scores de qualité bas — soyez précis

### Gardez la mémoire propre

Exécutez `memory_archive()` mensuellement pour déplacer les anciennes entrées dans les archives. Exécutez `memory_stats()` pour vérifier la taille et la distribution de qualité. Les entrées de faible qualité (contenu vague, pas de tags) ont automatiquement une priorité de rappel réduite. Utilisez `memory_consolidate` pour fusionner les doublons et `mode: "versions"` pour retirer les notes remplacées par des versions de bibliothèque plus récentes.

---

## Commandes CLI

```bash
npx toon-memory              # Installateur interactif
npx toon-memory init         # Installation rapide (sans invitation)
npx toon-memory mcp          # Exécuter le serveur MCP directement
npx toon-memory status       # Vérifier l'état de l'installation
npx toon-memory stats        # Voir les statistiques de la mémoire
npx toon-memory export       # Exporter la mémoire en JSON
npx toon-memory import <file> # Importer la mémoire depuis JSON
npx toon-memory viewer       # Ouvrir le visualiseur du graphe mémoire (serveur http)
npx toon-memory viewer --export # Sauvegarder le visualiseur en HTML statique
npx toon-memory viewer --port 3001 # Port personnalisé
npx toon-memory watch [options] # Sauvegarde automatique avec options
npx toon-memory upgrade      # Mettre à jour vers la dernière version
npx toon-memory uninstall    # Supprimer de tous les agents
```

### Exemples

#### Stats

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

> **Astuce :** Si la mémoire devient trop grande (100+ entrées), envisagez d'archiver ou de supprimer les entrées obsolètes avec `memory_forget`.

#### Export

```bash
$ npx toon-memory export

🧠 toon-memory export

Exported 45 entries to:
  /path/to/project/toon-memory-export.json
```

> **Astuce :** Exportez avant les refactorisations importantes. Vous pourrez toujours importer la sauvegarde plus tard si quelque chose tourne mal.

#### Import

```bash
$ npx toon-memory import backup.json

🧠 toon-memory import

Imported 3 new entries
Skipped 2 duplicates
```

> **Astuce :** Les doublons sont détectés par clé. Si vous voulez réimporter une entrée, supprimez d'abord l'ancienne avec `memory_forget`.

#### Surveillance

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

> **Astuce :** Le mode surveillance est idéal pour les sessions longues. Utilisez `-c` pour compresser et `-m 5` pour ne conserver que 5 sauvegardes.

**Options de surveillance :**

| Option | Description | Par défaut |
|--------|-------------|---------|
| `[interval]` | Intervalle de sauvegarde en minutes | 5 |
| `-c, --compress` | Activer la compression gzip | désactivé |
| `-l, --log [path]` | Activer la journalisation fichier | désactivé |
| `-m, --max-backups <n>` | Nombre maximum de sauvegardes à conserver (0=illimité) | 10 |

---

## Configuration

### Installateur interactif (recommandé)

```bash
npx toon-memory
```

L'installateur (nécessite un terminal) va :
1. Afficher les 15 agents supportés avec l'état de détection (`✓` config trouvée) et leur portée supportée (`local/global` ou `solo local`)
2. Vous permettre de sélectionner lesquels configurer — par numéro (`1,3,5`), par nom (`claude,codex`), `all`, Entrée pour tous, ou `q` pour quitter
3. Demander la portée d'installation : **(1) Local** (projet : `.toon-memory` + configs d'agent dans le dépôt) ou **(2) Global** (configs `~home`)
4. Afficher un récapitulatif de confirmation (`agent → portée → chemin (MCP/plugin/hooks/instrucciones)`) et demander `¿Proceder? [Y/n]`
5. Configurer automatiquement le serveur MCP, les fichiers d'instructions et les hooks

> Sans terminal (CI/pipes) `npx toon-memory` affiche l'aide d'installation non interactive. Utilisez `npx toon-memory init [local|global]` pour installer sans questions. Les commandes inconnues affichent l'utilisation et quittent avec une erreur.

### OpenCode

Ajoutez à `.opencode/opencode.json` ou `~/.config/opencode/opencode.json` :

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

> **Les hooks sont fournis via un plugin**, pas via une clé `hooks` au niveau racine. OpenCode 1.17+ rejette `"Unrecognized key: hooks"` dans sa config — `toon-memory init` écrit `.opencode/plugins/toon-memory.ts` à la place. N'ajoutez pas `hooks` à `opencode.json`.

### Claude Code

Ajoutez à `.mcp.json` (racine du projet) :

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

Ajoutez à `.vscode/mcp.json` :

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

Ajoutez à `.codex/config.toml` :

```toml
[mcpServers.toon-memory]
command = "npx"
args = ["-y", "toon-memory", "mcp"]
```

### Gemini CLI

Ajoutez à `.gemini/settings.json` :

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

Ajoutez à `~/.config/zed/settings.json` :

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

> **Astuce :** Utilisez la config globale si vous voulez la mémoire pour tous les projets. Utilisez la config au niveau projet si vous ne la voulez que pour des projets spécifiques.

---

## Fonctionnement

1. **Serveur MCP** — S'exécute en local, communique avec votre agent via stdio
2. **Format TOON** — Stocke les données en Token-Oriented Object Notation (~22.5% de tokens en moins que JSON, mesuré sur 16 entrées avec gpt-tokenizer). Chaque entrée suit automatiquement la qualité (0–1) et la confiance (0–1).
3. **Mémoire par projet** — Chaque projet possède `.toon-memory/memory/data.toon`
4. **Configuration zéro** — Installez et utilisez

### Format du fichier mémoire

```
version: 1
entries[3|]{id|category|key|content|file|tags|date|ttl|accessed|links|quality|confidence|lastAccessed|priority|path_scope|origin|status}:
  a1b2c3d4|decision|use-zod|Use Zod for validation|src/types.ts|validation;types|2026-07-10||0||0.65|1.0||0||agent|active
  e5f6g7h8|pattern|pydantic-configs|Project uses Pydantic v2|config.py|python;patterns|2026-07-10||0||0.55|1.0||0||agent|active
  i9j0k1l2|bug|redis-pool-fix|Added max_connections=20 (see [[use-zod]])|redis.ts|redis;fix|2026-07-10|7d|0|use-zod|0.70|0.9||0||agent|active
summaries:
  src/services/redis.ts: Redis connection pool with retry logic
```

### Structure des fichiers

```
.toon-memory/
├── memory/
│   ├── data.toon        # Fichier mémoire principal
│   ├── archive.toon     # Entrées archivées (>30 jours)
│   ├── config.json      # Paramètres de chiffrement
│   └── backups/         # Sauvegardes du mode surveillance
│       ├── backup-2026-07-11T16-00-00-000Z.toon
│       └── backup-2026-07-11T16-10-00-000Z.toon
└── hooks/
    ├── session-start-claude.sh
    ├── session-start-codex.sh
    ├── session-start-gemini.sh
    └── session-start-antigravity.sh
```

---

## Pourquoi TOON ?

TOON (Token-Oriented Object Notation) est conçu pour les LLM :

| Format | Tokens (16 entrées) |
|--------|---------------------|
| JSON | 1097 |
| **TOON** | **850** |

Mesuré avec `gpt-tokenizer` (cl100k_base) sur 16 entrées mémoire représentatives — voir `scripts/benchmark-toon.mjs` (`npm run bench`).

L'économie de tokens se cumule au moment de la session : `npm run bench:impact` simule la récupération de contexte **avec vs sans** mémoire et mesure environ 68% de tokens en moins pour obtenir le même contexte (rappel `compact` au lieu de relire les fichiers source). Le benchmark complet de session (`npm run bench:full`) montre **80% d'appels d'outils en moins** et **47% de tokens en moins** avec les outils context_*.

- **22.5% de tokens en moins** que JSON au niveau fichier (jusqu'à 30.5% sur une seule entrée)
- **Allers-retours sans perte** — Aucune perte de données
- **Meilleure compréhension par les LLM** — Structuré pour la consommation par l'IA
- **Qualité et confiance** — Chaque entrée suit automatiquement la qualité structurelle (0–1) et la fiabilité (0–1)

> **Astuce :** Moins de tokens = réponses plus rapides + coûts d'API réduits. Votre agent lit les fichiers mémoire au démarrage de chaque session, donc l'efficacité compte.

---

## Benchmark : toon-memory vs Alternatives

| Fonctionnalité | toon-memory | @modelcontextprotocol/server-memory | mem0 | shodh-memory |
|---------|-------------|--------------------------------------|------|--------------|
| **Stockage** | Fichier local (TOON) | Fichier local (JSON) | Cloud | RocksDB |
| **Dépendances** | Aucune | Aucune | API Cloud | sentence-transformers, RocksDB |
| **Recherche** | BM25 + graphe + qualité | Recherche par mots-clés basique | Vecteur uniquement | Hybride (vecteur + graphe) |
| **Efficacité tokens** | 22.5% de moins que JSON | Baseline (JSON) | N/A (cloud) | Similaire |
| **Scoring de qualité** | Automatique (0–1, heuristiques) | Aucun | Aucun | Algorithme BND |
| **Fusion-dédoublonnage** | Union tags + confiance max | Aucun | Aucun | Dédoublonnage par contenu |
| **Suivi de confiance** | Par entrée (0–1) | Aucun | Aucun | Par entrée |
| **System Primer** | Auto-généré | Aucun | Aucun | Aucun |
| **Multi-session** | Coordination basée sur les fichiers | Aucun | N/A | Aucun |
| **Hooks** | 15 agents | Aucun | Aucun | Claude uniquement |
| **Chiffrement** | AES-256-GCM | Aucun | Géré par le cloud | Aucun |
| **Temps de config** | `npx toon-memory` | JSON manuel | Inscription cloud | Docker + config |

### Efficacité des tokens (mesuré)

```
Format          Tokens (16 entrées)    vs JSON
──────────────  ───────────────────    ───────
JSON            1097                   baseline
TOON            850                    -22.5%
```

### Efficacité du rappel (mesuré)

```
Méthode                        Tokens pour le contexte    vs relire les fichiers
─────────────────────────────  ─────────────────────    ───────────────────
Relire les fichiers source     ~3000                    baseline
memory_recall (flat)           ~1200                    -60%
memory_recall (graph, compact) ~900                     -70%
memory_smart_recall            ~850                     -72%
```

### Benchmark des outils de contexte (mesuré）

Les outils `context_*` remplacent 3 à 6 appels d'outils séparés par un seul appel, économisant des tokens et la surcharge d'appels d'outils.

```
Scénario                        Sans       Avec     Économie  Outils
──────────────────────────────  ────────  ──────  ───────  ──────
context_generate (briefing)       5,556     378    93.2%   6 → 1
context_diff (incrémental)          533     152    71.5%   4 → 1
context_focus (ciblé)               413     225    45.5%   4 → 1
context_health (audit)              322     246    23.6%   5 → 1
context_export (md injectable)    1,178     218    81.5%   3 → 1
──────────────────────────────  ────────  ──────  ───────  ──────
TOTAL                            8,002   1,219    84.8%  22 → 5
```

**Ce que mesure chaque scénario :**

| Outil | Sans (chemin manuel) | Avec (appel unique) | Pourquoi ça économise |
|------|----------------------|-------------------|-------------|
| `context_generate` | Lire `package.json` + `README` + `tsconfig.json` + dump mémoire complet + stats mémoire + sessions = 6 appels | Un briefing compact avec tout | Élimine 5 lectures redondantes ; la sortie est dédoublonnée et compacte |
| `context_diff` | `git log` + `git diff --name-only` + `memory_diff` + sessions = 4 appels | Un diff incrémental | Combine l'état git + les changements mémoire en une seule sortie ; pas de chevauchement |
| `context_focus` | `memory_recall` + `findCallers` + `findRelatedFiles` + `findTestFiles` = 4 appels | Un briefing ciblé | Ne retourne que ce qui est pertinent ; pas besoin de scanner toute la mémoire |
| `context_health` | `memory_stats` + scan orphelins + scan doublons + validation refs fichiers + sessions obsolètes = 5 appels | Un rapport de santé | Chaque vérification est faite une fois et dédoublonnée ; pas de requêtes redondantes |
| `context_export` | `memory_stats` + `memory_recall({ compact: true, mode: "graph" })` + formatage manuel = 3 appels | Un export markdown | Formate la sortie directement ; l'agent saute l'étape « formater en markdown » |

> **Astuce :** Utilisez `context_generate` au début de session (93% d'économie de tokens). Utilisez `context_diff` pour « qu'est-ce qui a changé depuis la dernière fois ? » (72% d'économie). Utilisez `context_focus` pour les analyses approfondies sur des sujets spécifiques (45% d'économie).

Mesuré avec `gpt-tokenizer` (cl100k_base) sur des scénarios de projet réalistes — voir `scripts/bench-context-tools.mjs` (`npm run bench:context`).

### Impact complet sur la session (mesuré)

Simule une session d'agent complète en 5 phases (démarrage → débogage → implémentation → revue → bilan) selon 3 approches : sans mémoire, avec `memory_recall`, et avec les outils `context_*`.

```
Phase                                   Sans mémoire      memory_recall      Outils context_*
──────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
Phase 1: Début de session               516 t /  6 c       409 t /  3 c       373 t /  1 c
Phase 2: Débogage                       176 t /  4 c       182 t /  2 c       252 t /  1 c
Phase 3: Implémentation                 189 t /  6 c       183 t /  3 c       305 t /  1 c
Phase 4: Revue de code                  316 t /  4 c       130 t /  2 c       243 t /  1 c
Phase 5: Bilan                        1,214 t /  5 c        68 t /  2 c       117 t /  1 c
──────────────────────────────────────  ─────────────────  ─────────────────  ─────────────────
TOTAL                                 2,411 t / 25 c       972 t / 12 c     1,290 t /  5 c
```

**Résultats clés :**

| Métrique | Sans mémoire | Avec memory_recall | Avec outils context_* |
|--------|---------------|-------------------|---------------------|
| Tokens par session | 2,411 | 972 (-60%) | 1,290 (-47%) |
| Appels d'outils par session | 25 | 12 (-52%) | **5 (-80%)** |
| Coût par session (GPT-4) | $0.072 | $0.029 | $0.039 |

**Le compromis :** `memory_recall` utilise moins de tokens (972 vs 1,290) car il ne retourne que les entrées correspondantes. Les outils `context_*` retournent un **contexte plus riche** (appelants, fichiers liés, fichiers de test, audit de santé) — plus de tokens par appel, mais **80% d'appels d'outils en moins**. En pratique, l'évite 3-4 appels « trouver les éléments liés » que `context_focus` inclut déjà.

**Là où context_* excelle :**
- **Début de session** (Phase 1) : 28% de tokens en moins + 6→1 appels — un briefing remplace la lecture de 6 fichiers
- **Bilan** (Phase 5) : 90% de tokens en moins — `context_health` remplace 5 scans manuels
- **Appels d'outils** : 25→5 appels = **80% de latence en moins** par session

> **Astuce :** Utilisez `memory_recall` quand vous avez besoin d'entrées spécifiques (moins de tokens). Utilisez `context_*` quand vous avez besoin d'un contexte complet avec moins d'aller-retours (moins d'appels).

Mesuré avec `gpt-tokenizer` (cl100k_base) — voir `scripts/bench-full-impact.mjs` (`npm run bench:full`).

> **Astuce :** `memory_smart_recall` combine BM25 + graphe + qualité en un seul appel, économisant des tokens et la surcharge d'appels d'outils. Utilisez-le au début de chaque tâche.

### Benchmark du classement RRF (mesuré)

Depuis la v3.7.0, le rappel classe les résultats avec la **fusion de rangs réciproques (Reciprocal Rank Fusion)** sur les rangs BM25 (×3) et de centralité du graphe, avec un `k` adaptatif `= clamp(3..60, round(sqrt(n)))`. Mesuré sur 8 requêtes de référence (gold-standard) avec pertinence étiquetée à la main (voir `scripts/bench-rrf.mjs`, `npm run bench:rrf`) :

```
Metric        linear (v3.6.x)     RRF (v3.7.0)
────────────  ─────────────────   ────────────────
nDCG@10       0.776               0.776   (parity)
MRR           0.917               0.917   (parity)
```

Le RRF correspond au score linéaire pondéré précédent à **coût de classement nul**, tout en simplifiant le pipeline de scoring (BM25×3 + centralité, sans bruit d'importance/récence). Le remplacement en mode graphe est respecté : les entrées obsolètes restent exclues sauf pour les requêtes ponctuelles `as_of`.

### Benchmark de récupération (style LongMemEval, mesuré)

Depuis la v4.1.0, la récupération est évaluée contre un **instantané figé d'une vraie mémoire de projet** — un ensemble de test de style LongMemEval avec des requêtes en or rédigées à la main. Corpus : 187 entrées `data.toon` réelles (instantané `2026-08-01`), 42 requêtes en or réparties sur 6 catégories (core-fact, temporal, knowledge-updating, multi-hop, meta/session, distractor). Le code mesuré est le **pipeline de production** (`src/lib`), empaqueté en mémoire avec esbuild — aucune copie approximative. Un paramètre déterministe `today` fige la récence/décroissance pour que les résultats ne dérivent pas avec l'horloge ; les exécutions sont en lecture seule (pas de suivi des accès). Deux méta-entrées prioritaires qui décrivent le fichier de données lui-même sont exclues. Voir `benchmarks/retrieval-corpus.toon`, `benchmarks/gold-queries.json` (`npm run bench:retrieval`) :

```
Mode            R@5     nDCG@5  MRR@5   answerable
─────────────   ─────   ─────   ─────   ──────────
linear         0.643   0.654   0.776   81.0%
rrf            0.861   0.764   0.788   97.6%
smart (unified) 0.829  0.739   0.760   92.5%
```

Le RRF est le mode le mieux classé (0.861 R@5, 97.6% des requêtes répondables depuis le top-5) ; `memory_smart_recall` reste compétitif en un seul appel.

---

## Dépannage

### Mémoire introuvable après installation

**Symptôme :** L'agent indique qu'il n'a pas d'outils mémoire.

**Solution :**
1. Exécutez `npx toon-memory status` pour vérifier l'installation
2. Redémarrez complètement votre agent (fermez et rouvrez)
3. Vérifiez que le fichier de config MCP existe et est un JSON valide

### Le fichier mémoire est vide

**Symptôme :** `memory_stats` affiche 0 entrées.

**Solution :** C'est normal lors de la première installation. Commencez à utiliser `memory_remember` pour sauvegarder des entrées.

### Entrées en doublon

**Symptôme :** La même clé apparaît plusieurs fois.

**Solution :** `memory_remember` avec la même clé fusionne maintenant automatiquement (union des tags, confiance maximale, date la plus récente). Utilisez `memory_consolidate` pour fusionner toutes les entrées de même clé et supprimer les doublons de contenu exact. Pour un nettoyage manuel, utilisez `memory_forget`.

### Clé de chiffrement perdue

**Symptôme :** Impossible de déchiffrer la mémoire.

**Solution :** Malheureusement, il n'y a aucun moyen de récupération. La clé de chiffrement n'est stockée nulle part après sa génération. C'est voulu pour des raisons de sécurité. Vous devrez repartir de zéro ou restaurer depuis une sauvegarde non chiffrée.

### Mémoire trop volumineuse

**Symptôme :** Les réponses de l'agent sont lentes.

**Solution :**
1. Exécutez `memory_archive()` pour déplacer les anciennes entrées dans les archives
2. Utilisez `memory_forget` pour supprimer les entrées non pertinentes
3. Gardez les entrées concises — sauvegardez la décision, pas la conversation entière
4. Les entrées de faible qualité (vagues, pas de tags) ont automatiquement une priorité de rappel réduite

---

## FAQ

### Est-ce que ça fonctionne avec n'importe quel agent IA ?

Oui, tant qu'il supporte le MCP (Model Context Protocol). Nous avons une configuration automatique pour 15 agents, avec une configuration manuelle disponible pour les autres.

### Mes données sont-elles envoyées quelque part ?

Non. Tout reste sur votre machine. Le serveur MCP s'exécute en local via stdio — pas d'appels réseau, pas de télémétrie, pas de cloud.

### Puis-je utiliser ceci sur plusieurs machines ?

Oui, si vous synchronisez le répertoire `.toon-memory/memory/` (par exemple via Git ou un dossier partagé). Chaque machine doit avoir toon-memory installé, mais le fichier mémoire est portable.

### Que se passe-t-il si j'ai plusieurs projets ?

Chaque projet obtient son propre fichier mémoire. La mémoire ne fuit pas entre les projets.

### Puis-je chiffrer uniquement des entrées spécifiques ?

Non, le chiffrement s'applique à l'ensemble du fichier mémoire. Si vous avez besoin d'un chiffrement sélectif, conservez les données sensibles dans un outil séparé.

### En quoi est-ce différent d'utiliser simplement un fichier Markdown ?

Les fichiers Markdown ne sont pas structurés, ne sont pas consultables de la même manière par votre agent, ne s'intègrent pas via MCP, et n'ont pas de fonctionnalités comme l'archivage, le filtrage par date, le scoring de qualité, le fusion-dédoublonnage, le suivi de confiance, ou le chiffrement. toon-memory est spécifiquement conçu pour les agents IA.

---

## Développement

```bash
git clone https://github.com/LuiggiVal08/toon-memory.git
cd toon-memory
npm install
npm run build
npm test
```

### Structure du projet

```
toon-memory/
├── src/
│   ├── bin/
│   │   └── toon-memory.ts      # Point d'entrée
│   ├── cli/
│   │   ├── setup.ts             # Commandes CLI
│   │   └── toon-memory.ts       # Exécuteur CLI
│   ├── mcp/
│   │   ├── server.ts            # Serveur MCP (35 outils + 4 ressources + 1 prompt)
│   │   ├── tools.ts             # Enregistrement des outils (35 outils)
│   │   ├── resources.ts         # Enregistrement des ressources (4 ressources)
│   │   ├── prompts.ts           # Enregistrement des prompts (1 prompt)
│   │   ├── session-store.ts     # Couche de session (auto-promotion, nettoyage)
│   │   ├── memory-io.ts         # Lecture/écriture du fichier mémoire
│   │   ├── entries.ts           # Analyse et utilitaires des entrées
│   │   ├── scoring.ts           # Scoring des entrées et suivi des accès
│   │   ├── archive.ts           # Gestion des archives
│   │   ├── consolidation.ts     # Consolidation des doublons
│   │   ├── config.ts            # Chargement et sauvegarde de la config
│   │   └── crypto.ts            # Chiffrement AES-256-GCM
│   ├── lib/
│   │   ├── lock.ts              # Verrou de fichier consultatif + écriture atomique
│   │   ├── sessions.ts          # Coordination multi-session
│   │   ├── graph.ts             # Graphe mémoire (parse, construction, BM25, centralité, rendu compact)
│   │   ├── quality.ts           # Scoring de qualité, fusion-dédoublonnage, smart recall, system primer
│   │   ├── context.ts           # Générateur de briefing contextuel (contexte en un appel)
│   │   └── vocab.ts             # Découverte du vocabulaire projet depuis les dépendances
├── tests/
│   ├── cli.test.ts              # Tests CLI
│   ├── memory.test.ts           # Tests mémoire
│   ├── sessions.test.ts         # Tests multi-session
│   ├── graph.test.ts            # Tests du graphe mémoire
│   └── quality.test.ts          # Tests de scoring de qualité, fusion-dédoublonnage, smart recall, system primer
├── .github/workflows/
│   ├── ci.yml                   # CI (Node.js 20/22)
│   └── publish.yml              # Publication auto lors de la release
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Contribuer

Les contributions sont les bienvenues ! Veuillez d'abord lire notre [Code de conduite](CODE_OF_CONDUCT.md) et notre [Guide de contribution](CONTRIBUTING.md).

1. Forkez le dépôt
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commitez vos changements (`git commit -m 'feat: add amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

---

## Sécurité et confidentialité

toon-memory est conçu avec la sécurité et la confidentialité comme principe fondamental.

- **Stockage 100% local** — Toute la mémoire est stockée localement sur votre machine dans `.toon-memory/memory/`. Aucune donnée n'est jamais envoyée à des serveurs externes, services cloud ou tiers.
- **Aucune télémétrie** — Le projet a zéro télémétrie, analyse ou suivi de quelque nature que ce soit. Aucune donnée d'utilisation n'est collectée.
- **Aucune exécution de code distant** — toon-memory s'exécute comme un serveur MCP standard via stdio. Il ne télécharge, n'exécute ni n'évalue de code distant.
- **Chiffrement au repos** — Chiffrement AES-256-GCM optionnel pour l'ensemble du fichier mémoire. Activez-le avec `memory_encrypt` (nécessite la variable d'environnement `TOON_MEMORY_KEY`).
- **La clé de chiffrement n'est jamais stockée** — La clé de chiffrement doit être fournie via une variable d'environnement et n'est jamais persistée par toon-memory. Si elle est perdue, les données ne peuvent pas être récupérées.
- **Isolation par projet** — Chaque projet possède son propre fichier mémoire isolé. La mémoire ne fuit pas entre les projets.
- **`.gitignore` automatique** — L'installateur ajoute `.toon-memory/memory/` au `.gitignore` pour empêcher les commits accidentels des données mémoire.

---

## Licence

MIT

---

## Crédits

Construit avec [@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon) et [@modelcontextprotocol/server](https://www.npmjs.com/package/@modelcontextprotocol/server).
