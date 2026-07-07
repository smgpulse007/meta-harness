# Checkpoint open_source_readiness_phase_0

Status: complete_pending_human_review

## Summary

Phase 0 completed the compatibility research and support-claims audit for the open-source readiness goal. The matrix now separates instruction, skill/plugin, MCP, and native/headless dispatch surfaces, and it avoids claiming native dispatch for any non-filesystem/fake adapter.

Primary outputs:

- `docs/research/agent-compatibility-2026-07-07.md`
- `docs/research/agent-support-claim-ledger-2026-07-07.md`
- `docs/agent-support-matrix.md`
- `docs/checkpoints/open_source_readiness_phase_0/`

## Phase 0 Exit Criteria

| Criterion                                                                       | Status            | Evidence                                                                                                                                                                     |
| ------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No support claim lacks a source or local evidence.                              | `static_verified` | Research note and claim ledger cite official source URLs or local inspected files for current support claims. Unimplemented surfaces are marked `not_verified` or `partial`. |
| Codex support is accurately described as partial and conservative today.        | `static_verified` | Matrix and research note describe Codex as detection, MCP/write-scope hints, and filesystem prompt fallback only.                                                            |
| Native dispatch targets are clearly marked experimental/planned until verified. | `static_verified` | Matrix and ledger mark native dispatch as unlaunched, `not_verified`, or `partial` until local command evidence exists.                                                      |

## Reviewer Result

Initial independent review returned `recover` with three blockers:

- Missing Phase 0 `next_action.yaml`.
- Exit criterion was marked `partial` instead of resolved or explicitly blocked.
- `planned` appeared as a proof status in the matrix/research table.

Recovery edits addressed all three before final checkpoint closeout.

## Carry-Forward Risks

- Repo-wide `pnpm run format:check` currently fails on broad pre-existing formatting issues; Phase 0 touched docs pass scoped Prettier.
- Live GitHub Actions state was not reverified during Phase 0.
- Adapter proof remains mostly static plus integration smoke; direct adapter package tests are still missing.
- Copilot path-specific instructions lack `applyTo` frontmatter.
- `mh emit-instructions` lacks `opencode` and `roo` targets.
- Native dispatch remains `not_verified` for non-filesystem/fake adapters.
- Filesystem adapter dry-run semantics need a follow-up audit.

## Required Evidence

- proof.json
- next_action.yaml
- commands.md
- diff_summary.md
- alignment_review.md
- delegation_review.md
- expert_panel.md
- slice_plan.yaml
- subagent_packets/
- artifacts/
