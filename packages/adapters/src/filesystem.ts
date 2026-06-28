import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import {
  AdapterCapabilities,
  AdapterRegistryEntry,
  assertSafeId,
  HARNESS_PROTOCOL_VERSION,
  resolveInsideWorkspace,
  SlicePacketSchema,
  writeTextFile
} from "@meta-harness/core";
import {
  AdapterContext,
  AdapterDetection,
  AgentAdapter,
  CollectedPacket,
  CollectInput,
  DispatchInput,
  DispatchResult,
  RenderedPrompt,
  SlicePromptInput
} from "./types.js";

export const filesystemCapabilities: AdapterCapabilities = {
  supportsNativeSubagents: false,
  supportsCliDispatch: false,
  supportsStructuredOutput: true,
  supportsMcp: false,
  supportsHooks: false,
  supportsFilesystemProtocol: true,
  supportsBackgroundPrWorkflow: false,
  supportsWriteScopeHints: true,
  supportsDryRun: true
};

export class FilesystemAdapter implements AgentAdapter {
  id = "filesystem";
  displayName = "Filesystem Prompt Adapter";
  capabilities = filesystemCapabilities;

  async detect(_context: AdapterContext): Promise<AdapterDetection> {
    return { available: true, reason: "Always available; writes prompt files only." };
  }

  async renderSlicePrompt(input: SlicePromptInput): Promise<RenderedPrompt> {
    assertSafeId(input.phaseId, "phaseId");
    assertSafeId(input.slice.id, "sliceId");
    const text = `# Meta Harness Worker Packet

Protocol: ${HARNESS_PROTOCOL_VERSION}
Phase: ${input.phaseId}
Slice: ${input.slice.id}

## Objective

${input.slice.objective}

## Required Spec References

${input.slice.spec_refs.map((ref) => `- ${ref}`).join("\n")}

## Allowed Write Scope

${input.slice.allowed_write_scope.map((scope) => `- ${scope}`).join("\n")}

## Forbidden Write Scope

${input.slice.forbidden_write_scope.length === 0 ? "- None declared." : input.slice.forbidden_write_scope.map((scope) => `- ${scope}`).join("\n")}

## Validation Commands

${input.slice.validation_commands.map((command) => `- ${command.id}: \`${command.command}\``).join("\n")}

## Output Contract

Return a complete slice packet at:

\`${input.checkpointPath}/subagent_packets/${input.slice.id}.packet.yaml\`

Use precise proof statuses. Do not mark a command as passed unless it actually ran.`;
    return { text };
  }

  async dispatchSlice(input: DispatchInput): Promise<DispatchResult> {
    assertSafeId(input.phaseId, "phaseId");
    assertSafeId(input.slice.id, "sliceId");
    const prompt = await this.renderSlicePrompt(input);
    const promptPath = `${input.checkpointPath}/artifacts/prompts/${input.slice.id}.prompt.md`;
    await writeTextFile(input.workspaceRoot, promptPath, prompt.text);
    return {
      adapterId: this.id,
      sliceId: input.slice.id,
      status: "dispatched",
      promptPath,
      message: "Prompt file written; no external agent launched."
    };
  }

  async collectPackets(input: CollectInput): Promise<CollectedPacket[]> {
    const packetDir = resolveInsideWorkspace(input.workspaceRoot, `${input.checkpointPath}/subagent_packets`);
    let files: string[] = [];
    try {
      files = await readdir(packetDir);
    } catch {
      return [];
    }
    const packets: CollectedPacket[] = [];
    for (const file of files.filter((candidate) => candidate.endsWith(".packet.yaml"))) {
      assertSafeId(file.replace(/\.packet\.yaml$/, ""), "packet file sliceId");
      const absolutePath = path.join(packetDir, file);
      const parsed = SlicePacketSchema.parse(YAML.parse(await readFile(absolutePath, "utf8")));
      assertSafeId(parsed.slice_id, "packet.slice_id");
      packets.push({
        path: path.relative(input.workspaceRoot, absolutePath).replaceAll("\\", "/"),
        packet: parsed
      });
    }
    return packets;
  }

  async registryEntry(context: AdapterContext): Promise<AdapterRegistryEntry> {
    const detection = await this.detect(context);
    return {
      id: this.id,
      displayName: this.displayName,
      availability: detection.available ? "filesystem-only" : "unavailable",
      tier: 0,
      reason: detection.reason,
      capabilities: this.capabilities
    };
  }
}
