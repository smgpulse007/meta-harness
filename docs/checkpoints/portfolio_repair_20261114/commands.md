# Local command evidence

Executed in the isolated repair checkout on Windows with Node 22.16.0 and pnpm 11.7.0, on 2026-11-14. Commands are shown using `pnpm`; the host invoked the pinned version through `npx --yes pnpm@11.7.0`.

| Command                                           | Exit | Observed result                                                                                           |
| ------------------------------------------------- | ---: | --------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile --ignore-scripts` |    0 | All five workspace projects; lockfile up to date                                                          |
| `pnpm run ci`                                     |    0 | Six test files, 44 tests passed; lint, typecheck, schema, build, budget, and integration checks completed |
| `pnpm audit --prod --json`                        |    0 | 94 production dependencies; zero reported findings                                                        |
| `pnpm docs:build`                                 |    0 | Typedoc and VitePress built; existing large-chunk warning retained                                        |
| `pnpm run package:dry-run`                        |    0 | Local package validation completed; no registry publication                                               |
| `python scripts/record_demo.py`                   |    0 | Real built CLI returned zero; generated terminal GIF and source/output hashes                             |

The package script `pnpm demo` builds before running the same `scripts/demo.mjs` walkthrough. The record demonstrates initialization, policy verification, requirement compilation, planning, and plan linting. It does not demonstrate an implemented project or a dispatched coding agent.

The CI integration smoke explicitly reported: `Fake adapter output is not implementation evidence for production use.` Its checkpoint status remained `pass_with_risks`.

The initial source review was not a command run. Parent-run results above resolve its pending validation gates. Hosted PR checks, main checks, and Pages validation remain separate external release evidence.
