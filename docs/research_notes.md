# Research Notes

## MCP SDK

The implementation uses the official TypeScript MCP SDK package `@modelcontextprotocol/sdk`.

Sources checked:

- Official docs: https://modelcontextprotocol.io/docs/develop/build-server
- Installed package metadata: `@modelcontextprotocol/sdk@1.29.0`
- Installed declarations: `dist/esm/server/mcp.d.ts` exposes `McpServer`, `registerTool`, `registerResource`, and `registerPrompt`; `dist/esm/server/stdio.d.ts` exposes `StdioServerTransport`.

Decision: use the high-level `McpServer` API with stdio transport only by default. Network transports are intentionally not exposed in this first pass.
