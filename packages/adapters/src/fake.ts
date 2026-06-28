import {
  writeYamlFile,
  HARNESS_PROTOCOL_VERSION,
  SlicePacket,
  AdapterRegistryEntry
} from "@meta-harness/core";
import {
  AdapterContext,
  AdapterDetection,
  AgentAdapter,
  CollectInput,
  CollectedPacket,
  DispatchInput,
  DispatchResult,
  RenderedPrompt,
  SlicePromptInput
} from "./types.js";
import { FilesystemAdapter, filesystemCapabilities } from "./filesystem.js";

export class FakeAdapter implements AgentAdapter {
  id = "fake";
  displayName = "Fake Test Adapter";
  capabilities = {
    ...filesystemCapabilities,
    supportsStructuredOutput: true,
    supportsDryRun: true
  };

  private readonly filesystem = new FilesystemAdapter();

  async detect(_context: AdapterContext): Promise<AdapterDetection> {
    return { available: true, reason: "Built-in deterministic adapter for tests and examples." };
  }

  renderSlicePrompt(input: SlicePromptInput): Promise<RenderedPrompt> {
    return this.filesystem.renderSlicePrompt(input);
  }

  async dispatchSlice(input: DispatchInput): Promise<DispatchResult> {
    const promptResult = await this.filesystem.dispatchSlice(input);
    const packet: SlicePacket = {
      protocol_version: HARNESS_PROTOCOL_VERSION,
      slice_id: input.slice.id,
      status: "complete",
      planned_owner: input.slice.owner,
      actual_owner: "fake-adapter",
      changed_files: input.slice.expected_changed_files,
      spec_alignment_refs: input.slice.spec_refs,
      implementation_summary: `Fake adapter simulated completion for ${input.slice.id}.`,
      proof_statements: input.slice.evidence_requirements.map((requirement, index) => ({
        id: `${input.slice.id}-proof-${index + 1}`,
        claim: requirement,
        status: "static_verified",
        evidence: [`fake-adapter:${input.slice.id}`],
        required: true
      })),
      validation_command_outputs: input.slice.validation_commands.map((command) => ({
        id: command.id,
        command: command.command,
        evidence_kind: "simulation",
        exit_code: null,
        output_excerpt: "Simulated by fake adapter; use only for tests/examples."
      })),
      side_effect_safety_status: "ok",
      blockers: [],
      risks: ["Fake adapter output is not implementation evidence for production use."],
      next_dependencies: input.slice.next_dependencies,
      auto_continue_recommendation: "continue",
      delegation_metrics: { simulated: true },
      interruptions: [],
      takeovers: [],
      recovery_events: []
    };
    const packetPath = `${input.checkpointPath}/subagent_packets/${input.slice.id}.packet.yaml`;
    await writeYamlFile(input.workspaceRoot, packetPath, packet);
    return {
      ...promptResult,
      status: "simulated",
      packetPath,
      message: "Prompt and simulated packet written."
    };
  }

  collectPackets(input: CollectInput): Promise<CollectedPacket[]> {
    return this.filesystem.collectPackets(input);
  }

  async registryEntry(context: AdapterContext): Promise<AdapterRegistryEntry> {
    const detection = await this.detect(context);
    return {
      id: this.id,
      displayName: this.displayName,
      availability: detection.available ? "available" : "unavailable",
      tier: 0 as const,
      reason: detection.reason,
      capabilities: this.capabilities
    };
  }
}
