import { startStdioServer } from "@meta-harness/mcp-server";
import { CommandContext } from "./common.js";

export interface McpOptions {
  stdio?: boolean;
  mode?: "read-only" | "workspace-write" | "checkpoint-write" | "dangerous-disabled";
}

export async function mcpCommand(context: CommandContext, options: McpOptions): Promise<void> {
  if (!options.stdio) {
    throw new Error("Only --stdio transport is supported by default.");
  }
  await startStdioServer({ workspaceRoot: context.cwd, mode: options.mode ?? "read-only" });
}
