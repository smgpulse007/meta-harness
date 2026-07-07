# Continuation Contract

`next_action.yaml` is the machine-readable continuation source of truth.

A parent coordinator must read it before deciding whether to continue, recover, stop for human review, or start the next phase.

## Required Fields

Typical continuation data includes:

- current phase id
- current phase status
- next phase id
- human acceptance requirement and state
- required files to read
- carry-forward risks
- blocking risks
- validation preface
- allowed next transition

## Review Boundary

If `human_acceptance_required` is true and acceptance is absent, the next coordinator must stop at the review boundary. If `blocking_risks` is nonempty, the next coordinator should resolve or explicitly carry those blockers before advancing.
