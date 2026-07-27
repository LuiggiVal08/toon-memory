/**
 * Domain-specific synonym dictionary for toon-memory.
 *
 * Maps common coding/DevOps terms to their equivalents so that queries
 * like "conexión caída" can find entries containing "timeout de red".
 * Pure static map — zero LLM, zero network, zero embeddings.
 */

export const SYNONYMS: Record<string, string[]> = {
	// Infrastructure / networking
	"conexión": ["timeout", "red", "conectar", "disconnect", "connection", "conn"],
	"conectar": ["timeout", "red", "conexión", "connect", "connection"],
	"caída": ["down", "crash", "fail", "error", "dropped", "falla"],
	"down": ["caída", "crash", "fail", "caer", "offline"],
	"crash": ["caída", "down", "fail", "error", "colapso"],
	"timeout": ["conexión", "red", "expirar", "deadline", "exceed"],
	"red": ["network", "conexión", "ip", "dns", "proxy", "gateway"],
	"network": ["red", "conexión", "ip", "dns", "proxy"],
	"server": ["servidor", "backend", "api", "host"],
	"servidor": ["server", "backend", "api", "host"],
	"client": ["cliente", "frontend", "browser", "user-agent"],
	"cliente": ["client", "frontend", "browser"],

	// Data / storage
	"cache": ["redis", "memcached", "cached", "caché"],
	"redis": ["cache", "memcached", "session", "pubsub"],
	"pool": ["pool", "connection pool", "pooling", "concurrencia"],
	"database": ["db", "postgres", "mysql", "mongo", "sql", "base de datos"],
	"db": ["database", "postgres", "mysql", "mongo", "sql"],
	"session": ["sesión", "cookie", "token", "auth"],

	// Errors / debugging
	"error": ["bug", "exception", "fail", "fallo", "error", "err"],
	"bug": ["error", "defect", "issue", "fallo", "problema"],
	"exception": ["error", "throw", "catch", "error"],
	"fail": ["error", "falla", "fallo", "crash", "fail"],
	"falla": ["error", "fail", "fallo", "bug", "crash"],
	"debug": ["debugging", "log", "trace", "diagnóstico"],
	"log": ["logging", "debug", "trace", "registro"],
	"warning": ["warn", "advertencia", "alerta"],

	// Architecture
	"auth": ["authentication", "autenticación", "login", "jwt", "token", "oauth"],
	"autenticación": ["auth", "authentication", "login", "jwt", "oauth"],
	"api": ["endpoint", "route", "rest", "graphql", "rpc"],
	"endpoint": ["api", "route", "url", "path"],
	"config": ["configuración", "settings", "env", "environment"],
	"configuración": ["config", "settings", "env", "environment"],
	"deploy": ["deployment", "despliegue", "release", "ship", "ci/cd"],
	"despliegue": ["deploy", "deployment", "release", "publish"],
	"migration": ["migración", "migrate", "upgrade", "schema change"],
	"migración": ["migration", "migrate", "upgrade"],

	// Code / patterns
	"refactor": ["refactoring", "reorganizar", "reestructurar", "clean"],
	"reestructurar": ["refactor", "refactoring", "reorganizar", "restructure"],
	"pattern": ["patrón", "pattern", "convention", "norma", "estándar"],
	"patrón": ["pattern", "convention", "norma", "estándar"],
	"decision": ["decisión", "decision", "elección", "choice", "acuerdo"],
	"decisión": ["decision", "elección", "choice", "acuerdo"],
	"knowledge": ["conocimiento", "knowledge", "info", "información"],
	"conocimiento": ["knowledge", "info", "información"],

	// Performance
	"performance": ["rendimiento", "perf", "latency", "throughput", "speed"],
	"rendimiento": ["performance", "perf", "latency", "speed"],
	"latency": ["latencia", "delay", "response time", "rt"],
	"latencia": ["latency", "delay", "response time"],
	"memory": ["memoria", "ram", "heap", "leak"],
	"memoria": ["memory", "ram", "heap", "leak"],
	"leak": ["fuga", "memory leak", "memoria"],

	// Testing
	"test": ["testing", "prueba", "tests", "spec"],
	"prueba": ["test", "testing", "spec"],
	"mock": ["mocking", "stub", "fake", "doble"],
	"coverage": ["cobertura", "coverage", "tests"],

	// Git / VCS
	"commit": ["commits", "提交", "checkpoint", "save"],
	"branch": ["rama", "branch", "feature branch", "checkout"],
	"rama": ["branch", "feature branch", "checkout"],
	"merge": ["mergear", "merge", "combine", "unir"],
	"conflict": ["conflicto", "conflict", "merge conflict", "clash"],
	"conflicto": ["conflict", "merge conflict", "clash"],
	"revert": ["rollback", "deshacer", "undo", "restore"],

	// UI / frontend
	"ui": ["interfaz", "interface", "gui", "frontend", "vista"],
	"interfaz": ["ui", "interface", "gui", "frontend"],
	"component": ["componente", "widget", "module", "pieza"],
	"componente": ["component", "widget", "module"],
	"responsive": ["responsive", "mobile", "adaptativo", "layout"],
	"layout": ["diseño", "design", "layout", "estructura"],

	// DevOps
	"docker": ["container", "contenedor", "image", "imagen"],
	"contenedor": ["docker", "container", "image"],
	"kubernetes": ["k8s", "cluster", "pods", "deployment"],
	"ci/cd": ["pipeline", "deploy", "continuous integration", "continuous deployment"],
	"monitoring": ["monitoreo", "observability", "metrics", "alerts"],
	"monitoreo": ["monitoring", "observability", "metrics"],
}

/**
 * Expand query tokens with domain synonyms.
 * Returns a deduplicated set containing the original tokens + their synonyms.
 */
export function expandSynonyms(queryTokens: string[]): string[] {
	const expanded = new Set(queryTokens)
	for (const token of queryTokens) {
		const synonyms = SYNONYMS[token]
		if (synonyms) {
			for (const s of synonyms) expanded.add(s)
		}
	}
	return [...expanded]
}
