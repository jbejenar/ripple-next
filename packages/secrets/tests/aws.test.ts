import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @aws-sdk/client-ssm
const mockSend = vi.fn()
vi.mock('@aws-sdk/client-ssm', () => {
  return {
    SSMClient: vi.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    GetParameterCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'GetParameter' })),
    PutParameterCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'PutParameter' })),
    GetParametersByPathCommand: vi.fn().mockImplementation((input: unknown) => ({ _input: input, _type: 'GetParametersByPath' })),
  }
})

import { AwsSecretsProvider } from '../providers/aws'

describe('AwsSecretsProvider', () => {
  let provider: AwsSecretsProvider

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new AwsSecretsProvider({
      pathPrefix: '/ripple-next/test/',
      stage: 'test',
    })
  })

  describe('get', () => {
    it('returns the parameter value when found', async () => {
      mockSend.mockResolvedValue({
        Parameter: { Value: 'secret-value' },
      })

      const value = await provider.get('MY_SECRET')

      expect(value).toBe('secret-value')
      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        Name: '/ripple-next/test/MY_SECRET',
        WithDecryption: true,
      })
    })

    it('returns undefined when parameter not found', async () => {
      mockSend.mockRejectedValue(Object.assign(new Error('Parameter not found'), { name: 'ParameterNotFound' }))

      const value = await provider.get('MISSING')

      expect(value).toBeUndefined()
    })

    it('returns undefined for ParameterVersionNotFound', async () => {
      mockSend.mockRejectedValue(Object.assign(new Error('Version not found'), { name: 'ParameterVersionNotFound' }))

      const value = await provider.get('MISSING_VERSION')

      expect(value).toBeUndefined()
    })

    it('rethrows non-ParameterNotFound errors', async () => {
      mockSend.mockRejectedValue(new Error('AccessDenied'))

      await expect(provider.get('FORBIDDEN')).rejects.toThrow('AccessDenied')
    })

    it('returns undefined when Parameter.Value is null', async () => {
      mockSend.mockResolvedValue({
        Parameter: { Value: undefined },
      })

      const value = await provider.get('EMPTY')

      expect(value).toBeUndefined()
    })
  })

  describe('getRequired', () => {
    it('returns the value when present', async () => {
      mockSend.mockResolvedValue({
        Parameter: { Value: 'found' },
      })

      const value = await provider.getRequired('KEY')

      expect(value).toBe('found')
    })

    it('throws RPL-SEC-001 when missing', async () => {
      mockSend.mockRejectedValue(Object.assign(new Error(), { name: 'ParameterNotFound' }))

      await expect(provider.getRequired('MISSING')).rejects.toThrow('RPL-SEC-001')
    })
  })

  describe('set', () => {
    it('puts a parameter as SecureString', async () => {
      mockSend.mockResolvedValue({})

      await provider.set('MY_SECRET', 'new-value')

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        Name: '/ripple-next/test/MY_SECRET',
        Value: 'new-value',
        Type: 'SecureString',
        Overwrite: true,
      })
    })
  })

  describe('list', () => {
    it('returns parameter names with prefix stripped', async () => {
      mockSend.mockResolvedValue({
        Parameters: [
          { Name: '/ripple-next/test/DB_URL' },
          { Name: '/ripple-next/test/API_KEY' },
        ],
        NextToken: undefined,
      })

      const names = await provider.list()

      expect(names).toEqual(['DB_URL', 'API_KEY'])
    })

    it('handles pagination', async () => {
      mockSend
        .mockResolvedValueOnce({
          Parameters: [{ Name: '/ripple-next/test/KEY_A' }],
          NextToken: 'page-2',
        })
        .mockResolvedValueOnce({
          Parameters: [{ Name: '/ripple-next/test/KEY_B' }],
          NextToken: undefined,
        })

      const names = await provider.list()

      expect(names).toEqual(['KEY_A', 'KEY_B'])
      expect(mockSend).toHaveBeenCalledTimes(2)
    })

    it('returns empty array when no parameters found', async () => {
      mockSend.mockResolvedValue({
        Parameters: undefined,
        NextToken: undefined,
      })

      const names = await provider.list()

      expect(names).toEqual([])
    })
  })

  describe('pathPrefix normalization', () => {
    it('appends trailing slash if missing', async () => {
      const p = new AwsSecretsProvider({
        pathPrefix: '/ripple-next/prod',
        stage: 'production',
      })
      mockSend.mockResolvedValue({ Parameter: { Value: 'val' } })

      await p.get('KEY')

      const command = mockSend.mock.calls[0][0] as { _input: Record<string, unknown> }
      expect(command._input).toMatchObject({
        Name: '/ripple-next/prod/KEY',
      })
    })
  })
})
