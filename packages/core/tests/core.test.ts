import { describe, expect, it } from "vitest";
import {
  analyzeSliceDag,
  auditCheckpoint,
  buildDefaultNextAction,
  HARNESS_PROTOCOL_VERSION,
  lintSlicePlan,
  ProofLedger,
  requestWriteLock,
  SlicePlan,
  transitionState,
  validateChangedFilesAgainstScope,
  evaluateDangerousOperations,
  defaultSideEffectPolicy,
  redactSecrets
} from "../src/index.js";

function validPlan(): SlicePlan {
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    phase_id: "phase_001",
    slices: [
      {
        id: "slice_a",
        phase_id: "phase_001",
        title: "A",
        objective: "Do A",
        owner: "worker",
        dependencies: [],
        spec_refs: ["docs/spec.md"],
        allowed_write_scope: ["src/a/**"],
        forbidden_write_scope: [".secrets/**"],
        expected_changed_files: ["src/a/file.ts"],
        validation_commands: [{ id: "test", command: "pnpm test", required: true }],
        evidence_requirements: ["evidence"],
        side_effect_policy: "default",
        packet_required: true,
        next_dependencies: ["slice_b"]
      },
      {
        id: "slice_b",
        phase_id: "phase_001",
        title: "B",
        objective: "Do B",
        owner: "worker",
        dependencies: ["slice_a"],
        spec_refs: ["docs/spec.md"],
        allowed_write_scope: ["src/b/**"],
        forbidden_write_scope: [".secrets/**"],
        expected_changed_files: ["src/b/file.ts"],
        validation_commands: [{ id: "test", command: "pnpm test", required: true }],
        evidence_requirements: ["evidence"],
        side_effect_policy: "default",
        packet_required: true,
        next_dependencies: []
      }
    ]
  };
}

describe("core gates", () => {
  it("orders slice dependencies", () => {
    const result = analyzeSliceDag(validPlan());
    expect(result.cycles).toEqual([]);
    expect(result.ordered.map((slice) => slice.id)).toEqual(["slice_a", "slice_b"]);
  });

  it("detects dependency cycles", () => {
    const plan = validPlan();
    plan.slices[0]!.dependencies = ["slice_b"];
    const lint = lintSlicePlan(plan);
    expect(analyzeSliceDag(plan).cycles.length).toBeGreaterThan(0);
    expect(lint.ok).toBe(false);
    expect(
      lint.findings.find((finding) => finding.code === "dependency_cycle")?.remediation
    ).toContain("acyclic");
  });

  it("rejects forbidden write scopes", () => {
    const result = validateChangedFilesAgainstScope({
      changedFiles: ["src/a/file.ts", ".secrets/token.txt"],
      allowedWriteScope: ["src/**"],
      forbiddenWriteScope: [".secrets/**"]
    });
    expect(result.ok).toBe(false);
    expect(result.violations).toContain(".secrets/token.txt");
  });

  it("rejects traversal and sibling-prefix write-scope bypasses", () => {
    const result = validateChangedFilesAgainstScope({
      changedFiles: ["src2/file.ts", "src/../.secrets/token.txt"],
      allowedWriteScope: ["src/**"],
      forbiddenWriteScope: [".secrets/**"]
    });
    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(["src2/file.ts", "src/../.secrets/token.txt"]);
  });

  it("blocks dangerous operations by default", () => {
    const result = evaluateDangerousOperations(["package_publish"], defaultSideEffectPolicy);
    expect(result.allowed).toBe(false);
    expect(result.blocked).toEqual(["package_publish"]);
  });

  it("redacts secret-like values", () => {
    expect(redactSecrets("api_key=supersecretvalue token=abc123")).toContain("[REDACTED]");
  });

  it("blocks illegal state transitions", () => {
    expect(() => transitionState("INIT", "DISPATCH_READY_SLICES")).toThrow(/Illegal/);
    expect(transitionState("INIT", "INGEST_CONTEXT")).toBe("INGEST_CONTEXT");
  });

  it("rejects invalid proof statuses through checkpoint audit", async () => {
    const proof: ProofLedger = {
      protocol_version: HARNESS_PROTOCOL_VERSION,
      phase_id: "phase_001",
      claims: [
        { id: "claim", claim: "claim", status: "not_verified", evidence: [], required: true }
      ]
    };
    const result = await auditCheckpoint({
      workspaceRoot: process.cwd(),
      checkpointPath: ".",
      proof,
      nextAction: buildDefaultNextAction({ phaseId: "phase_001", status: "blocked" })
    });
    expect(result.status).toBe("invalid_checkpoint");
    expect(
      result.findings.find((finding) => finding.code === "missing_checkpoint_file")?.remediation
    ).toContain("checkpoint file");
  });

  it("detects write lock overlap", () => {
    const result = requestWriteLock(
      [{ id: "existing", owner: "a", scopes: ["src/**"], acquired_at: new Date().toISOString() }],
      "b",
      ["src/file.ts"]
    );
    expect(result.granted).toBe(false);
  });
});
