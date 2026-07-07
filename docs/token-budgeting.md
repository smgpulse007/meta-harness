# Token Budgeting

Meta Harness is designed for large implementation programs where raw context dumps become unreliable and expensive.

## Principles

- Keep durable policy in short always-loaded instruction files.
- Put procedures in skills and docs, not every prompt.
- Store raw logs as artifacts; pass paths, hashes, statuses, and bounded excerpts.
- Give worker and reviewer agents exact commands and scoped files instead of entire histories.
- Use subagents for read-heavy work and return compact packets.

## Budget Classes

| Budget Class        | Purpose                            |                              Target |
| ------------------- | ---------------------------------- | ----------------------------------: |
| `instruction_index` | Root guidance such as `AGENTS.md`. |       16 KiB target, 32 KiB warning |
| `skill_metadata`    | Skill name and description.        |                100 tokens per skill |
| `skill_body`        | Full `SKILL.md` body.              |                        5,000 tokens |
| `mcp_instructions`  | MCP server instructions.           | first 512 characters self-contained |
| `phase_pack`        | Parent coordinator phase context.  |              8,000 to 12,000 tokens |
| `slice_pack`        | Worker slice context.              |               4,000 to 8,000 tokens |
| `review_pack`       | Reviewer context.                  |               4,000 to 8,000 tokens |
| `evidence_excerpt`  | Command output excerpt.            |          100 to 200 lines or 12 KiB |
| `raw_artifact`      | Full logs and generated outputs.   |          stored on disk, not pasted |

## Roadmap

Phase 4 adds machine-checkable budget commands such as `mh budget`, `mh context-pack`, `mh prompt`, and `mh summarize-log`.
