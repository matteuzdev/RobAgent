import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { RobyOrchestrator } from "./core/orchestrator.js";
import { JsonMemoryStore } from "./core/memory.js";
import { LIFE_AREAS } from "./life/areas.js";
import { DEFAULT_VISION_POLICY } from "./vision/policy.js";

const goal = process.argv.slice(2).join(" ").trim() ||
  "Quero aprender agentes de IA e transformar isso em um projeto real.";

const orchestrator = new RobyOrchestrator();
const request = {
  id: randomUUID(),
  goal,
  risk: "low" as const,
  requestedAction: false,
};

const plan = orchestrator.plan(request);

console.log("\nROBY OS — FOUNDATION v0.1\n");
console.log("Goal:", goal);
console.log("Domains:", plan.domains.join(", "));
console.log("Research required:", plan.researchRequired ? "yes" : "no");
console.log("\nCangaço council:");
for (const selected of plan.council) {
  console.log(`- ${selected.lens.label} [${selected.reasons.join(", ")}]`);
}
console.log("\nPlan:");
plan.steps.forEach((step, index) => console.log(`${index + 1}. ${step}`));

console.log("\nLife OS areas:", LIFE_AREAS.map((area) => area.label).join(" | "));
console.log("Vision mode:", DEFAULT_VISION_POLICY.mode);

const dataDir = process.env.ROBY_DATA_DIR ?? ".roby-data";
const memory = new JsonMemoryStore(resolve(dataDir, "memory.json"));
await memory.put({
  id: request.id,
  namespace: "session",
  text: goal,
  tags: plan.domains,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

console.log("Private memory adapter: ready");
console.log("\nNext: plug real model + research + MCP tools into this core.\n");
