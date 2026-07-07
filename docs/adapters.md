# Adapter Guide

Meta Harness does not treat agent support as a single boolean. Support is tracked by integration surface: instruction files, skills, MCP, prompt-file fallback, native dispatch, review behavior, hooks, context controls, and safety controls.

## Stable Surfaces

| Adapter      | Current Stable Use                                                      |
| ------------ | ----------------------------------------------------------------------- |
| `filesystem` | Writes bounded prompt and packet files for any agent or human workflow. |
| `fake`       | Produces deterministic simulation packets for tests and examples.       |

The filesystem adapter is the reliable universal fallback. Fake adapter output is not production implementation evidence.

## Conservative Host Adapters

Codex, Claude Code, Cursor, Gemini CLI, GitHub Copilot, Windsurf/Cascade, Aider, OpenCode, and Roo Code support is currently conservative. Meta Harness may detect local CLIs, emit instruction files, document MCP configuration, or generate prompt files, but native process dispatch remains disabled unless local command evidence proves the behavior.

## Experimental Native Dispatch

Phase 6 introduces separate experimental adapter IDs for native launch experiments:

- `codex-experimental`
- `claude-code-experimental`

The stable `codex` and `claude-code` adapters still use prompt-file fallback and keep `supportsCliDispatch: false`. Experimental native launch is disabled unless both the CLI flag and environment gate are present:

```bash
META_HARNESS_EXPERIMENTAL_NATIVE_DISPATCH=1 \
node packages/cli/dist/index.js dispatch --phase phase_001 --agent codex-experimental --experimental-native
```

The experimental adapters write raw native stdout/stderr under checkpoint artifacts and validate final output against the Meta Harness slice packet schema before writing a packet. This proves dispatch/parsing only; it does not prove that the worker's validation commands passed unless those commands are present in the returned packet and reviewed.

Current Phase 6 evidence:

- `codex exec --help` and a read-only npm Codex CLI schema-output smoke ran locally.
- Local `codex.exe` from WindowsApps was present but failed with `Access is denied`.
- `npx --yes @anthropic-ai/claude-code --help` and `--version` confirmed the Claude Code CLI surface and structured-output flags, but `claude` was not present on PATH and no Anthropic API key was configured, so Claude native packet handoff remains locally unverified.

## Instruction Emitters

Generate instruction files with:

```bash
node packages/cli/dist/index.js emit-instructions --target all
```

Current emitted surfaces include:

- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`
- `.cursor/rules/meta-harness.mdc`
- `.windsurf/rules/meta-harness.md`
- `.github/copilot-instructions.md`
- `.github/instructions/meta-harness.instructions.md`
- `.continue/rules/meta-harness.md`
- `.opencode/instructions/meta-harness.md`
- `opencode.json`
- `.roo/rules/meta-harness.md`
- `.roo/mcp.json`

Host-specific skill placements include:

- `.agents/skills/meta-harness/SKILL.md`
- `.claude/skills/meta-harness/SKILL.md`

MCP sample configs are stored under `docs/examples/mcp-configs/`.

See [Agent Support Matrix](./agent-support-matrix.md) for current proof status and gaps.
