import { ProofLedger, ProofStatus } from "../types.js";
import { ProofLedgerSchema } from "../schemas.js";

const verifiedStatuses = new Set<ProofStatus>([
  "parent_verified",
  "static_verified",
  "command_verified",
  "runtime_verified",
  "human_verified"
]);

export interface ProofGateResult {
  ok: boolean;
  blockingClaims: string[];
  risks: string[];
}

export function validateProofLedger(value: unknown): ProofLedger {
  return ProofLedgerSchema.parse(value);
}

export function evaluateProofGate(ledger: ProofLedger): ProofGateResult {
  const blockingClaims: string[] = [];
  const risks: string[] = [];
  for (const claim of ledger.claims) {
    if (!claim.required) {
      if (claim.status === "partial" || claim.status === "claimed") {
        risks.push(claim.id);
      }
      continue;
    }
    if (!verifiedStatuses.has(claim.status) || claim.evidence.length === 0) {
      blockingClaims.push(claim.id);
    }
  }
  return { ok: blockingClaims.length === 0, blockingClaims, risks };
}
