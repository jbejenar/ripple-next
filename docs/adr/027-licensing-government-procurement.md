# ADR-027: Licensing Resolution — Apache 2.0 for Government Procurement Compatibility

| Field        | Value                          |
| ------------ | ------------------------------ |
| **Status**   | Accepted                       |
| **Date**     | 2026-03-05                     |
| **Deciders** | Platform team                  |
| **Relates**  | ADR-010 (SBOM/provenance), ADR-017 (Upstream strategy), RN-049 (SPDX metadata) |

## Context

Ripple Next is licensed under PolyForm Noncommercial 1.0.0 across all 13
package manifests (root, 11 packages, 1 app). The license explicitly permits use
by "government institutions … regardless of the source of funding" (§ Noncommercial
Organizations), which was the original rationale for choosing it.

However, external critiques and procurement analysis identified a fundamental
problem: **government contractors are commercial entities**. Contractors engaged
by Victorian Government agencies to build, deploy, and operate sites on the
Ripple Next platform would be performing commercial work. The PolyForm
Noncommercial license does not carve out an exception for commercial entities
acting on behalf of government — only the government institution itself is
covered.

### Government Procurement Compatibility Analysis

**Australian Commonwealth Procurement Rules (CPRs):**
The CPRs require that procured software be usable by the purchasing entity and
its contracted service providers. A noncommercial license creates ambiguity about
whether a government contractor (e.g., a systems integrator building a site for
a Victorian department) can legally use the software in the course of paid work.

**Victorian Government ICT Standards:**
The Victorian Government's Digital Standards and ICT procurement framework
encourage the use of open-source software with recognised OSI-approved licenses.
PolyForm Noncommercial is not OSI-approved, which can trigger additional legal
review during procurement.

**Contractor Usage Pattern:**
In practice, government digital platforms are built and maintained by commercial
contractors (systems integrators, consultancies, specialist agencies). The
upstream Ripple 2 platform (`dpc-sdp/ripple`) powers 50+ Victorian Government
websites, all built and maintained by contractors operating under Apache 2.0.
Switching the downstream platform to a noncommercial license breaks this
established workflow.

**SPDX and Supply Chain:**
RN-049 added SPDX license identifiers to all package.json files but did not
resolve the underlying license choice. ADR-010 established CycloneDX SBOM
generation for supply-chain transparency — the SBOM reports whatever license is
declared, so changing the license is a metadata update, not a tooling change.

### Current State

- 13 package.json files declare `"license": "PolyForm-Noncommercial-1.0.0"`
- Root `LICENSE` file contains PolyForm Noncommercial 1.0.0 full text
- `README.md` describes the project as noncommercial with commercial licensing
  available on request
- No commercial license agreements have been executed

## Decision

**Relicense all ripple-next packages and the monorepo root from PolyForm
Noncommercial 1.0.0 to Apache License 2.0.**

### License Selection Criteria

| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| Government procurement compatibility | Critical | Must not block contractor usage |
| OSI-approved | High | Reduces procurement friction and legal review |
| Upstream alignment | High | Upstream Ripple 2 is Apache 2.0 |
| Patent grant | Medium | Protects contributors and users from patent claims |
| Copyleft implications | Medium | Contractors must be able to keep proprietary config |
| SPDX tooling support | Low | All candidates have SPDX identifiers |
| npm ecosystem norms | Low | Convention, not a hard requirement |

### Evaluation Matrix

| Criterion | PolyForm NC | Apache 2.0 | MIT | AGPL 3.0 | Dual-License |
|-----------|:-----------:|:----------:|:---:|:--------:|:------------:|
| Govt procurement compat | Fail | Pass | Pass | Partial | Complex |
| OSI-approved | No | Yes | Yes | Yes | Varies |
| Upstream alignment | Mismatch | Match | Compatible | Incompatible | Varies |
| Patent grant | Yes | Yes | No | Yes | Varies |
| No copyleft friction | Yes | Yes | Yes | No | Varies |
| Simplicity | Simple | Simple | Simple | Simple | Complex |

**Apache 2.0 is the only option that scores "Pass" or "Yes" on every criterion.**

## Alternatives Considered

### Keep PolyForm Noncommercial 1.0.0

Retaining the current license preserves the noncommercial restriction but
perpetuates the procurement barrier. Government contractors cannot use the
platform without a separate commercial license agreement — an agreement that does
not exist and would need to be negotiated per-engagement. This directly conflicts
with the project's goal of being the "golden-path for government digital
platforms" and blocks RN-054 (downstream proof-of-life).

**Rejected:** Procurement incompatibility outweighs noncommercial protection.

### MIT License

MIT is ultra-permissive and widely understood. However, it lacks an explicit
patent grant. For a government platform with potential patent exposure (cloud
infrastructure patterns, authentication flows), Apache 2.0's patent clause
provides meaningful protection that MIT does not. The two licenses are otherwise
functionally equivalent for this project's use case.

**Rejected:** No patent grant; Apache 2.0 provides equivalent permissiveness
with stronger patent protection.

### AGPL 3.0

AGPL's copyleft requirement (modifications to server-side code must be shared)
would deter government contractors who maintain proprietary deployment
configurations, monitoring integrations, and operational tooling. Additionally,
AGPL 3.0 is not compatible with Apache 2.0 in the upstream direction — code
cannot flow from an Apache 2.0 upstream into an AGPL work without relicensing
concerns.

**Rejected:** Copyleft deters contractors; incompatible with Apache 2.0 upstream.

### Dual-License (PolyForm NC + Apache 2.0 for Government)

A dual-license model where government use is Apache 2.0 and all other use is
PolyForm NC adds complexity without clear benefit. Government contractors would
need to determine which license applies to their work (commercial entity doing
government work — which license?). The ambiguity that dual-licensing aims to
resolve is reintroduced at the boundary between the two licenses.

**Rejected:** Unnecessary complexity; Apache 2.0 alone covers all use cases.

## Consequences

### Positive

- Government contractors can use the platform without legal ambiguity
- OSI-approved license removes procurement barriers and reduces legal review
- Matches upstream Ripple 2 (Apache 2.0) — zero license mismatch across the
  ecosystem
- CycloneDX SBOM (ADR-010) reports a standard, universally-recognised license
- Unblocks RN-054 (downstream proof-of-life) and npm publishing
- Patent grant protects contributors and downstream consumers

### Negative

- Loses noncommercial restriction — any entity can use the software commercially
  without a separate agreement
- Cannot later restrict to noncommercial without a new major version and
  contributor consent
- Requires a coordinated update across 13+ files in a single atomic change

### Neutral

- Patent grant provisions are functionally equivalent between PolyForm NC and
  Apache 2.0 — no change in patent protection
- SBOM generation and supply-chain provenance (ADR-010) are unaffected — only
  the reported license identifier changes

## Implementation

All changes applied atomically in a single commit:

- [x] `LICENSE` — replaced with Apache License 2.0 full text
- [x] `package.json` (root) — `"license": "Apache-2.0"`
- [x] 11 × `packages/*/package.json` — `"license": "Apache-2.0"`
- [x] `apps/web/package.json` — `"license": "Apache-2.0"`
- [x] `README.md` — license section updated
- [x] `docs/product-roadmap/README.md` — RN-058 marked Done

## Related

- **ADR-010:** CI Observability and Supply-Chain Provenance — SBOM reports the
  declared license; changing to Apache 2.0 is a metadata update
- **ADR-017:** Upstream Ripple Component Strategy — confirms Apache 2.0 upstream
  permits porting; adopting the same license eliminates cross-license questions
- **RN-049:** Licensing Clarity Guardrail (archived) — added SPDX metadata to
  all packages but deferred the license choice decision to this ADR
- **RN-054:** Downstream Proof-of-Life — blocked by license resolution; now
  unblocked
