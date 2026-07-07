# Context Pack Samples

These files are generated with `node packages/cli/dist/index.js context-pack` and are committed as deterministic examples.

- `codex-worker.md`: Codex worker slice pack.
- `claude-reviewer.md`: Claude Code reviewer pack.
- `generic-filesystem.md`: generic filesystem fallback worker pack.
- `generic-parent.md`: parent coordinator phase pack.
- `budget-report.sample.json`: sample `mh budget --json` output.

Context packs include bounded source excerpts and artifact paths. They do not include raw command logs, generated `dist`, package lockfiles, secrets, or full checkpoint history.
