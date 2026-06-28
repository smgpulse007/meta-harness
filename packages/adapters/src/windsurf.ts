import { ConfigurableCliAdapter } from "./cli-adapter.js";
import { filesystemCapabilities } from "./filesystem.js";

export const windsurfAdapter = new ConfigurableCliAdapter({
  id: "windsurf",
  displayName: "Windsurf Adapter",
  commands: ["windsurf"],
  tier: 1,
  capabilities: { ...filesystemCapabilities, supportsCliDispatch: false, supportsStructuredOutput: false },
  reasonWhenUnavailable: "Windsurf CLI not detected; emit rules and prompt files."
});
