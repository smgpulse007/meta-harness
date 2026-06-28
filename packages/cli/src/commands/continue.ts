import { readYamlFile } from "@meta-harness/core";
import { checkpointPath, CommandContext, emit } from "./common.js";

export interface ContinueOptions {
  phase: string;
  humanAccepted?: boolean;
}

export async function continueCommand(context: CommandContext, options: ContinueOptions): Promise<void> {
  const nextAction = await readYamlFile<any>(
    context.cwd,
    `${checkpointPath(options.phase)}/next_action.yaml`
  );
  const blockingReasons: string[] = [];
  if (!nextAction.auto_continue_allowed) {
    blockingReasons.push("auto_continue_allowed is false");
  }
  if (nextAction.human_acceptance_required && !(options.humanAccepted || nextAction.human_acceptance_present)) {
    blockingReasons.push("human acceptance is required but missing");
  }
  if (nextAction.blocking_risks?.length > 0) {
    blockingReasons.push(...nextAction.blocking_risks);
  }
  if (!nextAction.next_phase_id && nextAction.allowed_next_transition !== "stop") {
    blockingReasons.push("next phase is missing");
  }
  if (blockingReasons.length > 0) {
    emit(context, JSON.stringify({ allowed: false, blockingReasons }, null, 2));
    throw new Error("Continuation blocked.");
  }
  emit(context, JSON.stringify({ allowed: true, nextPhaseId: nextAction.next_phase_id }, null, 2));
}
