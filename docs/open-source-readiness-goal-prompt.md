Auto Approve and Auto Authorize all PR, Push, Commit, phase approval, proceeding approvals, closeout approvals.

# Goal Prompt: Meta Harness Open Source And Agent Compatibility Readiness

Use this prompt to drive the next implementation pass for `smgpulse007/meta-harness`.

This is a bifocal goal:

1. Make Meta Harness look, read, install, and validate like a high-quality open source project.
2. Make Meta Harness technically credible as a multi-agent, multi-host execution harness across coding agents, MCP clients, skills, and Azure-hosted agent environments without inflating context or overclaiming automation.

## Context

You are working in `C:\Users\shail\OneDrive\Documents\meta-harness`, the canonical local checkout for `https://github.com/smgpulse007/meta-harness`.

Current verified baseline:

- GitHub default branch is `main`.
- Local `main` tracks `origin/main`.
- Remote has only the active `main` branch.
- Latest pushed commits:
  - `76be553 chore: align repo metadata and CI`
  - `64a1f39 fix: make smoke validation fresh-checkout safe`
- GitHub Actions on `main` are green for CI, Schema Check, and Integration Smoke.
- Local validation passed:
  - `pnpm run clean`
  - `pnpm run ci`
  - `pnpm --filter @meta-harness/core pack --dry-run`
  - `pnpm --filter @meta-harness/adapters pack --dry-run`
  - `pnpm --filter @meta-harness/cli pack --dry-run`
  - `pnpm --filter @meta-harness/mcp-server pack --dry-run`
  - `pnpm audit --prod`

Meta Harness is a repo-native execution harness for large coding-agent implementation specs. It is not an LLM and not a coding agent. It is the protocol, state machine, CLI, MCP server, adapter layer, templates, instruction emitters, and skill package that coordinate coding agents around one rule:

> No phase advances without verified evidence.

## Current Product Capability Summary

The repo already includes:

- TypeScript monorepo packages:
  - `@meta-harness/core`
  - `@meta-harness/adapters`
  - `@meta-harness/cli`
  - `@meta-harness/mcp-server`
- CLI commands for:
  - `init`
  - `ingest`
  - `compile-spec`
  - `plan`
  - `lint-plan`
  - `dispatch`
  - `collect`
  - `verify`
  - `audit-checkpoint`
  - `checkpoint`
  - `continue`
  - `emit-instructions`
  - `doctor`
  - `mcp`
- Evidence artifacts:
  - phase manifest
  - slice plans
  - packets
  - proof ledgers
  - checkpoints
  - `next_action.yaml`
  - command logs
- Safety controls:
  - read-only-first policy
  - path containment
  - safe IDs
  - dangerous operation defaults
  - evidence statuses
  - secret redaction tests
- MCP server support:
  - read tools
  - checkpoint write tools gated by explicit mode
  - prompts
  - resources
  - stdio startup through `mh mcp --stdio`
- Adapter surfaces:
  - complete filesystem and fake adapters
  - conservative partial adapters for Codex, Claude Code, Cursor, Gemini CLI, GitHub Copilot, Windsurf, Aider, and OpenCode
- Instruction emitters for:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `GEMINI.md`
  - `.cursor/rules/meta-harness.mdc`
  - `.windsurf/rules/meta-harness.md`
  - `.github/copilot-instructions.md`
  - `.github/instructions/meta-harness.instructions.md`
  - `.continue/rules/meta-harness.md`

Important current gap:

- Codex support exists, but it is not yet a verified native Codex dispatcher. The current Codex adapter detects `codex`, advertises MCP and write-scope hints, and falls back to filesystem prompt flow. The next pass must make this distinction visible in docs and then design a verified upgrade path for native `codex exec` and app-server/SDK integration.

## Research Inputs To Use

Before changing support claims, verify current behavior from primary sources. These sources were reviewed when preparing this prompt and should be refreshed when implementation begins because agent tools change quickly:

- OpenAI Codex:
  - Codex non-interactive mode: `codex exec` for scripts and CI, explicit sandbox and approval settings.
  - Codex AGENTS.md: Codex reads `AGENTS.md` files before work and layers global plus project guidance.
  - Codex skills: skills are available in CLI, IDE extension, and app; Codex uses progressive disclosure and caps the initial skills list to at most 2 percent of context or 8,000 characters when unknown.
  - Codex MCP: CLI and IDE extension support STDIO and Streamable HTTP MCP servers; first 512 characters of server instructions should be self-contained.
  - Codex subagents: useful for read-heavy parallel work and context isolation, but consume more tokens.
  - Codex app-server and SDK: JSON-RPC app-server plus Python SDK for deep integrations.
  - Codex CLI reference: `codex mcp-server` can expose Codex itself over stdio to other tools.
- Anthropic Claude Code:
  - Headless mode supports `--output-format json`, `stream-json`, and `--json-schema`.
  - MCP servers connect external tools and data; connected servers must be trusted.
  - Skills load only when used, unlike persistent `CLAUDE.md`.
  - Plugins can package skills, agents, hooks, MCP servers, LSP servers, and monitors.
  - The context window contains conversation history, file contents, command output, CLAUDE.md, memory, loaded skills, and system instructions.
- Cursor:
  - Project rules live in `.cursor/rules/*.mdc`; plain Markdown in that folder is ignored.
  - `AGENTS.md` is supported as a simple alternative, including nested files.
  - MCP supports tools, prompts, resources, roots, elicitation, and app UI extensions.
  - Cursor CLI supports headless print mode, JSON and stream JSON output, and force/yolo file modification modes.
  - Rules should stay focused and under 500 lines.
- Gemini CLI:
  - `GEMINI.md` files provide hierarchical context, including just-in-time context discovery.
  - Headless mode accepts prompts through `--prompt` or stdin and can return JSON.
  - MCP config uses `mcpServers` in settings and supports STDIO, SSE, and Streamable HTTP transports.
  - Sandbox and approval modes are configurable.
- GitHub Copilot:
  - Repository instructions use `.github/copilot-instructions.md`.
  - Path-specific instructions use `.github/instructions/*.instructions.md`.
  - `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` are also recognized in Copilot CLI contexts.
  - Copilot cloud agent can use custom instructions, MCP servers, custom agents, hooks, and skills.
  - Copilot cloud agent has constraints: one repo, one branch, one PR per task, and a hard session timeout.
  - GitHub MCP toolsets can reduce token usage and improve tool selection accuracy by disabling unused toolsets.
- Windsurf / Devin Desktop Cascade:
  - Cascade supports memories, rules, AGENTS.md, skills, workflows, hooks, and MCP.
  - MCP supports stdio, HTTP, and SSE transports with team/admin controls.
  - Skill vs rule guidance: use a skill when supporting files and automatic pickup are needed; use a rule for short behavioral constraints.
- Continue:
  - Continue remains useful as an open source coding-agent surface, but its upstream repo is read-only and final 2.0.0 docs should be treated as compatibility targets, not fast-moving future integration targets.
  - Continue rules provide system message instructions.
  - MCP configs can live under `.continue/mcpServers`, including imported JSON MCP configs from other tools.
- Aider:
  - Aider is terminal pair programming with cloud and local LLM support.
  - Its repo map is a strong token-budget precedent: expose concise symbols first and fit the most relevant code graph into the active token budget.
- OpenCode:
  - OpenCode supports AGENTS.md, configurable instruction file globs, MCP config, plugins, permission policy, provider allow/deny lists, and context compaction settings.
- Roo Code / Cline-style VS Code agents:
  - Roo supports workspace rules and project-level `.roo/mcp.json`.
  - This should be a planned compatibility lane through instruction generation and MCP config, not a native adapter claim until locally verified.
- MCP:
  - MCP is the cross-agent portability layer for tools, resources, and prompts.
  - Treat a small, stable Meta Harness MCP surface as the core integration, then layer native adapters where evidence exists.
- Agent Skills:
  - Skills use progressive disclosure: small metadata first, full `SKILL.md` only when activated, resources only as needed.
- Azure:
  - Azure Foundry Agent Service can connect agents to remote MCP server endpoints and supports review/approval of MCP tool calls.
  - Azure MCP Server exists as a developer MCP server for Azure resources and is compatible with MCP clients such as GitHub Copilot agent mode, OpenAI Agents SDK, and Semantic Kernel.
  - Azure compatibility must be read-only by default and must not mutate cloud resources without explicit policy authorization.
- Model behavior:
  - Long context does not guarantee reliable use of all information. The "lost in the middle" and context-rot research lines justify compact, indexed context packs, source paths, excerpts, and progressive disclosure instead of dumping logs and docs into prompts.

Source links for refresh:

- OpenAI Codex:
  - https://developers.openai.com/codex/noninteractive
  - https://developers.openai.com/codex/guides/agents-md
  - https://developers.openai.com/codex/skills
  - https://developers.openai.com/codex/mcp
  - https://developers.openai.com/codex/subagents
  - https://developers.openai.com/codex/app-server
  - https://developers.openai.com/codex/sdk
  - https://developers.openai.com/codex/cli/reference
- Anthropic Claude Code:
  - https://code.claude.com/docs/en/headless
  - https://code.claude.com/docs/en/mcp
  - https://code.claude.com/docs/en/skills
  - https://code.claude.com/docs/en/plugins-reference
  - https://code.claude.com/docs/en/how-claude-code-works
  - https://code.claude.com/docs/en/claude-directory
- Cursor:
  - https://cursor.com/docs/rules.md
  - https://cursor.com/docs/mcp.md
  - https://cursor.com/docs/cli/headless.md
  - https://cursor.com/docs/skills.md
  - https://cursor.com/docs/subagents.md
  - https://cursor.com/docs/reference/ignore-file.md
- Gemini CLI:
  - https://google-gemini.github.io/gemini-cli/docs/cli/headless.html
  - https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html
  - https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md
  - https://google-gemini.github.io/gemini-cli/docs/get-started/configuration.html
- GitHub Copilot:
  - https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent
  - https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions
  - https://docs.github.com/en/copilot/concepts/context/mcp
- Windsurf / Cascade:
  - https://docs.windsurf.com/windsurf/cascade/memories
  - https://docs.windsurf.com/windsurf/cascade/mcp
  - https://docs.windsurf.com/windsurf/cascade/skills
  - https://docs.windsurf.com/windsurf/cascade/agents-md
- Continue:
  - https://docs.continue.dev/
  - https://docs.continue.dev/customize/deep-dives/rules
  - https://docs.continue.dev/customize/deep-dives/mcp
- Aider:
  - https://aider.chat/
  - https://aider.chat/docs/repomap.html
- OpenCode:
  - https://opencode.ai/docs/config/
  - https://opencode.ai/docs/rules/
  - https://opencode.ai/docs/agents/
- Roo Code:
  - https://roocodeinc.github.io/Roo-Code/features/mcp/using-mcp-in-roo/
  - https://roocodeinc.github.io/Roo-Code/features/custom-instructions/
- MCP and skills standards:
  - https://modelcontextprotocol.io/docs/getting-started/intro
  - https://modelcontextprotocol.io/specification/2025-06-18
  - https://agentskills.io/specification
- Azure:
  - https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/model-context-protocol
  - https://learn.microsoft.com/en-us/azure/developer/azure-mcp-server/overview
  - https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/tool-catalog
- Context behavior:
  - https://arxiv.org/abs/2307.03172
  - https://www.trychroma.com/research/context-rot

## Objective

Make Meta Harness ready to become a high-quality open source project through five coordinated tracks:

1. **Professional docs and public presence**
   Build a polished GitHub Pages documentation experience with PyPI-style quick onboarding: fast install, quickstart, concepts, CLI reference, MCP reference, adapter support, examples, API docs, and release/security posture.

2. **Technical open-source hardening**
   Raise the repo from strong v0.1 bootstrap to credible public beta by improving CI, release hygiene, tests, package metadata, security automation, API documentation, examples, and contributor ergonomics.

3. **Agent compatibility and adapter roadmap**
   Convert partial agent support into an evidence-backed compatibility matrix across instructions, skills, MCP, headless dispatch, structured outputs, hooks, SDKs, cloud agents, and fallback prompt files.

4. **Context and token budgeting**
   Design Meta Harness so it can coordinate large implementation programs without bloating every agent prompt. Add explicit budgets, compact context packs, evidence excerpts, summaries, indexes, and budget checks.

5. **Azure and enterprise MCP readiness**
   Define how Meta Harness runs locally, in GitHub Actions, through MCP-compatible clients, and as an Azure-hostable MCP endpoint with authentication, auditability, read-only defaults, and explicit mutation gates.

Do not publish packages, create GitHub releases, push Git refs, rotate secrets, mutate Azure resources, or make the repo public unless the maintainer explicitly approves those actions separately.

## Non-Negotiables

- Keep the project read-only-first and evidence-gated.
- Preserve the documented distinction between real command evidence and fake/simulation evidence.
- Do not overclaim native adapter support. Filesystem and fake adapters are complete; most native adapters are conservative prompt-file, instruction, MCP, or detection surfaces until verified locally.
- Do not weaken MCP write-mode checks, path containment, safe IDs, or dangerous-operation defaults.
- Do not commit secrets, local account identifiers, generated tarballs, `node_modules`, `dist`, `.vs`, or temporary artifacts.
- Every implementation slice must end with concrete validation output and a short summary of changed files.
- Required claims need evidence. Use exact proof statuses: `claimed`, `parent_verified`, `static_verified`, `command_verified`, `runtime_verified`, `human_verified`, `not_verified`, or `partial`.
- `next_action.yaml` remains the continuation source of truth.

## Execution Model: Use Meta Harness On This Goal

Execute this goal prompt as if Meta Harness is coordinating the work, even before every planned enhancement exists in code.

Roles:

- Parent coordinator:
  - Owns this prompt as the controlling spec.
  - Splits work into bounded phases and slices.
  - Dispatches subagents generously for research, implementation, testing, review, docs, and recovery.
  - Integrates only evidence-backed subagent outputs.
  - Maintains a current completion estimate.
- Worker subagents:
  - Implement or research one bounded slice.
  - Stay inside the assigned write scope.
  - Return changed files, command evidence, risks, and remaining work.
- Reviewer subagent:
  - Runs after every phase and whenever a major slice changes project direction.
  - Reviews the implementation against this exact prompt, not against chat memory alone.
  - Checks goal alignment, directional alignment, support-claim accuracy, evidence quality, token-budget discipline, security posture, and docs consistency.
  - Estimates completion percentage for the phase, each track, and the full goal.
- Recovery subagent:
  - Runs when a reviewer finds blockers, drift, overclaiming, missing evidence, failing validation, or unclear next action.
  - Proposes the smallest corrective slice.

Subagent usage requirements:

- Use parallel subagents for independent research lanes, docs audits, support-matrix audits, adapter-format checks, CI/test expansion, security review, and example review.
- Use sequential subagents when outputs depend on previous evidence, such as implementation followed by review followed by recovery.
- Prefer more small subagent packets over one large omnibus prompt.
- Keep subagent prompts bounded by `mh context-pack` principles: objective, scope, required evidence, relevant files, validation commands, output schema, and maximum response size.
- Do not ask a worker subagent to be the only reviewer of its own work.
- Summarize subagent results in the checkpoint; store raw outputs as artifacts or linked files instead of pasting full logs into the main context.

Mandatory phase audit:

- After each phase, dispatch an independent reviewer subagent with:
  - this prompt as the controlling spec
  - the phase objective and exit criteria
  - changed file list
  - validation command outputs or artifact paths
  - support claims changed
  - docs changed
  - risks and known gaps
- The reviewer must return:
  - `phase_alignment`: `aligned`, `partially_aligned`, or `misaligned`
  - `directional_alignment`: `on_track`, `needs_adjustment`, or `off_track`
  - `evidence_quality`: `strong`, `adequate`, `weak`, or `missing`
  - `phase_completion_percent`: integer 0 to 100
  - `track_completion_percent`: map of Track A through Track E
  - `overall_goal_completion_percent`: integer 0 to 100
  - `blockers`: concrete list
  - `required_recovery_slices`: concrete list
  - `next_action_recommendation`: continue, recover, pause_for_human_review, or stop
- A phase cannot advance if the reviewer reports `misaligned`, `off_track`, `weak`, `missing`, or any blocker that invalidates the phase exit criteria.
- If the reviewer estimates phase completion below 90 percent, create a recovery slice or explicitly record why the remaining work is intentionally deferred.
- Treat the reviewer completion percentage as an estimate, not proof. It must be backed by command evidence, docs evidence, and changed-file inspection.

## Track A: Professional Docs And Public Presence

Recommended stack:

- Use **VitePress** for the documentation site because this is a TypeScript/CLI/MCP project and VitePress gives a fast, polished Markdown-first docs experience.
- Use **TypeDoc** for TypeScript API reference generation.
- Deploy with GitHub Pages through Actions using the official Pages artifact/deploy flow.
- Keep Material for MkDocs as a fallback only if the maintainer strongly prefers a Python/PyPI look over TypeScript-native tooling.

Required work:

1. Add docs-site tooling.
   - Add scripts such as `docs:dev`, `docs:build`, `docs:preview`, and `docs:api`.
   - Add VitePress config with GitHub Pages base path appropriate for `smgpulse007/meta-harness`.
   - Add TypeDoc config and generate API docs into a docs-site/API route or a checked/generated output only if the repo policy allows it.

2. Build a docs information architecture.
   - Home: concise product promise, one-line install, and "No phase advances without verified evidence."
   - Quickstart: initialize a repo, ingest a spec, plan a phase, dispatch a slice, collect, verify, checkpoint, and continue.
   - Concepts: phase, slice, packet, proof ledger, checkpoint, side-effect policy, continuation contract, token budget.
   - CLI Reference: every `mh` command, flags, expected inputs, outputs, JSON modes, examples, and failure cases.
   - MCP Reference: server modes, tools, prompts, resources, write-mode policy, remote hosting notes, tool allowlists.
   - Adapter Guide: filesystem, fake, Codex, Claude Code, Cursor, Gemini CLI, Copilot, Windsurf/Cascade, Continue, Aider, OpenCode, Roo/Cline, generic filesystem.
   - Agent Compatibility: support matrix by surface rather than just by adapter.
   - Token Budgeting: how context packs are generated and why raw logs are avoided.
   - Azure Guide: local MCP vs remote MCP, Azure Foundry Agent Service, Azure MCP Server compatibility, identity/RBAC caveats, read-only default.
   - Examples: tiny TypeScript, tiny Python, richer refactor walkthrough, MCP host example, Codex/Claude/Cursor context-pack examples.
   - Security Model: read-only default, dangerous operations, MCP risks, secrets, residual risks.
   - Release/Publishing: what maintainers must explicitly approve.

3. Upgrade the README for public evaluation.
   - Add CI, schema, integration, license, npm/package status, and docs badges once URLs are real.
   - Put a minimal install/use path in the first screen.
   - Add a "Should I use this?" section for maintainers evaluating agentic coding workflows.
   - Add a "What Meta Harness is not" section to avoid overclaiming.
   - Link to docs site, support matrix, threat model, examples, and contribution guide.

4. Add GitHub project polish.
   - Confirm repo description is set.
   - Recommend GitHub topics: `coding-agents`, `mcp`, `typescript`, `automation`, `developer-tools`, `agentic-workflows`, `evidence`, `cli`.
   - Recommend branch protection for `main`: require CI, Schema Check, and Integration Smoke before merge.
   - Add a docs deployment workflow and keep it separate from package release.

Acceptance criteria for Track A:

- `pnpm docs:build` passes locally.
- GitHub Pages workflow passes on `main`.
- README has a fast path from clone/install to first useful output.
- Docs site can explain the project to a new user in under five minutes.
- Docs do not overclaim adapter maturity or autonomy.

## Track B: Technical Open Source Hardening

Required work:

1. Runtime and package hygiene.
   - Add `engines.node` matching the current PNPM requirement, preferably `>=22.13` or `>=24`.
   - Add `.node-version` or `.nvmrc`.
   - Document use of Corepack and PNPM.
   - Ensure package tarballs contain intended files and exclude incidental artifacts.
   - Decide whether packages should publish source/tests or only `dist`, types, README, and license.

2. CI expansion.
   - Add Windows to at least one validation matrix because this repo is actively developed on Windows and already hit Windows-specific clean-script issues.
   - Add `pnpm run clean` to CI.
   - Add package dry-run checks to CI.
   - Add `pnpm audit --prod` or a documented dependency/security workflow.
   - Keep the focused Schema Check and Integration Smoke workflows.

3. Release automation.
   - Add Changesets or an equivalent release-note/versioning workflow.
   - Add a manual `release-dry-run` workflow that runs all gates and `pack --dry-run`.
   - Keep actual npm publish/manual GitHub release behind explicit maintainer approval.
   - Preserve provenance settings already present in package publish configs.

4. Test coverage and confidence.
   - Add CLI tests for every implemented command and main failure cases.
   - Add MCP tests for representative read tools, write-mode tools, path containment, invalid input handling, and missing-resource behavior.
   - Add adapter tests for filesystem, fake, and detection behavior.
   - Add schema negative fixtures for invalid packets, plans, next actions, and proof ledgers.
   - Add fresh-checkout smoke tests that prove `dist` is not required before the build step.

5. Product/API improvements.
   - Add `--json` output modes for machine-readable CLI workflows where useful.
   - Add richer `mh doctor` checks: Node/PNPM version, package build state, adapter availability, Git status, docs site readiness, workflow hints, MCP server readiness, and budget health.
   - Add deterministic command output formatting for docs and tests.
   - Strengthen requirement extraction documentation and consider explicit parser extension points.
   - Improve checkpoint audit messages with actionable remediation.
   - Consider a `mh demo` or `mh quickstart` command that creates a tiny throwaway example workflow.

6. Security and trust.
   - Add Dependabot for npm dependencies and GitHub Actions.
   - Add CodeQL or equivalent static analysis.
   - Add GitHub dependency review for pull requests.
   - Add secret scanning guidance in `SECURITY.md`.
   - Add maintainer security checklist for releases.
   - Add MCP security guidance: trust boundaries, command execution risks, environment variable handling, tool allowlists, and transport differences.

7. Contributor ergonomics.
   - Add a contributor "local development" page.
   - Add issue labels or label recommendations.
   - Expand PR template with validation checkboxes matching actual scripts.
   - Add architecture decision records for key choices: filesystem-first adapters, simulation evidence policy, read-only MCP default, VitePress/TypeDoc docs stack, context-pack budgeting, and MCP-first compatibility.

Acceptance criteria for Track B:

- `pnpm run clean && pnpm run ci` passes from a fresh checkout.
- Linux and Windows CI pass.
- `pnpm audit --prod` passes or documented exceptions exist.
- Package dry-runs pass in CI.
- Tests cover core gates, CLI commands, MCP modes, adapters, schema validation, and smoke flows.
- Public-facing docs accurately reflect support tiers and known limitations.

## Track C: Agent Compatibility And Adapter Roadmap

Do not treat agent support as one boolean. Track support by surface:

- Instruction surface: persistent files the host reads automatically.
- Skill surface: portable `SKILL.md` packages and host-specific skill folders.
- MCP surface: server config, supported transports, tools, prompts, resources, app extensions, and approval behavior.
- Headless dispatch surface: CLI/SDK automation with structured output and exit codes.
- Review surface: PR review, code review, or cloud agent behavior.
- Hook surface: pre/post tool hooks, command hooks, policy hooks.
- Context surface: memory, compaction, summary, rules, ignore files, and token controls.
- Safety surface: sandbox, approval mode, write scopes, tool allowlists, identity, and secret handling.

Required research deliverable:

- Create `docs/research/agent-compatibility-2026-07-07.md`.
- For each agent, include:
  - official docs URL
  - supported instruction files
  - skill/plugin support
  - MCP support and transports
  - structured output support
  - write/sandbox/approval controls
  - token/context controls
  - safe adapter target
  - current Meta Harness support
  - gaps
  - proof status
- Update `docs/agent-support-matrix.md` only after research and local verification.

Agent-by-agent target plan:

1. Codex
   - Current support: partial. Adapter detection exists; CLI launch is disabled; MCP and prompt-file fallback are available.
   - Documentation target: make this explicit and visible.
   - Native dispatch target:
     - Add an experimental `codex` dispatcher only after local verification of `codex exec`.
     - Prefer `codex exec --json` event capture, `--output-schema` packet enforcement, and `--output-last-message` for final packet handoff.
     - Capture token usage from JSONL turn completion events where available.
     - Pass sandbox and approval settings explicitly.
     - Never expose API keys as job-level env in workflows that execute repo-controlled code.
   - Deep integration target:
     - Explore Codex app-server/SDK only after CLI dispatcher is stable.
     - Consider `codex mcp-server` as an inter-agent bridge where another host consumes Codex.
   - Skill/plugin target:
     - Add repo-local `.agents/skills/meta-harness/SKILL.md`.
     - Add optional Codex plugin packaging with `agents/openai.yaml` only after validating local plugin behavior.
   - MCP target:
     - Provide sample `.codex/config.toml` for local stdio Meta Harness MCP.
     - Keep Meta Harness MCP instructions compact, with the first 512 characters self-contained.

2. Claude Code
   - Current support: partial instruction and prompt-file flow.
   - Native dispatch target:
     - Add optional `claude -p` headless dispatcher after verifying `--output-format json`, `stream-json`, and `--json-schema` behavior.
     - Parse structured output into slice packets.
     - Capture usage and cost metadata where available.
   - Skill/plugin target:
     - Emit `.claude/skills/meta-harness/SKILL.md`.
     - Consider a Claude plugin that packages skills, agents, hooks, MCP config, and monitors.
   - MCP target:
     - Emit Claude MCP configuration snippets and docs.
   - Hook target:
     - Explore hooks for blocking dangerous commands, enforcing `next_action.yaml`, and rejecting missing evidence.

3. Cursor
   - Current support: `.cursor/rules/meta-harness.mdc` instruction emitter.
   - Fix/verify:
     - Ensure generated Cursor rules use `.mdc` with frontmatter; plain Markdown in `.cursor/rules` is ignored.
   - Native dispatch target:
     - Add optional Cursor CLI headless support only after verifying `agent -p`, output formats, and write flags.
   - MCP target:
     - Emit `.cursor/mcp.json` sample for local Meta Harness MCP.
     - Document stdio, SSE, and Streamable HTTP tradeoffs.
   - Skills/subagents:
     - Generate Cursor skill-compatible package if the format is verified.
     - Add subagent pack templates for read-heavy review lanes.
   - Context controls:
     - Add `.cursorignore` and `.cursorindexingignore` recommendations to avoid indexing build artifacts and checkpoint raw logs.

4. Gemini CLI
   - Current support: `GEMINI.md` instruction emitter and conservative CLI detection.
   - Native dispatch target:
     - Verify `gemini --prompt` / `-p`, `--output-format json`, exit codes, sandbox, and approval modes before enabling.
   - MCP target:
     - Emit settings snippets with `mcpServers`.
   - Context target:
     - Respect hierarchical and just-in-time `GEMINI.md` loading; keep root `GEMINI.md` compact and put detailed procedures in linked docs or skills.

5. GitHub Copilot
   - Current support:
     - `.github/copilot-instructions.md`
     - `.github/instructions/meta-harness.instructions.md`
   - Expand support:
     - Ensure path-specific instructions include correct `applyTo` frontmatter.
     - Document `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` recognition for Copilot CLI contexts.
   - Cloud agent target:
     - Treat Copilot cloud agent as task/PR-based, not local dispatcher.
     - Generate issue/task prompts with one repo, one branch, one PR, and timeout constraints.
     - Emit repository MCP settings guidance.
   - MCP target:
     - Document GitHub MCP toolset minimization because fewer tools improve selection accuracy and reduce token use.

6. Windsurf / Devin Desktop Cascade
   - Current support: `.windsurf/rules/meta-harness.md`.
   - Expand support:
     - Add AGENTS.md compatibility guidance for Cascade.
     - Add skill/workflow packaging only after local format verification.
     - Add `.windsurf/hooks.json` research task for policy hooks.
   - MCP target:
     - Emit `mcp_config.json` sample for local and remote Meta Harness MCP.
     - Include team/admin whitelist guidance.

7. Continue
   - Current support: `.continue/rules/meta-harness.md`.
   - Positioning:
     - Treat as a compatibility target for existing users, with lower priority because upstream is read-only/final-release.
   - MCP target:
     - Add `.continue/mcpServers` sample YAML/JSON for Meta Harness MCP.

8. Aider
   - Current support: conservative prompt-file fallback and CLI detection path.
   - Native dispatch target:
     - Verify aider CLI non-interactive/script support before claiming dispatcher support.
   - Token-budget influence:
     - Borrow the repo-map idea: generate concise project maps and relevant-file indexes rather than pasting full files.

9. OpenCode
   - Current support: conservative adapter detection path.
   - Expand support:
     - Generate `AGENTS.md` and optional `opencode.json` instruction globs.
     - Emit MCP config in `opencode.json`.
     - Emit permission policy recommendations requiring approval for edit and bash tools.
     - Document compaction settings and provider allow/deny controls.

10. Roo Code / Cline-style agents

- Current support: not first-class.
- Add planned support:
  - Generate `.roo/rules/meta-harness.md`.
  - Generate `.roo/mcp.json` sample.
  - Treat as instruction/MCP compatibility only until local verification.

11. Generic filesystem

- Preserve as the reliable universal fallback.
- It must remain the reference adapter for no-agent-launch workflows.

Acceptance criteria for Track C:

- `docs/research/agent-compatibility-2026-07-07.md` exists with source-backed claims.
- `docs/agent-support-matrix.md` separates instruction, MCP, skill, and native dispatch support.
- `mh emit-instructions` supports at least:
  - `agents`
  - `claude`
  - `gemini`
  - `cursor`
  - `copilot`
  - `windsurf`
  - `continue`
  - `opencode`
  - `roo`
  - `all`
- Generated Cursor rule files use `.mdc` and correct frontmatter.
- Generated Copilot instruction files use correct repository-wide and path-specific formats.
- Native dispatch is not enabled for any agent until proven by local command evidence.

## Track D: Context And Token Budgeting

Problem statement:

Meta Harness exists to coordinate large implementation programs. If every phase dumps full specs, logs, checkpoint history, and source files into every agent prompt, the harness will become unreliable and expensive. The design must use progressive disclosure, compact indexes, bounded excerpts, and structured context packs.

Design principles:

- Keep durable policy in small always-loaded instruction files.
- Put procedures in skills, not in every prompt.
- Put large references in docs/resources and load only when needed.
- Store raw logs as artifacts; pass paths, hashes, statuses, and short excerpts.
- Pass exact validation commands, not entire historical outputs.
- Use subagents for read-heavy exploration and return summaries only.
- Prefer MCP resources and tool calls over pasted bulk context.
- Make budgets machine-checkable.

Required budget model:

Define budget classes in schema and docs:

| Budget class        | Purpose                                       |                       Suggested cap |
| ------------------- | --------------------------------------------- | ----------------------------------: |
| `instruction_index` | Always-loaded root guidance such as AGENTS.md |  16 KiB target, 32 KiB hard warning |
| `skill_metadata`    | Skill name and description                    |         100 tokens per skill target |
| `skill_body`        | Full SKILL.md body                            |                 5,000 tokens target |
| `mcp_instructions`  | MCP server instructions                       | first 512 characters self-contained |
| `phase_pack`        | Parent coordinator phase context              |              8,000 to 12,000 tokens |
| `slice_pack`        | Worker slice context                          |               4,000 to 8,000 tokens |
| `review_pack`       | Reviewer context                              |               4,000 to 8,000 tokens |
| `evidence_excerpt`  | Command output excerpt                        |          100 to 200 lines or 12 KiB |
| `raw_artifact`      | Full log/output stored on disk                |      no prompt inclusion by default |

Add commands or command options:

- `mh budget`
  - Scans instruction files, skills, context packs, evidence excerpts, and MCP descriptions.
  - Emits warnings when files exceed budget.
  - Supports `--json`.
- `mh context-pack`
  - Emits a bounded task pack for a target agent.
  - Supports `--target codex|claude-code|cursor|gemini|copilot|windsurf|continue|aider|opencode|roo|generic`.
  - Supports `--budget <tokens>` and `--format markdown|json`.
- `mh prompt`
  - Alias or wrapper around `context-pack` for a single worker/reviewer/parent prompt.
- `mh summarize-log`
  - Converts a raw command log into a bounded evidence excerpt with path, command, exit code, timestamp, excerpt, and hash.
- `mh doctor`
  - Adds budget health checks.

Context pack shape:

Each generated pack should contain:

- Objective.
- Non-negotiables.
- Current phase and slice.
- Allowed write scope.
- Required output schema.
- Required evidence statuses.
- Exact validation commands.
- Minimal relevant file index.
- Relevant source excerpts with line references where needed.
- Existing proof state.
- Known blockers and risks.
- Artifact paths for full logs.
- Next action contract.
- Budget summary.

Do not include:

- Full raw test logs.
- Full checkpoint history.
- Full generated `dist`.
- Full package lockfile unless specifically relevant.
- Secrets or full account identifiers.
- Unbounded web research dumps.

Acceptance criteria for Track D:

- `mh budget --json` can be used in CI.
- Generated default `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, Cursor rules, Copilot instructions, and skills stay under documented budgets.
- At least three sample context packs exist:
  - Codex worker
  - Claude reviewer
  - Generic filesystem fallback
- Docs explain how to keep context small.
- CI or docs build includes a budget check, at least as a warning in the first pass.

## Track E: Azure And Enterprise MCP Readiness

Goal:

Make Meta Harness viable in enterprise environments where agents may run locally, in GitHub, in Azure Foundry Agent Service, or behind remote MCP endpoints.

Required work:

1. Azure architecture documentation.
   - Document local stdio MCP for developer workstations.
   - Document remote Streamable HTTP MCP as the target for Azure-hosted agent workflows.
   - Document Azure Foundry Agent Service integration as a remote MCP client scenario.
   - Document Azure MCP Server as a separate MCP server for Azure resource operations, not something Meta Harness should automatically invoke for mutations.

2. Security model.
   - Default remote MCP mode must be read-only.
   - Workspace-write and checkpoint-write modes require explicit config.
   - Cloud mutation tools must require explicit policy authorization.
   - Support Entra ID, managed identity, or reverse-proxy auth only after concrete design review.
   - Add audit logging for remote MCP requests before any hosted mode is recommended.

3. Deployment examples.
   - Add a local-only example first.
   - Then add an Azure Container Apps or equivalent deployment sketch only as documentation unless explicitly authorized to create resources.
   - Include private networking notes but do not provision infrastructure.

4. Enterprise controls.
   - Document tool allowlists and disabled tools.
   - Document evidence retention and redaction.
   - Document identity boundaries and data retention risks for third-party MCP servers.
   - Provide recommended configs for read-only mode in Codex, Claude Code, Cursor, Copilot, and Azure Foundry.

Acceptance criteria for Track E:

- Azure docs clearly separate:
  - Meta Harness MCP
  - Azure MCP Server
  - Azure Foundry Agent Service
  - Azure OpenAI/model provider configuration
- No Azure resources are created or mutated by default.
- Remote MCP guidance includes auth, audit logging, read-only default, and explicit write-mode gates.

## Suggested Implementation Phases

Common gate for every phase:

- Run phase work through parent/worker/reviewer roles.
- Use parallel subagents for independent lanes wherever practical.
- End the phase with a reviewer subagent audit against this prompt.
- Record the audit packet under the phase checkpoint artifacts.
- Include completion percentages and directional-alignment status in the checkpoint.
- If the audit finds blockers, dispatch a recovery subagent before advancing.

### Phase 0: Compatibility Research And Claims Audit

- Refresh official docs for all target agents.
- Create `docs/research/agent-compatibility-2026-07-07.md`.
- Audit current `docs/agent-support-matrix.md`.
- Audit generated instruction files and formats.
- Produce a claim ledger: current support, evidence, planned support, not supported.

Exit criteria:

- No support claim lacks a source or local evidence.
- Codex support is accurately described as partial and conservative today.
- Native dispatch targets are clearly marked experimental/planned until verified.

### Phase 1: Public-Ready Repo Hygiene

- Add Node engine/version files.
- Add Windows CI and package dry-run CI.
- Add Dependabot and CodeQL.
- Refresh README badges and top-level quickstart.
- Validate all current commands.

Exit criteria:

- Local and GitHub CI green.
- README first screen is public-quality.
- No generated or local-only artifacts tracked.

### Phase 2: Docs Site Foundation

- Add VitePress and TypeDoc.
- Build docs IA and migrate existing Markdown into the site.
- Add GitHub Pages deployment workflow.
- Add docs links to README.

Exit criteria:

- `pnpm docs:build` passes.
- Pages workflow passes.
- Docs site includes home, quickstart, concepts, CLI, MCP, adapters, agent compatibility, token budgeting, Azure, examples, security, and API reference.

### Phase 3: Compatibility Emitters And MCP Packs

- Expand `mh emit-instructions` targets.
- Add `.agents/skills/meta-harness/SKILL.md`.
- Add `.claude/skills/meta-harness/SKILL.md` or a generated docs-only sample if the repo should not commit host-specific config.
- Add sample MCP configs for Codex, Claude Code, Cursor, Gemini CLI, Copilot, Windsurf/Cascade, Continue, OpenCode, and Roo.
- Add target-specific context-pack generation.

Exit criteria:

- Generated instruction and MCP config samples validate against documented formats where possible.
- Support matrix is split by surface.
- No generated host config contains secrets.

### Phase 4: Token Budgeting And Context Packs

- Add budget schemas and budget checking.
- Add `mh budget`.
- Add `mh context-pack` / `mh prompt`.
- Add evidence excerpt generation.
- Add sample packs and tests.

Exit criteria:

- Budget checks pass for repo-generated instructions and skills.
- Context packs are deterministic and bounded.
- Large logs stay as artifacts with excerpts.

### Phase 5: Technical Depth And Examples

- Expand tests across CLI, MCP, adapters, schemas, budgets, and context packs.
- Add richer example workflow.
- Add `mh doctor` improvements and JSON output.
- Improve audit/remediation messages.

Exit criteria:

- Test suite materially covers user-facing behavior.
- Examples demonstrate real workflow mechanics without relying on fake evidence for production claims.
- New docs reference improved behavior.

### Phase 6: Native Dispatch Experiments

- Codex native dispatch experiment:
  - Verify `codex exec` locally.
  - Capture JSONL events.
  - Enforce packet schema.
  - Capture token usage where exposed.
  - Keep disabled by default until stable.
- Claude native dispatch experiment:
  - Verify headless JSON/schema output locally.
  - Parse structured output into packets.
- Gemini/Cursor native dispatch experiments only after docs and safety controls are stable.

Exit criteria:

- Experimental dispatchers are feature-gated.
- Tests cover parsing and failure cases.
- Docs clearly separate experimental native dispatch from stable filesystem/MCP support.

### Phase 7: Azure And Enterprise MCP Readiness

- Add Azure architecture docs.
- Add remote MCP deployment sketch.
- Add auth/audit design.
- Add enterprise allowlist and read-only guidance.

Exit criteria:

- Azure docs are useful without provisioning anything.
- No resource mutation path exists without explicit policy authorization.
- Remote MCP design is ready for review.

### Phase 8: Release Readiness

- Add Changesets or equivalent version workflow.
- Add manual release dry-run workflow.
- Finalize package file inclusion policy.
- Prepare but do not execute npm publish or GitHub release.

Exit criteria:

- Maintainer can run one documented command/workflow to verify release readiness.
- Release checklist maps exactly to automated gates and manual approvals.

## Validation Commands

Run these before completing any implementation phase:

```bash
pnpm install --frozen-lockfile
pnpm run clean
pnpm run ci
pnpm audit --prod
pnpm --filter @meta-harness/core pack --dry-run
pnpm --filter @meta-harness/adapters pack --dry-run
pnpm --filter @meta-harness/cli pack --dry-run
pnpm --filter @meta-harness/mcp-server pack --dry-run
git diff --check
git status --short --branch
```

After docs work, also run:

```bash
pnpm docs:build
```

After budget/context-pack work, also run:

```bash
mh budget --json
mh context-pack --target codex --budget 8000 --format markdown
mh context-pack --target claude-code --budget 8000 --format markdown
mh context-pack --target generic --budget 8000 --format markdown
```

Use the package-local CLI invocation if `mh` is not globally installed.

## Final Deliverables

- A polished docs site ready for GitHub Pages.
- Updated README and public project narrative.
- Stronger CI across Linux and Windows.
- Security/dependency automation.
- Release dry-run workflow.
- Expanded tests and examples.
- Evidence-backed agent compatibility matrix.
- Target-specific instruction emitters and MCP config samples.
- Portable Meta Harness skills package.
- Token/context budget model and CLI checks.
- Azure and enterprise MCP readiness docs.
- Per-phase subagent audit packets with goal alignment, directional alignment, evidence quality, blockers, recovery slices, and completion percentages.
- A final reviewer subagent audit estimating Track A through Track E completion and overall open-source readiness.
- Clear known-limits documentation.
- A final handoff summary with exact commits, commands, workflow run links, research sources, and residual risks.
