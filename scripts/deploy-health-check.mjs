#!/usr/bin/env node
// ──────────────────────────────────────────────────────────────────────
// Post-Deploy Health Check — validates service health after deployment.
//
// Usage:
//   node scripts/deploy-health-check.mjs <url> [options]
//   node scripts/deploy-health-check.mjs https://staging.example.com
//   node scripts/deploy-health-check.mjs https://staging.example.com --retries=5 --interval=10
//   node scripts/deploy-health-check.mjs https://staging.example.com --json
//   node scripts/deploy-health-check.mjs https://staging.example.com --output=health-report.json
//
// Exit codes:
//   0 — health check passed (status: ok or degraded)
//   1 — health check failed (status: unhealthy or unreachable)
//
// The script polls /api/health with retries to allow for cold starts and
// eventual consistency. Reports include latency, check details, and
// deployment metadata for CI artifact capture.
// ──────────────────────────────────────────────────────────────────────

import { writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const baseUrl = args.find((a) => !a.startsWith('--'))
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [key, val] = a.replace(/^--/, '').split('=')
      return [key, val ?? 'true']
    })
)

const retries = parseInt(flags.retries ?? '3', 10)
const interval = parseInt(flags.interval ?? '5', 10)
const jsonMode = flags.json === 'true'
const outputPath = flags.output

if (!baseUrl) {
  process.stderr.write(
    'Usage: node scripts/deploy-health-check.mjs <base-url> [--retries=3] [--interval=5] [--json] [--output=path]\n'
  )
  process.exit(1)
}

const healthUrl = `${baseUrl.replace(/\/$/, '')}/api/health`

async function checkHealth() {
  const start = Date.now()
  try {
    const response = await fetch(healthUrl, {
      signal: AbortSignal.timeout(10000),
    })
    const body = await response.json()
    const latencyMs = Date.now() - start
    return {
      reachable: true,
      statusCode: response.status,
      latencyMs,
      body,
    }
  } catch (err) {
    const latencyMs = Date.now() - start
    return {
      reachable: false,
      statusCode: 0,
      latencyMs,
      error: err.message,
    }
  }
}

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

async function main() {
  const startTime = new Date().toISOString()
  const attempts = []

  if (!jsonMode) {
    process.stdout.write(`Post-Deploy Health Check\n`)
    process.stdout.write(`────────────────────────\n`)
    process.stdout.write(`Target: ${healthUrl}\n`)
    process.stdout.write(`Retries: ${retries}, Interval: ${interval}s\n\n`)
  }

  let lastResult = null

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    if (!jsonMode) {
      process.stdout.write(`Attempt ${attempt}/${retries + 1}... `)
    }

    const result = await checkHealth()
    lastResult = result
    attempts.push({
      attempt,
      timestamp: new Date().toISOString(),
      ...result,
    })

    if (result.reachable && result.body?.status === 'ok') {
      if (!jsonMode) {
        process.stdout.write(`OK (${result.latencyMs}ms)\n`)
      }
      break
    }

    if (result.reachable && result.body?.status === 'degraded') {
      if (!jsonMode) {
        process.stdout.write(`DEGRADED (${result.latencyMs}ms)\n`)
      }
      // Degraded is acceptable — don't retry
      break
    }

    if (!jsonMode) {
      if (!result.reachable) {
        process.stdout.write(`UNREACHABLE (${result.error})\n`)
      } else {
        process.stdout.write(
          `UNHEALTHY (status: ${result.body?.status}, ${result.latencyMs}ms)\n`
        )
      }
    }

    if (attempt <= retries) {
      if (!jsonMode) {
        process.stdout.write(`  Waiting ${interval}s before retry...\n`)
      }
      await sleep(interval)
    }
  }

  const endTime = new Date().toISOString()
  const passed =
    lastResult?.reachable &&
    (lastResult.body?.status === 'ok' ||
      lastResult.body?.status === 'degraded')

  const report = {
    schema: 'ripple-health-report/v1',
    url: healthUrl,
    startTime,
    endTime,
    status: passed ? 'pass' : 'fail',
    finalStatus: lastResult?.body?.status ?? 'unreachable',
    attempts,
    checks: lastResult?.body?.checks ?? null,
    metadata: {
      commit: process.env.GITHUB_SHA ?? null,
      stage: process.env.SST_STAGE ?? null,
      workflow: process.env.GITHUB_WORKFLOW ?? null,
      runId: process.env.GITHUB_RUN_ID ?? null,
    },
    rollbackTrigger: !passed
      ? {
          reason: lastResult?.reachable
            ? `Health status: ${lastResult.body?.status}`
            : `Service unreachable: ${lastResult?.error}`,
          taxonomyCode: 'RPL-DEPLOY-001',
          remediation: [
            'Check CloudWatch logs for the deployed stage',
            'Verify environment variables are correctly set',
            'Run: pnpm runbook rollback-production',
            'If DB migration failed: check pnpm db:migrate output',
          ],
        }
      : null,
  }

  if (jsonMode) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n')
  } else {
    process.stdout.write(`\n────────────────────────\n`)
    if (passed) {
      process.stdout.write(
        `Result: PASS (${lastResult.body?.status})\n`
      )
      if (lastResult.body?.checks) {
        for (const [name, check] of Object.entries(lastResult.body.checks)) {
          process.stdout.write(
            `  ${name}: ${check.status}${check.latencyMs ? ` (${check.latencyMs}ms)` : ''}\n`
          )
        }
      }
    } else {
      process.stdout.write(`Result: FAIL\n`)
      process.stdout.write(`Reason: ${report.rollbackTrigger?.reason}\n`)
      process.stdout.write(`\nRemediation:\n`)
      for (const step of report.rollbackTrigger?.remediation ?? []) {
        process.stdout.write(`  → ${step}\n`)
      }
    }
  }

  if (outputPath) {
    writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n')
    if (!jsonMode) {
      process.stdout.write(`\nReport written to ${outputPath}\n`)
    }
  }

  process.exit(passed ? 0 : 1)
}

main()
