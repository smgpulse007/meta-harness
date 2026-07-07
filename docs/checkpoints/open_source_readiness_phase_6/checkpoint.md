# Open Source Readiness Phase 6 Checkpoint

Status: `complete`

Phase 6 added feature-gated native dispatch experiments for Codex and Claude Code while preserving the stable prompt-file fallback posture. The stable `codex` and `claude-code` adapters still do not launch external agents. New experimental adapter IDs build command plans, store raw stdout/stderr artifacts, parse structured native output, and validate returned slice packets before writing packet files.

## Exit Criteria

| Criterion                                                                              | Status             | Evidence                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Experimental dispatchers are feature-gated.                                            | `command_verified` | `codex-experimental` and `claude-code-experimental` require both `--experimental-native` and `META_HARNESS_EXPERIMENTAL_NATIVE_DISPATCH=1`; adapter tests cover the gate-off path.                                                                                          |
| Tests cover parsing and failure cases.                                                 | `command_verified` | `pnpm --filter @meta-harness/adapters test` exited 0 with 10 tests covering command builders, Codex JSONL parsing, Claude structured-output parsing, malformed packets, mismatched slice IDs, gate-off behavior, successful fake native dispatch, and nonzero native exits. |
| Docs clearly separate experimental native dispatch from stable filesystem/MCP support. | `command_verified` | `docs/adapters.md`, `docs/agent-support-matrix.md`, `docs/cli-reference.md`, and the claim ledger distinguish stable prompt-file adapters from feature-gated experimental targets.                                                                                          |
| Codex native dispatch experiment has local command evidence.                           | `command_verified` | `npx --yes @openai/codex@0.142.5 exec --help` exited 0; a read-only npm Codex CLI schema-output smoke exited 0 with final JSON and `turn.completed` usage metadata.                                                                                                         |
| Claude native dispatch experiment is bounded and truthfully scoped.                    | `partial`          | `npx --yes @anthropic-ai/claude-code --help` and `--version` exited 0 and confirmed structured-output flags, but `claude` was not on PATH and `ANTHROPIC_API_KEY` was absent, so auth-backed packet handoff remains `not_verified`.                                         |
| Independent reviewer approval for Phase 6 continuation.                                | `parent_verified`  | `artifacts/final_reviewer.md` reports aligned direction, adequate evidence quality, 92 percent phase completion, no blockers, no recovery slices, and `continue`.                                                                                                           |

## Implementation Summary

- Added `packages/adapters/src/native-dispatch.ts` with experimental Codex and Claude command builders, JSON/JSONL packet parsers, schema generation, raw output artifact writes, strict packet validation, and opt-in process execution.
- Added `codex-experimental` and `claude-code-experimental` to the default adapter registry as Tier 3 experimental targets.
- Added `--experimental-native` to `mh dispatch`; the environment gate remains required for launch.
- Exported `findCommand` so experimental adapters can share command detection without enabling stable configurable adapters.
- Added focused adapter tests for the experimental parser, gate, artifact, success, and failure paths.
- Updated context-pack guidance so stable Codex and Claude handoffs still present prompt-file/MCP fallback as the default route.
- Updated adapter docs, CLI docs, support matrix, compatibility research, and claim ledger to record Phase 6 command evidence and avoid stable native-dispatch overclaims.

## Known Limits

- GitHub Pages deployment remains externally blocked for this private repository by repository plan/config state.
- WindowsApps `codex.exe` is visible to command detection but failed local execution with Windows `Access is denied`; the npm Codex CLI smoke is the command-verified Codex evidence.
- Claude Code native packet handoff remains unverified because `claude` is not on PATH and no Anthropic API key is configured.
- Experimental native dispatch proves command/parsing mechanics only. It does not prove a worker's implementation validation unless the returned packet contains command evidence and the parent/reviewer accepts that evidence.
- No Azure resource, release, package publish, or repository-public mutation was performed.

## Independent Review

Independent reviewer packet recorded in `artifacts/final_reviewer.md`:

- `phase_alignment`: `aligned`
- `directional_alignment`: `on_track`
- `evidence_quality`: `adequate`
- `phase_completion_percent`: 92
- `blockers`: none blocking Phase 6 exit
- `required_recovery_slices`: none
- `next_action_recommendation`: `continue`

## Continuation

Phase 6 is complete. Continue to `open_source_readiness_phase_7` using `next_action.yaml` as the continuation source of truth.
