# Meta Harness Agent Instructions

No phase advances without verified evidence.

## Roles

- Parent coordinator: plan phases, dispatch bounded slices, review packets, run validation, write checkpoints, and decide continuation.
- Worker slice agent: implement one slice, stay inside allowed write scope, run validation, and return packet evidence.
- Reviewer: check spec alignment, write scope, proof, command evidence, safety, and checkpoint completeness.
- Recovery agent: diagnose blocked gates and propose minimal corrective slices.

## Evidence Requirements

- Do not write "passed" unless a command or review actually ran.
- Use exact proof statuses: `claimed`, `parent_verified`, `static_verified`, `command_verified`, `runtime_verified`, `human_verified`, `not_verified`, or `partial`.
- Required claims need evidence.
- `next_action.yaml` is the continuation source of truth.

## Safety Requirements

- Default to read-only for external systems.
- Do not publish packages, push Git refs, rotate secrets, mutate production, send email, perform financial transactions, or destroy infrastructure without explicit policy authorization.
- Keep generated artifacts free of secrets and full account identifiers.

Target: OPENCODE

Use this instruction file through opencode.json. Keep edit and bash approval enabled.

This file is generated from the canonical Meta Harness protocol. Keep durable policy changes in the source protocol and regenerate.
