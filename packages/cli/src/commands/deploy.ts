import { defineCommand } from 'citty'
import type { DeployPhase, DeployResult } from '../types.js'
import { CLI_ERROR_CODES } from '../types.js'
import {
  resolveRoot,
  success,
  failure,
  runCommand,
  commandExists,
  outputResult,
  commandNotFoundResult,
} from '../utils.js'

const VALID_STAGES = ['dev', 'staging', 'production', 'test']

export const deployCommand = defineCommand({
  meta: {
    name: 'deploy',
    description: 'Deploy the platform via SST (pre-deploy checks, deploy, post-deploy health)',
  },
  args: {
    stage: {
      type: 'string',
      description: 'Deployment stage (dev, staging, production, test)',
      required: true,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Run pre-deploy checks without deploying',
      default: false,
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
    const stage = args.stage
    const dryRun = args['dry-run'] ?? false

    if (!VALID_STAGES.includes(stage)) {
      const result = failure(
        'deploy',
        CLI_ERROR_CODES.MISSING_ARGUMENT,
        `Invalid stage "${stage}". Valid stages: ${VALID_STAGES.join(', ')}`,
        startTime
      )
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    const phases: DeployPhase[] = []

    // ── Phase 1: Pre-deploy validation ──────────────────────────────

    // 1a. Environment validation
    const envResult = runCommand('pnpm', ['validate:env'], root)
    const envPhase: DeployPhase = {
      phase: 'env-validate',
      status: envResult.exitCode === 0 ? 'pass' : 'fail',
      details: envResult.exitCode === 0
        ? 'Environment variables validated'
        : `Environment validation failed: ${(envResult.stderr || envResult.stdout).trim()}`,
    }
    phases.push(envPhase)

    if (!args.json && !dryRun) {
      const icon = envPhase.status === 'pass' ? 'OK' : 'FAIL'
      process.stdout.write(`  [${icon}] ${envPhase.phase}: ${envPhase.details ?? ''}\n`)
    }

    // 1b. IaC policy scan
    const iacResult = runCommand('pnpm', ['check:iac'], root, 60_000)
    const iacPhase: DeployPhase = {
      phase: 'iac-policy-scan',
      status: iacResult.exitCode === 0 ? 'pass' : 'fail',
      details: iacResult.exitCode === 0
        ? 'IaC policy scan passed'
        : `IaC policy scan failed: ${(iacResult.stderr || iacResult.stdout).trim()}`,
    }
    phases.push(iacPhase)

    if (!args.json && !dryRun) {
      const icon = iacPhase.status === 'pass' ? 'OK' : 'FAIL'
      process.stdout.write(`  [${icon}] ${iacPhase.phase}: ${iacPhase.details ?? ''}\n`)
    }

    // Check if pre-deploy failed
    const preDeployFailed = envPhase.status === 'fail' || iacPhase.status === 'fail'
    if (preDeployFailed) {
      const deployData: DeployResult = { stage, dryRun, phases }
      const result = failure(
        'deploy',
        CLI_ERROR_CODES.DEPLOY_FAILED,
        'Pre-deploy validation failed. Resolve issues before deploying.',
        startTime,
        'Run "rip env validate" and "rip secrets required --stage <stage>" for details.'
      )
      result.data = deployData
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    // ── Dry-run exit ────────────────────────────────────────────────

    if (dryRun) {
      const deployPhase: DeployPhase = {
        phase: 'deploy',
        status: 'skipped',
        details: 'Dry-run mode — deploy skipped',
      }
      phases.push(deployPhase)

      const postDeployPhase: DeployPhase = {
        phase: 'post-deploy',
        status: 'skipped',
        details: 'Dry-run mode — post-deploy skipped',
      }
      phases.push(postDeployPhase)

      const deployData: DeployResult = { stage, dryRun, phases }
      const result = success('deploy', deployData, startTime)
      outputResult(result, args)

      if (!args.json) {
        process.stdout.write(`\n  Dry-run complete. All pre-deploy checks passed.\n`)
        process.stdout.write(`  To deploy for real, run: rip deploy --stage ${stage}\n`)
      }
      return
    }

    // ── Phase 2: Deploy ─────────────────────────────────────────────

    // Check if sst is available
    if (!commandExists('sst')) {
      const result = commandNotFoundResult('deploy', 'sst', startTime)
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    if (!args.json) {
      process.stdout.write(`\n  Deploying to stage "${stage}"...\n`)
    }

    const sstResult = runCommand('sst', ['deploy', '--stage', stage], root, 600_000)
    const deployPhase: DeployPhase = {
      phase: 'deploy',
      status: sstResult.exitCode === 0 ? 'pass' : 'fail',
      details: sstResult.exitCode === 0
        ? `SST deploy to "${stage}" succeeded`
        : `SST deploy failed: ${(sstResult.stderr || sstResult.stdout).trim()}`,
    }
    phases.push(deployPhase)

    if (!args.json) {
      const icon = deployPhase.status === 'pass' ? 'OK' : 'FAIL'
      process.stdout.write(`  [${icon}] ${deployPhase.phase}: ${deployPhase.details ?? ''}\n`)
    }

    if (deployPhase.status === 'fail') {
      const deployData: DeployResult = { stage, dryRun, phases }
      const result = failure(
        'deploy',
        CLI_ERROR_CODES.DEPLOY_FAILED,
        `SST deploy to "${stage}" failed.`,
        startTime,
        'Check the SST output above for details. Run "sst deploy --stage <stage>" directly for verbose output.'
      )
      result.data = deployData
      outputResult(result, args)
      process.exitCode = 1
      return
    }

    // ── Phase 3: Post-deploy health check ───────────────────────────

    const healthResult = runCommand('pnpm', ['check:readiness'], root, 30_000)
    const postDeployPhase: DeployPhase = {
      phase: 'post-deploy',
      status: healthResult.exitCode === 0 ? 'pass' : 'fail',
      details: healthResult.exitCode === 0
        ? 'Post-deploy health check passed'
        : 'Post-deploy health check failed',
    }
    phases.push(postDeployPhase)

    if (!args.json) {
      const icon = postDeployPhase.status === 'pass' ? 'OK' : 'WARN'
      process.stdout.write(`  [${icon}] ${postDeployPhase.phase}: ${postDeployPhase.details ?? ''}\n`)
    }

    // ── Final result ────────────────────────────────────────────────

    const deployData: DeployResult = { stage, dryRun, phases }
    const allPassed = phases.every((p) => p.status === 'pass' || p.status === 'skipped')

    if (allPassed) {
      const result = success('deploy', deployData, startTime)
      outputResult(result, args)

      if (!args.json) {
        process.stdout.write(`\n  Deploy to "${stage}" completed successfully.\n`)
      }
    } else {
      const failedPhases = phases.filter((p) => p.status === 'fail').map((p) => p.phase)
      const result = failure(
        'deploy',
        CLI_ERROR_CODES.DEPLOY_FAILED,
        `Deploy completed with failures in: ${failedPhases.join(', ')}`,
        startTime,
        'Review the phase details above.'
      )
      result.data = deployData
      outputResult(result, args)
      process.exitCode = 1
    }
  },
})
