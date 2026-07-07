import { readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";

const publishablePackages = ["core", "adapters", "cli", "mcp-server"];

function cleanupTarballs(): number {
  let removed = 0;
  for (const entry of readdirSync(process.cwd())) {
    if (/^meta-harness-.*\.tgz$/.test(entry)) {
      rmSync(entry, { force: true });
      removed += 1;
    }
  }
  return removed;
}

let removedTarballs = cleanupTarballs();

for (const packageName of publishablePackages) {
  const result = spawnSync(
    "pnpm",
    ["--filter", `@meta-harness/${packageName}`, "pack", "--dry-run"],
    {
      cwd: process.cwd(),
      shell: process.platform === "win32",
      stdio: "inherit"
    }
  );
  removedTarballs += cleanupTarballs();
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const remainingTarballs = readdirSync(process.cwd()).filter((entry) =>
  /^meta-harness-.*\.tgz$/.test(entry)
);

if (remainingTarballs.length > 0) {
  console.error(`Package dry-run left tarballs behind: ${remainingTarballs.join(", ")}`);
  process.exit(1);
}

console.warn(
  `Package dry-run completed; cleaned ${removedTarballs} generated tarball artifact(s).`
);
