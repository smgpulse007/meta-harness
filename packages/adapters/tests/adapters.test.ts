import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HARNESS_PROTOCOL_VERSION, SliceDefinition, SlicePlan } from "@meta-harness/core";
import { FakeAdapter } from "../src/fake.js";
import { FilesystemAdapter } from "../src/filesystem.js";

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
  });
});
