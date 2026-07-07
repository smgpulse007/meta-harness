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

## Commands

Generate a bounded context pack:

```bash
node packages/cli/dist/index.js context-pack --target codex --role worker --phase phase_001 --budget 8000 --format markdown
```

`mh prompt` is an alias for `mh context-pack`. Packs include target guidance, current phase/slice, exact proof statuses, required output schema, validation commands, allowed write scope, proof-state summary, known blockers, artifact paths, bounded excerpts with line references, and a budget summary.

Run the budget check:

```bash
node packages/cli/dist/index.js budget --json
```

`pnpm run ci` runs the budget check after the CLI is built. The first policy fails on missing or hard over-budget required items; `--strict` can also fail warnings.

Summarize raw command output into a bounded evidence excerpt:

```bash
node packages/cli/dist/index.js summarize-log --input docs/examples/evidence-excerpts/sample-command-output.txt --command "pnpm test" --exit-code 0 --format json
```

The excerpt records path, command, exit code, timestamp, SHA-256 hash, redaction mode, truncation status, and bounded output. Raw logs stay on disk and are referenced by path/hash instead of pasted into prompts.

## Samples

- `docs/examples/context-packs/codex-worker.md`
- `docs/examples/context-packs/claude-reviewer.md`
- `docs/examples/context-packs/generic-filesystem.md`
- `docs/examples/context-packs/budget-report.sample.json`
- `docs/examples/evidence-excerpts/sample-command-output.excerpt.json`
