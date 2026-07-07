# CLI Reference

The CLI binary is `mh`. In this source checkout, run it through pnpm:

```bash
pnpm --filter @meta-harness/cli exec mh --help
```

## Commands

| Command                | Purpose                                                 | Required Inputs                                                                         | Primary Outputs                                                                                   |
| ---------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `mh init`              | Create Meta Harness scaffolding in a workspace.         | Optional `--profile` value of `basic`, `strict`, or `trading-safe`; optional `--force`. | Harness directories, templates, and policy files.                                                 |
| `mh ingest`            | Register an implementation spec and phase manifest.     | `--spec`, `--manifest`, optional `--alignment`.                                         | Stored spec inputs for planning.                                                                  |
| `mh compile-spec`      | Convert a spec into a requirement ledger for a phase.   | `--spec`, optional `--phase`.                                                           | Requirements artifacts under `.meta-harness`.                                                     |
| `mh plan`              | Build a slice plan for a phase.                         | `--phase`.                                                                              | Slice DAG and task contracts.                                                                     |
| `mh lint-plan`         | Validate slice dependencies and plan shape.             | `--phase`.                                                                              | Findings list, with nonzero exit on blocking plan errors.                                         |
| `mh dispatch`          | Dispatch ready slices through an adapter.               | `--phase`, `--agent`.                                                                   | Prompt files or adapter packet handoff artifacts.                                                 |
| `mh collect`           | Collect worker packets for a phase.                     | `--phase`.                                                                              | Normalized packet inventory.                                                                      |
| `mh verify`            | Verify packets, write scopes, proof, and safety.        | `--phase`.                                                                              | Verification findings and proof status updates.                                                   |
| `mh audit-checkpoint`  | Check checkpoint completeness.                          | `--phase`.                                                                              | Checkpoint audit findings.                                                                        |
| `mh checkpoint`        | Write terminal checkpoint files.                        | `--phase`, optional `--status`.                                                         | `checkpoint.md`, `proof.json`, `next_action.yaml`, and supporting artifacts.                      |
| `mh continue`          | Read `next_action.yaml` and report the next transition. | `--phase`, optional `--human-accepted`.                                                 | Continuation decision output.                                                                     |
| `mh emit-instructions` | Generate host instruction files.                        | Optional `--target`.                                                                    | `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, Cursor, Windsurf, Copilot, and Continue instruction files. |
| `mh doctor`            | Inspect local harness health.                           | None.                                                                                   | Health findings.                                                                                  |
| `mh mcp --stdio`       | Start the MCP server over stdio.                        | Optional `--mode`.                                                                      | MCP tools, prompts, and resources over stdio.                                                     |

## Exit And Evidence Expectations

Commands that validate plans, packets, proof, or checkpoints should be treated as evidence only when their exit code, command line, timestamp, and relevant output excerpt are recorded in checkpoint artifacts.

Do not write `passed` in a proof ledger unless a command or review actually ran.
