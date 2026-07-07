---
name: meta-harness
description: Coordinate Meta Harness phases, slices, packets, proof ledgers, checkpoints, and continuation decisions.
---

# Meta Harness

Use this skill when a repository task must follow the Meta Harness evidence-gated phase and slice protocol.

## Process

1. Read the authoritative spec, current phase state, and `next_action.yaml`.
2. Work one bounded slice at a time and respect allowed write scope.
3. Record real command evidence before claiming validation.
4. Use exact proof statuses: `claimed`, `parent_verified`, `static_verified`, `command_verified`, `runtime_verified`, `human_verified`, `not_verified`, or `partial`.
5. Keep checkpoint artifacts complete and make continuation decisions from `next_action.yaml`.

## Safety

Keep external systems read-only by default. Do not publish packages, push Git refs, rotate secrets, mutate production, send email, perform financial transactions, or destroy infrastructure without explicit policy authorization.
