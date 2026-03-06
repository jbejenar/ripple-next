import { describe, it, expect } from 'vitest'
import type {
  CommandResult,
  VerifySummary,
  EnvDiffEntry,
  SecretStatus,
  SecretsAuditResult,
  DeployPhase,
  DeployResult,
} from '../src/types.js'
import { CLI_ERROR_CODES } from '../src/types.js'
import { success, failure } from '../src/utils.js'

describe('CommandResult shape', () => {
  it('success result has correct shape', () => {
    const result = success('test-command', { foo: 'bar' }, Date.now() - 100)

    expect(result.ok).toBe(true)
    expect(result.command).toBe('test-command')
    expect(result.data).toEqual({ foo: 'bar' })
    expect(result.error).toBeUndefined()
    expect(typeof result.duration).toBe('number')
    expect(result.duration).toBeGreaterThanOrEqual(0)
    expect(typeof result.timestamp).toBe('string')
    // ISO-8601 format check
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp)
  })

  it('failure result has correct shape', () => {
    const result = failure(
      'test-command',
      CLI_ERROR_CODES.EXECUTION_FAILED,
      'Something went wrong',
      Date.now() - 50,
      'Try again'
    )

    expect(result.ok).toBe(false)
    expect(result.command).toBe('test-command')
    expect(result.data).toBeUndefined()
    expect(result.error).toBeDefined()
    expect(result.error?.code).toBe('RPL-CLI-003')
    expect(result.error?.message).toBe('Something went wrong')
    expect(result.error?.suggestion).toBe('Try again')
    expect(typeof result.duration).toBe('number')
    expect(typeof result.timestamp).toBe('string')
  })

  it('failure result without suggestion omits it', () => {
    const result = failure(
      'test-command',
      CLI_ERROR_CODES.UNKNOWN_COMMAND,
      'Unknown command',
      Date.now()
    )

    expect(result.error?.suggestion).toBeUndefined()
  })

  it('duration is always non-negative', () => {
    const start = Date.now()
    const result = success('test', null, start)
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })
})

describe('CLI_ERROR_CODES', () => {
  it('has all required error codes', () => {
    expect(CLI_ERROR_CODES.UNKNOWN_COMMAND).toBe('RPL-CLI-001')
    expect(CLI_ERROR_CODES.MISSING_ARGUMENT).toBe('RPL-CLI-002')
    expect(CLI_ERROR_CODES.EXECUTION_FAILED).toBe('RPL-CLI-003')
    expect(CLI_ERROR_CODES.JSON_PARSE_ERROR).toBe('RPL-CLI-004')
    expect(CLI_ERROR_CODES.COMMAND_NOT_FOUND).toBe('RPL-CLI-005')
    expect(CLI_ERROR_CODES.SECRETS_NOT_FOUND).toBe('RPL-CLI-006')
    expect(CLI_ERROR_CODES.DEPLOY_FAILED).toBe('RPL-CLI-007')
  })

  it('all codes follow RPL-CLI-NNN format', () => {
    for (const code of Object.values(CLI_ERROR_CODES)) {
      expect(code).toMatch(/^RPL-CLI-\d{3}$/)
    }
  })
})

describe('CommandResult type compatibility', () => {
  it('accepts generic data types', () => {
    const stringResult: CommandResult<string> = success('test', 'hello', Date.now())
    expect(stringResult.data).toBe('hello')

    const numberResult: CommandResult<number> = success('test', 42, Date.now())
    expect(numberResult.data).toBe(42)

    const objectResult: CommandResult<{ items: string[] }> = success(
      'test',
      { items: ['a', 'b'] },
      Date.now()
    )
    expect(objectResult.data?.items).toHaveLength(2)
  })
})

describe('status command output shape', () => {
  it('produces valid CommandResult with subsystem data', () => {
    const result = success(
      'status',
      {
        subsystems: [
          {
            name: 'auth',
            status: 'implemented',
            maturity: 'integration-tested',
            description: 'Auth provider',
            blockers: [],
          },
        ],
        healthy: true,
      },
      Date.now()
    )

    expect(result.ok).toBe(true)
    expect(result.command).toBe('status')
    expect(result.data?.subsystems).toHaveLength(1)
    expect(result.data?.healthy).toBe(true)
  })
})

describe('env validate command output shape', () => {
  it('produces valid CommandResult for successful validation', () => {
    const result = success(
      'env validate',
      { valid: true, errors: [], warnings: [] },
      Date.now()
    )

    expect(result.ok).toBe(true)
    expect(result.data?.valid).toBe(true)
    expect(result.data?.errors).toHaveLength(0)
  })

  it('produces valid CommandResult for failed validation', () => {
    const result = failure(
      'env validate',
      CLI_ERROR_CODES.EXECUTION_FAILED,
      'Environment validation failed: 2 error(s)',
      Date.now(),
      'Run pnpm validate:env for details.'
    )
    result.data = { valid: false, errors: ['missing DATABASE_URL', 'missing REDIS_URL'], warnings: [] }

    expect(result.ok).toBe(false)
    expect(result.error?.code).toBe('RPL-CLI-003')
  })
})

describe('env diff output shape', () => {
  it('produces valid diff entries', () => {
    const diffs: EnvDiffEntry[] = [
      { key: 'DATABASE_URL', status: 'changed', left: 'pg****al', right: 'pg****ng' },
      { key: 'NEW_VAR', status: 'added', right: 'va****ue' },
      { key: 'OLD_VAR', status: 'removed', left: 'de****ed' },
      { key: 'SAME_VAR', status: 'same' },
    ]

    const result = success(
      'env diff',
      { left: 'dev', right: 'staging', totalKeys: 4, changes: 3, diffs },
      Date.now()
    )

    expect(result.ok).toBe(true)
    expect(result.data?.diffs).toHaveLength(4)
    expect(result.data?.changes).toBe(3)
  })
})

describe('verify command output shape', () => {
  it('produces valid CommandResult for passing verify', () => {
    const gates = [
      { gate: 'lint', category: 'quality', status: 'pass' as const, exitCode: 0, duration_ms: 1200 },
      { gate: 'typecheck', category: 'quality', status: 'pass' as const, exitCode: 0, duration_ms: 3400 },
      { gate: 'test', category: 'tests', status: 'pass' as const, exitCode: 0, duration_ms: 5600 },
    ]

    const result = success(
      'verify',
      { status: 'pass', passed: 3, failed: 0, total: 3, gates },
      Date.now()
    )

    expect(result.ok).toBe(true)
    expect(result.data?.passed).toBe(3)
    expect(result.data?.failed).toBe(0)
  })

  it('produces valid CommandResult for failing verify with error code', () => {
    const result = failure(
      'verify',
      CLI_ERROR_CODES.EXECUTION_FAILED,
      'Quality gate failed: lint, test',
      Date.now(),
      'Fix the failing gates and re-run: pnpm rip verify'
    )

    expect(result.ok).toBe(false)
    expect(result.error?.code).toBe('RPL-CLI-003')
    expect(result.error?.message).toContain('lint')
    expect(result.error?.suggestion).toContain('pnpm rip verify')
  })
})

describe('db status command output shape', () => {
  it('produces valid CommandResult with migration data', () => {
    const result = success(
      'db status',
      {
        migrations: [
          { name: '0001_initial.sql', status: 'applied' },
          { name: '0002_add_sessions.sql', status: 'pending' },
        ],
        totalFiles: 2,
        pendingCount: 1,
        appliedCount: 1,
      },
      Date.now()
    )

    expect(result.ok).toBe(true)
    expect(result.data?.pendingCount).toBe(1)
    expect(result.data?.appliedCount).toBe(1)
  })

  it('command not found produces RPL-CLI-005', () => {
    const result = failure(
      'db status',
      CLI_ERROR_CODES.COMMAND_NOT_FOUND,
      "Required command 'drizzle-kit' not found.",
      Date.now(),
      'Install the missing tool.'
    )

    expect(result.ok).toBe(false)
    expect(result.error?.code).toBe('RPL-CLI-005')
  })
})

describe('error code inclusion on failure', () => {
  it('unknown command uses RPL-CLI-001', () => {
    const result = failure('unknown', CLI_ERROR_CODES.UNKNOWN_COMMAND, 'Unknown command', Date.now())
    expect(result.error?.code).toBe('RPL-CLI-001')
  })

  it('missing argument uses RPL-CLI-002', () => {
    const result = failure('env diff', CLI_ERROR_CODES.MISSING_ARGUMENT, 'Missing file', Date.now())
    expect(result.error?.code).toBe('RPL-CLI-002')
  })

  it('execution failure uses RPL-CLI-003', () => {
    const result = failure('verify', CLI_ERROR_CODES.EXECUTION_FAILED, 'Failed', Date.now())
    expect(result.error?.code).toBe('RPL-CLI-003')
  })

  it('JSON parse error uses RPL-CLI-004', () => {
    const result = failure('verify', CLI_ERROR_CODES.JSON_PARSE_ERROR, 'Bad JSON', Date.now())
    expect(result.error?.code).toBe('RPL-CLI-004')
  })

  it('command not found uses RPL-CLI-005', () => {
    const result = failure('db status', CLI_ERROR_CODES.COMMAND_NOT_FOUND, 'Not found', Date.now())
    expect(result.error?.code).toBe('RPL-CLI-005')
  })
})

describe('VerifySummary type', () => {
  it('is assignable from parsed JSON', () => {
    const raw = {
      schema: 'ripple-gate-summary/v1',
      timestamp: new Date().toISOString(),
      status: 'pass' as const,
      passed: 10,
      failed: 0,
      total: 10,
      duration_ms: 45000,
      gates: [
        { gate: 'lint', category: 'quality', status: 'pass' as const, exitCode: 0, duration_ms: 1200 },
      ],
    }

    const summary: VerifySummary = raw
    expect(summary.schema).toBe('ripple-gate-summary/v1')
    expect(summary.gates).toHaveLength(1)
  })
})

describe('secrets list command output shape', () => {
  it('produces valid CommandResult with secrets data', () => {
    const secrets: SecretStatus[] = [
      {
        name: 'DATABASE_URL',
        required: true,
        stages: ['dev', 'staging', 'production'],
        format: 'postgres-uri',
        group: 'database',
        kind: 'connection-string',
        status: 'set',
      },
      {
        name: 'REDIS_URL',
        required: true,
        stages: ['dev', 'staging', 'production'],
        format: 'redis-uri',
        group: 'cache',
        kind: 'connection-string',
        status: 'missing',
      },
    ]

    const result = success(
      'secrets list',
      { stage: 'dev', total: 2, secrets },
      Date.now()
    )

    expect(result.ok).toBe(true)
    expect(result.command).toBe('secrets list')
    expect(result.data?.secrets).toHaveLength(2)
    expect(result.data?.total).toBe(2)
    expect(result.data?.stage).toBe('dev')
  })

  it('secrets have correct status values', () => {
    const secret: SecretStatus = {
      name: 'API_KEY',
      required: false,
      stages: ['production'],
      format: 'string',
      status: 'missing',
    }

    expect(secret.status).toBe('missing')
    expect(secret.required).toBe(false)
  })
})

describe('secrets required command output shape', () => {
  it('produces valid CommandResult with required secrets and counts', () => {
    const secrets: SecretStatus[] = [
      {
        name: 'DATABASE_URL',
        required: true,
        stages: ['dev', 'staging', 'production'],
        format: 'postgres-uri',
        status: 'set',
      },
      {
        name: 'AUTH_SECRET',
        required: true,
        stages: ['dev', 'staging', 'production'],
        format: 'random-bytes-32',
        status: 'missing',
      },
    ]

    const result = success(
      'secrets required',
      { stage: 'dev', total: 2, set: 1, missing: 1, secrets },
      Date.now()
    )

    expect(result.ok).toBe(true)
    expect(result.command).toBe('secrets required')
    expect(result.data?.set).toBe(1)
    expect(result.data?.missing).toBe(1)
    expect(result.data?.total).toBe(2)
    expect(result.data?.secrets).toHaveLength(2)
  })
})

describe('secrets get command output shape', () => {
  it('produces valid CommandResult with secret metadata and masked value', () => {
    const result = success(
      'secrets get',
      {
        name: 'DATABASE_URL',
        description: 'PostgreSQL connection string',
        required: true,
        stages: ['dev', 'staging', 'production'],
        format: 'postgres-uri',
        group: 'database',
        kind: 'connection-string',
        status: 'set' as const,
        maskedValue: 'po****al',
      },
      Date.now()
    )

    expect(result.ok).toBe(true)
    expect(result.command).toBe('secrets get')
    expect(result.data?.name).toBe('DATABASE_URL')
    expect(result.data?.maskedValue).toBe('po****al')
    expect(result.data?.status).toBe('set')
  })

  it('produces failure for unknown secret', () => {
    const result = failure(
      'secrets get',
      CLI_ERROR_CODES.SECRETS_NOT_FOUND,
      'Secret "NONEXISTENT" not found in schema.',
      Date.now(),
      'Available secrets: DATABASE_URL, REDIS_URL'
    )

    expect(result.ok).toBe(false)
    expect(result.error?.code).toBe('RPL-CLI-006')
  })
})

describe('secrets audit command output shape', () => {
  it('produces valid CommandResult with per-stage audit data', () => {
    const audit: SecretsAuditResult = {
      stages: {
        dev: {
          total: 3,
          set: 2,
          missing: 1,
          secrets: [
            { name: 'DATABASE_URL', required: true, stages: ['dev'], format: 'postgres-uri', status: 'set' },
            { name: 'REDIS_URL', required: true, stages: ['dev'], format: 'redis-uri', status: 'set' },
            { name: 'AUTH_SECRET', required: true, stages: ['dev'], format: 'random-bytes-32', status: 'missing' },
          ],
        },
        staging: {
          total: 2,
          set: 0,
          missing: 2,
          secrets: [
            { name: 'DATABASE_URL', required: true, stages: ['staging'], format: 'postgres-uri', status: 'missing' },
            { name: 'REDIS_URL', required: true, stages: ['staging'], format: 'redis-uri', status: 'missing' },
          ],
        },
      },
    }

    const result = success('secrets audit', audit, Date.now())

    expect(result.ok).toBe(true)
    expect(result.command).toBe('secrets audit')
    expect(result.data?.stages.dev.total).toBe(3)
    expect(result.data?.stages.dev.missing).toBe(1)
    expect(result.data?.stages.staging.missing).toBe(2)
  })
})

describe('deploy command output shape', () => {
  it('produces valid CommandResult with deploy phases', () => {
    const phases: DeployPhase[] = [
      { phase: 'env-validate', status: 'pass', details: 'Environment variables validated' },
      { phase: 'iac-policy-scan', status: 'skipped', details: 'IaC policy scan skipped' },
      { phase: 'deploy', status: 'pass', details: 'SST deploy to "dev" succeeded' },
      { phase: 'post-deploy', status: 'pass', details: 'Post-deploy health check passed' },
    ]

    const deployData: DeployResult = { stage: 'dev', dryRun: false, phases }
    const result = success('deploy', deployData, Date.now())

    expect(result.ok).toBe(true)
    expect(result.command).toBe('deploy')
    expect(result.data?.stage).toBe('dev')
    expect(result.data?.dryRun).toBe(false)
    expect(result.data?.phases).toHaveLength(4)
    expect(result.data?.phases[0].status).toBe('pass')
    expect(result.data?.phases[2].phase).toBe('deploy')
  })

  it('produces failure for pre-deploy check failure', () => {
    const phases: DeployPhase[] = [
      { phase: 'env-validate', status: 'fail', details: 'Environment validation failed' },
    ]

    const deployData: DeployResult = { stage: 'staging', dryRun: false, phases }
    const result = failure(
      'deploy',
      CLI_ERROR_CODES.DEPLOY_FAILED,
      'Pre-deploy validation failed.',
      Date.now(),
      'Resolve issues before deploying.'
    )
    result.data = deployData

    expect(result.ok).toBe(false)
    expect(result.error?.code).toBe('RPL-CLI-007')
    expect(result.error?.message).toContain('Pre-deploy')
  })

  it('produces valid dry-run CommandResult with skipped phases', () => {
    const phases: DeployPhase[] = [
      { phase: 'env-validate', status: 'pass', details: 'Environment variables validated' },
      { phase: 'iac-policy-scan', status: 'pass', details: 'IaC policy scan passed' },
      { phase: 'deploy', status: 'skipped', details: 'Dry-run mode — deploy skipped' },
      { phase: 'post-deploy', status: 'skipped', details: 'Dry-run mode — post-deploy skipped' },
    ]

    const deployData: DeployResult = { stage: 'production', dryRun: true, phases }
    const result = success('deploy', deployData, Date.now())

    expect(result.ok).toBe(true)
    expect(result.data?.dryRun).toBe(true)
    expect(result.data?.phases[2].status).toBe('skipped')
    expect(result.data?.phases[3].status).toBe('skipped')
  })

  it('deploy failed uses RPL-CLI-007', () => {
    const result = failure(
      'deploy',
      CLI_ERROR_CODES.DEPLOY_FAILED,
      'SST deploy failed.',
      Date.now()
    )

    expect(result.ok).toBe(false)
    expect(result.error?.code).toBe('RPL-CLI-007')
  })
})
