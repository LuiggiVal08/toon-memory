// System primer benchmark: measures token savings of auto-injected context
// vs manual memory_recall calls.
//
// Simulates a 30-entry project and compares:
//   WITHOUT primer: agent makes multiple memory_recall calls to get context
//   WITH primer:    agent receives auto-injected system primer at session start
//
// The system primer is a lightweight knowledge map (~100-200 tokens) that
// replaces 3-5 separate memory_recall calls that would otherwise be needed.
//
// Run with: npm run bench:primer

import { encode as encodeTokens } from 'gpt-tokenizer';

// ── helpers ──────────────────────────────────────────────────────────────
function countTokens(text) {
  return encodeTokens(text).length;
}

function pad(str, len) {
  return String(str).padStart(len);
}

// ── quality score (faithful copy of src/lib/quality.ts) ────────────────
function qualityScore(tags, links, content, date, accessed = 0) {
  let score = 0;
  if (tags) {
    const count = tags.split(';').filter(Boolean).length;
    score += Math.min(0.3, count * 0.1);
  }
  if (links) {
    const count = links.split(/[\s;]+/).filter(Boolean).length;
    score += Math.min(0.2, count * 0.1);
  }
  const len = content.length;
  if (len > 20) score += 0.1;
  if (len > 60) score += 0.1;
  if (len > 150) score += 0.1;
  if (date) {
    const days = (Date.now() - new Date(`${date}T00:00:00`).getTime()) / 86400000;
    if (days < 7) score += 0.1;
    else if (days < 30) score += 0.05;
  }
  const words = content.toLowerCase().split(/\s+/).filter(Boolean);
  const unique = new Set(words);
  const specificity = words.length > 0 ? unique.size / words.length : 0;
  score += specificity * 0.1;
  if (accessed > 0) {
    score += Math.min(0.15, accessed * 0.03);
  }
  return Math.min(1, score);
}

// ── importance score (faithful copy of src/lib/utils.ts) ───────────────
function importance(e) {
  const today = new Date().toISOString().split('T')[0];
  const days = (Date.now() - new Date(`${e.date || today}T00:00:00`).getTime()) / 86400000;
  const recency = Math.min(1, Math.max(0, 30 - days) / 30);
  const freq = Math.min(1, e.accessed / 5);
  return recency * 0.6 + freq * 0.4;
}

// ── corpus ──────────────────────────────────────────────────────────────
const entries = [
  { category: 'decision', key: 'use-zod', content: 'Use Zod for validation across all API inputs to avoid runtime type errors. Shared schemas in src/types/schemas.ts ensure consistency between frontend and backend.', file: 'src/types.ts:1', tags: 'types;validation;api', date: '2026-07-20', accessed: 5, links: 'shared-types api-error-handling' },
  { category: 'pattern', key: 'redis-pool-fix', content: 'Added max_connections=20 to the Redis pool after the connection storm during the Black Friday incident. Monitor via redis-cli info clients. Alert threshold: >15 active connections.', file: 'src/cache/redis.ts:42', tags: 'redis;cache;ops', date: '2026-07-19', accessed: 3, links: 'incident-response' },
  { category: 'bug', key: 'jwt-refresh-race', content: 'Refresh tokens could be reused within the 30s grace window, allowing replay. Fixed by tracking jti in a denylist set stored in Redis with TTL matching the grace period.', file: 'src/auth/jwt.ts:87', tags: 'auth;jwt;security', date: '2026-07-18', accessed: 4, links: 'auth-middleware' },
  { category: 'knowledge', key: 'deploy-pipeline', content: 'Production deploys run via GitHub Actions on the release/* branch. Never merge directly to main; squash-merge only. Deploys require 2 approvals and passing CI.', file: 'CI', tags: 'ci;deploy;process', date: '2026-07-17', accessed: 2, links: 'ci-config' },
  { category: 'decision', key: 'postgres-not-mysql', content: 'Chose Postgres over MySQL for native JSONB and window functions used by the analytics service. PostGIS also needed for geo queries in the location service.', file: 'docs/adr/001-db.md:1', tags: 'db;architecture;adr', date: '2026-07-16', accessed: 1, links: 'analytics-service location-service' },
  { category: 'pattern', key: 'retry-with-backoff', content: 'Wrap all outbound HTTP calls in exponential backoff with jitter. Max 5 attempts, base 200ms, max delay 30s. Use AbortController for request timeout.', file: 'src/lib/http.ts:15', tags: 'http;resilience;pattern', date: '2026-07-15', accessed: 6, links: 'api-middleware' },
  { category: 'bug', key: 'memory-leak-worker', content: 'Worker threads leaked event listeners on each job. Fixed by removing listeners in the cleanup hook. Memory usage dropped from 800MB to 200MB after 10k jobs.', file: 'src/workers/pool.ts:34', tags: 'workers;memory;performance', date: '2026-07-14', accessed: 2, links: 'worker-pool-config' },
  { category: 'knowledge', key: 'api-versioning', content: 'API is versioned via URL prefix /v1 and /v2. v1 is frozen; all new work targets v2. Deprecation notices sent 90 days before v1 sunset. Migration guide in docs/api/migration.md.', file: 'src/server.ts:12', tags: 'api;versioning', date: '2026-07-13', accessed: 3, links: 'api-migration' },
  { category: 'decision', key: 'no-orm', content: 'Use raw SQL via pg with hand-written queries. ORMs added too much overhead for our reporting queries. Use pg-pool for connection management. Query builder helper in src/db/helpers.ts.', file: 'src/db/queries.ts:1', tags: 'db;sql;performance', date: '2026-07-12', accessed: 4, links: 'db-connection-pool' },
  { category: 'pattern', key: 'feature-flags', content: 'Gate experimental UI behind LaunchDarkly flags. Default off; enable per-tenant via the admin panel. Always include a fallback value. Flag keys follow: feature_<name>_enabled pattern.', file: 'src/features/flags.ts:8', tags: 'features;flags;ui', date: '2026-07-11', accessed: 2, links: 'admin-panel' },
  { category: 'bug', key: 'timezone-off-by-one', content: 'Reports showed off-by-one days because timestamps were converted in local tz. Fixed by storing and querying in UTC only. Use date-fns-tz for any display conversion.', file: 'src/reports/date.ts:23', tags: 'reports;timezone;bug', date: '2026-07-10', accessed: 1, links: 'report-generator' },
  { category: 'knowledge', key: 'onboarding-checklist', content: 'New engineers: clone repo, run npm install, copy .env.example, run npm run dev, then run npx toon-memory init. Pair with on-call engineer for first week. See docs/ONBOARDING.md for full checklist.', file: 'docs/ONBOARDING.md:1', tags: 'docs;onboarding;process', date: '2026-07-09', accessed: 7, links: 'team-setup' },
  { category: 'decision', key: 'monorepo-turborepo', content: 'Adopted Turborepo for task caching. CI runs turbo run build --filter=web... to scope changes. Local dev uses turbo watch. Cache invalidated on lockfile change.', file: 'turbo.json:1', tags: 'build;monorepo;ci', date: '2026-07-08', accessed: 3, links: 'ci-pipeline' },
  { category: 'pattern', key: 'idempotency-keys', content: 'All mutating endpoints accept an Idempotency-Key header, stored in Redis with a 24h TTL to dedupe retries. Key format: uuid + timestamp. Client must send same key on retry.', file: 'src/api/middleware.ts:67', tags: 'api;idempotency;redis', date: '2026-07-07', accessed: 2, links: 'redis-pool-fix' },
  { category: 'bug', key: 'cors-credentials', content: 'CORS with credentials required explicit origin allowlist; wildcard was silently dropping the cookie. Fixed by listing all frontend domains in the allowlist array.', file: 'src/server/cors.ts:5', tags: 'cors;auth;security', date: '2026-07-06', accessed: 1, links: 'auth-middleware' },
  { category: 'knowledge', key: 'incident-channel', content: 'Production incidents are coordinated in #incidents. Page on-call via /pd trigger; do not DM individuals. Post-incident review required within 48h. Template in docs/incident-template.md.', file: 'docs/runbook.md:34', tags: 'ops;incidents;process', date: '2026-07-05', accessed: 4, links: 'on-call-schedule' },
  { category: 'pattern', key: 'graphql-dataloaders', content: 'Use DataLoader for N+1 prevention in GraphQL resolvers. One loader per request, disposed after execution. Batch window: 10ms. Cache enabled for repeated queries within same request.', file: 'src/graphql/loaders.ts:1', tags: 'graphql;performance;pattern', date: '2026-07-04', accessed: 5, links: 'graphql-schema' },
  { category: 'decision', key: 'vitest-over-jest', content: 'Migrated from Jest to Vitest. 3x faster test runs, native ESM support, compatible API. Config in vitest.config.ts. Use describe/it/expect — same syntax as Jest.', file: 'vitest.config.ts:1', tags: 'testing;dx;performance', date: '2026-07-03', accessed: 6, links: 'test-utilities' },
  { category: 'knowledge', key: 'env-secrets-rotation', content: 'Secrets rotated monthly via Vault. App reads from env vars injected by Vault agent sidecar. Never commit .env files. Rotation calendar in docs/security/secrets-rotation.md.', file: 'docs/security/secrets.md:1', tags: 'security;vault;ops', date: '2026-07-02', accessed: 1, links: 'vault-config' },
  { category: 'pattern', key: 'graceful-shutdown', content: 'Handle SIGTERM by draining HTTP connections (30s window), closing DB pool, flushing logs, then exiting. Use p-queue for in-flight request tracking. See src/server/shutdown.ts for implementation.', file: 'src/server/shutdown.ts:1', tags: 'server;reliability;pattern', date: '2026-07-01', accessed: 3, links: 'server-config' },
  { category: 'pattern', key: 'error-boundary', content: 'React error boundaries catch rendering errors. Wrap each route in ErrorBoundary. Log to Sentry with component stack trace. Show fallback UI with retry button.', file: 'src/components/ErrorBoundary.tsx:1', tags: 'react;errors;ui', date: '2026-06-28', accessed: 2, links: 'sentry-config' },
  { category: 'knowledge', key: 'monitoring-stack', content: 'Prometheus for metrics, Grafana for dashboards, PagerDuty for alerting. Key dashboards: API latency p99, error rate, Redis memory, Postgres connections.', file: 'docs/monitoring.md:1', tags: 'monitoring;ops;observability', date: '2026-06-27', accessed: 3, links: 'alert-rules' },
  { category: 'decision', key: 'tailwind-over-css', content: 'Using Tailwind CSS for all new components. Consistent spacing scale, purged unused classes, 90% smaller CSS bundle than our custom CSS approach.', file: 'tailwind.config.ts:1', tags: 'css;frontend;dx', date: '2026-06-26', accessed: 4, links: 'design-tokens' },
  { category: 'pattern', key: 'api-rate-limiting', content: 'Rate limit: 100 req/min per API key, 20 req/min for unauthenticated. Use sliding window counter in Redis. Return 429 with Retry-After header.', file: 'src/middleware/rateLimit.ts:1', tags: 'api;security;redis', date: '2026-06-25', accessed: 2, links: 'redis-pool-fix' },
  { category: 'bug', key: 'ssr-hydration-mismatch', content: 'Hydration mismatch caused by Date.now() in server vs client render. Fixed by using useEffect for dynamic content. Always check hydration with React DevTools.', file: 'src/components/TimeAgo.tsx:15', tags: 'react;ssr;hydration', date: '2026-06-24', accessed: 1, links: 'react-patterns' },
  { category: 'knowledge', key: 'db-indexing-guide', content: 'Always add indexes for foreign keys. Composite indexes for common query patterns. Use EXPLAIN ANALYZE before adding. Document index decisions in migration comments.', file: 'docs/database.md:45', tags: 'db;performance;docs', date: '2026-06-23', accessed: 5, links: 'migration-patterns' },
  { category: 'decision', key: 'pnpm-over-npm', content: 'Migrated to pnpm. 2x faster installs, stricter dependency resolution, disk-efficient with content-addressable store. CI install time: 45s → 22s.', file: 'package.json:1', tags: 'dx;build;performance', date: '2026-06-22', accessed: 3, links: 'ci-pipeline' },
  { category: 'pattern', key: 'commit-conventions', content: 'Use conventional commits: feat:, fix:, docs:, chore:. Prefix with scope in parentheses for multi-package repos. No commit emojis. Squash merge to main.', file: 'docs/contributing.md:1', tags: 'git;process;dx', date: '2026-06-21', accessed: 2, links: 'ci-pipeline' },
  { category: 'bug', key: 'cors-preflight-cache', content: 'Preflight requests were hitting the API server unnecessarily. Fixed by setting Access-Control-Max-Age: 86400. Browser caches preflight for 24h.', file: 'src/server/cors.ts:12', tags: 'cors;performance;browser', date: '2026-06-20', accessed: 1, links: 'cors-credentials' },
  { category: 'knowledge', key: 'accessibility-checklist', content: 'WCAG 2.1 AA compliance required. Test with axe-core in CI. Keyboard navigation for all interactive elements. Focus visible indicators. Color contrast ratio >= 4.5:1.', file: 'docs/accessibility.md:1', tags: 'a11y;ui;compliance', date: '2026-06-19', accessed: 4, links: 'design-tokens' },
];

// ── TOON format representation ──────────────────────────────────────────
function buildToonLine(e) {
  const quality = qualityScore(e.tags, e.links, e.content, e.date, e.accessed);
  return `  ${e.category}|${e.key}|${e.content}|${e.file}|${e.tags}|${e.date}||${e.accessed}|${e.links}|${quality.toFixed(2)}|0.8|`;
}

const toonBody = entries.map(buildToonLine).join('\n');
const header = `version: 1\nentries[${entries.length}|]{category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:`;
const toonFull = header + '\n' + toonBody;

// ── generate system primer (faithful copy of quality.ts generateSystemPrimer) ──
function generateSystemPrimer(entries) {
  const byCategory = {};
  for (const e of entries) {
    if (!byCategory[e.category]) byCategory[e.category] = [];
    byCategory[e.category].push(e);
  }

  const lines = [
    '=== System Primer ===',
    `Entries: ${entries.length}`,
    '',
  ];

  const top = [...entries]
    .sort((a, b) => importance(b) - importance(a))
    .slice(0, 5);
  lines.push('Top memories:');
  for (const e of top) {
    const quality = qualityScore(e.tags, e.links, e.content, e.date, e.accessed);
    const conf = quality >= 0.5 ? 'high' : quality >= 0.3 ? 'medium' : 'low';
    lines.push(`  [${e.category}] ${e.key} — ${e.content.slice(0, 80)} (quality: ${conf})`);
  }
  lines.push('');

  lines.push('Categories:');
  for (const [cat, items] of Object.entries(byCategory)) {
    lines.push(`  ${cat}: ${items.length}`);
  }
  lines.push('');

  const patterns = entries.filter((e) => e.category === 'pattern');
  if (patterns.length > 0) {
    lines.push('Established patterns:');
    for (const p of patterns.slice(0, 5)) {
      lines.push(`  - ${p.key}: ${p.content.slice(0, 100)}`);
    }
  }

  return lines.join('\n');
}

// ── simulate WITHOUT primer: agent makes manual recall calls ───────────
// Agent would typically make 3-5 memory_recall calls to get the same info:
// 1. memory_recall({ query: "project overview" })  → general context
// 2. memory_recall({ query: "patterns" })          → established patterns
// 3. memory_recall({ category: "bug" })            → known bugs
// 4. memory_recall({ query: "decisions" })         → architectural decisions
// Each call returns top-5 entries in compact format (~50 tokens each)

function renderCompact(entries, opts = {}) {
  const snippetLen = opts.snippetLen ?? 90;
  return entries
    .map((e, i) => {
      let body = e.content;
      if (body.length > snippetLen) body = body.slice(0, snippetLen).trimEnd() + '...';
      const tagStr = Array.isArray(e.tags) ? e.tags.join(';') : e.tags;
      const tags = tagStr.length ? ` tags: ${tagStr}` : '';
      return `[${i + 1}] ${e.category}/${e.key}\n  ${body}${tags}`;
    })
    .join('\n\n');
}

// Scenario 1: General recall
const generalRecall = renderCompact(
  entries.sort((a, b) => importance(b) - importance(a)).slice(0, 5)
);

// Scenario 2: Patterns recall
const patternsRecall = renderCompact(
  entries.filter((e) => e.category === 'pattern').slice(0, 5)
);

// Scenario 3: Bugs recall
const bugsRecall = renderCompact(
  entries.filter((e) => e.category === 'bug').slice(0, 5)
);

// Scenario 4: Decisions recall
const decisionsRecall = renderCompact(
  entries.filter((e) => e.category === 'decision').slice(0, 5)
);

const manualRecallOutput = [
  '// memory_recall({ query: "project overview" })',
  generalRecall,
  '',
  '// memory_recall({ query: "patterns" })',
  patternsRecall,
  '',
  '// memory_recall({ category: "bug" })',
  bugsRecall,
  '',
  '// memory_recall({ query: "decisions" })',
  decisionsRecall,
].join('\n');

// ── generate system primer output ──────────────────────────────────────
const primerOutput = generateSystemPrimer(entries);

// ── measure tokens ────────────────────────────────────────────────────
const manualTokens = countTokens(manualRecallOutput);
const primerTokens = countTokens(primerOutput);
const savedTokens = manualTokens - primerTokens;
const reductionPct = ((savedTokens / manualTokens) * 100).toFixed(1);

// ── tool calls comparison ──────────────────────────────────────────────
const manualToolCalls = 4; // 4 separate memory_recall calls
const primerToolCalls = 1; // 1 memory_primer call (auto-injected = 0)

// ── report ───────────────────────────────────────────────────────────
console.log('toon-memory — system primer benchmark (auto-injection vs manual recall)');
console.log('Tokenizer: gpt-tokenizer (cl100k_base)\n');
console.log('┌─────────────────────┬────────────┐');
console.log('│ Metric              │ Value      │');
console.log('├─────────────────────┼────────────┤');
console.log(`│ Total entries       │ ${pad(entries.length, 10)} │`);
console.log(`│ Manual recall calls │ ${pad(manualToolCalls, 10)} │`);
console.log(`│ Primer auto-inject  │ ${pad('0 (free)', 10)} │`);
console.log('└─────────────────────┴────────────┘\n');

console.log('┌──────────────────────────┬────────────┬──────────┐');
console.log('│ Approach                 │ Tokens     │ Tools ⚡ │');
console.log('├──────────────────────────┼────────────┼──────────┤');
console.log(`│ WITHOUT primer (manual)  │ ${pad(manualTokens, 10)} │ ${pad(manualToolCalls, 8)} │`);
console.log(`│ WITH primer (auto)       │ ${pad(primerTokens, 10)} │ ${pad(0, 8)} │`);
console.log(`│ Saved                    │ ${pad(savedTokens, 10)} │ ${pad(`${manualToolCalls}→0`, 8)} │`);
console.log('└──────────────────────────┴────────────┴──────────┘');

console.log(`\n📊 Summary`);
console.log(`   System primer saves ${reductionPct}% tokens vs 4 manual memory_recall calls`);
console.log(`   Eliminates ${manualToolCalls} tool calls at session start`);
console.log(`   Primer generates ${primerTokens} tokens of always-current context`);
console.log(`   Manual approach accumulates ${manualTokens} tokens across separate calls`);

console.log('\n// metrics for the docs site');
console.log(JSON.stringify({
  benchmark: 'system-primer',
  totalEntries: entries.length,
  manualTokens,
  primerTokens,
  savedTokens,
  reductionPct: Number(reductionPct),
  manualToolCalls,
  primerToolCalls: 0,
}, null, 2));
