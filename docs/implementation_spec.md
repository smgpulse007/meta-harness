# Meta Harness Implementation Spec

This repo was built from the Codex handoff request for Meta Harness.

## phase_0: Repo bootstrap

REQ-001 Initialized TypeScript pnpm monorepo, package metadata, lint/test/build tooling, README, and CI skeleton.

## phase_1: Protocol docs and schemas

REQ-002 Added protocol documentation, concept docs, JSON schemas, templates, and schema validation coverage.

## phase_2: Core engine

REQ-003 Implemented state machine, DAG checks, write locks, requirement extraction, proof gates, safety policy, and checkpoint audit/write helpers.

## phase_3: CLI

REQ-004 Implemented mh commands for init, ingest, compile-spec, plan, lint-plan, dispatch, collect, verify, audit-checkpoint, checkpoint, continue, emit-instructions, doctor, and mcp.

## phase_4: MCP server

REQ-005 Implemented read-only-first MCP server tools, resources, prompts, safe IDs, path containment, and write-mode blocking.

## phase_5: Skill and instruction emitters

REQ-006 Added standalone skill package, canonical templates, AGENTS.md, and generated instruction targets for mainstream coding tools.

## phase_6: Adapters

REQ-007 Implemented adapter interface, filesystem adapter, fake adapter, conservative CLI adapter starters, and support matrix.

## phase_7: Examples, audit, and release readiness

REQ-008 Added tiny examples, release checklist, issue/PR templates, local CI proof, and delegated review reconciliation.
