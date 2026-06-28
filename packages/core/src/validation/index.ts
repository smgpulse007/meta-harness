import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { analyzeSliceDag, detectWriteScopeOverlaps } from "../dag/index.js";
import { resolveInsideWorkspace } from "../filesystem/index.js";
import { evaluateProofGate } from "../proof/index.js";
import { NextActionSchema, ProofLedgerSchema, SlicePacketSchema, SlicePlanSchema } from "../schemas.js";
import { NextAction, ProofLedger, SlicePacket, SlicePlan } from "../types.js";

export interface GateFinding {
  severity: "error" | "warning";
  code: string;
  message: string;
}

export interface GateResult {
  ok: boolean;
  findings: GateFinding[];
}

export function lintSlicePlan(value: unknown): GateResult {
  const findings: GateFinding[] = [];
  const parsed = SlicePlanSchema.safeParse(value);
  if (!parsed.success) {
    findings.push({
      severity: "error",
      code: "schema_invalid",
      message: parsed.error.issues.map((issue) => issue.message).join("; ")
    });
    return { ok: false, findings };
  }
  const plan = parsed.data as SlicePlan;
  const ids = new Set(plan.slices.map((slice) => slice.id));
  const dag = analyzeSliceDag(plan);
  for (const cycle of dag.cycles) {
    findings.push({
      severity: "error",
      code: "dependency_cycle",
      message: `Dependency cycle detected: ${cycle.join(" -> ")}`
    });
  }
  for (const slice of plan.slices) {
    for (const dependency of slice.dependencies) {
      if (!ids.has(dependency)) {
        findings.push({
          severity: "error",
          code: "missing_dependency",
          message: `${slice.id} depends on unknown slice ${dependency}`
        });
      }
    }
    if (!slice.owner.trim()) {
      findings.push({ severity: "error", code: "missing_owner", message: `${slice.id} has no owner` });
    }
    if (slice.validation_commands.length === 0) {
      findings.push({
        severity: "error",
        code: "missing_validation",
        message: `${slice.id} has no validation commands`
      });
    }
    if (slice.allowed_write_scope.length === 0) {
      findings.push({
        severity: "error",
        code: "missing_write_scope",
        message: `${slice.id} has no allowed write scope`
      });
    }
    if (slice.spec_refs.length === 0) {
      findings.push({
        severity: "error",
        code: "missing_spec_refs",
        message: `${slice.id} has no spec references`
      });
    }
    if (slice.packet_required !== true) {
      findings.push({
        severity: "warning",
        code: "packet_not_required",
        message: `${slice.id} does not require a packet`
      });
    }
  }
  for (const overlap of detectWriteScopeOverlaps(plan)) {
    findings.push({
      severity: "warning",
      code: "parallel_write_overlap",
      message: `${overlap.left} and ${overlap.right} can run in parallel and both touch ${overlap.scope}`
    });
  }
  return { ok: findings.every((finding) => finding.severity !== "error"), findings };
}

export function validatePacket(value: unknown): SlicePacket {
  return SlicePacketSchema.parse(value);
}

export type CheckpointAuditStatus = "pass" | "pass_with_risks" | "blocked" | "invalid_checkpoint";

export interface CheckpointAuditResult {
  status: CheckpointAuditStatus;
  findings: GateFinding[];
}

const requiredCheckpointFiles = [
  "checkpoint.md",
  "proof.json",
  "next_action.yaml",
  "rollup.md",
  "commands.md",
  "diff_summary.md",
  "alignment_review.md",
  "delegation_review.md",
  "expert_panel.md",
  "slice_plan.yaml"
];

const requiredCheckpointDirs = ["subagent_packets", "artifacts"];

export async function auditCheckpoint(input: {
  workspaceRoot: string;
  checkpointPath: string;
  proof: unknown;
  nextAction: unknown;
}): Promise<CheckpointAuditResult> {
  const findings: GateFinding[] = [];
  let status: CheckpointAuditStatus = "pass";
  const checkpointDir = resolveInsideWorkspace(input.workspaceRoot, input.checkpointPath);
  for (const file of requiredCheckpointFiles) {
    if (!existsSync(path.join(checkpointDir, file))) {
      findings.push({
        severity: "error",
        code: "missing_checkpoint_file",
        message: `${file} is missing`
      });
    }
  }
  for (const dir of requiredCheckpointDirs) {
    const dirPath = path.join(checkpointDir, dir);
    if (!existsSync(dirPath)) {
      findings.push({
        severity: "error",
        code: "missing_checkpoint_dir",
        message: `${dir}/ is missing`
      });
    }
  }
  const proofParsed = ProofLedgerSchema.safeParse(input.proof);
  const nextParsed = NextActionSchema.safeParse(input.nextAction);
  let planParsed: ReturnType<typeof SlicePlanSchema.safeParse> | undefined;
  try {
    planParsed = SlicePlanSchema.safeParse(
      YAML.parse(await readFile(path.join(checkpointDir, "slice_plan.yaml"), "utf8"))
    );
    if (!planParsed.success) {
      findings.push({
        severity: "error",
        code: "invalid_slice_plan",
        message: planParsed.error.issues.map((issue) => issue.message).join("; ")
      });
    }
  } catch (error) {
    findings.push({
      severity: "error",
      code: "invalid_slice_plan",
      message: (error as Error).message
    });
  }
  const packets: SlicePacket[] = [];
  const packetDir = path.join(checkpointDir, "subagent_packets");
  if (existsSync(packetDir)) {
    const packetFiles = (await readdir(packetDir)).filter((file) => file.endsWith(".packet.yaml"));
    for (const packetFile of packetFiles) {
      const parsedPacket = SlicePacketSchema.safeParse(
        YAML.parse(await readFile(path.join(packetDir, packetFile), "utf8"))
      );
      if (!parsedPacket.success) {
        findings.push({
          severity: "error",
          code: "invalid_slice_packet",
          message: `${packetFile}: ${parsedPacket.error.issues.map((issue) => issue.message).join("; ")}`
        });
      } else {
        packets.push(parsedPacket.data as SlicePacket);
      }
    }
  }
  const artifactDir = path.join(checkpointDir, "artifacts");
  if (existsSync(artifactDir)) {
    const artifactFiles = (await readdir(artifactDir)).filter((file) => file !== ".gitkeep");
    if (artifactFiles.length === 0) {
      findings.push({
        severity: "warning",
        code: "empty_artifacts_dir",
        message: "artifacts/ contains no evidence files beyond placeholders"
      });
    }
  }
  if (!proofParsed.success) {
    findings.push({
      severity: "error",
      code: "invalid_proof",
      message: proofParsed.error.issues.map((issue) => issue.message).join("; ")
    });
  }
  if (!nextParsed.success) {
    findings.push({
      severity: "error",
      code: "invalid_next_action",
      message: nextParsed.error.issues.map((issue) => issue.message).join("; ")
    });
  }
  if (proofParsed.success) {
    const proofGate = evaluateProofGate(proofParsed.data as ProofLedger);
    if (!proofGate.ok) {
      findings.push({
        severity: "error",
        code: "proof_gate_failed",
        message: `Required claims are not verified: ${proofGate.blockingClaims.join(", ")}`
      });
    }
    for (const risk of proofGate.risks) {
      findings.push({
        severity: "warning",
        code: "proof_risk",
        message: `Optional or non-blocking proof claim is weak: ${risk}`
      });
    }
  }
  if (nextParsed.success) {
    const nextAction = nextParsed.data as NextAction;
    if (nextAction.auto_continue_allowed && !nextAction.next_phase_id) {
      findings.push({
        severity: "error",
        code: "continuation_without_next_phase",
        message: "auto_continue_allowed is true but next_phase_id is missing"
      });
    }
    if (nextAction.human_acceptance_required && !nextAction.human_acceptance_present) {
      findings.push({
        severity: "error",
        code: "human_acceptance_missing",
        message: "Human acceptance is required but not present"
      });
    }
    if (nextAction.blocking_risks.length > 0) {
      findings.push({
        severity: "error",
        code: "blocking_risks_present",
        message: nextAction.blocking_risks.join("; ")
      });
    }
    if (nextAction.carry_forward_risks.length > 0) {
      findings.push({
        severity: "warning",
        code: "carry_forward_risks_present",
        message: nextAction.carry_forward_risks.join("; ")
      });
    }
    if (planParsed?.success) {
      const requiredPacketSliceIds = new Set(
        (planParsed.data as SlicePlan).slices
          .filter((slice) => slice.packet_required)
          .map((slice) => slice.id)
      );
      const packetSliceIds = new Set(packets.map((packet) => packet.slice_id));
      for (const requiredPacketSliceId of requiredPacketSliceIds) {
        if (!packetSliceIds.has(requiredPacketSliceId)) {
          findings.push({
            severity: "error",
            code: "missing_required_packet",
            message: `Required packet missing for ${requiredPacketSliceId}`
          });
        }
      }
    }
    if (nextAction.current_phase_status === "complete") {
      const simulatedCommands = packets.flatMap((packet) =>
        packet.validation_command_outputs
          .filter((command) => command.evidence_kind === "simulation")
          .map((command) => `${packet.slice_id}:${command.id}`)
      );
      if (simulatedCommands.length > 0) {
        findings.push({
          severity: "error",
          code: "simulated_command_evidence_for_complete",
          message: `Complete checkpoints cannot rely on simulated command evidence: ${simulatedCommands.join(", ")}`
        });
      }
    }
  }
  if (
    findings.some(
      (finding) =>
        finding.code.startsWith("invalid") ||
        finding.code === "missing_checkpoint_file" ||
        finding.code === "missing_checkpoint_dir"
    )
  ) {
    status = "invalid_checkpoint";
  } else if (findings.some((finding) => finding.severity === "error")) {
    status = "blocked";
  } else if (findings.some((finding) => finding.severity === "warning")) {
    status = "pass_with_risks";
  }
  return { status, findings };
}
