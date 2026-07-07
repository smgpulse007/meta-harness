# Commands

Record commands only after they actually run.

| Command                                                          | Exit Code | Evidence                                                                                                                           |
| ---------------------------------------------------------------- | --------: | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                 |         0 | Already up to date; no dependency changes.                                                                                         |
| `pnpm run clean`                                                 |         0 | Cleaned package build outputs for core, adapters, mcp-server, and cli.                                                             |
| `pnpm run ci`                                                    |         0 | Post-recovery run passed lint, typecheck/build, Vitest 4 files / 15 tests, schema check, build, and integration smoke.             |
| `pnpm audit --prod`                                              |         0 | No known vulnerabilities found.                                                                                                    |
| `pnpm --filter @meta-harness/core pack --dry-run`                |         0 | Dry-run reported tarball contents; no publish.                                                                                     |
| `pnpm --filter @meta-harness/adapters pack --dry-run`            |         0 | Dry-run reported tarball contents; no publish.                                                                                     |
| `pnpm --filter @meta-harness/cli pack --dry-run`                 |         0 | Dry-run reported tarball contents; no publish.                                                                                     |
| `pnpm --filter @meta-harness/mcp-server pack --dry-run`          |         0 | Dry-run reported tarball contents; no publish.                                                                                     |
| `git diff --check`                                               |         0 | No whitespace errors; Git emitted LF-to-CRLF warning for edited markdown.                                                          |
| `git status --short --branch`                                    |         0 | Branch `main...origin/main`; Phase 0 docs/checkpoint changes plus pre-existing untracked goal prompt.                              |
| `pnpm run format:check`                                          |         1 | Repo-wide Prettier check failed on broad pre-existing formatting issues; not used as a Phase 0 pass claim.                         |
| `pnpm exec prettier --check <Phase 0 docs and checkpoint files>` |         0 | Phase 0 docs and checkpoint artifacts passed scoped Prettier after formatting.                                                     |
| `node --input-type=module -`                                     |         0 | Direct AJV/YAML validation passed for Phase 0 `proof.json`, `next_action.yaml`, `slice_plan.yaml`, and both subagent packet files. |
| `rg -n <invalid planned proof-status pattern>`                   |         1 | No invalid `planned` proof-status occurrences remained; ripgrep exit 1 means no matches.                                           |
| `pnpm docs:build`                                                |   not run | No `docs:build` script exists yet; docs-site tooling is Phase 2 scope.                                                             |
