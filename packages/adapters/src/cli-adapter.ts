import { access } from "node:fs/promises";
import { delimiter } from "node:path";
import path from "node:path";
import { AdapterCapabilities, AdapterRegistryEntry } from "@meta-harness/core";
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
import { FilesystemAdapter } from "./filesystem.js";

export interface CliAdapterOptions {
  id: string;
  displayName: string;
  commands: string[];
  tier: 0 | 1 | 2 | 3;
  capabilities: AdapterCapabilities;
  reasonWhenUnavailable: string;
}

export class ConfigurableCliAdapter implements AgentAdapter {
  id: string;
  displayName: string;
  capabilities: AdapterCapabilities;
  private readonly commands: string[];
  private readonly tier: 0 | 1 | 2 | 3;
  private readonly reasonWhenUnavailable: string;
  private readonly filesystem = new FilesystemAdapter();

  constructor(options: CliAdapterOptions) {
    this.id = options.id;
    this.displayName = options.displayName;
    this.commands = options.commands;
    this.tier = options.tier;
    this.capabilities = options.capabilities;
    this.reasonWhenUnavailable = options.reasonWhenUnavailable;
  }

  async detect(context: AdapterContext): Promise<AdapterDetection> {
    const command = context.configuredCommand ?? (await findCommand(this.commands));
    if (!command) {
      return { available: false, reason: this.reasonWhenUnavailable };
    }
    return { available: true, reason: `Detected command: ${command}`, command };
  }

  renderSlicePrompt(input: SlicePromptInput): Promise<RenderedPrompt> {
    return this.filesystem.renderSlicePrompt(input);
  }

  async dispatchSlice(input: DispatchInput): Promise<DispatchResult> {
    const prompt = await this.filesystem.dispatchSlice(input);
    return {
      ...prompt,
      adapterId: this.id,
      status: "skipped",
      message:
        "Adapter detected or configured, but automatic process launch is intentionally disabled in this first implementation. Use the prompt file."
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
      availability: detection.available ? "configured" : "unavailable",
      tier: this.tier,
      reason: detection.reason,
      capabilities: this.capabilities
    };
  }
}

async function findCommand(candidates: string[]): Promise<string | undefined> {
  const pathValue = process.env.PATH ?? "";
  const extensions =
    process.platform === "win32" ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";") : [""];
  for (const directory of pathValue.split(delimiter)) {
    for (const candidate of candidates) {
      for (const extension of extensions) {
        const commandPath = path.join(directory, `${candidate}${extension.toLowerCase()}`);
        try {
          await access(commandPath);
          return candidate;
        } catch {
          // Try the next candidate without invoking a shell.
        }
      }
    }
  }
  return undefined;
}
