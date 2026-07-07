# Phase 6 Local Command Evidence

## Codex

- WindowsApps `codex.exe` was detected by command lookup, but `codex --version` and `codex exec --help` failed with Windows `Access is denied`.
- `npm view @openai/codex version` returned `0.142.5`.
- `npx --yes @openai/codex@0.142.5 exec --help` exited 0 and exposed `exec` flags including `--json`, `--output-schema`, `--output-last-message`, and `--sandbox`.
- The read-only npm Codex CLI smoke exited 0 using `exec --ephemeral --sandbox read-only --json --output-schema <schema> --output-last-message <path> <prompt>`.
- The Codex smoke final output was `{"packet_status":"ok","summary":"codex exec smoke"}`.
- The Codex smoke JSONL included `item.completed` agent message data and `turn.completed` usage metadata with input/output token fields.

Proof status: `command_verified` for npm CLI schema-output smoke; `not_verified` for the WindowsApps binary.

## Claude Code

- `claude` was not found on PATH.
- `npm view @anthropic-ai/claude-code version dist.tarball` exited 0 and reported version `2.1.202`.
- `npx --yes @anthropic-ai/claude-code --help` exited 0 and showed `--bare`, `-p`, `--output-format json`, `stream-json`, `--json-schema`, permission mode, tool allowlist, and MCP flags.
- `npx --yes @anthropic-ai/claude-code --version` exited 0 and reported `2.1.202 (Claude Code)`.
- `ANTHROPIC_API_KEY` was checked by variable name only and was absent; no secret values were printed.
- Auth-backed structured-output packet handoff was not run.

Proof status: `command_verified` for npx help/version command surface; `not_verified` for local auth-backed native packet handoff.

## Safety

- No package was published.
- No GitHub release was created.
- No Git ref was pushed by this draft checkpoint step.
- No cloud or Azure resource was created or mutated.
- No secret value was printed.
