import { ConfigurableCliAdapter } from "./cli-adapter.js";
import { filesystemCapabilities } from "./filesystem.js";

export const cursorAdapter = new ConfigurableCliAdapter({
  id: "cursor",
  displayName: "Cursor Adapter",
  commands: ["cursor"],
  tier: 1,
  capabilities: { ...filesystemCapabilities, supportsCliDispatch: false, supportsStructuredOutput: false },
  reasonWhenUnavailable: "Cursor CLI not detected; emit .cursor rules and prompt files."
});
