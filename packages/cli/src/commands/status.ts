import { defineCommand } from 'citty'
import { resolve } from 'node:path'
import type { SubsystemStatus } from '../types.js'
import { CLI_ERROR_CODES } from '../types.js'
import { resolveRoot, success, failure, readJsonFile, outputResult } from '../utils.js'

interface ReadinessManifest {
  subsystems: Record<
    string,
    {
      status: string
      maturity: string
      description: string
      blockers: string[]
    }
  >
}

export const statusCommand = defineCommand({
  meta: {
    name: 'status',
    description: 'Platform health check — shows subsystem statuses from readiness.json',
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
    const readinessPath = resolve(root, 'docs/readiness.json')

    const manifest = readJsonFile<ReadinessManifest>(readinessPath)

    if (!manifest) {
      const result = failure(
        'status',
        CLI_ERROR_CODES.EXECUTION_FAILED,
        'Could not read docs/readiness.json',
        startTime,
        'Ensure docs/readiness.json exists. Run pnpm check:readiness to validate.'
      )
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    const subsystems: SubsystemStatus[] = Object.entries(manifest.subsystems).map(
      ([name, info]) => ({
        name,
        status: info.status,
        maturity: info.maturity,
        description: info.description,
        blockers: info.blockers,
      })
    )

    const hasBlockers = subsystems.some((s) => s.blockers.length > 0)
    const result = success('status', { subsystems, healthy: !hasBlockers }, startTime)

    outputResult(result, args)

    if (!args.json && !args.verbose) {
      for (const s of subsystems) {
        const icon = s.blockers.length === 0 ? 'OK' : 'BLOCKED'
        process.stdout.write(`  [${icon}] ${s.name}: ${s.status} (${s.maturity})\n`)
        if (s.blockers.length > 0) {
          for (const b of s.blockers) {
            process.stdout.write(`       - ${b}\n`)
          }
        }
      }
    }
  },
})
