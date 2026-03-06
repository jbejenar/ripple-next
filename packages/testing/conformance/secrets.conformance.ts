/**
 * Secrets Provider Conformance Suite
 *
 * Every SecretsProvider implementation must pass these tests.
 * Import this in your provider's test file and call it with a factory.
 *
 * @example
 * ```ts
 * import { secretsConformance } from '@ripple-next/testing/conformance/secrets.conformance'
 * import { MemorySecretsProvider } from '@ripple-next/secrets'
 *
 * secretsConformance({
 *   name: 'MemorySecretsProvider',
 *   factory: () => new MemorySecretsProvider(),
 * })
 * ```
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { defineSecrets } from '@ripple-next/config'
import type { SecretsProvider } from '@ripple-next/secrets'

interface SecretsConformanceOptions {
  name: string
  factory: () => SecretsProvider
  cleanup?: () => Promise<void>
}

export function secretsConformance({ name, factory, cleanup }: SecretsConformanceOptions): void {
  describe(`SecretsProvider conformance: ${name}`, () => {
    let provider: SecretsProvider

    beforeEach(() => {
      provider = factory()
    })

    if (cleanup) {
      afterEach(async () => {
        await cleanup()
      })
    }

    it('get() returns undefined for missing secrets', async () => {
      const value = await provider.get('NONEXISTENT_KEY_12345')
      expect(value).toBeUndefined()
    })

    it('set() and get() round-trip a secret', async () => {
      await provider.set('CONFORMANCE_KEY', 'conformance-value')
      const value = await provider.get('CONFORMANCE_KEY')
      expect(value).toBe('conformance-value')
    })

    it('getRequired() returns the value when present', async () => {
      await provider.set('REQUIRED_KEY', 'present')
      const value = await provider.getRequired('REQUIRED_KEY')
      expect(value).toBe('present')
    })

    it('getRequired() throws on missing secret', async () => {
      await expect(provider.getRequired('MISSING_KEY_99999')).rejects.toThrow()
    })

    it('list() includes set secrets', async () => {
      await provider.set('LIST_KEY_A', 'a')
      await provider.set('LIST_KEY_B', 'b')
      const names = await provider.list()
      expect(names).toContain('LIST_KEY_A')
      expect(names).toContain('LIST_KEY_B')
    })

    it('set() overwrites existing values', async () => {
      await provider.set('OVERWRITE_KEY', 'old')
      await provider.set('OVERWRITE_KEY', 'new')
      const value = await provider.get('OVERWRITE_KEY')
      expect(value).toBe('new')
    })

    it('validate() succeeds when all required secrets are present and valid', async () => {
      const schema = defineSecrets({
        CONF_DB_URL: {
          description: 'Test DB URL',
          required: true,
          stages: ['test'],
          format: 'postgres-uri',
        },
      })

      await provider.set('CONF_DB_URL', 'postgresql://user:pass@localhost:5432/testdb')
      const result = await provider.validate(schema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('validate() reports errors for missing required secrets', async () => {
      const schema = defineSecrets({
        CONF_MISSING: {
          description: 'Intentionally missing secret',
          required: true,
          stages: ['test'],
          format: 'string',
        },
      })

      const result = await provider.validate(schema)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(1)
      expect(result.errors[0].name).toBe('CONF_MISSING')
    })

    it('validate() reports errors for format validation failures', async () => {
      const schema = defineSecrets({
        CONF_BAD_FORMAT: {
          description: 'Secret with wrong format',
          required: true,
          stages: ['test'],
          format: 'url',
        },
      })

      await provider.set('CONF_BAD_FORMAT', 'not-a-valid-url')
      const result = await provider.validate(schema)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(1)
      expect(result.errors[0].code).toBe('RPL-SEC-002')
    })
  })
}
