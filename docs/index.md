---
layout: home

hero:
  name: Meta Harness
  text: Evidence-gated execution for coding-agent programs.
  tagline: No phase advances without verified evidence.
  image:
    src: /logo.svg
    alt: Meta Harness
  actions:
    - theme: brand
      text: Start The Quickstart
      link: /getting-started
    - theme: alt
      text: Read The Protocol
      link: /protocol
    - theme: alt
      text: Agent Compatibility
      link: /agent-support-matrix

features:
  - title: Phase And Slice Control
    details: Convert broad implementation specs into bounded phases, dependency-ordered slices, and worker packets.
  - title: Proof Before Progress
    details: Track every claim with exact proof status and command, runtime, static, human, or parent evidence.
  - title: Read-Only First Integrations
    details: Keep external systems safe by default with explicit write modes, path containment, and dangerous-operation gates.
  - title: Agent-Portable Context
    details: Use instruction files, MCP, skills, and prompt-file fallback without overclaiming native dispatch support.
---

## Install From Source

Meta Harness is pre-1.0. The source checkout is the supported onboarding path until a maintainer-approved package release.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run ci
pnpm --filter @meta-harness/cli exec mh --help
```

## What To Read Next

- [Install And Quickstart](./getting-started.md) for the smallest useful workflow.
- [Protocol Overview](./protocol.md) for phases, slices, packets, proof, and checkpoints.
- [CLI Reference](./cli-reference.md) for implemented commands and expected outputs.
- [MCP Reference](./mcp-reference.md) for read-only server modes, tools, prompts, and resources.
- [Agent Compatibility](./agent-support-matrix.md) for evidence-backed support by integration surface.
