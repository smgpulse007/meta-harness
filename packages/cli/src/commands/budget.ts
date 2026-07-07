import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  HARNESS_PROTOCOL_VERSION,
  readTextFile,
  resolveInsideWorkspace,
  writeTextFile
} from "@meta-harness/core";
import { buildContextPack, estimateTokens } from "./context-pack.js";
import { CommandContext, emit } from "./common.js";

export interface BudgetOptions {
  json?: boolean;
  strict?: boolean;
  phase?: string;
  output?: string;
}

type BudgetStatus = "within_budget" | "warning" | "over_budget" | "missing";
type BudgetClass =
  | "instruction_index"
  | "skill_metadata"
  | "skill_body"
  | "mcp_instructions"
  | "phase_pack"
  | "slice_pack"
  | "review_pack"
  | "evidence_excerpt"
  | "raw_artifact";

interface BudgetItem {
  budget_class: BudgetClass;
  path: string;
  label?: string;
  status: BudgetStatus;
  bytes?: number;
  lines?: number;
  estimated_tokens?: number;
  target?: number;
  warning?: number;
  metric: "bytes" | "tokens" | "lines" | "chars" | "stored_only";
  notes: string[];
}

export interface BudgetReport {
  protocol_version: string;
  status: "within_budget" | "warning" | "over_budget";
  summary: {
    total_items: number;
    within_budget: number;
    warnings: number;
    over_budget: number;
    missing: number;
  };
  items: BudgetItem[];
}

const instructionFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  ".cursor/rules/meta-harness.mdc",
  ".github/copilot-instructions.md",
  ".github/instructions/meta-harness.instructions.md",
  ".windsurf/rules/meta-harness.md",
  ".continue/rules/meta-harness.md",
  ".opencode/instructions/meta-harness.md",
  ".roo/rules/meta-harness.md"
];

const skillFiles = [
  "skills/meta-harness/SKILL.md",
  ".agents/skills/meta-harness/SKILL.md",
  ".claude/skills/meta-harness/SKILL.md"
];

export async function budgetCommand(
  context: CommandContext,
  options: BudgetOptions = {}
): Promise<void> {
  const report = await buildBudgetReport(context, { phaseId: options.phase ?? "phase_001" });
  let rendered: string;
  if (options.json) {
    rendered = `${JSON.stringify(report, null, 2)}\n`;
  } else {
    rendered = renderBudgetReport(report);
  }
  if (options.output) {
    await writeTextFile(context.cwd, options.output, rendered);
    emit(context, `Wrote budget report to ${options.output}`);
  } else {
    emit(context, rendered);
  }
  if (report.summary.over_budget > 0 || report.summary.missing > 0) {
    process.exitCode = 1;
    return;
  }
  if (options.strict && report.summary.warnings > 0) {
    process.exitCode = 1;
  }
}

export async function buildBudgetReport(
  context: CommandContext,
  input: { phaseId: string }
): Promise<BudgetReport> {
  const items: BudgetItem[] = [];
  for (const filePath of instructionFiles) {
    items.push(
      await fileBudgetItem(
        context.cwd,
        filePath,
        "instruction_index",
        "bytes",
        16 * 1024,
        32 * 1024
      )
    );
  }
  for (const filePath of skillFiles) {
    items.push(await fileBudgetItem(context.cwd, filePath, "skill_body", "tokens", 5000, 6000));
    items.push(await skillMetadataItem(context.cwd, filePath));
  }
  items.push(...(await mcpDescriptionItems(context.cwd)));
  items.push(...(await contextPackItems(context, input.phaseId)));
  items.push(...(await evidenceExcerptItems(context.cwd)));
  items.push(...(await rawArtifactItems(context.cwd)));

  const summary = {
    total_items: items.length,
    within_budget: items.filter((item) => item.status === "within_budget").length,
    warnings: items.filter((item) => item.status === "warning").length,
    over_budget: items.filter((item) => item.status === "over_budget").length,
    missing: items.filter((item) => item.status === "missing").length
  };
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    status:
      summary.over_budget > 0 || summary.missing > 0
        ? "over_budget"
        : summary.warnings > 0
          ? "warning"
          : "within_budget",
    summary,
    items
  };
}

function renderBudgetReport(report: BudgetReport): string {
  const rows = report.items.map(
    (item) =>
      `- [${item.status}] ${item.budget_class} ${item.path}${item.label ? `#${item.label}` : ""}: ${metricValue(item)}${item.notes.length > 0 ? ` (${item.notes.join("; ")})` : ""}`
  );
  return `Meta Harness budget status: ${report.status}

Items: ${report.summary.total_items}
Warnings: ${report.summary.warnings}
Over budget: ${report.summary.over_budget}
Missing: ${report.summary.missing}

${rows.join("\n")}
`;
}

async function fileBudgetItem(
  workspaceRoot: string,
  filePath: string,
  budgetClass: BudgetClass,
  metric: "bytes" | "tokens",
  target: number,
  warning: number
): Promise<BudgetItem> {
  if (!existsSync(resolveInsideWorkspace(workspaceRoot, filePath))) {
    return missingItem(filePath, budgetClass, metric, target, warning);
  }
  const text = await readTextFile(workspaceRoot, filePath);
  const bytes = Buffer.byteLength(text, "utf8");
  const estimatedTokens = estimateTokens(text);
  const value = metric === "bytes" ? bytes : estimatedTokens;
  return {
    budget_class: budgetClass,
    path: filePath,
    status: budgetStatus(value, target, warning),
    bytes,
    lines: lineCount(text),
    estimated_tokens: estimatedTokens,
    target,
    warning,
    metric,
    notes: []
  };
}

async function skillMetadataItem(workspaceRoot: string, filePath: string): Promise<BudgetItem> {
  if (!existsSync(resolveInsideWorkspace(workspaceRoot, filePath))) {
    return missingItem(filePath, "skill_metadata", "tokens", 100, 150);
  }
  const text = await readTextFile(workspaceRoot, filePath);
  const metadata = text.split(/\n##\s+/)[0] ?? text;
  const estimatedTokens = estimateTokens(metadata);
  return {
    budget_class: "skill_metadata",
    path: filePath,
    label: "metadata",
    status: budgetStatus(estimatedTokens, 100, 150),
    bytes: Buffer.byteLength(metadata, "utf8"),
    lines: lineCount(metadata),
    estimated_tokens: estimatedTokens,
    target: 100,
    warning: 150,
    metric: "tokens",
    notes: []
  };
}

async function mcpDescriptionItems(workspaceRoot: string): Promise<BudgetItem[]> {
  const filePath = "packages/mcp-server/src/server.ts";
  if (!existsSync(resolveInsideWorkspace(workspaceRoot, filePath))) {
    return [missingItem(filePath, "mcp_instructions", "chars", 512, 512)];
  }
  const text = await readTextFile(workspaceRoot, filePath);
  const matches = [...text.matchAll(/description:\s*"([^"]+)"/g)];
  return matches.map((match, index) => {
    const description = match[1] ?? "";
    const length = description.length;
    return {
      budget_class: "mcp_instructions",
      path: filePath,
      label: `description_${index + 1}`,
      status: length <= 512 ? "within_budget" : "over_budget",
      bytes: Buffer.byteLength(description, "utf8"),
      lines: 1,
      estimated_tokens: estimateTokens(description),
      target: 512,
      warning: 512,
      metric: "chars",
      notes: ["Each MCP tool description must fit in a compact host-visible description."]
    };
  });
}

async function contextPackItems(context: CommandContext, phaseId: string): Promise<BudgetItem[]> {
  const packs = [
    { target: "codex", role: "worker" as const, budget: 8000, budgetClass: "slice_pack" as const },
    {
      target: "claude-code",
      role: "reviewer" as const,
      budget: 8000,
      budgetClass: "review_pack" as const
    },
    {
      target: "generic",
      role: "parent" as const,
      budget: 12000,
      budgetClass: "phase_pack" as const
    }
  ];
  const items: BudgetItem[] = [];
  for (const packInput of packs) {
    const pack = await buildContextPack(context, {
      target: packInput.target,
      role: packInput.role,
      phaseId,
      budget: packInput.budget
    });
    items.push({
      budget_class: packInput.budgetClass,
      path: `generated:${packInput.target}:${packInput.role}`,
      status:
        pack.status === "within_budget"
          ? nearBudgetStatus(pack.estimated_tokens, pack.budget_tokens)
          : "over_budget",
      estimated_tokens: pack.estimated_tokens,
      target: Math.floor(pack.budget_tokens * 0.9),
      warning: pack.budget_tokens,
      metric: "tokens",
      notes: [
        `${pack.files.length} file references; raw artifacts included: ${pack.budget_summary.raw_artifacts_included}`
      ]
    });
  }
  return items;
}

async function evidenceExcerptItems(workspaceRoot: string): Promise<BudgetItem[]> {
  const files = await collectMatchingFiles(workspaceRoot, "docs/checkpoints", (filePath) =>
    filePath.endsWith("commands.md")
  );
  const items: BudgetItem[] = [];
  for (const filePath of files.sort()) {
    const text = await readTextFile(workspaceRoot, filePath);
    const bytes = Buffer.byteLength(text, "utf8");
    const lines = lineCount(text);
    const status = bytes > 12 * 1024 || lines > 200 ? "over_budget" : "within_budget";
    items.push({
      budget_class: "evidence_excerpt",
      path: filePath,
      status,
      bytes,
      lines,
      estimated_tokens: estimateTokens(text),
      target: 200,
      warning: 200,
      metric: "lines",
      notes: [
        "Checkpoint command summaries should stay excerpt-sized; raw logs belong in artifacts."
      ]
    });
  }
  return items;
}

async function rawArtifactItems(workspaceRoot: string): Promise<BudgetItem[]> {
  const files = await collectMatchingFiles(workspaceRoot, ".meta-harness", (filePath) =>
    filePath.endsWith("command_log.jsonl")
  );
  return files.sort().map((filePath) => ({
    budget_class: "raw_artifact",
    path: filePath,
    status: "within_budget",
    metric: "stored_only",
    notes: ["Raw artifacts are referenced by path and are not included in context packs."]
  }));
}

async function collectMatchingFiles(
  workspaceRoot: string,
  startPath: string,
  predicate: (filePath: string) => boolean
): Promise<string[]> {
  const absoluteStart = resolveInsideWorkspace(workspaceRoot, startPath);
  if (!existsSync(absoluteStart)) {
    return [];
  }
  const output: string[] = [];
  async function visit(absoluteDir: string): Promise<void> {
    for (const entry of await readdir(absoluteDir, { withFileTypes: true })) {
      const absolutePath = path.join(absoluteDir, entry.name);
      const relativePath = path.relative(workspaceRoot, absolutePath).replaceAll("\\", "/");
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (predicate(relativePath)) {
        output.push(relativePath);
      }
    }
  }
  await visit(absoluteStart);
  return output;
}

function missingItem(
  filePath: string,
  budgetClass: BudgetClass,
  metric: BudgetItem["metric"],
  target: number,
  warning: number
): BudgetItem {
  return {
    budget_class: budgetClass,
    path: filePath,
    status: "missing",
    target,
    warning,
    metric,
    notes: ["Expected budget target is missing."]
  };
}

function budgetStatus(value: number, target: number, warning: number): BudgetStatus {
  if (value > warning) {
    return "over_budget";
  }
  if (value > target) {
    return "warning";
  }
  return "within_budget";
}

function nearBudgetStatus(value: number, budget: number): BudgetStatus {
  if (value > budget) {
    return "over_budget";
  }
  if (value > Math.floor(budget * 0.9)) {
    return "warning";
  }
  return "within_budget";
}

function lineCount(text: string): number {
  return text.length === 0 ? 0 : text.split(/\r?\n/).length;
}

function metricValue(item: BudgetItem): string {
  if (item.metric === "stored_only") {
    return "stored on disk";
  }
  const value =
    item.metric === "bytes"
      ? item.bytes
      : item.metric === "lines"
        ? item.lines
        : item.metric === "tokens"
          ? item.estimated_tokens
          : item.bytes;
  return `${value ?? 0}/${item.warning ?? item.target ?? 0} ${item.metric}`;
}
