---
on:
  schedule:
    - cron: '0 8 * * 1'
  workflow_dispatch:
permissions:
  contents: read
  pull-requests: write
safe-outputs:
  create-pull-request:
    max: 1
---

# Continuous Test Improvement

Analyze the repository for areas with low test coverage.
Identify the 3 most critical untested code paths.
Write comprehensive tests for those paths.
Open a pull request with the new tests.

Focus on:

- Lambda handlers without unit tests
- API endpoints without integration tests
- Components without component tests
- Queue consumers without handler tests

Use the project's testing conventions from AGENTS.md.
Use factories from packages/testing/factories/.
Use mock providers from packages/testing/mocks/.
Run `pnpm test` to verify all tests pass.
