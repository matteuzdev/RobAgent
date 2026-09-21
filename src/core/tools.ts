import type { RiskLevel, ToolEvidence } from "./types.js";

export interface ToolContext {
  approved: boolean;
}

export interface RobyTool<TInput = unknown> {
  name: string;
  description: string;
  risk: RiskLevel;
  execute(input: TInput, context: ToolContext): Promise<ToolEvidence>;
}

export class ToolRegistry {
  private readonly tools = new Map<string, RobyTool>();

  register(tool: RobyTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): RobyTool | undefined {
    return this.tools.get(name);
  }

  list(): RobyTool[] {
    return [...this.tools.values()];
  }

  async execute(name: string, input: unknown, context: ToolContext): Promise<ToolEvidence> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { toolName: name, success: false, summary: "Tool is not registered." };
    }

    if ((tool.risk === "high" || tool.risk === "critical") && !context.approved) {
      return {
        toolName: name,
        success: false,
        summary: "Execution blocked: explicit human approval is required.",
      };
    }

    return tool.execute(input, context);
  }
}
