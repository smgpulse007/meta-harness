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

The CLI validates mode names before startup. For enterprise remote designs, treat `workspace-write` as not ready until a dedicated remote authorization and scope model exists. `dangerous-disabled` is a compatibility/no-danger marker, not a substitute for authentication, authorization, or audit logging.

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

## Remote Transport Readiness

The current Meta Harness CLI only starts MCP over stdio:

```bash
node packages/cli/dist/index.js mcp --stdio --mode read-only
```

Remote Streamable HTTP is a future target, not a current runtime. Before adding or recommending a remote endpoint, the implementation must include:

- HTTP POST/GET MCP endpoint behavior compatible with the current MCP transport specification
- authentication for every connection
- Origin validation for browser-reachable HTTP endpoints
- local development binding to `127.0.0.1` rather than public interfaces
- audit logs for tool calls and approval decisions
- read-only default mode with explicit policy gates for `checkpoint-write` and `workspace-write`
- tool allowlists for autonomous hosts
- redaction and retention rules for request/response evidence

For Azure and enterprise designs, see [Azure And Enterprise MCP](./azure-enterprise.md).

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
