import { getAdapter } from "@meta-harness/adapters";
import { getReadySlices, writeJsonFile } from "@meta-harness/core";
import { checkpointPath, CommandContext, emit, readSlicePlan } from "./common.js";

export interface DispatchOptions {
  phase: string;
  agent: string;
}

export async function dispatchCommand(context: CommandContext, options: DispatchOptions): Promise<void> {
  const adapter = getAdapter(options.agent);
  if (!adapter) {
    throw new Error(`Unknown adapter ${options.agent}`);
  }
  const plan = await readSlicePlan(context, options.phase);
  const ready = getReadySlices(plan, []);
  const results = [];
  for (const slice of ready) {
    results.push(
      await adapter.dispatchSlice({
        workspaceRoot: context.cwd,
        phaseId: options.phase,
        slice,
        slicePlan: plan,
        checkpointPath: checkpointPath(options.phase)
      })
    );
  }
  await writeJsonFile(context.cwd, `${checkpointPath(options.phase)}/artifacts/dispatch_results.json`, results);
  emit(context, `Dispatched ${results.length} ready slices with ${adapter.id}.`);
}
