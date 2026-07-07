# Adapter Guide

Meta Harness does not treat agent support as a single boolean. Support is tracked by integration surface: instruction files, skills, MCP, prompt-file fallback, native dispatch, review behavior, hooks, context controls, and safety controls.

## Stable Surfaces

| Adapter      | Current Stable Use                                                      |
| ------------ | ----------------------------------------------------------------------- |
| `filesystem` | Writes bounded prompt and packet files for any agent or human workflow. |
| `fake`       | Produces deterministic simulation packets for tests and examples.       |

The filesystem adapter is the reliable universal fallback. Fake adapter output is not production implementation evidence.

## Conservative Host Adapters

Codex, Claude Code, Cursor, Gemini CLI, GitHub Copilot, Windsurf/Cascade, Aider, and OpenCode support is currently conservative. Meta Harness may detect local CLIs, emit instruction files, document MCP configuration, or generate prompt files, but native process dispatch remains disabled unless local command evidence proves the behavior.

## Instruction Emitters

Generate instruction files with:

```bash
pnpm --filter @meta-harness/cli exec mh emit-instructions --target all
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

See [Agent Support Matrix](./agent-support-matrix.md) for current proof status and gaps.
