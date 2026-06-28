import { FilesystemAdapter } from "@meta-harness/adapters";
import {
  buildDefaultNextAction,
  HARNESS_PROTOCOL_VERSION,
  ProofLedger,
  writeCheckpoint,
  writeJsonFile,
  writeYamlFile
} from "@meta-harness/core";
import { checkpointPath, CommandContext, emit, loadOrCreateProof, readSlicePlan } from "./common.js";

export interface CheckpointOptions {
  phase: string;
  status?: "complete" | "complete_pending_human_review" | "pass_with_risks" | "blocked" | "failed";
}

export async function checkpointCommand(context: CommandContext, options: CheckpointOptions): Promise<void> {
  const status = options.status ?? "blocked";
  const plan = await readSlicePlan(context, options.phase);
  const packets = await new FilesystemAdapter().collectPackets({
    workspaceRoot: context.cwd,
    checkpointPath: checkpointPath(options.phase)
  });
  const packetClaims = packets.flatMap((packet) => packet.packet.proof_statements);
  const proof: ProofLedger =
    packetClaims.length > 0
      ? {
          protocol_version: HARNESS_PROTOCOL_VERSION,
          phase_id: options.phase,
          claims: packetClaims
        }
      : await loadOrCreateProof(context, options.phase, plan);
  const nextAction = buildDefaultNextAction({
    phaseId: options.phase,
    status,
    autoContinueAllowed: status === "complete",
    humanAcceptanceRequired: status === "complete_pending_human_review",
    humanAcceptancePresent: false,
    risks: packets.flatMap((packet) => packet.packet.risks),
    blockingRisks: status === "blocked" ? ["Checkpoint status is blocked."] : []
  });
  await writeJsonFile(context.cwd, `${checkpointPath(options.phase)}/proof.json`, proof);
  await writeYamlFile(context.cwd, `${checkpointPath(options.phase)}/next_action.yaml`, nextAction);
  await writeCheckpoint({
    workspaceRoot: context.cwd,
    checkpointPath: checkpointPath(options.phase),
    phaseId: options.phase,
    status,
    slicePlan: plan,
    proof,
    nextAction,
    commandLines: packets.flatMap((packet) =>
      packet.packet.validation_command_outputs.map((command) => command.command)
    ),
    changedFiles: packets.flatMap((packet) => packet.packet.changed_files),
    summary: `Checkpoint refreshed from ${packets.length} packet(s).`,
    risks: packets.flatMap((packet) => packet.packet.risks)
  });
  emit(context, `Wrote checkpoint for ${options.phase} with status ${status}.`);
}
