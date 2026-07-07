import { existsSync } from "node:fs";
import path from "node:path";
import { buildBudgetReport } from "./budget.js";
import { createAdapterRegistry, CommandContext, emit, runGitStatus } from "./common.js";

export async function doctorCommand(context: CommandContext): Promise<void> {
  const registry = await createAdapterRegistry(context.cwd);
  const budget = await buildBudgetReport(context, { phaseId: "phase_001" });
  const report = {
    node: process.version,
    packageInstallStatus: existsSync(path.join(context.cwd, "node_modules"))
      ? "installed"
      : "missing",
    gitStatus: await runGitStatus(context.cwd),
    currentPhase: existsSync(path.join(context.cwd, ".meta-harness", "state.json"))
      ? "see .meta-harness/state.json"
      : "not initialized",
    schemas: existsSync(path.join(context.cwd, "schemas")) ? "present" : "missing",
    adapters: registry.adapters,
    mcpServerReadiness: "stdio read-only mode available after build",
    budgetStatus: budget.status,
    budgetSummary: budget.summary,
    missingRequiredFiles: [
      "README.md",
      "LICENSE",
      "docs/implementation_harness/phase_manifest.yaml",
      ".meta-harness/state.json"
    ].filter((filePath) => !existsSync(path.join(context.cwd, filePath))),
    safetyPolicyStatus: existsSync(
      path.join(context.cwd, "docs/implementation_harness/side_effect_policy.yaml")
    )
      ? "present"
      : "missing"
  };
  emit(context, JSON.stringify(report, null, 2));
}
