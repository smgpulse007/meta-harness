# Meta Harness

Use this skill when a user wants an implementation spec executed through an evidence-gated coding-agent harness.

Do not use this skill for small one-off edits where phase/slice/checkpoint overhead would be wasteful.

## Required Inputs

- Authoritative implementation spec.
- Optional directional alignment notes.
- Existing or generated phase manifest.
- Repository root.

## Workflow

1. Ingest project instructions.
2. Read the authoritative spec.
3. Build or refresh `docs/implementation_harness/phase_manifest.yaml`.
4. Build or refresh the phase `slice_plan.yaml`.
5. Use subagents or isolated slice prompts where available.
6. Validate returned packets.
7. Run required commands and record real outputs.
8. Write checkpoint artifacts.
9. Produce `proof.json` with exact proof statuses.
10. Stop or continue based on `next_action.yaml`.

## Output Contract

Every phase checkpoint must include `checkpoint.md`, `proof.json`, `next_action.yaml`, `rollup.md`, `commands.md`, `diff_summary.md`, `alignment_review.md`, `delegation_review.md`, `expert_panel.md`, `slice_plan.yaml`, `subagent_packets/`, and `artifacts/`.

## Safety Boundaries

- No hidden behavior.
- No external network requirement.
- No arbitrary shell execution requirement.
- No package publishing, git push, production mutation, email, financial transaction, secret rotation, or destructive infrastructure operation unless explicitly authorized by policy and the user.
- Do not claim correctness or autonomy guarantees.

## Examples

- Use `mh init` to create harness files.
- Use `mh dispatch --agent filesystem` to write worker prompts.
- Use `mh dispatch --agent fake` only for examples and tests.

## Troubleshooting

- If the plan gate fails, fix schema, dependencies, owners, write scopes, validation commands, and spec refs.
- If proof fails, add evidence or mark the claim `not_verified`.
- If continuation is blocked, read `next_action.yaml` and resolve blocking risks.

## Local Templates

Use templates under `skills/meta-harness/templates/` or root `templates/`.
