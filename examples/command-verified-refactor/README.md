# Command-Verified Refactor Example

This example shows a tiny local workflow where implementation proof comes from a real command, not the fake adapter.

Run from this directory:

```bash
node --test tests/math.node-test.mjs
```

The checkpoint under `.meta-harness/checkpoints/phase_001` records:

- a bounded slice plan
- a worker packet with `evidence_kind: command`
- `proof.json` with a `command_verified` required claim
- `commands.md` and an evidence excerpt artifact
- `next_action.yaml` showing the phase can close without relying on simulation evidence

Use the fake adapter examples for harness mechanics. Use this example for command-evidence shape.
