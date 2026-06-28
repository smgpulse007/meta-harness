import { HARNESS_PROTOCOL_VERSION, writeJsonFile } from "@meta-harness/core";
import { CommandContext, emit } from "./common.js";

export interface IngestOptions {
  spec: string;
  alignment?: string;
  manifest: string;
}

export async function ingestCommand(context: CommandContext, options: IngestOptions): Promise<void> {
  await writeJsonFile(context.cwd, ".meta-harness/config.json", {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    spec: options.spec,
    alignment: options.alignment,
    manifest: options.manifest,
    ingested_at: new Date().toISOString()
  });
  await writeJsonFile(context.cwd, ".meta-harness/state.json", {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    state: "INGEST_CONTEXT",
    current_phase_id: "phase_001",
    completed_phases: [],
    updated_at: new Date().toISOString()
  });
  emit(context, `Registered spec ${options.spec}.`);
}
