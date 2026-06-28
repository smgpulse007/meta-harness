import { HarnessStateName, harnessStates } from "../types.js";

const allowedTransitions: Record<HarnessStateName, HarnessStateName[]> = {
  INIT: ["INGEST_CONTEXT"],
  INGEST_CONTEXT: ["COMPILE_REQUIREMENTS"],
  COMPILE_REQUIREMENTS: ["BUILD_PHASE_DAG"],
  BUILD_PHASE_DAG: ["LINT_SLICE_PLAN"],
  LINT_SLICE_PLAN: ["DISPATCH_READY_SLICES", "ADVANCE_OR_BLOCK"],
  DISPATCH_READY_SLICES: ["COLLECT_PACKETS"],
  COLLECT_PACKETS: ["VERIFY_PACKETS"],
  VERIFY_PACKETS: ["INTEGRATE_DIFFS", "ADVANCE_OR_BLOCK"],
  INTEGRATE_DIFFS: ["RUN_VALIDATION"],
  RUN_VALIDATION: ["WRITE_CHECKPOINT", "ADVANCE_OR_BLOCK"],
  WRITE_CHECKPOINT: ["DECIDE_STOP_CONDITION"],
  DECIDE_STOP_CONDITION: ["ADVANCE_OR_BLOCK"],
  ADVANCE_OR_BLOCK: ["INGEST_CONTEXT", "COMPILE_REQUIREMENTS"]
};

export function transitionState(current: HarnessStateName, next: HarnessStateName): HarnessStateName {
  if (!harnessStates.includes(current) || !harnessStates.includes(next)) {
    throw new Error(`Unknown harness state transition: ${current} -> ${next}`);
  }
  if (!allowedTransitions[current].includes(next)) {
    throw new Error(`Illegal harness state transition: ${current} -> ${next}`);
  }
  return next;
}

export function canTransition(current: HarnessStateName, next: HarnessStateName): boolean {
  return allowedTransitions[current]?.includes(next) ?? false;
}

export function listAllowedTransitions(current: HarnessStateName): HarnessStateName[] {
  return [...allowedTransitions[current]];
}
