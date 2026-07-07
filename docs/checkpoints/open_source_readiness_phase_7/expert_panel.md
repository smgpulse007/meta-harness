# Phase 7 Expert Panel

## Enterprise Architecture

Recommendation: keep Meta Harness MCP, Azure Foundry Agent Service, Azure MCP Server, model provider configuration, and hosting substrate as separate components.

Disposition: accepted. The Azure guide now carries explicit integration boundaries.

## Remote MCP Security

Recommendation: do not recommend remote Streamable HTTP until authentication, Origin validation, per-tool allowlists, approval policy, audit logs, retention, redaction, and network controls exist.

Disposition: accepted. Remote MCP remains a future target and `not_verified` runtime claim.

## Azure Operations

Recommendation: do not treat RBAC alone as an agent mutation gate and do not invoke Azure MCP Server automatically from Meta Harness.

Disposition: accepted. Azure MCP Server is documented as a separate optional server with separate RBAC, tool allowlists, and approvals.

## CLI Hardening

Recommendation: reject unknown MCP modes before server startup.

Disposition: accepted. `mh mcp --mode` now validates mode names and has a focused CLI test.
