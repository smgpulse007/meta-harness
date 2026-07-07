# GitHub Actions PR #1 Remote Evidence

Generated: 2026-07-06T23:08:30-04:00

PR: https://github.com/smgpulse007/meta-harness/pull/1

Final verified head: `7fafee7738bc7dca077384d1cfb1de6896cc61ae`

## Final Check Rollup

Command:

```bash
gh pr checks 1 --repo smgpulse007/meta-harness --watch --interval 10
```

Exit code: 0

| Check                             | Status | Duration | Evidence URL                                                                         |
| --------------------------------- | ------ | -------: | ------------------------------------------------------------------------------------ |
| Analyze JavaScript and TypeScript | pass   |     3m1s | https://github.com/smgpulse007/meta-harness/actions/runs/28838494479/job/85527237108 |
| CI (ubuntu-latest)                | pass   |      55s | https://github.com/smgpulse007/meta-harness/actions/runs/28838494466/job/85527237059 |
| CI (windows-latest)               | pass   |    1m36s | https://github.com/smgpulse007/meta-harness/actions/runs/28838494466/job/85527237071 |
| Package dry-run (ubuntu-latest)   | pass   |      37s | https://github.com/smgpulse007/meta-harness/actions/runs/28838494458/job/85527237032 |
| Package dry-run (windows-latest)  | pass   |    1m17s | https://github.com/smgpulse007/meta-harness/actions/runs/28838494458/job/85527237021 |
| dependency-audit                  | pass   |      19s | https://github.com/smgpulse007/meta-harness/actions/runs/28838494460/job/85527237053 |
| integration-smoke                 | pass   |      34s | https://github.com/smgpulse007/meta-harness/actions/runs/28838494471/job/85527237051 |
| schema-check                      | pass   |      20s | https://github.com/smgpulse007/meta-harness/actions/runs/28838494501/job/85527237266 |

## Recovery Trail

- Initial PR head `4d330b1` failed CodeQL because code scanning is not enabled for this repository.
- Recovery head `5742496` set `github/codeql-action/analyze@v3` input `upload: never`, but CodeQL still failed because the workflow lacked `actions: read` permission for workflow-run metadata access.
- Final head `7fafee7` keeps `upload: never`, restores `actions: read`, and passes all PR checks.

## Local Recovery Checks

These commands passed before the final recovery commit:

```bash
pnpm exec prettier --check --ignore-unknown .github/workflows/codeql.yml
node -e "const fs=require('fs'); const yaml=require('yaml'); yaml.parse(fs.readFileSync('.github/workflows/codeql.yml','utf8')); console.log('yaml parse ok')"
git diff --check
```

`git diff --check` reported no whitespace errors; Git emitted LF-to-CRLF warnings only.
