# Meta Harness Context Pack

Target: generic
Role: worker
Phase: phase_001
Budget: 3102/8000 estimated tokens (within_budget)

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

- Use the filesystem adapter prompt and packet contract as the universal fallback.

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

### docs/agent-support-matrix.md (lines 1-52)

```
# Agent Support Matrix

Last refreshed: 2026-07-07.

This matrix tracks agent support by integration surface. It is intentionally not a single "supported" boolean: Meta Harness can support instruction files, MCP configuration, skills, or prompt-file fallback without supporting native process dispatch.

Proof status values used here are `static_verified`, `command_verified`, `partial`, `claimed`, and `not_verified`. Roadmap intent is described in target/support/gap text, not as a proof status.

## Support Tiers

| Tier | Meaning                                                                                             |
| ---: | --------------------------------------------------------------------------------------------------- |
|    0 | Complete local harness surface. Implemented and exercised locally.                                  |
|    1 | Instruction or rule surface only. No native launch is claimed.                                      |
|    2 | Conservative adapter detection plus filesystem prompt fallback. Native launch is disabled.          |
|    3 | Experimental native dispatch target. Must remain feature-gated until local command evidence exists. |

## Current Matrix

| Target                           | Tier | Instruction Surface                                                                           | Skill Or Plugin Surface                                                              | MCP Surface                                                                                     | Native Or Headless Dispatch                                                                  | Current Meta Harness Support                                                                              | Proof Status       | Gaps                                                                                                                                   |
| -------------------------------- | ---: | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| filesystem                       |    0 | Prompt file contract                                                                          | Not applicable                                                                       | Not applicable                                                                                  | No external process launch                                                                   | Complete prompt-file adapter writes worker prompts and collects packets                                   | `command_verified` | Universal fallback only; does not run agents                                                                                           |
| fake                             |    0 | Prompt file contract                                                                          | Not applicable                                                                       | Not applicable                                                                                  | Simulated packet generation only                                                             | Complete deterministic test adapter for examples and smoke tests                                          | `command_verified` | Simulation evidence is not implementation proof                                                                                        |
| Codex                            |    3 | `AGENTS.md` and project `.codex` guidance are documented Codex surfaces                       | Agent Skills and plugins are documented Codex surfaces                               | Codex supports MCP configuration; `codex mcp-server` exposes Codex as an MCP server             | Stable `codex` adapter does not launch; `codex-experimental` is feature-gated                | Default adapter detects `codex`, advertises MCP/write-scope hints, and falls back to prompts; experimental parser/command builder exists | `partial`          | WindowsApps `codex.exe` was blocked locally; keep native slice dispatch opt-in until full packet handoff is reviewed                 |
| Claude Code                      |    3 | `CLAUDE.md` and `.claude` project configuration are documented surfaces                       | `.claude/skills/meta-harness/SKILL.md` is provided; plugins remain planned           | `.mcp.json` / MCP config are documented; sample config is provided                              | Stable `claude-code` adapter does not launch; `claude-code-experimental` is feature-gated    | Adapter detects `claude`, emits instructions/skill sample, and falls back to prompts; experimental parser/command builder exists       | `partial`          | `claude` was not installed locally; add hooks guidance and native launch evidence before any stable dispatcher claim                 |
| Cursor                           |    1 | `.cursor/rules/*.mdc` and `AGENTS.md` are documented                                          | `.agents/skills/meta-harness/SKILL.md` is provided for compatible skill hosts        | `.cursor/mcp.json` with stdio, SSE, and Streamable HTTP is documented; sample exists            | Cursor `agent -p` headless mode is documented, but Meta Harness does not launch it           | Emits `.cursor/rules/meta-harness.mdc` with frontmatter and provides MCP sample                           | `partial`          | Add ignore-file guidance and native dispatch only after local verification
... [truncated]
```

Excerpt truncated.

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
