import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";

const root = process.cwd();
const schemaDir = path.join(root, "schemas");
const ajv = new Ajv2020({ strict: false, allErrors: true });
let schemaCount = 0;

for (const file of await readdir(schemaDir)) {
  if (!file.endsWith(".schema.json")) {
    continue;
  }
  const schema = JSON.parse(await readFile(path.join(schemaDir, file), "utf8"));
  ajv.addSchema(schema, schema.$id ?? file);
  schemaCount += 1;
}

for (const file of await readdir(schemaDir)) {
  if (!file.endsWith(".schema.json")) {
    continue;
  }
  const schema = JSON.parse(await readFile(path.join(schemaDir, file), "utf8"));
  const validate = ajv.getSchema(schema.$id ?? file);
  if (!validate) {
    throw new Error(`Schema was not registered: ${file}`);
  }
}

const validationTargets: Array<[string, string, "json" | "yaml"]> = [
  [
    "https://meta-harness.dev/schemas/phase_manifest.schema.json",
    "templates/phase_manifest.yaml",
    "yaml"
  ],
  ["https://meta-harness.dev/schemas/slice_plan.schema.json", "templates/slice_plan.yaml", "yaml"],
  ["https://meta-harness.dev/schemas/proof.schema.json", "templates/proof.json", "json"],
  [
    "https://meta-harness.dev/schemas/next_action.schema.json",
    "templates/next_action.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/phase_manifest.schema.json",
    "docs/implementation_harness/phase_manifest.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/side_effect_policy.schema.json",
    "docs/implementation_harness/side_effect_policy.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/agent_registry.schema.json",
    ".meta-harness/adapter_registry.json",
    "json"
  ],
  [
    "https://meta-harness.dev/schemas/requirement_ledger.schema.json",
    ".meta-harness/requirement_ledger.json",
    "json"
  ],
  [
    "https://meta-harness.dev/schemas/phase_manifest.schema.json",
    "skills/meta-harness/templates/phase_manifest.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/slice_plan.schema.json",
    "skills/meta-harness/templates/slice_plan.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/proof.schema.json",
    "skills/meta-harness/templates/proof.json",
    "json"
  ],
  [
    "https://meta-harness.dev/schemas/next_action.schema.json",
    "skills/meta-harness/templates/next_action.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/phase_manifest.schema.json",
    "examples/tiny-typescript-refactor/docs/implementation_harness/phase_manifest.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/slice_plan.schema.json",
    "examples/tiny-typescript-refactor/.meta-harness/checkpoints/phase_001/slice_plan.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/slice_packet.schema.json",
    "examples/tiny-typescript-refactor/.meta-harness/checkpoints/phase_001/subagent_packets/phase_001_slice_001.packet.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/proof.schema.json",
    "examples/tiny-typescript-refactor/.meta-harness/checkpoints/phase_001/proof.json",
    "json"
  ],
  [
    "https://meta-harness.dev/schemas/next_action.schema.json",
    "examples/tiny-typescript-refactor/.meta-harness/checkpoints/phase_001/next_action.yaml",
    "yaml"
  ],
  [
    "https://meta-harness.dev/schemas/budget_report.schema.json",
    "docs/examples/context-packs/budget-report.sample.json",
    "json"
  ],
  [
    "https://meta-harness.dev/schemas/evidence_excerpt.schema.json",
    "docs/examples/evidence-excerpts/sample-command-output.excerpt.json",
    "json"
  ]
];

for (const [schemaId, relativePath, format] of validationTargets) {
  await validateArtifact(schemaId, relativePath, format);
}

const packetValidator = ajv.getSchema("https://meta-harness.dev/schemas/slice_packet.schema.json");
if (!packetValidator || packetValidator({ protocol_version: "0.1.0" })) {
  throw new Error("Negative slice packet fixture unexpectedly passed schema validation");
}

process.stdout.write(
  `Validated ${schemaCount} JSON schemas and ${validationTargets.length} artifacts.\n`
);

async function validateArtifact(
  schemaId: string,
  relativePath: string,
  format: "json" | "yaml"
): Promise<void> {
  const validator = ajv.getSchema(schemaId);
  if (!validator) {
    throw new Error(`Missing schema validator: ${schemaId}`);
  }
  const text = await readFile(path.join(root, relativePath), "utf8");
  const value = format === "json" ? JSON.parse(text) : YAML.parse(text);
  if (!validator(value)) {
    throw new Error(
      `${relativePath} failed ${schemaId}: ${JSON.stringify(validator.errors, null, 2)}`
    );
  }
}
