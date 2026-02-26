---
on:
  issues:
    types: [opened]
permissions:
  contents: read
  issues: write
---

# Issue Triage

Analyze the new issue and add appropriate labels.

## Steps
1. Read the issue title and description
2. Determine the type: bug, feature, docs, infrastructure
3. Determine priority: critical, high, medium, low
4. Determine affected area: frontend, api, db, infra, ui, testing
5. Add labels accordingly
6. If the issue is a bug, add reproduction steps template if missing
