import type { SecretsSchema, ValidationResult } from '@ripple-next/config'

/**
 * SecretsProvider interface.
 *
 * Every secrets provider implementation must satisfy this contract.
 * Tests ALWAYS use MemorySecretsProvider. See ADR-024.
 */
export interface SecretsProvider {
  /** Get a secret value by name. Returns undefined if not found. */
  get(name: string): Promise<string | undefined>

  /** Get a required secret value. Throws if not found. */
  getRequired(name: string): Promise<string>

  /** Set a secret value. */
  set(name: string, value: string): Promise<void>

  /** List all available secret names. */
  list(): Promise<string[]>

  /** Validate all secrets against a schema. */
  validate(schema: SecretsSchema): Promise<ValidationResult>
}
