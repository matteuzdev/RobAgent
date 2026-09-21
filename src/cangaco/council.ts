import type { CognitiveLens, SelectedLens, SpecialistRole } from "../core/types.js";

const lens = (
  id: string,
  label: string,
  domains: string[],
  roles: SpecialistRole[],
  principles: string[],
  boundaries: string[],
  voiceTags: string[] = ["direto", "nordestino", "sem-enrolacao"]
): CognitiveLens => ({ id, label, domains, roles, principles, boundaries, voiceTags });

export const CANGACO_COUNCIL: CognitiveLens[] = [
  lens("scripture", "Scripture / Biblical wisdom", ["faith", "character", "purpose", "generosity"], ["adviser", "auditor"], ["God first", "character before status", "stewardship", "service"], ["Not a substitute for pastoral care or theology scholarship"]),
  lens("zig-ziglar", "Zig Ziglar lens", ["faith", "sales", "life", "family"], ["adviser", "teacher"], ["balanced success", "service-based selling", "goals and discipline"], ["Historical lens; verify current business facts"]),
  lens("russell-barkley", "Russell Barkley lens", ["mind", "adhd", "execution"], ["adviser", "teacher"], ["externalize executive function", "reduce delay", "design environment"], ["Not medical diagnosis or treatment"]),
  lens("james-clear", "James Clear lens", ["habits", "mind", "health"], ["teacher", "adviser"], ["systems over goals", "identity-based habits", "make good behavior easy"], ["Do not oversimplify clinical conditions"]),
  lens("cal-newport", "Cal Newport lens", ["focus", "work", "learning"], ["teacher", "adviser"], ["deep work", "attention is an asset", "reduce shallow work"], ["Not every job supports long uninterrupted blocks"]),
  lens("john-gottman", "John Gottman lens", ["family", "relationships"], ["adviser", "teacher"], ["friendship and repair", "conflict patterns", "small positive interactions"], ["Use cautiously outside romantic relationship research"]),
  lens("dale-carnegie", "Dale Carnegie lens", ["relationships", "communication", "sales"], ["teacher", "adviser"], ["genuine interest", "listen first", "respect dignity"], ["Avoid manipulative imitation"]),
  lens("peter-attia", "Peter Attia lens", ["health", "longevity"], ["teacher", "adviser"], ["risk reduction", "cardiorespiratory fitness", "metabolic health"], ["Medical decisions require qualified clinicians"]),
  lens("andy-galpin", "Andy Galpin lens", ["health", "exercise"], ["teacher", "adviser"], ["measure then train", "specific adaptation", "recovery matters"], ["Exercise must respect medical limitations"]),
  lens("naval", "Naval Ravikant lens", ["business", "wealth", "life", "strategy"], ["adviser", "teacher"], ["specific knowledge", "leverage", "ownership", "long-term games"], ["Not a source for individualized financial advice"]),
  lens("hormozi", "Alex Hormozi lens", ["business", "sales", "marketing", "offers"], ["adviser", "teacher", "auditor"], ["increase value equation", "volume creates skill", "track acquisition economics"], ["Do not replace customer evidence with slogans"]),
  lens("bezos", "Jeff Bezos lens", ["business", "product", "strategy"], ["adviser", "auditor"], ["customer obsession", "long-term thinking", "high-velocity decisions"], ["Adapt enterprise lessons to actual company size"]),
  lens("andy-grove", "Andy Grove lens", ["business", "management", "execution"], ["adviser", "auditor"], ["output-oriented management", "leverage", "measure what matters operationally"], ["Avoid bureaucracy for tiny teams"]),
  lens("buffett", "Warren Buffett lens", ["finance", "business", "strategy"], ["adviser", "auditor"], ["circle of competence", "margin of safety", "quality and durability"], ["Not personalized investment advice"]),
  lens("munger", "Charlie Munger lens", ["finance", "strategy", "decision"], ["adviser", "auditor"], ["invert", "multidisciplinary models", "avoid stupidity before seeking brilliance"], ["Historical lens; verify current facts"]),
  lens("morgan-housel", "Morgan Housel lens", ["finance", "behavior"], ["teacher", "adviser"], ["room for error", "behavior beats spreadsheets", "enough is contextual"], ["Not individualized investment advice"]),
  lens("taleb", "Nassim Nicholas Taleb lens", ["strategy", "risk", "business", "decision"], ["auditor", "adviser"], ["avoid ruin", "optionality", "antifragility", "skin in the game"], ["Do not turn rhetorical style into certainty"]),
  lens("annie-duke", "Annie Duke lens", ["decision", "strategy"], ["teacher", "auditor"], ["separate outcome from decision quality", "think in bets", "use base rates"], ["Probabilities need evidence"]),
  lens("sam-altman", "Sam Altman lens", ["ai", "product", "startup", "strategy"], ["adviser", "teacher"], ["AI-native product thinking", "scale", "rapid iteration", "distribution"], ["Use public ideas as a lens; verify current claims"]),
  lens("demis-hassabis", "Demis Hassabis lens", ["ai", "research", "science"], ["adviser", "teacher"], ["deep reasoning", "scientific method", "general systems"], ["Use public research and statements, not invented views"]),
  lens("dario-amodei", "Dario Amodei lens", ["ai", "safety", "agents"], ["adviser", "auditor"], ["capability with control", "reliability", "agent safety"], ["Use public ideas as a lens"]),
  lens("andrew-ng", "Andrew Ng lens", ["ai", "agents", "learning"], ["teacher", "adviser"], ["agentic workflows", "tool use", "reflection", "small fast experiments"], ["Verify framework/version-specific implementation details"]),
  lens("karpathy", "Andrej Karpathy lens", ["ai", "llm", "engineering", "learning"], ["teacher", "adviser"], ["understand the stack", "build from fundamentals", "tight feedback loops"], ["Verify fast-moving API details"]),
  lens("jensen-huang", "Jensen Huang lens", ["ai", "compute", "systems"], ["adviser", "teacher"], ["accelerated computing", "AI infrastructure", "physical AI"], ["Company-specific claims require current sources"]),
  lens("harrison-chase", "Harrison Chase lens", ["agents", "observability", "ai", "engineering"], ["adviser", "auditor"], ["traces", "evals", "tool orchestration", "stateful agents"], ["Verify current framework APIs"]),
  lens("ogilvy", "David Ogilvy lens", ["marketing", "copy"], ["teacher", "adviser"], ["research the customer", "clarity", "specificity", "sell the benefit"], ["Historical media assumptions may not transfer"]),
  lens("cialdini", "Robert Cialdini lens", ["marketing", "sales", "communication"], ["teacher", "auditor"], ["ethical influence", "social proof", "reciprocity", "consistency"], ["No deceptive persuasion"]),
  lens("feynman", "Richard Feynman teaching lens", ["learning", "communication", "science"], ["teacher"], ["explain simply", "find the gap", "reconstruct from first principles"], ["Simple explanation must not distort facts"]),
  lens("high-conviction-communicator", "High-conviction communication lens", ["communication", "teaching", "sales"], ["teacher", "adviser"], ["strong framing", "memorable analogies", "energy", "clear calls to action"], ["Never trade truth for intensity"], ["energetico", "nordestino", "didatico"])
];

const DOMAIN_ALIASES: Record<string, string[]> = {
  faith: ["deus", "fé", "fe", "bíblia", "biblia", "igreja", "espiritual"],
  health: ["saúde", "saude", "peso", "sono", "exercício", "exercicio", "alimentação", "alimentacao"],
  mind: ["tdah", "foco", "constância", "constancia", "mente", "procrastinação", "procrastinacao"],
  family: ["família", "familia", "relacionamento", "solidão", "solidao"],
  business: ["negócio", "negocio", "empresa", "saas", "produto", "oferta"],
  finance: ["dinheiro", "financeiro", "dívida", "divida", "renda", "investimento"],
  sales: ["venda", "vendas", "prospecção", "prospeccao", "cliente", "fechamento"],
  marketing: ["marketing", "anúncio", "anuncio", "copy", "criativo", "tráfego", "trafego"],
  ai: ["ia", "inteligência artificial", "inteligencia artificial", "llm", "modelo"],
  agents: ["agente", "agentes", "agentic", "agêntico", "agentico", "mcp", "orquestração", "orquestracao"],
  learning: ["aprender", "estudar", "curso", "ensinar"],
  communication: ["comunicação", "comunicacao", "falar", "apresentar", "storytelling"],
  strategy: ["estratégia", "estrategia", "decisão", "decisao", "risco"],
};

export function detectDomains(text: string): string[] {
  const normalized = text.toLocaleLowerCase("pt-BR");
  const hits = Object.entries(DOMAIN_ALIASES)
    .filter(([, terms]) => terms.some((term) => normalized.includes(term)))
    .map(([domain]) => domain);
  return [...new Set(hits.length ? hits : ["general"])];
}

export function selectCouncil(text: string, explicitDomain?: string, limit = 5): SelectedLens[] {
  const domains = new Set(detectDomains(text));
  if (explicitDomain) domains.add(explicitDomain);

  return CANGACO_COUNCIL
    .map((candidate) => {
      const overlap = candidate.domains.filter((domain) => domains.has(domain));
      const score = overlap.length * 3 + (candidate.roles.includes("auditor") ? 0.25 : 0);
      return {
        lens: candidate,
        score,
        reasons: overlap.map((domain) => `domain:${domain}`),
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
