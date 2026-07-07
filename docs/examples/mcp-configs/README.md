# MCP Config Samples

These samples show local stdio Meta Harness MCP configuration for common hosts.

They are compatibility examples, not proof of native dispatch. The command starts Meta Harness in its default `read-only` mode:

```bash
node packages/cli/dist/index.js mcp --stdio
```

Use host-specific approval and allowlist controls before enabling write-capable MCP modes. Do not add secrets to these files. Remote MCP deployments require an auth and audit design review before use.

For remote enterprise design guidance, see `docs/examples/enterprise-remote-mcp.md`.

## Samples

- `codex-config.toml`: Codex CLI config snippet.
- `claude.mcp.json`: Claude Code / Claude-style local MCP JSON.
- `cursor.mcp.json`: Cursor `mcp.json` snippet.
- `gemini.settings.json`: Gemini CLI `settings.json` snippet.
- `copilot-repository-mcp.json`: GitHub repository MCP JSON with read-only tool allowlist.
- `windsurf-mcp_config.json`: Windsurf / Cascade MCP JSON.
- `continue-mcpServers.yaml`: Continue standalone MCP server block.
- `opencode.json`: OpenCode config with instruction globs, permissions, and local MCP.
- `roo-mcp.json`: Roo Code project MCP JSON.
