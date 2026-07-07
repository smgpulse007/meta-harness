import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Meta Harness",
  description: "Evidence-gated execution harness for coding-agent implementation workflows.",
  base: "/meta-harness/",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Quickstart", link: "/getting-started" },
      { text: "Concepts", link: "/concepts/phase" },
      { text: "CLI", link: "/cli-reference" },
      { text: "MCP", link: "/mcp-reference" },
      { text: "Adapters", link: "/adapters" },
      { text: "API", link: "/api/" },
      { text: "GitHub", link: "https://github.com/smgpulse007/meta-harness" }
    ],
    sidebar: [
      {
        text: "Start",
        items: [
          { text: "Home", link: "/" },
          { text: "Install And Quickstart", link: "/getting-started" },
          { text: "Protocol Overview", link: "/protocol" },
          { text: "Philosophy", link: "/philosophy" }
        ]
      },
      {
        text: "Concepts",
        items: [
          { text: "Phase", link: "/concepts/phase" },
          { text: "Slice", link: "/concepts/slice" },
          { text: "Packet", link: "/concepts/packet" },
          { text: "Proof Ledger", link: "/concepts/proof" },
          { text: "Checkpoint", link: "/concepts/checkpoint" },
          { text: "Continuation Contract", link: "/concepts/continuation-contract" },
          { text: "Side-Effect Safety", link: "/concepts/side-effect-safety" },
          { text: "Skills", link: "/concepts/skills" },
          { text: "Token Budgeting", link: "/token-budgeting" }
        ]
      },
      {
        text: "Reference",
        items: [
          { text: "CLI Reference", link: "/cli-reference" },
          { text: "MCP Reference", link: "/mcp-reference" },
          { text: "Adapter Guide", link: "/adapters" },
          { text: "Agent Compatibility", link: "/agent-support-matrix" },
          { text: "API Reference", link: "/api/" }
        ]
      },
      {
        text: "Guides",
        items: [
          { text: "Azure And Enterprise MCP", link: "/azure-enterprise" },
          { text: "Security Model", link: "/security" },
          { text: "Release Posture", link: "/release-plan" },
          { text: "Release Checklist", link: "/release-checklist" }
        ]
      },
      {
        text: "Examples",
        items: [
          { text: "Tiny Refactor", link: "/examples/tiny-refactor" },
          { text: "Parent Coordinator Flow", link: "/examples/parent-coordinator-flow" },
          { text: "MCP Host Example", link: "/examples/mcp-host" },
          { text: "MCP Config Samples", link: "/examples/mcp-configs/" },
          { text: "Codex Prompt-File Flow", link: "/examples/codex-prompt-file" },
          { text: "Richer Refactor Walkthrough", link: "/examples/richer-refactor" }
        ]
      }
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/smgpulse007/meta-harness" }],
    search: {
      provider: "local"
    },
    footer: {
      message: "No phase advances without verified evidence.",
      copyright: "Released under the MIT License."
    }
  }
});
