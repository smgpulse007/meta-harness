import { mkdtemp, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { compileSpecCommand } from "../src/commands/compile-spec.js";
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
});
