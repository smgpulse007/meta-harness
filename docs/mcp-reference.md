# MCP Reference

Meta Harness includes a read-only-first MCP server for host tools that support the Model Context Protocol.

Start it over stdio:

```bash
pnpm --filter @meta-harness/cli exec mh mcp --stdio
```

## Modes

| Mode                 | Behavior                                                          |
| -------------------- | ----------------------------------------------------------------- |
| `read-only`          | Default. Exposes status, resources, prompts, and safe read tools. |
| `checkpoint-write`   | Allows checkpoint-oriented writes when explicitly configured.     |
| `workspace-write`    | Allows workspace writes when explicitly configured.               |
| `dangerous-disabled` | Keeps dangerous operations unavailable.                           |

The server does not expose arbitrary shell execution by default.

## Tool Surface

The MCP server is intended to expose stable harness state:

- phase and slice status
- requirements and proof ledgers
- checkpoint data
- templates and prompts
- continuation resources

Write-capable tools must preserve path containment, safe IDs, and explicit mode checks.

## Host Guidance

Use local stdio MCP for workstation development. Use remote Streamable HTTP only after an explicit auth, audit, and deployment design review.

Keep the first 512 characters of MCP server instructions self-contained for hosts that truncate or summarize server instructions.
