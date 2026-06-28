import { canonicalAgentInstructions, writeTextFile } from "@meta-harness/core";
import { CommandContext, emit } from "./common.js";

export interface EmitInstructionsOptions {
  target?: string;
}

const targets: Record<string, string> = {
  AGENTS: "AGENTS.md",
  CLAUDE: "CLAUDE.md",
  GEMINI: "GEMINI.md",
  CURSOR: ".cursor/rules/meta-harness.mdc",
  WINDSURF: ".windsurf/rules/meta-harness.md",
  COPILOT: ".github/copilot-instructions.md",
  COPILOT_CUSTOM: ".github/instructions/meta-harness.instructions.md",
  CONTINUE: ".continue/rules/meta-harness.md"
};

export async function emitInstructionsCommand(
  context: CommandContext,
  options: EmitInstructionsOptions = {}
): Promise<void> {
  const selected =
    options.target && options.target !== "all"
      ? Object.entries(targets).filter(([key]) => key.toLowerCase() === options.target!.toLowerCase())
      : Object.entries(targets);
  if (selected.length === 0) {
    throw new Error(`Unknown instruction target ${options.target}`);
  }
  for (const [name, filePath] of selected) {
    await writeTextFile(
      context.cwd,
      filePath,
      `${canonicalAgentInstructions}
Target: ${name}

This file is generated from the canonical Meta Harness protocol. Keep durable policy changes in the source protocol and regenerate.
`
    );
  }
  emit(context, `Wrote ${selected.length} instruction file(s).`);
}
