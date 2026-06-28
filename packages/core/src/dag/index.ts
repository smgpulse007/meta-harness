import { SliceDefinition, SlicePlan } from "../types.js";
import { pathMatchesPattern } from "../filesystem/index.js";

export interface DagAnalysis {
  ordered: SliceDefinition[];
  cycles: string[][];
}

export function analyzeSliceDag(plan: SlicePlan): DagAnalysis {
  const byId = new Map(plan.slices.map((slice) => [slice.id, slice]));
  const temporary = new Set<string>();
  const permanent = new Set<string>();
  const ordered: SliceDefinition[] = [];
  const cycles: string[][] = [];

  const visit = (id: string, stack: string[]): void => {
    if (permanent.has(id)) {
      return;
    }
    if (temporary.has(id)) {
      const cycleStart = stack.indexOf(id);
      cycles.push(stack.slice(cycleStart).concat(id));
      return;
    }
    const slice = byId.get(id);
    if (!slice) {
      return;
    }
    temporary.add(id);
    for (const dependency of slice.dependencies) {
      visit(dependency, [...stack, id]);
    }
    temporary.delete(id);
    permanent.add(id);
    ordered.push(slice);
  };

  for (const slice of plan.slices) {
    visit(slice.id, []);
  }

  return { ordered, cycles };
}

export function getReadySlices(plan: SlicePlan, completedSliceIds: string[]): SliceDefinition[] {
  const completed = new Set(completedSliceIds);
  return plan.slices.filter(
    (slice) => !completed.has(slice.id) && slice.dependencies.every((dependency) => completed.has(dependency))
  );
}

export function getParallelGroups(plan: SlicePlan): SliceDefinition[][] {
  const completed = new Set<string>();
  const remaining = new Set(plan.slices.map((slice) => slice.id));
  const groups: SliceDefinition[][] = [];
  while (remaining.size > 0) {
    const ready = plan.slices.filter(
      (slice) =>
        remaining.has(slice.id) && slice.dependencies.every((dependency) => completed.has(dependency))
    );
    if (ready.length === 0) {
      break;
    }
    groups.push(ready);
    for (const slice of ready) {
      remaining.delete(slice.id);
      completed.add(slice.id);
    }
  }
  return groups;
}

export interface WriteScopeOverlap {
  left: string;
  right: string;
  scope: string;
}

export function detectWriteScopeOverlaps(plan: SlicePlan): WriteScopeOverlap[] {
  const overlaps: WriteScopeOverlap[] = [];
  const groups = getParallelGroups(plan);
  for (const group of groups) {
    for (let leftIndex = 0; leftIndex < group.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < group.length; rightIndex += 1) {
        const left = group[leftIndex]!;
        const right = group[rightIndex]!;
        for (const leftScope of left.allowed_write_scope) {
          if (right.allowed_write_scope.some((rightScope) => scopesOverlap(leftScope, rightScope))) {
            overlaps.push({ left: left.id, right: right.id, scope: leftScope });
          }
        }
      }
    }
  }
  return overlaps;
}

function scopesOverlap(left: string, right: string): boolean {
  return pathMatchesPattern(left.replace(/\/\*\*$/, ""), right) || pathMatchesPattern(right.replace(/\/\*\*$/, ""), left);
}
