// Impact benchmark: "with toon-memory" vs "without toon-memory".
// Measures the token cost of retrieving context during a session:
//   - WITHOUT memory: the agent re-reads the relevant source files (or is
//     re-prompted) to reconstruct context — the naive, token-heavy path.
//   - WITH memory:    the agent calls memory_recall({ compact: true }) and
//     receives only the relevant, compacted entries.
//
// This is a flow simulation: the corpus of scenarios is hand-authored, so the
// absolute numbers depend on those scenarios. It is reproducible given the
// corpus (no randomness, no network). Run with: npm run bench:impact
//
// The compact rendering mirrors src/lib/graph.ts renderCompact so the "with
// memory" token count reflects what the agent actually receives.

// gpt-tokenizer is a dependency of the format benchmark; reuse it here.
import { encode as encodeTokens } from 'gpt-tokenizer';

// --- compact renderer (faithful copy of graph.ts renderCompact) ---
function buildAdjacency(entries) {
  const adj = new Map();
  const link = (a, b) => {
    if (a === b) return;
    if (!entries.some((e) => e.key === a) || !entries.some((e) => e.key === b)) return;
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a).add(b);
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(b).add(a);
  };
  for (const e of entries) {
    for (const l of e.links || []) link(e.key, l);
    const refs = e.content.match(/\[\[([\w-]+)\]\]/g) || [];
    for (const r of refs) link(e.key, r.slice(2, -2));
  }
  const out = new Map();
  for (const [k, v] of adj) out.set(k, [...v]);
  return out;
}

function renderCompact(entries, opts = {}) {
  const index = new Map();
  entries.forEach((e, i) => index.set(e.key, i + 1));
  const snippetLen = opts.snippetLen ?? 90;
  const adjacency = opts.adjacency || buildAdjacency(entries);
  const seeds = opts.seeds;
  return entries
    .map((e) => {
      const n = index.get(e.key);
      const isSeed = seeds ? seeds.has(e.key) : true;
      let body = e.content;
      if (!isSeed && e.content.length > snippetLen) body = e.content.slice(0, snippetLen).trimEnd() + '…';
      const tags = e.tags.length ? ` · tags: ${e.tags.join(';')}` : '';
      let edges = '';
      const nb = (adjacency.get(e.key) || [])
        .map((k) => index.get(k))
        .filter((x) => typeof x === 'number');
      if (nb.length) edges = ` · edges: ->${nb.join(', ->')}`;
      return `[${n}] ${e.category}/${e.key}\n  ${body}${tags}${edges}`;
    })
    .join('\n\n');
}

// --- scenario corpus (hand-authored, representative) ---
// Each scenario: what the agent would do WITHOUT memory (read full files) vs
// the memory entries it would recall WITH memory.
const scenarios = [
  {
    name: 'redis connection pool tuning',
    query: 'redis connection pool',
    files: [
      {
        name: 'src/cache/redis.ts',
        content:
          'import { createClient } from "redis";\n\n' +
          '// Pool of reusable connections. Created lazily on first use.\n' +
          'const pool: RedisClientType[] = [];\n' +
          'const MAX = 20;\n\n' +
          'export function getConn() {\n' +
          '  if (pool.length < MAX) pool.push(createClient({ url: process.env.REDIS_URL }));\n' +
          '  return pool[pool.length - 1];\n' +
          '}\n\n' +
          '// After the Black Friday incident we capped MAX at 20 to avoid\n' +
          '// exhausting the server. Monitor via `redis-cli info clients`.\n' +
          'export async function closeAll() { await Promise.all(pool.map((c) => c.quit())); pool.length = 0; }\n',
      },
      {
        name: 'src/config/cache.ts',
        content:
          'export const cacheConfig = {\n  backend: "redis",\n  ttlSeconds: 300,\n  keyPrefix: "app:",\n  maxConnections: 20,\n};\n',
      },
      {
        name: 'docs/runbook.md',
        content:
          '# Cache runbook\nIf you see CONNECTION storm in metrics, check `redis-cli info clients`.\nThe pool is capped at max_connections=20 (see src/cache/redis.ts).\nDo not raise it without reviewing the Black Friday postmortem.\n',
      },
    ],
    memory: [
      {
        category: 'bug',
        key: 'redis-pool-fix',
        content: 'Added max_connections=20 to the Redis pool after the connection storm during Black Friday. Monitor via redis-cli info clients.',
        tags: ['redis', 'cache'],
        links: ['redis-config'],
      },
      {
        category: 'pattern',
        key: 'redis-config',
        content: 'Cache uses Redis with keyPrefix app: and ttl 300s. Pool capped at 20 connections.',
        tags: ['redis', 'config'],
        links: [],
      },
    ],
  },
  {
    name: 'auth: JWT refresh race',
    query: 'jwt refresh token replay',
    files: [
      {
        name: 'src/auth/jwt.ts',
        content:
          'import jwt from "jsonwebtoken";\n\n' +
          '// Refresh tokens issued with a 30s grace window. We originally allowed\n' +
          '// reuse of a refresh token within that window, which enabled replay.\n' +
          '// Fixed by tracking the jti in a denylist set so each jti is used once.\n' +
          'const denylist = new Set<string>();\n\n' +
          'export function rotate(refresh: string) {\n' +
          '  const { jti } = jwt.verify(refresh, KEY) as { jti: string };\n' +
          '  if (denylist.has(jti)) throw new Error("replay detected");\n' +
          '  denylist.add(jti);\n' +
          '  return issueNewPair(jti);\n' +
          '}\n',
      },
      {
        name: 'src/auth/session.ts',
        content:
          'export const SESSION_GRACE_MS = 30_000;\n// See jwt.ts rotate() for the replay fix.\n',
      },
    ],
    memory: [
      {
        category: 'bug',
        key: 'jwt-refresh-race',
        content: 'Refresh tokens could be reused within the 30s grace window, allowing replay. Fixed by tracking jti in a denylist set.',
        tags: ['auth', 'jwt'],
        links: [],
      },
    ],
  },
  {
    name: 'deploy pipeline',
    query: 'how do we deploy to production',
    files: [
      {
        name: '.github/workflows/release.yml',
        content:
          'name: release\non:\n  push:\n    branches: [release/*]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm run build\n      - run: ./scripts/deploy.sh\n',
      },
      {
        name: 'scripts/deploy.sh',
        content:
          '#!/usr/bin/env bash\nset -euo pipefail\n# Deploys the current build. Never merge directly to main; squash-merge only.\n# Triggered by the release/* branch CI.\necho "deploying..."\n',
      },
      {
        name: 'docs/CONTRIBUTING.md',
        content: '## Releasing\nProduction deploys run via GitHub Actions on the release/* branch. Never merge directly to main; squash-merge only.\n',
      },
    ],
    memory: [
      {
        category: 'knowledge',
        key: 'deploy-pipeline',
        content: 'Production deploys run via GitHub Actions on the release/* branch. Never merge directly to main; squash-merge only.',
        tags: ['ci', 'deploy'],
        links: [],
      },
    ],
  },
];

// --- measurement ---
const rows = [];
let totalWithout = 0;
let totalWith = 0;

for (const s of scenarios) {
  const withoutText = s.files.map((f) => `// ${f.name}\n${f.content}`).join('\n\n');
  const without = encodeTokens(withoutText).length;

  const adjacency = buildAdjacency(s.memory);
  const qTokens = s.query.toLowerCase().split(/\s+/).filter(Boolean);
  const seeds = new Set(
    s.memory
      .filter((e) => qTokens.some((t) => `${e.key} ${e.content}`.toLowerCase().includes(t)))
      .map((e) => e.key)
  );
  if (seeds.size === 0) s.memory.forEach((e) => seeds.add(e.key));
  const withText = renderCompact(s.memory, { adjacency, seeds, snippetLen: 90 });
  const withMem = encodeTokens(withText).length;

  totalWithout += without;
  totalWith += withMem;
  rows.push({ name: s.name, without, withMem, saved: without - withMem });
}

const reduction = ((1 - totalWith / totalWithout) * 100).toFixed(1);

console.log('toon-memory — with vs without memory (context retrieval cost)');
console.log('Tokenizer: gpt-tokenizer (cl100k_base)\n');
console.log('┌─────────────────────────────────────┬──────────┬──────────┬──────────┐');
console.log('│ Scenario                             │ Without  │ With     │ Saved     │');
console.log('├─────────────────────────────────────┼──────────┼──────────┼──────────┤');
for (const r of rows) {
  const name = r.name.length > 36 ? r.name.slice(0, 35) + '…' : r.name.padEnd(36);
  console.log(
    `│ ${name} │ ${String(r.without).padStart(8)} │ ${String(r.withMem).padStart(8)} │ ${String(r.saved).padStart(8)} │`
  );
}
console.log('├─────────────────────────────────────┼──────────┼──────────┼──────────┤');
console.log(
  `│ ${'TOTAL'.padEnd(36)} │ ${String(totalWithout).padStart(8)} │ ${String(totalWith).padStart(8)} │ ${String(totalWithout - totalWith).padStart(8)} │`
);
console.log('└─────────────────────────────────────┴──────────┴──────────┴──────────┘');
console.log(`\nTokens to retrieve context: WITH memory uses ${reduction}% fewer than WITHOUT.`);

console.log('\n// metrics for the docs site');
console.log(
  JSON.stringify(
    {
      scenarios: rows.length,
      withoutTokens: totalWithout,
      withTokens: totalWith,
      savedTokens: totalWithout - totalWith,
      reductionPct: Number(reduction),
    },
    null,
    2
  )
);
