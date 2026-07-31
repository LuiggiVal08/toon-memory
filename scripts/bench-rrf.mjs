// RRF (Reciprocal Rank Fusion) benchmark: linear weighted scoring vs rank fusion.
//
// LongMemEval-style retrieval evaluation on a realistic memory corpus:
//   queries + gold relevant sets → nDCG@5 and MRR@5 for each ranking mode.
//
// It is fully self-contained: faithful copies of the ranking pipeline live in
// src/lib/graph.ts (bm25Scores, centrality, rrfFuse, rrfK, rankBy,
// graphRecallDetailed) and src/lib/utils.ts (tokenize, importance).
// No LLM, no embeddings, no network.
//
// What it measures: linear scoring uses hand-tuned weights (W_CENT, W_IMP) plus a
// flat seed bonus; RRF fuses per-signal RANKS and needs no weights. Because a small
// memory graph has one retriever (BM25), RRF emphasizes the primary signal (BM25
// fused 3x), adds centrality once, and uses an adaptive k = sqrt(candidateCount) —
// the textbook k=60 flattens rank differences on sets this small. On this corpus RRF
// reaches exact parity with the tuned linear scorer (see Average nDCG@5).
//
// Run with: npm run bench:rrf

// ── faithful copies of src/lib/utils.ts ────────────────────────────────────
function normalize(s) {
  return s.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(s) {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function importance(e, today = '2026-07-31') {
  const days = (Date.parse(`${today}T00:00:00`) - Date.parse(`${e.date || today}T00:00:00`)) / 86400000;
  const recency = Math.min(1, Math.max(0, 30 - days) / 30);
  const freq = Math.min(1, e.accessed / 5);
  return recency * 0.6 + freq * 0.4;
}

// ── faithful copy of src/lib/fuzzy.ts ──────────────────────────────────────
function levenshtein(a, b) {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  let prev = new Array(bl + 1);
  let curr = new Array(bl + 1);
  for (let j = 0; j <= bl; j++) prev[j] = j;
  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[bl];
}

function fuzzyMatch(queryTokens, docTokens, maxDistance = 2) {
  for (const qt of queryTokens) {
    if (qt.length <= 2) continue;
    for (const dt of docTokens) {
      if (Math.abs(qt.length - dt.length) > maxDistance) continue;
      if (levenshtein(qt, dt) <= maxDistance) return true;
    }
  }
  return false;
}

// ── faithful copies of src/lib/graph.ts scoring ────────────────────────────
function bm25Scores(entries, query) {
  const N = entries.length;
  const scores = new Map();
  if (N === 0) return scores;
  const docs = entries.map((e) => tokenize(`${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(' ')} ${e.path_scope || ''}`));
  const df = new Map();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) || 0) + 1);
  const avgdl = docs.reduce((a, b) => a + b.length, 0) / N;
  const k1 = 1.5;
  const b = 0.75;
  const qTokens = tokenize(query);
  entries.forEach((e, i) => {
    const d = docs[i];
    const dl = d.length || 1;
    let score = 0;
    for (const t of qTokens) {
      const dfT = df.get(t);
      if (!dfT) continue;
      const f = d.filter((x) => x === t).length;
      const idf = Math.log((N - dfT + 0.5) / (dfT + 0.5) + 1);
      score += (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + (b * dl) / avgdl));
    }
    scores.set(e.key, score);
  });
  return scores;
}

function centrality(adjacency) {
  let maxDeg = 1;
  const deg = new Map();
  for (const [k, v] of adjacency) {
    deg.set(k, v.length);
    if (v.length > maxDeg) maxDeg = v.length;
  }
  const out = new Map();
  for (const [k, d] of deg) out.set(k, d / maxDeg);
  return out;
}

function rrfFuse(rankers, k = 60) {
  const out = new Map();
  for (const ranker of rankers) {
    for (const [key, rank] of ranker) {
      out.set(key, (out.get(key) || 0) + 1 / (k + rank));
    }
  }
  return out;
}

function rrfK(candidateCount) {
  return Math.max(3, Math.min(60, Math.round(Math.sqrt(candidateCount))));
}

function rankBy(score) {
  const out = new Map();
  [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([key], i) => out.set(key, i));
  return out;
}

// ── faithful copy of graphRecallDetailed (linear + rrf, visibility-filtered BFS) ──
const W_CENT = 0.4;
const W_IMP = 0.25;
const SEED_BONUS = 1.0;
const DECAY = 0.5;

function linkKey(token) {
  const idx = token.lastIndexOf(':');
  if (idx === -1) return token;
  return token.slice(idx + 1) || token;
}

function buildGraph(entries) {
  const byKey = new Map();
  for (const e of entries) if (!byKey.has(e.key)) byKey.set(e.key, e);
  const adj = new Map();
  const link = (a, b) => {
    if (a === b || !byKey.has(a) || !byKey.has(b)) return;
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a).add(b);
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(b).add(a);
  };
  for (const e of entries) {
    for (const l of e.links) link(e.key, linkKey(l));
    const refs = e.content.match(/\[\[([\w-]+)\]\]/g) || [];
    for (const r of refs) link(e.key, r.slice(2, -2));
  }
  if (entries.some((e) => e.tags.length > 0)) {
    for (let i = 0; i < entries.length; i++) {
      const ei = entries[i];
      if (ei.tags.length === 0) continue;
      const eTags = new Set(ei.tags);
      for (let j = i + 1; j < entries.length; j++) {
        const ej = entries[j];
        if (ej.tags.length === 0) continue;
        let shared = 0;
        for (const t of ej.tags) if (eTags.has(t)) shared++;
        if (shared >= 2) link(ei.key, ej.key);
      }
    }
  }
  const adjacency = new Map();
  for (const [k, v] of adj) adjacency.set(k, [...v]);
  return { adjacency, byKey };
}

function recall(entries, query, opts = {}) {
  const { hops = 1, limit = 6, rrf = false } = opts;
  const { adjacency, byKey } = buildGraph(entries);
  const qTokens = tokenize(query);

  const visible = entries.filter((e) => {
    if (e.status === 'obsolete' || e.status === 'draft') {
      return !!(opts.asOf && e.status === 'obsolete' && e.supersededOn && e.supersededOn > opts.asOf);
    }
    return !(opts.asOf && e.date && e.date > opts.asOf);
  });
  const isVisible = new Set(visible.map((e) => e.key));

  const seedKeys = new Set();
  for (const e of visible) {
    const text = normalize(`${e.id} ${e.category} ${e.key} ${e.content} ${e.file} ${e.tags.join(' ')} ${e.path_scope || ''}`);
    const docTokens = text.split(' ');
    const exactMatch = qTokens.some((t) => text.includes(t));
    const fuzzy = !exactMatch && fuzzyMatch(qTokens, docTokens);
    if (qTokens.length > 0 && !exactMatch && !fuzzy) continue;
    seedKeys.add(e.key);
  }

  if (seedKeys.size === 0) {
    return visible
      .sort((a, b) => importance(b, opts.today) - importance(a, opts.today))
      .slice(0, limit)
      .map((e) => e.key);
  }

  const best = new Map();
  const queue = [...seedKeys].map((key) => ({ key, dist: 0 }));
  while (queue.length) {
    const { key, dist } = queue.shift();
    if (best.has(key) && best.get(key) <= dist) continue;
    best.set(key, dist);
    if (dist >= hops) continue;
    for (const nb of adjacency.get(key) || []) {
      if (!isVisible.has(nb)) continue;
      queue.push({ key: nb, dist: dist + 1 });
    }
  }

  const sub = (m) => new Map([...m].filter(([k]) => isVisible.has(k)));
  const bm25 = bm25Scores(entries, query);
  const cent = centrality(adjacency);
  const bm25Rank = rankBy(sub(bm25));
  const centRank = rankBy(sub(cent));
  // RRF: BM25 (the only real retriever here) fused 3x, centrality once.
  // k adapts to the candidate count — see rrfK.
  const fused = rrf ? rrfFuse([bm25Rank, bm25Rank, bm25Rank, centRank], rrfK(bm25Rank.size)) : null;

  return [...best.keys()]
    .map((k) => {
      const e = byKey.get(k);
      const dist = best.get(k);
      const decay = Math.pow(DECAY, dist);
      let s = fused
        ? fused.get(k) || 0
        : (bm25.get(k) || 0) + W_CENT * (cent.get(k) || 0) + W_IMP * importance(e, opts.today);
      if (!fused && seedKeys.has(k)) s += SEED_BONUS;
      return { key: k, s: s * decay, priority: e.priority || 0 };
    })
    .sort((a, b) => (a.priority !== b.priority ? b.priority - a.priority : b.s - a.s))
    .slice(0, limit)
    .map((x) => x.key);
}

// ── retrieval metrics ──────────────────────────────────────────────────────
function dcgAt(ranking, gold, k) {
  let dcg = 0;
  for (let i = 0; i < Math.min(k, ranking.length); i++) {
    if (gold.has(ranking[i])) dcg += 1 / Math.log2(i + 2);
  }
  return dcg;
}

function ndcgAt(ranking, gold, k) {
  if (gold.size === 0) return 0;
  const ideal = [...gold].sort().slice(0, k).map((_, i) => 1 / Math.log2(i + 2)).reduce((a, b) => a + b, 0);
  return ideal > 0 ? dcgAt(ranking, gold, k) / ideal : 0;
}

function mrrAt(ranking, gold, k) {
  for (let i = 0; i < Math.min(k, ranking.length); i++) {
    if (gold.has(ranking[i])) return 1 / (i + 1);
  }
  return 0;
}

// ── corpus: a realistic 28-entry project memory ────────────────────────────
const corpus = [
  { id: 'a1', category: 'pattern', key: 'redis-pool-fix', content: 'Added max_connections=20 to the Redis pool after the connection storm during the Black Friday incident. Monitor via redis-cli info clients. Alert threshold: over 15 active connections.', file: 'src/cache/redis.ts:42', tags: 'redis;cache;ops', date: '2026-07-29', accessed: 5, links: 'incident-response', status: 'active', supersededOn: '' },
  { id: 'a2', category: 'knowledge', key: 'redis-cluster', content: 'Redis Cluster runs 6 nodes across 3 AZs. Hash slots 0-16383. Use a cluster-aware client. Failover handled via the cluster bus.', file: 'docs/redis.md:1', tags: 'redis;cluster;ops', date: '2026-07-28', accessed: 3, links: 'redis-pool-fix', status: 'active', supersededOn: '' },
  { id: 'a3', category: 'pattern', key: 'cache-invalidation', content: 'Invalidate cache entries on write via a version key per entity. Use the Redis pub/sub channel cache_evict for multi-instance invalidation.', file: 'src/cache/invalidate.ts:1', tags: 'cache;redis;pattern', date: '2026-07-27', accessed: 2, links: 'redis-cluster', status: 'active', supersededOn: '' },
  { id: 'a4', category: 'pattern', key: 'idempotency-keys', content: 'All mutating endpoints accept an Idempotency-Key header, stored in Redis with a 24h TTL to dedupe retries. Client resends the same key.', file: 'src/api/middleware.ts:67', tags: 'api;idempotency;redis', date: '2026-07-26', accessed: 4, links: 'redis-pool-fix api-middleware', status: 'active', supersededOn: '' },
  { id: 'a5', category: 'pattern', key: 'api-rate-limiting', content: 'Rate limit: 100 req/min per API key, 20 req/min for unauthenticated. Sliding window counter in Redis. Return 429 with Retry-After.', file: 'src/middleware/rateLimit.ts:1', tags: 'api;security;redis', date: '2026-07-25', accessed: 2, links: 'redis-pool-fix api-middleware', status: 'active', supersededOn: '' },
  { id: 'a6', category: 'bug', key: 'jwt-refresh-race', content: 'Refresh tokens could be reused inside the 30s grace window, allowing replay. Fixed by tracking jti in a denylist stored in Redis with a TTL matching the grace period.', file: 'src/auth/jwt.ts:87', tags: 'auth;jwt;security;redis', date: '2026-07-24', accessed: 4, links: 'auth-middleware', status: 'active', supersededOn: '' },
  { id: 'a7', category: 'knowledge', key: 'auth-middleware', content: 'Auth middleware verifies JWTs with RS256 keys from the JWKS endpoint, cached for 1h. Strips the Authorization header after validation and forwards the caller id.', file: 'src/auth/middleware.ts:1', tags: 'auth;jwt;security', date: '2026-07-23', accessed: 6, links: 'jwt-refresh-race api-middleware', status: 'active', supersededOn: '' },
  { id: 'a8', category: 'decision', key: 'postgres-not-mysql', content: 'Chose Postgres over MySQL for native JSONB and window functions used by the analytics service. PostGIS also needed for geo queries.', file: 'docs/adr/001-db.md:1', tags: 'db;architecture;adr', date: '2026-07-22', accessed: 1, links: 'analytics-service', status: 'active', supersededOn: '' },
  { id: 'a9', category: 'knowledge', key: 'db-indexing-guide', content: 'Always add indexes for foreign keys. Composite indexes for common query patterns. Use EXPLAIN ANALYZE before adding. Document in migration comments.', file: 'docs/database.md:45', tags: 'db;performance;docs', date: '2026-07-21', accessed: 5, links: 'postgres-not-mysql', status: 'active', supersededOn: '' },
  { id: 'a10', category: 'pattern', key: 'db-connection-pool', content: 'Use pg-pool for connection management. Max 20 connections per app instance. Pool on acquire validates with SELECT 1.', file: 'src/db/pool.ts:1', tags: 'db;sql;performance', date: '2026-07-20', accessed: 3, links: 'db-indexing-guide', status: 'active', supersededOn: '' },
  { id: 'a11', category: 'knowledge', key: 'analytics-service', content: 'Analytics service aggregates event data with window functions over JSONB columns in Postgres. Materialized views refresh nightly.', file: 'src/analytics/service.ts:1', tags: 'analytics;db;architecture', date: '2026-07-19', accessed: 2, links: 'postgres-not-mysql', status: 'active', supersededOn: '' },
  { id: 'a12', category: 'knowledge', key: 'deploy-pipeline', content: 'Production deploys run via GitHub Actions on the release/* branch. Never merge to main directly; squash-merge only. Deploys require 2 approvals and passing CI.', file: 'CI', tags: 'ci;deploy;process', date: '2026-07-18', accessed: 2, links: 'ci-config', status: 'active', supersededOn: '' },
  { id: 'a13', category: 'pattern', key: 'ci-config', content: 'CI matrix runs Node 20 and 22. Cache node_modules with turbo. Gate deploys on tsc --noEmit and npm test.', file: '.github/workflows/ci.yml:1', tags: 'ci;build;process', date: '2026-07-17', accessed: 4, links: 'deploy-pipeline', status: 'active', supersededOn: '' },
  { id: 'a14', category: 'decision', key: 'monorepo-turborepo', content: 'Adopted Turborepo for task caching. CI runs turbo build --filter=web to scope changes. Cache invalidated on lockfile change.', file: 'turbo.json:1', tags: 'build;monorepo;ci', date: '2026-07-16', accessed: 3, links: 'ci-config', status: 'active', supersededOn: '' },
  { id: 'a15', category: 'decision', key: 'schema-validation-zod', content: 'Use Zod for validation across all API inputs to avoid runtime type errors. Shared schemas in src/types/schemas.ts ensure frontend and backend agree.', file: 'src/types.ts:1', tags: 'types;validation;api', date: '2026-07-15', accessed: 5, links: 'api-middleware', status: 'active', supersededOn: '' },
  { id: 'a16', category: 'decision', key: 'schema-validation-joi', content: 'Use Joi for API validation. Validator middleware applied schema.validate per route. Superseded by Zod.', file: 'src/types.ts:40', tags: 'types;validation;superseded', date: '2026-07-02', accessed: 1, links: 'superseded_by:schema-validation-zod', status: 'obsolete', supersededOn: '2026-07-15' },
  { id: 'a17', category: 'pattern', key: 'feature-flags', content: 'Gate experimental UI behind LaunchDarkly flags. Default off. Flag keys follow feature_<name>_enabled pattern.', file: 'src/features/flags.ts:8', tags: 'features;flags;ui', date: '2026-07-14', accessed: 2, links: 'admin-panel', status: 'active', supersededOn: '' },
  { id: 'a18', category: 'knowledge', key: 'admin-panel', content: 'Admin panel exposes tenant config, feature flags and rate-limit overrides. Served under /admin/* with RBAC.', file: 'src/admin/routes.ts:1', tags: 'admin;ui;ops', date: '2026-07-13', accessed: 3, links: 'feature-flags', status: 'active', supersededOn: '' },
  { id: 'a19', category: 'bug', key: 'timezone-off-by-one', content: 'Reports showed off-by-one days because timestamps were converted in local tz. Fixed by storing and querying in UTC only. Use date-fns-tz for display.', file: 'src/reports/date.ts:23', tags: 'reports;timezone;bug', date: '2026-07-12', accessed: 1, links: 'report-generator', status: 'active', supersededOn: '' },
  { id: 'a20', category: 'knowledge', key: 'report-generator', content: 'Report generator runs nightly, writes to S3, posts a Slack summary to #reports. Configured per tenant.', file: 'src/reports/generate.ts:1', tags: 'reports;analytics;ops', date: '2026-07-11', accessed: 4, links: 'analytics-service timezone-off-by-one', status: 'active', supersededOn: '' },
  { id: 'a21', category: 'pattern', key: 'graceful-shutdown', content: 'Handle SIGTERM by draining HTTP connections (30s window), closing the DB pool, flushing logs, then exiting.', file: 'src/server/shutdown.ts:1', tags: 'server;reliability;pattern', date: '2026-07-10', accessed: 3, links: 'db-connection-pool', status: 'active', supersededOn: '' },
  { id: 'a22', category: 'knowledge', key: 'env-secrets-rotation', content: 'Secrets rotated monthly via Vault. The app reads from env vars injected by the Vault agent sidecar. Never commit .env files.', file: 'docs/security/secrets.md:1', tags: 'security;vault;ops', date: '2026-07-09', accessed: 1, links: 'vault-config', status: 'active', supersededOn: '' },
  { id: 'a23', category: 'pattern', key: 'vault-config', content: 'Vault agent templates render env files at boot. Policies scoped per service. Audit log enabled on KV v2 secrets.', file: 'vault/agent.hcl:1', tags: 'security;vault;config', date: '2026-07-08', accessed: 2, links: 'env-secrets-rotation', status: 'active', supersededOn: '' },
  { id: 'a24', category: 'knowledge', key: 'monitoring-stack', content: 'Prometheus for metrics, Grafana for dashboards, PagerDuty for alerting. Key dashboards: API latency p99, error rate, Redis memory, Postgres connections.', file: 'docs/monitoring.md:1', tags: 'monitoring;ops;observability', date: '2026-07-07', accessed: 5, links: 'redis-cluster', status: 'active', supersededOn: '' },
  { id: 'a25', category: 'pattern', key: 'incident-response', content: 'Page on-call via /pd trigger, do not DM individuals. Post-incident review required within 48h. Template in docs/incident-template.md.', file: 'docs/runbook.md:34', tags: 'ops;incidents;process', date: '2026-07-06', accessed: 2, links: 'redis-pool-fix monitoring-stack', status: 'active', supersededOn: '' },
  { id: 'a26', category: 'pattern', key: 'api-error-handling', content: 'All API errors return an {error, code, message} envelope. Map exceptions in one middleware. Sentry captures with a fingerprint.', file: 'src/api/errors.ts:1', tags: 'api;errors;observability', date: '2026-07-05', accessed: 3, links: 'api-middleware monitoring-stack', status: 'active', supersededOn: '' },
  { id: 'a27', category: 'decision', key: 'no-orm', content: 'Use raw SQL via pg with hand-written queries. ORMs added too much overhead for our reporting queries. Query builder helper in src/db/helpers.ts.', file: 'src/db/queries.ts:1', tags: 'db;sql;performance', date: '2026-07-04', accessed: 4, links: 'db-connection-pool', status: 'active', supersededOn: '' },
  { id: 'a28', category: 'knowledge', key: 'onboarding-checklist', content: 'New engineers: clone the repo, run npm install, copy .env.example, run npm run dev, then run npx toon-memory init. See docs/ONBOARDING.md.', file: 'docs/ONBOARDING.md:1', tags: 'docs;onboarding;process', date: '2026-07-30', accessed: 9, links: 'deploy-pipeline', status: 'active', supersededOn: '' },
];

const entries = corpus.map((e) => ({ ...e, tags: e.tags.split(';'), links: e.links.split(/\s+/).filter(Boolean) }));

// ── gold queries: keyword-dense, relational, and mixed groups ──────────────
const queries = [
  // keyword-dense (BM25 is enough)
  { q: 'redis connection pool sizing', gold: ['redis-pool-fix', 'db-connection-pool', 'redis-cluster'] },
  { q: 'jwt refresh token replay attack', gold: ['jwt-refresh-race', 'auth-middleware'] },
  { q: 'postgres vs mysql database decision', gold: ['postgres-not-mysql', 'db-connection-pool', 'db-indexing-guide'] },
  { q: 'zod for api validation', gold: ['schema-validation-zod', 'api-middleware'] },
  // relational (relevant entries may lack the query words — reached via graph)
  { q: 'what monitors redis memory usage', gold: ['monitoring-stack', 'redis-cluster', 'incident-response'] },
  { q: 'cache invalidation across instances', gold: ['cache-invalidation', 'redis-cluster', 'redis-pool-fix'] },
  { q: 'vault secrets rotation', gold: ['env-secrets-rotation', 'vault-config'] },
  // mixed (a recent, high-access distractor shares the graph but not the topic)
  { q: 'how does the ci pipeline deploy', gold: ['deploy-pipeline', 'ci-config', 'monorepo-turborepo'] },
];

const K = 5;
const modes = [
  { name: 'linear', rrf: false },
  { name: 'rrf', rrf: true },
];

const results = {};
for (const mode of modes) {
  results[mode.name] = queries.map(({ q, gold }) => {
    const ranking = recall(entries, q, { hops: 1, limit: 6, rrf: mode.rrf });
    const goldSet = new Set(gold);
    return { q, gold, ranking, ndcg: ndcgAt(ranking, goldSet, K), mrr: mrrAt(ranking, goldSet, K) };
  });
}

// ── report ─────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padStart(n);
const fmt = (n) => n.toFixed(3);

console.log('toon-memory — RRF benchmark (rank fusion vs weighted linear)');
console.log('Corpus: 28 entries | Queries: 8 | Metric: nDCG@5 / MRR@5 (gold relevance)');
console.log('RRF: BM25×3 + centrality ranks, adaptive k=√N\n');

console.log(`${pad('query', 40)}  ${pad('linear', 18)}  ${pad('rrf', 18)}  ${pad('Δ nDCG', 10)}`);
console.log('-'.repeat(92));
for (let i = 0; i < queries.length; i++) {
  const l = results.linear[i];
  const r = results.rrf[i];
  const delta = r.ndcg - l.ndcg;
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '=';
  console.log(
    `${pad(l.q.slice(0, 38), 40)}  ${pad(`${l.ndcg.toFixed(3)} / ${l.mrr.toFixed(3)}`, 18)}  ${pad(`${r.ndcg.toFixed(3)} / ${r.mrr.toFixed(3)}`, 18)}  ${pad(`${arrow} ${delta.toFixed(3)}`, 10)}`
  );
}
console.log('-'.repeat(92));

const avg = (m) => results[m].reduce((a, x) => a + x.ndcg, 0) / queries.length;
const avgMrr = (m) => results[m].reduce((a, x) => a + x.mrr, 0) / queries.length;

console.log('');
console.log(`Average nDCG@5   linear: ${fmt(avg('linear'))}   rrf: ${fmt(avg('rrf'))}   Δ ${(avg('rrf') - avg('linear')).toFixed(3)}`);
console.log(`Average MRR@5    linear: ${fmt(avgMrr('linear'))}   rrf: ${fmt(avgMrr('rrf'))}   Δ ${(avgMrr('rrf') - avgMrr('linear')).toFixed(3)}`);
console.log(`RRF params to tune: none (adaptive k=√N)  vs  linear: W_CENT=0.4, W_IMP=0.25, SEED_BONUS=1.0`);

// demo: typed edges + supersession are honored in both modes
const joiInNormal = recall(entries, 'joi', { limit: 6 }).includes('schema-validation-joi');
const joiInAsOf = recall(entries, 'joi', { limit: 6, asOf: '2026-07-10' }).includes('schema-validation-joi');
console.log(`\nSupersession honored: joi hidden in normal recall (${!joiInNormal}), visible with as_of=2026-07-10 (${joiInAsOf})`);

console.log('\n// metrics for the docs site');
console.log(
  JSON.stringify(
    {
      benchmark: 'rrf',
      corpusEntries: entries.length,
      queries: queries.length,
      k: K,
      averageNdcg: { linear: Number(avg('linear').toFixed(4)), rrf: Number(avg('rrf').toFixed(4)) },
      averageMrr: { linear: Number(avgMrr('linear').toFixed(4)), rrf: Number(avgMrr('rrf').toFixed(4)) },
      rrfWins: results.rrf.filter((r, i) => r.ndcg > results.linear[i].ndcg).length,
      rrfLosses: results.rrf.filter((r, i) => r.ndcg < results.linear[i].ndcg).length,
      ties: results.rrf.filter((r, i) => r.ndcg === results.linear[i].ndcg).length,
      rrfAdaptiveK: 'sqrt(candidateCount)',
      rrfFusion: ['bm25', 'bm25', 'bm25', 'centrality'],
      supersededHiddenInNormalRecall: joiInNormal === false,
      supersededVisibleInAsOf: joiInAsOf === true,
    },
    null,
    2
  )
);
