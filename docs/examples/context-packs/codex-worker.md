# Meta Harness Context Pack

Target: codex
Role: worker
Phase: phase_001
Budget: 1907/8000 estimated tokens (within_budget)

## Objective

Execute the current Meta Harness slice with bounded context and evidence-backed proof.

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

- Use AGENTS.md as the durable instruction surface.
- Use filesystem prompts or MCP read tools for stable work; codex-experimental remains feature-gated.

## Required Output Schema

- slice packet with changed files, proof statements, validation command outputs, risks, and continuation recommendation
- proof statuses must use the exact Meta Harness proof status vocabulary

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

- Class: `slice_pack`
- Max excerpt lines: 80
- Max excerpt chars: 6000
- Raw artifacts included: false

## Relevant Files

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

### docs/examples/codex-prompt-file.md (lines 1-20)

````
# Codex Prompt-File Flow

Codex support is currently partial and conservative.

Stable use today:

1. Generate `AGENTS.md` and other instruction files with `mh emit-instructions`.
2. Dispatch a slice through the filesystem adapter.
3. Have Codex read the prompt file and produce a packet.
4. Collect and verify the packet with Meta Harness.

```bash
node packages/cli/dist/index.js emit-instructions --target agents
node packages/cli/dist/index.js dispatch --phase phase_001 --agent filesystem
````

Use `--target all` to refresh every host instruction/config surface, including OpenCode and Roo compatibility files, after building the local CLI.

Experimental `codex-experimental` dispatch is feature-gated and disabled by default. Phase 6 verified an npm Codex CLI schema-output smoke with JSONL usage, but the stable Codex flow remains prompt-file fallback until full slice dispatch evidence is reviewed.

```

### docs/examples/mcp-configs/codex-config.toml (lines 1-4)

```

[mcp_servers.meta-harness]
command = "node"
args = ["packages/cli/dist/index.js", "mcp", "--stdio"]

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
```
