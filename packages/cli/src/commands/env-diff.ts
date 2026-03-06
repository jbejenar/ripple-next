import { defineCommand } from 'citty'
import { resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import type { EnvDiffEntry } from '../types.js'
import { CLI_ERROR_CODES } from '../types.js'
import { resolveRoot, success, failure, outputResult } from '../utils.js'

export const envDiffCommand = defineCommand({
  meta: {
    name: 'diff',
    description: 'Compare environment variables between stages',
  },
  args: {
    left: {
      type: 'string',
      description: 'Left stage or .env file (e.g., "dev" or ".env.dev")',
      required: true,
    },
    right: {
      type: 'string',
      description: 'Right stage or .env file (e.g., "staging" or ".env.staging")',
      required: true,
    },
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

    const leftPath = resolveEnvPath(root, args.left)
    const rightPath = resolveEnvPath(root, args.right)

    if (!existsSync(leftPath)) {
      const result = failure(
        'env diff',
        CLI_ERROR_CODES.MISSING_ARGUMENT,
        `Left env file not found: ${leftPath}`,
        startTime,
        `Create the file or use a valid stage name.`
      )
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    if (!existsSync(rightPath)) {
      const result = failure(
        'env diff',
        CLI_ERROR_CODES.MISSING_ARGUMENT,
        `Right env file not found: ${rightPath}`,
        startTime,
        `Create the file or use a valid stage name.`
      )
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    const leftVars = parseEnvFile(leftPath)
    const rightVars = parseEnvFile(rightPath)

    const allKeys = new Set([...Object.keys(leftVars), ...Object.keys(rightVars)])
    const diffs: EnvDiffEntry[] = []

    for (const key of [...allKeys].sort()) {
      const leftVal = leftVars[key]
      const rightVal = rightVars[key]

      if (leftVal !== undefined && rightVal === undefined) {
        diffs.push({ key, left: maskValue(leftVal), status: 'removed' })
      } else if (leftVal === undefined && rightVal !== undefined) {
        diffs.push({ key, right: maskValue(rightVal), status: 'added' })
      } else if (leftVal !== rightVal) {
        diffs.push({ key, left: maskValue(leftVal), right: maskValue(rightVal), status: 'changed' })
      } else {
        diffs.push({ key, status: 'same' })
      }
    }

    const changes = diffs.filter((d) => d.status !== 'same')
    const result = success(
      'env diff',
      {
        left: args.left,
        right: args.right,
        totalKeys: allKeys.size,
        changes: changes.length,
        diffs: args.verbose ? diffs : changes,
      },
      startTime
    )

    outputResult(result, args)

    if (!args.json) {
      for (const d of changes) {
        const symbol = d.status === 'added' ? '+' : d.status === 'removed' ? '-' : '~'
        process.stdout.write(`  [${symbol}] ${d.key}: ${formatDiffEntry(d)}\n`)
      }
      if (changes.length === 0) {
        process.stdout.write('  No differences found.\n')
      }
    }
  },
})

function resolveEnvPath(root: string, stage: string): string {
  // If it looks like a file path, use it directly
  if (stage.startsWith('.') || stage.startsWith('/')) {
    return resolve(root, stage)
  }
  // Otherwise treat as a stage name
  return resolve(root, `.env.${stage}`)
}

function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf-8')
  const vars: Record<string, string> = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    // Remove surrounding quotes
    vars[key] = value.replace(/^["']|["']$/g, '')
  }

  return vars
}

function maskValue(value: string | undefined): string {
  if (value === undefined) return '(undefined)'
  if (value.length <= 4) return '****'
  return value.slice(0, 2) + '****' + value.slice(-2)
}

function formatDiffEntry(entry: EnvDiffEntry): string {
  switch (entry.status) {
    case 'added':
      return `(new) ${entry.right ?? ''}`
    case 'removed':
      return `(removed) was ${entry.left ?? ''}`
    case 'changed':
      return `${entry.left ?? ''} -> ${entry.right ?? ''}`
    default:
      return 'same'
  }
}
