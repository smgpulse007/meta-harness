# Diff Summary

## Runtime And CLI

- `packages/cli/src/commands/emit-instructions.ts`: target registry with host-specific renderers and OpenCode/Roo multi-file outputs.
- `packages/cli/src/commands/context-pack.ts`: bounded target-specific Markdown/JSON context-pack generator.
- `packages/cli/src/index.ts`: added `context-pack`, `prompt`, and updated emitter help.
- `packages/cli/tests/cli.test.ts`: added emitter and context-pack tests.
- `packages/cli/package.json`: added `pretest` dependency-closure build so package-local CLI tests pass from a cleaned workspace.
- `packages/core/src/templates/index.ts`: canonical agent instructions now include roles, proof statuses, `next_action.yaml`, and safety requirements.

## Host Files

- Updated generated instruction files for AGENTS, Claude, Gemini, Cursor, Windsurf, Copilot, Continue.
- Added `.agents/skills/meta-harness/SKILL.md` and `.claude/skills/meta-harness/SKILL.md`.
- Added `.opencode/instructions/meta-harness.md`, `opencode.json`, `.roo/rules/meta-harness.md`, and `.roo/mcp.json`.

## Docs And Samples

- Added `docs/examples/mcp-configs/`.
- Updated README, getting started, docs index, CLI reference, MCP reference, adapters, Azure/MCP examples, token budgeting, support matrix, and research claim ledger.

## Checkpoint

- Added `docs/checkpoints/open_source_readiness_phase_3/` with proof, commands, next action, reviewer/recovery notes, and validation summary.
