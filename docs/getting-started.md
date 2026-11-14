# Getting Started

Meta Harness is currently installed from source. The root package is private; the publishable packages live under `packages/*`.

Install dependencies and run the current verification gate:

```bash
git clone https://github.com/smgpulse007/meta-harness.git
cd meta-harness
corepack enable
pnpm install --frozen-lockfile
pnpm run ci
```

Run the local CLI from the workspace:

```bash
node packages/cli/dist/index.js --help
```

Try the reproducible walkthrough first:

![Actual disposable CLI walkthrough](https://smgpulse007.github.io/meta-harness/cli-demo.gif)

```bash
pnpm demo
```

This executes the real CLI in a disposable temporary directory, checks the generated policy, and prepares a synthetic plan. It does not dispatch an agent or claim an implementation.

For your own project, initialize a separate target workspace. From the `meta-harness` source checkout created above:

```bash
mkdir ../my-harness-workspace
cd ../my-harness-workspace
node ../meta-harness/packages/cli/dist/index.js init
```

Keep using the built CLI from the source checkout while your working directory stays in the target project. If you chose a different checkout name, adjust the path. There is one default read-only side-effect policy. The former `--profile` names did not implement different policies and now fail as unsupported options.

Do not use `init --force` to experiment in the source checkout; it intentionally overwrites harness files. `pnpm demo` is the isolated alternative.

Create `docs/implementation_spec.md` in the target workspace with your requirements, then register it and compile requirements:

```bash
node ../meta-harness/packages/cli/dist/index.js ingest --spec docs/implementation_spec.md --manifest docs/implementation_harness/phase_manifest.yaml
node ../meta-harness/packages/cli/dist/index.js compile-spec --spec docs/implementation_spec.md
```

Create and check a plan:

```bash
node ../meta-harness/packages/cli/dist/index.js plan --phase phase_001
node ../meta-harness/packages/cli/dist/index.js lint-plan --phase phase_001
```

Dispatch through the universal filesystem adapter:

```bash
node ../meta-harness/packages/cli/dist/index.js dispatch --phase phase_001 --agent filesystem
```

Collect packets, verify, and checkpoint:

```bash
node ../meta-harness/packages/cli/dist/index.js collect --phase phase_001
node ../meta-harness/packages/cli/dist/index.js verify --phase phase_001
node ../meta-harness/packages/cli/dist/index.js checkpoint --phase phase_001 --status complete_pending_human_review
```

Use `--agent fake` only for deterministic harness tests and examples. Fake adapter output is simulation evidence, not production implementation proof.

Continue from the machine-readable contract:

```bash
node ../meta-harness/packages/cli/dist/index.js continue --phase phase_001
```

`next_action.yaml` is the continuation source of truth. A new parent coordinator should read it before deciding whether to continue, recover, or stop for review.
