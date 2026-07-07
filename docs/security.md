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

For vulnerability reporting and supported versions, see the repository [security policy](https://github.com/smgpulse007/meta-harness/blob/main/SECURITY.md).
