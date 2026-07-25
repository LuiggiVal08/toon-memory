import { randomBytes } from "crypto"

/**
 * Generate a random 8-character hex ID for memory entries.
 */
export function generateId(): string {
  return randomBytes(4).toString("hex")
}

/**
 * Parse a TTL value into an absolute date string (YYYY-MM-DD).
 * Supports: exact dates (2026-07-17), relative days (7d, 30d).
 * Returns empty string if no TTL.
 */
export function parseTTL(ttl: string): string {
  if (!ttl || !ttl.trim()) return ""
  const trimmed = ttl.trim()
  const dayMatch = trimmed.match(/^(\d+)d$/)
  if (dayMatch) {
    const days = parseInt(dayMatch[1])
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().split("T")[0]
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  return ""
}

/**
 * Check if a TTL value has expired (date is in the past).
 */
export function isExpired(ttl: string): boolean {
  if (!ttl) return false
  const ttlDate = parseTTL(ttl) || ttl
  const today = new Date().toISOString().split("T")[0]
  return ttlDate <= today
}

/** Built-in vocabulary for automatic tag inference */
export const TAG_VOCABULARY: Record<string, string[]> = {
  "redis": ["redis", "cache", "caching", "memcached"],
  "auth": ["auth", "authentication", "authorization", "login", "token", "jwt", "session", "oauth"],
  "api": ["api", "endpoint", "rest", "graphql", "route", "router", "controller"],
  "db": ["database", "db", "sql", "postgres", "mysql", "mongo", "query", "migration", "schema"],
  "security": ["security", "encrypt", "decrypt", "vulnerability", "xss", "csrf", "cors", "sanitiz"],
  "test": ["test", "testing", "vitest", "jest", "spec", "mock", "assert", "coverage"],
  "deploy": ["deploy", "docker", "ci/cd", "github actions", "pipeline", "kubernetes", "k8s"],
  "config": ["config", "configuration", "settings", "env", "environment", "dotenv"],
  "performance": ["performance", "optimize", "benchmark", "latency", "throughput", "cache"],
  "refactor": ["refactor", "cleanup", "restructure", "reorganize", "rework"],
  "error": ["error", "exception", "throw", "catch", "handling", "retry", "fallback"],
  "logging": ["log", "logging", "logger", "debug", "trace", "monitor", "observability"],
  "types": ["typescript", "types", "type", "interface", "generic", "enum", "zod", "schema"],
  "async": ["async", "await", "promise", "concurrent", "parallel", "worker", "queue"],
  "state": ["state", "store", "redux", "context", "reducer", "action", "observable"],
  "ui": ["ui", "component", "render", "dom", "css", "style", "layout", "responsive"],
  "storage": ["storage", "file", "filesystem", "s3", "blob", "upload", "download"],
  "email": ["email", "mail", "smtp", "sendgrid", "newsletter", "notification"],
  "payment": ["payment", "stripe", "billing", "invoice", "checkout", "subscription"],
  "webhook": ["webhook", "callback", "event", "listener", "hook"],
}

/**
 * Infer tags from content and key by matching against vocabulary.
 * The built-in vocabulary is always used; a project-specific `vocab`
 * (discovered from dependencies at `init`) is matched on top of it.
 * Returns semicolon-separated tags.
 */
export function inferTags(content: string, key: string, vocab?: Record<string, string[]>): string {
  const text = `${key} ${content}`.toLowerCase()
  const matched: string[] = []
  for (const [tag, keywords] of Object.entries(TAG_VOCABULARY)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(tag)
    }
  }
  if (vocab) {
    for (const [tag, keywords] of Object.entries(vocab)) {
      if (keywords.some((kw) => text.includes(kw))) {
        matched.push(tag)
      }
    }
  }
  return matched.join(";")
}

/**
 * Parse a relative date string into an absolute YYYY-MM-DD date.
 * Supports: "24h", "7d", "30d", or an exact date "2026-07-10".
 */
export function parseRelativeDate(since: string): string {
  const trimmed = since.trim()
  const hourMatch = trimmed.match(/^(\d+)h$/)
  if (hourMatch) {
    const d = new Date()
    d.setHours(d.getHours() - parseInt(hourMatch[1]))
    return d.toISOString().split("T")[0]
  }
  const dayMatch = trimmed.match(/^(\d+)d$/)
  if (dayMatch) {
    const d = new Date()
    d.setDate(d.getDate() - parseInt(dayMatch[1]))
    return d.toISOString().split("T")[0]
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const today = new Date().toISOString().split("T")[0]
  return today
}

export const normalize = (s: string) => s.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()
