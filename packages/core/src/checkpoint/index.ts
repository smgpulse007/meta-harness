import { writeJsonFile, writeTextFile, writeYamlFile } from "../filesystem/index.js";
import {
  HARNESS_PROTOCOL_VERSION,
  NextAction,
  PhaseTerminalStatus,
  ProofLedger,
  SlicePlan
} from "../types.js";

export interface CheckpointWriteInput {
  workspaceRoot: string;
  checkpointPath: string;
  phaseId: string;
  status: PhaseTerminalStatus;
  slicePlan: SlicePlan;
  proof: ProofLedger;
  nextAction: NextAction;
  commandLines: string[];
  changedFiles: string[];
  summary: string;
  risks: string[];
}

export async function writeCheckpoint(input: CheckpointWriteInput): Promise<string[]> {
  const written: string[] = [];
  const base = input.checkpointPath.replace(/\/$/, "");
  written.push(
    await writeTextFile(
      input.workspaceRoot,
      `${base}/checkpoint.md`,
      `# Checkpoint ${input.phaseId}

Status: ${input.status}

${input.summary}

## Risks

${input.risks.length === 0 ? "- None recorded." : input.risks.map((risk) => `- ${risk}`).join("\n")}
`
    )
  );
  written.push(await writeJsonFile(input.workspaceRoot, `${base}/proof.json`, input.proof));
  written.push(await writeYamlFile(input.workspaceRoot, `${base}/next_action.yaml`, input.nextAction));
  written.push(await writeYamlFile(input.workspaceRoot, `${base}/slice_plan.yaml`, input.slicePlan));
  written.push(
    await writeTextFile(
      input.workspaceRoot,
      `${base}/rollup.md`,
      `# Rollup ${input.phaseId}

${input.summary}
`
    )
  );
  written.push(
    await writeTextFile(
      input.workspaceRoot,
      `${base}/commands.md`,
      `# Commands

${input.commandLines.length === 0 ? "- Not run." : input.commandLines.map((command) => `- \`${command}\``).join("\n")}
`
    )
  );
  written.push(
    await writeTextFile(
      input.workspaceRoot,
      `${base}/diff_summary.md`,
      `# Diff Summary

${input.changedFiles.length === 0 ? "- No changed files recorded." : input.changedFiles.map((file) => `- ${file}`).join("\n")}
`
    )
  );
  written.push(
    await writeTextFile(
      input.workspaceRoot,
      `${base}/alignment_review.md`,
      `# Alignment Review

- Phase: ${input.phaseId}
- Protocol version: ${HARNESS_PROTOCOL_VERSION}
- Evidence status: see proof.json.
`
    )
  );
  written.push(
    await writeTextFile(
      input.workspaceRoot,
      `${base}/delegation_review.md`,
      `# Delegation Review

- Delegation is represented by slice packets under subagent_packets.
- Parent-owned implementation exceptions must be documented in packets.
`
    )
  );
  written.push(
    await writeTextFile(
      input.workspaceRoot,
      `${base}/expert_panel.md`,
      `# Expert Panel

- Protocol reviewer: checks schema, proof, checkpoint, and continuation gates.
- Safety reviewer: checks side-effect policy and secret redaction.
- Release reviewer: checks package metadata, docs, tests, and CI readiness.
`
    )
  );
  return written;
}

export function buildDefaultNextAction(input: {
  phaseId: string;
  status: PhaseTerminalStatus;
  nextPhaseId?: string;
  autoContinueAllowed?: boolean;
  humanAcceptanceRequired?: boolean;
  humanAcceptancePresent?: boolean;
  risks?: string[];
  blockingRisks?: string[];
}): NextAction {
  const hasNextPhase = input.nextPhaseId !== undefined && input.nextPhaseId.length > 0;
  const humanAcceptanceRequired = input.humanAcceptanceRequired ?? false;
  const humanAcceptancePresent = input.humanAcceptancePresent ?? false;
  const autoContinueAllowed =
    (input.autoContinueAllowed ?? false) &&
    hasNextPhase &&
    (!humanAcceptanceRequired || humanAcceptancePresent) &&
    (input.blockingRisks ?? []).length === 0;
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    current_phase_id: input.phaseId,
    current_phase_status: input.status,
    auto_continue_allowed: autoContinueAllowed,
    next_phase_id: input.nextPhaseId,
    human_acceptance_required: humanAcceptanceRequired,
    human_acceptance_present: humanAcceptancePresent,
    required_files_to_read: [
      "docs/implementation_harness/phase_manifest.yaml",
      `.meta-harness/checkpoints/${input.phaseId}/checkpoint.md`,
      `.meta-harness/checkpoints/${input.phaseId}/proof.json`,
      `.meta-harness/checkpoints/${input.phaseId}/next_action.yaml`
    ],
    carry_forward_risks: input.risks ?? [],
    blocking_risks: input.blockingRisks ?? [],
    required_validation_preface: ["Run mh doctor and mh audit-checkpoint before continuation."],
    allowed_next_transition: hasNextPhase ? `continue:${input.nextPhaseId}` : "stop"
  };
}
