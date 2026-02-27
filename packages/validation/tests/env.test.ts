import { describe, it, expect } from 'vitest'
import { validateEnv, requiredEnvSchema, optionalEnvSchema, envSchema } from '../index'

describe('env schema validation', () => {
  describe('requiredEnvSchema', () => {
    it('accepts valid required env vars', () => {
      const result = requiredEnvSchema.safeParse({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        NUXT_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing DATABASE_URL', () => {
      const result = requiredEnvSchema.safeParse({
        NUXT_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty DATABASE_URL', () => {
      const result = requiredEnvSchema.safeParse({
        DATABASE_URL: '',
        NUXT_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-postgres DATABASE_URL', () => {
      const result = requiredEnvSchema.safeParse({
        DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
        NUXT_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-redis REDIS_URL', () => {
      const result = requiredEnvSchema.safeParse({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        NUXT_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        REDIS_URL: 'http://localhost:6379',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('optionalEnvSchema', () => {
    it('accepts empty object (all optional)', () => {
      const result = optionalEnvSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts valid OIDC issuer URL', () => {
      const result = optionalEnvSchema.safeParse({
        NUXT_OIDC_ISSUER_URL: 'http://localhost:8080/realms/ripple',
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty OIDC issuer URL (uses MockAuthProvider)', () => {
      const result = optionalEnvSchema.safeParse({
        NUXT_OIDC_ISSUER_URL: '',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid NODE_ENV values', () => {
      for (const env of ['development', 'test', 'production']) {
        const result = optionalEnvSchema.safeParse({ NODE_ENV: env })
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid NODE_ENV', () => {
      const result = optionalEnvSchema.safeParse({ NODE_ENV: 'staging' })
      expect(result.success).toBe(false)
    })

    it('accepts empty CMS base URL (uses MockCmsProvider)', () => {
      const result = optionalEnvSchema.safeParse({
        NUXT_CMS_BASE_URL: '',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('validateEnv()', () => {
    it('returns valid: true for complete env', () => {
      const result = validateEnv({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        NUXT_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      })
      expect(result.valid).toBe(true)
      expect(result.passed).toContain('DATABASE_URL')
      expect(result.passed).toContain('NUXT_DATABASE_URL')
      expect(result.passed).toContain('REDIS_URL')
      expect(result.failed).toHaveLength(0)
    })

    it('returns valid: false when required vars are missing', () => {
      const result = validateEnv({})
      expect(result.valid).toBe(false)
      expect(result.failed.length).toBeGreaterThan(0)
      expect(result.failed.some((f) => f.key === 'DATABASE_URL')).toBe(true)
    })

    it('returns warnings for invalid optional vars that are set', () => {
      const result = validateEnv({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        NUXT_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
        NODE_ENV: 'staging',
      })
      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('does not warn for unset optional vars', () => {
      const result = validateEnv({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        NUXT_DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      })
      expect(result.warnings).toHaveLength(0)
    })

    it('provides structured issue details', () => {
      const result = validateEnv({
        DATABASE_URL: 'mysql://bad',
        NUXT_DATABASE_URL: 'postgres://ok@localhost:5432/db',
        REDIS_URL: 'redis://localhost:6379',
      })
      expect(result.valid).toBe(false)
      const dbIssue = result.failed.find((f) => f.key === 'DATABASE_URL')
      expect(dbIssue).toBeDefined()
      expect(dbIssue?.severity).toBe('error')
      expect(dbIssue?.message).toBeTruthy()
    })
  })

  describe('envSchema (combined)', () => {
    it('validates a complete production-like env', () => {
      const result = envSchema.safeParse({
        DATABASE_URL: 'postgres://prod:secret@db.example.com:5432/ripple',
        NUXT_DATABASE_URL: 'postgres://prod:secret@db.example.com:5432/ripple',
        REDIS_URL: 'redis://cache.example.com:6379',
        NUXT_OIDC_ISSUER_URL: 'https://auth.example.com/realms/gov',
        NUXT_OIDC_CLIENT_ID: 'ripple-web',
        NUXT_SESSION_SECRET: 'a-very-long-production-secret-key',
        NUXT_CMS_BASE_URL: 'https://content.vic.gov.au/api/v1',
        NODE_ENV: 'production',
      })
      expect(result.success).toBe(true)
    })
  })
})
