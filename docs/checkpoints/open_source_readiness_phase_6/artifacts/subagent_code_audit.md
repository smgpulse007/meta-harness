# Phase 6 Subagent Code Audit

Subagent: Godel (`019f3b53-3ff7-7150-a045-258537175b63`)

Status: `parent_verified`

## Scope

Read-only analysis of safe native dispatch architecture for Phase 6.

## Key Recommendations

- Add separate `codex-experimental` and `claude-code-experimental` adapter IDs rather than changing stable defaults.
- Require both a CLI flag and an environment variable such as `META_HARNESS_EXPERIMENTAL_NATIVE_DISPATCH=1`.
- Use process execution without shell-built command strings.
- Capture raw native stdout/stderr and write packet artifacts only after schema validation.
- Validate with `SlicePacketSchema` and enforce matching `slice_id`.
- Do not auto-update proof ledgers from native output; parent review must still decide proof status.
- Test valid/invalid parser behavior, wrong slice IDs, extra fields, gate-off behavior, fake local command execution, and nonzero exits.

## Parent Integration

Accepted. Phase 6 implemented separate experimental adapters, dual gates, raw artifact writes, strict packet parsing, stable adapter non-claims, and focused tests.
