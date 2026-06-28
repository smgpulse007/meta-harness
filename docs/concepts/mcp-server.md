# MCP Server

The MCP server exposes status, phases, slices, requirements, proof, checkpoint data, templates, and prompt helpers.

It starts read-only. Write tools require explicit `checkpoint-write` or `workspace-write` mode. The server does not execute arbitrary shell commands.
