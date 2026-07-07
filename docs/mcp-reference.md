# MCP Reference

Meta Harness includes a read-only-first MCP server for host tools that support the Model Context Protocol.

Start it over stdio:

```bash
node packages/cli/dist/index.js mcp --stdio
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

## Sample Configs

Docs-only sample configs live in `docs/examples/mcp-configs/`.

| Host                          | Sample                                                  |
| ----------------------------- | ------------------------------------------------------- |
| Codex                         | `docs/examples/mcp-configs/codex-config.toml`           |
| Claude Code                   | `docs/examples/mcp-configs/claude.mcp.json`             |
| Cursor                        | `docs/examples/mcp-configs/cursor.mcp.json`             |
| Gemini CLI                    | `docs/examples/mcp-configs/gemini.settings.json`        |
| GitHub Copilot repository MCP | `docs/examples/mcp-configs/copilot-repository-mcp.json` |
| Windsurf / Cascade            | `docs/examples/mcp-configs/windsurf-mcp_config.json`    |
| Continue                      | `docs/examples/mcp-configs/continue-mcpServers.yaml`    |
| OpenCode                      | `docs/examples/mcp-configs/opencode.json`               |
| Roo Code                      | `docs/examples/mcp-configs/roo-mcp.json`                |

For hosts that can use tools autonomously, prefer a read-only tool allowlist. The Copilot, Gemini, and Roo samples intentionally expose read-oriented tools such as `get_current_phase`, `get_ready_slices`, `get_validation_plan`, `get_checkpoint`, and `get_next_action`; they do not enable checkpoint-write or workspace-write modes.
