# Phase 8 Package File Policy

Each publishable package declares:

```json
"files": ["dist", "README.md", "LICENSE"]
```

Verified packages:

- `@meta-harness/core`
- `@meta-harness/adapters`
- `@meta-harness/cli`
- `@meta-harness/mcp-server`

`pnpm run package:dry-run` completed with package contents limited to:

- compiled `dist` JavaScript and declarations
- `README.md`
- `LICENSE`
- npm-required `package.json`

The dry-run output did not list source files, tests, checkpoint bundles, docs-site output, raw logs, or generated docs. The script asserts that no root `meta-harness-*.tgz` artifacts remain after the dry-run.
