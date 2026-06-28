import {
  AdapterCapabilities,
  AdapterRegistryEntry,
  SliceDefinition,
  SlicePacket,
  SlicePlan
} from "@meta-harness/core";

export interface AdapterContext {
  workspaceRoot: string;
  configuredCommand?: string | undefined;
}

export interface AdapterDetection {
  available: boolean;
  reason: string;
  command?: string | undefined;
}

export interface SlicePromptInput {
  workspaceRoot: string;
  phaseId: string;
  slice: SliceDefinition;
  slicePlan: SlicePlan;
  checkpointPath: string;
}

export interface RenderedPrompt {
  path?: string | undefined;
  text: string;
}

export interface DispatchInput extends SlicePromptInput {
  dryRun?: boolean | undefined;
}

export interface DispatchResult {
  adapterId: string;
  sliceId: string;
  status: "dispatched" | "simulated" | "skipped" | "failed";
  promptPath?: string | undefined;
  packetPath?: string | undefined;
  message: string;
}

export interface CollectInput {
  workspaceRoot: string;
  checkpointPath: string;
}

export interface CollectedPacket {
  path: string;
  packet: SlicePacket;
}

export interface AgentAdapter {
  id: string;
  displayName: string;
  capabilities: AdapterCapabilities;
  detect(context: AdapterContext): Promise<AdapterDetection>;
  renderSlicePrompt(input: SlicePromptInput): Promise<RenderedPrompt>;
  dispatchSlice(input: DispatchInput): Promise<DispatchResult>;
  collectPackets(input: CollectInput): Promise<CollectedPacket[]>;
  registryEntry(context: AdapterContext): Promise<AdapterRegistryEntry>;
}
