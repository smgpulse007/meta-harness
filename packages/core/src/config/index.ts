import { HARNESS_PROTOCOL_VERSION, HarnessState } from "../types.js";

export function createInitialState(currentPhaseId = "phase_001"): HarnessState {
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    state: "INIT",
    current_phase_id: currentPhaseId,
    completed_phases: [],
    updated_at: new Date().toISOString()
  };
}
