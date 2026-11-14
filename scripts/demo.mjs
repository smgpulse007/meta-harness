import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import console from "node:console";
import process from "node:process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "packages/cli/dist/index.js");
const temporaryRoot = path.resolve(tmpdir());
const workspace = await mkdtemp(path.join(temporaryRoot, "mh-demo-"));

async function cleanup() {
  if (
    path.dirname(workspace) !== temporaryRoot ||
    !path.basename(workspace).startsWith("mh-demo-")
  ) {
    throw new Error("Refusing cleanup outside the generated demo workspace.");
  }
  await rm(workspace, { recursive: true, force: true });
}

function run(args) {
  console.log(`\n$ mh ${args.join(" ")}`);
  const output = execFileSync(process.execPath, [cli, ...args], {
    cwd: workspace,
    encoding: "utf8",
    timeout: 30000
  });
  console.log(output.trim().replaceAll(workspace, "<demo-workspace>"));
}

try {
  console.log("Meta Harness / real CLI, disposable synthetic workspace");
  run(["init"]);
  const policy = parse(
    await readFile(
      path.join(workspace, "docs/implementation_harness/side_effect_policy.yaml"),
      "utf8"
    )
  );
  if (policy.default_posture !== "read_only" || policy.allowed_dangerous_operations.length !== 0) {
    throw new Error("The generated policy does not match the documented default.");
  }
  if (policy.authorization_required !== true || policy.audit_required !== true) {
    throw new Error("Authorization and audit must remain required by default.");
  }
  console.log("Verified generated policy: read_only; no dangerous operations allowed.");
  await writeFile(
    path.join(workspace, "docs/implementation_spec.md"),
    "# Synthetic example\n\nREQ-001 Add a greeting function with a focused unit test.\n",
    "utf8"
  );
  run(["compile-spec", "--spec", "docs/implementation_spec.md"]);
  run(["plan", "--phase", "phase_001"]);
  run(["lint-plan", "--phase", "phase_001"]);
  console.log(
    "\nPlan prepared and checked. No coding agent was dispatched; no implementation is claimed."
  );
} finally {
  // Only the fresh directory created by this invocation may be removed.
  await cleanup();
}
