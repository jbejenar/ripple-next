import type { SecretsProvider } from '../types'
import type { SecretsSchema, ValidationResult, ValidationError, Stage } from '@ripple-next/config'
import { validateFormat, getRequiredForStage } from '@ripple-next/config'

export interface ChainSecretsProviderOptions {
  /** Providers to try in order (first match wins). */
  providers: SecretsProvider[]
  /** Deployment stage for validation. */
  stage?: Stage
}

/**
 * Chain secrets provider that tries multiple providers in order.
 *
 * For get/getRequired, the first provider that returns a value wins.
 * For set, the value is set on the first provider only.
 * For list, names from all providers are merged (deduplicated).
 */
export class ChainSecretsProvider implements SecretsProvider {
  private providers: SecretsProvider[]
  private stage: Stage

  constructor(options: ChainSecretsProviderOptions) {
    if (options.providers.length === 0) {
      throw new Error('RPL-SEC-003: ChainSecretsProvider requires at least one provider')
    }
    this.providers = options.providers
    this.stage = options.stage ?? 'dev'
  }

  async get(name: string): Promise<string | undefined> {
    for (const provider of this.providers) {
      const value = await provider.get(name)
      if (value !== undefined) {
        return value
      }
    }
    return undefined
  }

  async getRequired(name: string): Promise<string> {
    const value = await this.get(name)
    if (value === undefined) {
      throw new Error(`RPL-SEC-001: Secret "${name}" not found in any provider in the chain`)
    }
    return value
  }

  async set(name: string, value: string): Promise<void> {
    // Set on the first provider (primary)
    await this.providers[0].set(name, value)
  }

  async list(): Promise<string[]> {
    const allNames = new Set<string>()
    for (const provider of this.providers) {
      const names = await provider.list()
      for (const name of names) {
        allNames.add(name)
      }
    }
    return Array.from(allNames)
  }

  async validate(schema: SecretsSchema): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const requiredNames = getRequiredForStage(schema, this.stage)

    for (const name of requiredNames) {
      const value = await this.get(name)
      if (value === undefined) {
        errors.push({
          name,
          code: 'RPL-SEC-001',
          message: `Required secret "${name}" not found in any provider for stage "${this.stage}"`,
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
