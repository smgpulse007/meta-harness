import { ConfigurableCliAdapter } from "./cli-adapter.js";
import { filesystemCapabilities } from "./filesystem.js";

export const copilotAdapter = new ConfigurableCliAdapter({
  id: "copilot",
  displayName: "GitHub Copilot Adapter",
  commands: ["gh"],
  tier: 1,
  capabilities: {
    ...filesystemCapabilities,
    supportsCliDispatch: false,
    supportsStructuredOutput: false,
    supportsBackgroundPrWorkflow: true
  },
  reasonWhenUnavailable: "Copilot local process control is not attempted; emit GitHub instructions."
});
