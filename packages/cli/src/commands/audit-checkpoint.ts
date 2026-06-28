import { auditCheckpoint, readJsonFile, readYamlFile } from "@meta-harness/core";
import { checkpointPath, CommandContext, emit } from "./common.js";

export interface AuditCheckpointOptions {
  phase: string;
}

export async function auditCheckpointCommand(
  context: CommandContext,
  options: AuditCheckpointOptions
): Promise<void> {
  const proof = await readJsonFile(context.cwd, `${checkpointPath(options.phase)}/proof.json`);
  const nextAction = await readYamlFile(context.cwd, `${checkpointPath(options.phase)}/next_action.yaml`);
  const result = await auditCheckpoint({
    workspaceRoot: context.cwd,
    checkpointPath: checkpointPath(options.phase),
    proof,
    nextAction
  });
  emit(context, JSON.stringify(result, null, 2));
  if (result.status === "blocked" || result.status === "invalid_checkpoint") {
    throw new Error(`Checkpoint audit ${result.status}.`);
  }
}
