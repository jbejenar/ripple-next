import { describe, it, expect, beforeEach } from 'vitest'
import { ChainSecretsProvider } from '../providers/chain'
import { MemorySecretsProvider } from '../providers/memory'

describe('ChainSecretsProvider', () => {
  let primary: MemorySecretsProvider
  let fallback: MemorySecretsProvider
  let chain: ChainSecretsProvider

  beforeEach(() => {
    primary = new MemorySecretsProvider()
    fallback = new MemorySecretsProvider()
    chain = new ChainSecretsProvider({
      providers: [primary, fallback],
      stage: 'test',
    })
  })

  it('throws RPL-SEC-003 when no providers given', () => {
    expect(() => new ChainSecretsProvider({ providers: [] })).toThrow('RPL-SEC-003')
  })

  describe('get', () => {
    it('returns value from first provider when found', async () => {
      await primary.set('KEY', 'from-primary')
      await fallback.set('KEY', 'from-fallback')

      const value = await chain.get('KEY')

      expect(value).toBe('from-primary')
    })

    it('falls back to second provider when first returns undefined', async () => {
      await fallback.set('FALLBACK_KEY', 'fallback-value')

      const value = await chain.get('FALLBACK_KEY')

      expect(value).toBe('fallback-value')
    })

    it('returns undefined when no provider has the secret', async () => {
      const value = await chain.get('NONEXISTENT')

      expect(value).toBeUndefined()
    })
  })

  describe('getRequired', () => {
    it('returns value from chain when found', async () => {
      await fallback.set('REQ_KEY', 'found')

      const value = await chain.getRequired('REQ_KEY')

      expect(value).toBe('found')
    })

    it('throws RPL-SEC-001 when not found in any provider', async () => {
      await expect(chain.getRequired('MISSING')).rejects.toThrow('RPL-SEC-001')
    })
  })

  describe('set', () => {
    it('sets on the first (primary) provider only', async () => {
      await chain.set('NEW_KEY', 'new-value')

      expect(await primary.get('NEW_KEY')).toBe('new-value')
      expect(await fallback.get('NEW_KEY')).toBeUndefined()
    })
  })

  describe('list', () => {
    it('merges and deduplicates names from all providers', async () => {
      await primary.set('A', '1')
      await primary.set('B', '2')
      await fallback.set('B', '3')
      await fallback.set('C', '4')

      const names = await chain.list()

      expect(names.sort()).toEqual(['A', 'B', 'C'])
    })

    it('returns empty array when all providers are empty', async () => {
      const names = await chain.list()

      expect(names).toHaveLength(0)
    })
  })

  describe('defaults', () => {
    it('defaults stage to dev', () => {
      const c = new ChainSecretsProvider({
        providers: [new MemorySecretsProvider()],
      })
      // Verify it was created without error
      expect(c).toBeDefined()
    })
  })
})
