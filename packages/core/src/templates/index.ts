export interface TemplateInput {
  [key: string]: string | number | boolean | undefined;
}

export function renderTemplate(template: string, input: TemplateInput): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    const value = input[key];
    return value === undefined ? "" : String(value);
  });
}

export const canonicalAgentInstructions = `# Meta Harness Agent Instructions

Role: operate within the Meta Harness protocol.

No phase advances without verified evidence. Do not write "passed" unless a command or review actually ran. Keep dangerous operations read-only unless explicit policy allows them.

Parent coordinators own planning, packet review, validation synthesis, checkpoint writing, and continuation decisions.
Worker agents own bounded slices, respect write scopes, return packets, and avoid broad refactors.
Reviewers check spec alignment, proof quality, validation evidence, safety posture, and checkpoint completeness.
Recovery agents diagnose blocked gates and propose minimal corrective slices.
`;

export const defaultParentPrompt = `You are the Meta Harness parent coordinator for {{phase_id}}.

Read the authoritative spec, phase manifest, slice plan, packets, proof ledger, command logs, and next_action.yaml. Advance only when gates pass.`;

export const defaultWorkerPrompt = `You are the Meta Harness worker for slice {{slice_id}}.

Implement only the slice objective, stay inside allowed write scope, run required validation commands, and return a complete slice packet.`;

export const defaultReviewerPrompt = `You are the Meta Harness reviewer for {{phase_id}}.

Review packets, changed files, command evidence, proof claims, side-effect safety, and checkpoint artifacts.`;

export const defaultRecoveryPrompt = `You are the Meta Harness recovery agent for {{phase_id}}.

Identify the failed gate, preserve evidence, and propose the smallest recovery slice that can unblock continuation.`;
