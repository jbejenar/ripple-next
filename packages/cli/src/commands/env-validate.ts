import { defineCommand } from 'citty'
import type { EnvValidationResult } from '../types.js'
import { CLI_ERROR_CODES } from '../types.js'
import { resolveRoot, success, failure, runCommand, outputResult } from '../utils.js'

export const envValidateCommand = defineCommand({
  meta: {
    name: 'validate',
    description: 'Validate environment variables (wraps pnpm validate:env)',
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

    const { stdout, stderr, exitCode } = runCommand('pnpm', ['validate:env'], root)

    if (exitCode === 0) {
      const data: EnvValidationResult = {
        valid: true,
        errors: [],
        warnings: extractWarnings(stdout),
      }
      const result = success('env validate', data, startTime)
      outputResult(result, args)
    } else {
      const errors = extractErrors(stdout + stderr)
      const data: EnvValidationResult = {
        valid: false,
        errors,
        warnings: extractWarnings(stdout),
      }

      if (errors.length > 0) {
        const result = failure(
          'env validate',
          CLI_ERROR_CODES.EXECUTION_FAILED,
          `Environment validation failed: ${errors.length} error(s)`,
          startTime,
          'Run pnpm validate:env for details. Check .env.example for required variables.'
        )
        result.data = data
        outputResult(result, args)
      } else {
        const result = failure(
          'env validate',
          CLI_ERROR_CODES.EXECUTION_FAILED,
          `Environment validation failed with exit code ${exitCode}`,
          startTime,
          'Run pnpm validate:env for details.'
        )
        result.data = data
        outputResult(result, args)
      }

      process.exitCode = 1
    }
  },
})

function extractErrors(output: string): string[] {
  return output
    .split('\n')
    .filter((line) => /error|missing|invalid|required/i.test(line))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function extractWarnings(output: string): string[] {
  return output
    .split('\n')
    .filter((line) => /warn|optional/i.test(line))
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}
