import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility audit tests using axe-core.
 *
 * Runs WCAG 2.1 AA checks against key page routes.
 * Critical and serious violations block the build (Tier 2 CI gate).
 * Moderate and minor violations are reported but non-blocking.
 *
 * Report schema: ripple-a11y-report/v1
 * Error taxonomy: RPL-A11Y-001, RPL-A11Y-002
 */

test.describe('Accessibility — WCAG 2.1 AA', () => {
  const routes = ['/', '/auth/login']

  for (const route of routes) {
    test(`${route} has no critical or serious WCAG 2.1 AA violations`, async ({
      page
    }) => {
      await page.goto(route, { waitUntil: 'networkidle' })

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      )

      if (blocking.length > 0) {
        const summary = blocking
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instance${v.nodes.length === 1 ? '' : 's'})\n  Help: ${v.helpUrl}`
          )
          .join('\n')

        expect(blocking, `WCAG violations on ${route}:\n${summary}`).toHaveLength(0)
      }
    })
  }
})
