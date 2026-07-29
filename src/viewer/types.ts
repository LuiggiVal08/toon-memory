export interface ViewerNode {
  id: string
  category: string
  content: string
  tags: string[]
  quality: number
  accessCount: number
  date: string
  file: string
  links: string[]
  ttl: string
  lastAccessed: string
}

export interface ViewerData {
  nodes: ViewerNode[]
  edges: { source: string; target: string }[]
  categories: Record<string, number>
  tagCounts: Record<string, number>
  totalEntries: number
}

export const COLORS: Record<string, string> = {
  decision: "#a78bfa",
  bug: "#ef4444",
  pattern: "#22c55e",
  knowledge: "#06b6d4",
  architecture: "#f59e0b",
}
