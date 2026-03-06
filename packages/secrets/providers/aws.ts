import { SSMClient, GetParameterCommand, PutParameterCommand, GetParametersByPathCommand } from '@aws-sdk/client-ssm'
import type { SecretsProvider } from '../types'
import type { SecretsSchema, ValidationResult, ValidationError, Stage } from '@ripple-next/config'
import { validateFormat, getRequiredForStage } from '@ripple-next/config'

export interface AwsSecretsProviderOptions {
  /** SSM Parameter Store path prefix (e.g. '/ripple-next/production/'). */
  pathPrefix: string
  /** Deployment stage for validation. */
  stage: Stage
  /** AWS region. Defaults to AWS_REGION env var or us-east-1. */
  region?: string
}

/**
 * AWS SSM Parameter Store secrets provider.
 *
 * Uses SSM Parameter Store for secret storage and retrieval.
 * Parameters are stored as SecureString by default.
 */
export class AwsSecretsProvider implements SecretsProvider {
  private client: SSMClient
  private pathPrefix: string
  private stage: Stage

  constructor(options: AwsSecretsProviderOptions) {
    this.pathPrefix = options.pathPrefix.endsWith('/')
      ? options.pathPrefix
      : options.pathPrefix + '/'
    this.stage = options.stage
    this.client = new SSMClient({
      region: options.region ?? process.env['AWS_REGION'] ?? 'us-east-1',
    })
  }

  async get(name: string): Promise<string | undefined> {
    try {
      const result = await this.client.send(
        new GetParameterCommand({
          Name: this.pathPrefix + name,
          WithDecryption: true,
        })
      )
      return result.Parameter?.Value ?? undefined
    } catch (err: unknown) {
      if (isParameterNotFound(err)) {
        return undefined
      }
      throw err
    }
  }

  async getRequired(name: string): Promise<string> {
    const value = await this.get(name)
    if (value === undefined) {
      throw new Error(`RPL-SEC-001: Secret "${name}" not found in AWS SSM at ${this.pathPrefix}${name}`)
    }
    return value
  }

  async set(name: string, value: string): Promise<void> {
    await this.client.send(
      new PutParameterCommand({
        Name: this.pathPrefix + name,
        Value: value,
        Type: 'SecureString',
        Overwrite: true,
      })
    )
  }

  async list(): Promise<string[]> {
    const names: string[] = []
    let nextToken: string | undefined

    do {
      const result = await this.client.send(
        new GetParametersByPathCommand({
          Path: this.pathPrefix,
          Recursive: true,
          WithDecryption: false,
          NextToken: nextToken,
        })
      )

      for (const param of result.Parameters ?? []) {
        if (param.Name) {
          names.push(param.Name.slice(this.pathPrefix.length))
        }
      }

      nextToken = result.NextToken
    } while (nextToken)

    return names
  }

  async validate(schema: SecretsSchema): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const requiredNames = getRequiredForStage(schema, this.stage)

    for (const name of requiredNames) {
      const value = await this.get(name)
      if (value === undefined) {
        errors.push({
          name,
          code: 'RPL-SEC-001',
          message: `Required secret "${name}" not found in AWS SSM for stage "${this.stage}"`,
        })
        continue
      }

      const def = schema[name]
      if (!validateFormat(value, def.format)) {
        errors.push({
          name,
          code: 'RPL-SEC-002',
          message: `Secret "${name}" failed format validation (expected ${def.format})`,
        })
      }
    }

    return { valid: errors.length === 0, errors }
  }
}

function isParameterNotFound(err: unknown): boolean {
  if (typeof err === 'object' && err !== null && 'name' in err) {
    const errorName = (err as { name: string }).name
    return errorName === 'ParameterNotFound' || errorName === 'ParameterVersionNotFound'
  }
  return false
}
