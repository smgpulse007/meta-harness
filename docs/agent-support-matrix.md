# Agent Support Matrix

| Adapter | Tier | Release Status | Dispatch Mode | Structured Output | Write-Scope Enforcement | Test Evidence | Known Gaps |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| filesystem | 0 | complete | Writes prompt files only | Packet files collected from checkpoint folder | Parent/CLI verifies changed files against slice scopes | `pnpm integration-smoke`, CLI tests | Does not launch agents |
| fake | 0 | complete for tests | Writes prompt and simulated packet | Deterministic packet YAML | Packet still checked by parent/CLI | `pnpm integration-smoke`, example checkpoint | Simulation evidence only; cannot satisfy release proof by itself |
| codex | 2/3 | partial | Prompt-file fallback; CLI launch disabled | Not assumed | Prompt hints plus parent verification | Adapter detection included in `mh doctor` | Native flags and host behavior must be verified per environment |
| claude-code | 1/2 | partial | Instruction and prompt-file flow | Not assumed | Prompt hints plus parent verification | Instruction templates | CLI launch disabled until configured and verified |
| cursor | 1 | partial | Rules and prompt files | Not assumed | Rules plus parent verification | Instruction emitter | No local process control |
| gemini | 1/2 | partial | GEMINI.md and prompt files | Not assumed | Prompt hints plus parent verification | Instruction emitter | CLI launch disabled until configured and verified |
| copilot | 1 | partial | GitHub instruction files | Not assumed | Instruction-only | Instruction emitter | No local process control by default |
| windsurf | 1 | partial | Rules and prompt files | Not assumed | Rules plus parent verification | Instruction emitter | CLI/native adapter only when detected and configured |
| aider | 2 | planned/partial | Prompt-file fallback | Not assumed | Prompt hints plus parent verification | Adapter detection path | CLI dispatch disabled until configured and verified |
| opencode | 2 | planned/partial | Prompt-file fallback | Not assumed | Prompt hints plus parent verification | Adapter detection path | CLI dispatch disabled until configured and verified |

Complete support means the adapter is implemented and covered by local tests. Partial support means the adapter degrades gracefully but does not claim native automation. Planned support means the interface exists but behavior is intentionally conservative.
