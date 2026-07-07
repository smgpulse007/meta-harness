import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { compileSpecCommand } from "../src/commands/compile-spec.js";
import { contextPackCommand } from "../src/commands/context-pack.js";
import { emitInstructionsCommand } from "../src/commands/emit-instructions.js";
import { initCommand } from "../src/commands/init.js";
import { lintPlanCommand } from "../src/commands/lint-plan.js";
import { planCommand } from "../src/commands/plan.js";

async function tempRepo(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "mh-cli-"));
}

const execFileAsync = promisify(execFile);
const builtCliPath = path.resolve("packages/cli/dist/index.js");

describe("cli commands", () => {
  it("initializes, compiles, plans, and lints", async () => {
    const cwd = await tempRepo();
    const output: string[] = [];
    const context = {
      cwd,
      stdout: (message: string) => output.push(message),
      stderr: (message: string) => output.push(message)
    };
    await initCommand(context, { profile: "strict" });
    await writeFile(
      path.join(cwd, "docs", "implementation_spec.md"),
      "# Spec\n\n- Must add a harness workflow.\n",
      "utf8"
    );
    await compileSpecCommand(context, { spec: "docs/implementation_spec.md", phase: "phase_001" });
    await planCommand(context, { phase: "phase_001" });
    await expect(lintPlanCommand(context, { phase: "phase_001" })).resolves.toBeUndefined();
    expect(output.join("\n")).toContain("Initialized Meta Harness");
  });

  it.skipIf(!existsSync(builtCliPath))("prints help from the built entrypoint", async () => {
    const { stdout } = await execFileAsync(process.execPath, [builtCliPath, "--help"]);
    expect(stdout).toContain("Meta Harness CLI");
    expect(stdout).toContain("mh");
  });

  it("emits target-specific instruction and MCP compatibility files", async () => {
    const cwd = await tempRepo();
    const output: string[] = [];
    const context = {
      cwd,
      stdout: (message: string) => output.push(message),
      stderr: (message: string) => output.push(message)
    };

    await emitInstructionsCommand(context, { target: "copilot-custom" });
    const copilotCustom = await readFile(
      path.join(cwd, ".github", "instructions", "meta-harness.instructions.md"),
      "utf8"
    );
    expect(copilotCustom.startsWith('---\napplyTo: "**"\n---')).toBe(true);

    await emitInstructionsCommand(context, { target: "opencode" });
    const opencodeConfig = JSON.parse(await readFile(path.join(cwd, "opencode.json"), "utf8"));
    expect(opencodeConfig.permission).toEqual({ edit: "ask", bash: "ask" });
    expect(opencodeConfig.mcp["meta-harness"].command).toEqual([
      "node",
      "packages/cli/dist/index.js",
      "mcp",
      "--stdio"
    ]);
    expect(
      await readFile(path.join(cwd, ".opencode", "instructions", "meta-harness.md"), "utf8")
    ).toContain("No phase advances without verified evidence");

    await emitInstructionsCommand(context, { target: "roo" });
    const rooConfig = JSON.parse(await readFile(path.join(cwd, ".roo", "mcp.json"), "utf8"));
    expect(rooConfig.mcpServers["meta-harness"].command).toBe("node");
    expect(rooConfig.mcpServers["meta-harness"].args).toEqual([
      "packages/cli/dist/index.js",
      "mcp",
      "--stdio"
    ]);
    expect(rooConfig.mcpServers["meta-harness"].alwaysAllow).toContain("get_next_action");
    expect(await readFile(path.join(cwd, ".roo", "rules", "meta-harness.md"), "utf8")).toContain(
      "Roo support is instruction and MCP compatibility only"
    );

    await emitInstructionsCommand(context, { target: "all" });
    expect(existsSync(path.join(cwd, "AGENTS.md"))).toBe(true);
    expect(
      await readFile(path.join(cwd, ".cursor", "rules", "meta-harness.mdc"), "utf8")
    ).toContain("alwaysApply: true");
    expect(existsSync(path.join(cwd, "opencode.json"))).toBe(true);
    expect(existsSync(path.join(cwd, ".roo", "mcp.json"))).toBe(true);
    expect(output.join("\n")).toContain("Wrote");
  });

  it("builds bounded target-specific context packs", async () => {
    const cwd = await tempRepo();
    const output: string[] = [];
    const context = {
      cwd,
      stdout: (message: string) => output.push(message),
      stderr: (message: string) => output.push(message)
    };
    await initCommand(context, { profile: "strict" });
    output.length = 0;

    await contextPackCommand(context, {
      target: "roo",
      phase: "phase_001",
      budget: "8000",
      format: "json"
    });

    const pack = JSON.parse(output.join(""));
    expect(pack.target).toBe("roo");
    expect(pack.status).toBe("within_budget");
    expect(pack.target_guidance.join("\n")).toContain(
      "Roo support as instruction/MCP compatibility only"
    );
    expect(pack.files.map((file: { path: string }) => file.path)).toContain("AGENTS.md");

    output.length = 0;
    await contextPackCommand(context, {
      target: "copilot",
      phase: "phase_001",
      format: "markdown"
    });
    expect(output.join("\n")).toContain("# Meta Harness Context Pack");
    expect(output.join("\n")).toContain("Target: copilot");
  });
});
