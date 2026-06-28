export * from "./types.js";
export * from "./filesystem.js";
export * from "./fake.js";
export * from "./cli-adapter.js";
export * from "./codex.js";
export * from "./claude-code.js";
export * from "./cursor.js";
export * from "./gemini.js";
export * from "./copilot.js";
export * from "./windsurf.js";
export * from "./aider.js";
export * from "./opencode.js";

import { AgentAdapter } from "./types.js";
import { FilesystemAdapter } from "./filesystem.js";
import { FakeAdapter } from "./fake.js";
import { codexAdapter } from "./codex.js";
import { claudeCodeAdapter } from "./claude-code.js";
import { cursorAdapter } from "./cursor.js";
import { geminiAdapter } from "./gemini.js";
import { copilotAdapter } from "./copilot.js";
import { windsurfAdapter } from "./windsurf.js";
import { aiderAdapter } from "./aider.js";
import { opencodeAdapter } from "./opencode.js";

export function createDefaultAdapters(): AgentAdapter[] {
  return [
    new FilesystemAdapter(),
    new FakeAdapter(),
    codexAdapter,
    claudeCodeAdapter,
    cursorAdapter,
    geminiAdapter,
    copilotAdapter,
    windsurfAdapter,
    aiderAdapter,
    opencodeAdapter
  ];
}

export function getAdapter(id: string): AgentAdapter | undefined {
  return createDefaultAdapters().find((adapter) => adapter.id === id);
}
