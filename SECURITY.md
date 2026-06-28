# Security Policy

## Supported Versions

The project is pre-1.0. Security fixes target the latest mainline branch.

## Reporting a Vulnerability

Please report security issues privately to the maintainers before public disclosure. Include a minimal reproduction, affected version or commit, impact, and any suggested fix.

## Security Posture

Meta Harness is conservative by default:

- MCP starts read-only unless write mode is explicitly requested.
- Dangerous operations are blocked unless policy explicitly allows them.
- Paths are resolved inside the workspace root and path traversal is rejected.
- The MCP server does not execute arbitrary shell commands.
- Secret-like values are redacted in command/proof artifacts.
- Package publishing, git push, production writes, outbound email, financial transactions, and infrastructure destruction are not performed by default.
