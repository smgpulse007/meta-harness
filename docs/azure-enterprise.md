# Azure And Enterprise MCP

Meta Harness can be used locally today. Enterprise and Azure-hosted workflows should keep the same evidence and safety model: read-only by default, explicit write modes, and auditable transitions.

## Integration Boundaries

| Component                    | Role                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| Meta Harness MCP             | Exposes harness state, prompts, resources, and gated checkpoint/workspace writes.             |
| Azure Foundry Agent Service  | Potential remote MCP client for Azure-hosted agents.                                          |
| Azure MCP Server             | Separate MCP server for Azure resource operations; not automatically invoked by Meta Harness. |
| Model provider configuration | Separate from Meta Harness proof, checkpoint, and adapter logic.                              |

## Local First

Use stdio MCP locally while designing and testing:

```bash
node packages/cli/dist/index.js mcp --stdio --mode read-only
```

## Remote MCP Target

Remote MCP should use Streamable HTTP only after design review for:

- authentication
- authorization and tool allowlists
- audit logging
- request and response retention
- secret redaction
- network boundaries
- explicit mutation gates

No Azure resources should be created or mutated by default.

## Enterprise Controls

- Keep remote mode read-only unless a policy authorizes writes.
- Disable cloud mutation tools unless explicitly needed.
- Separate Meta Harness evidence retention from third-party MCP server logs.
- Treat identity, RBAC, and data retention as deployment-specific review items.
