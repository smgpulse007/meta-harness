import { writeYamlFile } from "@meta-harness/core";
import { checkpointPath, CommandContext, createDefaultSlicePlan, emit, readManifest } from "./common.js";

export interface PlanOptions {
  phase: string;
}

export async function planCommand(context: CommandContext, options: PlanOptions): Promise<void> {
  const manifest = await readManifest(context);
  const phase = manifest.phases.find((candidate) => candidate.id === options.phase);
  if (!phase) {
    throw new Error(`Unknown phase ${options.phase}`);
  }
  const plan = createDefaultSlicePlan(options.phase);
  plan.slices[0]!.spec_refs = phase.source_spec_refs.length > 0 ? phase.source_spec_refs : plan.slices[0]!.spec_refs;
  plan.slices[0]!.validation_commands =
    phase.validation_commands.length > 0 ? phase.validation_commands : plan.slices[0]!.validation_commands;
  await writeYamlFile(context.cwd, `${checkpointPath(options.phase)}/slice_plan.yaml`, plan);
  emit(context, `Wrote slice plan for ${options.phase}.`);
}
