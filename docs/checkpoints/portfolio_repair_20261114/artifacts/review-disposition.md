# Independent source review disposition

The reviewer received the public changed source and validation excerpts in an isolated read-only review session. Its own shell launcher was unavailable, so it did not independently rerun commands. The parent ran the commands recorded in `commands.md`.

| Finding                                              | Disposition                                                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| New MCP test and dependency graph still pending      | Frozen install and complete CI passed with 44 tests; current production audit is zero                                                 |
| Distribution-based profile tests could be skipped    | Added a non-skipped source-level test; CI builds before tests; assertions require an entirely empty temporary directory               |
| Direct JavaScript callers could still pass a profile | Runtime guard rejects it before bootstrap writes                                                                                      |
| Demo must build first and verify the full policy     | `pnpm demo` builds first; all four policy properties are asserted                                                                     |
| MCP advertised a non-renderable next-action template | Discovery lists exactly the four renderable prompt templates; protocol tests render all four; separate next-action shape tool remains |
| Zod 4 defaults need regression coverage              | Core defaults and MCP omitted values are tested; malformed values are rejected                                                        |
| `doctor --json` does not change the output format    | Pre-existing behavior carried forward, unrelated to workspace creation or protocol correctness                                        |
| Public schema compatibility                          | Changeset records the core Zod 4 migration as a pre-1.0 minor change                                                                  |

A follow-up source review identified two pre-existing defects in the MCP surface touched by this repair: command evidence bypassed pattern redaction, and optional JSON reads swallowed parse/read failures. Both were repaired. Four additional protocol tests exercise persisted redaction, command/packet limits with no writes on rejection, and missing versus malformed/invalid/unreadable state. The CLI command-string field now uses the existing redactor as well. Redaction is explicitly documented as best effort and limited to command/output fields.

The final focused source review passed: both blockers were resolved, and no concrete regression attributable to the fixes was identified. This was source review; the parent ran and verified the 44-test CI result. Hosted PR and main checks remain independent release gates.
