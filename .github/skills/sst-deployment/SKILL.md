# SST Deployment Skill

## When to use

When deploying the application or modifying infrastructure.

## Key commands

- `npx sst dev` — Live development (proxies Lambda to local machine)
- `npx sst deploy --stage pr-123` — Deploy isolated PR environment
- `npx sst deploy --stage staging` — Deploy to staging
- `npx sst deploy --stage production` — Deploy to production
- `npx sst remove --stage pr-123` — Tear down PR environment

## Adding new infrastructure

1. Edit `sst.config.ts`
2. Use SST high-level components (`sst.aws.Queue`, `sst.aws.Bucket`, etc.)
3. Link resources to functions: `link: [newResource]`
4. Access in code: `import { Resource } from "sst"` → `Resource.NewResource.url`

## Decision: Lambda vs ECS

- Lambda: request-response, <15 min, queue consumers, cron jobs
- ECS Fargate: >15 min jobs, WebSocket servers, batch processing
- Never EKS

## Important

- Never use CDK or CloudFormation
- Never hardcode ARNs or URLs
- Production uses `removal: "retain"` and `protect: true`
