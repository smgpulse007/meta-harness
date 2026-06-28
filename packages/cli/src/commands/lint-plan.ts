import { lintSlicePlan } from "@meta-harness/core";
import { CommandContext, emit, readSlicePlan } from "./common.js";

export interface LintPlanOptions {
  phase: string;
}

export async function lintPlanCommand(context: CommandContext, options: LintPlanOptions): Promise<void> {
  const plan = await readSlicePlan(context, options.phase);
  const result = lintSlicePlan(plan);
  emit(context, JSON.stringify(result, null, 2));
  if (!result.ok) {
    throw new Error("Slice plan failed lint gate.");
  }
}
