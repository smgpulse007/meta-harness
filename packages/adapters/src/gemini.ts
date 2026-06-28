import { ConfigurableCliAdapter } from "./cli-adapter.js";
import { filesystemCapabilities } from "./filesystem.js";

export const geminiAdapter = new ConfigurableCliAdapter({
  id: "gemini",
  displayName: "Gemini CLI Adapter",
  commands: ["gemini"],
  tier: 2,
  capabilities: { ...filesystemCapabilities, supportsCliDispatch: false, supportsStructuredOutput: false },
  reasonWhenUnavailable: "Gemini CLI not detected; emit GEMINI.md and prompt files."
});
