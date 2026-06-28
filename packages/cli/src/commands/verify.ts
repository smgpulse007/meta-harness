import { FilesystemAdapter } from "@meta-harness/adapters";
import {
  evaluateProofGate,
  lintSlicePlan,
  ProofLedger,
  validateChangedFilesAgainstScope,
  writeJsonFile
} from "@meta-harness/core";
import { checkpointPath, CommandContext, emit, loadOrCreateProof, readSlicePlan } from "./common.js";

export interface VerifyOptions {
  phase: string;
}

export async function verifyCommand(context: CommandContext, options: VerifyOptions): Promise<void> {
  const plan = await readSlicePlan(context, options.phase);
  const planGate = lintSlicePlan(plan);
  const packets = await new FilesystemAdapter().collectPackets({
    workspaceRoot: context.cwd,
    checkpointPath: checkpointPath(options.phase)
  });
  const findings = [...planGate.findings];
  for (const packet of packets) {
    const slice = plan.slices.find((candidate) => candidate.id === packet.packet.slice_id);
    if (!slice) {
      findings.push({
        severity: "error",
        code: "packet_unknown_slice",
        message: `${packet.packet.slice_id} has no matching slice`
      });
      continue;
    }
    const scope = validateChangedFilesAgainstScope({
      changedFiles: packet.packet.changed_files,
      allowedWriteScope: slice.allowed_write_scope,
      forbiddenWriteScope: slice.forbidden_write_scope
    });
    if (!scope.ok) {
      findings.push({
        severity: "error",
        code: "write_scope_violation",
        message: `${packet.packet.slice_id} changed forbidden files: ${scope.violations.join(", ")}`
      });
    }
  }
  const proof: ProofLedger = await loadOrCreateProof(context, options.phase, plan);
  const proofGate = evaluateProofGate(proof);
  if (!proofGate.ok) {
    findings.push({
      severity: "error",
      code: "proof_gate_failed",
      message: proofGate.blockingClaims.join(", ")
    });
  }
  const result = { ok: findings.every((finding) => finding.severity !== "error"), findings };
  await writeJsonFile(context.cwd, `${checkpointPath(options.phase)}/artifacts/verify_result.json`, result);
  emit(context, JSON.stringify(result, null, 2));
  if (!result.ok) {
    throw new Error("Verify gate failed.");
  }
}
