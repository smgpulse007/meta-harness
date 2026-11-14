import { CommandContext, emit, writeHarnessBootstrapFiles } from "./common.js";

export interface InitOptions {
  force?: boolean;
}

export async function initCommand(
  context: CommandContext,
  options: InitOptions = {}
): Promise<void> {
  if ("profile" in options) {
    throw new Error("Initialization profiles are unsupported. Use the default read-only policy.");
  }
  await writeHarnessBootstrapFiles(context, options.force ?? false);
  emit(context, "Initialized Meta Harness with the default read-only side-effect policy.");
}
