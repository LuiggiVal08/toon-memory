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
  decision: "oklch(55% 0.25 280)",
  bug: "oklch(65% 0.24 25)",
  pattern: "oklch(78% 0.2 155)",
  knowledge: "oklch(65% 0.25 310)",
  architecture: "oklch(85% 0.18 85)",
}
