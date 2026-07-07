# Richer Refactor Walkthrough

Use this pattern for a multi-slice refactor. It is still local and deterministic, but it shows the evidence boundaries a real implementation should preserve.

For a checked artifact set with real command evidence, inspect `examples/command-verified-refactor` and the docs page [Command-Verified Refactor](./command-verified-refactor.md).

1. Write a spec with acceptance criteria and non-negotiable safety rules.
2. Ingest the spec with a phase manifest.
3. Compile requirements into a ledger.
4. Split the phase into dependency-ordered slices.
5. Dispatch independent read-heavy work to bounded agents.
6. Collect packets and verify write scope, commands, proof, and side effects.
7. Run an independent reviewer.
8. Write the checkpoint and continue only from `next_action.yaml`.

Keep raw command logs as artifacts. Pass reviewers paths, hashes, statuses, and short excerpts instead of entire logs.

## Example Phase Shape

```yaml
phase_id: phase_001
slices:
  - id: phase_001_slice_001
    owner: worker
    allowed_write_scope:
      - src/calculator/**
      - tests/calculator/**
    validation_commands:
      - pnpm test -- tests/calculator
    packet_required: true
  - id: phase_001_review
    owner: reviewer
    dependencies:
      - phase_001_slice_001
    allowed_write_scope:
      - docs/checkpoints/phase_001/**
    validation_commands:
      - mh verify --phase phase_001
      - mh audit-checkpoint --phase phase_001
    packet_required: true
```

## Evidence Rules

- Worker packets cite changed files, exact commands, exit codes, output paths, and proof statements.
- Reviewer packets inspect the worker packet and checkpoint artifacts rather than trusting chat summaries.
- `mh summarize-log` stores a bounded excerpt for command output; full logs stay on disk.
- `mh budget --json` guards prompt size before context packs are sent to agents.
- `mh doctor --json` should be warning-free or have explicit remediation recorded before dispatch.

## Closeout

A parent coordinator can close the phase only after:

1. Required proof claims are verified with exact proof statuses.
2. `mh verify --phase <id>` and `mh audit-checkpoint --phase <id>` produce non-blocking results.
3. The final reviewer reports no blockers or the checkpoint status carries unresolved risks honestly.
4. `next_action.yaml` names the next phase or states why continuation is blocked.
