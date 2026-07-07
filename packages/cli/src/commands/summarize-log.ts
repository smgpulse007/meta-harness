import { createHash } from "node:crypto";
import { redactSecrets, readTextFile, writeTextFile } from "@meta-harness/core";
import { CommandContext, emit } from "./common.js";

export interface SummarizeLogOptions {
  input?: string;
  output?: string;
  command?: string;
  exitCode?: string | number;
  timestamp?: string;
  format?: string;
  maxLines?: string | number;
  maxBytes?: string | number;
}

interface EvidenceExcerpt {
  protocol_version: "0.1.0";
  raw_path: string;
  raw_sha256: string;
  command?: string;
  exit_code?: number | null;
  recorded_at: string;
  excerpt_line_count: number;
  excerpt_bytes: number;
  max_lines: number;
  max_bytes: number;
  truncated: boolean;
  omitted_lines: number;
  redaction: "secret_patterns";
  excerpt: string;
}

export async function summarizeLogCommand(
  context: CommandContext,
  options: SummarizeLogOptions = {}
): Promise<void> {
  if (!options.input) {
    throw new Error("summarize-log requires --input <path>");
  }
  const format = (options.format ?? "json").toLowerCase();
  if (format !== "json" && format !== "markdown") {
    throw new Error(`Unknown summarize-log format ${options.format}`);
  }
  const excerpt = await buildEvidenceExcerpt(context, {
    input: options.input,
    maxLines: parsePositiveInteger(options.maxLines, 200, "max-lines"),
    maxBytes: parsePositiveInteger(options.maxBytes, 12 * 1024, "max-bytes"),
    ...(options.command ? { command: options.command } : {}),
    ...(options.exitCode !== undefined
      ? { exitCode: parseOptionalExitCode(options.exitCode) }
      : {}),
    ...(options.timestamp ? { timestamp: options.timestamp } : {})
  });
  const rendered =
    format === "json" ? `${JSON.stringify(excerpt, null, 2)}\n` : renderMarkdown(excerpt);
  if (options.output) {
    await writeTextFile(context.cwd, options.output, rendered);
    emit(context, `Wrote evidence excerpt to ${options.output}`);
    return;
  }
  emit(context, rendered);
}

async function buildEvidenceExcerpt(
  context: CommandContext,
  input: {
    input: string;
    command?: string;
    exitCode?: number | null;
    timestamp?: string;
    maxLines: number;
    maxBytes: number;
  }
): Promise<EvidenceExcerpt> {
  const raw = await readTextFile(context.cwd, input.input);
  const redacted = redactSecrets(raw);
  const rawLines = redacted.split(/\r?\n/);
  const boundedLines = boundLines(rawLines, input.maxLines);
  const boundedBytes = boundBytes(boundedLines.text, input.maxBytes);
  const excerptLines = boundedBytes.text.length === 0 ? 0 : boundedBytes.text.split(/\r?\n/).length;
  return {
    protocol_version: "0.1.0",
    raw_path: input.input,
    raw_sha256: createHash("sha256").update(raw).digest("hex"),
    ...(input.command ? { command: input.command } : {}),
    ...(input.exitCode !== undefined ? { exit_code: input.exitCode } : {}),
    recorded_at: input.timestamp ?? new Date().toISOString(),
    excerpt_line_count: excerptLines,
    excerpt_bytes: Buffer.byteLength(boundedBytes.text, "utf8"),
    max_lines: input.maxLines,
    max_bytes: input.maxBytes,
    truncated: boundedLines.truncated || boundedBytes.truncated,
    omitted_lines: boundedLines.omittedLines,
    redaction: "secret_patterns",
    excerpt: boundedBytes.text
  };
}

function renderMarkdown(excerpt: EvidenceExcerpt): string {
  return `# Command Evidence Excerpt

- Raw path: \`${excerpt.raw_path}\`
- Raw SHA-256: \`${excerpt.raw_sha256}\`
- Command: ${excerpt.command ? `\`${excerpt.command}\`` : "not recorded"}
- Exit code: ${excerpt.exit_code ?? "not recorded"}
- Recorded at: ${excerpt.recorded_at}
- Bounds: ${excerpt.excerpt_line_count}/${excerpt.max_lines} lines, ${excerpt.excerpt_bytes}/${excerpt.max_bytes} bytes
- Truncated: ${excerpt.truncated}
- Redaction: ${excerpt.redaction}

\`\`\`
${excerpt.excerpt}
\`\`\`
`;
}

function boundLines(
  lines: string[],
  maxLines: number
): { text: string; truncated: boolean; omittedLines: number } {
  if (lines.length <= maxLines) {
    return { text: lines.join("\n"), truncated: false, omittedLines: 0 };
  }
  const headCount = Math.max(1, Math.floor(maxLines / 2));
  const tailCount = Math.max(1, maxLines - headCount - 1);
  const omittedLines = lines.length - headCount - tailCount;
  return {
    text: [
      ...lines.slice(0, headCount),
      `... [${omittedLines} lines omitted]`,
      ...lines.slice(lines.length - tailCount)
    ].join("\n"),
    truncated: true,
    omittedLines
  };
}

function boundBytes(text: string, maxBytes: number): { text: string; truncated: boolean } {
  if (Buffer.byteLength(text, "utf8") <= maxBytes) {
    return { text, truncated: false };
  }
  const truncated = Buffer.from(text, "utf8").subarray(0, maxBytes).toString("utf8");
  return { text: `${truncated}\n... [truncated by byte budget]`, truncated: true };
}

function parsePositiveInteger(
  value: string | number | undefined,
  fallback: number,
  label: string
): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer: ${value}`);
  }
  return parsed;
}

function parseOptionalExitCode(value: string | number): number | null {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`exit-code must be an integer: ${value}`);
  }
  return parsed;
}
