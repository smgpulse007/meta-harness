# GitHub Actions PR #7 Remote Evidence

Generated: 2026-07-06T23:46:00-04:00

PR: https://github.com/smgpulse007/meta-harness/pull/7

Verified head: `0b9c4feb1211acd317fd1a19b4aa0632ba976bd5`

## Final Check Rollup

Command:

```bash
gh pr checks 7 --repo smgpulse007/meta-harness --watch --interval 10
```

Exit code: 0

| Check                             | Status  | Duration | Evidence URL                                                                         |
| --------------------------------- | ------- | -------: | ------------------------------------------------------------------------------------ |
| Build docs                        | pass    |      45s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818287/job/85531319466 |
| Deploy docs                       | skipped |       0s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818287/job/85531403321 |
| Analyze JavaScript and TypeScript | pass    |    3m19s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818300/job/85531319381 |
| CI (ubuntu-latest)                | pass    |     1m2s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818295/job/85531319435 |
| CI (windows-latest)               | pass    |     2m0s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818295/job/85531319429 |
| Package dry-run (ubuntu-latest)   | pass    |      37s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818305/job/85531319398 |
| Package dry-run (windows-latest)  | pass    |    1m11s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818305/job/85531319399 |
| dependency-audit                  | pass    |      22s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818275/job/85531319411 |
| integration-smoke                 | pass    |      32s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818304/job/85531319337 |
| schema-check                      | pass    |      24s | https://github.com/smgpulse007/meta-harness/actions/runs/28839818313/job/85531319484 |

## Recovery Trail

- Initial Docs Pages PR run failed because `actions/configure-pages@v5` tried to read repository Pages configuration on a pull request, but Pages was not yet enabled.
- Recovery changed the workflow so pull requests build docs without configuring Pages, while deployment remains limited to non-PR events.
- The recovered PR run passed the Docs Pages `Build docs` job. `Deploy docs` correctly skipped on the pull request.
