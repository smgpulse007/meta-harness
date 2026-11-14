# Reproducible onboarding and dependency repair

Status: local implementation and validation complete; GitHub PR checks and the subsequent Pages deployment are release gates, not claimed outcomes in this checkpoint.

This bounded slice follows the completed open-source readiness work. Historical checkpoints remain unchanged. The maintainer authorized reviewed OSS changes and the existing Pages deployment.

## Changes

- Remove the no-op initialization profiles. Unsupported options fail before workspace writes, including direct JavaScript callers. Preserve the default read-only policy.
- Provide `pnpm demo`: build the real CLI, initialize a disposable synthetic workspace, verify the read-only posture, empty operation allowlist, and authorization/audit flags, compile requirements, plan, and lint. The script cleans up only its own temporary directory. Its actual output supplies the README GIF.
- Explain how to initialize a separate target project without overwriting this repository's tracked harness state.
- Refresh production dependencies, migrate the exported schemas to Zod 4, and apply a compatible patched `fast-uri` floor. Record the public schema-type change as a pre-1.0 minor change.
- Make MCP template discovery match the renderable templates. Exercise defaulted values, scalar record validation, and read-only writes through a real in-memory MCP client/server connection.

- Bound and pattern-redact persisted MCP command evidence and packet command excerpts; redact the CLI command field too. Reject oversized inputs before writing.
- Distinguish missing state from corrupt or unreadable state, validate harness state shape, and avoid echoing malformed file contents in errors.

## Verified evidence

The baseline had 33 passing tests. `init --profile` changed only the success message. A production registry audit reported 48 findings: 4 low, 29 moderate, 14 high, and 1 critical.

The final frozen install and local CI passed, with **44 tests**. CI includes lint, typechecking, builds, schema checks, budget checks, and the existing integration smoke. The production audit reports **zero findings**. The documentation build, package dry run, and real disposable walkthrough passed. See [command evidence](commands.md), [proof ledger](proof.json), and [recording provenance](../../demo-recording.json).

The independent source review's implementation concerns were addressed with option guards, empty-directory assertions, a build-first demo, complete policy assertions, template consistency, and Zod default regressions. Its pending CI gate was then completed. Review evidence is in [the disposition](artifacts/review-disposition.md).

## Limits and release gates

The integration smoke deliberately uses a fake adapter and reports `pass_with_risks`; it is protocol simulation evidence, not native-agent implementation proof. The walkthrough stops at a validated plan. No package release or native-agent execution is part of this slice.

`doctor` already emits JSON regardless of its `--json` flag. That pre-existing presentation issue remains a future cleanup; this repair changes only its obsolete initialization advice.

The audit is a point-in-time registry result, not an exploitability assessment or security guarantee. The VitePress build retains an existing bundle-size warning.

All workflow triggers were inspected before publication. PR workflows build/test/scan/package locally and may upload the existing Pages build artifact; they do not deploy Pages or publish packages. The existing Pages deployment runs after a main-branch merge. Verify PR CI before merging, then verify main checks and the live Pages assets before reporting deployment health.
