import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EnvSecretsProvider } from '../providers/env'

describe('EnvSecretsProvider', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    // Restore original environment
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key]
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      process.env[key] = value
    }
  })

  describe('get', () => {
    it('returns environment variable value', async () => {
      process.env['TEST_SECRET'] = 'my-value'
      const provider = new EnvSecretsProvider()

      const value = await provider.get('TEST_SECRET')

      expect(value).toBe('my-value')
    })

    it('returns undefined for missing env var', async () => {
      delete process.env['NONEXISTENT_VAR']
      const provider = new EnvSecretsProvider()

      const value = await provider.get('NONEXISTENT_VAR')

      expect(value).toBeUndefined()
    })

    it('applies prefix to env var name', async () => {
      process.env['APP_DB_URL'] = 'postgres://localhost'
      const provider = new EnvSecretsProvider({ prefix: 'APP_' })

      const value = await provider.get('DB_URL')

      expect(value).toBe('postgres://localhost')
    })
  })

  describe('getRequired', () => {
    it('returns the value when present', async () => {
      process.env['REQUIRED_KEY'] = 'exists'
      const provider = new EnvSecretsProvider()

      const value = await provider.getRequired('REQUIRED_KEY')

      expect(value).toBe('exists')
    })

    it('throws RPL-SEC-001 when missing', async () => {
      delete process.env['MISSING_KEY']
      const provider = new EnvSecretsProvider()

      await expect(provider.getRequired('MISSING_KEY')).rejects.toThrow('RPL-SEC-001')
    })

    it('includes prefix in error message', async () => {
      delete process.env['PREFIX_KEY']
      const provider = new EnvSecretsProvider({ prefix: 'PREFIX_' })

      await expect(provider.getRequired('KEY')).rejects.toThrow('PREFIX_KEY')
    })
  })

  describe('set', () => {
    it('sets an environment variable', async () => {
      const provider = new EnvSecretsProvider()

      await provider.set('NEW_VAR', 'new-value')

      expect(process.env['NEW_VAR']).toBe('new-value')
    })

    it('applies prefix when setting', async () => {
      const provider = new EnvSecretsProvider({ prefix: 'APP_' })

      await provider.set('MY_VAR', 'val')

      expect(process.env['APP_MY_VAR']).toBe('val')
    })
  })

  describe('list', () => {
    beforeEach(() => {
      process.env['RN_A'] = '1'
      process.env['RN_B'] = '2'
    })

    it('lists env vars matching prefix with prefix stripped', async () => {
      const provider = new EnvSecretsProvider({ prefix: 'RN_' })

      const names = await provider.list()

      expect(names).toContain('A')
      expect(names).toContain('B')
    })

    it('returns all env var keys when no prefix', async () => {
      const provider = new EnvSecretsProvider()

      const names = await provider.list()

      // Should include at least PATH and other system env vars
      expect(names.length).toBeGreaterThan(0)
      expect(names).toContain('RN_A')
    })
  })
})
