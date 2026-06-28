# Adapters

Adapters connect the protocol to agent environments. They must degrade gracefully and never over-claim support.

The filesystem adapter is universal. The fake adapter is only for deterministic tests/examples. CLI adapters detect commands but default to prompt-file flow until safe dispatch is configured.
