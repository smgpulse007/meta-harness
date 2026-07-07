# CLI Reference

The CLI binary is `mh`. In this source checkout, run it through pnpm:

```bash
node packages/cli/dist/index.js --help
```

## Commands

| Command                | Purpose                                                         | Required Inputs                                                                         | Primary Outputs                                                                                      |
| ---------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `mh init`              | Create Meta Harness scaffolding in a workspace.                 | Optional `--profile` value of `basic`, `strict`, or `trading-safe`; optional `--force`. | Harness directories, templates, and policy files.                                                    |
| `mh ingest`            | Register an implementation spec and phase manifest.             | `--spec`, `--manifest`, optional `--alignment`.                                         | Stored spec inputs for planning.                                                                     |
| `mh compile-spec`      | Convert a spec into a requirement ledger for a phase.           | `--spec`, optional `--phase`.                                                           | Requirements artifacts under `.meta-harness`.                                                        |
| `mh plan`              | Build a slice plan for a phase.                                 | `--phase`.                                                                              | Slice DAG and task contracts.                                                                        |
| `mh lint-plan`         | Validate slice dependencies and plan shape.                     | `--phase`.                                                                              | Findings list, with nonzero exit on blocking plan errors.                                            |
| `mh dispatch`          | Dispatch ready slices through an adapter.                       | `--phase`, `--agent`.                                                                   | Prompt files or adapter packet handoff artifacts.                                                    |
| `mh collect`           | Collect worker packets for a phase.                             | `--phase`.                                                                              | Normalized packet inventory.                                                                         |
| `mh verify`            | Verify packets, write scopes, proof, and safety.                | `--phase`.                                                                              | Verification findings and proof status updates.                                                      |
| `mh audit-checkpoint`  | Check checkpoint completeness.                                  | `--phase`.                                                                              | Checkpoint audit findings.                                                                           |
| `mh checkpoint`        | Write terminal checkpoint files.                                | `--phase`, optional `--status`.                                                         | `checkpoint.md`, `proof.json`, `next_action.yaml`, and supporting artifacts.                         |
| `mh continue`          | Read `next_action.yaml` and report the next transition.         | `--phase`, optional `--human-accepted`.                                                 | Continuation decision output.                                                                        |
| `mh context-pack`      | Generate a bounded target-specific context pack.                | Optional `--target`, `--phase`, `--budget`, and `--format`.                             | Markdown or JSON context pack with target guidance, file index, excerpts, and budget estimate.       |
| `mh prompt`            | Alias for `mh context-pack`.                                    | Optional `--target`, `--phase`, `--budget`, and `--format`.                             | Markdown or JSON context pack.                                                                       |
| `mh emit-instructions` | Generate host instruction files and local compatibility config. | Optional `--target`.                                                                    | `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, Cursor, Windsurf, Copilot, Continue, OpenCode, and Roo files. |
| `mh doctor`            | Inspect local harness health.                                   | None.                                                                                   | Health findings.                                                                                     |
| `mh mcp --stdio`       | Start the MCP server over stdio.                                | Optional `--mode`.                                                                      | MCP tools, prompts, and resources over stdio.                                                        |

## Exit And Evidence Expectations

Commands that validate plans, packets, proof, or checkpoints should be treated as evidence only when their exit code, command line, timestamp, and relevant output excerpt are recorded in checkpoint artifacts.

Do not write `passed` in a proof ledger unless a command or review actually ran.

## Emit Targets

`mh emit-instructions --target all` emits every supported instruction target. Individual target values are `agents`, `claude`, `gemini`, `cursor`, `windsurf`, `copilot`, `copilot-custom`, `continue`, `opencode`, and `roo`.

OpenCode and Roo targets include local MCP compatibility config. They do not enable native agent dispatch.

## Context Pack Targets

`mh context-pack --target <target>` supports `codex`, `claude-code`, `cursor`, `gemini`, `copilot`, `windsurf`, `continue`, `aider`, `opencode`, `roo`, and `generic`.

Use `--format json` for machine-readable pack metadata and `--format markdown` for a paste-ready worker or reviewer prompt. The first implementation estimates tokens from character count and keeps excerpts bounded; full budget enforcement remains part of the Phase 4 budget work.
