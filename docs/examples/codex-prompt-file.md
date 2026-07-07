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

Native `codex exec` dispatch remains planned until local command evidence proves JSON event capture, packet schema enforcement, sandbox and approval settings, and token usage capture.
