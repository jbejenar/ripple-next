/**
 * @ripple-next/cli — Platform CLI programmatic API
 *
 * Barrel export for use as a library. CLI entry point is src/cli.ts.
 */
export type {
  CommandResult,
  CliErrorCode,
  CommonOptions,
  SubsystemStatus,
  GateResult,
  VerifySummary,
  EnvDiffEntry,
  EnvValidationResult,
  MigrationEntry,
  SecretStatus,
  SecretsAuditResult,
  DeployPhase,
  DeployResult,
} from './types.js'

export { CLI_ERROR_CODES } from './types.js'

export { success, failure, runCommand, commandExists, outputResult, resolveRoot } from './utils.js'
