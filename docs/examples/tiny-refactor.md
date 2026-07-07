# Tiny Refactor Example

The tiny examples demonstrate a single phase with one or two slices, fake adapter dispatch, collected packets, proof ledger, checkpoint files, and continuation state.

Use the fake adapter only to prove harness mechanics.

## TypeScript Walkthrough

The checked-in `examples/tiny-typescript-refactor` directory shows a completed local harness run. It is intentionally small so every artifact can be inspected:

```bash
cd examples/tiny-typescript-refactor
mh init --profile strict
mh compile-spec --spec docs/implementation_spec.md --phase phase_001
mh plan --phase phase_001
mh lint-plan --phase phase_001
mh dispatch --phase phase_001 --agent fake
mh collect --phase phase_001
mh verify --phase phase_001
mh checkpoint --phase phase_001 --status pass_with_risks
mh audit-checkpoint --phase phase_001
mh continue --phase phase_001
```

The fake adapter writes deterministic packets so tests can prove the protocol shape. It is not production implementation evidence. A checkpoint that depends on fake command output should use `pass_with_risks`, carry the limitation forward in `next_action.yaml`, and require real command or review evidence before claiming a production phase is complete.

## Files To Inspect

- `docs/implementation_spec.md`: source requirement text
- `docs/implementation_harness/phase_manifest.yaml`: phase contract
- `.meta-harness/checkpoints/phase_001/slice_plan.yaml`: worker slice boundaries and validation commands
- `.meta-harness/checkpoints/phase_001/subagent_packets/phase_001_slice_001.packet.yaml`: packet returned by the fake worker
- `.meta-harness/checkpoints/phase_001/proof.json`: proof ledger
- `.meta-harness/checkpoints/phase_001/next_action.yaml`: continuation contract
- `.meta-harness/checkpoints/phase_001/artifacts/dispatch_results.json`: raw dispatch artifact

## Readiness Checks

Run `mh doctor --json` in a workspace before dispatching real work. Doctor output includes evidence and remediation for missing initialization, dirty git state, missing schema/policy files, stale builds, adapter registry health, and budget drift.
