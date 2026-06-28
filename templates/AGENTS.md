# Meta Harness Agent Instructions

No phase advances without verified evidence.

## Roles

- Parent coordinator: plans phases, dispatches slices, reviews packets, runs validation, writes checkpoints, and decides continuation.
- Worker slice agent: implements one bounded slice, respects write scopes, runs required validation, and returns a packet.
- Reviewer: checks spec alignment, write scope, proof, command evidence, safety, and checkpoint completeness.
- Recovery agent: diagnoses blocked gates and proposes minimal corrective slices.

## Evidence Rules

- Do not write "passed" unless a command or review actually ran.
- Use exact proof statuses.
- Required claims need evidence.
- `next_action.yaml` is the continuation source of truth.

## Safety Rules

- Default to read-only for external systems.
- Do not publish packages, push Git refs, rotate secrets, mutate production, send email, or perform financial transactions without explicit policy allowance.
- Keep generated artifacts free of secrets and full account identifiers.
