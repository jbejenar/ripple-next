# ADR-016: Roadmap Reorganisation — AI-First Priority Tiers and Suggestion Governance

**Status:** Accepted
**Date:** 2026-02-27
**Deciders:** Architecture team, AI agents (Claude Code)

## Context

The product roadmap (v3.0.0) had accumulated structural debt:

1. **Untriaged AI suggestions** — Five items (RN-032 through RN-036) from an AI
   Principal Engineer review sat in a separate "AI Suggestions" backlog section
   without being formally accepted or rejected. This created ambiguity about
   whether they were planned work or speculative ideas.

2. **Phase-based grouping was imprecise** — Items were grouped by "Phase 2
   Remaining" and "Phase 3: Do Later" without clear priority ordering within
   each phase. An AI agent reading the roadmap could not determine execution
   sequence without human interpretation.

3. **No structured suggestion workflow** — Both AI agents and human tech leads
   lacked clear templates and guidelines for proposing new roadmap items,
   leading to inconsistent formats and unclear triage processes.

4. **Priority did not reflect AI-first goals** — Items that directly improve
   agent automation (machine-readable quality gates, rollback contracts,
   toolchain pinning) were mixed in with feature work without differentiation.

## Decision

Reorganise the roadmap from phase-based grouping to a **four-tier priority
system** optimised for AI-first execution, and establish formal suggestion
governance for both AI agents and human contributors.

### 1. Priority Tier System

Replace "Phase 2 Remaining / Phase 3: Do Later" with four tiers that encode
execution priority:

| Tier | Name | Selection Criteria |
|------|------|--------------------|
| **1** | Immediate | Quick wins (high impact, low effort) + active blockers |
| **2** | Next Sprint | Items that directly improve AI agent workflows |
| **3** | Scheduled | Feature completeness items (content, integration) |
| **4** | Backlog | Strategic governance items; schedule when Tiers 1–3 are clear |

Within each tier, items are ordered by recommended execution sequence.

### 2. AI Suggestion Triage (RN-032 through RN-036)

All five AI suggestions were evaluated and **accepted into the active roadmap**:

| ID | Title | Tier | Rationale |
|----|-------|------|-----------|
| RN-032 | Toolchain Pinning Hardening | 1 | Low effort, directly improves agent determinism |
| RN-033 | Preview Cleanup Guardrails Parity | 1 | Low effort, eliminates noisy CI failures for agents |
| RN-034 | Machine-Readable Quality Gate Summaries | 2 | Enables agents to parse quality gate results as JSON |
| RN-035 | Rollback and Recovery Command Contract | 2 | Gives agents executable recovery paths |
| RN-036 | IaC Policy Scanning for SST Changes | 2 | Blocks unsafe infra changes with machine-readable diagnostics |

The AI Suggestions section is now empty by design — it serves as an inbox, not
a permanent backlog.

### 3. Suggestion Governance

Two permanent sections are maintained in the roadmap:

- **AI Agent Suggestions** — Structured template with required fields (category,
  source, date, impact/effort/risk, AI-first benefit). AI agents may add
  suggestions but must not self-triage into the active roadmap.

- **Tech Lead Suggestions** — Lighter template for human contributors. AI agents
  must read this section during planning but must not modify it.

Both sections include explicit templates and guidelines. Triage happens during
periodic roadmap reviews (human or AI-assisted with human approval).

### 4. AI-First Metadata

Every active roadmap item now includes an **AI-first benefit** field explaining
how the item improves agent workflows. This helps AI agents prioritise work and
helps humans understand the AI-first rationale behind priority decisions.

## Rationale

- **Tier-based priority is unambiguous** — An AI agent can read the roadmap and
  know exactly what to work on next without human interpretation.
- **Suggestion inbox pattern** — Keeping suggestions separate from active work
  prevents scope creep while ensuring good ideas are captured and reviewed.
- **Dual suggestion tracks** — AI agents and humans have different context and
  constraints; separate templates reflect this.
- **All five AI suggestions had merit** — Each item addresses a real gap
  identified during automated analysis and aligns with the platform's AI-first
  goals.

## Consequences

### Positive

- Roadmap is now machine-parseable with clear execution priority.
- AI agents can autonomously determine what to work on next.
- Suggestion workflow prevents both neglect (items sitting untriaged) and
  premature adoption (items entering active work without review).
- Priority explicitly favours agent-enabling infrastructure over feature work.

### Negative

- Tier boundaries are somewhat subjective — reasonable people may disagree on
  whether an item is Tier 2 or Tier 3.
- The four-tier system may need expansion if the roadmap grows significantly.

### Neutral

- Roadmap version bumped from 3.0.0 to 4.0.0 to reflect the structural change.
- Historical phase labels (Phase 1, Phase 2, Phase 3) are preserved in the
  archive for traceability but no longer used for active items.

## Related

- [Product Roadmap](../product-roadmap/README.md) — the restructured roadmap
- [ADR-003: Provider Pattern](./003-provider-pattern.md) — core pattern that
  informs AI-first prioritisation (fast agent loops)
- [ADR-010: CI Observability](./010-ci-observability-supply-chain.md) — context
  for RN-034 (machine-readable quality gates)
- [ADR-014: Preview Deploy Guardrails](./014-preview-deploy-guardrails.md) —
  context for RN-033 (preview cleanup parity)
