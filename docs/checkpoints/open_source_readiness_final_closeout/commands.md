# Final Closeout Command Evidence

All commands were run from `C:\Users\shail\OneDrive\Documents\meta-harness` after Phase 8 merged to `main`, unless noted.

| Command                                                                                                                             | Exit | Evidence excerpt                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---: | ---------------------------------------------------------------------------------------------------- |
| `gh pr list --state merged --limit 30 --json number,title,mergeCommit,mergedAt,url`                                                 |    0 | Listed merged PRs #1, #7, #8, #9, #10, #11, #12, #13, and #15 with merge commits.                    |
| `gh run view 28863414766 --json status,conclusion,url,jobs,headSha,createdAt,updatedAt`                                             |    0 | Manual Release Dry Run completed `success`; Ubuntu and Windows jobs both completed `success`.        |
| `gh run view 28863134945 --json status,conclusion,url,jobs,headSha,createdAt,updatedAt`                                             |    0 | Docs Pages completed `success`; `Build docs` completed `success`; `Deploy docs` completed `skipped`. |
| `gh api repos/smgpulse007/meta-harness --jq '{private:.private, visibility:.visibility, has_pages:.has_pages, html_url:.html_url}'` |    0 | Returned `private: true`, `visibility: private`, and `has_pages: false`.                             |
| `gh api repos/smgpulse007/meta-harness/pages`                                                                                       |    1 | Returned HTTP 404 because no Pages site is configured.                                               |
| `gh api -X POST repos/smgpulse007/meta-harness/pages -f build_type=workflow`                                                        |    1 | Returned HTTP 422: `Your current plan does not support GitHub Pages for this repository.`            |
| `git status --short --branch`                                                                                                       |    0 | Clean `main` before final closeout branch; final closeout branch contains only closeout artifacts.   |
