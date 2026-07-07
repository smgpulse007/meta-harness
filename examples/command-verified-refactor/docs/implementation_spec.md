# Command-Verified Refactor Spec

## REQ-001 Add Safe Addition

The calculator module must export `add(a, b)` and return the numeric sum.

Acceptance criteria:

- `add(2, 3)` returns `5`.
- The implementation is covered by a local command that exits with code `0`.
