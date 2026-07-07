---
name: meta-harness
description: Coordinate Meta Harness phases, slices, packets, proof ledgers, checkpoints, and continuation decisions.
---

# Meta Harness

Use this skill when a task should be executed through the Meta Harness protocol rather than as a small one-off edit.

## Required Inputs

- Authoritative implementation spec or goal prompt.
- Current `next_action.yaml` when continuing existing work.
- Phase or slice objective, allowed write scope, and required validation commands.

## Workflow

1. Read the controlling spec and current continuation file first.
2. Plan bounded slices and keep worker write scopes narrow.
3. Require packets to cite changed files, validation commands, proof statements, risks, blockers, and continuation recommendations.
4. Run or verify commands before writing `command_verified`, `runtime_verified`, or "passed".
5. Write checkpoint artifacts and make `next_action.yaml` the continuation source of truth.

## Proof Rules

- Use only `claimed`, `parent_verified`, `static_verified`, `command_verified`, `runtime_verified`, `human_verified`, `not_verified`, or `partial`.
- Required claims need evidence.
- Fake or simulated output is never production implementation proof.
- Native agent dispatch is not supported unless local command evidence proves it.

## Safety

Default external systems to read-only. Do not publish packages, push Git refs, rotate secrets, mutate production, send email, perform financial transactions, or destroy infrastructure without explicit policy authorization.
