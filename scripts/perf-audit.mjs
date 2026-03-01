#!/usr/bin/env node

/**
 * Web performance audit — measures Core Web Vitals against defined budgets.
 *
 * Usage:
 *   pnpm test:perf                         # audit http://localhost:3000
 *   pnpm test:perf -- --url=<url>          # audit custom URL
 *   pnpm test:perf -- --json               # emit ripple-perf-report/v1 JSON
 *   pnpm test:perf -- --ci                 # write perf-report.json for CI artifact
 *   pnpm test:perf -- --fail-on=warning    # exit 1 on warning+ (default: critical)
 *
 * Report schema: ripple-perf-report/v1
 * Error taxonomy: RPL-PERF-001 (critical regression), RPL-PERF-002 (warning regression)
 *
 * Zero-dependency (Node 22+, uses Playwright's chromium).
 */

import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'

const args = process.argv.slice(2)
const flagValue = (name) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`))
  return arg ? arg.split('=')[1] : undefined
}
const hasFlag = (name) => args.includes(`--${name}`)

const baseUrl = flagValue('url') || 'http://localhost:3000'
const jsonMode = hasFlag('json')
const ciMode = hasFlag('ci')
const failLevel = flagValue('fail-on') || 'critical'

const routes = ['/', '/auth/login']

// Core Web Vitals budgets (milliseconds for timing, score for CLS)
// Based on Google's "good" / "poor" thresholds for Core Web Vitals
const budgets = {
  lcp: { warning: 2500, critical: 4000, unit: 'ms', label: 'Largest Contentful Paint' },
  fcp: { warning: 1800, critical: 3000, unit: 'ms', label: 'First Contentful Paint' },
  cls: { warning: 0.1, critical: 0.25, unit: 'score', label: 'Cumulative Layout Shift' },
  ttfb: { warning: 800, critical: 1800, unit: 'ms', label: 'Time to First Byte' },
  tbt: { warning: 200, critical: 600, unit: 'ms', label: 'Total Blocking Time' },
}

function classifyMetric(name, value) {
  const budget = budgets[name]
  if (!budget || value === null || value === undefined) return 'unknown'
  if (value > budget.critical) return 'critical'
  if (value > budget.warning) return 'warning'
  return 'good'
}

function formatValue(name, value) {
  if (value === null || value === undefined) return 'N/A'
  const budget = budgets[name]
  if (budget.unit === 'score') return value.toFixed(3)
  return `${Math.round(value)}ms`
}

async function runAudit() {
  const results = []
  let hasCriticalViolations = false
  let hasWarningViolations = false

  const tempDir = mkdtempSync(join(tmpdir(), 'perf-audit-'))

  for (const route of routes) {
    const url = `${baseUrl}${route}`
    // Write Playwright script to temp file to avoid shell injection
    const playwrightScript = `
      const { chromium } = require('@playwright/test');
      const targetUrl = process.env.PERF_TARGET_URL;
      (async () => {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        // Set up long-task observer before navigation for TBT calculation
        await page.addInitScript(() => {
          window.__perfLongTasks = [];
          try {
            const obs = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                window.__perfLongTasks.push(entry.duration);
              }
            });
            obs.observe({ type: 'longtask', buffered: true });
          } catch { /* longtask not supported */ }
        });

        try {
          await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        } catch {
          try {
            await page.goto(targetUrl, { waitUntil: 'load', timeout: 30000 });
          } catch (navErr) {
            process.stdout.write(JSON.stringify({ error: navErr.message }));
            await browser.close();
            return;
          }
        }

        // Wait for LCP to finalize (LCP stops reporting after user input or 2.5s idle)
        await page.waitForTimeout(2000);

        const metrics = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          const paintEntries = performance.getEntriesByType('paint');
          const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');

          // LCP — last entry is the final LCP candidate
          let lcp = null;
          try {
            const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
            if (lcpEntries.length > 0) {
              lcp = lcpEntries[lcpEntries.length - 1].startTime;
            }
          } catch { /* not supported */ }

          // CLS — sum of non-input-driven layout shifts
          let cls = 0;
          try {
            const clsEntries = performance.getEntriesByType('layout-shift');
            cls = clsEntries.reduce((sum, e) => sum + (e.hadRecentInput ? 0 : e.value), 0);
          } catch { /* not supported */ }

          // TBT — sum of (longTask.duration - 50ms) for all long tasks
          const longTasks = window.__perfLongTasks || [];
          const tbt = longTasks.reduce((sum, d) => sum + Math.max(0, d - 50), 0);

          return {
            ttfb: nav ? nav.responseStart : null,
            fcp: fcp ? fcp.startTime : null,
            lcp,
            cls,
            tbt,
            domContentLoaded: nav ? nav.domContentLoadedEventEnd : null,
            load: nav ? nav.loadEventEnd : null,
            transferSize: nav ? nav.transferSize : null,
          };
        });

        await browser.close();
        process.stdout.write(JSON.stringify(metrics));
      })();
    `
    const scriptPath = join(tempDir, `perf-${route.replace(/\//g, '_')}.cjs`)
    writeFileSync(scriptPath, playwrightScript)

    let metrics
    try {
      const output = execFileSync('node', [scriptPath], {
        encoding: 'utf-8',
        timeout: 60000,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PERF_TARGET_URL: url },
      })
      metrics = JSON.parse(output)
    } catch {
      results.push({
        url,
        route,
        status: 'error',
        message: `Could not reach ${url}. Ensure the dev server is running.`,
        metrics: {},
        violations: [],
      })
      continue
    }

    if (metrics.error) {
      results.push({
        url,
        route,
        status: 'error',
        message: metrics.error,
        metrics: {},
        violations: [],
      })
      continue
    }

    // Classify each metric against budgets
    const violations = []
    for (const [name, budget] of Object.entries(budgets)) {
      const value = metrics[name]
      const classification = classifyMetric(name, value)
      if (classification === 'critical') {
        violations.push({
          metric: name,
          label: budget.label,
          value,
          threshold: budget.critical,
          level: 'critical',
          formatted: `${formatValue(name, value)} (budget: ${formatValue(name, budget.critical)})`,
        })
        hasCriticalViolations = true
      } else if (classification === 'warning') {
        violations.push({
          metric: name,
          label: budget.label,
          value,
          threshold: budget.warning,
          level: 'warning',
          formatted: `${formatValue(name, value)} (budget: ${formatValue(name, budget.warning)})`,
        })
        hasWarningViolations = true
      }
    }

    const hasCritical = violations.some((v) => v.level === 'critical')
    const hasWarning = violations.some((v) => v.level === 'warning')

    results.push({
      url,
      route,
      status: hasCritical ? 'fail' : hasWarning ? 'warn' : 'pass',
      metrics: {
        lcp: metrics.lcp,
        fcp: metrics.fcp,
        cls: metrics.cls,
        ttfb: metrics.ttfb,
        tbt: metrics.tbt,
        domContentLoaded: metrics.domContentLoaded,
        load: metrics.load,
        transferSize: metrics.transferSize,
      },
      violations,
    })
  }

  // Clean up temp directory
  try {
    rmSync(tempDir, { recursive: true, force: true })
  } catch {
    /* ignore cleanup errors */
  }

  const shouldFail =
    failLevel === 'warning'
      ? hasCriticalViolations || hasWarningViolations
      : hasCriticalViolations

  const report = {
    schema: 'ripple-perf-report/v1',
    timestamp: new Date().toISOString(),
    baseUrl,
    failLevel,
    budgets,
    routes: results,
    summary: {
      totalRoutes: results.length,
      passed: results.filter((r) => r.status === 'pass').length,
      warned: results.filter((r) => r.status === 'warn').length,
      failed: results.filter((r) => r.status === 'fail').length,
      errored: results.filter((r) => r.status === 'error').length,
      criticalViolations: results.reduce(
        (sum, r) => sum + (r.violations || []).filter((v) => v.level === 'critical').length,
        0,
      ),
      warningViolations: results.reduce(
        (sum, r) => sum + (r.violations || []).filter((v) => v.level === 'warning').length,
        0,
      ),
    },
    exitCode: shouldFail ? 1 : 0,
  }

  return report
}

async function main() {
  const report = await runAudit()

  if (jsonMode || ciMode) {
    const json = JSON.stringify(report, null, 2)

    if (ciMode) {
      const outPath = resolve(process.cwd(), 'perf-report.json')
      writeFileSync(outPath, json)
      process.stderr.write(`Wrote ${outPath}\n`)
    }

    if (jsonMode) {
      process.stdout.write(json + '\n')
    }
  }

  // Human-readable output
  if (!jsonMode) {
    process.stderr.write('\nPerformance Audit — Core Web Vitals\n')
    process.stderr.write('\u2500'.repeat(40) + '\n\n')

    process.stderr.write('Budgets:\n')
    for (const [name, budget] of Object.entries(budgets)) {
      process.stderr.write(
        `  ${budget.label}: warning > ${formatValue(name, budget.warning)}, critical > ${formatValue(name, budget.critical)}\n`,
      )
    }
    process.stderr.write('\n')

    for (const result of report.routes) {
      const icon =
        result.status === 'pass'
          ? '\u2713'
          : result.status === 'warn'
            ? '\u26A0'
            : result.status === 'fail'
              ? '\u2717'
              : '?'
      process.stderr.write(`  ${icon} ${result.route} \u2014 ${result.status}\n`)

      if (result.metrics && Object.keys(result.metrics).length > 0) {
        for (const [name, budget] of Object.entries(budgets)) {
          const value = result.metrics[name]
          const classification = classifyMetric(name, value)
          const marker =
            classification === 'critical'
              ? '\u2717'
              : classification === 'warning'
                ? '\u26A0'
                : '\u2713'
          process.stderr.write(
            `    ${marker} ${budget.label}: ${formatValue(name, value)}\n`,
          )
        }
      }

      if (result.message) {
        process.stderr.write(`    ${result.message}\n`)
      }
      process.stderr.write('\n')
    }

    process.stderr.write(
      `Summary: ${report.summary.passed} passed, ${report.summary.warned} warned, ${report.summary.failed} failed, ${report.summary.errored} errored\n`,
    )
    process.stderr.write(
      `Violations: ${report.summary.criticalViolations} critical, ${report.summary.warningViolations} warning (fail-on: ${failLevel})\n`,
    )
  }

  process.exit(report.exitCode)
}

main().catch((err) => {
  process.stderr.write(`Performance audit failed: ${err.message}\n`)
  process.exit(1)
})
