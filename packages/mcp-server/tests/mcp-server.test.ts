import { describe, expect, it } from "vitest";
import { createMetaHarnessServer } from "../src/index.js";

describe("mcp server", () => {
  it("creates a stdio-capable server", () => {
    const server = createMetaHarnessServer({ workspaceRoot: process.cwd(), mode: "read-only" });
    expect(server.isConnected()).toBe(false);
  });

  it("blocks write tools in read-only mode", async () => {
    const server = createMetaHarnessServer({
      workspaceRoot: process.cwd(),
      mode: "read-only"
    }) as any;
    expect(server._registeredTools.get_next_action).toBeDefined();
    expect(server._registeredTools.get_ready_slices).toBeDefined();
    const writeToolInputs: Record<string, unknown> = {
      claim_slice: { phaseId: "phase_001", sliceId: "slice_001", owner: "test" },
      submit_slice_packet: { phaseId: "phase_001", packet: { slice_id: "slice_001" } },
      record_command_output: {
        phaseId: "phase_001",
        commandId: "cmd_001",
        command: "pnpm test",
        exitCode: 0,
        outputExcerpt: ""
      },
      request_write_lock: { owner: "test", scopes: ["src/**"] },
      release_write_lock: { owner: "test", lockId: "lock_001" },
      submit_validation_result: { phaseId: "phase_001", commandId: "cmd_001", status: "passed" },
      write_checkpoint: { phaseId: "phase_001", summary: "summary" },
      update_requirement_status: { requirementId: "REQ-001", status: "implemented" }
    };
    for (const [toolName, input] of Object.entries(writeToolInputs)) {
      await expect(server._registeredTools[toolName].handler(input, {})).rejects.toThrow(
        /requires/
      );
    }
  });

  it("requires evidence for passed validation results in write mode", async () => {
    const server = createMetaHarnessServer({
      workspaceRoot: process.cwd(),
      mode: "checkpoint-write"
    }) as any;
    await expect(
      server._registeredTools.submit_validation_result.handler(
        { phaseId: "phase_001", commandId: "cmd_001", status: "passed" },
        {}
      )
    ).rejects.toThrow(/evidencePath/);
  });
});
