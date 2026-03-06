import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import type { CommandResult, CommonOptions } from './types.js'
import { CLI_ERROR_CODES } from './types.js'

/**
 * Resolve the monorepo root directory.
 */
export function resolveRoot(): string {
  // Walk up from the CLI package to find the monorepo root
  let dir = resolve(import.meta.dirname ?? __dirname, '..')
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) {
      return dir
    }
    dir = resolve(dir, '..')
  }
  return resolve(import.meta.dirname ?? __dirname, '..')
}

/**
 * Create a successful CommandResult.
 */
export function success<T>(command: string, data: T, startTime: number): CommandResult<T> {
  return {
    ok: true,
    command,
    data,
    duration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a failed CommandResult.
 */
export function failure(
  command: string,
  code: string,
  message: string,
  startTime: number,
  suggestion?: string
): CommandResult {
  return {
    ok: false,
    command,
    error: {
      code,
      message,
      suggestion,
    },
    duration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Run a shell command and capture output. Returns stdout on success, throws on failure.
 */
export function runCommand(
  cmd: string,
  args: string[],
  cwd: string,
  timeoutMs = 300_000
): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execFileSync(cmd, args, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
      cwd,
    })
    return { stdout, stderr: '', exitCode: 0 }
  } catch (err: unknown) {
    const execErr = err as { status?: number; stdout?: string; stderr?: string }
    return {
      stdout: execErr.stdout ?? '',
      stderr: execErr.stderr ?? '',
      exitCode: execErr.status ?? 1,
    }
  }
}

/**
 * Check if a command exists on the system.
 */
export function commandExists(cmd: string): boolean {
  try {
    execFileSync('which', [cmd], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
    return true
  } catch {
    return false
  }
}

/**
 * Read a JSON file and parse it. Returns undefined if file does not exist.
 */
export function readJsonFile<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) {
    return undefined
  }
  const content = readFileSync(filePath, 'utf-8')
  return JSON.parse(content) as T
}

/**
 * Output a CommandResult: JSON to stdout when --json, human-readable otherwise.
 */
export function outputResult(result: CommandResult, options: CommonOptions): void {
  if (options.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
  } else {
    if (result.ok) {
      process.stdout.write(`[OK] ${result.command} (${result.duration}ms)\n`)
      if (result.data && options.verbose) {
        process.stdout.write(JSON.stringify(result.data, null, 2) + '\n')
      }
    } else {
      process.stderr.write(`[FAIL] ${result.command} (${result.duration}ms)\n`)
      if (result.error) {
        process.stderr.write(`  Code: ${result.error.code}\n`)
        process.stderr.write(`  Message: ${result.error.message}\n`)
        if (result.error.suggestion) {
          process.stderr.write(`  Suggestion: ${result.error.suggestion}\n`)
        }
      }
    }
  }
}

/**
 * Create a failure result for when a wrapped command is not found.
 */
export function commandNotFoundResult(
  command: string,
  wrappedCmd: string,
  startTime: number
): CommandResult {
  return failure(
    command,
    CLI_ERROR_CODES.COMMAND_NOT_FOUND,
    `Required command '${wrappedCmd}' not found. Ensure it is installed.`,
    startTime,
    `Install the missing tool or run 'pnpm install' to ensure all dependencies are available.`
  )
}
