import { ConfigurableCliAdapter } from "./cli-adapter.js";
import { filesystemCapabilities } from "./filesystem.js";

export const opencodeAdapter = new ConfigurableCliAdapter({
  id: "opencode",
  displayName: "OpenCode Adapter",
  commands: ["opencode"],
  tier: 2,
  capabilities: { ...filesystemCapabilities, supportsCliDispatch: false, supportsStructuredOutput: false },
  reasonWhenUnavailable: "OpenCode command not detected; use filesystem prompt flow."
});
