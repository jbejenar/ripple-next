import { z } from 'zod'

/**
 * Environment variable schema — validates the env contract defined in .env.example.
 *
 * Used by:
 *   - scripts/validate-env.mjs (bootstrap + CI gate)
 *   - pnpm doctor (optional structured diagnostics)
 *
 * Categories:
 *   - required: must be set for the app to start
 *   - optional: have sensible defaults or are only needed in specific environments
 */

const postgresUrlSchema = z
  .string()
  .min(1, 'Must not be empty')
  .startsWith('postgres', 'Must be a PostgreSQL connection string')

const redisUrlSchema = z
  .string()
  .min(1, 'Must not be empty')
  .startsWith('redis', 'Must be a Redis connection string')

/**
 * Core environment variables required for the application to function.
 * Validated at bootstrap and in CI.
 */
export const requiredEnvSchema = z.object({
  DATABASE_URL: postgresUrlSchema,
  NUXT_DATABASE_URL: postgresUrlSchema,
  REDIS_URL: redisUrlSchema,
})

/**
 * Optional environment variables with defaults or only needed in specific contexts.
 * Validated with warnings (non-blocking).
 */
export const optionalEnvSchema = z.object({
  NUXT_REDIS_URL: redisUrlSchema.optional(),

  // Auth / OIDC — empty means MockAuthProvider
  NUXT_OIDC_ISSUER_URL: z.string().url().optional().or(z.literal('')),
  NUXT_OIDC_CLIENT_ID: z.string().optional(),
  NUXT_OIDC_CLIENT_SECRET: z.string().optional(),
  NUXT_OIDC_REDIRECT_URI: z.string().url().optional().or(z.literal('')),
  NUXT_SESSION_SECRET: z.string().min(16, 'Session secret must be at least 16 characters').optional(),

  // Storage
  STORAGE_ENDPOINT: z.string().url().optional().or(z.literal('')),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_FROM: z.string().email().optional().or(z.literal('')),

  // CMS — empty means MockCmsProvider
  NUXT_CMS_BASE_URL: z.string().url().optional().or(z.literal('')),
  NUXT_CMS_SITE_ID: z.string().optional(),
  NUXT_CMS_AUTH_USER: z.string().optional(),
  NUXT_CMS_AUTH_PASSWORD: z.string().optional(),

  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  NUXT_PUBLIC_APP_NAME: z.string().optional(),
  NUXT_PUBLIC_WS_URL: z.string().url().optional().or(z.literal('')),
})

/**
 * Full environment schema (required + optional).
 */
export const envSchema = requiredEnvSchema.merge(optionalEnvSchema)

export type RequiredEnv = z.infer<typeof requiredEnvSchema>
export type OptionalEnv = z.infer<typeof optionalEnvSchema>
export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables and return structured diagnostics.
 *
 * @param env - Object containing environment variables (defaults to process.env)
 * @returns Structured result with passed/failed/warnings arrays
 */
export function validateEnv(env: Record<string, string | undefined> = process.env as Record<string, string | undefined>): EnvValidationResult {
  const passed: string[] = []
  const failed: EnvValidationIssue[] = []
  const warnings: EnvValidationIssue[] = []

  // Validate required vars
  const requiredResult = requiredEnvSchema.safeParse(env)
  if (requiredResult.success) {
    for (const key of Object.keys(requiredEnvSchema.shape)) {
      passed.push(key)
    }
  } else {
    for (const issue of requiredResult.error.issues) {
      const key = issue.path[0] as string
      failed.push({ key, message: issue.message, severity: 'error' })
    }
    // Track passed required vars that didn't fail
    for (const key of Object.keys(requiredEnvSchema.shape)) {
      if (!failed.some((f) => f.key === key)) {
        passed.push(key)
      }
    }
  }

  // Validate optional vars (non-blocking — only warn)
  const optionalResult = optionalEnvSchema.safeParse(env)
  if (!optionalResult.success) {
    for (const issue of optionalResult.error.issues) {
      const key = issue.path[0] as string
      // Only warn if the var is actually set but invalid
      if (env[key] !== undefined && env[key] !== '') {
        warnings.push({ key, message: issue.message, severity: 'warning' })
      }
    }
  }

  return {
    valid: failed.length === 0,
    passed,
    failed,
    warnings,
  }
}

export interface EnvValidationIssue {
  key: string
  message: string
  severity: 'error' | 'warning'
}

export interface EnvValidationResult {
  valid: boolean
  passed: string[]
  failed: EnvValidationIssue[]
  warnings: EnvValidationIssue[]
}
