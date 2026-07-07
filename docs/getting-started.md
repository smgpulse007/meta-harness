# Getting Started

Meta Harness is currently installed from source. The root package is private; the publishable packages live under `packages/*`.

Install dependencies and run the current verification gate:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run ci
```

Run the local CLI from the workspace:

```bash
pnpm --filter @meta-harness/cli exec mh --help
```

Initialize a strict harness workspace:

```bash
pnpm --filter @meta-harness/cli exec mh init --profile strict
```

Register a spec and compile requirements:

```bash
pnpm --filter @meta-harness/cli exec mh ingest --spec docs/implementation_spec.md --manifest docs/implementation_harness/phase_manifest.yaml
pnpm --filter @meta-harness/cli exec mh compile-spec --spec docs/implementation_spec.md
```

Create and check a plan:

```bash
pnpm --filter @meta-harness/cli exec mh plan --phase phase_001
pnpm --filter @meta-harness/cli exec mh lint-plan --phase phase_001
```

Dispatch through the universal filesystem adapter:

```bash
pnpm --filter @meta-harness/cli exec mh dispatch --phase phase_001 --agent filesystem
```

Collect packets, verify, and checkpoint:

```bash
pnpm --filter @meta-harness/cli exec mh collect --phase phase_001
pnpm --filter @meta-harness/cli exec mh verify --phase phase_001
pnpm --filter @meta-harness/cli exec mh checkpoint --phase phase_001 --status complete_pending_human_review
```

Use `--agent fake` only for deterministic harness tests and examples. Fake adapter output is simulation evidence, not production implementation proof.

Continue from the machine-readable contract:

```bash
pnpm --filter @meta-harness/cli exec mh continue --phase phase_001
```

`next_action.yaml` is the continuation source of truth. A new parent coordinator should read it before deciding whether to continue, recover, or stop for review.
