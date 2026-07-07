# Security Model

Meta Harness is read-only first.

## Defaults

- External systems are read-only by default.
- MCP starts in `read-only` mode.
- Write tools require explicit `checkpoint-write` or `workspace-write` mode.
- Dangerous operations are not exposed by default.
- Fake adapter output is simulation evidence only.

## Operations Requiring Explicit Authorization

- package publishing
- Git ref pushes
- GitHub releases
- production writes
- outbound email
- financial transactions
- secret rotation
- database migrations
- infrastructure creation or destruction
- cloud resource mutation

## Evidence Handling

Generated artifacts must not contain secrets or full account identifiers. Proof claims must use exact statuses and evidence references.

## Remote MCP And Enterprise Controls

Remote MCP endpoints are not enabled by default. A hosted endpoint must be treated as an external system and requires a separate security review before use.

Required controls:

- authentication on every connection
- tool allowlists, with read-only tools as the starting point
- explicit approval for checkpoint-write, workspace-write, cloud mutation, or infrastructure operations
- audit logs for tool call metadata, sanitized arguments, approval decisions, actor identity, and evidence artifacts
- request and response redaction before retention
- network boundary review for public endpoints, private endpoints, and local development bindings
- separate RBAC and policy for Azure MCP Server or any other cloud-resource MCP server
- explicit mutation policy in addition to RBAC; permissions alone do not authorize an agent to mutate cloud resources

Meta Harness evidence gates do not authorize Azure resource mutation, package publishing, GitHub release creation, or repository visibility changes.

For vulnerability reporting and supported versions, see the repository [security policy](https://github.com/smgpulse007/meta-harness/blob/main/SECURITY.md).
