# Richer Refactor Walkthrough

Use this pattern for a multi-slice refactor:

1. Write a spec with acceptance criteria and non-negotiable safety rules.
2. Ingest the spec with a phase manifest.
3. Compile requirements into a ledger.
4. Split the phase into dependency-ordered slices.
5. Dispatch independent read-heavy work to bounded agents.
6. Collect packets and verify write scope, commands, proof, and side effects.
7. Run an independent reviewer.
8. Write the checkpoint and continue only from `next_action.yaml`.

Keep raw command logs as artifacts. Pass reviewers paths, hashes, statuses, and short excerpts instead of entire logs.
