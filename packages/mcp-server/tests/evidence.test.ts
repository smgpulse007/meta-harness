import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMetaHarnessServer } from "../src/index.js";

async function withWorkspace(run: (client: Client, root: string) => Promise<void>) {
  const root = await mkdtemp(path.join(os.tmpdir(), "mh-mcp-test-"));
  if (
    path.dirname(root) !== path.resolve(os.tmpdir()) ||
    !path.basename(root).startsWith("mh-mcp-test-")
  ) {
    throw new Error("Refusing to use an unexpected test directory.");
  }
  const server = createMetaHarnessServer({ workspaceRoot: root, mode: "checkpoint-write" });
  const client = new Client({ name: "evidence-regression", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  try {
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    await run(client, root);
  } finally {
    await client.close();
    await server.close();
    await rm(root, { recursive: true, force: true });
  }
}

describe("MCP evidence persistence", () => {
  it("defaults only missing state and rejects corrupt, invalid, or unreadable state", async () => {
    await withWorkspace(async (client, root) => {
      const missing = await client.callTool({ name: "get_current_phase", arguments: {} });
      expect(missing.isError).not.toBe(true);
      expect(JSON.stringify(missing.content)).toContain("phase_001");
      await mkdir(path.join(root, ".meta-harness"));
      const statePath = path.join(root, ".meta-harness/state.json");
      for (const content of ["not-json fixture-private-content", "{}", '{"state":"unsupported"}']) {
        await writeFile(statePath, content);
        for (const name of ["get_current_phase", "get_harness_status"]) {
          const result = await client.callTool({ name, arguments: {} });
          expect(result.isError).toBe(true);
          expect(JSON.stringify(result.content)).not.toContain("fixture-private-content");
          expect(JSON.stringify(result.content)).not.toContain("phase_001");
        }
      }
      await rm(statePath);
      await mkdir(statePath);
      const unreadable = await client.callTool({ name: "get_current_phase", arguments: {} });
      expect(unreadable.isError).toBe(true);
    });
  });

  it("redacts command and output fields before writing a record", async () => {
    await withWorkspace(async (client, root) => {
      const result = await client.callTool({
        name: "record_command_output",
        arguments: {
          commandId: "redacted",
          command: "echo token=fixture-command",
          exitCode: 0,
          outputExcerpt: "passed\npassword=fixture-output"
        }
      });
      expect(result.isError).not.toBe(true);
      const raw = await readFile(
        path.join(root, ".meta-harness/checkpoints/phase_001/artifacts/command_redacted.json"),
        "utf8"
      );
      expect(raw).not.toContain("fixture-command");
      expect(raw).not.toContain("fixture-output");
      const record = JSON.parse(raw);
      expect(record.command).toBe("echo [REDACTED]");
      expect(record.outputExcerpt).toBe("passed\n[REDACTED]");
      expect(record.exitCode).toBe(0);
      expect(record.redaction).toBe("secret_patterns");
      const defaulted = await client.callTool({
        name: "record_command_output",
        arguments: {
          commandId: "empty",
          command: "echo fixture",
          exitCode: null
        }
      });
      expect(defaulted.isError).not.toBe(true);
      const empty = JSON.parse(
        await readFile(
          path.join(root, ".meta-harness/checkpoints/phase_001/artifacts/command_empty.json"),
          "utf8"
        )
      );
      expect(empty.outputExcerpt).toBe("");
    });
  });

  it("rejects oversized command records before creating artifacts", async () => {
    await withWorkspace(async (client, root) => {
      for (const oversized of [
        { command: "x".repeat(4097) },
        { outputExcerpt: "x".repeat(16385) }
      ]) {
        const result = await client.callTool({
          name: "record_command_output",
          arguments: {
            commandId: "large",
            command: "echo fixture",
            exitCode: 0,
            ...oversized
          }
        });
        expect(result.isError).toBe(true);
      }
      expect(await readdir(root)).toEqual([]);
    });
  });

  it("applies the same redaction and bounds to packet command evidence", async () => {
    await withWorkspace(async (client, root) => {
      const packet = {
        protocol_version: "0.1.0",
        slice_id: "synthetic",
        status: "pass_with_risks",
        planned_owner: "fixture",
        actual_owner: "fixture",
        changed_files: [],
        spec_alignment_refs: ["docs/fixture.md"],
        implementation_summary: "Synthetic protocol fixture.",
        proof_statements: [],
        validation_command_outputs: [
          {
            id: "fixture",
            command: "echo token=fixture-command",
            evidence_kind: "simulation",
            exit_code: 0,
            output_excerpt: "secret=fixture-output"
          }
        ],
        side_effect_safety_status: "not_verified",
        blockers: [],
        risks: ["Simulation only"],
        next_dependencies: [],
        auto_continue_recommendation: "stop",
        delegation_metrics: {},
        interruptions: [],
        takeovers: [],
        recovery_events: []
      };
      const result = await client.callTool({ name: "submit_slice_packet", arguments: { packet } });
      expect(result.isError).not.toBe(true);
      const packetDir = path.join(root, ".meta-harness/checkpoints/phase_001/subagent_packets");
      const saved = await readFile(path.join(packetDir, "synthetic.packet.yaml"), "utf8");
      expect(saved).not.toContain("fixture-command");
      expect(saved).not.toContain("fixture-output");
      expect(saved).toContain("[REDACTED]");
      const tooLong = await client.callTool({
        name: "submit_slice_packet",
        arguments: {
          packet: {
            ...packet,
            slice_id: "too-long",
            validation_command_outputs: [
              { ...packet.validation_command_outputs[0], output_excerpt: "x".repeat(16385) }
            ]
          }
        }
      });
      expect(tooLong.isError).toBe(true);
      const tooBig = await client.callTool({
        name: "submit_slice_packet",
        arguments: {
          packet: {
            ...packet,
            slice_id: "too-big",
            implementation_summary: "x".repeat(262145)
          }
        }
      });
      expect(tooBig.isError).toBe(true);
      expect(await readdir(packetDir)).toEqual(["synthetic.packet.yaml"]);
    });
  });
});
