# Cross-corpus retrieval benchmark reference

Validación del recall (BM25 / RRF fusion / smart pipeline) sobre 3 corpora reales de
`.toon-memory/memory/data.toon`. Snapshot: 2026-08-05. Queries gold redactadas a mano
por categoría (core-fact, temporal, knowledge-updating, multi-hop, meta-session,
distractor), reescritas al vocabulario del corpus (≈62% de los fallos iniciales eran
redacción de query, no del pipeline). Todas las gold keys validadas presentes.

## Matriz por corpus (R@5 / nDCG / MRR / answerable)

| Corpus | q | linear | rrf | smart |
|---|---|---|---|---|
| toon-memory (100 entries) | 42 | 0.643¹ / – / – / – | **0.891** / 0.825 / 0.871 / 100% | 0.867 / 0.800 / 0.833 / – |
| SGP (44 entries) | 36 | **0.796** / 0.719 / 0.739 / 89% | 0.778 / 0.618 / 0.611 / 86% | 0.758 / 0.623 / 0.629 / 85% |
| ARGOS (203 entries) | 39 | **0.697** / 0.670 / 0.809 / 95% | 0.556 / 0.579 / 0.774 / 87% | 0.574 / 0.593 / 0.782 / 89% |

¹ R@5 de un run exploratorio anterior; el baseline congelado en CI solo cubre rrf/smart.

No hay ganador universal: RRF gana en toon-memory por mucho (+0.248), pierde en SGP
(−0.018) y en ARGOS (−0.141). El default de producción actual (fusión RRF dentro de
`generateSmartRecall`) **se mantiene**; la decisión de cambiarlo queda pendiente de más
corpora.

## El commit 860a6c6 no causó la regresión

Bench del src pre-`860a6c6` (misma firma de exports, mismo harness):

| Modo | SGP pre → post | ARGOS pre → post |
|---|---|---|
| linear R@5 | 0.796 → 0.796 | 0.697 → 0.697 |
| rrf R@5 | 0.755 → **0.778** | 0.568 → 0.556 |
| rrf nDCG | 0.557 → **0.618** | 0.528 → **0.579** |
| rrf MRR | 0.542 → **0.611** | 0.663 → **0.774** |
| smart R@5 | 0.732 → **0.758** | 0.588 → 0.574 |
| smart nDCG | 0.562 → **0.623** | 0.538 → **0.593** |

La fusión RRF ya era el default de producción pre-commit (bm25×3 + centralidad global);
el commit añadió n-gram + centralidad local. El gap smart-vs-linear pre-existía
(ARGOS: 0.588 vs 0.697). El commit es net-positive en nDCG/MRR con ~0.01 de costo en
R@5 de ARGOS. Un revert no restauraría ningún comportamiento anterior mejor — la palanca
real sería cambiar el default a BM25 puro, con un costo de −0.224 en toon-memory.

## Métricas estructurales de corpus (scripts/bench-corpus-stats.mjs)

| Corpus | entries | avgTok | medTok | links | tags avg (%) | grado medio (max) |
|---|---|---|---|---|---|---|
| toon-memory | 100 | 70 | 62 | **79%** | 3.94 (98%) | 3.54 (13) |
| SGP | 44 | 89 | 85 | 48% | 3.34 (100%) | 2.41 (12) |
| ARGOS | 203 | 41 | 41 | **0%** | 4.19 (96%) | 3.28 (15) |

Observación (hipótesis de trabajo, NO concluida): la ventaja de RRF sobre linear
correlaciona de forma monótona con el % de entradas con links explícitos
(79% → +0.248; 48% → −0.018; 0% → −0.141). ARGOS mantiene grado 3.28 pero por
co-ocurrencia de tags, no por estructura explícita. Hipótesis: el señal de centralidad
ayuda cuando el grafo tiene significado semántico explícito (links/wiki refs) y es ruido
cuando las aristas solo vienen de tags compartidos.

## Insight MRR vs R@5

El commit baja levemente R@5 en ARGOS pero sube MRR +0.11 y nDCG +0.05: el primer
resultado correcto aparece antes, aunque se pierden golds en el corte 5. Si el agente
consume principalmente los primeros resultados, MRR puede correlacionar mejor con la
experiencia real que R@5. El canary de CI (bench-check.mjs) ya vigila ambas métricas.

## Reproducción

```bash
node scripts/bench-retrieval.mjs --corpus <data.toon> --queries benchmarks/gold-queries-{sgp,argos}.json --out /tmp/res.json
node scripts/bench-corpus-stats.mjs <data.toon> [data.toon ...]
npm run bench:check   # canary CI contra benchmarks/retrieval-results.json (toon-memory)
```

## Roadmap

1. ✅ Benchmark congelado como canary de CI (bench-check.mjs, tolerancia 1e-6).
2. ✅ Segundo y tercer corpus reales (SGP, ARGOS) + gold queries validadas.
3. ⏳ Holdout sintético adverso (sinónimos, typos, orden distinto) — pendiente.
4. ⏳ Más corpora (objetivo 8–10) para confirmar o refutar la hipótesis de estructura.
5. ⏳ Task Success Rate como métrica de producto — pendiente.
6. Decisión de default (linear / rrf / selector por estructura) solo con evidencia ≥ 8 corpora.
