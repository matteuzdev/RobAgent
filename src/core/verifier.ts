import type { ToolEvidence, VerificationReport } from "./types.js";

export function verifyEvidence(
  evidence: ToolEvidence[],
  actionWasRequired: boolean
): VerificationReport {
  const reasons: string[] = [];

  if (!actionWasRequired) {
    return { verified: true, reasons: ["No external action required."] };
  }

  if (evidence.length === 0) {
    return {
      verified: false,
      reasons: ["An external action was requested, but no tool evidence exists."],
    };
  }

  const failed = evidence.filter((item) => !item.success);
  if (failed.length > 0) {
    reasons.push(
      `${failed.length} tool action(s) failed: ${failed.map((item) => item.toolName).join(", ")}`
    );
  }

  const successfulWithEvidence = evidence.filter(
    (item) => item.success && (item.evidenceId || item.payload !== undefined)
  );

  if (successfulWithEvidence.length === 0) {
    reasons.push("No successful tool action returned durable evidence.");
  }

  return {
    verified: reasons.length === 0,
    reasons: reasons.length === 0 ? ["External action has verifiable tool evidence."] : reasons,
  };
}
