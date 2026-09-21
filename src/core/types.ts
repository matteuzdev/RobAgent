export type RiskLevel = "low" | "medium" | "high" | "critical";
export type SpecialistRole = "adviser" | "teacher" | "operator" | "auditor";
export type TaskStatus = "planned" | "needs-approval" | "completed" | "blocked";

export interface TaskRequest {
  id: string;
  goal: string;
  domain?: string;
  freshResearch?: boolean;
  risk?: RiskLevel;
  requestedAction?: boolean;
}

export interface CognitiveLens {
  id: string;
  label: string;
  domains: string[];
  roles: SpecialistRole[];
  principles: string[];
  boundaries: string[];
  voiceTags: string[];
}

export interface SelectedLens {
  lens: CognitiveLens;
  score: number;
  reasons: string[];
}

export interface ToolEvidence {
  toolName: string;
  success: boolean;
  evidenceId?: string;
  summary: string;
  payload?: unknown;
}

export interface VerificationReport {
  verified: boolean;
  reasons: string[];
}

export interface OrchestrationPlan {
  request: TaskRequest;
  domains: string[];
  council: SelectedLens[];
  needsHumanApproval: boolean;
  researchRequired: boolean;
  steps: string[];
}

export interface OrchestrationResult {
  status: TaskStatus;
  plan: OrchestrationPlan;
  answer: string;
  evidence: ToolEvidence[];
  verification: VerificationReport;
}
