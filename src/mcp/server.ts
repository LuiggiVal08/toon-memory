import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { InitializeRequestSchema, SUPPORTED_PROTOCOL_VERSIONS, LATEST_PROTOCOL_VERSION } from "@modelcontextprotocol/sdk/types.js"
import { registerTools } from "./tools"
import { registerResources } from "./resources"
import { pruneExpiredEntries } from "./archive"

declare const TOON_VERSION: string

const server = new McpServer(
  { name: "toon-memory", version: TOON_VERSION },
  { capabilities: { tools: { listChanged: true }, resources: { listChanged: true }, experimental: { "io.modelcontextprotocol/ui": {} } } }
)

// MCP Apps support is advertised via capabilities.experimental.
// We DO NOT set top-level extensions here — for STDIO transport that
// triggers OAuth in some hosts (e.g. Inspector v2). The experimental
// field is sufficient for MCP Apps–compatible clients.
const s = server.server as any
s.setRequestHandler(InitializeRequestSchema, async (request: any) => {
  const requestedVersion = request.params.protocolVersion
  s._clientCapabilities = request.params.capabilities
  s._clientVersion = request.params.clientInfo
  const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion) ? requestedVersion : LATEST_PROTOCOL_VERSION
  return {
    protocolVersion,
    capabilities: s.getCapabilities(),
    serverInfo: { name: "toon-memory", version: TOON_VERSION },
    ...(s._instructions && { instructions: s._instructions }),
  }
})

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
