import { describe, expect, it } from "vitest";
import { createMetaHarnessServer } from "../src/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

describe("mcp server", () => {
  it("lists and validates record-valued tools over the MCP protocol", async () => {
    const server = createMetaHarnessServer({ workspaceRoot: process.cwd(), mode: "read-only" });
    const client = new Client({ name: "schema-regression", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    try {
      await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
      const listed = await client.listTools();
      expect(listed.tools.some((tool) => tool.name === "render_template")).toBe(true);
      const templates = await client.callTool({ name: "list_templates", arguments: {} });
      const content = templates.content as Array<{ type: string; text: string }>;
      const names = JSON.parse(content[0]!.text) as string[];
      expect(names).toHaveLength(4);
      for (const template of names) {
        const rendered = await client.callTool({
          name: "render_template",
          arguments: { template }
        });
        expect(rendered.isError).not.toBe(true);
      }
      const nextAction = await client.callTool({
        name: "get_default_next_action_shape",
        arguments: {}
      });
      const nextContent = nextAction.content as Array<{ type: string; text: string }>;
      expect(JSON.parse(nextContent[0]!.text).current_phase_id).toBe("phase_001");

      const valid = await client.callTool({
        name: "render_template",
        arguments: {
          template: "worker_prompt",
          values: { objective: "Synthetic task", budget: 12, enabled: false }
        }
      });
      expect(valid.isError).not.toBe(true);
      const invalid = await client.callTool({
        name: "render_template",
        arguments: {
          template: "worker_prompt",
          values: { objective: ["invalid nested value"] }
        }
      });
      expect(invalid.isError).toBe(true);
      const blocked = await client.callTool({
        name: "claim_slice",
        arguments: {
          phaseId: "phase_001",
          sliceId: "slice_001",
          owner: "test"
        }
      });
      expect(blocked.isError).toBe(true);
    } finally {
      await client.close();
      await server.close();
    }
  });

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
