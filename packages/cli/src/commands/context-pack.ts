import { existsSync } from "node:fs";
import {
  canonicalAgentInstructions,
  HARNESS_PROTOCOL_VERSION,
  readTextFile,
  resolveInsideWorkspace
} from "@meta-harness/core";
import { checkpointPath, CommandContext, emit } from "./common.js";

export interface ContextPackOptions {
  target?: string;
  phase?: string;
  budget?: string | number;
  format?: string;
}

interface ContextPackFile {
  path: string;
  exists: boolean;
  excerpt?: string;
}

interface ContextPack {
  protocol_version: string;
  target: string;
  phase_id: string;
  budget_tokens: number;
  estimated_tokens: number;
  status: "within_budget" | "over_budget";
  objective: string;
  target_guidance: string[];
  required_evidence_statuses: string[];
  validation_commands: string[];
  files: ContextPackFile[];
  safety: string[];
}

const defaultBudget = 8000;
const validFormats = new Set(["markdown", "json"]);

const targetGuidance: Record<string, string[]> = {
  codex: [
    "Use AGENTS.md as the durable instruction surface.",
    "Use filesystem prompts or MCP read tools until codex exec dispatch is locally verified."
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
  const target = normalizeTarget(options.target ?? "generic");
  const phaseId = options.phase ?? "phase_001";
  const format = (options.format ?? "markdown").toLowerCase();
  if (!validFormats.has(format)) {
    throw new Error(`Unknown context-pack format ${options.format}`);
  }
  if (!targetGuidance[target]) {
    throw new Error(`Unknown context-pack target ${options.target}`);
  }

  const budget = parseBudget(options.budget);
  const pack = await buildContextPack(context, { target, phaseId, budget });
  emit(context, format === "json" ? JSON.stringify(pack, null, 2) : renderMarkdown(pack));
}

async function buildContextPack(
  context: CommandContext,
  input: { target: string; phaseId: string; budget: number }
): Promise<ContextPack> {
  const guidance = targetGuidance[input.target];
  if (!guidance) {
    throw new Error(`Unknown context-pack target ${input.target}`);
  }
  const baseFiles = [
    "AGENTS.md",
    "docs/implementation_harness/phase_manifest.yaml",
    ".meta-harness/state.json",
    `${checkpointPath(input.phaseId)}/slice_plan.yaml`,
    `${checkpointPath(input.phaseId)}/next_action.yaml`,
    `${checkpointPath(input.phaseId)}/proof.json`,
    `${checkpointPath(input.phaseId)}/checkpoint.md`
  ];
  const paths = [...new Set([...baseFiles, ...(targetFiles[input.target] ?? [])])];
  const files = await Promise.all(paths.map((filePath) => readExcerpt(context.cwd, filePath)));
  const validationCommands = files
    .find((file) => file.path.endsWith("slice_plan.yaml"))
    ?.excerpt?.match(/command:\s*(.+)/g)
    ?.map((line) => line.replace(/^command:\s*/, "").trim()) ?? [
    "Use the phase slice plan validation commands."
  ];

  const draft: Omit<ContextPack, "estimated_tokens" | "status"> = {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    target: input.target,
    phase_id: input.phaseId,
    budget_tokens: input.budget,
    objective:
      "Execute the current Meta Harness phase or slice with bounded context and evidence-backed proof.",
    target_guidance: guidance,
    required_evidence_statuses: evidenceStatuses,
    validation_commands: validationCommands,
    files,
    safety: [
      "Default external systems to read-only.",
      "Do not claim validation unless a command or review actually ran.",
      "Do not include secrets or full account identifiers in generated artifacts.",
      "Native dispatch remains unverified unless local command evidence proves it."
    ]
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
  return { path: filePath, exists: true, excerpt: truncate(text) };
}

function renderMarkdown(pack: ContextPack): string {
  const fileSections = pack.files
    .map((file) =>
      file.exists
        ? `### ${file.path}\n\n\`\`\`\n${file.excerpt ?? ""}\n\`\`\``
        : `### ${file.path}\n\nMissing from workspace.`
    )
    .join("\n\n");
  return `# Meta Harness Context Pack

Target: ${pack.target}
Phase: ${pack.phase_id}
Budget: ${pack.estimated_tokens}/${pack.budget_tokens} estimated tokens (${pack.status})

## Objective

${pack.objective}

## Non-Negotiables

${canonicalAgentInstructions.trim()}

## Target Guidance

${pack.target_guidance.map((item) => `- ${item}`).join("\n")}

## Required Evidence Statuses

${pack.required_evidence_statuses.map((status) => `- \`${status}\``).join("\n")}

## Validation Commands

${pack.validation_commands.map((command) => `- \`${command}\``).join("\n")}

## Safety

${pack.safety.map((item) => `- ${item}`).join("\n")}

## Relevant Files

${fileSections}
`;
}

function parseBudget(value: string | number | undefined): number {
  if (value === undefined) {
    return defaultBudget;
  }
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Budget must be a positive integer: ${value}`);
  }
  return parsed;
}

function normalizeTarget(value: string): string {
  const target = value.trim().toLowerCase().replace(/_/g, "-");
  if (target === "claude") {
    return "claude-code";
  }
  if (target === "agents") {
    return "codex";
  }
  return target;
}

function truncate(text: string): string {
  const maxChars = 6000;
  const lines = text.split(/\r?\n/).slice(0, 80).join("\n");
  return lines.length > maxChars ? `${lines.slice(0, maxChars)}\n... [truncated]` : lines;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
