# Contributing

Meta Harness is built around one rule: no phase advances without verified evidence.

## Development

```bash
pnpm install
pnpm ci
```

Use focused changes, include tests for behavior changes, and update schemas or docs when you change protocol files.

## Pull Requests

- Explain the harness behavior changed.
- Include validation commands and outputs.
- Do not include secrets, account identifiers, or generated proof that was not actually verified.
- Do not add package publishing, git push automation, production mutations, or external write operations without an explicit maintainer-approved design.

## Release Policy

This repository prepares release artifacts but does not publish automatically. Publishing requires explicit maintainer authorization.
