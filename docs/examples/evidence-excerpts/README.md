# Evidence Excerpts

`mh summarize-log` turns raw local command output into a bounded evidence excerpt for checkpoint packets.

Sample:

```bash
node packages/cli/dist/index.js summarize-log --input docs/examples/evidence-excerpts/sample-command-output.txt --command "pnpm test" --exit-code 0 --timestamp "2026-07-07T00:00:00.000Z" --format json --max-lines 4 --output docs/examples/evidence-excerpts/sample-command-output.excerpt.json
```

The excerpt records the raw path, raw SHA-256 hash, command, exit code, timestamp, bounds, truncation status, and redacted excerpt. Raw logs remain files; prompts and proof ledgers should reference the excerpt and raw hash instead of pasting full output.
