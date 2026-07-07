# Checkpoint open_source_readiness_phase_2

Status: blocked

## Summary

Phase 2 added the docs-site foundation:

- Added VitePress and TypeDoc tooling.
- Added `docs:dev`, `docs:api`, `docs:build`, and `docs:preview` scripts.
- Added VitePress config with GitHub Pages base path `/meta-harness/`.
- Added TypeDoc config that generates API Markdown into ignored `docs/api`.
- Added a GitHub Pages workflow with PR docs-build verification and push-only deployment.
- Added public docs pages for home, CLI, MCP, adapters, token budgeting, Azure/enterprise MCP, security, continuation contract, and examples.
- Updated the quickstart to use source-checkout-safe `pnpm --filter @meta-harness/cli exec mh ...` commands.
- Added a README docs-site link.

## Exit Criteria

| Criterion                                  | Status             | Evidence                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| VitePress and TypeDoc docs tooling exists. | `static_verified`  | `package.json`, `typedoc.json`, `tsconfig.typedoc.json`, `docs/.vitepress/config.ts`.                                                                                                                                                                                          |
| `pnpm docs:build` passes.                  | `command_verified` | `docs/checkpoints/open_source_readiness_phase_2/commands.md`.                                                                                                                                                                                                                  |
| Docs site includes the required IA pages.  | `static_verified`  | `docs/index.md`, `docs/getting-started.md`, `docs/cli-reference.md`, `docs/mcp-reference.md`, `docs/adapters.md`, `docs/agent-support-matrix.md`, `docs/token-budgeting.md`, `docs/azure-enterprise.md`, `docs/security.md`, `docs/examples/*.md`, generated `docs/api` route. |
| Pages workflow exists and parses.          | `static_verified`  | `.github/workflows/pages.yml`, workflow YAML parse command.                                                                                                                                                                                                                    |
| Pages workflow is verified remotely.       | `not_verified`     | Requires PR GitHub Actions evidence for Phase 2 branch.                                                                                                                                                                                                                        |

## Reviewer Result

The mandatory reviewer returned:

- `phase_alignment`: `partially_aligned`
- `directional_alignment`: `needs_adjustment`
- `evidence_quality`: `adequate`
- `phase_completion_percent`: 90
- `overall_goal_completion_percent`: 36
- `next_action_recommendation`: `recover`

Reviewer blockers:

- `docs/cli-reference.md` had a malformed Markdown table because the `mh init` row included unescaped pipe characters.
- `pages.yml` was only locally `static_verified`; it needs remote GitHub Actions evidence after push or PR.

## Recovery Resolution

The malformed CLI reference table was fixed, scoped Prettier passed, and `pnpm docs:build` passed after the fix.

The Pages workflow remote verification remains open. The workflow now runs on `pull_request` for docs-build verification and deploys only on non-PR events.

## Blocking Risk

Phase 2 should not be marked complete until GitHub Actions verifies the Docs Pages workflow on the Phase 2 PR branch.

## Required Evidence

- proof.json
- next_action.yaml
- commands.md
- diff_summary.md
- alignment_review.md
- delegation_review.md
- expert_panel.md
- slice_plan.yaml
- subagent_packets/
- artifacts/
