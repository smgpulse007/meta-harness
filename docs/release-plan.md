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
