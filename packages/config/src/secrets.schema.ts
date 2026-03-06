/**
 * Declarative secrets schema.
 *
 * See ADR-024 for the design rationale.
 */

/** Validation format for secret values. */
export type SecretFormat =
  | 'string'
  | 'url'
  | 'postgres-uri'
  | 'redis-uri'
  | 'random-bytes-32'
  | 'json'

/** Deployment stage. */
export type Stage = 'dev' | 'staging' | 'production' | 'test'

/** Classification of a secret's purpose. */
export type SecretKind =
  | 'api-key'
  | 'connection-string'
  | 'oauth-client'
  | 'encryption-key'
  | 'webhook-secret'

/** Field definition for structured (multi-value) secrets. */
export interface SecretFieldDefinition {
  format: SecretFormat
  description?: string
  sensitive?: boolean
}

/** Definition of a single secret in the schema. */
export interface SecretDefinition {
  /** Human and agent readable purpose. */
  description: string
  /** Whether the application can start without this secret. */
  required: boolean
  /** Which deployment stages need this secret. */
  stages: Stage[]
  /** Validation format for the value. */
  format: SecretFormat
  /** Logical group for organisation (e.g. 'database', 'auth', 'integrations'). */
  group?: string
  /** Classification for tooling and audit. */
  kind?: SecretKind
  /** Which services/packages consume this secret. */
  services?: string[]
  /** For structured/paired credentials (e.g. OAuth client). */
  fields?: Record<string, SecretFieldDefinition>
  /** Whether the platform can auto-generate this secret at boot. */
  autoGenerate?: boolean
  /** Whether this secret supports rotation. */
  rotatable?: boolean
  /** Safe default for local development. */
  devDefault?: string
  /** Whether CI/CD pipeline needs the value. */
  pipelineAccess?: boolean
  /** Whether we call them or they call us. */
  direction?: 'outbound' | 'inbound'
  /** If auto-provisioned by infrastructure (e.g. 'aws-api-gateway'). */
  managedBy?: string
}

/** The output of defineSecrets() — a typed map of secret name to definition. */
export type SecretsSchema = Record<string, SecretDefinition>

/**
 * Result of validating secrets against a schema.
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  name: string
  code: string
  message: string
}

/**
 * Define a typed secrets schema.
 *
 * Validates that each definition contains valid stages, format, and
 * consistent field configurations.
 *
 * @example
 * ```ts
 * const schema = defineSecrets({
 *   DATABASE_URL: {
 *     description: 'PostgreSQL connection string',
 *     required: true,
 *     stages: ['dev', 'staging', 'production'],
 *     format: 'postgres-uri',
 *     group: 'database',
 *   },
 * })
 * ```
 */
export function defineSecrets(definitions: Record<string, SecretDefinition>): SecretsSchema {
  const validFormats: SecretFormat[] = [
    'string',
    'url',
    'postgres-uri',
    'redis-uri',
    'random-bytes-32',
    'json',
  ]
  const validStages: Stage[] = ['dev', 'staging', 'production', 'test']

  for (const [name, def] of Object.entries(definitions)) {
    if (!def.description || def.description.trim().length === 0) {
      throw new Error(`Secret "${name}" must have a non-empty description`)
    }

    if (!Array.isArray(def.stages) || def.stages.length === 0) {
      throw new Error(`Secret "${name}" must have at least one stage`)
    }

    for (const stage of def.stages) {
      if (!validStages.includes(stage)) {
        throw new Error(
          `Secret "${name}" has invalid stage "${stage}". Valid stages: ${validStages.join(', ')}`
        )
      }
    }

    if (!validFormats.includes(def.format)) {
      throw new Error(
        `Secret "${name}" has invalid format "${def.format}". Valid formats: ${validFormats.join(', ')}`
      )
    }

    if (def.fields) {
      for (const [fieldName, fieldDef] of Object.entries(def.fields)) {
        if (!validFormats.includes(fieldDef.format)) {
          throw new Error(
            `Secret "${name}" field "${fieldName}" has invalid format "${fieldDef.format}". Valid formats: ${validFormats.join(', ')}`
          )
        }
      }
    }
  }

  return definitions
}

/**
 * Validate a secret value against a format specification.
 *
 * Returns true if the value matches the expected format; false otherwise.
 */
export function validateFormat(value: string, format: SecretFormat): boolean {
  switch (format) {
    case 'string':
      return value.length > 0
    case 'url':
      return isValidUrl(value)
    case 'postgres-uri':
      return /^postgres(ql)?:\/\/.+/.test(value)
    case 'redis-uri':
      return /^rediss?:\/\/.+/.test(value)
    case 'random-bytes-32':
      // 32 bytes = 64 hex chars, or 44 base64 chars
      return /^[a-f0-9]{64}$/i.test(value) || /^[A-Za-z0-9+/]{43}=?$/.test(value)
    case 'json':
      return isValidJson(value)
    default:
      return false
  }
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function isValidJson(value: string): boolean {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

/**
 * Get all secrets required for a given stage.
 */
export function getRequiredForStage(schema: SecretsSchema, stage: Stage): string[] {
  return Object.entries(schema)
    .filter(([, def]) => def.required && def.stages.includes(stage))
    .map(([name]) => name)
}
