# Checkpoint open_source_readiness_phase_2

Status: complete

## Summary

Phase 2 added the docs-site foundation:

- Added VitePress and TypeDoc tooling.
- Added `docs:dev`, `docs:api`, `docs:build`, and `docs:preview` scripts.
- Added VitePress config with GitHub Pages base path `/meta-harness/`.
- Added TypeDoc config that generates API Markdown into ignored `docs/api`.
- Added a GitHub Pages workflow with PR and push docs-build verification plus Pages-enabled-only deployment.
- Added public docs pages for home, CLI, MCP, adapters, token budgeting, Azure/enterprise MCP, security, continuation contract, and examples.
- Updated the quickstart to use source-checkout-safe `pnpm --filter @meta-harness/cli exec mh ...` commands.
- Added a README docs-site link.

## Exit Criteria

| Criterion                                  | Status             | Evidence                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| VitePress and TypeDoc docs tooling exists. | `static_verified`  | `package.json`, `typedoc.json`, `tsconfig.typedoc.json`, `docs/.vitepress/config.ts`.                                                                                                                                                                                          |
| `pnpm docs:build` passes.                  | `command_verified` | `docs/checkpoints/open_source_readiness_phase_2/commands.md`.                                                                                                                                                                                                                  |
| Docs site includes the required IA pages.  | `static_verified`  | `docs/index.md`, `docs/getting-started.md`, `docs/cli-reference.md`, `docs/mcp-reference.md`, `docs/adapters.md`, `docs/agent-support-matrix.md`, `docs/token-budgeting.md`, `docs/azure-enterprise.md`, `docs/security.md`, `docs/examples/*.md`, generated `docs/api` route. |
| Pages workflow exists and parses.          | `command_verified` | `.github/workflows/pages.yml`, workflow YAML parse command, PR #7 Docs Pages run, and main-branch Pages-disabled recovery evidence.                                                                                                                                            |
| Pages build path is verified remotely.     | `command_verified` | PR #7 head `16080d8882dec66b6c0d35962030236ce7cb8773` passed the Docs Pages `Build docs` job. Main merge commit `3169d29eca4ef6489ca8a9cf817771dad8cb9788` verified that actual deploy needs repository Pages enabled first.                                                   |

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

The Pages workflow remote verification is closed for docs-build behavior. The workflow runs on `pull_request` and `push` for docs-build verification. It now configures and deploys Pages only when `github.event.repository.has_pages == true`.

PR #7 passed `Build docs`; `Deploy docs` skipped as expected on the pull request. After merge, the `main` Docs Pages run failed because repository Pages is not enabled and `configure-pages` could not create the Pages site from `GITHUB_TOKEN`. Recovery gated configure/deploy on the repository Pages state instead of mutating repository settings from CI. Actual Pages deployment remains `partial` until Pages is enabled in repository settings and a `main` run deploys successfully.

## Blocking Risk

None for Phase 2 docs build readiness. Actual Pages deployment remains a non-code repository settings follow-up because this private repository does not currently have Pages enabled.

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
