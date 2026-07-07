#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { auditCheckpointCommand } from "./commands/audit-checkpoint.js";
import { budgetCommand } from "./commands/budget.js";
import { checkpointCommand } from "./commands/checkpoint.js";
import { collectCommand } from "./commands/collect.js";
import { compileSpecCommand } from "./commands/compile-spec.js";
import { continueCommand } from "./commands/continue.js";
import { contextPackCommand } from "./commands/context-pack.js";
import { dispatchCommand } from "./commands/dispatch.js";
import { doctorCommand } from "./commands/doctor.js";
import { emitError } from "./commands/common.js";
import { emitInstructionsCommand } from "./commands/emit-instructions.js";
import { ingestCommand } from "./commands/ingest.js";
import { initCommand } from "./commands/init.js";
import { lintPlanCommand } from "./commands/lint-plan.js";
import { mcpCommand } from "./commands/mcp.js";
import { planCommand } from "./commands/plan.js";
import { summarizeLogCommand } from "./commands/summarize-log.js";
import { verifyCommand } from "./commands/verify.js";

export function buildCli(cwd = process.cwd()): Command {
  const context = { cwd };
  const program = new Command();
  program.name("mh").description("Meta Harness CLI").version("0.1.0");

  program
    .command("init")
    .option("--force", "overwrite generated harness files")
    .option("--profile <profile>", "basic, strict, or trading-safe", "basic")
    .action((options) => run(() => initCommand(context, options), context));

  program
    .command("ingest")
    .requiredOption("--spec <path>")
    .option("--alignment <path>")
    .requiredOption("--manifest <path>")
    .action((options) => run(() => ingestCommand(context, options), context));

  program
    .command("compile-spec")
    .requiredOption("--spec <path>")
    .option("--phase <phase>", "phase id", "phase_001")
    .action((options) => run(() => compileSpecCommand(context, options), context));

  program
    .command("plan")
    .requiredOption("--phase <phase>")
    .action((options) => run(() => planCommand(context, options), context));

  program
    .command("lint-plan")
    .requiredOption("--phase <phase>")
    .action((options) => run(() => lintPlanCommand(context, options), context));

  program
    .command("dispatch")
    .requiredOption("--phase <phase>")
    .requiredOption("--agent <adapter>")
    .option("--experimental-native", "opt in to feature-gated experimental native dispatch")
    .action((options) => run(() => dispatchCommand(context, options), context));

  program
    .command("collect")
    .requiredOption("--phase <phase>")
    .action((options) => run(() => collectCommand(context, options), context));

  program
    .command("verify")
    .requiredOption("--phase <phase>")
    .action((options) => run(() => verifyCommand(context, options), context));

  program
    .command("audit-checkpoint")
    .requiredOption("--phase <phase>")
    .action((options) => run(() => auditCheckpointCommand(context, options), context));

  program
    .command("checkpoint")
    .requiredOption("--phase <phase>")
    .option("--status <status>", "terminal status", "blocked")
    .action((options) => run(() => checkpointCommand(context, options), context));

  program
    .command("continue")
    .requiredOption("--phase <phase>")
    .option("--human-accepted", "record human acceptance for this decision")
    .action((options) => run(() => continueCommand(context, options), context));

  program
    .command("context-pack")
    .option(
      "--target <target>",
      "codex, claude-code, cursor, gemini, copilot, windsurf, continue, aider, opencode, roo, or generic",
      "generic"
    )
    .option("--phase <phase>", "phase id", "phase_001")
    .option("--slice <slice>", "slice id")
    .option("--role <role>", "parent, worker, or reviewer", "worker")
    .option("--budget <tokens>", "token budget", "8000")
    .option("--format <format>", "markdown or json", "markdown")
    .option("--output <path>", "write the context pack to a workspace-relative path")
    .action((options) => run(() => contextPackCommand(context, options), context));

  program
    .command("prompt")
    .option(
      "--target <target>",
      "codex, claude-code, cursor, gemini, copilot, windsurf, continue, aider, opencode, roo, or generic",
      "generic"
    )
    .option("--phase <phase>", "phase id", "phase_001")
    .option("--slice <slice>", "slice id")
    .option("--role <role>", "parent, worker, or reviewer", "worker")
    .option("--budget <tokens>", "token budget", "8000")
    .option("--format <format>", "markdown or json", "markdown")
    .option("--output <path>", "write the prompt pack to a workspace-relative path")
    .action((options) => run(() => contextPackCommand(context, options), context));

  program
    .command("budget")
    .option("--json", "emit machine-readable JSON")
    .option("--strict", "fail on warnings as well as over-budget or missing items")
    .option("--phase <phase>", "phase id for generated pack checks", "phase_001")
    .option("--output <path>", "write the budget report to a workspace-relative path")
    .action((options) => run(() => budgetCommand(context, options), context));

  program
    .command("summarize-log")
    .requiredOption("--input <path>", "workspace-relative raw log path")
    .option("--output <path>", "workspace-relative output path")
    .option("--command <command>", "command line represented by the log")
    .option("--exit-code <code>", "command exit code")
    .option("--timestamp <iso>", "evidence timestamp; defaults to current time")
    .option("--format <format>", "json or markdown", "json")
    .option("--max-lines <lines>", "maximum excerpt lines", "200")
    .option("--max-bytes <bytes>", "maximum excerpt bytes", "12288")
    .action((options) => run(() => summarizeLogCommand(context, options), context));

  program
    .command("emit-instructions")
    .option(
      "--target <target>",
      "agents, claude, gemini, cursor, windsurf, copilot, copilot-custom, continue, opencode, roo, or all",
      "all"
    )
    .action((options) => run(() => emitInstructionsCommand(context, options), context));

  program
    .command("doctor")
    .option("--json", "emit the structured JSON readiness report")
    .option("--phase <phase>", "phase id for generated budget/context checks")
    .action((options) => run(() => doctorCommand(context, options), context));

  program
    .command("mcp")
    .option("--stdio", "start stdio server")
    .option(
      "--mode <mode>",
      "read-only, workspace-write, checkpoint-write, or dangerous-disabled",
      "read-only"
    )
    .action((options) => run(() => mcpCommand(context, options), context));

  return program;
}

async function run(action: () => Promise<void>, context: { cwd: string }): Promise<void> {
  try {
    await action();
  } catch (error) {
    emitError(context, (error as Error).message);
    process.exitCode = 1;
  }
}

const isCliEntrypoint =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isCliEntrypoint) {
  await buildCli().parseAsync(process.argv);
}
