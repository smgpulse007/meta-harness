import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  auditCheckpoint,
  assertSafeId,
  buildDefaultNextAction,
  createInitialState,
  defaultParentPrompt,
  defaultRecoveryPrompt,
  defaultReviewerPrompt,
  defaultWorkerPrompt,
  getReadySlices,
  HARNESS_PROTOCOL_VERSION,
  readJsonFile,
  readTextFile,
  readYamlFile,
  renderTemplate,
  resolveInsideWorkspace,
  safeIdPattern,
  SlicePacketSchema,
  SlicePlan,
  writeJsonFile,
  writeYamlFile
} from "@meta-harness/core";

export type McpServerMode =
  | "read-only"
  | "workspace-write"
  | "checkpoint-write"
  | "dangerous-disabled";

export interface MetaHarnessServerOptions {
  workspaceRoot: string;
  mode?: McpServerMode;
}

const safeId = () => z.string().regex(safeIdPattern, "unsafe id");
const checkpointPath = (phaseId: string) => `.meta-harness/checkpoints/${assertSafeId(phaseId, "phaseId")}`;

export function createMetaHarnessServer(options: MetaHarnessServerOptions): McpServer {
  const workspaceRoot = path.resolve(options.workspaceRoot);
  const mode = options.mode ?? "read-only";
  const server = new McpServer({
    name: "meta-harness",
    version: HARNESS_PROTOCOL_VERSION
  });

  registerTools(server, workspaceRoot, mode);
  registerResources(server, workspaceRoot);
  registerPrompts(server);
  return server;
}

export async function startStdioServer(options: MetaHarnessServerOptions): Promise<void> {
  const server = createMetaHarnessServer(options);
  await server.connect(new StdioServerTransport());
}

function registerTools(server: McpServer, workspaceRoot: string, mode: McpServerMode): void {
  server.registerTool(
    "get_protocol_version",
    { title: "Get protocol version", description: "Return the Meta Harness protocol version." },
    async () => textResult({ protocol_version: HARNESS_PROTOCOL_VERSION })
  );

  server.registerTool(
    "get_harness_status",
    { title: "Get harness status", description: "Read .meta-harness/state.json." },
    async () => textResult(await readOptionalJson(workspaceRoot, ".meta-harness/state.json", createInitialState()))
  );

  server.registerTool(
    "get_current_phase",
    { title: "Get current phase", description: "Read the current phase from harness state." },
    async () => {
      const state = await readOptionalJson<any>(workspaceRoot, ".meta-harness/state.json", createInitialState());
      return textResult({ current_phase_id: state.current_phase_id ?? "phase_001", state: state.state });
    }
  );

  server.registerTool(
    "list_phases",
    { title: "List phases", description: "List phases in the phase manifest." },
    async () => {
      const manifest = await readYamlFile<any>(
        workspaceRoot,
        "docs/implementation_harness/phase_manifest.yaml"
      );
      return textResult(manifest.phases ?? []);
    }
  );

  server.registerTool(
    "get_phase",
    {
      title: "Get phase",
      description: "Return one phase definition.",
      inputSchema: { phaseId: safeId() }
    },
    async ({ phaseId }) => {
      const manifest = await readYamlFile<any>(
        workspaceRoot,
        "docs/implementation_harness/phase_manifest.yaml"
      );
      return textResult(manifest.phases?.find((phase: any) => phase.id === phaseId) ?? null);
    }
  );

  server.registerTool(
    "get_ready_slices",
    {
      title: "Get ready slices",
      description: "Return dependency-ready slices for a phase.",
      inputSchema: {
        phaseId: safeId().default("phase_001"),
        completedSliceIds: z.array(safeId()).default([])
      }
    },
    async ({ phaseId, completedSliceIds }) => {
      const plan = await readYamlFile<SlicePlan>(workspaceRoot, `${checkpointPath(phaseId)}/slice_plan.yaml`);
      return textResult(getReadySlices(plan, completedSliceIds));
    }
  );

  server.registerTool(
    "claim_slice",
    {
      title: "Claim slice",
      description: "Record a slice claim when write mode is enabled.",
      inputSchema: { phaseId: safeId().default("phase_001"), sliceId: safeId(), owner: safeId() }
    },
    async ({ phaseId, sliceId, owner }) => {
      assertWriteMode(mode, "claim_slice");
      return writeJsonResult(workspaceRoot, `${checkpointPath(phaseId)}/artifacts/claim_${sliceId}.json`, {
        sliceId,
        owner,
        claimed_at: new Date().toISOString()
      });
    }
  );

  server.registerTool(
    "get_slice",
    {
      title: "Get slice",
      description: "Return one slice from a phase slice plan.",
      inputSchema: { phaseId: safeId().default("phase_001"), sliceId: safeId() }
    },
    async ({ phaseId, sliceId }) => {
      const plan = await readYamlFile<SlicePlan>(workspaceRoot, `${checkpointPath(phaseId)}/slice_plan.yaml`);
      return textResult(plan.slices.find((slice) => slice.id === sliceId) ?? null);
    }
  );

  server.registerTool(
    "submit_slice_packet",
    {
      title: "Submit slice packet",
      description: "Write a validated slice packet in write mode.",
      inputSchema: { phaseId: safeId().default("phase_001"), packet: z.unknown() }
    },
    async ({ phaseId, packet }) => {
      assertCheckpointWriteMode(mode, "submit_slice_packet");
      const parsed = SlicePacketSchema.parse(packet);
      assertSafeId(parsed.slice_id, "packet.slice_id");
      return writeYamlResult(
        workspaceRoot,
        `${checkpointPath(phaseId)}/subagent_packets/${parsed.slice_id}.packet.yaml`,
        parsed
      );
    }
  );

  server.registerTool(
    "record_command_output",
    {
      title: "Record command output",
      description: "Append a command evidence record without executing a command.",
      inputSchema: {
        phaseId: safeId().default("phase_001"),
        commandId: safeId(),
        command: z.string(),
        exitCode: z.number().int().nullable(),
        outputExcerpt: z.string().default("")
      }
    },
    async ({ phaseId, commandId, command, exitCode, outputExcerpt }) => {
      assertCheckpointWriteMode(mode, "record_command_output");
      const safePath = `${checkpointPath(phaseId)}/artifacts/command_${commandId}.json`;
      return writeJsonResult(workspaceRoot, safePath, {
        commandId,
        command,
        exitCode,
        outputExcerpt,
        recorded_at: new Date().toISOString()
      });
    }
  );

  server.registerTool(
    "request_write_lock",
    {
      title: "Request write lock",
      description: "Record a write-lock request in write mode.",
      inputSchema: { owner: safeId(), scopes: z.array(z.string()).min(1) }
    },
    async ({ owner, scopes }) => {
      assertWriteMode(mode, "request_write_lock");
      return writeJsonResult(workspaceRoot, `.meta-harness/artifacts/write_lock_${owner}.json`, {
        owner,
        scopes,
        requested_at: new Date().toISOString()
      });
    }
  );

  server.registerTool(
    "release_write_lock",
    {
      title: "Release write lock",
      description: "Record a write-lock release in write mode.",
      inputSchema: { owner: safeId(), lockId: safeId() }
    },
    async ({ owner, lockId }) => {
      assertWriteMode(mode, "release_write_lock");
      return writeJsonResult(workspaceRoot, `.meta-harness/artifacts/release_lock_${owner}.json`, {
        owner,
        lockId,
        released_at: new Date().toISOString()
      });
    }
  );

  server.registerTool(
    "get_validation_plan",
    {
      title: "Get validation plan",
      description: "Return validation commands for a phase.",
      inputSchema: { phaseId: safeId().default("phase_001") }
    },
    async ({ phaseId }) => {
      const plan = await readYamlFile<SlicePlan>(workspaceRoot, `${checkpointPath(phaseId)}/slice_plan.yaml`);
      return textResult(plan.slices.flatMap((slice) => slice.validation_commands));
    }
  );

  server.registerTool(
    "submit_validation_result",
    {
      title: "Submit validation result",
      description: "Record validation result in checkpoint write mode.",
      inputSchema: {
        phaseId: safeId().default("phase_001"),
        commandId: safeId(),
        status: z.enum(["passed", "failed", "not_run"]),
        evidencePath: z.string().optional()
      }
    },
    async ({ phaseId, commandId, status, evidencePath }) => {
      assertCheckpointWriteMode(mode, "submit_validation_result");
      if (status === "passed" && !evidencePath) {
        throw new Error("passed validation results require an evidencePath");
      }
      if (evidencePath) {
        const absoluteEvidencePath = resolveInsideWorkspace(workspaceRoot, evidencePath);
        if (!existsSync(absoluteEvidencePath)) {
          throw new Error(`validation evidencePath does not exist: ${evidencePath}`);
        }
      }
      return writeJsonResult(workspaceRoot, `${checkpointPath(phaseId)}/artifacts/validation_${commandId}.json`, {
        commandId,
        status,
        evidencePath,
        recorded_at: new Date().toISOString()
      });
    }
  );

  server.registerTool(
    "audit_checkpoint",
    {
      title: "Audit checkpoint",
      description: "Mechanically audit a checkpoint.",
      inputSchema: { phaseId: safeId().default("phase_001") }
    },
    async ({ phaseId }) => {
      const proof = await readJsonFile(workspaceRoot, `${checkpointPath(phaseId)}/proof.json`);
      const nextAction = await readYamlFile(workspaceRoot, `${checkpointPath(phaseId)}/next_action.yaml`);
      return textResult(
        await auditCheckpoint({
          workspaceRoot,
          checkpointPath: checkpointPath(phaseId),
          proof,
          nextAction
        })
      );
    }
  );

  server.registerTool(
    "get_checkpoint",
    {
      title: "Get checkpoint",
      description: "Read checkpoint.md for a phase.",
      inputSchema: { phaseId: safeId().default("phase_001") }
    },
    async ({ phaseId }) =>
      textResult(await readTextFile(workspaceRoot, `${checkpointPath(phaseId)}/checkpoint.md`))
  );

  server.registerTool(
    "write_checkpoint",
    {
      title: "Write checkpoint marker",
      description: "Write a checkpoint marker only in checkpoint-write or workspace-write mode.",
      inputSchema: { phaseId: safeId().default("phase_001"), summary: z.string() }
    },
    async ({ phaseId, summary }) => {
      assertCheckpointWriteMode(mode, "write_checkpoint");
      return writeJsonResult(workspaceRoot, `${checkpointPath(phaseId)}/artifacts/mcp_checkpoint_marker.json`, {
        summary,
        written_at: new Date().toISOString()
      });
    }
  );

  server.registerTool(
    "get_next_action",
    {
      title: "Get next action",
      description: "Read next_action.yaml.",
      inputSchema: { phaseId: safeId().default("phase_001") }
    },
    async ({ phaseId }) =>
      textResult(await readYamlFile(workspaceRoot, `${checkpointPath(phaseId)}/next_action.yaml`))
  );

  server.registerTool(
    "get_requirement",
    {
      title: "Get requirement",
      description: "Read a requirement from the ledger.",
      inputSchema: { requirementId: safeId() }
    },
    async ({ requirementId }) => {
      const ledger = await readOptionalJson<any>(workspaceRoot, ".meta-harness/requirement_ledger.json", {
        requirements: []
      });
      return textResult(ledger.requirements.find((requirement: any) => requirement.id === requirementId) ?? null);
    }
  );

  server.registerTool(
    "update_requirement_status",
    {
      title: "Update requirement status",
      description: "Update a requirement status in write mode.",
      inputSchema: {
        requirementId: safeId(),
        status: z.enum(["not_started", "in_progress", "implemented", "blocked"])
      }
    },
    async ({ requirementId, status }) => {
      assertWriteMode(mode, "update_requirement_status");
      const ledger = await readOptionalJson<any>(workspaceRoot, ".meta-harness/requirement_ledger.json", {
        protocol_version: HARNESS_PROTOCOL_VERSION,
        generated_at: new Date().toISOString(),
        requirements: [],
        limitations: []
      });
      for (const requirement of ledger.requirements) {
        if (requirement.id === requirementId) {
          requirement.implementation_status = status;
        }
      }
      return writeJsonResult(workspaceRoot, ".meta-harness/requirement_ledger.json", ledger);
    }
  );

  server.registerTool(
    "list_templates",
    { title: "List templates", description: "List built-in prompt templates." },
    async () =>
      textResult([
        "parent_prompt",
        "worker_prompt",
        "reviewer_prompt",
        "recovery_prompt",
        "next_action"
      ])
  );

  server.registerTool(
    "render_template",
    {
      title: "Render template",
      description: "Render a built-in template.",
      inputSchema: {
        template: z.enum(["parent_prompt", "worker_prompt", "reviewer_prompt", "recovery_prompt"]),
        values: z.record(z.union([z.string(), z.number(), z.boolean()])).default({})
      }
    },
    async ({ template, values }) => {
      const templates = {
        parent_prompt: defaultParentPrompt,
        worker_prompt: defaultWorkerPrompt,
        reviewer_prompt: defaultReviewerPrompt,
        recovery_prompt: defaultRecoveryPrompt
      };
      return textResult(renderTemplate(templates[template], values));
    }
  );

  server.registerTool(
    "get_default_next_action_shape",
    {
      title: "Get default next action shape",
      description: "Compatibility helper for hosts that want the continuation shape.",
      inputSchema: { phaseId: safeId().default("phase_001") }
    },
    async ({ phaseId }) => textResult(buildDefaultNextAction({ phaseId, status: "blocked" }))
  );
}

function registerResources(server: McpServer, workspaceRoot: string): void {
  const resources: Array<[string, string, string]> = [
    ["status", "harness://status", ".meta-harness/state.json"],
    ["phase-current", "harness://phase/current", "docs/implementation_harness/phase_manifest.yaml"],
    ["slice-plan-current", "harness://slice-plan/current", ".meta-harness/checkpoints/phase_001/slice_plan.yaml"],
    ["requirements", "harness://requirements", ".meta-harness/requirement_ledger.json"],
    ["proof-latest", "harness://proof/latest", ".meta-harness/checkpoints/phase_001/proof.json"],
    ["checkpoint-latest", "harness://checkpoint/latest", ".meta-harness/checkpoints/phase_001/checkpoint.md"],
    ["templates-parent", "harness://templates/parent", "templates/parent_prompt.md"],
    ["templates-worker", "harness://templates/worker", "templates/worker_prompt.md"],
    ["templates-reviewer", "harness://templates/reviewer", "templates/reviewer_prompt.md"],
    ["templates-recovery", "harness://templates/recovery", "templates/recovery_prompt.md"]
  ];

  for (const [name, uri, relativePath] of resources) {
    server.registerResource(
      name,
      uri,
      { title: name, mimeType: relativePath.endsWith(".json") ? "application/json" : "text/plain" },
      async () => {
        const absolutePath = resolveInsideWorkspace(workspaceRoot, relativePath);
        const text = existsSync(absolutePath)
          ? await readFile(absolutePath, "utf8")
          : `Resource not found: ${relativePath}`;
        return { contents: [{ uri, text }] };
      }
    );
  }
}

function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "parent_coordinator_prompt",
    { title: "Parent coordinator prompt", argsSchema: { phaseId: safeId().default("phase_001") } },
    async ({ phaseId }) => promptResult(renderTemplate(defaultParentPrompt, { phase_id: phaseId }))
  );
  server.registerPrompt(
    "worker_slice_prompt",
    { title: "Worker slice prompt", argsSchema: { sliceId: safeId() } },
    async ({ sliceId }) => promptResult(renderTemplate(defaultWorkerPrompt, { slice_id: sliceId }))
  );
  server.registerPrompt(
    "reviewer_prompt",
    { title: "Reviewer prompt", argsSchema: { phaseId: safeId().default("phase_001") } },
    async ({ phaseId }) => promptResult(renderTemplate(defaultReviewerPrompt, { phase_id: phaseId }))
  );
  server.registerPrompt(
    "recovery_prompt",
    { title: "Recovery prompt", argsSchema: { phaseId: safeId().default("phase_001") } },
    async ({ phaseId }) => promptResult(renderTemplate(defaultRecoveryPrompt, { phase_id: phaseId }))
  );
  server.registerPrompt(
    "continuation_prompt",
    { title: "Continuation prompt", argsSchema: { phaseId: safeId().default("phase_001") } },
    async ({ phaseId }) =>
      promptResult(
        `Read ${checkpointPath(phaseId)}/next_action.yaml, verify gates, and continue only if allowed.`
      )
  );
}

function assertWriteMode(mode: McpServerMode, toolName: string): void {
  if (mode !== "workspace-write" && mode !== "checkpoint-write") {
    throw new Error(`${toolName} requires explicit write mode; current mode is ${mode}`);
  }
}

function assertCheckpointWriteMode(mode: McpServerMode, toolName: string): void {
  if (mode !== "checkpoint-write" && mode !== "workspace-write") {
    throw new Error(`${toolName} requires checkpoint-write or workspace-write mode; current mode is ${mode}`);
  }
}

async function readOptionalJson<T>(workspaceRoot: string, relativePath: string, fallback: T): Promise<T> {
  try {
    return await readJsonFile<T>(workspaceRoot, relativePath);
  } catch {
    return fallback;
  }
}

async function writeJsonResult(workspaceRoot: string, relativePath: string, value: unknown) {
  const pathWritten = await writeJsonFile(workspaceRoot, relativePath, value);
  return textResult({ path: path.relative(workspaceRoot, pathWritten).replaceAll("\\", "/") });
}

async function writeYamlResult(workspaceRoot: string, relativePath: string, value: unknown) {
  const pathWritten = await writeYamlFile(workspaceRoot, relativePath, value);
  return textResult({ path: path.relative(workspaceRoot, pathWritten).replaceAll("\\", "/") });
}

async function textResult(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return { content: [{ type: "text" as const, text }] };
}

async function promptResult(text: string) {
  return {
    messages: [
      {
        role: "user" as const,
        content: { type: "text" as const, text }
      }
    ]
  };
}
