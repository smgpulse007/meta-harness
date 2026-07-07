# Release Plan

## 0.1.0 Readiness

- Repository metadata: README, license, contributing guide, code of conduct, security policy.
- Protocol docs: concepts, threat model, support matrix, release checklist.
- Schemas and templates.
- Core engine, CLI, adapters, MCP server, skill package.
- Tests and CI skeleton.
- Tiny examples with fake-adapter workflow.

## Before Publishing

- Run full CI locally.
- Review package metadata.
- Review threat model and security tests.
- Confirm no secrets or account identifiers appear in artifacts.
- Confirm maintainers explicitly approve publishing.
- Complete `docs/release-checklist.md`.

This repository prepares release artifacts but does not publish automatically.

## Version Workflow

Meta Harness uses Changesets for release-note and version preparation.

Use these commands only for preparation:

```bash
pnpm changeset
pnpm run changeset:status
pnpm run version-packages
```

`pnpm run version-packages` updates package versions and changelog material locally. It does not publish. Do not run `changeset publish`, `npm publish`, or create a GitHub release without explicit maintainer approval in a separate action.

The four publishable packages are linked in Changesets so `@meta-harness/core`, `@meta-harness/adapters`, `@meta-harness/cli`, and `@meta-harness/mcp-server` stay on the same release line.

## Dry-Run Gate

Maintainers can verify release readiness locally with:

```bash
pnpm install --frozen-lockfile
pnpm run release:dry-run
```

The same gate is available in GitHub Actions as the manually dispatched `Release Dry Run` workflow. The workflow uses read-only repository permissions and does not request package, release, provenance, or `id-token` write permissions.

The dry-run gate runs:

- clean
- CI
- docs build
- production dependency audit
- package dry-runs for all publishable packages
- Changesets status

`pnpm run package:dry-run` cleans generated `meta-harness-*.tgz` artifacts after each dry-run and fails if any tarball remains in the repository root.

## Package File Policy

The root package remains private and is not publishable.

Each publishable package includes only:

- compiled `dist` output, including JavaScript and type declarations
- package-local `README.md`
- package-local `LICENSE`
- npm-required package metadata

Source files, tests, checkpoint bundles, docs-site output, raw logs, local build caches, and generated tarballs are intentionally excluded from package allowlists. Dry-run tarballs are transient verification artifacts and must not remain in the worktree.
