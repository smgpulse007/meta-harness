import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { buildBudgetReport } from "../src/commands/budget.js";
import { compileSpecCommand } from "../src/commands/compile-spec.js";
import { contextPackCommand } from "../src/commands/context-pack.js";
import { emitInstructionsCommand } from "../src/commands/emit-instructions.js";
import { initCommand } from "../src/commands/init.js";
import { lintPlanCommand } from "../src/commands/lint-plan.js";
import { planCommand } from "../src/commands/plan.js";
import { summarizeLogCommand } from "../src/commands/summarize-log.js";

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
    expect(stdout).toContain("budget");
    expect(stdout).toContain("summarize-log");
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
    expect(pack.role).toBe("worker");
    expect(pack.status).toBe("within_budget");
    expect(pack.allowed_write_scope).toContain("src/**");
    expect(pack.proof_state.exists).toBe(false);
    expect(pack.budget_summary.raw_artifacts_included).toBe(false);
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
    expect(output.join("\n")).toContain("## Proof State");
  });

  it("builds a budget report for generated instruction and skill files", async () => {
    const cwd = await tempRepo();
    const output: string[] = [];
    const context = {
      cwd,
      stdout: (message: string) => output.push(message),
      stderr: (message: string) => output.push(message)
    };
    await initCommand(context, { profile: "strict" });
    await emitInstructionsCommand(context, { target: "all" });
    const skillBody = "# Meta Harness\n\nUse this skill for evidence-gated harness work.\n";
    for (const skillPath of [
      path.join(cwd, "skills", "meta-harness", "SKILL.md"),
      path.join(cwd, ".agents", "skills", "meta-harness", "SKILL.md"),
      path.join(cwd, ".claude", "skills", "meta-harness", "SKILL.md")
    ]) {
      await mkdir(path.dirname(skillPath), { recursive: true });
      await writeFile(skillPath, skillBody, "utf8");
    }
    const mcpServerPath = path.join(cwd, "packages", "mcp-server", "src", "server.ts");
    await mkdir(path.dirname(mcpServerPath), { recursive: true });
    await writeFile(
      mcpServerPath,
      'server.registerTool("status", { description: "Return status." });\n',
      "utf8"
    );

    const report = await buildBudgetReport(context, { phaseId: "phase_001" });
    expect(report.status).toBe("within_budget");
    expect(report.items.some((item) => item.budget_class === "instruction_index")).toBe(true);
    expect(report.items.some((item) => item.budget_class === "slice_pack")).toBe(true);
  });

  it("summarizes and redacts raw command logs", async () => {
    const cwd = await tempRepo();
    const output: string[] = [];
    const context = {
      cwd,
      stdout: (message: string) => output.push(message),
      stderr: (message: string) => output.push(message)
    };
    await writeFile(
      path.join(cwd, "command-output.txt"),
      "first line\napi_key=supersecretvalue\nmiddle line\nalmost last\nlast line\n",
      "utf8"
    );

    await summarizeLogCommand(context, {
      input: "command-output.txt",
      command: "pnpm test",
      exitCode: "0",
      timestamp: "2026-07-07T00:00:00.000Z",
      format: "json",
      maxLines: "4"
    });

    const excerpt = JSON.parse(output.join(""));
    expect(excerpt.raw_path).toBe("command-output.txt");
    expect(excerpt.command).toBe("pnpm test");
    expect(excerpt.exit_code).toBe(0);
    expect(excerpt.excerpt).toContain("[REDACTED]");
    expect(excerpt.excerpt).not.toContain("supersecretvalue");
    expect(excerpt.truncated).toBe(true);
  });
});
