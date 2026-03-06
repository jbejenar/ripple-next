import { defineCommand } from 'citty'
import type { VerifySummary } from '../types.js'
import { CLI_ERROR_CODES } from '../types.js'
import { resolveRoot, success, failure, runCommand, outputResult } from '../utils.js'

export const verifyCommand = defineCommand({
  meta: {
    name: 'verify',
    description: 'Full quality gate (wraps pnpm verify)',
  },
  args: {
    json: {
      type: 'boolean',
      description: 'Output as JSON CommandResult',
      default: false,
    },
    verbose: {
      type: 'boolean',
      description: 'Show detailed output',
      default: false,
    },
  },
  run({ args }) {
    const startTime = Date.now()
    const root = resolveRoot()

    // Run pnpm verify with --json to get structured output
    const { stdout, stderr, exitCode } = runCommand(
      'pnpm',
      ['verify', '--', '--json'],
      root,
      600_000 // 10 minute timeout for full verify
    )

    let verifySummary: VerifySummary | undefined
    try {
      verifySummary = JSON.parse(stdout.trim()) as VerifySummary
    } catch {
      // Could not parse JSON output
    }

    if (verifySummary) {
      if (verifySummary.status === 'pass') {
        const result = success(
          'verify',
          {
            status: verifySummary.status,
            passed: verifySummary.passed,
            failed: verifySummary.failed,
            total: verifySummary.total,
            gates: verifySummary.gates,
          },
          startTime
        )
        outputResult(result, args)
      } else {
        const failedGates = verifySummary.gates
          .filter((g) => g.status === 'fail')
          .map((g) => g.gate)

        const result = failure(
          'verify',
          CLI_ERROR_CODES.EXECUTION_FAILED,
          `Quality gate failed: ${failedGates.join(', ')}`,
          startTime,
          `Fix the failing gates and re-run: pnpm rip verify`
        )
        result.data = {
          status: verifySummary.status,
          passed: verifySummary.passed,
          failed: verifySummary.failed,
          total: verifySummary.total,
          gates: verifySummary.gates,
        }
        outputResult(result, args)
        process.exitCode = 1
      }
    } else {
      // Could not parse structured output; report raw result
      if (exitCode === 0) {
        const result = success(
          'verify',
          { rawOutput: stdout.trim() },
          startTime
        )
        outputResult(result, args)
      } else {
        const result = failure(
          'verify',
          CLI_ERROR_CODES.JSON_PARSE_ERROR,
          `Could not parse verify output. Exit code: ${exitCode}`,
          startTime,
          'Run pnpm verify directly for raw output.'
        )
        result.data = { rawOutput: (stdout + stderr).trim() }
        outputResult(result, args)
        process.exitCode = 1
      }
    }
  },
})
