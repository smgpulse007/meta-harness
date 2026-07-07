# Phase 6 Expert Panel

## Adapter Safety

Recommendation: keep stable adapters conservative and add separate experimental adapter IDs. Require both a CLI flag and an environment variable before launching a native process.

Disposition: accepted. Stable `codex` and `claude-code` adapters still do not launch. Experimental launch requires `--experimental-native` and `META_HARNESS_EXPERIMENTAL_NATIVE_DISPATCH=1`.

## Evidence Semantics

Recommendation: treat Codex/Claude command surfaces, parser tests, and schema validation as dispatch evidence only. Do not convert them into worker implementation proof.

Disposition: accepted. Docs and checkpoint state that native dispatch does not prove worker validation commands unless the returned packet contains reviewed command evidence.

## Claim Hygiene

Recommendation: update the compatibility matrix and claim ledger only with evidence that actually ran locally.

Disposition: accepted. Codex npm CLI smoke is `command_verified`; WindowsApps Codex is blocked; Claude npx help/version is `command_verified`; Claude auth-backed packet handoff remains `not_verified`.

## Continuation

Recommendation: do not start Phase 7 until the independent review returns aligned direction, adequate or strong evidence, and no blocking recovery slices.

Disposition: accepted in draft checkpoint; final transition is blocked until reviewer artifact is recorded.
