export type LifeAreaId =
  | "faith"
  | "family"
  | "health"
  | "mind"
  | "work"
  | "finance"
  | "lifestyle";

export interface LifeAreaDefinition {
  id: LifeAreaId;
  label: string;
  purpose: string;
  defaultPriority: number;
  signals: string[];
}

export const LIFE_AREAS: LifeAreaDefinition[] = [
  {
    id: "faith",
    label: "Deus / Vida espiritual",
    purpose: "Keep faith, character, purpose and spiritual practices visible in daily decisions.",
    defaultPriority: 100,
    signals: ["devotional", "prayer", "church/community", "values alignment"],
  },
  {
    id: "family",
    label: "Família e relacionamentos",
    purpose: "Protect strong relationships and detect unhealthy isolation before it grows.",
    defaultPriority: 70,
    signals: ["quality time", "important relationships", "community", "isolation"],
  },
  {
    id: "health",
    label: "Corpo e saúde",
    purpose: "Track safe, sustainable actions for sleep, movement, nutrition and medical follow-up.",
    defaultPriority: 95,
    signals: ["sleep", "movement", "nutrition", "medical follow-up", "energy"],
  },
  {
    id: "mind",
    label: "Mente e execução",
    purpose: "Externalize executive function, reduce choices and convert intention into the next concrete action.",
    defaultPriority: 85,
    signals: ["focus", "consistency", "overload", "procrastination", "learning sprawl"],
  },
  {
    id: "work",
    label: "Trabalho, propósito e negócios",
    purpose: "Turn AI/technology skill into focused execution, revenue and long-term professional freedom.",
    defaultPriority: 90,
    signals: ["active project", "sales actions", "delivery", "learning tied to execution"],
  },
  {
    id: "finance",
    label: "Finanças",
    purpose: "Restore cashflow, eliminate destructive debt, build reserves and grow long-term capacity for impact.",
    defaultPriority: 95,
    signals: ["income", "cash", "debt", "reserve", "runway", "giving"],
  },
  {
    id: "lifestyle",
    label: "Vida pessoal e liberdade",
    purpose: "Protect rest, hobbies, travel and autonomy instead of postponing life indefinitely.",
    defaultPriority: 60,
    signals: ["leisure", "travel", "screen balance", "weekend quality", "autonomy"],
  },
];
