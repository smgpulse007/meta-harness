import { existsSync } from "node:fs";
import {
  canonicalAgentInstructions,
  HARNESS_PROTOCOL_VERSION,
  ProofLedger,
  readJsonFile,
  readTextFile,
  readYamlFile,
  resolveInsideWorkspace,
  SliceDefinition,
  SlicePlan,
  writeTextFile
} from "@meta-harness/core";
import { checkpointPath, CommandContext, emit } from "./common.js";

export interface ContextPackOptions {
  target?: string;
  phase?: string;
  slice?: string;
  role?: string;
  budget?: string | number;
  format?: string;
  output?: string;
}

export type ContextPackRole = "parent" | "worker" | "reviewer";
export type ContextPackClass = "phase_pack" | "slice_pack" | "review_pack";

interface ContextPackFile {
  path: string;
  exists: boolean;
  line_start?: number;
  line_end?: number;
  estimated_tokens?: number;
  truncated?: boolean;
  excerpt?: string;
}

interface ContextPackProofState {
  path: string;
  exists: boolean;
  required_claims: number;
  statuses: Record<string, number>;
}

export interface ContextPack {
  protocol_version: string;
  target: string;
  role: ContextPackRole;
  pack_class: ContextPackClass;
  phase_id: string;
  slice_id?: string;
  budget_tokens: number;
  estimated_tokens: number;
  status: "within_budget" | "over_budget";
  objective: string;
  target_guidance: string[];
  required_evidence_statuses: string[];
  validation_commands: string[];
  allowed_write_scope: string[];
  required_output_schema: string[];
  files: ContextPackFile[];
  proof_state: ContextPackProofState;
  known_blockers: string[];
  artifact_paths: string[];
  safety: string[];
  budget_summary: {
    budget_class: ContextPackClass;
    max_excerpt_lines: number;
    max_excerpt_chars: number;
    raw_artifacts_included: false;
  };
}

const roleDefaults: Record<ContextPackRole, { packClass: ContextPackClass; budget: number }> = {
  parent: { packClass: "phase_pack", budget: 12000 },
  worker: { packClass: "slice_pack", budget: 8000 },
  reviewer: { packClass: "review_pack", budget: 8000 }
};

const maxExcerptLines = 80;
const maxExcerptChars = 6000;
const validFormats = new Set(["markdown", "json"]);

const targetGuidance: Record<string, string[]> = {
  codex: [
    "Use AGENTS.md as the durable instruction surface.",
    "Use filesystem prompts or MCP read tools for stable work; codex-experimental remains feature-gated."
  ],
  "claude-code": [
    "Use CLAUDE.md and .claude/skills/meta-harness/SKILL.md where available.",
    "Native claude -p dispatch remains unverified."
  ],
  cursor: [
    "Use .cursor/rules/meta-harness.mdc with YAML frontmatter.",
    "Use MCP read tools through a local mcp.json sample when configured."
  ],
  gemini: [
    "Use GEMINI.md as hierarchical context.",
    "Keep Gemini MCP trust false until tool behavior is reviewed."
  ],
  copilot: [
    "Use repository and path-specific Copilot instructions.",
    "Use repository MCP with explicit read-only tool allowlists because Copilot may call tools autonomously."
  ],
  windsurf: [
    "Use AGENTS.md and the legacy .windsurf/rules/meta-harness.md instruction surface.",
    "Treat Cascade support as instruction/MCP compatibility only until locally verified."
  ],
  continue: [
    "Use .continue/rules/meta-harness.md and docs/examples/mcp-configs/continue-mcpServers.yaml.",
    "Treat Continue as a compatibility target, not native dispatch."
  ],
  aider: [
    "Use filesystem prompt files as the stable handoff.",
    "Borrow repo-map style context discipline without claiming native dispatch."
  ],
  opencode: [
    "Use AGENTS.md plus .opencode/instructions/meta-harness.md from opencode.json.",
    "Keep edit and bash permissions set to ask."
  ],
  roo: [
    "Use .roo/rules/meta-harness.md and .roo/mcp.json.",
    "Treat Roo support as instruction/MCP compatibility only."
  ],
  generic: ["Use the filesystem adapter prompt and packet contract as the universal fallback."]
};

const targetFiles: Record<string, string[]> = {
  codex: [
    "AGENTS.md",
    "docs/examples/codex-prompt-file.md",
    "docs/examples/mcp-configs/codex-config.toml"
  ],
  "claude-code": [
    "CLAUDE.md",
    ".claude/skills/meta-harness/SKILL.md",
    "docs/examples/mcp-configs/claude.mcp.json"
  ],
  cursor: [
    ".cursor/rules/meta-harness.mdc",
    ".agents/skills/meta-harness/SKILL.md",
    "docs/examples/mcp-configs/cursor.mcp.json"
  ],
  gemini: ["GEMINI.md", "docs/examples/mcp-configs/gemini.settings.json"],
  copilot: [
    ".github/copilot-instructions.md",
    ".github/instructions/meta-harness.instructions.md",
    "docs/examples/mcp-configs/copilot-repository-mcp.json"
  ],
  windsurf: [
    ".windsurf/rules/meta-harness.md",
    "docs/examples/mcp-configs/windsurf-mcp_config.json"
  ],
  continue: [
    ".continue/rules/meta-harness.md",
    "docs/examples/mcp-configs/continue-mcpServers.yaml"
  ],
  aider: ["docs/agent-support-matrix.md"],
  opencode: [
    "opencode.json",
    ".opencode/instructions/meta-harness.md",
    "docs/examples/mcp-configs/opencode.json"
  ],
  roo: [".roo/rules/meta-harness.md", ".roo/mcp.json", "docs/examples/mcp-configs/roo-mcp.json"],
  generic: ["AGENTS.md", "docs/agent-support-matrix.md"]
};

const evidenceStatuses = [
  "claimed",
  "parent_verified",
  "static_verified",
  "command_verified",
  "runtime_verified",
  "human_verified",
  "not_verified",
  "partial"
];

export async function contextPackCommand(
  context: CommandContext,
  options: ContextPackOptions = {}
): Promise<void> {
  const target = normalizeContextPackTarget(options.target ?? "generic");
  const phaseId = options.phase ?? "phase_001";
  const role = parseRole(options.role);
  const format = (options.format ?? "markdown").toLowerCase();
  if (!validFormats.has(format)) {
    throw new Error(`Unknown context-pack format ${options.format}`);
  }
  if (!targetGuidance[target]) {
    throw new Error(`Unknown context-pack target ${options.target}`);
  }

  const budget = parseBudget(options.budget, role);
  const pack = await buildContextPack(context, {
    target,
    phaseId,
    role,
    budget,
    ...(options.slice ? { sliceId: options.slice } : {})
  });
  const rendered = format === "json" ? `${JSON.stringify(pack, null, 2)}\n` : renderMarkdown(pack);
  if (options.output) {
    await writeTextFile(context.cwd, options.output, rendered);
    emit(context, `Wrote context pack to ${options.output}`);
    return;
  }
  emit(context, rendered);
}

export async function buildContextPack(
  context: CommandContext,
  input: {
    target: string;
    phaseId: string;
    role: ContextPackRole;
    budget: number;
    sliceId?: string;
  }
): Promise<ContextPack> {
  const guidance = targetGuidance[input.target];
  if (!guidance) {
    throw new Error(`Unknown context-pack target ${input.target}`);
  }

  const slicePlanPath = `${checkpointPath(input.phaseId)}/slice_plan.yaml`;
  const proofPath = `${checkpointPath(input.phaseId)}/proof.json`;
  const nextActionPath = `${checkpointPath(input.phaseId)}/next_action.yaml`;
  const slicePlan = await readOptionalYaml<SlicePlan>(context.cwd, slicePlanPath);
  const selectedSlice = selectSlice(slicePlan, input.sliceId);
  const sliceId = input.sliceId ?? selectedSlice?.id;
  const baseFiles = [
    "AGENTS.md",
    "docs/implementation_harness/phase_manifest.yaml",
    ".meta-harness/state.json",
    slicePlanPath,
    nextActionPath,
    proofPath,
    `${checkpointPath(input.phaseId)}/checkpoint.md`
  ];
  const paths = [...new Set([...baseFiles, ...(targetFiles[input.target] ?? [])])].sort();
  const files = await Promise.all(paths.map((filePath) => readExcerpt(context.cwd, filePath)));
  const validationCommands = selectedSlice?.validation_commands.map(
    (command) => command.command
  ) ?? ["Use the phase slice plan validation commands."];
  const nextAction = await readOptionalYaml<any>(context.cwd, nextActionPath);
  const proofState = await summarizeProof(context.cwd, proofPath);
  const draft: Omit<ContextPack, "estimated_tokens" | "status"> = {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    target: input.target,
    role: input.role,
    pack_class: roleDefaults[input.role].packClass,
    phase_id: input.phaseId,
    ...(sliceId ? { slice_id: sliceId } : {}),
    budget_tokens: input.budget,
    objective: packObjective(input.role),
    target_guidance: guidance,
    required_evidence_statuses: evidenceStatuses,
    validation_commands: validationCommands,
    allowed_write_scope: selectedSlice?.allowed_write_scope ?? [],
    required_output_schema: requiredOutputSchema(input.role),
    files,
    proof_state: proofState,
    known_blockers: nextAction?.blocking_risks ?? [],
    artifact_paths: [
      `${checkpointPath(input.phaseId)}/artifacts/`,
      `${checkpointPath(input.phaseId)}/commands.md`,
      `${checkpointPath(input.phaseId)}/proof.json`,
      `${checkpointPath(input.phaseId)}/next_action.yaml`
    ],
    safety: [
      "Default external systems to read-only.",
      "Do not claim validation unless a command or review actually ran.",
      "Do not include secrets or full account identifiers in generated artifacts.",
      "Native dispatch remains unverified unless local command evidence proves it.",
      "Use artifact paths and evidence excerpts instead of pasting raw logs."
    ],
    budget_summary: {
      budget_class: roleDefaults[input.role].packClass,
      max_excerpt_lines: maxExcerptLines,
      max_excerpt_chars: maxExcerptChars,
      raw_artifacts_included: false
    }
  };
  const estimated = estimateTokens(JSON.stringify(draft));
  return {
    ...draft,
    estimated_tokens: estimated,
    status: estimated <= input.budget ? "within_budget" : "over_budget"
  };
}

async function readExcerpt(workspaceRoot: string, filePath: string): Promise<ContextPackFile> {
  const absolutePath = resolveInsideWorkspace(workspaceRoot, filePath);
  if (!existsSync(absolutePath)) {
    return { path: filePath, exists: false };
  }
  const text = await readTextFile(workspaceRoot, filePath);
  const excerpt = truncate(text);
  return {
    path: filePath,
    exists: true,
    line_start: 1,
    line_end: excerpt.lineEnd,
    estimated_tokens: estimateTokens(excerpt.text),
    truncated: excerpt.truncated,
    excerpt: excerpt.text
  };
}

export function renderMarkdown(pack: ContextPack): string {
  const fileSections = pack.files
    .map((file) =>
      file.exists
        ? `### ${file.path} (lines ${file.line_start}-${file.line_end})\n\n\`\`\`\n${file.excerpt ?? ""}\n\`\`\`${file.truncated ? "\n\nExcerpt truncated." : ""}`
        : `### ${file.path}\n\nMissing from workspace.`
    )
    .join("\n\n");
  return `# Meta Harness Context Pack

Target: ${pack.target}
Role: ${pack.role}
Phase: ${pack.phase_id}
${pack.slice_id ? `Slice: ${pack.slice_id}\n` : ""}Budget: ${pack.estimated_tokens}/${pack.budget_tokens} estimated tokens (${pack.status})

## Objective

${pack.objective}

## Non-Negotiables

${canonicalAgentInstructions.trim()}

## Target Guidance

${pack.target_guidance.map((item) => `- ${item}`).join("\n")}

## Required Output Schema

${pack.required_output_schema.map((item) => `- ${item}`).join("\n")}

## Required Evidence Statuses

${pack.required_evidence_statuses.map((status) => `- \`${status}\``).join("\n")}

## Validation Commands

${pack.validation_commands.map((command) => `- \`${command}\``).join("\n")}

## Allowed Write Scope

${pack.allowed_write_scope.length > 0 ? pack.allowed_write_scope.map((scope) => `- \`${scope}\``).join("\n") : "- Use the phase slice plan allowed write scope."}

## Proof State

- Path: \`${pack.proof_state.path}\`
- Exists: ${pack.proof_state.exists}
- Required claims: ${pack.proof_state.required_claims}
- Statuses: ${Object.entries(pack.proof_state.statuses)
    .map(([status, count]) => `${status}=${count}`)
    .join(", ")}

## Known Blockers

${pack.known_blockers.length > 0 ? pack.known_blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None recorded in next_action.yaml."}

## Artifact Paths

${pack.artifact_paths.map((artifactPath) => `- \`${artifactPath}\``).join("\n")}

## Safety

${pack.safety.map((item) => `- ${item}`).join("\n")}

## Budget Summary

- Class: \`${pack.budget_summary.budget_class}\`
- Max excerpt lines: ${pack.budget_summary.max_excerpt_lines}
- Max excerpt chars: ${pack.budget_summary.max_excerpt_chars}
- Raw artifacts included: ${pack.budget_summary.raw_artifacts_included}

## Relevant Files

${fileSections}
`;
}

function parseRole(value: string | undefined): ContextPackRole {
  const normalized = (value ?? "worker").trim().toLowerCase();
  if (normalized === "parent" || normalized === "worker" || normalized === "reviewer") {
    return normalized;
  }
  throw new Error(`Unknown context-pack role ${value}`);
}

function parseBudget(value: string | number | undefined, role: ContextPackRole): number {
  if (value === undefined) {
    return roleDefaults[role].budget;
  }
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Budget must be a positive integer: ${value}`);
  }
  return parsed;
}

export function normalizeContextPackTarget(value: string): string {
  const target = value.trim().toLowerCase().replace(/_/g, "-");
  if (target === "claude") {
    return "claude-code";
  }
  if (target === "agents") {
    return "codex";
  }
  return target;
}

function selectSlice(
  plan: SlicePlan | undefined,
  sliceId: string | undefined
): SliceDefinition | undefined {
  if (!plan) {
    return undefined;
  }
  if (!sliceId) {
    return plan.slices[0];
  }
  return plan.slices.find((slice) => slice.id === sliceId);
}

function packObjective(role: ContextPackRole): string {
  if (role === "parent") {
    return "Coordinate the current Meta Harness phase with bounded context, evidence-backed proof, and checkpoint discipline.";
  }
  if (role === "reviewer") {
    return "Review the current Meta Harness phase or slice against the controlling spec, proof, validation, safety, and continuation contract.";
  }
  return "Execute the current Meta Harness slice with bounded context and evidence-backed proof.";
}

function requiredOutputSchema(role: ContextPackRole): string[] {
  if (role === "reviewer") {
    return [
      "phase_alignment: aligned | partially_aligned | misaligned",
      "directional_alignment: on_track | needs_adjustment | off_track",
      "evidence_quality: strong | adequate | weak | missing",
      "blockers and required_recovery_slices"
    ];
  }
  if (role === "parent") {
    return [
      "checkpoint.md, proof.json, next_action.yaml, commands.md, alignment_review.md",
      "proof statuses must use the exact Meta Harness proof status vocabulary"
    ];
  }
  return [
    "slice packet with changed files, proof statements, validation command outputs, risks, and continuation recommendation",
    "proof statuses must use the exact Meta Harness proof status vocabulary"
  ];
}

async function summarizeProof(
  workspaceRoot: string,
  proofPath: string
): Promise<ContextPackProofState> {
  const proof = await readOptionalJson<ProofLedger>(workspaceRoot, proofPath);
  if (!proof) {
    return { path: proofPath, exists: false, required_claims: 0, statuses: {} };
  }
  const statuses: Record<string, number> = {};
  for (const claim of proof.claims) {
    statuses[claim.status] = (statuses[claim.status] ?? 0) + 1;
  }
  return {
    path: proofPath,
    exists: true,
    required_claims: proof.claims.filter((claim) => claim.required).length,
    statuses
  };
}

async function readOptionalYaml<T>(
  workspaceRoot: string,
  filePath: string
): Promise<T | undefined> {
  try {
    return await readYamlFile<T>(workspaceRoot, filePath);
  } catch {
    return undefined;
  }
}

async function readOptionalJson<T>(
  workspaceRoot: string,
  filePath: string
): Promise<T | undefined> {
  try {
    return await readJsonFile<T>(workspaceRoot, filePath);
  } catch {
    return undefined;
  }
}

function truncate(text: string): { text: string; lineEnd: number; truncated: boolean } {
  const allLines = text.split(/\r?\n/);
  const selectedLines = allLines.slice(0, maxExcerptLines);
  let excerpt = selectedLines.join("\n");
  let truncated = selectedLines.length < allLines.length;
  if (excerpt.length > maxExcerptChars) {
    excerpt = `${excerpt.slice(0, maxExcerptChars)}\n... [truncated]`;
    truncated = true;
  }
  return { text: excerpt, lineEnd: selectedLines.length, truncated };
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
