import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import {
  HARNESS_PROTOCOL_VERSION,
  AdapterRegistryEntry,
  resolveInsideWorkspace,
  SlicePacket,
  SlicePacketSchema,
  writeTextFile,
  writeYamlFile
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
import { findCommand } from "./cli-adapter.js";
import { FilesystemAdapter, filesystemCapabilities } from "./filesystem.js";

export type ExperimentalNativeAgent = "codex" | "claude-code";

export interface NativeCommandInput {
  workspaceRoot: string;
  prompt: string;
  schemaPath: string;
  finalMessagePath: string;
  schemaText: string;
  sandbox?: "read-only" | "workspace-write" | "danger-full-access";
}

export interface NativeCommandPlan {
  command: string;
  args: string[];
}

export interface NativeProcessRequest extends NativeCommandPlan {
  cwd: string;
  env?: NodeJS.ProcessEnv | undefined;
}

export interface NativeProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export type NativeProcessRunner = (request: NativeProcessRequest) => Promise<NativeProcessResult>;

export interface NativeParseResult {
  packet: SlicePacket;
  usage?: Record<string, unknown> | undefined;
}

export const nativeDispatchEnvVar = "META_HARNESS_EXPERIMENTAL_NATIVE_DISPATCH";
const StrictNativeSlicePacketSchema = SlicePacketSchema.strict();

export function buildCodexExecCommand(input: NativeCommandInput): NativeCommandPlan {
  return {
    command: "codex",
    args: [
      "exec",
      "--ephemeral",
      "--sandbox",
      input.sandbox ?? "workspace-write",
      "--json",
      "--output-schema",
      input.schemaPath,
      "--output-last-message",
      input.finalMessagePath,
      "--cd",
      input.workspaceRoot,
      input.prompt
    ]
  };
}

export function buildClaudePrintCommand(input: NativeCommandInput): NativeCommandPlan {
  return {
    command: "claude",
    args: [
      "--bare",
      "-p",
      input.prompt,
      "--output-format",
      "json",
      "--json-schema",
      input.schemaText
    ]
  };
}

export function parseCodexJsonlPacket(
  jsonl: string,
  options: { finalMessage?: string | undefined; expectedSliceId?: string | undefined } = {}
): NativeParseResult {
  let finalMessage = options.finalMessage;
  let usage: Record<string, unknown> | undefined;

  for (const event of parseJsonLines(jsonl)) {
    if (isRecord(event) && event.type === "turn.completed" && isRecord(event.usage)) {
      usage = event.usage;
    }
    if (isRecord(event) && event.type === "item.completed" && isRecord(event.item)) {
      const item = event.item;
      if (item.type === "agent_message" && typeof item.text === "string") {
        finalMessage = item.text;
      }
    }
  }

  if (!finalMessage) {
    throw new Error("Codex JSONL did not include a final agent_message item.");
  }

  return {
    packet: parsePacketJson(finalMessage, options.expectedSliceId),
    usage
  };
}

export function parseClaudeJsonPacket(
  output: string,
  options: { expectedSliceId?: string | undefined } = {}
): NativeParseResult {
  const parsed = JSON.parse(output) as unknown;
  if (!isRecord(parsed)) {
    throw new Error("Claude output must be a JSON object.");
  }
  const candidate =
    parsed.structured_output ??
    (typeof parsed.result === "string" ? JSON.parse(parsed.result) : (parsed.result ?? parsed));
  const usage = isRecord(parsed.usage) ? parsed.usage : undefined;
  return {
    packet: parsePacketValue(candidate, options.expectedSliceId),
    usage
  };
}

export function nativeSlicePacketOutputSchema(): Record<string, unknown> {
  const proofStatuses = [
    "claimed",
    "parent_verified",
    "static_verified",
    "command_verified",
    "runtime_verified",
    "human_verified",
    "not_verified",
    "partial"
  ];
  return {
    type: "object",
    required: [
      "protocol_version",
      "slice_id",
      "status",
      "planned_owner",
      "actual_owner",
      "changed_files",
      "spec_alignment_refs",
      "implementation_summary",
      "proof_statements",
      "validation_command_outputs",
      "side_effect_safety_status",
      "blockers",
      "risks",
      "next_dependencies",
      "auto_continue_recommendation",
      "delegation_metrics",
      "interruptions",
      "takeovers",
      "recovery_events"
    ],
    properties: {
      protocol_version: { type: "string", const: HARNESS_PROTOCOL_VERSION },
      slice_id: { type: "string" },
      status: {
        type: "string",
        enum: ["complete", "complete_pending_human_review", "pass_with_risks", "blocked", "failed"]
      },
      planned_owner: { type: "string" },
      actual_owner: { type: "string" },
      changed_files: { type: "array", items: { type: "string" } },
      spec_alignment_refs: { type: "array", items: { type: "string" } },
      implementation_summary: { type: "string" },
      proof_statements: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "claim", "status", "evidence", "required"],
          properties: {
            id: { type: "string" },
            requirement_id: { type: "string" },
            claim: { type: "string" },
            status: { type: "string", enum: proofStatuses },
            evidence: { type: "array", items: { type: "string" } },
            required: { type: "boolean" }
          },
          additionalProperties: false
        }
      },
      validation_command_outputs: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "command", "evidence_kind", "exit_code"],
          properties: {
            id: { type: "string" },
            command: { type: "string" },
            evidence_kind: { type: "string", enum: ["command", "simulation"] },
            exit_code: { type: ["integer", "null"] },
            output_path: { type: "string" },
            output_excerpt: { type: "string" },
            started_at: { type: "string" },
            completed_at: { type: "string" }
          },
          additionalProperties: false
        }
      },
      side_effect_safety_status: {
        type: "string",
        enum: ["ok", "blocked", "partial", "not_verified"]
      },
      model_route_proof_status: { type: "string", enum: proofStatuses },
      ui_api_evidence_summary: { type: "string" },
      blockers: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
      next_dependencies: { type: "array", items: { type: "string" } },
      auto_continue_recommendation: { type: "string", enum: ["continue", "stop", "human_review"] },
      delegation_metrics: { type: "object" },
      interruptions: { type: "array", items: { type: "string" } },
      takeovers: { type: "array", items: { type: "string" } },
      recovery_events: { type: "array", items: { type: "string" } }
    },
    additionalProperties: false
  };
}

export interface ExperimentalNativeAdapterOptions {
  id: string;
  displayName: string;
  agent: ExperimentalNativeAgent;
  commands: string[];
  reasonWhenUnavailable: string;
  supportsMcp?: boolean | undefined;
  runner?: NativeProcessRunner | undefined;
}

export class ExperimentalNativeAdapter implements AgentAdapter {
  id: string;
  displayName: string;
  capabilities = {
    ...filesystemCapabilities,
    supportsCliDispatch: true,
    supportsStructuredOutput: true
  };

  private readonly agent: ExperimentalNativeAgent;
  private readonly commands: string[];
  private readonly reasonWhenUnavailable: string;
  private readonly filesystem = new FilesystemAdapter();
  private readonly runner: NativeProcessRunner;

  constructor(options: ExperimentalNativeAdapterOptions) {
    this.id = options.id;
    this.displayName = options.displayName;
    this.agent = options.agent;
    this.commands = options.commands;
    this.reasonWhenUnavailable = options.reasonWhenUnavailable;
    this.capabilities.supportsMcp = options.supportsMcp ?? false;
    this.runner = options.runner ?? execFileRunner;
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
    const promptResult = await this.filesystem.dispatchSlice(input);
    if (!input.experimentalNative || process.env[nativeDispatchEnvVar] !== "1") {
      return {
        ...promptResult,
        adapterId: this.id,
        status: "skipped",
        message: `Experimental native dispatch is disabled. Pass --experimental-native and set ${nativeDispatchEnvVar}=1 to opt in.`
      };
    }

    const detection = await this.detect({ workspaceRoot: input.workspaceRoot });
    if (!detection.available || !detection.command) {
      return {
        ...promptResult,
        adapterId: this.id,
        status: "failed",
        message: detection.reason
      };
    }

    const nativeDir = `${input.checkpointPath}/artifacts/native/${this.agent}/${input.slice.id}`;
    const schemaPath = `${nativeDir}/slice-packet.schema.json`;
    const stdoutPath = `${nativeDir}/stdout.jsonl`;
    const stderrPath = `${nativeDir}/stderr.txt`;
    const finalMessagePath = `${nativeDir}/final-message.json`;
    const schemaText = JSON.stringify(nativeSlicePacketOutputSchema(), null, 2);
    await writeTextFile(input.workspaceRoot, schemaPath, schemaText);

    const finalMessageAbsolutePath = resolveInsideWorkspace(input.workspaceRoot, finalMessagePath);
    const nativePrompt = `${promptResult.promptPath ? `Read the prompt file at ${promptResult.promptPath}.` : ""}

${(await this.renderSlicePrompt(input)).text}

Return a single JSON object that matches the provided slice packet schema.`;
    const commandPlan =
      this.agent === "codex"
        ? buildCodexExecCommand({
            workspaceRoot: input.workspaceRoot,
            prompt: nativePrompt,
            schemaPath: resolveInsideWorkspace(input.workspaceRoot, schemaPath),
            finalMessagePath: finalMessageAbsolutePath,
            schemaText
          })
        : buildClaudePrintCommand({
            workspaceRoot: input.workspaceRoot,
            prompt: nativePrompt,
            schemaPath: resolveInsideWorkspace(input.workspaceRoot, schemaPath),
            finalMessagePath: finalMessageAbsolutePath,
            schemaText
          });

    const result = await this.runner({
      ...commandPlan,
      command: detection.command,
      cwd: input.workspaceRoot,
      env: process.env
    });
    await writeTextFile(input.workspaceRoot, stdoutPath, result.stdout);
    await writeTextFile(input.workspaceRoot, stderrPath, result.stderr);

    if (result.exitCode !== 0) {
      return {
        ...promptResult,
        adapterId: this.id,
        status: "failed",
        message: `Experimental native dispatch failed with exit code ${result.exitCode}. Raw output was stored under ${nativeDir}.`
      };
    }

    let finalMessage: string | undefined;
    try {
      finalMessage = await readFile(finalMessageAbsolutePath, "utf8");
    } catch {
      finalMessage = undefined;
    }

    try {
      const parsed =
        this.agent === "codex"
          ? parseCodexJsonlPacket(result.stdout, {
              finalMessage,
              expectedSliceId: input.slice.id
            })
          : parseClaudeJsonPacket(result.stdout, { expectedSliceId: input.slice.id });
      const packetPath = `${input.checkpointPath}/subagent_packets/${input.slice.id}.packet.yaml`;
      await writeYamlFile(input.workspaceRoot, packetPath, parsed.packet);
      return {
        adapterId: this.id,
        sliceId: input.slice.id,
        status: "dispatched",
        promptPath: promptResult.promptPath,
        packetPath,
        message: `Experimental native dispatch produced a schema-valid packet. Usage metadata present: ${parsed.usage ? "yes" : "no"}.`
      };
    } catch (error) {
      return {
        ...promptResult,
        adapterId: this.id,
        status: "failed",
        message: `Experimental native dispatch output did not validate: ${(error as Error).message}`
      };
    }
  }

  collectPackets(input: CollectInput): Promise<CollectedPacket[]> {
    return this.filesystem.collectPackets(input);
  }

  async registryEntry(context: AdapterContext): Promise<AdapterRegistryEntry> {
    const detection = await this.detect(context);
    const gateOpen = process.env[nativeDispatchEnvVar] === "1";
    const availability: AdapterRegistryEntry["availability"] =
      detection.available && gateOpen
        ? "configured"
        : detection.available
          ? "planned"
          : "unavailable";
    return {
      id: this.id,
      displayName: this.displayName,
      availability,
      tier: 3 as const,
      reason: detection.available
        ? `Experimental native dispatch target detected but disabled by default; set ${nativeDispatchEnvVar}=1 and pass --experimental-native.`
        : detection.reason,
      capabilities: this.capabilities
    };
  }
}

export const codexExperimentalAdapter = new ExperimentalNativeAdapter({
  id: "codex-experimental",
  displayName: "Codex Experimental Native Adapter",
  agent: "codex",
  commands: ["codex"],
  supportsMcp: true,
  reasonWhenUnavailable: "Codex CLI command not detected; use the stable codex prompt-file adapter."
});

export const claudeCodeExperimentalAdapter = new ExperimentalNativeAdapter({
  id: "claude-code-experimental",
  displayName: "Claude Code Experimental Native Adapter",
  agent: "claude-code",
  commands: ["claude"],
  reasonWhenUnavailable:
    "Claude command not detected; use the stable claude-code prompt-file adapter."
});

async function execFileRunner(request: NativeProcessRequest): Promise<NativeProcessResult> {
  return new Promise((resolve) => {
    execFile(
      request.command,
      request.args,
      { cwd: request.cwd, env: request.env, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const exitCode =
          error && typeof (error as NodeJS.ErrnoException & { code?: unknown }).code === "number"
            ? (error as NodeJS.ErrnoException & { code: number }).code
            : error
              ? 1
              : 0;
        resolve({
          exitCode,
          stdout: stdout.toString(),
          stderr: stderr.toString()
        });
      }
    );
  });
}

function parsePacketJson(text: string, expectedSliceId?: string | undefined): SlicePacket {
  return parsePacketValue(JSON.parse(text), expectedSliceId);
}

function parsePacketValue(value: unknown, expectedSliceId?: string | undefined): SlicePacket {
  const packet = StrictNativeSlicePacketSchema.parse(value);
  if (expectedSliceId && packet.slice_id !== expectedSliceId) {
    throw new Error(
      `Native packet slice_id ${packet.slice_id} did not match expected ${expectedSliceId}.`
    );
  }
  return packet;
}

function parseJsonLines(text: string): unknown[] {
  const events: unknown[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) {
      continue;
    }
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // Native agent stderr/warnings can be interleaved by wrappers; non-JSON lines are not events.
    }
  }
  return events;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
