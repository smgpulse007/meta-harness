import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  AdapterRegistry,
  assertSafeId,
  buildDefaultNextAction,
  canonicalAgentInstructions,
  createInitialState,
  defaultSideEffectPolicy,
  HARNESS_PROTOCOL_VERSION,
  PhaseManifest,
  ProofLedger,
  readJsonFile,
  readYamlFile,
  resolveInsideWorkspace,
  RequirementLedger,
  SideEffectPolicy,
  SlicePlan,
  writeJsonFile,
  writeTextFile,
  writeYamlFile
} from "@meta-harness/core";
import { createDefaultAdapters } from "@meta-harness/adapters";

const execFileAsync = promisify(execFile);

export interface CommandContext {
  cwd: string;
  stdout?: (message: string) => void;
  stderr?: (message: string) => void;
}

export function emit(context: CommandContext, message: string): void {
  const writer = context.stdout ?? ((value: string) => process.stdout.write(value));
  writer(message.endsWith("\n") ? message : `${message}\n`);
}

export function emitError(context: CommandContext, message: string): void {
  const writer = context.stderr ?? ((value: string) => process.stderr.write(value));
  writer(message.endsWith("\n") ? message : `${message}\n`);
}

export function checkpointPath(phaseId: string): string {
  assertSafeId(phaseId, "phase");
  return `.meta-harness/checkpoints/${phaseId}`;
}

export function createDefaultPhaseManifest(project = "meta-harness-project"): PhaseManifest {
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    project,
    phases: [
      {
        id: "phase_001",
        title: "Bootstrap implementation",
        source_spec_refs: ["docs/implementation_spec.md"],
        input_checkpoints: [],
        output_checkpoint: checkpointPath("phase_001"),
        acceptance_criteria: ["Plan, packet, proof, validation, and checkpoint artifacts exist."],
        validation_commands: [{ id: "baseline", command: "pnpm test", required: true }],
        allowed_terminal_statuses: [
          "complete",
          "complete_pending_human_review",
          "pass_with_risks",
          "blocked",
          "failed"
        ],
        human_acceptance_required: false,
        side_effect_policy: "default",
        slices: ["slice_001"],
        depends_on: []
      }
    ]
  };
}

export function createDefaultSlicePlan(phaseId = "phase_001"): SlicePlan {
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    phase_id: phaseId,
    slices: [
      {
        id: `${phaseId}_slice_001`,
        phase_id: phaseId,
        title: "Implement bounded phase slice",
        objective: "Implement the first bounded slice and return packet evidence.",
        owner: "worker",
        dependencies: [],
        spec_refs: ["docs/implementation_spec.md"],
        allowed_write_scope: ["src/**", "docs/**", "tests/**", ".meta-harness/**"],
        forbidden_write_scope: [".git/**", "node_modules/**", ".secrets/**"],
        expected_changed_files: [],
        validation_commands: [{ id: "targeted", command: "pnpm test", required: true }],
        evidence_requirements: ["Changed files match the allowed write scope.", "Validation command output is recorded."],
        side_effect_policy: "default",
        packet_required: true,
        next_dependencies: []
      }
    ]
  };
}

export async function writeHarnessBootstrapFiles(context: CommandContext, force = false): Promise<void> {
  const generatedFiles = [
    ".meta-harness/state.json",
    ".meta-harness/locks.json",
    ".meta-harness/agent_runs.jsonl",
    ".meta-harness/command_log.jsonl",
    ".meta-harness/adapter_registry.json",
    "docs/implementation_harness/phase_manifest.yaml",
    "docs/implementation_harness/side_effect_policy.yaml",
    `${checkpointPath("phase_001")}/slice_plan.yaml`,
    `${checkpointPath("phase_001")}/subagent_packets/.gitkeep`,
    `${checkpointPath("phase_001")}/artifacts/.gitkeep`,
    "AGENTS.md"
  ];
  if (!force) {
    const existing = generatedFiles.filter((filePath) =>
      existsSync(resolveInsideWorkspace(context.cwd, filePath))
    );
    if (existing.length > 0) {
      throw new Error(`Refusing to overwrite existing harness files without --force: ${existing.join(", ")}`);
    }
  }
  const state = createInitialState("phase_001");
  const manifest = createDefaultPhaseManifest();
  const sideEffectPolicy: SideEffectPolicy = defaultSideEffectPolicy;
  const adapters = await createAdapterRegistry(context.cwd);
  await writeJsonFile(context.cwd, ".meta-harness/state.json", state);
  await writeJsonFile(context.cwd, ".meta-harness/locks.json", { locks: [] });
  await writeTextFile(context.cwd, ".meta-harness/agent_runs.jsonl", "");
  await writeTextFile(context.cwd, ".meta-harness/command_log.jsonl", "");
  await writeJsonFile(context.cwd, ".meta-harness/adapter_registry.json", adapters);
  await writeYamlFile(context.cwd, "docs/implementation_harness/phase_manifest.yaml", manifest);
  await writeYamlFile(context.cwd, "docs/implementation_harness/side_effect_policy.yaml", sideEffectPolicy);
  await writeYamlFile(context.cwd, `${checkpointPath("phase_001")}/slice_plan.yaml`, createDefaultSlicePlan());
  await writeTextFile(context.cwd, `${checkpointPath("phase_001")}/subagent_packets/.gitkeep`, "");
  await writeTextFile(context.cwd, `${checkpointPath("phase_001")}/artifacts/.gitkeep`, "");
  await writeAgentInstructions(context);
}

export async function writeAgentInstructions(context: CommandContext): Promise<void> {
  const content = `${canonicalAgentInstructions}
## Output Contract

Every slice returns a packet with proof statements, command evidence, changed files, risks, and continuation recommendations. The parent writes checkpoint artifacts and follows next_action.yaml as the source of truth.
`;
  await writeTextFile(context.cwd, "AGENTS.md", content);
}

export async function createAdapterRegistry(workspaceRoot: string): Promise<AdapterRegistry> {
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    adapters: await Promise.all(
      createDefaultAdapters().map((adapter) => adapter.registryEntry({ workspaceRoot }))
    )
  };
}

export async function readManifest(context: CommandContext): Promise<PhaseManifest> {
  return readYamlFile<PhaseManifest>(context.cwd, "docs/implementation_harness/phase_manifest.yaml");
}

export async function readSlicePlan(context: CommandContext, phaseId: string): Promise<SlicePlan> {
  return readYamlFile<SlicePlan>(context.cwd, `${checkpointPath(phaseId)}/slice_plan.yaml`);
}

export async function readRequirementLedger(context: CommandContext): Promise<RequirementLedger | undefined> {
  try {
    return await readJsonFile<RequirementLedger>(context.cwd, ".meta-harness/requirement_ledger.json");
  } catch {
    return undefined;
  }
}

export async function readProof(context: CommandContext, phaseId: string): Promise<ProofLedger> {
  return readJsonFile<ProofLedger>(context.cwd, `${checkpointPath(phaseId)}/proof.json`);
}

export async function loadOrCreateProof(
  context: CommandContext,
  phaseId: string,
  plan: SlicePlan
): Promise<ProofLedger> {
  try {
    return await readProof(context, phaseId);
  } catch {
    return {
      protocol_version: HARNESS_PROTOCOL_VERSION,
      phase_id: phaseId,
      claims: plan.slices.map((slice) => ({
        id: `${slice.id}-packet-required`,
        claim: `Slice packet exists for ${slice.id}.`,
        status: "not_verified",
        evidence: [],
        required: true
      }))
    };
  }
}

export async function runGitStatus(cwd: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["status", "--short", "--branch"], { cwd });
    return stdout.trim();
  } catch (error) {
    return `git status unavailable: ${(error as Error).message}`;
  }
}

export function defaultNextActionForPhase(phaseId: string, status = "blocked" as const) {
  return buildDefaultNextAction({
    phaseId,
    status,
    autoContinueAllowed: false,
    humanAcceptanceRequired: false,
    humanAcceptancePresent: false,
    blockingRisks: status === "blocked" ? ["Checkpoint written before all gates were verified."] : []
  });
}
