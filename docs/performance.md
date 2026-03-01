# Performance — Core Web Vitals Budgets

> This document describes the performance audit pipeline, Core Web Vitals
> budgets, and remediation workflows for AI agents and human developers.

## Standard

All Ripple Next pages must meet Google's **Core Web Vitals "good"** thresholds.
Government platforms have performance obligations — slow pages reduce citizen
access and erode trust.

## Performance Budgets

| Metric | Good | Warning | Critical | Description |
|--------|------|---------|----------|-------------|
| LCP | <= 2500ms | > 2500ms | > 4000ms | Largest Contentful Paint — main content visible |
| FCP | <= 1800ms | > 1800ms | > 3000ms | First Contentful Paint — first render |
| CLS | < 0.1 | >= 0.1 | >= 0.25 | Cumulative Layout Shift — visual stability |
| TTFB | <= 800ms | > 800ms | > 1800ms | Time to First Byte — server responsiveness |
| TBT | <= 200ms | > 200ms | > 600ms | Total Blocking Time — main thread availability |

Budgets are based on [Google's Core Web Vitals thresholds](https://web.dev/articles/vitals)
at the 75th percentile. TBT serves as a lab proxy for INP (Interaction to Next
Paint), which requires real user interaction to measure.

## Audit Pipeline

The performance pipeline mirrors the accessibility audit pattern:

### 1. E2E Page-Level (Playwright)

Playwright E2E tests measure Core Web Vitals via the browser's Performance API
against rendered pages. Critical regressions fail the test.

```bash
pnpm test:e2e      # includes performance checks
```

### 2. Standalone Audit (pnpm test:perf)

A dedicated audit script scans configured routes and emits a structured JSON
report (`ripple-perf-report/v1`).

```bash
pnpm test:perf                         # audit localhost:3000
pnpm test:perf -- --url=https://...    # audit custom URL
pnpm test:perf -- --json               # machine-readable JSON to stdout
pnpm test:perf -- --ci                 # write perf-report.json for CI artifact
pnpm test:perf -- --fail-on=critical   # default: exit 1 on critical violations
pnpm test:perf -- --fail-on=warning    # stricter: exit 1 on warning+ violations
```

## CI Integration

Performance checks run as part of the **Tier 2 CI** pipeline:

- The `e2e` job runs the standalone audit after E2E tests complete
- Critical regressions are reported (non-blocking by default, `|| true`)
- The `perf-report` artifact is uploaded with 30-day retention
- Review reports to catch regressions before they compound

## Report Schema

The `ripple-perf-report/v1` JSON schema:

```json
{
  "schema": "ripple-perf-report/v1",
  "timestamp": "ISO-8601",
  "baseUrl": "http://localhost:3000",
  "failLevel": "critical",
  "budgets": {
    "lcp": { "warning": 2500, "critical": 4000, "unit": "ms" },
    "fcp": { "warning": 1800, "critical": 3000, "unit": "ms" },
    "cls": { "warning": 0.1, "critical": 0.25, "unit": "score" },
    "ttfb": { "warning": 800, "critical": 1800, "unit": "ms" },
    "tbt": { "warning": 200, "critical": 600, "unit": "ms" }
  },
  "routes": [
    {
      "url": "http://localhost:3000/",
      "route": "/",
      "status": "pass | warn | fail | error",
      "metrics": {
        "lcp": 1200,
        "fcp": 800,
        "cls": 0.02,
        "ttfb": 150,
        "tbt": 50
      },
      "violations": []
    }
  ],
  "summary": {
    "totalRoutes": 2,
    "passed": 2,
    "warned": 0,
    "failed": 0,
    "errored": 0,
    "criticalViolations": 0,
    "warningViolations": 0
  },
  "exitCode": 0
}
```

## Error Taxonomy

| Code | Severity | Message | Remediation |
|------|----------|---------|-------------|
| RPL-PERF-001 | error | Critical Core Web Vitals regression | Fix the metric using the guidance below. Run `pnpm test:perf -- --json` for details. |
| RPL-PERF-002 | warning | Moderate Core Web Vitals regression | Review and optimise. Non-blocking but should be addressed before reaching critical. |

## Remediation Guide

**LCP (Largest Contentful Paint)**
- Preload critical resources (`<link rel="preload">`)
- Optimise and compress images (WebP/AVIF, proper sizing)
- Remove render-blocking CSS/JS
- Use SSR for above-the-fold content (Nuxt default)

**FCP (First Contentful Paint)**
- Reduce server response time (TTFB improvements cascade to FCP)
- Inline critical CSS, defer non-critical stylesheets
- Minimise redirects

**CLS (Cumulative Layout Shift)**
- Set explicit `width`/`height` on images and embeds
- Reserve space for dynamic content (skeleton screens)
- Avoid injecting content above the fold after initial render
- Use CSS `contain` for layout isolation

**TTFB (Time to First Byte)**
- Enable response caching (CDN, server-side cache)
- Optimise database queries and API calls
- Reduce server-side processing (efficient SSR)

**TBT (Total Blocking Time)**
- Break up long tasks (> 50ms) into smaller chunks
- Defer non-critical JavaScript (`<script defer>`)
- Use web workers for heavy computation
- Reduce third-party script impact
