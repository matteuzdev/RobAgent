# Roby OS — Architecture v0.1

## Goal

Roby is a personal AI operating system, not a single chatbot. The user talks to one identity while Roby coordinates models, specialist lenses, tools, memory, research and verification.

## Architecture

```text
User
  |
  v
Roby Interface (text / voice / vision)
  |
  v
Roby Core Orchestrator
  |---- Intent + domain classifier
  |---- Risk / permission gate
  |---- Cangaço Council selector
  |---- Model router
  |---- Tool registry / MCP
  |---- Research engine
  |---- Learning engine
  |---- Memory engine
  |---- Verifier / Evals
  |
  v
Verified response or verified action
```

## Non-negotiable rules

1. **Never fake execution.** A task is only complete when an external action returns verifiable evidence.
2. **Memory belongs to Roby, not to a model provider.**
3. **Personal data is private by default.** This repository is public; real life data must live under ignored runtime storage or an external private database.
4. **Model-agnostic.** Models are replaceable adapters.
5. **Research before build.** Fresh facts, APIs, pricing, libraries and market claims require current research.
6. **Human authority.** High-impact actions require explicit approval.
7. **Reasoning and voice are separate.** A strong Nordestino voice must never lower factual quality.
8. **One Roby, many internal specialists.** The user should not have to manage the squad manually.

## Cangaço model

Cangaço is an internal council of cognitive lenses, not impersonation. Each lens contains:

- domains where it is useful;
- principles / mental models;
- boundaries;
- roles it can play: adviser, teacher, operator or auditor;
- independent communication style metadata.

Roby can select several lenses, ask them to challenge one another, and synthesize one answer.

## AIOX alignment

The project adopts AIOX-style separation of responsibilities, squads, authority boundaries, workflows, quality gates, observability and explicit handoffs. AIOX should be treated as an orchestration/reference layer rather than the owner of Roby's identity or personal data.

## Runtime roadmap

- v0.1: core types, council selection, private memory adapter, verification, permission model.
- v0.2: real LLM provider router + research provider + trace logs.
- v0.3: web dashboard + Life OS.
- v0.4: MCP/tool integrations and automations.
- v0.5: voice + webcam vision with explicit consent.
- v0.6: evals, self-improvement proposals and agent trace learning.
