import { ConfigurableCliAdapter } from "./cli-adapter.js";
import { filesystemCapabilities } from "./filesystem.js";

export const claudeCodeAdapter = new ConfigurableCliAdapter({
  id: "claude-code",
  displayName: "Claude Code Adapter",
  commands: ["claude"],
  tier: 2,
  capabilities: { ...filesystemCapabilities, supportsCliDispatch: false, supportsStructuredOutput: false },
  reasonWhenUnavailable: "Claude command not detected; instruction files and filesystem prompts are supported."
});
