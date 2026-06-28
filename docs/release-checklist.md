# Release Checklist

Meta Harness release preparation is allowed. Publishing is not allowed without explicit maintainer authorization.

## Required Before Release

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm schema-check`
- `pnpm integration-smoke`
- `pnpm build`
- `pnpm pack --dry-run` for each publishable package

## Metadata

- README, LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, changelog, and release plan exist.
- Package metadata includes name, version, license, description, repository, bugs, homepage, files, exports, and publish config.
- Root package remains `private: true` to reduce accidental publish risk.

## Security

- No secrets, account identifiers, or private tokens in generated artifacts.
- MCP defaults to read-only.
- Dangerous operations remain blocked by default.
- Fake adapter evidence is marked as simulation and cannot satisfy `complete` checkpoint command evidence.

## Human Approval

Publishing, Git push, registry writes, GitHub releases, and marketplace submissions require explicit human approval in a separate action.
