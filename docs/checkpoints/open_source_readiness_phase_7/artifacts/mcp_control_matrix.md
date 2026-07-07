# MCP Control Matrix

Status: `static_verified`

## Current Runtime

| Control          | Current state                                                | Proof                                                                  |
| ---------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Transport        | stdio only.                                                  | `packages/cli/src/commands/mcp.ts` throws unless `--stdio` is present. |
| Default mode     | `read-only`.                                                 | CLI and server default to `read-only`.                                 |
| Mode validation  | Unknown modes rejected before startup.                       | `packages/cli/src/commands/mcp.ts`; CLI test.                          |
| Write gates      | Write tools require `checkpoint-write` or `workspace-write`. | `packages/mcp-server/src/server.ts`.                                   |
| Shell execution  | Not exposed by MCP server.                                   | Tool surface records command evidence but does not execute commands.   |
| Path containment | Workspace write helpers resolve paths inside workspace.      | `packages/core/src/filesystem/index.ts`.                               |

## Remote Readiness Gaps

| Capability             | Status         | Carry-forward requirement                                                  |
| ---------------------- | -------------- | -------------------------------------------------------------------------- |
| Streamable HTTP server | `not_verified` | Implement MCP HTTP POST/GET endpoint and protocol behavior.                |
| Remote authentication  | `not_verified` | Add Entra, managed identity, OAuth, or reviewed reverse-proxy auth.        |
| Remote authorization   | `not_verified` | Add role-to-mode mapping and per-tool allowlists.                          |
| Audit logs             | `not_verified` | Store immutable sanitized tool-call and approval records.                  |
| Remote workspace-write | `not_verified` | Add dedicated remote write-scope model before enabling.                    |
| Azure MCP integration  | `not_verified` | Keep separate server label, RBAC, allowlist, and explicit mutation policy. |

## Guidance

- Recommend local stdio `read-only` today.
- Recommend remote MCP only after auth, audit, transport, and authorization controls exist.
- Treat `dangerous-disabled` as a no-danger compatibility marker, not a remote security tier.
