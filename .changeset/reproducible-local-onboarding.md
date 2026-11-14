---
"@meta-harness/cli": minor
"@meta-harness/core": minor
"@meta-harness/mcp-server": patch
"@meta-harness/adapters": patch
---

Remove the no-op initialization profile option and reject it before writing workspace state. Document separate target workspaces and add a disposable real CLI walkthrough. Update production dependencies, migrate validation to Zod 4, and ensure every advertised MCP prompt template can be rendered. The default read-only policy is preserved.

Consumers of the core package's exported Zod schemas must use Zod 4 types. This is recorded as a pre-1.0 minor change rather than a compatible patch.

Bound and redact MCP command evidence, including packet excerpts; redact the CLI's recorded command string. Treat malformed or unreadable optional state as an error and validate harness state before reporting its phase.
