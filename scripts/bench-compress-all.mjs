// Compress-all benchmark: measures token savings of batch compression.
//
// Simulates what memory_compress_all does:
//   1. Creates a corpus of 30 TOON-format entries (mix of quality)
//   2. Identifies low-quality candidates (quality < 0.3, no tags, short)
//   3. Removes candidates
//   4. Measures before/after token counts
//
// WITHOUT compress: agent sends full 30-entry memory in context
// WITH compress:    agent sends only high-quality entries after cleanup
//
// Run with: npm run bench:compress-all

import { encode as encodeTokens } from 'gpt-tokenizer';

// ── helpers ──────────────────────────────────────────────────────────────
function countTokens(text) {
  return encodeTokens(text).length;
}

function pad(str, len) {
  return String(str).padStart(len);
}

// ── quality score (faithful copy of src/lib/quality.ts qualityScore) ────
function qualityScore(tags, links, content, date, accessed = 0, lastAccessed = '') {
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
  if (lastAccessed) {
    const daysSinceAccess = (Date.now() - new Date(lastAccessed).getTime()) / 86400000;
    if (daysSinceAccess < 1) score += 0.1;
    else if (daysSinceAccess < 7) score += 0.07;
    else if (daysSinceAccess < 30) score += 0.03;
  }
  return Math.min(1, score);
}

// ── corpus ──────────────────────────────────────────────────────────────
// 30 entries: ~20 high quality (good tags, long content, recent)
//             ~10 low quality (no tags, short content, old)
const corpus = [
  // HIGH QUALITY (20 entries)
  { category: 'decision', key: 'use-zod', content: 'Use Zod for validation across all API inputs to avoid runtime type errors. Shared schemas in src/types/schemas.ts ensure consistency between frontend and backend.', file: 'src/types.ts:1', tags: 'types;validation;api', date: '2026-07-20', ttl: '', accessed: 5, links: 'shared-types api-error-handling' },
  { category: 'pattern', key: 'redis-pool-fix', content: 'Added max_connections=20 to the Redis pool after the connection storm during the Black Friday incident. Monitor via redis-cli info clients. Alert threshold: >15 active connections.', file: 'src/cache/redis.ts:42', tags: 'redis;cache;ops', date: '2026-07-19', ttl: '', accessed: 3, links: 'incident-response' },
  { category: 'bug', key: 'jwt-refresh-race', content: 'Refresh tokens could be reused within the 30s grace window, allowing replay. Fixed by tracking jti in a denylist set stored in Redis with TTL matching the grace period.', file: 'src/auth/jwt.ts:87', tags: 'auth;jwt;security', date: '2026-07-18', ttl: '', accessed: 4, links: 'auth-middleware' },
  { category: 'knowledge', key: 'deploy-pipeline', content: 'Production deploys run via GitHub Actions on the release/* branch. Never merge directly to main; squash-merge only. Deploys require 2 approvals and passing CI.', file: 'CI', tags: 'ci;deploy;process', date: '2026-07-17', ttl: '', accessed: 2, links: 'ci-config' },
  { category: 'decision', key: 'postgres-not-mysql', content: 'Chose Postgres over MySQL for native JSONB and window functions used by the analytics service. PostGIS also needed for geo queries in the location service.', file: 'docs/adr/001-db.md:1', tags: 'db;architecture;adr', date: '2026-07-16', ttl: '', accessed: 1, links: 'analytics-service location-service' },
  { category: 'pattern', key: 'retry-with-backoff', content: 'Wrap all outbound HTTP calls in exponential backoff with jitter. Max 5 attempts, base 200ms, max delay 30s. Use AbortController for request timeout.', file: 'src/lib/http.ts:15', tags: 'http;resilience;pattern', date: '2026-07-15', ttl: '', accessed: 6, links: 'api-middleware' },
  { category: 'bug', key: 'memory-leak-worker', content: 'Worker threads leaked event listeners on each job. Fixed by removing listeners in the cleanup hook. Memory usage dropped from 800MB to 200MB after 10k jobs.', file: 'src/workers/pool.ts:34', tags: 'workers;memory;performance', date: '2026-07-14', ttl: '', accessed: 2, links: 'worker-pool-config' },
  { category: 'knowledge', key: 'api-versioning', content: 'API is versioned via URL prefix /v1 and /v2. v1 is frozen; all new work targets v2. Deprecation notices sent 90 days before v1 sunset. Migration guide in docs/api/migration.md.', file: 'src/server.ts:12', tags: 'api;versioning', date: '2026-07-13', ttl: '', accessed: 3, links: 'api-migration' },
  { category: 'decision', key: 'no-orm', content: 'Use raw SQL via pg with hand-written queries. ORMs added too much overhead for our reporting queries. Use pg-pool for connection management. Query builder helper in src/db/helpers.ts.', file: 'src/db/queries.ts:1', tags: 'db;sql;performance', date: '2026-07-12', ttl: '', accessed: 4, links: 'db-connection-pool' },
  { category: 'pattern', key: 'feature-flags', content: 'Gate experimental UI behind LaunchDarkly flags. Default off; enable per-tenant via the admin panel. Always include a fallback value. Flag keys follow: feature_<name>_enabled pattern.', file: 'src/features/flags.ts:8', tags: 'features;flags;ui', date: '2026-07-11', ttl: '', accessed: 2, links: 'admin-panel' },
  { category: 'bug', key: 'timezone-off-by-one', content: 'Reports showed off-by-one days because timestamps were converted in local tz. Fixed by storing and querying in UTC only. Use date-fns-tz for any display conversion.', file: 'src/reports/date.ts:23', tags: 'reports;timezone;bug', date: '2026-07-10', ttl: '', accessed: 1, links: 'report-generator' },
  { category: 'knowledge', key: 'onboarding-checklist', content: 'New engineers: clone repo, run npm install, copy .env.example, run npm run dev, then run npx toon-memory init. Pair with on-call engineer for first week. See docs/ONBOARDING.md for full checklist.', file: 'docs/ONBOARDING.md:1', tags: 'docs;onboarding;process', date: '2026-07-09', ttl: '', accessed: 7, links: 'team-setup' },
  { category: 'decision', key: 'monorepo-turborepo', content: 'Adopted Turborepo for task caching. CI runs turbo run build --filter=web... to scope changes. Local dev uses turbo watch. Cache invalidated on lockfile change.', file: 'turbo.json:1', tags: 'build;monorepo;ci', date: '2026-07-08', ttl: '', accessed: 3, links: 'ci-pipeline' },
  { category: 'pattern', key: 'idempotency-keys', content: 'All mutating endpoints accept an Idempotency-Key header, stored in Redis with a 24h TTL to dedupe retries. Key format: uuid + timestamp. Client must send same key on retry.', file: 'src/api/middleware.ts:67', tags: 'api;idempotency;redis', date: '2026-07-07', ttl: '', accessed: 2, links: 'redis-pool-fix' },
  { category: 'bug', key: 'cors-credentials', content: 'CORS with credentials required explicit origin allowlist; wildcard was silently dropping the cookie. Fixed by listing all frontend domains in the allowlist array.', file: 'src/server/cors.ts:5', tags: 'cors;auth;security', date: '2026-07-06', ttl: '', accessed: 1, links: 'auth-middleware' },
  { category: 'knowledge', key: 'incident-channel', content: 'Production incidents are coordinated in #incidents. Page on-call via /pd trigger; do not DM individuals. Post-incident review required within 48h. Template in docs/incident-template.md.', file: 'docs/runbook.md:34', tags: 'ops;incidents;process', date: '2026-07-05', ttl: '30d', accessed: 4, links: 'on-call-schedule' },
  { category: 'pattern', key: 'graphql-dataloaders', content: 'Use DataLoader for N+1 prevention in GraphQL resolvers. One loader per request, disposed after execution. Batch window: 10ms. Cache enabled for repeated queries within same request.', file: 'src/graphql/loaders.ts:1', tags: 'graphql;performance;pattern', date: '2026-07-04', ttl: '', accessed: 5, links: 'graphql-schema' },
  { category: 'decision', key: 'vitest-over-jest', content: 'Migrated from Jest to Vitest. 3x faster test runs, native ESM support, compatible API. Config in vitest.config.ts. Use describe/it/expect — same syntax as Jest.', file: 'vitest.config.ts:1', tags: 'testing;dx;performance', date: '2026-07-03', ttl: '', accessed: 6, links: 'test-utilities' },
  { category: 'knowledge', key: 'env-secrets-rotation', content: 'Secrets rotated monthly via Vault. App reads from env vars injected by Vault agent sidecar. Never commit .env files. Rotation calendar in docs/security/secrets-rotation.md.', file: 'docs/security/secrets.md:1', tags: 'security;vault;ops', date: '2026-07-02', ttl: '', accessed: 1, links: 'vault-config' },
  { category: 'pattern', key: 'graceful-shutdown', content: 'Handle SIGTERM by draining HTTP connections (30s window), closing DB pool, flushing logs, then exiting. Use p-queue for in-flight request tracking. See src/server/shutdown.ts for implementation.', file: 'src/server/shutdown.ts:1', tags: 'server;reliability;pattern', date: '2026-07-01', ttl: '', accessed: 3, links: 'server-config' },

  // LOW QUALITY (10 entries — should be compressed/removed)
  { category: 'decision', key: 'tmp-fix', content: 'Fixed it', file: '', tags: '', date: '2026-06-01', ttl: '', accessed: 0, links: '' },
  { category: 'pattern', key: 'quick-note', content: 'TODO', file: '', tags: '', date: '2026-06-02', ttl: '', accessed: 0, links: '' },
  { category: 'bug', key: 'wip', content: 'Working on this', file: '', tags: '', date: '2026-06-03', ttl: '', accessed: 0, links: '' },
  { category: 'knowledge', key: 'misc', content: 'Stuff', file: '', tags: '', date: '2026-06-04', ttl: '', accessed: 0, links: '' },
  { category: 'decision', key: 'old-note', content: 'Remember to check this later when we have time to investigate the root cause properly', file: '', tags: '', date: '2026-06-05', ttl: '', accessed: 0, links: '' },
  { category: 'pattern', key: 'draft', content: 'Draft', file: '', tags: '', date: '2026-06-06', ttl: '', accessed: 0, links: '' },
  { category: 'bug', key: 'placeholder', content: 'Placeholder entry', file: '', tags: '', date: '2026-06-07', ttl: '', accessed: 0, links: '' },
  { category: 'knowledge', key: 'temp', content: 'Temp', file: '', tags: '', date: '2026-06-08', ttl: '', accessed: 0, links: '' },
  { category: 'decision', key: 'maybe', content: 'Maybe we should reconsider this approach at some point', file: '', tags: '', date: '2026-06-09', ttl: '', accessed: 0, links: '' },
  { category: 'pattern', key: 'note-to-self', content: 'Look into this', file: '', tags: '', date: '2026-06-10', ttl: '', accessed: 0, links: '' },
];

// ── build TOON format ─────────────────────────────────────────────────
function buildToonLine(e) {
  const quality = qualityScore(e.tags, e.links, e.content, e.date, e.accessed, e.lastAccessed || '');
  return `${e.category}|${e.key}|${e.content}|${e.file}|${e.tags}|${e.date}|${e.ttl}|${e.accessed}|${e.links}|${quality.toFixed(2)}|0.8|`;
}

const toonLines = corpus.map(buildToonLine);
const header = `version: 1\nentries[${corpus.length}|]{category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:`;
const toonFull = header + '\n' + toonLines.map((l) => `  ${l}`).join('\n');

// ── identify compression candidates ────────────────────────────────────
const MIN_QUALITY = 0.3;
const candidates = [];
const kept = [];

for (let i = 0; i < corpus.length; i++) {
  const e = corpus[i];
  const q = qualityScore(e.tags, e.links, e.content, e.date, e.accessed, e.lastAccessed || '');
  const isCandidate = q < MIN_QUALITY || !e.tags || e.content.length < 20;
  if (isCandidate) {
    candidates.push({ idx: i, key: e.key, quality: q, content: e.content });
  } else {
    kept.push({ ...e, quality: q });
  }
}

// ── build compressed TOON (only kept entries) ──────────────────────────
const keptLines = kept.map((e) => {
  return `${e.category}|${e.key}|${e.content}|${e.file}|${e.tags}|${e.date}|${e.ttl}|${e.accessed}|${e.links}|${e.quality.toFixed(2)}|0.8|`;
});
const headerCompressed = `version: 1\nentries[${kept.length}|]{category|key|content|file|tags|date|ttl|accessed|links|quality|confidence}:`;
const toonCompressed = headerCompressed + '\n' + keptLines.map((l) => `  ${l}`).join('\n');

// ── measure tokens ────────────────────────────────────────────────────
const beforeTokens = countTokens(toonFull);
const afterTokens = countTokens(toonCompressed);
const savedTokens = beforeTokens - afterTokens;
const reductionPct = ((savedTokens / beforeTokens) * 100).toFixed(1);

// ── per-entry stats ──────────────────────────────────────────────────
const avgCandidateTokens = candidates.length > 0
  ? Math.round(countTokens(candidates.map((c) => c.content).join(' ')) / candidates.length)
  : 0;

// ── simulate agent context cost ──────────────────────────────────────
// WITHOUT compress: agent loads all 30 entries as context
// WITH compress: agent loads only 20 high-quality entries
const agentContextWithout = toonFull;
const agentContextWith = toonCompressed;

// ── report ───────────────────────────────────────────────────────────
console.log('toon-memory — compress-all benchmark (batch compression)');
console.log('Tokenizer: gpt-tokenizer (cl100k_base)\n');
console.log('┌─────────────────────┬────────────┐');
console.log('│ Metric              │ Value      │');
console.log('├─────────────────────┼────────────┤');
console.log(`│ Total entries       │ ${pad(corpus.length, 10)} │`);
console.log(`│ Candidates removed  │ ${pad(candidates.length, 10)} │`);
console.log(`│ Entries kept        │ ${pad(kept.length, 10)} │`);
console.log('└─────────────────────┴────────────┘\n');

console.log('┌─────────────────────┬────────────┬────────────┬──────────┐');
console.log('│ Context             │ Chars      │ Tokens     │ Savings  │');
console.log('├─────────────────────┼────────────┼────────────┼──────────┤');
console.log(`│ Before (all)        │ ${pad(toonFull.length, 10)} │ ${pad(beforeTokens, 10)} │          │`);
console.log(`│ After (compressed)  │ ${pad(toonCompressed.length, 10)} │ ${pad(afterTokens, 10)} │ ${pad(reductionPct + '%', 8)} │`);
console.log(`│ Tokens saved        │            │ ${pad(savedTokens, 10)} │          │`);
console.log('└─────────────────────┴────────────┴────────────┴──────────┘');

console.log(`\n📊 Summary`);
console.log(`   Removing ${candidates.length} low-quality entries saves ${reductionPct}% tokens`);
console.log(`   Average candidate quality: ${(candidates.reduce((a, c) => a + c.quality, 0) / candidates.length).toFixed(2)}`);
console.log(`   Average kept entry quality: ${(kept.reduce((a, e) => a + e.quality, 0) / kept.length).toFixed(2)}`);

console.log('\n// metrics for the docs site');
console.log(JSON.stringify({
  benchmark: 'compress-all',
  totalEntries: corpus.length,
  candidatesRemoved: candidates.length,
  entriesKept: kept.length,
  beforeTokens,
  afterTokens,
  savedTokens,
  reductionPct: Number(reductionPct),
  avgCandidateQuality: Number((candidates.reduce((a, c) => a + c.quality, 0) / candidates.length).toFixed(2)),
  avgKeptQuality: Number((kept.reduce((a, e) => a + e.quality, 0) / kept.length).toFixed(2)),
}, null, 2));
