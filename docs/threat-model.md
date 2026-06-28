# Threat Model

## Assets

- Source code and generated artifacts.
- Specs, proof ledgers, checkpoints, and command logs.
- Secrets, credentials, account identifiers, and production data in the workspace.

## Trust Boundaries

- Coding agents are untrusted until their outputs pass validation gates.
- MCP clients are untrusted callers unless explicitly configured by the user.
- External CLIs are not launched by default.

## Default Controls

- MCP starts read-only.
- Path traversal is rejected by resolving paths inside the workspace root.
- Dangerous operations are blocked unless explicitly allowed by side-effect policy.
- Command output is recorded, not executed, by the MCP server.
- Secret-like values are redacted in safety helpers.

## Dangerous Operations

The default policy blocks production writes, external API mutations, financial transactions, outbound email, database migrations, secret rotation, infrastructure destruction, destructive file operations, package publishing, and git push.

## Residual Risks

- Requirement extraction is shallow and requires parent review.
- Generated prompts can be copied into tools that ignore write scopes.
- File-level write-scope checks cannot prove semantic safety.
- Fake adapter evidence is only useful for tests and examples.
