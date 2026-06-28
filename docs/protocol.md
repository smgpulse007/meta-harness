# Protocol

The protocol has five durable artifacts:

- Phase manifest: ordered implementation phases and gates.
- Slice plan: bounded implementation contracts inside a phase.
- Slice packet: worker-produced implementation evidence.
- Proof ledger: machine-readable claims with exact verification status.
- Checkpoint: replayable phase state for a new parent session.

Allowed phase terminal statuses are `complete`, `complete_pending_human_review`, `pass_with_risks`, `blocked`, and `failed`.

Proof statuses are `claimed`, `parent_verified`, `static_verified`, `command_verified`, `runtime_verified`, `human_verified`, `not_verified`, and `partial`.

Required claims cannot be treated as verified when they are only `claimed`, `not_verified`, or `partial`, or when they have no evidence reference.
