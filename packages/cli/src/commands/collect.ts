import { FilesystemAdapter } from "@meta-harness/adapters";
import { writeJsonFile } from "@meta-harness/core";
import { checkpointPath, CommandContext, emit } from "./common.js";

export interface CollectOptions {
  phase: string;
}

export async function collectCommand(context: CommandContext, options: CollectOptions): Promise<void> {
  const adapter = new FilesystemAdapter();
  const packets = await adapter.collectPackets({
    workspaceRoot: context.cwd,
    checkpointPath: checkpointPath(options.phase)
  });
  await writeJsonFile(
    context.cwd,
    `${checkpointPath(options.phase)}/artifacts/collected_packets.json`,
    packets.map((packet) => ({ path: packet.path, slice_id: packet.packet.slice_id, status: packet.packet.status }))
  );
  emit(context, `Collected ${packets.length} packets.`);
}
