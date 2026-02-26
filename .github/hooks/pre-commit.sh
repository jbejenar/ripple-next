#!/bin/bash
# Validate before commit

# Check for secrets
if grep -rn "AKIA\|sk_live\|sk_test\|password\s*=" --include="*.ts" --include="*.vue" \
   apps/ packages/ services/ 2>/dev/null | grep -v ".test.ts" | grep -v "node_modules"; then
  echo "Error: Potential secrets detected in code"
  exit 1
fi

# Check for console.log in non-test files
if grep -rn "console\.log" apps/ packages/ services/ --include="*.ts" --include="*.vue" \
   | grep -v ".test.ts" | grep -v "node_modules" | grep -v ".nuxt" | grep -v "handlers/index.ts"; then
  echo "Warning: console.log found — consider removing before merge"
fi
