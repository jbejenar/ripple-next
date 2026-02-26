---
applyTo: "sst.config.ts,infra/**"
---
# Infrastructure Instructions
- This project uses SST v3 (Pulumi engine) — NEVER use CDK, CloudFormation, or SAM
- Infrastructure is defined in TypeScript in sst.config.ts
- Use SST high-level components (sst.aws.Nuxt, sst.aws.Queue, sst.aws.Postgres, etc.)
- Lambda is the default compute — only use ECS Fargate for >15min jobs or WebSockets
- Always use the `link` prop to connect resources to functions
- Access linked resources via `import { Resource } from "sst"`
- Each PR can be deployed to its own isolated stage: `npx sst deploy --stage pr-123`
- Production stage uses `removal: "retain"` and `protect: true`
- Use `nat: "ec2"` for VPC (cheaper than NAT Gateway)
- Use Aurora Serverless v2 for Postgres (scales to near-zero)
