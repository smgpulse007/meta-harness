# Azure And Enterprise MCP

Meta Harness can be used locally today. Enterprise and Azure-hosted workflows must keep the same evidence and safety model: read-only by default, explicit write modes, and auditable transitions.

Phase 7 is a design-readiness pass. It does not provision Azure resources, expose a production remote MCP endpoint, enable Azure MCP Server tools, or mutate cloud state.

## Status

| Capability                                   | Current status                      | Proof posture                                                       |
| -------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| Local Meta Harness MCP over stdio            | Implemented.                        | `command_verified` through CI and MCP tests.                        |
| Remote Meta Harness MCP over Streamable HTTP | Design target only.                 | `not_verified`; no remote transport is implemented.                 |
| Azure Foundry Agent Service as a client      | Supported as architecture guidance. | `static_verified` from Microsoft docs; not locally provisioned.     |
| Azure MCP Server for Azure resources         | Separate optional server.           | `static_verified` from Microsoft docs; not invoked by Meta Harness. |
| Azure resource deployment                    | Documentation sketch only.          | `not_verified`; no resources were created.                          |

## Integration Boundaries

| Component                                    | Role                                                                              | Boundary                                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Meta Harness MCP                             | Exposes harness state, prompts, resources, and gated checkpoint/workspace writes. | Owns evidence protocol only; it should not operate Azure resources directly.                       |
| Remote MCP gateway                           | Future Streamable HTTP front door for Meta Harness MCP.                           | Must add authentication, request audit, Origin validation, and mode policy before use.             |
| Azure Foundry Agent Service                  | Potential remote MCP client for Azure-hosted agents.                              | Consumes remote MCP endpoints; it is not the Meta Harness runtime.                                 |
| Azure MCP Server                             | Separate MCP server for Azure resource operations.                                | May list or mutate Azure resources according to RBAC; not automatically chained from Meta Harness. |
| Azure OpenAI or model provider configuration | Model/runtime selection for agents.                                               | Separate from Meta Harness proof, checkpoint, and adapter logic.                                   |
| Azure Container Apps or Functions            | Possible hosting substrate for a remote MCP endpoint.                             | Deployment sketch only until explicitly authorized and reviewed.                                   |

## Local First

Use stdio MCP locally while designing and testing:

```bash
node packages/cli/dist/index.js mcp --stdio --mode read-only
```

The current CLI intentionally supports only `--stdio` by default. Remote HTTP is not available until a future implementation adds a Streamable HTTP transport and the security controls below.

## Remote MCP Target

Remote MCP should use the MCP 2025-06-18 Streamable HTTP transport only after design review. The remote endpoint must support HTTP POST/GET semantics, authenticate every connection, validate the `Origin` header, and avoid binding local development servers to public interfaces.

Required controls before a hosted endpoint is recommended:

- authentication through Microsoft Entra, managed identity, OAuth identity passthrough, or a reviewed key-based project connection
- authorization through explicit tool allowlists and a server mode pinned to `read-only` by default
- MCP approval policy that requires review for any checkpoint or workspace write request
- remote role-to-mode mapping that rejects unknown modes before server startup
- request audit logs for tool name, server label, sanitized arguments, actor/identity, approval decision, response status, and evidence artifact path
- request and response retention policy with secret redaction and bounded excerpts
- network boundary review for public versus private endpoints
- explicit mutation gates for any mode other than `read-only`

No Azure resources should be created or mutated by default.

## Foundry Agent Service Guidance

Microsoft Foundry Agent Service connects agents to remote MCP server endpoints. It supports public and private endpoints, project connections for authentication, `allowed_tools`, and approval flows for MCP calls.

For Meta Harness:

- use a remote Meta Harness endpoint only after the remote transport and audit controls are implemented
- start with read-only tools such as `get_current_phase`, `get_ready_slices`, `get_validation_plan`, `get_checkpoint`, and `get_next_action`
- configure approval as `always` for any tool that can write checkpoint or workspace state
- store shared credentials in Foundry project connections rather than in repository files
- prefer Microsoft Entra authentication where the remote server supports it
- use OAuth identity passthrough only when per-user authorization must be preserved
- log approval decisions and tool-call arguments after secret redaction
- treat RBAC as an authorization boundary, not as a substitute for Meta Harness evidence gates or mutation policy

## Azure MCP Server Boundary

Azure MCP Server is useful when an agent needs to inspect or operate Azure resources. It is not part of Meta Harness and should not be treated as a hidden implementation backend.

If an enterprise workflow connects both Meta Harness MCP and Azure MCP Server:

- keep them as separate MCP servers with separate labels and tool allowlists
- grant Azure MCP Server only the RBAC permissions needed for the task
- do not treat RBAC alone as proof that a tool is read-only or safe to invoke
- keep Azure mutation tools disabled unless a phase policy explicitly authorizes them
- record Azure MCP outputs as external evidence artifacts, not as automatic proof
- never allow a Meta Harness checkpoint transition to imply Azure deployment success without command or runtime evidence

## Deployment Sketch

The docs-only deployment target is:

1. Run Meta Harness MCP locally over stdio for development.
2. Add a future Streamable HTTP gateway around the MCP server.
3. Deploy the gateway to Azure Container Apps or a comparable host only after security review.
4. For private Foundry access, use internal-only ingress on a dedicated MCP subnet.
5. Configure Foundry Agent Service with a project connection, `allowed_tools`, and approval policy.
6. Validate with read-only tool calls before enabling any checkpoint-write mode.

For a future custom Meta Harness MCP gateway, prefer a standalone Container Apps hosting model. Do not use Container Apps dynamic sessions as the default Meta Harness path because that platform-managed MCP surface exposes shell and Python execution tools with a different risk profile.

See [Enterprise Remote MCP Sketch](./examples/enterprise-remote-mcp.md) for a fuller design checklist.

## Enterprise Controls

- Keep remote mode read-only unless a written policy authorizes writes.
- Treat remote `workspace-write` as not ready until a dedicated remote scope and authorization model exists.
- Disable cloud mutation tools unless explicitly needed.
- Separate Meta Harness evidence retention from third-party MCP server logs.
- Treat identity, RBAC, tenant boundaries, and data retention as deployment-specific review items.
- Keep raw logs out of prompts; pass artifact paths, hashes, short excerpts, and proof statuses.
- Do not publish packages, create releases, push deployment refs, rotate secrets, or mutate Azure resources from Meta Harness docs examples.

## Source Baseline

This guidance is based on these primary sources refreshed for Phase 7 on 2026-07-07:

- [Microsoft Foundry MCP tool endpoints](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol)
- [Microsoft Foundry MCP authentication](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/mcp-authentication)
- [Azure MCP Server overview](https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/overview)
- [Azure Container Apps MCP hosting](https://learn.microsoft.com/en-us/azure/container-apps/mcp-overview)
- [Microsoft Foundry tool catalog](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-catalog)
- [MCP 2025-06-18 transports](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)
