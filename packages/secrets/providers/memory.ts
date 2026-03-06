import type { SecretsProvider } from '../types'
import type { SecretsSchema, ValidationResult, ValidationError } from '@ripple-next/config'
import { validateFormat, getRequiredForStage } from '@ripple-next/config'
import type { Stage } from '@ripple-next/config'

/**
 * In-memory secrets provider for tests.
 * Never connects to external services.
 */
export class MemorySecretsProvider implements SecretsProvider {
  private store = new Map<string, string>()
  private stage: Stage

  constructor(initial?: Record<string, string>, stage: Stage = 'test') {
    this.stage = stage
    if (initial) {
      for (const [key, value] of Object.entries(initial)) {
        this.store.set(key, value)
      }
    }
  }

  async get(name: string): Promise<string | undefined> {
    return this.store.get(name)
  }

  async getRequired(name: string): Promise<string> {
    const value = this.store.get(name)
    if (value === undefined) {
      throw new Error(`RPL-SEC-001: Secret "${name}" not found`)
    }
    return value
  }

  async set(name: string, value: string): Promise<void> {
    this.store.set(name, value)
  }

  async list(): Promise<string[]> {
    return Array.from(this.store.keys())
  }

  async validate(schema: SecretsSchema): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const requiredNames = getRequiredForStage(schema, this.stage)

    for (const name of requiredNames) {
      const value = this.store.get(name)
      if (value === undefined) {
        errors.push({
          name,
          code: 'RPL-SEC-001',
          message: `Required secret "${name}" not found for stage "${this.stage}"`,
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

    // Also validate any non-required secrets that exist in the store
    for (const [name, value] of this.store) {
      const def = schema[name]
      if (!def) continue
      if (requiredNames.includes(name)) continue // already validated above

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

  /** Test helper: clear all stored secrets. */
  clear(): void {
    this.store.clear()
  }
}
