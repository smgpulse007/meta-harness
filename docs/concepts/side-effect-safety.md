# Side-Effect Safety

The default posture is read-only. Dangerous operations require explicit authorization and audit evidence.

Blocked by default: package publishing, git push, production writes, destructive file operations, financial transactions, outbound email, external API mutation, database migrations, secret rotation, and infrastructure destruction.
