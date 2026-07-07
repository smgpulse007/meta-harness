# Phase 7 Diff Summary

## Documentation

- `docs/azure-enterprise.md`: expands Azure/enterprise architecture, source baseline, remote MCP controls, Foundry guidance, Azure MCP Server boundaries, and deployment sketch.
- `docs/examples/enterprise-remote-mcp.md`: adds docs-only remote MCP deployment sketch and validation-without-provisioning checklist.
- `docs/mcp-reference.md`: documents current stdio-only runtime and remote transport readiness requirements.
- `docs/security.md`: adds remote MCP and enterprise controls.
- `docs/examples/mcp-configs/README.md`: links the enterprise remote MCP sketch.
- `docs/.vitepress/config.ts`: adds the new guide to the docs sidebar.
- `docs/research/agent-compatibility-2026-07-07.md`: updates Azure row with Phase 7 docs/design status.
- `docs/research/agent-support-claim-ledger-2026-07-07.md`: adds Phase 7 Azure docs-readiness claim.

## Code

- `packages/cli/src/commands/mcp.ts`: validates MCP mode names before stdio server startup.
- `packages/cli/tests/cli.test.ts`: adds a regression test for unknown MCP mode rejection.

## Checkpoint

- `docs/checkpoints/open_source_readiness_phase_7/`: records Phase 7 proof, source refresh, MCP control matrix, delegation summaries, and pending reviewer status.
