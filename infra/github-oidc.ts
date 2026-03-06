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
  // Least-privilege custom policy scoped to SST deploy services.
  // Replaces PowerUserAccess per ADR-026 / RN-075 (RB-014).

  const appName = 'ripple-next'
  const region = 'ap-southeast-2'

  new aws.iam.RolePolicy('SSTDeployPolicy', {
    role: deployRole,
    policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        // ── CloudFormation (SST orchestration) ──────────────────
        {
          Sid: 'CloudFormation',
          Effect: 'Allow',
          Action: [
            'cloudformation:CreateStack',
            'cloudformation:UpdateStack',
            'cloudformation:DeleteStack',
            'cloudformation:DescribeStacks',
            'cloudformation:DescribeStackEvents',
            'cloudformation:DescribeStackResources',
            'cloudformation:GetTemplate',
            'cloudformation:GetTemplateSummary',
            'cloudformation:ListStackResources',
            'cloudformation:CreateChangeSet',
            'cloudformation:DeleteChangeSet',
            'cloudformation:DescribeChangeSet',
            'cloudformation:ExecuteChangeSet',
            'cloudformation:ListChangeSets',
            'cloudformation:TagResource',
            'cloudformation:UntagResource',
          ],
          Resource: `arn:aws:cloudformation:${region}:*:stack/${appName}-*/*`,
        },
        // ── Lambda ──────────────────────────────────────────────
        {
          Sid: 'Lambda',
          Effect: 'Allow',
          Action: [
            'lambda:CreateFunction',
            'lambda:UpdateFunctionCode',
            'lambda:UpdateFunctionConfiguration',
            'lambda:DeleteFunction',
            'lambda:GetFunction',
            'lambda:GetFunctionConfiguration',
            'lambda:ListFunctions',
            'lambda:InvokeFunction',
            'lambda:AddPermission',
            'lambda:RemovePermission',
            'lambda:CreateAlias',
            'lambda:UpdateAlias',
            'lambda:DeleteAlias',
            'lambda:PublishVersion',
            'lambda:ListVersionsByFunction',
            'lambda:GetPolicy',
            'lambda:TagResource',
            'lambda:UntagResource',
            'lambda:PutFunctionEventInvokeConfig',
            'lambda:CreateEventSourceMapping',
            'lambda:UpdateEventSourceMapping',
            'lambda:DeleteEventSourceMapping',
            'lambda:GetEventSourceMapping',
            'lambda:ListEventSourceMappings',
            'lambda:GetLayerVersion',
            'lambda:PublishLayerVersion',
            'lambda:DeleteLayerVersion',
            'lambda:ListLayerVersions',
          ],
          Resource: [
            `arn:aws:lambda:${region}:*:function:${appName}-*`,
            `arn:aws:lambda:${region}:*:layer:${appName}-*`,
            `arn:aws:lambda:${region}:*:layer:${appName}-*:*`,
            `arn:aws:lambda:${region}:*:event-source-mapping:*`,
          ],
        },
        // ── S3 (assets, deployment artifacts) ───────────────────
        {
          Sid: 'S3',
          Effect: 'Allow',
          Action: [
            's3:CreateBucket',
            's3:DeleteBucket',
            's3:GetBucketLocation',
            's3:GetBucketPolicy',
            's3:PutBucketPolicy',
            's3:DeleteBucketPolicy',
            's3:GetBucketCORS',
            's3:PutBucketCORS',
            's3:GetBucketNotification',
            's3:PutBucketNotification',
            's3:GetBucketTagging',
            's3:PutBucketTagging',
            's3:GetBucketVersioning',
            's3:PutBucketVersioning',
            's3:GetEncryptionConfiguration',
            's3:PutEncryptionConfiguration',
            's3:GetLifecycleConfiguration',
            's3:PutLifecycleConfiguration',
            's3:ListBucket',
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:GetBucketPublicAccessBlock',
            's3:PutBucketPublicAccessBlock',
          ],
          Resource: [
            `arn:aws:s3:::${appName}-*`,
            `arn:aws:s3:::${appName}-*/*`,
          ],
        },
        // ── DynamoDB ────────────────────────────────────────────
        {
          Sid: 'DynamoDB',
          Effect: 'Allow',
          Action: [
            'dynamodb:CreateTable',
            'dynamodb:DeleteTable',
            'dynamodb:DescribeTable',
            'dynamodb:UpdateTable',
            'dynamodb:TagResource',
            'dynamodb:UntagResource',
            'dynamodb:ListTagsOfResource',
            'dynamodb:DescribeTimeToLive',
            'dynamodb:UpdateTimeToLive',
            'dynamodb:DescribeContinuousBackups',
            'dynamodb:UpdateContinuousBackups',
          ],
          Resource: `arn:aws:dynamodb:${region}:*:table/${appName}-*`,
        },
        // ── SQS ─────────────────────────────────────────────────
        {
          Sid: 'SQS',
          Effect: 'Allow',
          Action: [
            'sqs:CreateQueue',
            'sqs:DeleteQueue',
            'sqs:GetQueueAttributes',
            'sqs:SetQueueAttributes',
            'sqs:GetQueueUrl',
            'sqs:TagQueue',
            'sqs:UntagQueue',
            'sqs:ListQueueTags',
          ],
          Resource: `arn:aws:sqs:${region}:*:${appName}-*`,
        },
        // ── SES (email) ─────────────────────────────────────────
        {
          Sid: 'SES',
          Effect: 'Allow',
          Action: [
            'ses:CreateEmailIdentity',
            'ses:DeleteEmailIdentity',
            'ses:GetEmailIdentity',
            'ses:PutEmailIdentityDkimSigningAttributes',
            'ses:CreateConfigurationSet',
            'ses:DeleteConfigurationSet',
            'ses:GetConfigurationSet',
            'ses:TagResource',
            'ses:UntagResource',
          ],
          Resource: '*',
        },
        // ── IAM (Lambda execution roles) ────────────────────────
        {
          Sid: 'IAM',
          Effect: 'Allow',
          Action: [
            'iam:CreateRole',
            'iam:DeleteRole',
            'iam:GetRole',
            'iam:UpdateRole',
            'iam:PassRole',
            'iam:AttachRolePolicy',
            'iam:DetachRolePolicy',
            'iam:PutRolePolicy',
            'iam:DeleteRolePolicy',
            'iam:GetRolePolicy',
            'iam:ListRolePolicies',
            'iam:ListAttachedRolePolicies',
            'iam:TagRole',
            'iam:UntagRole',
            'iam:CreateInstanceProfile',
            'iam:DeleteInstanceProfile',
            'iam:GetInstanceProfile',
            'iam:AddRoleToInstanceProfile',
            'iam:RemoveRoleFromInstanceProfile',
            'iam:CreateServiceLinkedRole',
          ],
          Resource: [
            `arn:aws:iam::*:role/${appName}-*`,
            `arn:aws:iam::*:instance-profile/${appName}-*`,
            'arn:aws:iam::*:role/aws-service-role/*',
          ],
        },
        // ── CloudWatch (logs, alarms) ───────────────────────────
        {
          Sid: 'CloudWatch',
          Effect: 'Allow',
          Action: [
            'logs:CreateLogGroup',
            'logs:DeleteLogGroup',
            'logs:DescribeLogGroups',
            'logs:PutRetentionPolicy',
            'logs:DeleteRetentionPolicy',
            'logs:TagLogGroup',
            'logs:UntagLogGroup',
            'logs:TagResource',
            'logs:UntagResource',
          ],
          Resource: `arn:aws:logs:${region}:*:log-group:/aws/lambda/${appName}-*`,
        },
        // ── API Gateway ─────────────────────────────────────────
        {
          Sid: 'APIGateway',
          Effect: 'Allow',
          Action: [
            'apigateway:GET',
            'apigateway:POST',
            'apigateway:PUT',
            'apigateway:PATCH',
            'apigateway:DELETE',
            'apigateway:TagResource',
            'apigateway:UntagResource',
          ],
          Resource: [
            `arn:aws:apigateway:${region}::/restapis*`,
            `arn:aws:apigateway:${region}::/apis*`,
            `arn:aws:apigateway:${region}::/tags*`,
          ],
        },
        // ── SSM Parameter Store ─────────────────────────────────
        {
          Sid: 'SSM',
          Effect: 'Allow',
          Action: [
            'ssm:GetParameter',
            'ssm:GetParameters',
            'ssm:GetParametersByPath',
            'ssm:PutParameter',
            'ssm:DeleteParameter',
            'ssm:DescribeParameters',
            'ssm:AddTagsToResource',
            'ssm:RemoveTagsFromResource',
            'ssm:ListTagsForResource',
          ],
          Resource: `arn:aws:ssm:${region}:*:parameter/${appName}/*`,
        },
        // ── Secrets Manager ─────────────────────────────────────
        {
          Sid: 'SecretsManager',
          Effect: 'Allow',
          Action: [
            'secretsmanager:GetSecretValue',
            'secretsmanager:CreateSecret',
            'secretsmanager:PutSecretValue',
            'secretsmanager:DeleteSecret',
            'secretsmanager:DescribeSecret',
            'secretsmanager:TagResource',
            'secretsmanager:UntagResource',
            'secretsmanager:ListSecrets',
          ],
          Resource: `arn:aws:secretsmanager:${region}:*:secret:${appName}/*`,
        },
        // ── RDS (Aurora Serverless) ─────────────────────────────
        {
          Sid: 'RDS',
          Effect: 'Allow',
          Action: [
            'rds:CreateDBCluster',
            'rds:DeleteDBCluster',
            'rds:DescribeDBClusters',
            'rds:ModifyDBCluster',
            'rds:CreateDBSubnetGroup',
            'rds:DeleteDBSubnetGroup',
            'rds:DescribeDBSubnetGroups',
            'rds:ModifyDBSubnetGroup',
            'rds:AddTagsToResource',
            'rds:RemoveTagsFromResource',
            'rds:ListTagsForResource',
          ],
          Resource: [
            `arn:aws:rds:${region}:*:cluster:${appName}-*`,
            `arn:aws:rds:${region}:*:subgrp:${appName}-*`,
          ],
        },
        // ── VPC / EC2 (networking, NAT) ─────────────────────────
        {
          Sid: 'VPC',
          Effect: 'Allow',
          Action: [
            'ec2:CreateVpc',
            'ec2:DeleteVpc',
            'ec2:DescribeVpcs',
            'ec2:ModifyVpcAttribute',
            'ec2:CreateSubnet',
            'ec2:DeleteSubnet',
            'ec2:DescribeSubnets',
            'ec2:CreateRouteTable',
            'ec2:DeleteRouteTable',
            'ec2:DescribeRouteTables',
            'ec2:CreateRoute',
            'ec2:DeleteRoute',
            'ec2:AssociateRouteTable',
            'ec2:DisassociateRouteTable',
            'ec2:CreateInternetGateway',
            'ec2:DeleteInternetGateway',
            'ec2:DescribeInternetGateways',
            'ec2:AttachInternetGateway',
            'ec2:DetachInternetGateway',
            'ec2:AllocateAddress',
            'ec2:ReleaseAddress',
            'ec2:DescribeAddresses',
            'ec2:CreateNatGateway',
            'ec2:DeleteNatGateway',
            'ec2:DescribeNatGateways',
            'ec2:CreateSecurityGroup',
            'ec2:DeleteSecurityGroup',
            'ec2:DescribeSecurityGroups',
            'ec2:AuthorizeSecurityGroupIngress',
            'ec2:RevokeSecurityGroupIngress',
            'ec2:AuthorizeSecurityGroupEgress',
            'ec2:RevokeSecurityGroupEgress',
            'ec2:RunInstances',
            'ec2:TerminateInstances',
            'ec2:DescribeInstances',
            'ec2:DescribeAvailabilityZones',
            'ec2:CreateTags',
            'ec2:DeleteTags',
            'ec2:DescribeTags',
            'ec2:DescribeNetworkInterfaces',
            'ec2:CreateNetworkInterface',
            'ec2:DeleteNetworkInterface',
            'ec2:DescribeKeyPairs',
            'ec2:CreateKeyPair',
            'ec2:DeleteKeyPair',
            'ec2:DescribeImages',
          ],
          Resource: '*',
          Condition: {
            StringEquals: {
              'aws:RequestedRegion': region,
            },
          },
        },
        // ── ACM (TLS certificates) ──────────────────────────────
        {
          Sid: 'ACM',
          Effect: 'Allow',
          Action: [
            'acm:RequestCertificate',
            'acm:DeleteCertificate',
            'acm:DescribeCertificate',
            'acm:ListCertificates',
            'acm:AddTagsToCertificate',
            'acm:RemoveTagsFromCertificate',
          ],
          Resource: `arn:aws:acm:${region}:*:certificate/*`,
        },
        // ── EventBridge (event bus) ─────────────────────────────
        {
          Sid: 'EventBridge',
          Effect: 'Allow',
          Action: [
            'events:CreateEventBus',
            'events:DeleteEventBus',
            'events:DescribeEventBus',
            'events:PutRule',
            'events:DeleteRule',
            'events:DescribeRule',
            'events:PutTargets',
            'events:RemoveTargets',
            'events:ListTargetsByRule',
            'events:TagResource',
            'events:UntagResource',
          ],
          Resource: [
            `arn:aws:events:${region}:*:event-bus/${appName}-*`,
            `arn:aws:events:${region}:*:rule/${appName}-*`,
          ],
        },
        // ── ECS / Fargate (long-running workers) ────────────────
        {
          Sid: 'ECS',
          Effect: 'Allow',
          Action: [
            'ecs:CreateCluster',
            'ecs:DeleteCluster',
            'ecs:DescribeClusters',
            'ecs:CreateService',
            'ecs:UpdateService',
            'ecs:DeleteService',
            'ecs:DescribeServices',
            'ecs:RegisterTaskDefinition',
            'ecs:DeregisterTaskDefinition',
            'ecs:DescribeTaskDefinition',
            'ecs:ListTaskDefinitions',
            'ecs:TagResource',
            'ecs:UntagResource',
          ],
          Resource: '*',
          Condition: {
            StringEquals: {
              'aws:RequestedRegion': region,
            },
          },
        },
        // ── ECR (container images) ──────────────────────────────
        {
          Sid: 'ECR',
          Effect: 'Allow',
          Action: [
            'ecr:CreateRepository',
            'ecr:DeleteRepository',
            'ecr:DescribeRepositories',
            'ecr:GetAuthorizationToken',
            'ecr:BatchCheckLayerAvailability',
            'ecr:GetDownloadUrlForLayer',
            'ecr:BatchGetImage',
            'ecr:PutImage',
            'ecr:InitiateLayerUpload',
            'ecr:UploadLayerPart',
            'ecr:CompleteLayerUpload',
            'ecr:TagResource',
            'ecr:UntagResource',
            'ecr:SetRepositoryPolicy',
            'ecr:GetRepositoryPolicy',
          ],
          Resource: `arn:aws:ecr:${region}:*:repository/${appName}-*`,
        },
        {
          Sid: 'ECRAuth',
          Effect: 'Allow',
          Action: ['ecr:GetAuthorizationToken'],
          Resource: '*',
        },
        // ── ElastiCache / Redis ─────────────────────────────────
        {
          Sid: 'ElastiCache',
          Effect: 'Allow',
          Action: [
            'elasticache:CreateReplicationGroup',
            'elasticache:DeleteReplicationGroup',
            'elasticache:DescribeReplicationGroups',
            'elasticache:ModifyReplicationGroup',
            'elasticache:CreateCacheSubnetGroup',
            'elasticache:DeleteCacheSubnetGroup',
            'elasticache:DescribeCacheSubnetGroups',
            'elasticache:AddTagsToResource',
            'elasticache:RemoveTagsFromResource',
            'elasticache:ListTagsForResource',
          ],
          Resource: [
            `arn:aws:elasticache:${region}:*:replicationgroup:${appName}-*`,
            `arn:aws:elasticache:${region}:*:subnetgroup:${appName}-*`,
          ],
        },
        // ── CloudFront (CDN for Nuxt) ───────────────────────────
        {
          Sid: 'CloudFront',
          Effect: 'Allow',
          Action: [
            'cloudfront:CreateDistribution',
            'cloudfront:UpdateDistribution',
            'cloudfront:DeleteDistribution',
            'cloudfront:GetDistribution',
            'cloudfront:GetDistributionConfig',
            'cloudfront:ListDistributions',
            'cloudfront:CreateInvalidation',
            'cloudfront:TagResource',
            'cloudfront:UntagResource',
            'cloudfront:CreateFunction',
            'cloudfront:UpdateFunction',
            'cloudfront:DeleteFunction',
            'cloudfront:DescribeFunction',
            'cloudfront:PublishFunction',
            'cloudfront:CreateOriginAccessControl',
            'cloudfront:UpdateOriginAccessControl',
            'cloudfront:DeleteOriginAccessControl',
            'cloudfront:GetOriginAccessControl',
          ],
          Resource: '*',
        },
        // ── STS (caller identity for SST) ───────────────────────
        {
          Sid: 'STS',
          Effect: 'Allow',
          Action: ['sts:GetCallerIdentity'],
          Resource: '*',
        },
      ],
    }),
  })

  // Add any additional managed policies
  if (config.additionalPolicies) {
    for (const [index, policyArn] of config.additionalPolicies.entries()) {
      new aws.iam.RolePolicyAttachment(`DeployPolicy-${index}`, {
        role: deployRole,
        policyArn,
      })
    }
  }

  return {
    oidcProvider,
    deployRole,
    deployRoleArn: deployRole.arn,
  }
}
