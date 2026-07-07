# Open Source Readiness Phase 8 Checkpoint

Status: `complete`

Phase 8 adds release-readiness tooling without publishing packages or creating releases. The work adds Changesets, a manual release dry-run workflow, explicit package file allowlists, package-local README/LICENSE files, and an artifact-safe package dry-run script.

## Exit Criteria

| Criterion                                                                 | Status             | Evidence                                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Maintainer can run one documented command/workflow to verify readiness.   | `command_verified` | `pnpm run release:dry-run` exits 0 locally; `.github/workflows/release-dry-run.yml` adds a manual read-only hosted workflow.                             |
| Release checklist maps to automated gates and manual approvals.           | `static_verified`  | `docs/release-plan.md` and `docs/release-checklist.md` document Changesets, dry-run gates, package file policy, and approval-only publish/release steps. |
| Package file inclusion policy is explicit and verified by dry-run output. | `command_verified` | Package `files` allowlists include only `dist`, README, and LICENSE; package dry-runs contain no source, tests, docs-site output, or checkpoints.        |
| Version workflow exists without publishing.                               | `command_verified` | Changesets config and Phase 8 changeset exist; `pnpm run changeset:status` exits 0 and lists all four publishable packages for patch bump.               |
| No publish or release side effect occurred.                               | `parent_verified`  | No `npm publish`, `changeset publish`, GitHub release creation, package provenance upload, or registry write command was run.                            |

## Implementation Summary

- Added `.changeset/config.json`, `.changeset/README.md`, and a Phase 8 changeset for the four publishable packages.
- Added `pnpm run release:dry-run`, `pnpm run package:dry-run`, `pnpm run changeset:status`, and related release-preparation scripts.
- Added `scripts/package-dry-run.ts` to run all package dry-runs and assert no root `meta-harness-*.tgz` artifacts remain.
- Added `.github/workflows/release-dry-run.yml` as a manual workflow with read-only repository permissions.
- Simplified the existing package dry-run workflow to use the shared package dry-run script.
- Added package-local README and LICENSE files.
- Added explicit package `files` allowlists for `@meta-harness/core`, `@meta-harness/adapters`, `@meta-harness/cli`, and `@meta-harness/mcp-server`.
- Updated release documentation and README release pointer.

## Known Limits

- The new manual `Release Dry Run` workflow cannot be dispatch-proven until the workflow file exists on the default branch after merge.
- No package versions were bumped with `pnpm run version-packages`; that remains a maintainer-reviewed release-preparation action.
- No package was published and no GitHub release was created.
- GitHub Pages remains inaccessible for the current private repository plan. `gh api -X POST repos/smgpulse007/meta-harness/pages -f build_type=workflow` returned HTTP 422: `Your current plan does not support GitHub Pages for this repository.`

## Independent Review

Independent reviewer Boyle recorded `aligned` phase alignment, `on_track` directional alignment, `adequate` evidence quality, no Phase 8 blockers, no recovery slices, and `continue` recommendation in `artifacts/final_reviewer.md`.

## Continuation

After PR merge, dispatch the manual `Release Dry Run` workflow on `main`, monitor all `main` workflows, and continue to final open-source readiness closeout.
