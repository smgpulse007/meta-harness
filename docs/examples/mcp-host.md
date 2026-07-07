# MCP Host Example

This example shows the local stdio server shape. It does not require a remote deployment.

```bash
pnpm --filter @meta-harness/cli exec mh mcp --stdio --mode read-only
```

Use host-specific MCP configuration to point at the command above. Keep the mode `read-only` unless the task explicitly needs checkpoint or workspace writes.

Do not expose package publishing, production mutation, email, financial transactions, or infrastructure operations through the Meta Harness MCP server.
