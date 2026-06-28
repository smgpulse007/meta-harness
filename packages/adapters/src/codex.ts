import { ConfigurableCliAdapter } from "./cli-adapter.js";
import { filesystemCapabilities } from "./filesystem.js";

export const codexAdapter = new ConfigurableCliAdapter({
  id: "codex",
  displayName: "Codex CLI Adapter",
  commands: ["codex"],
  tier: 2,
  capabilities: {
    ...filesystemCapabilities,
    supportsCliDispatch: false,
    supportsStructuredOutput: false,
    supportsMcp: true,
    supportsWriteScopeHints: true
  },
  reasonWhenUnavailable: "Codex CLI command not detected; use filesystem prompt flow."
});
