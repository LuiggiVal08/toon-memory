import { McpServer } from "@modelcontextprotocol/server"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"
import { registerTools } from "./tools"
import { registerResources } from "./resources"
import { pruneExpiredEntries } from "./archive"

declare const TOON_VERSION: string

const server = new McpServer(
  { name: "toon-memory", version: TOON_VERSION },
  { capabilities: { tools: { listChanged: true }, resources: { listChanged: true } } }
)

registerResources(server)
registerTools(server)

// Startup TTL prune: drop entries whose TTL has elapsed. Best-effort — never
// block server startup on a prune failure.
try {
  pruneExpiredEntries()
} catch {
  // ignore — pruning is non-critical for serving requests
}

const transport = new StdioServerTransport()
await server.connect(transport)
