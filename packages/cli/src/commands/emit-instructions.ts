import { canonicalAgentInstructions, writeTextFile } from "@meta-harness/core";
import { CommandContext, emit } from "./common.js";

export interface EmitInstructionsOptions {
  target?: string;
}

interface EmitFile {
  path: string;
  content: string;
}

interface TargetDefinition {
  key: string;
  aliases: string[];
  files: () => EmitFile[];
}

const mcpCommand = ["node", "packages/cli/dist/index.js", "mcp", "--stdio"];

const generatedFooter =
  "This file is generated from the canonical Meta Harness protocol. Keep durable policy changes in the source protocol and regenerate.";

function markdownInstructions(target: string, extra = ""): string {
  return `${canonicalAgentInstructions}
Target: ${target}

${extra ? `${extra}\n\n` : ""}${generatedFooter}
`;
}

function cursorRule(): string {
  return `---
description: Meta Harness protocol
alwaysApply: true
---

${markdownInstructions("CURSOR", "Follow this rule for all Meta Harness phase, slice, packet, proof, and checkpoint work.")}`;
}

function copilotPathSpecific(): string {
  return `---
applyTo: "**"
---

${markdownInstructions("COPILOT_CUSTOM", "Apply these instructions across the repository when reviewing or editing Meta Harness files.")}`;
}

function jsonFile(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const targets: TargetDefinition[] = [
  {
    key: "AGENTS",
    aliases: ["agents", "agents-md"],
    files: () => [{ path: "AGENTS.md", content: markdownInstructions("AGENTS") }]
  },
  {
    key: "CLAUDE",
    aliases: ["claude", "claude-code"],
    files: () => [{ path: "CLAUDE.md", content: markdownInstructions("CLAUDE") }]
  },
  {
    key: "GEMINI",
    aliases: ["gemini", "gemini-cli"],
    files: () => [{ path: "GEMINI.md", content: markdownInstructions("GEMINI") }]
  },
  {
    key: "CURSOR",
    aliases: ["cursor"],
    files: () => [{ path: ".cursor/rules/meta-harness.mdc", content: cursorRule() }]
  },
  {
    key: "WINDSURF",
    aliases: ["windsurf", "cascade", "devin"],
    files: () => [
      {
        path: ".windsurf/rules/meta-harness.md",
        content: markdownInstructions(
          "WINDSURF",
          "This legacy Windsurf/Cascade rule is instruction-only; native dispatch is not claimed."
        )
      }
    ]
  },
  {
    key: "COPILOT",
    aliases: ["copilot"],
    files: () => [
      {
        path: ".github/copilot-instructions.md",
        content: markdownInstructions(
          "COPILOT",
          "Repository-wide Copilot instructions are instruction-only; use MCP or prompt files for structured evidence."
        )
      }
    ]
  },
  {
    key: "COPILOT_CUSTOM",
    aliases: ["copilot-custom", "copilot_custom", "github-instructions"],
    files: () => [
      { path: ".github/instructions/meta-harness.instructions.md", content: copilotPathSpecific() }
    ]
  },
  {
    key: "CONTINUE",
    aliases: ["continue"],
    files: () => [
      {
        path: ".continue/rules/meta-harness.md",
        content: markdownInstructions(
          "CONTINUE",
          "Treat Continue as an instruction and MCP compatibility target, not native process dispatch."
        )
      }
    ]
  },
  {
    key: "OPENCODE",
    aliases: ["opencode", "open-code"],
    files: () => [
      {
        path: ".opencode/instructions/meta-harness.md",
        content: markdownInstructions(
          "OPENCODE",
          "Use this instruction file through opencode.json. Keep edit and bash approval enabled."
        )
      },
      {
        path: "opencode.json",
        content: jsonFile({
          $schema: "https://opencode.ai/config.json",
          instructions: ["AGENTS.md", ".opencode/instructions/meta-harness.md"],
          permission: {
            edit: "ask",
            bash: "ask"
          },
          mcp: {
            "meta-harness": {
              type: "local",
              command: mcpCommand,
              enabled: true,
              timeout: 30000
            }
          }
        })
      }
    ]
  },
  {
    key: "ROO",
    aliases: ["roo", "roo-code", "cline"],
    files: () => [
      {
        path: ".roo/rules/meta-harness.md",
        content: markdownInstructions(
          "ROO",
          "Roo support is instruction and MCP compatibility only until local command evidence proves more."
        )
      },
      {
        path: ".roo/mcp.json",
        content: jsonFile({
          mcpServers: {
            "meta-harness": {
              command: "node",
              args: ["packages/cli/dist/index.js", "mcp", "--stdio"],
              alwaysAllow: [
                "get_protocol_version",
                "get_harness_status",
                "get_current_phase",
                "list_phases",
                "get_phase",
                "get_ready_slices",
                "get_slice",
                "get_validation_plan",
                "get_checkpoint",
                "get_next_action"
              ],
              disabled: false
            }
          }
        })
      }
    ]
  }
];

function normalizeTarget(target: string): string {
  return target.trim().toLowerCase().replace(/_/g, "-");
}

function selectTargets(target: string): TargetDefinition[] {
  const normalized = normalizeTarget(target);
  if (normalized === "all") {
    return targets;
  }
  return targets.filter(
    (definition) =>
      normalizeTarget(definition.key) === normalized ||
      definition.aliases.some((alias) => normalizeTarget(alias) === normalized)
  );
}

export async function emitInstructionsCommand(
  context: CommandContext,
  options: EmitInstructionsOptions = {}
): Promise<void> {
  const selected = selectTargets(options.target ?? "all");
  if (selected.length === 0) {
    throw new Error(`Unknown instruction target ${options.target}`);
  }

  const files = new Map<string, string>();
  for (const target of selected) {
    for (const file of target.files()) {
      files.set(file.path, file.content);
    }
  }

  for (const [filePath, content] of files) {
    await writeTextFile(context.cwd, filePath, content);
  }
  emit(context, `Wrote ${files.size} instruction file(s).`);
}
