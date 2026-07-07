import { type McpServerMode, startStdioServer } from "@meta-harness/mcp-server";
import { CommandContext } from "./common.js";

export const mcpModes = [
  "read-only",
  "workspace-write",
  "checkpoint-write",
  "dangerous-disabled"
] as const;

export interface McpOptions {
  stdio?: boolean;
  mode?: string;
}

export async function mcpCommand(context: CommandContext, options: McpOptions): Promise<void> {
  if (!options.stdio) {
    throw new Error("Only --stdio transport is supported by default.");
  }
  const mode = options.mode ?? "read-only";
  if (!isMcpMode(mode)) {
    throw new Error(`Unknown MCP mode ${mode}. Expected one of: ${mcpModes.join(", ")}.`);
  }
  await startStdioServer({ workspaceRoot: context.cwd, mode });
}

function isMcpMode(mode: string): mode is McpServerMode {
  return mcpModes.includes(mode as McpServerMode);
}
