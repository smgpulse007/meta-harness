# Release Checklist

Meta Harness release preparation is allowed. Publishing is not allowed without explicit maintainer authorization.

## Required Before Release

- `pnpm install --frozen-lockfile`
- `pnpm run release:dry-run`
- Manual GitHub Actions `Release Dry Run` workflow, if the maintainer wants hosted evidence before versioning

## Metadata

- README, LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, changelog, and release plan exist.
- Package metadata includes name, version, license, description, repository, bugs, homepage, files, exports, and publish config.
- Root package remains `private: true` to reduce accidental publish risk.
- Each publishable package has an explicit `files` allowlist.
- Each publishable package includes package-local README and LICENSE files.
- Package dry-runs show no source files, tests, checkpoint bundles, docs-site output, or raw logs in package contents.
- `pnpm run package:dry-run` removes transient `meta-harness-*.tgz` artifacts and fails if any remain in the repository root.

## Versioning

- A Changesets entry exists for every publishable package behavior change.
- `pnpm run changeset:status` exits 0 before release preparation.
- `pnpm run version-packages` is reviewed as a release-preparation commit before any publish step.

## Security

- No secrets, account identifiers, or private tokens in generated artifacts.
- MCP defaults to read-only.
- Dangerous operations remain blocked by default.
- Fake adapter evidence is marked as simulation and cannot satisfy `complete` checkpoint command evidence.

## Human Approval

Publishing, registry writes, GitHub releases, package provenance upload, marketplace submissions, repository visibility changes, and deployment mutations require explicit human approval in a separate action.
