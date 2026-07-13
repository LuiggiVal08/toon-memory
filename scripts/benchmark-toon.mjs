// Reproducible token benchmark: real toon-memory format vs JSON.
// Run with: npm run bench
//
// The actual on-disk format (data.toon) is a header + pipe-delimited
// lines, NOT the @toon-format/toon object encoder. This benchmark
// serializes the same data both ways and counts real LLM tokens.
import { encode as encodeTokens } from 'gpt-tokenizer';

// Representative corpus of real-world toon-memory entries.
const corpus = [
  { category: 'decision', key: 'use-zod', content: 'Use Zod for validation across all API inputs to avoid runtime type errors.', file: 'src/types.ts', tags: 'types;validation', date: '2026-07-01', ttl: '' },
  { category: 'pattern', key: 'redis-pool-fix', content: 'Added max_connections=20 to the Redis pool after the connection storm during the Black Friday incident. Monitor via redis-cli info clients.', file: 'src/cache/redis.ts', tags: 'redis;cache', date: '2026-07-02', ttl: '' },
  { category: 'bug', key: 'jwt-refresh-race', content: 'Refresh tokens could be reused within the 30s grace window, allowing replay. Fixed by tracking jti in a denylist set.', file: 'src/auth/jwt.ts', tags: 'auth;jwt', date: '2026-07-03', ttl: '' },
  { category: 'knowledge', key: 'deploy-pipeline', content: 'Production deploys run via GitHub Actions on the release/* branch. Never merge directly to main; squash-merge only.', file: 'CI', tags: 'ci;deploy', date: '2026-07-04', ttl: '' },
  { category: 'decision', key: 'postgres-not-mysql', content: 'Chose Postgres over MySQL for native JSONB and window functions used by the analytics service.', file: 'docs/adr/001-db.md', tags: 'db;architecture', date: '2026-07-05', ttl: '' },
  { category: 'pattern', key: 'retry-with-backoff', content: 'Wrap all outbound HTTP calls in exponential backoff with jitter. Max 5 attempts, base 200ms.', file: 'src/lib/http.ts', tags: 'http;resilience', date: '2026-07-06', ttl: '' },
  { category: 'bug', key: 'memory-leak-worker', content: 'Worker threads leaked event listeners on each job. Fixed by removing listeners in the cleanup hook.', file: 'src/workers/pool.ts', tags: 'workers;memory', date: '2026-07-07', ttl: '' },
  { category: 'knowledge', key: 'api-versioning', content: 'API is versioned via URL prefix /v1 and /v2. v1 is frozen; all new work targets v2.', file: 'src/server.ts', tags: 'api', date: '2026-07-08', ttl: '' },
  { category: 'decision', key: 'no-orm', content: 'Use raw SQL via pg with hand-written queries. ORMs added too much overhead for our reporting queries.', file: 'src/db/queries.ts', tags: 'db;sql', date: '2026-07-09', ttl: '' },
  { category: 'pattern', key: 'feature-flags', content: 'Gate experimental UI behind LaunchDarkly flags. Default off; enable per-tenant via the admin panel.', file: 'src/features/flags.ts', tags: 'features;flags', date: '2026-07-10', ttl: '' },
  { category: 'bug', key: 'timezone-off-by-one', content: 'Reports showed off-by-one days because timestamps were converted in local tz. Fixed by storing and querying in UTC only.', file: 'src/reports/date.ts', tags: 'reports;timezone', date: '2026-07-11', ttl: '' },
  { category: 'knowledge', key: 'onboarding-checklist', content: 'New engineers: clone repo, run npm install, copy .env.example, run npm run dev, then run npx toon-memory init.', file: 'docs/ONBOARDING.md', tags: 'docs;onboarding', date: '2026-07-12', ttl: '' },
  { category: 'decision', key: 'monorepo-turborepo', content: 'Adopted Turborepo for task caching. CI runs turbo run build --filter=web... to scope changes.', file: 'turbo.json', tags: 'build;monorepo', date: '2026-07-13', ttl: '' },
  { category: 'pattern', key: 'idempotency-keys', content: 'All mutating endpoints accept an Idempotency-Key header, stored in Redis with a 24h TTL to dedupe retries.', file: 'src/api/middleware.ts', tags: 'api;idempotency', date: '2026-07-14', ttl: '' },
  { category: 'bug', key: 'cors-credentials', content: 'CORS with credentials required explicit origin allowlist; wildcard was silently dropping the cookie.', file: 'src/server/cors.ts', tags: 'cors;auth', date: '2026-07-15', ttl: '' },
  { category: 'knowledge', key: 'incident-channel', content: 'Production incidents are coordinated in #incidents. Page on-call via /pd trigger; do not DM individuals.', file: 'docs/runbook.md', tags: 'ops;incidents', date: '2026-07-16', ttl: '30d' },
];

// Build the real stored representation: header + pipe-delimited lines.
const entries = corpus.map((e, i) => ({
  id: `rel${String(i + 1).padStart(6, '0')}`,
  category: e.category,
  key: e.key,
  content: e.content,
  file: e.file,
  tags: e.tags,
  date: e.date,
  ttl: e.ttl,
}));

const header = `version: 1\nentries[${entries.length}|]{id|category|key|content|file|tags|date|ttl}:`;
const toonStr =
  header + '\n' +
  entries.map((e) => `  ${e.id}|${e.category}|${e.key}|${e.content}|${e.file}|${e.tags}|${e.date}|${e.ttl}`).join('\n');

// Compact JSON (no whitespace) — the most JSON-favorable comparison,
// so any savings reported are a conservative lower bound.
const jsonStr = JSON.stringify(entries);

const toonTokens = encodeTokens(toonStr).length;
const jsonTokens = encodeTokens(jsonStr).length;
const reduction = ((1 - toonTokens / jsonTokens) * 100).toFixed(1);

// Single-entry example, echoing the README "per entry" style.
const sample = entries[0];
const sampleToon = `  ${sample.id}|${sample.category}|${sample.key}|${sample.content}|${sample.file}|${sample.tags}|${sample.date}|${sample.ttl}`;
const sampleToonTokens = encodeTokens(sampleToon).length;
const sampleJsonTokens = encodeTokens(JSON.stringify(sample)).length;
const sampleReduction = ((1 - sampleToonTokens / sampleJsonTokens) * 100).toFixed(1);

console.log('toon-memory — real format vs JSON token benchmark');
console.log('Tokenizer: gpt-tokenizer (cl100k_base)');
console.log(`Corpus: ${entries.length} representative memory entries\n`);
console.log('┌───────────┬────────────┬───────────┐');
console.log('│ Format    │ Chars      │ Tokens    │');
console.log('├───────────┼────────────┼───────────┤');
console.log(`│ JSON      │ ${String(jsonStr.length).padStart(10)} │ ${String(jsonTokens).padStart(9)} │`);
console.log(`│ TOON      │ ${String(toonStr.length).padStart(10)} │ ${String(toonTokens).padStart(9)} │`);
console.log('└───────────┴────────────┴───────────┘');
console.log(`\nTOON uses ${reduction}% fewer tokens than JSON (corpus level).`);
console.log(`Single entry: ${sampleReduction}% fewer tokens (JSON ${sampleJsonTokens} → TOON ${sampleToonTokens}).`);

console.log('\n// metrics for the docs site');
console.log(JSON.stringify({
  entries: entries.length,
  jsonTokens,
  toonTokens,
  reductionPct: Number(reduction),
  singleEntry: { jsonTokens: sampleJsonTokens, toonTokens: sampleToonTokens, reductionPct: Number(sampleReduction) },
}, null, 2));
