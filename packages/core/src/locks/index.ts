import { pathMatchesPattern } from "../filesystem/index.js";

export interface WriteLock {
  id: string;
  owner: string;
  scopes: string[];
  acquired_at: string;
}

export interface LockRequestResult {
  granted: boolean;
  conflicts: WriteLock[];
  lock?: WriteLock;
}

export function requestWriteLock(
  locks: WriteLock[],
  owner: string,
  scopes: string[],
  now = new Date().toISOString()
): LockRequestResult {
  const conflicts = locks.filter((lock) =>
    lock.scopes.some((lockedScope) => scopes.some((requestedScope) => lockScopesOverlap(lockedScope, requestedScope)))
  );
  if (conflicts.length > 0) {
    return { granted: false, conflicts };
  }
  const lock: WriteLock = { id: `${owner}-${Date.now()}`, owner, scopes, acquired_at: now };
  return { granted: true, conflicts: [], lock };
}

export function releaseWriteLock(locks: WriteLock[], lockId: string, owner?: string): WriteLock[] {
  return locks.filter((lock) => lock.id !== lockId || (owner !== undefined && lock.owner !== owner));
}

export function lockScopesOverlap(left: string, right: string): boolean {
  return pathMatchesPattern(left.replace(/\/\*\*$/, ""), right) || pathMatchesPattern(right.replace(/\/\*\*$/, ""), left);
}
