# Tiny TypeScript Refactor

This example demonstrates Meta Harness with the fake adapter.

Flow:

```bash
mh init --profile strict
mh compile-spec --spec docs/implementation_spec.md --phase phase_001
mh plan --phase phase_001
mh lint-plan --phase phase_001
mh dispatch --phase phase_001 --agent fake
mh checkpoint --phase phase_001 --status pass_with_risks
mh audit-checkpoint --phase phase_001
```

The checked-in `.meta-harness/checkpoints/phase_001` folder shows the expected artifact shape.
