# Phase 8 Release Workflow Review

Workflow: `.github/workflows/release-dry-run.yml`

## Static Review

- Trigger: `workflow_dispatch` only.
- Permissions: `contents: read`.
- Matrix: `ubuntu-latest`, `windows-latest`.
- Setup: checkout with full history, pnpm 11.7.0, Node from `.node-version`.
- Gate: `pnpm install --frozen-lockfile` followed by `pnpm run release:dry-run`.

## Safety Review

The workflow does not request `packages: write`, `contents: write`, `id-token: write`, `pages: write`, deployment permissions, or environment approval. It cannot publish packages or create GitHub releases as written.

## Runtime Review

Hosted workflow runtime proof is pending until the workflow file is merged to the default branch and dispatched.
