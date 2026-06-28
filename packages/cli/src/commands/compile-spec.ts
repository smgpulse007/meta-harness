import { compileRequirementLedger } from "@meta-harness/core";
import { CommandContext, emit } from "./common.js";

export interface CompileSpecOptions {
  spec: string;
  phase?: string;
}

export async function compileSpecCommand(
  context: CommandContext,
  options: CompileSpecOptions
): Promise<void> {
  const ledger = await compileRequirementLedger({
    workspaceRoot: context.cwd,
    specPath: options.spec,
    outputPath: ".meta-harness/requirement_ledger.json",
    phaseId: options.phase ?? "phase_001"
  });
  emit(context, `Compiled ${ledger.requirements.length} requirements.`);
}
