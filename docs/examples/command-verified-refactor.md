# Command-Verified Refactor

`examples/command-verified-refactor` is a tiny local workflow whose proof comes from a real command:

```bash
cd examples/command-verified-refactor
node --test tests/math.node-test.mjs
```

The example checkpoint records the command as `evidence_kind: command`, stores a bounded evidence excerpt, and marks the required proof claim `command_verified`.

Inspect these files:

- `examples/command-verified-refactor/docs/implementation_spec.md`
- `examples/command-verified-refactor/docs/implementation_harness/phase_manifest.yaml`
- `examples/command-verified-refactor/.meta-harness/checkpoints/phase_001/slice_plan.yaml`
- `examples/command-verified-refactor/.meta-harness/checkpoints/phase_001/subagent_packets/phase_001_slice_001.packet.yaml`
- `examples/command-verified-refactor/.meta-harness/checkpoints/phase_001/artifacts/node-test.excerpt.json`
- `examples/command-verified-refactor/.meta-harness/checkpoints/phase_001/proof.json`
- `examples/command-verified-refactor/.meta-harness/checkpoints/phase_001/next_action.yaml`

This is the production-proof pattern to copy. The fake-adapter examples remain useful for protocol mechanics, but simulation evidence must not close a production phase as `complete`.
