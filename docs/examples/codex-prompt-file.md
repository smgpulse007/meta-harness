# Codex Prompt-File Flow

Codex support is currently partial and conservative.

Stable use today:

1. Generate `AGENTS.md` and other instruction files with `mh emit-instructions`.
2. Dispatch a slice through the filesystem adapter.
3. Have Codex read the prompt file and produce a packet.
4. Collect and verify the packet with Meta Harness.

```bash
pnpm --filter @meta-harness/cli exec mh emit-instructions --target AGENTS
pnpm --filter @meta-harness/cli exec mh dispatch --phase phase_001 --agent filesystem
```

Native `codex exec` dispatch remains planned until local command evidence proves JSON event capture, packet schema enforcement, sandbox and approval settings, and token usage capture.
