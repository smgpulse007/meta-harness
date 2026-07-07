# Open Source Readiness Phase 4 Checkpoint

Status: `complete`

Phase 4 implemented the token-budget and context-pack layer required by the open-source readiness goal. The CLI now exposes `mh budget` for machine-checkable prompt/artifact budgets, `mh summarize-log` for bounded evidence excerpts, and richer `mh context-pack` / `mh prompt` outputs for parent, worker, and reviewer roles.

## Exit Criteria

| Criterion                                                        | Status             | Evidence                                                                                                              |
| ---------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `mh budget --json` can be used in CI.                            | `command_verified` | `package.json`, `packages/cli/src/commands/budget.ts`, `docs/checkpoints/open_source_readiness_phase_4/commands.md`   |
| Generated instructions and skills stay under documented budgets. | `command_verified` | `node packages/cli/dist/index.js budget --json` reported 55/55 items within budget.                                   |
| Context packs are deterministic and bounded.                     | `command_verified` | Required Codex, Claude, and generic context-pack smokes returned within-budget packs with raw artifacts excluded.     |
| Large logs stay as artifacts with excerpts.                      | `command_verified` | `packages/cli/src/commands/summarize-log.ts`, `docs/examples/evidence-excerpts/`, integration smoke excerpt artifact. |
| At least three sample packs exist.                               | `static_verified`  | `docs/examples/context-packs/codex-worker.md`, `claude-reviewer.md`, `generic-filesystem.md`.                         |
| Docs explain how to keep context small.                          | `static_verified`  | `README.md`, `docs/token-budgeting.md`, `docs/cli-reference.md`.                                                      |

## Implementation Summary

- Added `mh budget` with JSON/text output, strict mode, CI integration, generated pack checks, instruction/skill scans, MCP description checks, evidence excerpt checks, and raw-artifact stored-only treatment.
- Expanded `mh context-pack` / `mh prompt` with role-specific pack classes, allowed write scope, required output schema, proof state, blockers, artifact paths, bounded excerpts, and budget summaries.
- Added `mh summarize-log` to redact secret-like values, hash raw logs, and emit bounded JSON or Markdown evidence excerpts.
- Added budget and evidence excerpt JSON schemas plus sample artifacts validated by `scripts/schema-check.ts`.
- Updated `mh doctor` to include budget health in JSON output.
- Added docs and samples for token budgeting, context packs, and evidence excerpts.

## Known Limits

- GitHub Pages deployment is still externally blocked for this private repository: the enablement attempt returned HTTP 422 because the current plan does not support Pages for the repository.
- Native agent dispatch remains unverified and disabled until Phase 6 local command evidence exists.
- Repo-wide `pnpm format:check` remains deferred because earlier phases carried pre-existing formatting debt outside this Phase 4 slice; touched files passed a scoped Prettier check.

## Independent Review

Independent reviewer result:

- `phase_alignment`: `aligned`
- `directional_alignment`: `on_track`
- `evidence_quality`: `strong`
- `phase_completion_percent`: 96
- `blockers`: none
- `next_action_recommendation`: `continue`

## Continuation

Phase 4 is complete. `next_action.yaml` authorizes continuation to `open_source_readiness_phase_5` with no blocking risks.
