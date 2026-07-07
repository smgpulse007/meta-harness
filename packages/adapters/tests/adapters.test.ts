import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  HARNESS_PROTOCOL_VERSION,
  SliceDefinition,
  SlicePacket,
  SlicePlan
} from "@meta-harness/core";
import { codexAdapter } from "../src/codex.js";
import { FakeAdapter } from "../src/fake.js";
import { FilesystemAdapter } from "../src/filesystem.js";
import {
  buildClaudePrintCommand,
  buildCodexExecCommand,
  ExperimentalNativeAdapter,
  nativeDispatchEnvVar,
  parseClaudeJsonPacket,
  parseCodexJsonlPacket
} from "../src/native-dispatch.js";

async function tempRepo(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "mh-adapters-"));
}

function slice(): SliceDefinition {
  return {
    id: "slice_001",
    phase_id: "phase_001",
    title: "Implement slice",
    objective: "Update a small unit of code.",
    owner: "worker",
    dependencies: [],
    spec_refs: ["docs/spec.md"],
    allowed_write_scope: ["src/**", "tests/**"],
    forbidden_write_scope: [".secrets/**"],
    expected_changed_files: ["src/math.ts", "tests/math.test.ts"],
    validation_commands: [{ id: "test", command: "pnpm test", required: true }],
    evidence_requirements: ["Command evidence is recorded."],
    side_effect_policy: "default",
    packet_required: true,
    next_dependencies: []
  };
}

function plan(currentSlice = slice()): SlicePlan {
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    phase_id: "phase_001",
    slices: [currentSlice]
  };
}

function packet(sliceId = "slice_001"): SlicePacket {
  return {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    slice_id: sliceId,
    status: "complete",
    planned_owner: "worker",
    actual_owner: "native-agent",
    changed_files: ["src/math.ts"],
    spec_alignment_refs: ["docs/spec.md"],
    implementation_summary: "Implemented the requested slice.",
    proof_statements: [
      {
        id: `${sliceId}-proof`,
        claim: "Validation command ran.",
        status: "command_verified",
        evidence: ["artifacts/native/stdout.jsonl"],
        required: true
      }
    ],
    validation_command_outputs: [
      {
        id: "test",
        command: "pnpm test",
        evidence_kind: "command",
        exit_code: 0,
        output_excerpt: "tests passed"
      }
    ],
    side_effect_safety_status: "ok",
    blockers: [],
    risks: [],
    next_dependencies: [],
    auto_continue_recommendation: "continue",
    delegation_metrics: { native: true },
    interruptions: [],
    takeovers: [],
    recovery_events: []
  };
}

describe("adapters", () => {
  it("writes filesystem prompts without launching an external agent", async () => {
    const workspaceRoot = await tempRepo();
    const adapter = new FilesystemAdapter();
    const currentSlice = slice();

    const result = await adapter.dispatchSlice({
      workspaceRoot,
      phaseId: "phase_001",
      slice: currentSlice,
      slicePlan: plan(currentSlice),
      checkpointPath: ".meta-harness/checkpoints/phase_001"
    });

    expect(result.status).toBe("dispatched");
    expect(result.promptPath).toContain("slice_001.prompt.md");
    expect(result.packetPath).toBeUndefined();
    const prompt = await readFile(path.join(workspaceRoot, result.promptPath!), "utf8");
    expect(prompt).toContain("Do not mark a command as passed unless it actually ran");
  });

  it("fake adapter writes simulation packets that are not production proof", async () => {
    const workspaceRoot = await tempRepo();
    const adapter = new FakeAdapter();
    const currentSlice = slice();

    const result = await adapter.dispatchSlice({
      workspaceRoot,
      phaseId: "phase_001",
      slice: currentSlice,
      slicePlan: plan(currentSlice),
      checkpointPath: ".meta-harness/checkpoints/phase_001"
    });
    const packets = await adapter.collectPackets({
      workspaceRoot,
      checkpointPath: ".meta-harness/checkpoints/phase_001"
    });

    expect(result.status).toBe("simulated");
    expect(packets).toHaveLength(1);
    expect(packets[0]!.packet.validation_command_outputs[0]!.evidence_kind).toBe("simulation");
    expect(packets[0]!.packet.risks.join(" ")).toContain("not implementation evidence");
  });

  it("registry entries keep native dispatch unclaimed for prompt-file adapters", async () => {
    const workspaceRoot = await tempRepo();
    const filesystem = await new FilesystemAdapter().registryEntry({ workspaceRoot });
    const fake = await new FakeAdapter().registryEntry({ workspaceRoot });

    expect(filesystem.availability).toBe("filesystem-only");
    expect(filesystem.capabilities.supportsCliDispatch).toBe(false);
    expect(fake.availability).toBe("available");
    expect(fake.capabilities.supportsCliDispatch).toBe(false);
    expect(codexAdapter.capabilities.supportsCliDispatch).toBe(false);
  });

  it("builds experimental native commands with explicit structured-output and sandbox flags", () => {
    const codex = buildCodexExecCommand({
      workspaceRoot: "C:/repo",
      prompt: "Return a packet.",
      schemaPath: "C:/repo/.meta-harness/schema.json",
      finalMessagePath: "C:/repo/.meta-harness/final.json",
      schemaText: "{}",
      sandbox: "read-only"
    });
    expect(codex.args).toContain("exec");
    expect(codex.args).toContain("--json");
    expect(codex.args).toContain("--output-schema");
    expect(codex.args).toContain("--output-last-message");
    expect(codex.args).toContain("--sandbox");
    expect(codex.args).toContain("read-only");

    const claude = buildClaudePrintCommand({
      workspaceRoot: "C:/repo",
      prompt: "Return a packet.",
      schemaPath: "unused",
      finalMessagePath: "unused",
      schemaText: '{"type":"object"}'
    });
    expect(claude.args).toContain("--bare");
    expect(claude.args).toContain("--output-format");
    expect(claude.args).toContain("json");
    expect(claude.args).toContain("--json-schema");
  });

  it("parses Codex JSONL packets and usage metadata", () => {
    const currentPacket = packet();
    const parsed = parseCodexJsonlPacket(
      [
        JSON.stringify({
          type: "item.completed",
          item: { type: "agent_message", text: JSON.stringify(currentPacket) }
        }),
        JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10, output_tokens: 5 } })
      ].join("\n"),
      { expectedSliceId: "slice_001" }
    );

    expect(parsed.packet.slice_id).toBe("slice_001");
    expect(parsed.usage?.input_tokens).toBe(10);
  });

  it("parses Claude structured output packets", () => {
    const parsed = parseClaudeJsonPacket(
      JSON.stringify({
        result: "ok",
        structured_output: packet(),
        usage: { input_tokens: 12 }
      }),
      { expectedSliceId: "slice_001" }
    );

    expect(parsed.packet.actual_owner).toBe("native-agent");
    expect(parsed.usage?.input_tokens).toBe(12);
  });

  it("rejects malformed native packets and mismatched slice ids", () => {
    expect(() => parseCodexJsonlPacket("", { expectedSliceId: "slice_001" })).toThrow(
      /final agent_message/
    );
    expect(() =>
      parseClaudeJsonPacket(JSON.stringify({ structured_output: packet("other_slice") }), {
        expectedSliceId: "slice_001"
      })
    ).toThrow(/did not match expected/);
    expect(() =>
      parseClaudeJsonPacket(
        JSON.stringify({
          structured_output: { ...packet(), unexpected: true }
        }),
        { expectedSliceId: "slice_001" }
      )
    ).toThrow();
  });

  it("keeps experimental native dispatch behind flag and env gates", async () => {
    const workspaceRoot = await tempRepo();
    const previousGate = process.env[nativeDispatchEnvVar];
    delete process.env[nativeDispatchEnvVar];
    try {
      const adapter = new ExperimentalNativeAdapter({
        id: "codex-experimental-test",
        displayName: "Codex Experimental Test",
        agent: "codex",
        commands: ["node"],
        reasonWhenUnavailable: "node missing",
        runner: async () => ({
          exitCode: 0,
          stdout: JSON.stringify({
            type: "item.completed",
            item: { type: "agent_message", text: JSON.stringify(packet()) }
          }),
          stderr: ""
        })
      });

      const result = await adapter.dispatchSlice({
        workspaceRoot,
        phaseId: "phase_001",
        slice: slice(),
        slicePlan: plan(),
        checkpointPath: ".meta-harness/checkpoints/phase_001",
        experimentalNative: true
      });

      expect(result.status).toBe("skipped");
      expect(result.promptPath).toContain("slice_001.prompt.md");
      const registryEntry = await adapter.registryEntry({ workspaceRoot });
      expect(registryEntry.availability).toBe("planned");
    } finally {
      if (previousGate === undefined) {
        delete process.env[nativeDispatchEnvVar];
      } else {
        process.env[nativeDispatchEnvVar] = previousGate;
      }
    }
  });

  it("writes raw native output and packets when experimental gates are open", async () => {
    const workspaceRoot = await tempRepo();
    const previousGate = process.env[nativeDispatchEnvVar];
    process.env[nativeDispatchEnvVar] = "1";
    try {
      const adapter = new ExperimentalNativeAdapter({
        id: "codex-experimental-test",
        displayName: "Codex Experimental Test",
        agent: "codex",
        commands: ["node"],
        reasonWhenUnavailable: "node missing",
        runner: async () => ({
          exitCode: 0,
          stdout: [
            JSON.stringify({
              type: "item.completed",
              item: { type: "agent_message", text: JSON.stringify(packet()) }
            }),
            JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10 } })
          ].join("\n"),
          stderr: "warning text"
        })
      });

      const result = await adapter.dispatchSlice({
        workspaceRoot,
        phaseId: "phase_001",
        slice: slice(),
        slicePlan: plan(),
        checkpointPath: ".meta-harness/checkpoints/phase_001",
        experimentalNative: true
      });
      const packets = await adapter.collectPackets({
        workspaceRoot,
        checkpointPath: ".meta-harness/checkpoints/phase_001"
      });

      expect(result.status).toBe("dispatched");
      expect(result.packetPath).toContain("slice_001.packet.yaml");
      expect(packets[0]!.packet.validation_command_outputs[0]!.evidence_kind).toBe("command");
      expect(
        await readFile(
          path.join(
            workspaceRoot,
            ".meta-harness",
            "checkpoints",
            "phase_001",
            "artifacts",
            "native",
            "codex",
            "slice_001",
            "stderr.txt"
          ),
          "utf8"
        )
      ).toContain("warning text");
    } finally {
      if (previousGate === undefined) {
        delete process.env[nativeDispatchEnvVar];
      } else {
        process.env[nativeDispatchEnvVar] = previousGate;
      }
    }
  });

  it("stores raw output and fails when experimental native process exits nonzero", async () => {
    const workspaceRoot = await tempRepo();
    const previousGate = process.env[nativeDispatchEnvVar];
    process.env[nativeDispatchEnvVar] = "1";
    try {
      const adapter = new ExperimentalNativeAdapter({
        id: "codex-experimental-test",
        displayName: "Codex Experimental Test",
        agent: "codex",
        commands: ["node"],
        reasonWhenUnavailable: "node missing",
        runner: async () => ({
          exitCode: 2,
          stdout: "native failed",
          stderr: "failure details"
        })
      });

      const result = await adapter.dispatchSlice({
        workspaceRoot,
        phaseId: "phase_001",
        slice: slice(),
        slicePlan: plan(),
        checkpointPath: ".meta-harness/checkpoints/phase_001",
        experimentalNative: true
      });

      expect(result.status).toBe("failed");
      expect(result.packetPath).toBeUndefined();
      expect(
        await readFile(
          path.join(
            workspaceRoot,
            ".meta-harness",
            "checkpoints",
            "phase_001",
            "artifacts",
            "native",
            "codex",
            "slice_001",
            "stdout.jsonl"
          ),
          "utf8"
        )
      ).toContain("native failed");
    } finally {
      if (previousGate === undefined) {
        delete process.env[nativeDispatchEnvVar];
      } else {
        process.env[nativeDispatchEnvVar] = previousGate;
      }
    }
  });
});
