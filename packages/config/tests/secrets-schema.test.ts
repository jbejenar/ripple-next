import { describe, it, expect } from 'vitest'
import {
  defineSecrets,
  validateFormat,
  getRequiredForStage,
} from '../src/secrets.schema'
import type { SecretDefinition, Stage } from '../src/secrets.schema'

describe('defineSecrets', () => {
  it('returns a schema from valid definitions', () => {
    const schema = defineSecrets({
      DATABASE_URL: {
        description: 'PostgreSQL connection string',
        required: true,
        stages: ['dev', 'staging', 'production'],
        format: 'postgres-uri',
        group: 'database',
      },
    })

    expect(schema.DATABASE_URL).toBeDefined()
    expect(schema.DATABASE_URL.required).toBe(true)
    expect(schema.DATABASE_URL.format).toBe('postgres-uri')
  })

  it('accepts multiple secrets', () => {
    const schema = defineSecrets({
      DATABASE_URL: {
        description: 'PostgreSQL connection string',
        required: true,
        stages: ['production'],
        format: 'postgres-uri',
      },
      REDIS_URL: {
        description: 'Redis connection string',
        required: true,
        stages: ['production'],
        format: 'redis-uri',
      },
      SESSION_KEY: {
        description: 'Session encryption key',
        required: true,
        stages: ['dev', 'staging', 'production'],
        format: 'random-bytes-32',
        autoGenerate: true,
      },
    })

    expect(Object.keys(schema)).toHaveLength(3)
  })

  it('throws on empty description', () => {
    expect(() =>
      defineSecrets({
        BAD: {
          description: '',
          required: true,
          stages: ['dev'],
          format: 'string',
        },
      })
    ).toThrow('must have a non-empty description')
  })

  it('throws on empty stages', () => {
    expect(() =>
      defineSecrets({
        BAD: {
          description: 'Some secret',
          required: true,
          stages: [],
          format: 'string',
        },
      })
    ).toThrow('must have at least one stage')
  })

  it('throws on invalid stage', () => {
    expect(() =>
      defineSecrets({
        BAD: {
          description: 'Some secret',
          required: true,
          stages: ['invalid' as Stage],
          format: 'string',
        },
      })
    ).toThrow('invalid stage "invalid"')
  })

  it('throws on invalid format', () => {
    expect(() =>
      defineSecrets({
        BAD: {
          description: 'Some secret',
          required: true,
          stages: ['dev'],
          format: 'invalid-format' as SecretDefinition['format'],
        },
      })
    ).toThrow('invalid format "invalid-format"')
  })

  it('validates field formats for structured secrets', () => {
    const schema = defineSecrets({
      OAUTH_CLIENT: {
        description: 'OAuth client credentials',
        required: true,
        stages: ['production'],
        format: 'json',
        kind: 'oauth-client',
        fields: {
          clientId: { format: 'string' },
          clientSecret: { format: 'string' },
          tokenUrl: { format: 'url', sensitive: false },
        },
      },
    })

    expect(schema.OAUTH_CLIENT.fields).toBeDefined()
    expect(Object.keys(schema.OAUTH_CLIENT.fields!)).toHaveLength(3)
  })

  it('throws on invalid field format', () => {
    expect(() =>
      defineSecrets({
        BAD: {
          description: 'Bad structured secret',
          required: true,
          stages: ['dev'],
          format: 'json',
          fields: {
            field1: { format: 'not-a-format' as SecretDefinition['format'] },
          },
        },
      })
    ).toThrow('field "field1" has invalid format')
  })

  it('preserves optional properties', () => {
    const schema = defineSecrets({
      API_KEY: {
        description: 'External API key',
        required: false,
        stages: ['production'],
        format: 'string',
        group: 'integrations',
        kind: 'api-key',
        services: ['@ripple-next/cms'],
        autoGenerate: false,
        rotatable: true,
        devDefault: 'test-key-123',
        pipelineAccess: true,
        direction: 'outbound',
        managedBy: 'manual',
      },
    })

    expect(schema.API_KEY.group).toBe('integrations')
    expect(schema.API_KEY.kind).toBe('api-key')
    expect(schema.API_KEY.services).toEqual(['@ripple-next/cms'])
    expect(schema.API_KEY.rotatable).toBe(true)
    expect(schema.API_KEY.devDefault).toBe('test-key-123')
    expect(schema.API_KEY.direction).toBe('outbound')
  })
})

describe('validateFormat', () => {
  it('validates string format', () => {
    expect(validateFormat('hello', 'string')).toBe(true)
    expect(validateFormat('', 'string')).toBe(false)
  })

  it('validates url format', () => {
    expect(validateFormat('https://example.com', 'url')).toBe(true)
    expect(validateFormat('http://localhost:3000', 'url')).toBe(true)
    expect(validateFormat('not-a-url', 'url')).toBe(false)
  })

  it('validates postgres-uri format', () => {
    expect(validateFormat('postgresql://user:pass@localhost:5432/db', 'postgres-uri')).toBe(true)
    expect(validateFormat('postgres://user:pass@host/db', 'postgres-uri')).toBe(true)
    expect(validateFormat('mysql://user:pass@host/db', 'postgres-uri')).toBe(false)
  })

  it('validates redis-uri format', () => {
    expect(validateFormat('redis://localhost:6379', 'redis-uri')).toBe(true)
    expect(validateFormat('rediss://user:pass@host:6380', 'redis-uri')).toBe(true)
    expect(validateFormat('http://localhost:6379', 'redis-uri')).toBe(false)
  })

  it('validates random-bytes-32 format (hex)', () => {
    const hex64 = 'a'.repeat(64)
    expect(validateFormat(hex64, 'random-bytes-32')).toBe(true)
    expect(validateFormat('tooshort', 'random-bytes-32')).toBe(false)
  })

  it('validates random-bytes-32 format (base64)', () => {
    // 32 bytes = 44 base64 chars (with optional padding)
    const base64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='
    expect(validateFormat(base64, 'random-bytes-32')).toBe(true)
  })

  it('validates json format', () => {
    expect(validateFormat('{"key":"value"}', 'json')).toBe(true)
    expect(validateFormat('[1,2,3]', 'json')).toBe(true)
    expect(validateFormat('not json', 'json')).toBe(false)
  })
})

describe('getRequiredForStage', () => {
  const schema = defineSecrets({
    DATABASE_URL: {
      description: 'DB connection',
      required: true,
      stages: ['dev', 'staging', 'production'],
      format: 'postgres-uri',
    },
    REDIS_URL: {
      description: 'Redis connection',
      required: true,
      stages: ['staging', 'production'],
      format: 'redis-uri',
    },
    DEBUG_KEY: {
      description: 'Debug key',
      required: false,
      stages: ['dev'],
      format: 'string',
    },
    TEST_SECRET: {
      description: 'Test only secret',
      required: true,
      stages: ['test'],
      format: 'string',
    },
  })

  it('returns required secrets for production', () => {
    const required = getRequiredForStage(schema, 'production')
    expect(required).toContain('DATABASE_URL')
    expect(required).toContain('REDIS_URL')
    expect(required).not.toContain('DEBUG_KEY')
    expect(required).not.toContain('TEST_SECRET')
  })

  it('returns required secrets for dev', () => {
    const required = getRequiredForStage(schema, 'dev')
    expect(required).toContain('DATABASE_URL')
    expect(required).not.toContain('REDIS_URL')
    expect(required).not.toContain('DEBUG_KEY')
  })

  it('returns required secrets for test', () => {
    const required = getRequiredForStage(schema, 'test')
    expect(required).toContain('TEST_SECRET')
    expect(required).not.toContain('DATABASE_URL')
  })

  it('excludes optional secrets', () => {
    const required = getRequiredForStage(schema, 'dev')
    expect(required).not.toContain('DEBUG_KEY')
  })
})
