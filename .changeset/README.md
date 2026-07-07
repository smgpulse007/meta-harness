# Changesets

Meta Harness uses Changesets for release notes and package version preparation.

Use `pnpm changeset` on PRs that change publishable package behavior. Use `pnpm version-packages` only after maintainer review approves a release-preparation commit.

Do not run `pnpm changeset publish`, `npm publish`, or create a GitHub release without explicit maintainer approval in a separate action.
