# Expert Panel

## Docs Architecture

The VitePress site uses the existing `docs/` tree as the site root and exposes a reader-first IA rather than surfacing checkpoint artifacts as primary navigation.

## Package And Workflow Safety

Docs build is intentionally separate from `pnpm run ci` in Phase 2 to avoid destabilizing the already-green Linux/Windows CI matrix. The Pages workflow verifies docs on pull requests and deploys only for non-PR events.

## API Reference

TypeDoc documents package source entrypoints and writes generated Markdown to ignored `docs/api`. `tsconfig.typedoc.json` maps workspace imports to source indexes so docs generation works from a clean tree without prebuilt `dist`.

## Safety Posture

The docs preserve read-only defaults, write-mode gates, fake-evidence limits, and conservative adapter support claims.
