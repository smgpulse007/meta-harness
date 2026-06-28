# Meta Harness

Meta Harness is a repo-native execution harness for large coding-agent implementation specs.

It is not a coding agent. It is the protocol, state machine, CLI, MCP server, adapter layer, templates, and skill package that coordinate coding agents around one rule:

> No phase advances without verified evidence.

## What It Does

- Converts implementation specs into phases, dependency-ordered slices, and packets.
- Enforces bounded write scopes, validation gates, proof ledgers, side-effect policy, and checkpoint artifacts.
- Emits instruction files for mainstream coding-agent environments.
- Provides a read-only-first MCP server for structured orchestration.
- Supports a universal filesystem protocol when native automation is unavailable.

## What It Does Not Do

- It does not implement a new LLM or coding agent.
- It does not guarantee correctness, safety, or full autonomy.
- It does not publish packages, push Git refs, mutate production systems, send email, rotate secrets, or perform financial transactions by default.
- It does not claim all adapters have the same level of support.

## Integration Tiers

- Tier 0: filesystem protocol. Works with any coding agent by writing prompt and packet files.
- Tier 1: generated instruction files for tools such as Claude, Gemini, Cursor, Windsurf, Copilot, and Continue.
- Tier 2: CLI adapter dispatch where a tool is detected and a safe prompt-file flow is configured.
- Tier 3: MCP/native integration where the host supports structured tool calls.

## Quickstart

```bash
pnpm install
pnpm build
pnpm --filter @meta-harness/cli exec mh init --profile strict
pnpm --filter @meta-harness/cli exec mh ingest --spec docs/implementation_spec.md --manifest docs/implementation_harness/phase_manifest.yaml
pnpm --filter @meta-harness/cli exec mh compile-spec --spec docs/implementation_spec.md
pnpm --filter @meta-harness/cli exec mh plan --phase phase_001
pnpm --filter @meta-harness/cli exec mh lint-plan --phase phase_001
pnpm --filter @meta-harness/cli exec mh dispatch --phase phase_001 --agent filesystem
```

Use `--agent fake` for deterministic tests and examples. Fake adapter packets are simulation evidence only.

## CLI

The CLI binary is `mh`.

Implemented commands:

- `mh init`
- `mh ingest`
- `mh compile-spec`
- `mh plan`
- `mh lint-plan`
- `mh dispatch`
- `mh collect`
- `mh verify`
- `mh audit-checkpoint`
- `mh checkpoint`
- `mh continue`
- `mh emit-instructions`
- `mh doctor`
- `mh mcp --stdio`

## MCP Server

Start the server over stdio:

```bash
mh mcp --stdio
```

Default mode is `read-only`. Write tools require `--mode checkpoint-write` or `--mode workspace-write`. Dangerous operations are not exposed by default.

## Skill Usage

The reusable skill lives in `skills/meta-harness/SKILL.md`. It tells a compatible agent how to ingest a spec, build a manifest, plan slices, validate packets, write checkpoints, produce proof, and stop or continue according to `next_action.yaml`.

## Instruction Emitters

Generate agent instructions:

```bash
mh emit-instructions --target all
```

Generated targets include `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, Cursor rules, Windsurf rules, Copilot instructions, and Continue rules. They are derived from the canonical protocol text.

## Example Workflow

See `examples/tiny-typescript-refactor` for a fake-adapter end-to-end flow that produces a slice plan, packet, checkpoint, proof ledger, and next action without an external coding agent.

## Support Matrix

See `docs/agent-support-matrix.md`. Adapter support is best-effort and adapter-specific. Filesystem prompt packets are the reliable fallback.

## Security Model

See `docs/threat-model.md`. The core posture is read-only unless explicitly configured otherwise. Path traversal is blocked, secret-like values are redacted, and MCP does not execute arbitrary shell commands.

## Continuation Source of Truth

`next_action.yaml` is the machine-readable continuation contract. `next_prompt.md` may be useful for humans, but runners and parent agents must use `next_action.yaml`.

## Roadmap

See `docs/release-plan.md`.
