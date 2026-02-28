# ADR-020: Context File Minimalism — Evidence-Based Trimming of Agent Documentation

**Status:** Accepted
**Date:** 2026-02-28
**Deciders:** Architecture team, AI agents (Claude Code)

## Context

CLAUDE.md (177 lines) and AGENTS.md (431 lines) had grown to include command
catalogs, directory listings, CI pipeline details, and 7-point documentation
maintenance checklists. This content was extensively redundant with the repo's
7-layer agent configuration system:

1. **CLAUDE.md** — always loaded by Claude Code
2. **AGENTS.md** — read by Codex, Qwen Code, other agents
3. **`.github/copilot-instructions.md`** — GitHub Copilot shortcuts
4. **`.github/agents/*.agent.md`** — 4 specialised agent personas
5. **`.github/instructions/*.instructions.md`** — 5 path-specific domain instructions
6. **`.github/prompts/*.prompt.md`** — task-focused workflow prompts
7. **`.github/skills/*/SKILL.md`** — deep-dive skills for specific concerns

The paper "Evaluating AGENTS.md" (Gloaguen et al., ETH Zurich, arXiv:2602.11988,
February 2026) empirically tested context files across 4 coding agents on 138
task instances from SWE-bench and AGENTbench (12 repositories). Key findings:

- Context files **increase inference cost by 20%+** while providing marginal or
  negative benefit to task success rates.
- **Claude Code specifically showed 0% or negative benefit** from developer-written
  context files — the only agent tested that did not benefit.
- **Directory listings and repository overviews** provide no measurable benefit.
- **Over-specification** (exploration mandates, broad checklists) makes tasks
  objectively harder by causing agents to follow unnecessary steps rigidly.
- **Explicit tool recommendations** (e.g., "use Vitest") are 1.6–2.5x more
  effective than general guidance.
- Repos with **extensive existing documentation** (like ours: 19 ADRs, domain
  instructions, skills) suffer more from context file redundancy.
- The paper recommends: **"human-written context files should describe only
  minimal requirements."**

### Anti-patterns found in our files

| Anti-pattern | Where | Paper finding |
|---|---|---|
| Command catalog (50+ commands) | CLAUDE.md, AGENTS.md | Discoverable from `package.json`; no benefit |
| Directory listing | AGENTS.md | Paper proved ineffective |
| Exploration mandates ("Read readiness.json before starting") | Both files | Increases cost without improving success |
| 7-point documentation checklist | Both files | Over-specification; agents update 7 files for every change |
| CI pipeline details + artifacts table | AGENTS.md | Discoverable from `.github/workflows/` |
| Content duplicated in domain instructions | Both files | Redundancy with `.github/instructions/` |

## Decision

1. **Trim CLAUDE.md to ~45 lines.** Keep only hard constraints that cause CI
   failures if unknown: lint rules, auto-imports, provider pattern, coverage
   thresholds, infrastructure constraint, and `pnpm verify` as the quality gate.

2. **Trim AGENTS.md to ~185 lines.** Keep architecture patterns, code conventions,
   testing requirements, Agent Task Routing table (most valuable section per paper),
   and toolchain pinning sources of truth. Remove command catalogs, directory
   listings, CI details, and upgrade procedures.

3. **Push domain-specific guidance to `.github/instructions/`.** Nuxt auto-imports
   → `frontend.instructions.md`; coverage thresholds → `tests.instructions.md`.

4. **Relocate Documentation Maintenance checklist to `docs-writer.agent.md`.**
   This checklist is invoked on-demand when documentation work is needed, not
   globally on every change.

5. **Add anti-bloat guardrails:**
   - HTML comment headers in both files referencing this ADR
   - Agent Task Routing entry for "Modifying CLAUDE.md/AGENTS.md"
   - Machine-enforced line-count gate (`pnpm check:context-size`) wired into
     `pnpm verify` — warns at 60/220 lines, fails at 80/280 lines
   - Error taxonomy entries RPL-DOCS-001 (warning) and RPL-DOCS-002 (error)

## Alternatives Considered

### A. No change

Keep 177 + 431 lines. Rejected because the paper provides strong empirical
evidence that this hurts agent performance, especially for Claude Code.

### B. Delete CLAUDE.md entirely

The paper found Claude Code showed zero benefit from context files. However,
lint rules (`no-console` = error) and Nuxt auto-imports are genuinely
non-discoverable constraints that would cause CI failures. A minimal file
preserving only these constraints is better than deletion.

### C. Merge into a single file

Combine CLAUDE.md and AGENTS.md. Rejected because they serve different audiences:
CLAUDE.md is always loaded by Claude Code (should be ultra-minimal), while
AGENTS.md is read by Codex and other agents (can be somewhat more detailed).

## Consequences

### Positive

- **~20% inference cost reduction** from smaller always-loaded context
- **Reduced exploration bloat** — no mandated pre-work steps
- **Fewer unnecessary documentation updates** — the 7-point checklist no longer
  fires on every change
- **Domain instructions enhanced** — auto-imports and coverage thresholds now in
  path-specific files where they're most relevant
- **Machine-enforced minimalism** — line-count gate prevents gradual re-bloat

### Negative

- **Information not pre-loaded** — agents must discover commands, CI details,
  and directory structure on their own. Mitigated by: package.json scripts,
  existing file patterns, and domain instructions.
- **Maintenance overhead** — the line-count gate may occasionally require
  content to be moved to domain instructions or other files.

### Neutral

- No impact on `.github/copilot-instructions.md`, agent personas, prompts,
  or skills — these layers are unchanged.

## References

- Gloaguen, A., Baumann, T., Haller, S., Joulin, D. (2026). "Evaluating
  AGENTS.md: Do Repository-Level Agent Guidelines Help Coding Agents?"
  arXiv:2602.11988. ETH Zurich.
- ADR-018: AI-First Workflow Strategy
- RN-044: Context File Minimalism (product roadmap)
