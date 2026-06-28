export const HARNESS_PROTOCOL_VERSION = "0.1.0";

export const phaseTerminalStatuses = [
  "complete",
  "complete_pending_human_review",
  "pass_with_risks",
  "blocked",
  "failed"
] as const;

export type PhaseTerminalStatus = (typeof phaseTerminalStatuses)[number];

export const proofStatuses = [
  "claimed",
  "parent_verified",
  "static_verified",
  "command_verified",
  "runtime_verified",
  "human_verified",
  "not_verified",
  "partial"
] as const;

export type ProofStatus = (typeof proofStatuses)[number];

export const harnessStates = [
  "INIT",
  "INGEST_CONTEXT",
  "COMPILE_REQUIREMENTS",
  "BUILD_PHASE_DAG",
  "LINT_SLICE_PLAN",
  "DISPATCH_READY_SLICES",
  "COLLECT_PACKETS",
  "VERIFY_PACKETS",
  "INTEGRATE_DIFFS",
  "RUN_VALIDATION",
  "WRITE_CHECKPOINT",
  "DECIDE_STOP_CONDITION",
  "ADVANCE_OR_BLOCK"
] as const;

export type HarnessStateName = (typeof harnessStates)[number];

export const dangerousOperations = [
  "production_write",
  "external_api_mutation",
  "financial_transaction",
  "outbound_email",
  "database_migration",
  "secret_rotation",
  "infrastructure_destroy",
  "destructive_file_operation",
  "package_publish",
  "git_push"
] as const;

export type DangerousOperation = (typeof dangerousOperations)[number];

export interface ValidationCommand {
  id: string;
  command: string;
  required: boolean;
}

export interface SideEffectPolicy {
  default_posture: "read_only" | "workspace_write" | "explicit_write";
  dangerous_operations: DangerousOperation[];
  allowed_dangerous_operations: DangerousOperation[];
  authorization_required: boolean;
  audit_required: boolean;
}

export interface PhaseDefinition {
  id: string;
  title: string;
  source_spec_refs: string[];
  input_checkpoints: string[];
  output_checkpoint: string;
  acceptance_criteria: string[];
  validation_commands: ValidationCommand[];
  allowed_terminal_statuses: PhaseTerminalStatus[];
  human_acceptance_required: boolean;
  side_effect_policy: string;
  slices: string[];
  depends_on: string[];
}

export interface PhaseManifest {
  protocol_version: string;
  project: string;
  phases: PhaseDefinition[];
}

export interface SliceDefinition {
  id: string;
  phase_id: string;
  title: string;
  objective: string;
  owner: string;
  dependencies: string[];
  spec_refs: string[];
  allowed_write_scope: string[];
  forbidden_write_scope: string[];
  expected_changed_files: string[];
  validation_commands: ValidationCommand[];
  evidence_requirements: string[];
  side_effect_policy: string;
  packet_required: boolean;
  next_dependencies: string[];
}

export interface SlicePlan {
  protocol_version: string;
  phase_id: string;
  slices: SliceDefinition[];
}

export interface CommandEvidence {
  id: string;
  command: string;
  evidence_kind: "command" | "simulation";
  exit_code: number | null;
  output_path?: string | undefined;
  output_excerpt?: string | undefined;
  started_at?: string | undefined;
  completed_at?: string | undefined;
}

export interface ProofClaim {
  id: string;
  requirement_id?: string | undefined;
  claim: string;
  status: ProofStatus;
  evidence: string[];
  required: boolean;
}

export interface ProofLedger {
  protocol_version: string;
  phase_id: string;
  claims: ProofClaim[];
}

export interface SlicePacket {
  protocol_version: string;
  slice_id: string;
  status: PhaseTerminalStatus;
  planned_owner: string;
  actual_owner: string;
  changed_files: string[];
  spec_alignment_refs: string[];
  implementation_summary: string;
  proof_statements: ProofClaim[];
  validation_command_outputs: CommandEvidence[];
  side_effect_safety_status: "ok" | "blocked" | "partial" | "not_verified";
  model_route_proof_status?: ProofStatus | undefined;
  ui_api_evidence_summary?: string | undefined;
  blockers: string[];
  risks: string[];
  next_dependencies: string[];
  auto_continue_recommendation: "continue" | "stop" | "human_review";
  delegation_metrics: Record<string, unknown>;
  interruptions: string[];
  takeovers: string[];
  recovery_events: string[];
}

export interface RequirementRecord {
  id: string;
  source_file: string;
  source_heading: string;
  source_ref: string;
  phase_mapping?: string | undefined;
  slice_mapping?: string | undefined;
  acceptance_criteria: string[];
  validation_command?: string | undefined;
  implementation_status: "not_started" | "in_progress" | "implemented" | "blocked";
  proof_references: string[];
  carry_forward_risks: string[];
}

export interface RequirementLedger {
  protocol_version: string;
  generated_at: string;
  requirements: RequirementRecord[];
  limitations: string[];
}

export interface NextAction {
  protocol_version: string;
  current_phase_id: string;
  current_phase_status: PhaseTerminalStatus;
  auto_continue_allowed: boolean;
  next_phase_id?: string | undefined;
  human_acceptance_required: boolean;
  human_acceptance_present: boolean;
  required_files_to_read: string[];
  carry_forward_risks: string[];
  blocking_risks: string[];
  required_validation_preface: string[];
  allowed_next_transition: string;
}

export interface HarnessState {
  protocol_version: string;
  state: HarnessStateName;
  current_phase_id?: string | undefined;
  completed_phases: string[];
  blocked_reason?: string | undefined;
  updated_at: string;
}

export interface AdapterCapabilities {
  supportsNativeSubagents: boolean;
  supportsCliDispatch: boolean;
  supportsStructuredOutput: boolean;
  supportsMcp: boolean;
  supportsHooks: boolean;
  supportsFilesystemProtocol: boolean;
  supportsBackgroundPrWorkflow: boolean;
  supportsWriteScopeHints: boolean;
  supportsDryRun: boolean;
}

export interface AdapterRegistryEntry {
  id: string;
  displayName: string;
  availability: "available" | "unavailable" | "configured" | "filesystem-only" | "planned";
  tier: 0 | 1 | 2 | 3;
  reason: string;
  capabilities: AdapterCapabilities;
}

export interface AdapterRegistry {
  protocol_version: string;
  adapters: AdapterRegistryEntry[];
}
