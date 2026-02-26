#!/bin/bash
# Runs after Copilot coding agent finishes a session

echo "Running post-session checks..."

# Ensure no console.log statements leaked in
if grep -r "console.log" apps/ packages/ services/ --include="*.ts" --include="*.vue" \
   | grep -v "*.test.ts" | grep -v "node_modules" | grep -v ".nuxt"; then
  echo "Warning: Found console.log statements — please remove before merging"
fi

# Verify no `any` types were introduced
if grep -rn ": any" apps/ packages/ services/ --include="*.ts" \
   | grep -v "*.test.ts" | grep -v "node_modules" | grep -v ".nuxt" \
   | grep -v "// eslint-disable"; then
  echo "Warning: Found 'any' types — please use proper types"
fi

# Ensure no CDK/CloudFormation leaked in
if grep -rn "aws-cdk\|cloudformation\|@aws-cdk" package.json packages/*/package.json \
   services/*/package.json 2>/dev/null; then
  echo "Error: CDK/CloudFormation dependency detected — this project uses SST v3 (Pulumi)"
fi

# Run full check suite
pnpm lint
pnpm typecheck
pnpm test
