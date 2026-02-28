#!/usr/bin/env node

/**
 * Accessibility audit script — runs axe-core against a target URL or Storybook.
 *
 * Usage:
 *   pnpm test:a11y                         # audit http://localhost:3000
 *   pnpm test:a11y -- --url=<url>          # audit custom URL
 *   pnpm test:a11y -- --json               # emit ripple-a11y-report/v1 JSON
 *   pnpm test:a11y -- --ci                 # write a11y-report.json for CI artifact
 *   pnpm test:a11y -- --fail-on=serious    # exit 1 on serious+ (default: serious)
 *
 * Report schema: ripple-a11y-report/v1
 * Error taxonomy: RPL-A11Y-001 (critical/serious), RPL-A11Y-002 (moderate/minor)
 *
 * Zero-dependency (Node 22+, uses Playwright's chromium).
 */

import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const flagValue = (name) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`))
  return arg ? arg.split('=')[1] : undefined
}
const hasFlag = (name) => args.includes(`--${name}`)

const baseUrl = flagValue('url') || 'http://localhost:3000'
const jsonMode = hasFlag('json')
const ciMode = hasFlag('ci')
const failLevel = flagValue('fail-on') || 'serious'

const routes = ['/', '/auth/login']

const impactOrder = { critical: 4, serious: 3, moderate: 2, minor: 1 }
const failThreshold = impactOrder[failLevel] || 3

async function runAudit() {
  const results = []
  let hasBlockingViolations = false

  for (const route of routes) {
    const url = `${baseUrl}${route}`
    const playwrightScript = `
      const { chromium } = require('@playwright/test');
      const AxeBuilder = require('@axe-core/playwright').default;
      (async () => {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        try {
          await page.goto('${url}', { waitUntil: 'networkidle', timeout: 15000 });
        } catch {
          await page.goto('${url}', { waitUntil: 'load', timeout: 15000 });
        }
        const axeResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        await browser.close();
        process.stdout.write(JSON.stringify(axeResults));
      })();
    `

    let axeResults
    try {
      const output = execSync(`node -e "${playwrightScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
        encoding: 'utf-8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe']
      })
      axeResults = JSON.parse(output)
    } catch {
      results.push({
        url,
        route,
        status: 'error',
        message: `Could not reach ${url}. Ensure the dev server is running.`,
        violations: [],
        passes: 0
      })
      continue
    }

    const violations = axeResults.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      wcagTags: v.tags.filter((t) => t.startsWith('wcag')),
      nodes: v.nodes.map((n) => ({
        html: n.html.substring(0, 200),
        target: n.target,
        failureSummary: n.failureSummary
      })),
      instanceCount: v.nodes.length
    }))

    const blocking = violations.filter(
      (v) => (impactOrder[v.impact] || 0) >= failThreshold
    )

    if (blocking.length > 0) {
      hasBlockingViolations = true
    }

    results.push({
      url,
      route,
      status: blocking.length > 0 ? 'fail' : violations.length > 0 ? 'warn' : 'pass',
      violations,
      blockingCount: blocking.length,
      totalViolations: violations.length,
      passes: axeResults.passes.length,
      inapplicable: axeResults.inapplicable.length
    })
  }

  const report = {
    schema: 'ripple-a11y-report/v1',
    timestamp: new Date().toISOString(),
    baseUrl,
    failLevel,
    wcagStandard: 'WCAG 2.1 AA',
    routes: results,
    summary: {
      totalRoutes: results.length,
      passed: results.filter((r) => r.status === 'pass').length,
      warned: results.filter((r) => r.status === 'warn').length,
      failed: results.filter((r) => r.status === 'fail').length,
      errored: results.filter((r) => r.status === 'error').length,
      totalViolations: results.reduce((sum, r) => sum + (r.totalViolations || 0), 0),
      blockingViolations: results.reduce(
        (sum, r) => sum + (r.blockingCount || 0),
        0
      )
    },
    exitCode: hasBlockingViolations ? 1 : 0
  }

  return report
}

async function main() {
  const report = await runAudit()

  if (jsonMode || ciMode) {
    const json = JSON.stringify(report, null, 2)

    if (ciMode) {
      const outPath = resolve(process.cwd(), 'a11y-report.json')
      writeFileSync(outPath, json)
      process.stderr.write(`Wrote ${outPath}\n`)
    }

    if (jsonMode) {
      process.stdout.write(json + '\n')
    }
  }

  // Human-readable output
  if (!jsonMode) {
    process.stderr.write('\nAccessibility Audit — WCAG 2.1 AA\n')
    process.stderr.write('─'.repeat(40) + '\n\n')

    for (const result of report.routes) {
      const icon =
        result.status === 'pass'
          ? '\u2713'
          : result.status === 'warn'
            ? '\u26A0'
            : result.status === 'fail'
              ? '\u2717'
              : '?'
      process.stderr.write(`  ${icon} ${result.route} — ${result.status}`)
      if (result.totalViolations > 0) {
        process.stderr.write(
          ` (${result.totalViolations} violation${result.totalViolations === 1 ? '' : 's'}, ${result.blockingCount} blocking)`
        )
      }
      process.stderr.write('\n')

      if (result.violations && result.violations.length > 0) {
        for (const v of result.violations) {
          const marker =
            (impactOrder[v.impact] || 0) >= failThreshold ? '\u2717' : '\u26A0'
          process.stderr.write(
            `    ${marker} [${v.impact}] ${v.id}: ${v.description} (${v.instanceCount} node${v.instanceCount === 1 ? '' : 's'})\n`
          )
          process.stderr.write(`      ${v.helpUrl}\n`)
        }
      }
    }

    process.stderr.write(
      `\nSummary: ${report.summary.passed} passed, ${report.summary.warned} warned, ${report.summary.failed} failed, ${report.summary.errored} errored\n`
    )
    process.stderr.write(
      `Violations: ${report.summary.totalViolations} total, ${report.summary.blockingViolations} blocking (fail-on: ${failLevel})\n`
    )
  }

  process.exit(report.exitCode)
}

main().catch((err) => {
  process.stderr.write(`Accessibility audit failed: ${err.message}\n`)
  process.exit(1)
})
