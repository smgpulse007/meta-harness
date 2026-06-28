import { dangerousOperations, DangerousOperation, SideEffectPolicy } from "../types.js";
import { normalizeRelativePath, pathMatchesPattern, resolveInsideWorkspace } from "../filesystem/index.js";

export const defaultSideEffectPolicy: SideEffectPolicy = {
  default_posture: "read_only",
  dangerous_operations: [...dangerousOperations],
  allowed_dangerous_operations: [],
  authorization_required: true,
  audit_required: true
};

const secretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /ghp_[A-Za-z0-9_]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{20,}/g,
  /(?<key>api[_-]?key|token|secret|password)\s*[:=]\s*["']?[^"'\s]+/gi
];

export function redactSecrets(input: string): string {
  return secretPatterns.reduce((value, pattern) => value.replace(pattern, "[REDACTED]"), input);
}

export function validateWorkspacePath(workspaceRoot: string, targetPath: string): string {
  return resolveInsideWorkspace(workspaceRoot, targetPath);
}

export function evaluateDangerousOperations(
  requestedOperations: DangerousOperation[],
  policy: SideEffectPolicy = defaultSideEffectPolicy
): { allowed: boolean; blocked: DangerousOperation[] } {
  const blocked = requestedOperations.filter(
    (operation) =>
      policy.dangerous_operations.includes(operation) &&
      !policy.allowed_dangerous_operations.includes(operation)
  );
  return { allowed: blocked.length === 0, blocked };
}

export function validateChangedFilesAgainstScope(input: {
  changedFiles: string[];
  allowedWriteScope: string[];
  forbiddenWriteScope: string[];
}): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const rawChangedFile of input.changedFiles) {
    let changedFile: string;
    try {
      changedFile = normalizeRelativePath(rawChangedFile);
    } catch {
      violations.push(rawChangedFile);
      continue;
    }
    const allowed = input.allowedWriteScope.some((scope) => pathMatchesPattern(changedFile, scope));
    const forbidden = input.forbiddenWriteScope.some((scope) => pathMatchesPattern(changedFile, scope));
    if (!allowed || forbidden) {
      violations.push(changedFile);
    }
  }
  return { ok: violations.length === 0, violations };
}
