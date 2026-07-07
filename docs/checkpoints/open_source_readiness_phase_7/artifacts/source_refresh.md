# Phase 7 Source Refresh

Status: `static_verified`

Date: 2026-07-07

## Primary Sources

| Source                               | Evidence used                                                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Microsoft Foundry MCP endpoints      | Foundry agents connect to remote MCP server endpoints; support project connections, approvals, allowed tools, public/private endpoints, and audit guidance.                     |
| Microsoft Foundry MCP authentication | Auth options include key-based credentials, Microsoft Entra agent identity, project managed identity, OAuth identity passthrough, and unauthenticated access for limited cases. |
| Azure MCP Server overview            | Azure MCP Server is a separate MCP server for Azure resources, uses Entra ID/Azure Identity, and is compatible with MCP clients.                                                |
| Microsoft Foundry tool catalog       | Foundry custom tools include MCP endpoints and toolboxes that can expose MCP-compatible endpoints.                                                                              |
| Azure Container Apps MCP hosting     | Standalone Container Apps can host custom Streamable HTTP MCP servers; dynamic sessions expose shell/Python tools and are not the default Meta Harness path.                    |
| MCP 2025-06-18 transports            | MCP defines stdio and Streamable HTTP; Streamable HTTP requires POST/GET endpoint behavior plus Origin validation and authentication guidance.                                  |

## Proof Boundaries

- `static_verified`: source-backed architecture and control guidance.
- `command_verified`: local CLI test/typecheck/docs build evidence.
- `not_verified`: remote Meta Harness MCP over Streamable HTTP, Foundry runtime connection, Azure deployment, Azure MCP Server invocation, and cloud resource mutation.

## Source URLs

- https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol
- https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/mcp-authentication
- https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/overview
- https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-catalog
- https://learn.microsoft.com/en-us/azure/container-apps/mcp-overview
- https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
