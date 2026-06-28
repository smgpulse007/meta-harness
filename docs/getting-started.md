# Getting Started

Install dependencies and build:

```bash
pnpm install
pnpm build
```

Initialize a target repo:

```bash
mh init --profile strict
```

Register a spec:

```bash
mh ingest --spec docs/implementation_spec.md --alignment docs/directional_alignment.md --manifest docs/implementation_harness/phase_manifest.yaml
mh compile-spec --spec docs/implementation_spec.md
```

Create and check a plan:

```bash
mh plan --phase phase_001
mh lint-plan --phase phase_001
```

Dispatch through the universal filesystem adapter:

```bash
mh dispatch --phase phase_001 --agent filesystem
```

Collect packets, verify, and checkpoint:

```bash
mh collect --phase phase_001
mh verify --phase phase_001
mh checkpoint --phase phase_001 --status complete_pending_human_review
```
