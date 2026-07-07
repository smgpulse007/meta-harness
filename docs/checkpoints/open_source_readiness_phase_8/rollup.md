# Phase 8 Rollup

Phase 8 made release readiness concrete without publishing:

- Changesets now handles release-note and version preparation.
- `pnpm run release:dry-run` runs clean, CI, docs build, production audit, package dry-runs, and Changesets status.
- The manual `Release Dry Run` workflow can run the same gate on GitHub Actions after merge.
- Each publishable package has an explicit allowlist for `dist`, `README.md`, and `LICENSE`.
- Package dry-runs are artifact-safe and leave no root `meta-harness-*.tgz` files behind.

No package was published and no GitHub release was created.

The remaining overall-goal blocker is GitHub Pages accessibility: GitHub rejected Pages enablement for this private repository plan with HTTP 422.
