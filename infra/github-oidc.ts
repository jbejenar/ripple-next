/**
 * GitHub OIDC Federation — SST Infrastructure Component
 *
 * Creates the OIDC identity provider and IAM deploy role that allows
 * GitHub Actions to authenticate to AWS without storing credentials.
 *
 * Run once per AWS account. After creation, GitHub Actions workflows
 * can assume the deploy role using the OIDC token.
 *
 * @see ADR-026 (GitHub OIDC federation)
 *
 * Usage in sst.config.ts:
 * ```ts
 * import { createGitHubOIDC } from './infra/github-oidc'
 * const oidc = createGitHubOIDC({
 *   repo: 'jbejenar/ripple-next',
 *   branches: ['main'],
 *   environments: ['staging', 'production'],
 * })
 * ```
 */

import * as aws from '@pulumi/aws'

export interface GitHubOIDCConfig {
  /** GitHub repository in 'owner/repo' format. */
  repo: string
  /** Branches allowed to assume the deploy role. */
  branches?: string[]
  /** GitHub Environments allowed to assume the deploy role. */
  environments?: string[]
  /** Additional downstream repos that can assume the role. */
  downstreamRepos?: string[]
  /** IAM policies to attach to the deploy role. */
  additionalPolicies?: string[]
}

export function createGitHubOIDC(config: GitHubOIDCConfig) {
  // ── OIDC Provider ───────────────────────────────────────────────
  // Tells AWS to trust identity tokens from GitHub Actions.
  // Only needs to exist once per AWS account.

  const oidcProvider = new aws.iam.OpenIdConnectProvider('GitHubOIDC', {
    url: 'https://token.actions.githubusercontent.com',
    clientIdList: ['sts.amazonaws.com'],
    // GitHub's thumbprint — AWS validates this automatically for GitHub
    thumbprintList: ['ffffffffffffffffffffffffffffffffffffffff'],
  })

  // ── Trust Policy ────────────────────────────────────────────────
  // Defines exactly which repos, branches, and environments can assume
  // the deploy role. Scoped as tightly as possible.

  const allowedSubjects: string[] = []

  // Branch-based access
  if (config.branches) {
    for (const branch of config.branches) {
      allowedSubjects.push(`repo:${config.repo}:ref:refs/heads/${branch}`)
    }
  }

  // Environment-based access
  if (config.environments) {
    for (const env of config.environments) {
      allowedSubjects.push(`repo:${config.repo}:environment:${env}`)
    }
  }

  // Downstream fleet repos
  if (config.downstreamRepos) {
    for (const repo of config.downstreamRepos) {
      allowedSubjects.push(`repo:${repo}:ref:refs/heads/main`)
    }
  }

  // If no specific subjects, allow main branch by default
  if (allowedSubjects.length === 0) {
    allowedSubjects.push(`repo:${config.repo}:ref:refs/heads/main`)
  }

  const trustPolicy = oidcProvider.arn.apply((arn) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { Federated: arn },
          Action: 'sts:AssumeRoleWithWebIdentity',
          Condition: {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            },
            StringLike: {
              'token.actions.githubusercontent.com:sub': allowedSubjects,
            },
          },
        },
      ],
    })
  )

  // ── Deploy Role ─────────────────────────────────────────────────
  // The role GitHub Actions assumes. Has permissions for:
  // - SST deployment (CloudFormation, Lambda, S3, etc.)
  // - Secrets read/write (SSM, Secrets Manager)
  // - Database migrations (RDS connectivity)

  const deployRole = new aws.iam.Role('GitHubDeployRole', {
    assumeRolePolicy: trustPolicy,
    maxSessionDuration: 3600, // 1 hour — minimum viable window
    tags: {
      'ripple-next': 'true',
      purpose: 'github-actions-deploy',
      'managed-by': 'sst',
    },
  })

  // ── Permissions ─────────────────────────────────────────────────
  // Attach managed policies for the deploy workflow.
  // In production, replace with a custom policy scoped to specific
  // resources. These are intentionally broad for initial setup.

  const managedPolicies = [
    // SST deployment needs broad AWS access for CloudFormation
    // TODO: Replace with custom least-privilege policy per ADR-026
    'arn:aws:iam::aws:policy/PowerUserAccess',
  ]

  // Add any additional policies
  if (config.additionalPolicies) {
    managedPolicies.push(...config.additionalPolicies)
  }

  for (const [index, policyArn] of managedPolicies.entries()) {
    new aws.iam.RolePolicyAttachment(`DeployPolicy-${index}`, {
      role: deployRole,
      policyArn,
    })
  }

  // ── Secrets Access Policy ───────────────────────────────────────
  // Scoped policy for reading/writing secrets during deployment.

  new aws.iam.RolePolicy('DeploySecretsPolicy', {
    role: deployRole,
    policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: [
            'ssm:GetParameter',
            'ssm:GetParameters',
            'ssm:GetParametersByPath',
            'ssm:PutParameter',
            'ssm:DeleteParameter',
            'ssm:DescribeParameters',
          ],
          Resource: 'arn:aws:ssm:*:*:parameter/ripple-next/*',
        },
        {
          Effect: 'Allow',
          Action: [
            'secretsmanager:GetSecretValue',
            'secretsmanager:CreateSecret',
            'secretsmanager:PutSecretValue',
            'secretsmanager:DeleteSecret',
            'secretsmanager:ListSecrets',
          ],
          Resource: 'arn:aws:secretsmanager:*:*:secret:ripple-next/*',
        },
      ],
    }),
  })

  return {
    oidcProvider,
    deployRole,
    deployRoleArn: deployRole.arn,
  }
}
