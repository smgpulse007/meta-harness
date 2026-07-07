# Phase 6 Rollup

Phase 6 moved native dispatch from an overbroad future claim into a bounded experimental lane:

- Stable adapters remain conservative prompt-file surfaces.
- Experimental adapters are registered separately as `codex-experimental` and `claude-code-experimental`.
- Launch requires `--experimental-native` and `META_HARNESS_EXPERIMENTAL_NATIVE_DISPATCH=1`.
- Raw native stdout/stderr are stored under checkpoint artifacts.
- Returned packets are validated against the Meta Harness slice packet contract before collection.
- Codex has npm CLI schema-output smoke evidence.
- Claude has npx help/version command-surface evidence, but no auth-backed local packet handoff.

The independent reviewer reported aligned direction, adequate evidence, 92 percent phase completion, no blockers, no recovery slices, and `continue`. Phase 6 can advance to Phase 7.
