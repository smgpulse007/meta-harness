import { CommandContext, emit, writeHarnessBootstrapFiles } from "./common.js";

export interface InitOptions {
  force?: boolean;
  profile?: "basic" | "strict" | "trading-safe";
}

export async function initCommand(context: CommandContext, options: InitOptions = {}): Promise<void> {
  await writeHarnessBootstrapFiles(context, options.force ?? false);
  emit(context, `Initialized Meta Harness (${options.profile ?? "basic"} profile).`);
}
