# Phase 6 Diff Summary

## Code

- `packages/adapters/src/native-dispatch.ts`: new experimental native adapter implementation, command builders, parsers, schema builder, raw artifact writes, packet validation, and registry entries.
- `packages/adapters/src/cli-adapter.ts`: exports `findCommand` for shared command detection.
- `packages/adapters/src/index.ts`: exports native dispatch utilities and registers `codex-experimental` and `claude-code-experimental`.
- `packages/adapters/src/types.ts`: adds `experimentalNative` to dispatch input.
- `packages/adapters/tests/adapters.test.ts`: expands adapter coverage to 10 tests for stable non-claims and experimental native behavior.
- `packages/cli/src/commands/dispatch.ts`: passes the experimental flag into adapter dispatch.
- `packages/cli/src/index.ts`: adds `--experimental-native`.
- `packages/cli/src/commands/context-pack.ts`: keeps Codex guidance on stable prompt/MCP fallback with experimental native dispatch separated.

## Documentation And Claims

- `docs/adapters.md`: documents experimental adapter IDs, gates, artifact behavior, and current command evidence.
- `docs/agent-support-matrix.md`: separates stable adapters from Tier 3 experimental native targets.
- `docs/cli-reference.md`: documents `mh dispatch --experimental-native` and current limitations.
- `docs/examples/codex-prompt-file.md` and `docs/examples/context-packs/*.md`: regenerate or update examples to keep stable prompt-file fallback visible.
- `docs/research/agent-compatibility-2026-07-07.md`: updates compatibility research with Phase 6 local evidence.
- `docs/research/agent-support-claim-ledger-2026-07-07.md`: records Codex and Claude command evidence without upgrading stable support claims.

## Checkpoint

- `docs/checkpoints/open_source_readiness_phase_6/`: records Phase 6 evidence, proof, continuation, delegation summaries, and pending reviewer status.
