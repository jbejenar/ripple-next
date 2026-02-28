# Accessibility — WCAG 2.1 AA Compliance

> This document describes the accessibility audit pipeline, WCAG compliance
> requirements, and remediation workflows for AI agents and human developers.

## Standard

All Ripple Next components and pages must conform to **WCAG 2.1 Level AA**.
This is a government platform requirement — accessibility is non-negotiable.

## Audit Pipeline

The accessibility pipeline has three layers:

### 1. Component-Level (Storybook)

The `@storybook/addon-a11y` panel runs axe-core checks on every component story
in real time during development.

```bash
pnpm storybook     # open Storybook — a11y tab shows violations per story
```

Every component story should have zero violations in the a11y panel. Fix
violations before committing.

### 2. E2E Page-Level (Playwright + axe-core)

Playwright E2E tests (`apps/web/tests/e2e/accessibility.spec.ts`) run axe-core
against rendered pages. Critical and serious violations fail the test.

```bash
pnpm test:e2e      # includes accessibility specs
```

### 3. Standalone Audit (pnpm test:a11y)

A dedicated audit script scans configured routes and emits a structured JSON
report (`ripple-a11y-report/v1`).

```bash
pnpm test:a11y                         # audit localhost:3000
pnpm test:a11y -- --url=https://…      # audit custom URL
pnpm test:a11y -- --json               # machine-readable JSON to stdout
pnpm test:a11y -- --ci                 # write a11y-report.json for CI artifact
pnpm test:a11y -- --fail-on=serious    # default: exit 1 on serious+ violations
pnpm test:a11y -- --fail-on=moderate   # stricter: exit 1 on moderate+ violations
```

## CI Integration

Accessibility checks run as part of the **Tier 2 CI** pipeline:

- The `e2e` job includes `accessibility.spec.ts` which runs axe-core checks
- The dedicated `a11y` CI job runs the standalone audit and uploads the report
- Critical/serious violations block the build
- Moderate/minor violations are reported but non-blocking
- The `a11y-report` artifact is uploaded with 30-day retention

## Report Schema

The `ripple-a11y-report/v1` JSON schema:

```json
{
  "schema": "ripple-a11y-report/v1",
  "timestamp": "ISO-8601",
  "baseUrl": "http://localhost:3000",
  "failLevel": "serious",
  "wcagStandard": "WCAG 2.1 AA",
  "routes": [
    {
      "url": "http://localhost:3000/",
      "route": "/",
      "status": "pass | warn | fail | error",
      "violations": [
        {
          "id": "color-contrast",
          "impact": "serious",
          "description": "…",
          "help": "…",
          "helpUrl": "https://dequeuniversity.com/…",
          "wcagTags": ["wcag2aa", "wcag143"],
          "nodes": [{ "html": "…", "target": ["selector"], "failureSummary": "…" }],
          "instanceCount": 1
        }
      ],
      "blockingCount": 0,
      "totalViolations": 0,
      "passes": 42,
      "inapplicable": 18
    }
  ],
  "summary": {
    "totalRoutes": 2,
    "passed": 2,
    "warned": 0,
    "failed": 0,
    "errored": 0,
    "totalViolations": 0,
    "blockingViolations": 0
  },
  "exitCode": 0
}
```

## Error Taxonomy

| Code | Severity | Message | Remediation |
|------|----------|---------|-------------|
| RPL-A11Y-001 | error | Critical/serious WCAG violation | Fix the violation using guidance from the helpUrl. Run `pnpm test:a11y -- --json` for details. |
| RPL-A11Y-002 | warning | Moderate/minor WCAG violation | Review and fix when possible. Non-blocking but should be addressed. |

## Component Checklist

When building new components, verify:

- [ ] Semantic HTML elements used (not div-soup)
- [ ] All interactive elements keyboard-accessible (Tab, Enter, Escape, Arrow keys)
- [ ] Focus management: visible focus indicator, logical tab order
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for large text)
- [ ] Images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages use `role="alert"` or `aria-live="assertive"`
- [ ] `aria-*` attributes used correctly (prefer native semantics first)
- [ ] SkipLink component included in layouts (WCAG 2.4.1)
- [ ] Storybook a11y panel shows zero violations

## Existing Accessibility Patterns

The codebase already implements several accessibility patterns:

- **RplSkipLink** — Skip-to-content link (WCAG 2.4.1)
- **RplTable** — Semantic `<table>` with `<caption>`, `scope`, `aria-sort`
- **RplOptionButton** — Hidden radio inputs, fieldset/legend grouping, `aria-invalid`
- **RplBreadcrumb** — `<nav aria-label="breadcrumb">` with structured list
- **RplPagination** — `aria-label`, `aria-current` for current page
- **RplInPageNavigation** — Landmark navigation with `aria-label`
- **RplAlert/Callout** — `role="alert"` for important messages
- **Form components** — Associated labels, `aria-invalid`, `aria-describedby` for errors
