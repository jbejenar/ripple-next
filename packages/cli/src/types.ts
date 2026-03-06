/**
 * Universal command result contract for the platform CLI.
 *
 * Every `rip` subcommand returns this shape when invoked with `--json`.
 * See ADR-025 for the design rationale.
 */
export interface CommandResult<T = unknown> {
  ok: boolean
  command: string
  data?: T
  error?: {
    /** RPL-CLI-* taxonomy code */
    code: string
    message: string
    suggestion?: string
  }
  /** Execution duration in milliseconds */
  duration: number
  /** ISO-8601 timestamp */
  timestamp: string
}

/**
 * CLI error codes from the error taxonomy (RPL-CLI-*).
 */
export const CLI_ERROR_CODES = {
  UNKNOWN_COMMAND: 'RPL-CLI-001',
  MISSING_ARGUMENT: 'RPL-CLI-002',
  EXECUTION_FAILED: 'RPL-CLI-003',
  JSON_PARSE_ERROR: 'RPL-CLI-004',
  COMMAND_NOT_FOUND: 'RPL-CLI-005',
  SECRETS_NOT_FOUND: 'RPL-CLI-006',
  DEPLOY_FAILED: 'RPL-CLI-007',
} as const

export type CliErrorCode = (typeof CLI_ERROR_CODES)[keyof typeof CLI_ERROR_CODES]

/**
 * Options common to all subcommands.
 */
export interface CommonOptions {
  json?: boolean
  verbose?: boolean
}

/**
 * Subsystem status from readiness.json.
 */
export interface SubsystemStatus {
  name: string
  status: string
  maturity: string
  description: string
  blockers: string[]
}

/**
 * Gate result from verify.mjs output.
 */
export interface GateResult {
  gate: string
  category: string
  status: 'pass' | 'fail'
  exitCode: number
  duration_ms: number
}

/**
 * Verify summary from verify.mjs output.
 */
export interface VerifySummary {
  schema: string
  timestamp: string
  status: 'pass' | 'fail'
  passed: number
  failed: number
  total: number
  duration_ms: number
  gates: GateResult[]
}

/**
 * Environment variable difference entry.
 */
export interface EnvDiffEntry {
  key: string
  left?: string
  right?: string
  status: 'added' | 'removed' | 'changed' | 'same'
}

/**
 * Environment validation result.
 */
export interface EnvValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Database migration status entry.
 */
export interface MigrationEntry {
  name: string
  status: 'applied' | 'pending'
}

/**
 * Status of a single secret from the schema.
 */
export interface SecretStatus {
  name: string
  required: boolean
  stages: string[]
  format: string
  group?: string
  kind?: string
  status: 'set' | 'missing'
}

/**
 * Audit result for secrets across all stages.
 */
export interface SecretsAuditResult {
  stages: Record<
    string,
    {
      total: number
      set: number
      missing: number
      secrets: SecretStatus[]
    }
  >
}

/**
 * A phase within a deploy pipeline.
 */
export interface DeployPhase {
  phase: string
  status: 'pass' | 'fail' | 'skipped'
  details?: string
}

/**
 * Deploy command result data.
 */
export interface DeployResult {
  stage: string
  dryRun: boolean
  phases: DeployPhase[]
}
