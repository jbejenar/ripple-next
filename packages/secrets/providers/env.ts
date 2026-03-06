import type { SecretsProvider } from '../types'
import type { SecretsSchema, ValidationResult, ValidationError, Stage } from '@ripple-next/config'
import { validateFormat, getRequiredForStage } from '@ripple-next/config'

/**
 * Environment-variable-based secrets provider.
 * Reads from process.env. Suitable for local dev and CI.
 */
export class EnvSecretsProvider implements SecretsProvider {
  private stage: Stage
  private prefix: string

  constructor(options?: { stage?: Stage; prefix?: string }) {
    this.stage = options?.stage ?? 'dev'
    this.prefix = options?.prefix ?? ''
  }

  async get(name: string): Promise<string | undefined> {
    return process.env[this.prefix + name]
  }

  async getRequired(name: string): Promise<string> {
    const value = process.env[this.prefix + name]
    if (value === undefined) {
      throw new Error(`RPL-SEC-001: Secret "${this.prefix + name}" not found in environment`)
    }
    return value
  }

  async set(name: string, value: string): Promise<void> {
    process.env[this.prefix + name] = value
  }

  async list(): Promise<string[]> {
    if (!this.prefix) {
      return Object.keys(process.env).filter(
        (key) => process.env[key] !== undefined
      )
    }
    return Object.keys(process.env)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.slice(this.prefix.length))
  }

  async validate(schema: SecretsSchema): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const requiredNames = getRequiredForStage(schema, this.stage)

    for (const name of requiredNames) {
      const value = process.env[this.prefix + name]
      if (value === undefined) {
        errors.push({
          name,
          code: 'RPL-SEC-001',
          message: `Required secret "${name}" not found in environment for stage "${this.stage}"`,
        })
        continue
      }

      const def = schema[name]
      if (!validateFormat(value, def.format)) {
        errors.push({
          name,
          code: 'RPL-SEC-002',
          message: `Secret "${name}" failed format validation (expected ${def.format})`,
        })
      }
    }

    return { valid: errors.length === 0, errors }
  }
}
