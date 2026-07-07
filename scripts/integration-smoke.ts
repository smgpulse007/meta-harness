import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { auditCheckpointCommand } from "../packages/cli/src/commands/audit-checkpoint.js";
import { checkpointCommand } from "../packages/cli/src/commands/checkpoint.js";
import { compileSpecCommand } from "../packages/cli/src/commands/compile-spec.js";
import { dispatchCommand } from "../packages/cli/src/commands/dispatch.js";
import { initCommand } from "../packages/cli/src/commands/init.js";
import { lintPlanCommand } from "../packages/cli/src/commands/lint-plan.js";
import { planCommand } from "../packages/cli/src/commands/plan.js";
import { summarizeLogCommand } from "../packages/cli/src/commands/summarize-log.js";

const cwd = await mkdtemp(path.join(os.tmpdir(), "mh-smoke-"));
const context = {
  cwd,
  stdout: (message: string) => process.stdout.write(message),
  stderr: (message: string) => process.stderr.write(message)
};

await initCommand(context, { profile: "strict" });
await writeFile(
  path.join(cwd, "docs", "implementation_spec.md"),
  "# Tiny Spec\n\n- Must demonstrate fake adapter execution.\n",
  "utf8"
);
await compileSpecCommand(context, { spec: "docs/implementation_spec.md", phase: "phase_001" });
await planCommand(context, { phase: "phase_001" });
await lintPlanCommand(context, { phase: "phase_001" });
await dispatchCommand(context, { phase: "phase_001", agent: "fake" });
await writeFile(path.join(cwd, "command-output.txt"), "token=example-secret\nok\n", "utf8");
await summarizeLogCommand(context, {
  input: "command-output.txt",
  command: "pnpm test",
  exitCode: "0",
  timestamp: "2026-07-07T00:00:00.000Z",
  output: ".meta-harness/checkpoints/phase_001/artifacts/command-output.excerpt.json",
  format: "json"
});
await checkpointCommand(context, { phase: "phase_001", status: "pass_with_risks" });
await auditCheckpointCommand(context, { phase: "phase_001" });

process.stdout.write(`Integration smoke completed in ${cwd}\n`);
