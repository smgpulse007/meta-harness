import { z } from "zod";
import {
  dangerousOperations,
  harnessStates,
  phaseTerminalStatuses,
  proofStatuses
} from "./types.js";

export const ValidationCommandSchema = z.object({
  id: z.string().min(1),
  command: z.string().min(1),
  required: z.boolean().default(true)
});

export const SideEffectPolicySchema = z.object({
  default_posture: z.enum(["read_only", "workspace_write", "explicit_write"]).default("read_only"),
  dangerous_operations: z.array(z.enum(dangerousOperations)).default([...dangerousOperations]),
  allowed_dangerous_operations: z.array(z.enum(dangerousOperations)).default([]),
  authorization_required: z.boolean().default(true),
  audit_required: z.boolean().default(true)
});

export const PhaseDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  source_spec_refs: z.array(z.string().min(1)).default([]),
  input_checkpoints: z.array(z.string()).default([]),
  output_checkpoint: z.string().min(1),
  acceptance_criteria: z.array(z.string().min(1)).default([]),
  validation_commands: z.array(ValidationCommandSchema).default([]),
  allowed_terminal_statuses: z.array(z.enum(phaseTerminalStatuses)).default([
    "complete",
    "complete_pending_human_review",
    "pass_with_risks",
    "blocked",
    "failed"
  ]),
  human_acceptance_required: z.boolean().default(false),
  side_effect_policy: z.string().min(1).default("default"),
  slices: z.array(z.string().min(1)).default([]),
  depends_on: z.array(z.string().min(1)).default([])
});

export const PhaseManifestSchema = z.object({
  protocol_version: z.string().min(1),
  project: z.string().min(1),
  phases: z.array(PhaseDefinitionSchema).min(1)
});

export const SliceDefinitionSchema = z.object({
  id: z.string().min(1),
  phase_id: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  owner: z.string().min(1),
  dependencies: z.array(z.string().min(1)).default([]),
  spec_refs: z.array(z.string().min(1)).min(1),
  allowed_write_scope: z.array(z.string().min(1)).min(1),
  forbidden_write_scope: z.array(z.string().min(1)).default([]),
  expected_changed_files: z.array(z.string().min(1)).default([]),
  validation_commands: z.array(ValidationCommandSchema).min(1),
  evidence_requirements: z.array(z.string().min(1)).min(1),
  side_effect_policy: z.string().min(1).default("default"),
  packet_required: z.boolean().default(true),
  next_dependencies: z.array(z.string().min(1)).default([])
});

export const SlicePlanSchema = z.object({
  protocol_version: z.string().min(1),
  phase_id: z.string().min(1),
  slices: z.array(SliceDefinitionSchema).min(1)
});

export const CommandEvidenceSchema = z.object({
  id: z.string().min(1),
  command: z.string().min(1),
  evidence_kind: z.enum(["command", "simulation"]),
  exit_code: z.number().int().nullable(),
  output_path: z.string().optional(),
  output_excerpt: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional()
});

export const ProofClaimSchema = z.object({
  id: z.string().min(1),
  requirement_id: z.string().optional(),
  claim: z.string().min(1),
  status: z.enum(proofStatuses),
  evidence: z.array(z.string().min(1)).default([]),
  required: z.boolean().default(true)
});

export const ProofLedgerSchema = z.object({
  protocol_version: z.string().min(1),
  phase_id: z.string().min(1),
  claims: z.array(ProofClaimSchema)
});

export const SlicePacketSchema = z.object({
  protocol_version: z.string().min(1),
  slice_id: z.string().min(1),
  status: z.enum(phaseTerminalStatuses),
  planned_owner: z.string().min(1),
  actual_owner: z.string().min(1),
  changed_files: z.array(z.string()),
  spec_alignment_refs: z.array(z.string().min(1)).min(1),
  implementation_summary: z.string().min(1),
  proof_statements: z.array(ProofClaimSchema),
  validation_command_outputs: z.array(CommandEvidenceSchema),
  side_effect_safety_status: z.enum(["ok", "blocked", "partial", "not_verified"]),
  model_route_proof_status: z.enum(proofStatuses).optional(),
  ui_api_evidence_summary: z.string().optional(),
  blockers: z.array(z.string()),
  risks: z.array(z.string()),
  next_dependencies: z.array(z.string()),
  auto_continue_recommendation: z.enum(["continue", "stop", "human_review"]),
  delegation_metrics: z.record(z.unknown()),
  interruptions: z.array(z.string()),
  takeovers: z.array(z.string()),
  recovery_events: z.array(z.string())
});

export const RequirementRecordSchema = z.object({
  id: z.string().min(1),
  source_file: z.string().min(1),
  source_heading: z.string().min(1),
  source_ref: z.string().min(1),
  phase_mapping: z.string().optional(),
  slice_mapping: z.string().optional(),
  acceptance_criteria: z.array(z.string()).default([]),
  validation_command: z.string().optional(),
  implementation_status: z.enum(["not_started", "in_progress", "implemented", "blocked"]),
  proof_references: z.array(z.string()).default([]),
  carry_forward_risks: z.array(z.string()).default([])
});

export const RequirementLedgerSchema = z.object({
  protocol_version: z.string().min(1),
  generated_at: z.string().min(1),
  requirements: z.array(RequirementRecordSchema),
  limitations: z.array(z.string()).default([])
});

export const NextActionSchema = z.object({
  protocol_version: z.string().min(1),
  current_phase_id: z.string().min(1),
  current_phase_status: z.enum(phaseTerminalStatuses),
  auto_continue_allowed: z.boolean(),
  next_phase_id: z.string().optional(),
  human_acceptance_required: z.boolean(),
  human_acceptance_present: z.boolean(),
  required_files_to_read: z.array(z.string()).default([]),
  carry_forward_risks: z.array(z.string()).default([]),
  blocking_risks: z.array(z.string()).default([]),
  required_validation_preface: z.array(z.string()).default([]),
  allowed_next_transition: z.string().min(1)
});

export const HarnessStateSchema = z.object({
  protocol_version: z.string().min(1),
  state: z.enum(harnessStates),
  current_phase_id: z.string().optional(),
  completed_phases: z.array(z.string()).default([]),
  blocked_reason: z.string().optional(),
  updated_at: z.string().min(1)
});

export const AdapterCapabilitiesSchema = z.object({
  supportsNativeSubagents: z.boolean(),
  supportsCliDispatch: z.boolean(),
  supportsStructuredOutput: z.boolean(),
  supportsMcp: z.boolean(),
  supportsHooks: z.boolean(),
  supportsFilesystemProtocol: z.boolean(),
  supportsBackgroundPrWorkflow: z.boolean(),
  supportsWriteScopeHints: z.boolean(),
  supportsDryRun: z.boolean()
});

export const AdapterRegistrySchema = z.object({
  protocol_version: z.string().min(1),
  adapters: z.array(
    z.object({
      id: z.string().min(1),
      displayName: z.string().min(1),
      availability: z.enum(["available", "unavailable", "configured", "filesystem-only", "planned"]),
      tier: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
      reason: z.string(),
      capabilities: AdapterCapabilitiesSchema
    })
  )
});
