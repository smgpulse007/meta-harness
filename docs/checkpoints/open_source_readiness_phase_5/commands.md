# Phase 5 Command Evidence

All commands were run from `C:\Users\shail\OneDrive\Documents\meta-harness` on branch `open-source-readiness-phase-5` unless noted.

| Command                                                                        | Exit | Evidence excerpt                                                                                                                           |
| ------------------------------------------------------------------------------ | ---: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm --filter @meta-harness/core test`                                        |    0 | 1 test file passed; 9 tests passed.                                                                                                        |
| `pnpm --filter @meta-harness/adapters test`                                    |    0 | 1 test file passed; 3 adapter tests passed.                                                                                                |
| `pnpm --filter @meta-harness/cli test`                                         |    0 | 1 test file passed; 8 tests passed and 1 built-help test skipped/passed depending build state.                                             |
| `pnpm --filter @meta-harness/mcp-server test`                                  |    0 | 1 test file passed; 3 MCP tests passed.                                                                                                    |
| `pnpm schema-check`                                                            |    0 | Validated 13 JSON schemas and 25 artifacts.                                                                                                |
| `node --test tests/math.node-test.mjs` in `examples/command-verified-refactor` |    0 | Node test runner reported 1 passing test and 0 failures.                                                                                   |
| `pnpm run ci`                                                                  |    0 | 5 test files passed; 25 tests passed; schema-check validated 25 artifacts; build, budget, and integration smoke passed.                    |
| `pnpm docs:build`                                                              |    0 | TypeDoc and VitePress build completed with the known non-blocking large-chunk advisory.                                                    |
| `pnpm audit --prod`                                                            |    0 | No known vulnerabilities found.                                                                                                            |
| `node packages/cli/dist/index.js doctor --json --phase phase_001`              |    0 | Structured report returned `status=warning`, 10 checks, 0 errors, 1 warning for dirty worktree, budget check present, remediation present. |
| `pnpm --filter @meta-harness/core pack --dry-run`                              |    0 | Dry-run package contents listed; no `.tgz` remained.                                                                                       |
| `pnpm --filter @meta-harness/adapters pack --dry-run`                          |    0 | Dry-run package contents listed, including `tests/adapters.test.ts`; no `.tgz` remained.                                                   |
| `pnpm --filter @meta-harness/cli pack --dry-run`                               |    0 | Dry-run package contents listed, including structured doctor output declarations; no `.tgz` remained.                                      |
| `pnpm --filter @meta-harness/mcp-server pack --dry-run`                        |    0 | Dry-run package contents listed; no `.tgz` remained.                                                                                       |
| `git diff --check`                                                             |    0 | No whitespace errors.                                                                                                                      |
| Recovery stale-reference search                                                |    0 | `rg -uu` found no stale pre-recovery command or file references after repairing hidden checkpoint artifacts.                               |
| Recovery `node --test tests/math.node-test.mjs`                                |    0 | Command-verified example still reported 1 passing test and 0 failures after artifact repair.                                               |
| Recovery `pnpm schema-check`                                                   |    0 | Validated 13 JSON schemas and 25 artifacts after artifact repair.                                                                          |
| Recovery `node packages/cli/dist/index.js doctor --json --phase phase_001`     |    0 | Structured report still returned 10 checks, 0 errors, budget and remediation present.                                                      |
| Recovery `git diff --check`                                                    |    0 | No whitespace errors after artifact repair.                                                                                                |
| Independent reviewer recheck                                                   |    0 | Reviewer reported aligned, on track, strong evidence, 100 percent phase completion, and no blockers.                                       |

## Remote Baseline

Phase 4 merged as PR #10 at commit `5b3a73600bfd134f06e93dffa6207e6b34ee1b86`. Merge-triggered `main` workflows for CI, CodeQL, Docs Pages build, Package Dry Run, Dependency Audit, Integration Smoke, and Schema Check completed successfully. The Docs Pages deploy job remained skipped and the Pages API returned 404, so live Pages deployment remains externally blocked.
