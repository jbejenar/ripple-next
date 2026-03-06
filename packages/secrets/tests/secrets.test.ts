import { describe, it, expect, beforeEach } from 'vitest'
import { MemorySecretsProvider } from '../providers/memory'
import { defineSecrets } from '@ripple-next/config'

describe('MemorySecretsProvider', () => {
  let provider: MemorySecretsProvider

  beforeEach(() => {
    provider = new MemorySecretsProvider()
  })

  it('get() returns undefined for missing secrets', async () => {
    const value = await provider.get('NONEXISTENT')
    expect(value).toBeUndefined()
  })

  it('set() and get() round-trip a secret', async () => {
    await provider.set('MY_SECRET', 'my-value')
    const value = await provider.get('MY_SECRET')
    expect(value).toBe('my-value')
  })

  it('getRequired() returns the value when present', async () => {
    await provider.set('KEY', 'val')
    const value = await provider.getRequired('KEY')
    expect(value).toBe('val')
  })

  it('getRequired() throws RPL-SEC-001 when missing', async () => {
    await expect(provider.getRequired('MISSING')).rejects.toThrow('RPL-SEC-001')
  })

  it('list() returns all stored secret names', async () => {
    await provider.set('A', '1')
    await provider.set('B', '2')
    await provider.set('C', '3')
    const names = await provider.list()
    expect(names).toHaveLength(3)
    expect(names).toContain('A')
    expect(names).toContain('B')
    expect(names).toContain('C')
  })

  it('list() returns empty array when no secrets', async () => {
    const names = await provider.list()
    expect(names).toHaveLength(0)
  })

  it('accepts initial secrets in constructor', async () => {
    const p = new MemorySecretsProvider({ FOO: 'bar', BAZ: 'qux' })
    expect(await p.get('FOO')).toBe('bar')
    expect(await p.get('BAZ')).toBe('qux')
    expect(await p.list()).toHaveLength(2)
  })

  it('set() overwrites existing secrets', async () => {
    await provider.set('KEY', 'old')
    await provider.set('KEY', 'new')
    expect(await provider.get('KEY')).toBe('new')
  })

  it('clear() removes all secrets', async () => {
    await provider.set('A', '1')
    await provider.set('B', '2')
    provider.clear()
    expect(await provider.list()).toHaveLength(0)
    expect(await provider.get('A')).toBeUndefined()
  })

  describe('validate()', () => {
    const schema = defineSecrets({
      DATABASE_URL: {
        description: 'PostgreSQL connection',
        required: true,
        stages: ['test'],
        format: 'postgres-uri',
      },
      REDIS_URL: {
        description: 'Redis connection',
        required: true,
        stages: ['test'],
        format: 'redis-uri',
      },
      OPTIONAL_KEY: {
        description: 'Optional key',
        required: false,
        stages: ['test'],
        format: 'string',
      },
    })

    it('returns valid when all required secrets are present and correct', async () => {
      const p = new MemorySecretsProvider({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      })
      const result = await p.validate(schema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('reports RPL-SEC-001 for missing required secrets', async () => {
      const p = new MemorySecretsProvider({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      })
      const result = await p.validate(schema)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('RPL-SEC-001')
      expect(result.errors[0].name).toBe('REDIS_URL')
    })

    it('reports RPL-SEC-002 for format validation failures', async () => {
      const p = new MemorySecretsProvider({
        DATABASE_URL: 'not-a-postgres-uri',
        REDIS_URL: 'redis://localhost:6379',
      })
      const result = await p.validate(schema)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('RPL-SEC-002')
      expect(result.errors[0].name).toBe('DATABASE_URL')
    })

    it('validates optional secrets if present', async () => {
      const p = new MemorySecretsProvider({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        OPTIONAL_KEY: '', // empty string fails 'string' format validation
      })
      const result = await p.validate(schema)
      expect(result.valid).toBe(false)
      expect(result.errors[0].code).toBe('RPL-SEC-002')
      expect(result.errors[0].name).toBe('OPTIONAL_KEY')
    })
  })
})
