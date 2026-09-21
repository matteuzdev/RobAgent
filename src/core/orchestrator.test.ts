import assert from "node:assert/strict";
import test from "node:test";
import { RobyOrchestrator } from "./orchestrator.js";

test("routes an agentic AI request to relevant council lenses", () => {
  const orchestrator = new RobyOrchestrator();
  const plan = orchestrator.plan({
    id: "1",
    goal: "Quero construir um agente de IA com memória e orquestração",
    risk: "low",
  });

  assert.ok(plan.domains.includes("ai"));
  assert.ok(plan.domains.includes("agents"));
  assert.ok(plan.council.some((item) => item.lens.id === "andrew-ng"));
  assert.ok(plan.council.some((item) => item.lens.id === "harrison-chase"));
});

test("does not claim an external action completed without evidence", () => {
  const orchestrator = new RobyOrchestrator();
  const result = orchestrator.complete(
    {
      id: "2",
      goal: "Envie uma mensagem",
      requestedAction: true,
      risk: "low",
    },
    "Mensagem enviada."
  );

  assert.equal(result.status, "blocked");
  assert.equal(result.verification.verified, false);
});

test("high-risk actions require explicit human approval", () => {
  const orchestrator = new RobyOrchestrator();
  const result = orchestrator.complete(
    {
      id: "3",
      goal: "Execute uma ação financeira",
      requestedAction: true,
      risk: "high",
    },
    "Planejado."
  );

  assert.equal(result.status, "needs-approval");
});
