import { createHash } from "node:crypto";
import { readTextFile, writeJsonFile } from "../filesystem/index.js";
import { HARNESS_PROTOCOL_VERSION, RequirementLedger, RequirementRecord } from "../types.js";

const idPattern = /\bREQ[-_ ]?(\d{1,5})\b/i;

export async function compileRequirementLedger(input: {
  workspaceRoot: string;
  specPath: string;
  outputPath?: string;
  phaseId?: string;
}): Promise<RequirementLedger> {
  const markdown = await readTextFile(input.workspaceRoot, input.specPath);
  const requirements = extractRequirements(markdown, input.specPath, input.phaseId);
  const ledger: RequirementLedger = {
    protocol_version: HARNESS_PROTOCOL_VERSION,
    generated_at: new Date().toISOString(),
    requirements,
    limitations: [
      "Requirement extraction is deterministic but shallow: headings, explicit REQ IDs, and requirement-like bullets are captured.",
      "Semantic completeness must be reviewed by a parent coordinator before evidence gates rely on the ledger."
    ]
  };
  if (input.outputPath) {
    await writeJsonFile(input.workspaceRoot, input.outputPath, ledger);
  }
  return ledger;
}

export function extractRequirements(
  markdown: string,
  sourceFile: string,
  phaseId = "phase_001"
): RequirementRecord[] {
  const lines = markdown.split(/\r?\n/);
  const requirements: RequirementRecord[] = [];
  let currentHeading = "Document";
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!;
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      currentHeading = heading[2]!.trim();
      continue;
    }
    const trimmed = line.trim();
    if (!isRequirementLike(trimmed)) {
      continue;
    }
    const explicitId = trimmed.match(idPattern);
    const id = explicitId
      ? `REQ-${explicitId[1]!.padStart(3, "0")}`
      : `REQ-${stableHash(`${currentHeading}:${trimmed}`).slice(0, 8).toUpperCase()}`;
    requirements.push({
      id,
      source_file: sourceFile,
      source_heading: currentHeading,
      source_ref: `${sourceFile}:L${index + 1}`,
      phase_mapping: phaseId,
      acceptance_criteria: [],
      implementation_status: "not_started",
      proof_references: [],
      carry_forward_risks: []
    });
  }
  return dedupeRequirements(requirements);
}

function isRequirementLike(line: string): boolean {
  if (line.length < 12) {
    return false;
  }
  return (
    idPattern.test(line) ||
    /^(must|should|required|requirement|acceptance|implement|create|add|build)\b/i.test(line) ||
    /^[-*]\s+(must|should|required|implement|create|add|build)\b/i.test(line)
  );
}

function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function dedupeRequirements(requirements: RequirementRecord[]): RequirementRecord[] {
  const seen = new Set<string>();
  return requirements.filter((requirement) => {
    if (seen.has(requirement.id)) {
      return false;
    }
    seen.add(requirement.id);
    return true;
  });
}
