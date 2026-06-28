import { ConfigurableCliAdapter } from "./cli-adapter.js";
import { filesystemCapabilities } from "./filesystem.js";

export const aiderAdapter = new ConfigurableCliAdapter({
  id: "aider",
  displayName: "Aider Adapter",
  commands: ["aider"],
  tier: 2,
  capabilities: { ...filesystemCapabilities, supportsCliDispatch: false, supportsStructuredOutput: false },
  reasonWhenUnavailable: "Aider command not detected; use filesystem prompt flow."
});
