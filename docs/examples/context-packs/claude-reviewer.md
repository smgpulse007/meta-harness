# Meta Harness Context Pack

Target: claude-code
Role: reviewer
Phase: phase_001
Budget: 2331/8000 estimated tokens (within_budget)

## Objective

Review the current Meta Harness phase or slice against the controlling spec, proof, validation, safety, and continuation contract.

## Non-Negotiables

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

## Target Guidance

- Use CLAUDE.md and .claude/skills/meta-harness/SKILL.md where available.
- Native claude -p dispatch remains unverified.

## Required Output Schema

- phase_alignment: aligned | partially_aligned | misaligned
- directional_alignment: on_track | needs_adjustment | off_track
- evidence_quality: strong | adequate | weak | missing
- blockers and required_recovery_slices

## Required Evidence Statuses

- `claimed`
- `parent_verified`
- `static_verified`
- `command_verified`
- `runtime_verified`
- `human_verified`
- `not_verified`
- `partial`

## Validation Commands

- `Use the phase slice plan validation commands.`

## Allowed Write Scope

- Use the phase slice plan allowed write scope.

## Proof State

- Path: `.meta-harness/checkpoints/phase_001/proof.json`
- Exists: false
- Required claims: 0
- Statuses:

## Known Blockers

- None recorded in next_action.yaml.

## Artifact Paths

- `.meta-harness/checkpoints/phase_001/artifacts/`
- `.meta-harness/checkpoints/phase_001/commands.md`
- `.meta-harness/checkpoints/phase_001/proof.json`
- `.meta-harness/checkpoints/phase_001/next_action.yaml`

## Safety

- Default external systems to read-only.
- Do not claim validation unless a command or review actually ran.
- Do not include secrets or full account identifiers in generated artifacts.
- Native dispatch remains unverified unless local command evidence proves it.
- Use artifact paths and evidence excerpts instead of pasting raw logs.

## Budget Summary

- Class: `review_pack`
- Max excerpt lines: 80
- Max excerpt chars: 6000
- Raw artifacts included: false

## Relevant Files

### .claude/skills/meta-harness/SKILL.md (lines 1-21)

```
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

```

### .meta-harness/checkpoints/phase_001/checkpoint.md

Missing from workspace.

### .meta-harness/checkpoints/phase_001/next_action.yaml

Missing from workspace.

### .meta-harness/checkpoints/phase_001/proof.json

Missing from workspace.

### .meta-harness/checkpoints/phase_001/slice_plan.yaml

Missing from workspace.

### .meta-harness/state.json (lines 1-16)

```
{
  "protocol_version": "0.1.0",
  "state": "DECIDE_STOP_CONDITION",
  "current_phase_id": "phase_7",
  "completed_phases": [
    "phase_0",
    "phase_1",
    "phase_2",
    "phase_3",
    "phase_4",
    "phase_5",
    "phase_6"
  ],
  "updated_at": "2026-06-28T01:34:20.065Z"
}

```

### AGENTS.md (lines 1-28)

```
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

Target: AGENTS

This file is generated from the canonical Meta Harness protocol. Keep durable policy changes in the source protocol and regenerate.

```

### CLAUDE.md (lines 1-28)

```
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

Target: CLAUDE

This file is generated from the canonical Meta Harness protocol. Keep durable policy changes in the source protocol and regenerate.

```

### docs/examples/mcp-configs/claude.mcp.json (lines 1-9)

```
{
  "mcpServers": {
    "meta-harness": {
      "command": "node",
      "args": ["packages/cli/dist/index.js", "mcp", "--stdio"]
    }
  }
}

```

### docs/implementation_harness/phase_manifest.yaml (lines 1-80)

```
protocol_version: 0.1.0
project: meta-harness
phases:
  - id: phase_0
    title: Repo bootstrap
    source_spec_refs:
      - docs/implementation_spec.md
    input_checkpoints: []
    output_checkpoint: docs/checkpoints/phase_0
    acceptance_criteria:
      - Required files exist
      - Validation evidence is recorded
    validation_commands:
      - id: local-ci
        command: pnpm run ci
        required: true
    allowed_terminal_statuses:
      - complete
      - complete_pending_human_review
      - pass_with_risks
      - blocked
      - failed
    human_acceptance_required: false
    side_effect_policy: default
    slices:
      - phase_0_slice_001
    depends_on: []
  - id: phase_1
    title: Protocol docs and schemas
    source_spec_refs:
      - docs/implementation_spec.md
    input_checkpoints:
      - docs/checkpoints/phase_0
    output_checkpoint: docs/checkpoints/phase_1
    acceptance_criteria:
      - Required files exist
      - Validation evidence is recorded
    validation_commands:
      - id: local-ci
        command: pnpm run ci
        required: true
    allowed_terminal_statuses:
      - complete
      - complete_pending_human_review
      - pass_with_risks
      - blocked
      - failed
    human_acceptance_required: false
    side_effect_policy: default
    slices:
      - phase_1_slice_001
    depends_on:
      - phase_0
  - id: phase_2
    title: Core engine
    source_spec_refs:
      - docs/implementation_spec.md
    input_checkpoints:
      - docs/checkpoints/phase_1
    output_checkpoint: docs/checkpoints/phase_2
    acceptance_criteria:
      - Required files exist
      - Validation evidence is recorded
    validation_commands:
      - id: local-ci
        command: pnpm run ci
        required: true
    allowed_terminal_statuses:
      - complete
      - complete_pending_human_review
      - pass_with_risks
      - blocked
      - failed
    human_acceptance_required: false
    side_effect_policy: default
    slices:
      - phase_2_slice_001
    depends_on:
      - phase_1
  - id: phase_3
```

Excerpt truncated.
