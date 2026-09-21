import { detectDomains, selectCouncil } from "../cangaco/council.js";
import { verifyEvidence } from "./verifier.js";
import type {
  OrchestrationPlan,
  OrchestrationResult,
  TaskRequest,
  ToolEvidence,
} from "./types.js";

export interface RunOptions {
  approved?: boolean;
  evidence?: ToolEvidence[];
}

const NEEDS_RESEARCH = [
  "hoje",
  "agora",
  "atual",
  "latest",
  "preço",
  "preco",
  "api",
  "documentação",
  "documentacao",
  "versão",
  "versao",
  "mercado",
];

function researchNeeded(request: TaskRequest): boolean {
  if (request.freshResearch !== undefined) return request.freshResearch;
  const text = request.goal.toLocaleLowerCase("pt-BR");
  return NEEDS_RESEARCH.some((term) => text.includes(term));
}

function needsApproval(request: TaskRequest): boolean {
  if (!request.requestedAction) return false;
  return request.risk === "high" || request.risk === "critical";
}

export class RobyOrchestrator {
  plan(request: TaskRequest): OrchestrationPlan {
    const domains = [...new Set([
      ...detectDomains(request.goal),
      ...(request.domain ? [request.domain] : []),
    ])];
    const council = selectCouncil(request.goal, request.domain, 6);
    const researchRequired = researchNeeded(request);
    const needsHumanApproval = needsApproval(request);

    const steps = [
      "Understand the user's actual goal and constraints.",
      council.length
        ? `Consult selected Cangaço lenses: ${council.map((item) => item.lens.label).join(", ")}.`
        : "Use Roby general reasoning; no specialist lens matched.",
      ...(researchRequired
        ? ["Research current sources before forming a conclusion."]
        : []),
      ...(request.requestedAction
        ? ["Choose the minimum-permission tool and execute only within granted authority."]
        : []),
      "Run verification / quality gate before claiming completion.",
      "Return one synthesized Roby answer with a concrete next action.",
    ];

    return { request, domains, council, needsHumanApproval, researchRequired, steps };
  }

  complete(request: TaskRequest, answer: string, options: RunOptions = {}): OrchestrationResult {
    const plan = this.plan(request);
    const evidence = options.evidence ?? [];

    if (plan.needsHumanApproval && !options.approved) {
      return {
        status: "needs-approval",
        plan,
        answer: "Action is planned but blocked until explicit human approval.",
        evidence,
        verification: { verified: false, reasons: ["Human approval is required."] },
      };
    }

    const verification = verifyEvidence(evidence, Boolean(request.requestedAction));
    const status = verification.verified ? "completed" : "blocked";

    return { status, plan, answer, evidence, verification };
  }
}
