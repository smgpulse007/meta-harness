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
node packages/cli/dist/index.js --help
```

Initialize a strict harness workspace:

```bash
node packages/cli/dist/index.js init --profile strict
```

Register a spec and compile requirements:

```bash
node packages/cli/dist/index.js ingest --spec docs/implementation_spec.md --manifest docs/implementation_harness/phase_manifest.yaml
node packages/cli/dist/index.js compile-spec --spec docs/implementation_spec.md
```

Create and check a plan:

```bash
node packages/cli/dist/index.js plan --phase phase_001
node packages/cli/dist/index.js lint-plan --phase phase_001
```

Dispatch through the universal filesystem adapter:

```bash
node packages/cli/dist/index.js dispatch --phase phase_001 --agent filesystem
```

Collect packets, verify, and checkpoint:

```bash
node packages/cli/dist/index.js collect --phase phase_001
node packages/cli/dist/index.js verify --phase phase_001
node packages/cli/dist/index.js checkpoint --phase phase_001 --status complete_pending_human_review
```

Use `--agent fake` only for deterministic harness tests and examples. Fake adapter output is simulation evidence, not production implementation proof.

Continue from the machine-readable contract:

```bash
node packages/cli/dist/index.js continue --phase phase_001
```

`next_action.yaml` is the continuation source of truth. A new parent coordinator should read it before deciding whether to continue, recover, or stop for review.
