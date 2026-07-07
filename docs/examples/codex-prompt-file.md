# Codex Prompt-File Flow

Codex support is currently partial and conservative.

Stable use today:

1. Generate `AGENTS.md` and other instruction files with `mh emit-instructions`.
2. Dispatch a slice through the filesystem adapter.
3. Have Codex read the prompt file and produce a packet.
4. Collect and verify the packet with Meta Harness.

```bash
node packages/cli/dist/index.js emit-instructions --target agents
node packages/cli/dist/index.js dispatch --phase phase_001 --agent filesystem
```

Use `--target all` to refresh every host instruction/config surface, including OpenCode and Roo compatibility files, after building the local CLI.

Experimental `codex-experimental` dispatch is feature-gated and disabled by default. Phase 6 verified an npm Codex CLI schema-output smoke with JSONL usage, but the stable Codex flow remains prompt-file fallback until full slice dispatch evidence is reviewed.
