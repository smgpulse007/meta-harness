import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export const safeIdPattern = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$/;

export function assertSafeId(value: string, label = "id"): string {
  if (!safeIdPattern.test(value)) {
    throw new Error(`${label} must match ${safeIdPattern.source}`);
  }
  return value;
}

export function normalizePath(value: string): string {
  return normalizeRelativePath(value);
}

export function normalizeRelativePath(value: string): string {
  const slashPath = value.replaceAll("\\", "/").replace(/^\.\/+/, "");
  if (slashPath.length === 0 || slashPath.startsWith("/") || /^[A-Za-z]:\//.test(slashPath)) {
    throw new Error(`Path must be relative: ${value}`);
  }
  const segments = slashPath.split("/");
  if (segments.some((segment) => segment === "..")) {
    throw new Error(`Path traversal is not allowed: ${value}`);
  }
  const normalized = path.posix.normalize(slashPath);
  if (
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized.startsWith("/")
  ) {
    throw new Error(`Path must stay relative: ${value}`);
  }
  return normalized;
}

export function resolveInsideWorkspace(workspaceRoot: string, targetPath: string): string {
  const root = path.resolve(workspaceRoot);
  const resolved = path.resolve(root, targetPath);
  const relative = path.relative(root, resolved);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return resolved;
  }
  throw new Error(`Path escapes workspace root: ${targetPath}`);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function readTextFile(workspaceRoot: string, targetPath: string): Promise<string> {
  return readFile(resolveInsideWorkspace(workspaceRoot, targetPath), "utf8");
}

export async function writeTextFile(
  workspaceRoot: string,
  targetPath: string,
  contents: string
): Promise<string> {
  const resolved = resolveInsideWorkspace(workspaceRoot, targetPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, contents, "utf8");
  return resolved;
}

export async function readJsonFile<T>(workspaceRoot: string, targetPath: string): Promise<T> {
  return JSON.parse(await readTextFile(workspaceRoot, targetPath)) as T;
}

export async function writeJsonFile(
  workspaceRoot: string,
  targetPath: string,
  value: unknown
): Promise<string> {
  return writeTextFile(workspaceRoot, targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function readYamlFile<T>(workspaceRoot: string, targetPath: string): Promise<T> {
  return YAML.parse(await readTextFile(workspaceRoot, targetPath)) as T;
}

export async function writeYamlFile(
  workspaceRoot: string,
  targetPath: string,
  value: unknown
): Promise<string> {
  return writeTextFile(workspaceRoot, targetPath, YAML.stringify(value));
}

export function pathMatchesPattern(filePath: string, pattern: string): boolean {
  let file: string;
  let normalizedPattern: string;
  try {
    file = normalizeRelativePath(filePath);
    normalizedPattern = normalizeRelativePath(pattern);
  } catch {
    return false;
  }
  if (normalizedPattern === "**" || normalizedPattern === "*") {
    return true;
  }
  if (normalizedPattern.endsWith("/**")) {
    const prefix = normalizedPattern.slice(0, -3);
    return file === prefix || file.startsWith(`${prefix}/`);
  }
  if (normalizedPattern.includes("*")) {
    const escaped = normalizedPattern
      .split("*")
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*");
    return new RegExp(`^${escaped}$`).test(file);
  }
  return file === normalizedPattern || file.startsWith(`${normalizedPattern}/`);
}
