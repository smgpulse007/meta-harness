import { existsSync } from "node:fs";
import path from "node:path";
import { HARNESS_PROTOCOL_VERSION, readJsonFile } from "@meta-harness/core";
import { buildBudgetReport } from "./budget.js";
import { createAdapterRegistry, CommandContext, emit, runGitStatus } from "./common.js";

export interface DoctorOptions {
  json?: boolean;
  phase?: string;
}

type DoctorStatus = "ok" | "warning" | "error";

export interface DoctorCheck {
  id: string;
  status: DoctorStatus;
  summary: string;
  evidence?: string | undefined;
  remediation?: string | undefined;
}

export interface DoctorReport {
  protocol_version: string;
  status: DoctorStatus;
  summary: {
    ok: number;
    warnings: number;
    errors: number;
  };
  environment: {
    node: string;
    packageInstallStatus: "installed" | "missing";
    gitStatus: string;
    currentPhase: string;
    schemas: "present" | "missing";
    mcpServerReadiness: string;
    safetyPolicyStatus: "present" | "missing";
    phaseId: string;
  };
  checks: DoctorCheck[];
  adapters: Awaited<ReturnType<typeof createAdapterRegistry>>["adapters"];
  budgetStatus: string;
  budgetSummary: Awaited<ReturnType<typeof buildBudgetReport>>["summary"];
  missingRequiredFiles: string[];
}

export async function doctorCommand(
  context: CommandContext,
  options: DoctorOptions = {}
): Promise<void> {
  const report = await buildDoctorReport(context, options);
  emit(context, JSON.stringify(report, null, 2));
}

export async function buildDoctorReport(
  context: CommandContext,
  options: DoctorOptions = {}
): Promise<DoctorReport> {
  const registry = await createAdapterRegistry(context.cwd);
  const state = await readOptionalState(context.cwd);
  const phaseId = options.phase ?? state?.current_phase_id ?? "phase_001";
  const budget = await buildBudgetReport(context, { phaseId });
  const gitStatus = await runGitStatus(context.cwd);
  const packageInstallStatus = existsSync(path.join(context.cwd, "node_modules"))
    ? "installed"
    : "missing";
  const currentPhase = state?.current_phase_id ?? "not initialized";
  const schemas = existsSync(path.join(context.cwd, "schemas")) ? "present" : "missing";
  const safetyPolicyStatus = existsSync(
    path.join(context.cwd, "docs/implementation_harness/side_effect_policy.yaml")
  )
    ? "present"
    : "missing";
  const missingRequiredFiles = [
    "README.md",
    "LICENSE",
    "docs/implementation_harness/phase_manifest.yaml",
    ".meta-harness/state.json"
  ].filter((filePath) => !existsSync(path.join(context.cwd, filePath)));
  const checks: DoctorCheck[] = [
    nodeCheck(),
    {
      id: "package_install",
      status: packageInstallStatus === "installed" ? "ok" : "warning",
      summary:
        packageInstallStatus === "installed"
          ? "node_modules is present."
          : "node_modules is missing.",
      evidence: "node_modules",
      remediation:
        packageInstallStatus === "installed" ? undefined : "Run pnpm install --frozen-lockfile."
    },
    {
      id: "git_status",
      status:
        gitStatus.startsWith("git status unavailable") || hasDirtyGitStatus(gitStatus)
          ? "warning"
          : "ok",
      summary: gitStatus.startsWith("git status unavailable")
        ? "Git status is unavailable."
        : hasDirtyGitStatus(gitStatus)
          ? "Git worktree has uncommitted changes."
          : "Git worktree is clean.",
      evidence: gitStatus,
      remediation:
        gitStatus.startsWith("git status unavailable") || hasDirtyGitStatus(gitStatus)
          ? "Review git status before dispatching or checkpointing phase work."
          : undefined
    },
    {
      id: "harness_initialized",
      status: currentPhase === "not initialized" ? "warning" : "ok",
      summary:
        currentPhase === "not initialized"
          ? "Harness state has not been initialized in this workspace."
          : "Harness state file is present.",
      evidence: ".meta-harness/state.json",
      remediation: currentPhase === "not initialized" ? "Run mh init --profile strict." : undefined
    },
    fileCheck(
      "schemas",
      schemas === "present",
      "schemas/",
      "Schema directory is present.",
      "Schema directory is missing."
    ),
    fileCheck(
      "phase_manifest",
      !missingRequiredFiles.includes("docs/implementation_harness/phase_manifest.yaml"),
      "docs/implementation_harness/phase_manifest.yaml",
      "Phase manifest is present.",
      "Phase manifest is missing."
    ),
    fileCheck(
      "safety_policy",
      safetyPolicyStatus === "present",
      "docs/implementation_harness/side_effect_policy.yaml",
      "Side-effect policy is present.",
      "Side-effect policy is missing."
    ),
    {
      id: "mcp_server",
      status: existsSync(path.join(context.cwd, "packages/cli/dist/index.js")) ? "ok" : "warning",
      summary: existsSync(path.join(context.cwd, "packages/cli/dist/index.js"))
        ? "Built CLI entrypoint is available for stdio MCP startup."
        : "Built CLI entrypoint is missing; MCP stdio startup needs a build first.",
      evidence: "packages/cli/dist/index.js",
      remediation: existsSync(path.join(context.cwd, "packages/cli/dist/index.js"))
        ? undefined
        : "Run pnpm build before starting mh mcp --stdio from a source checkout."
    },
    {
      id: "budget",
      status:
        budget.summary.over_budget > 0
          ? "error"
          : budget.summary.missing > 0 || budget.summary.warnings > 0
            ? "warning"
            : "ok",
      summary: `Budget status ${budget.status}: ${budget.summary.within_budget}/${budget.summary.total_items} within budget, ${budget.summary.warnings} warnings, ${budget.summary.over_budget} over-budget, ${budget.summary.missing} missing.`,
      evidence: "mh budget --json",
      remediation:
        budget.summary.over_budget > 0 || budget.summary.missing > 0 || budget.summary.warnings > 0
          ? "Run mh budget --json, then trim over-budget files or generate missing instruction/skill artifacts."
          : undefined
    },
    {
      id: "adapters",
      status: registry.adapters.length > 0 ? "ok" : "error",
      summary: `${registry.adapters.length} adapter registry entries detected.`,
      evidence: registry.adapters
        .map((adapter) => `${adapter.id}:${adapter.availability}`)
        .join(", "),
      remediation:
        registry.adapters.length > 0
          ? undefined
          : "Rebuild adapter registry support before dispatch."
    }
  ];
  const summary = {
    ok: checks.filter((check) => check.status === "ok").length,
    warnings: checks.filter((check) => check.status === "warning").length,
    errors: checks.filter((check) => check.status === "error").length
  };
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    status: summary.errors > 0 ? "error" : summary.warnings > 0 ? "warning" : "ok",
    summary,
    environment: {
      node: process.version,
      packageInstallStatus,
      gitStatus,
      currentPhase,
      schemas,
      mcpServerReadiness: "stdio read-only mode available after build",
      safetyPolicyStatus,
      phaseId
    },
    checks,
    adapters: registry.adapters,
    budgetStatus: budget.status,
    budgetSummary: budget.summary,
    missingRequiredFiles
  };
}

function nodeCheck(): DoctorCheck {
  const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
  return {
    id: "node_version",
    status: major >= 22 ? "ok" : "error",
    summary: `Node ${process.version} detected; Meta Harness requires Node >=22.`,
    evidence: "process.version",
    remediation: major >= 22 ? undefined : "Install Node 22 or newer and rerun the command."
  };
}

function fileCheck(
  id: string,
  present: boolean,
  evidence: string,
  okSummary: string,
  missingSummary: string
): DoctorCheck {
  return {
    id,
    status: present ? "ok" : "error",
    summary: present ? okSummary : missingSummary,
    evidence,
    remediation: present ? undefined : `Restore or generate ${evidence}.`
  };
}

function hasDirtyGitStatus(gitStatus: string): boolean {
  const lines = gitStatus.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.some((line) => !line.startsWith("## "));
}

/*
  Deprecated top-level fields kept in the report through environment, adapters,
  budgetSummary, and missingRequiredFiles so current consumers can migrate
  without losing data.
*/
export async function legacyDoctorShape(context: CommandContext) {
  const report = await buildDoctorReport(context);
  return {
    node: process.version,
    packageInstallStatus: report.environment.packageInstallStatus,
    gitStatus: report.environment.gitStatus,
    currentPhase: report.environment.currentPhase,
    schemas: report.environment.schemas,
    adapters: report.adapters,
    mcpServerReadiness: "stdio read-only mode available after build",
    budgetStatus: report.budgetStatus,
    budgetSummary: report.budgetSummary,
    missingRequiredFiles: report.missingRequiredFiles,
    safetyPolicyStatus: report.environment.safetyPolicyStatus
  };
}

async function readOptionalState(
  cwd: string
): Promise<{ current_phase_id?: string | undefined } | undefined> {
  try {
    return await readJsonFile<{ current_phase_id?: string | undefined }>(
      cwd,
      ".meta-harness/state.json"
    );
  } catch {
    return undefined;
  }
}
