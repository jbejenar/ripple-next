/**
 * Scaffold: AI/Agent DX files.
 *
 * Generates CLAUDE.md, AGENTS.md, GitHub Copilot instructions,
 * agent definitions, topic instructions, and prompt templates.
 */
import { join } from 'node:path'
import { writeFileExternal } from '../lib.mjs'

export function scaffoldAi(targetDir, config, options = {}) {
  const { name, description } = config
  const opts = { dryRun: options.dryRun, force: options.force }

  console.log('\n  AI / Agent DX')
  console.log('  ' + '─'.repeat(30))

  // ── CLAUDE.md ─────────────────────────────────────────────────────
  writeFileExternal(
    join(targetDir, 'CLAUDE.md'),
    `# CLAUDE.md — Claude Code Configuration

## Quick Start

\`\`\`bash
pnpm bootstrap       # install + doctor + validate (first-time setup)
pnpm doctor          # validate environment
pnpm install         # install deps (if doctor passes)
pnpm test            # run all tests
pnpm lint            # lint all packages
pnpm typecheck       # type check all packages
pnpm validate:env    # validate env vars against schema
pnpm check:readiness # verify readiness.json is not stale
pnpm verify          # run ALL quality gates with summary
\`\`\`

## Project Overview

${description}. Monorepo managed with pnpm workspaces and Turborepo.
Follows the ripple-next golden-path conventions.

## Before Making Changes

1. Read \`docs/readiness.json\` to understand subsystem status
2. Run \`pnpm doctor\` to validate the environment
3. Check \`AGENTS.md\` for required validation per change type

## After Making Changes

Run \`pnpm verify\` to execute all quality gates, or run them individually:

1. \`pnpm test\` — all tests must pass
2. \`pnpm lint\` — zero errors (no-console is an error, not a warning)
3. \`pnpm typecheck\` — zero type errors
4. \`pnpm check:readiness\` — manifest must not drift

## Provider Pattern (Critical)

Every infrastructure concern uses a provider interface.
Tests ALWAYS use memory/mock providers.

## Coverage Thresholds (Enforced)

- **Tier 1** (critical packages): 60% lines/functions/statements, 50% branches
- **Tier 2** (standard packages): 40% lines/functions/statements, 30% branches
- **Tier 3** (UI, services): 20% lines/functions/statements, 10% branches

Never lower a threshold — only raise it.

## Lint Rules (Strict)

- \`no-console\` is an **error** (use \`console.warn\`/\`console.error\` if needed)
- \`@typescript-eslint/no-explicit-any\` is an **error** (use \`unknown\` + type guards)
- Test files are exempt from no-console

## AI-First Workflow Strategy

This project treats AI agents as first-class developers. Three pillars:

1. **Runbooks** — Codified procedures for common operations
2. **Error Taxonomy** — Machine-parseable error codes with remediation paths
3. **Code Generators** — Scaffolding commands for common patterns

Available generators:
\`\`\`bash
pnpm generate:component <name> [--dry-run]
pnpm generate:provider <package> <name> [--dry-run]
pnpm generate:endpoint <router> <procedure> [--dry-run]
pnpm generate:package <name> [--dry-run]
\`\`\`

## Documentation Maintenance (Default Agent Directive)

Every AI agent run that adds or modifies a subsystem MUST update:

1. \`docs/readiness.json\` — subsystem status, description, blockers
2. \`docs/product-roadmap/README.md\` — check off completed items
3. \`AGENTS.md\` — update if new subsystem added

Run \`pnpm check:readiness\` after doc changes.
`,
    targetDir,
    opts
  )

  // ── AGENTS.md ─────────────────────────────────────────────────────
  writeFileExternal(
    join(targetDir, 'AGENTS.md'),
    `# AGENTS.md — Architecture & Conventions for ${name}

## Overview

${description}.

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js 22+ | LTS |
| Package Manager | pnpm 9+ | Workspace monorepo |
| Build | Turborepo | Task orchestration |
| Language | TypeScript 5.7+ | Strict mode |
| Testing | Vitest | Risk-tiered coverage |
| Linting | ESLint flat config | Strict rules |
| CI | GitHub Actions | Reusable workflows |

## Repository Structure

\`\`\`
${name}/
├── apps/                    # Application entry points
├── packages/                # Shared packages
├── services/                # Internal services
├── scripts/                 # Quality gates, generators, runbooks
├── docs/                    # Documentation, ADRs, runbooks
│   ├── readiness.json       # Machine-readable subsystem status
│   ├── error-taxonomy.json  # Classified error codes
│   ├── adr/                 # Architecture Decision Records
│   ├── runbooks/            # Executable procedures (JSON)
│   └── product-roadmap/     # Roadmap tracking
├── .github/                 # CI/CD, agent configs, instructions
├── CLAUDE.md                # Claude Code configuration
└── AGENTS.md                # This file
\`\`\`

## Conventions

### Provider Pattern

Every infrastructure concern (auth, db, queue, email, storage) uses a provider
interface defined in \`packages/<concern>/types.ts\`. Tests always use memory/mock
providers. Production uses real implementations.

### Error Codes

Error codes follow the format \`RPL-<CATEGORY>-NNN\`. See \`docs/error-taxonomy.json\`.

### Quality Gates

All changes must pass:
- \`pnpm test\` — all tests green
- \`pnpm lint\` — zero lint errors
- \`pnpm typecheck\` — zero type errors
- \`pnpm check:readiness\` — manifest in sync

### Agent Task Routing

| Change Type | Required Validation |
|-------------|-------------------|
| New package | \`pnpm test && pnpm typecheck && pnpm check:readiness\` |
| API change | \`pnpm test && pnpm typecheck && pnpm lint\` |
| UI change | \`pnpm test && pnpm lint\` |
| Config/CI | \`pnpm verify\` |
| Docs only | \`pnpm check:readiness\` |
`,
    targetDir,
    opts
  )

  // ── .github/copilot-instructions.md ───────────────────────────────
  writeFileExternal(
    join(targetDir, '.github', 'copilot-instructions.md'),
    `# GitHub Copilot Instructions for ${name}

## Project Context

${description}. TypeScript monorepo with pnpm workspaces.

## Code Style

- Use TypeScript strict mode
- No \`any\` — use \`unknown\` with type guards
- No \`console.log\` — use \`console.warn\` or \`console.error\`
- Prefer \`const\` over \`let\`, never use \`var\`
- Use async/await, not raw promises

## Testing

- Use Vitest for all tests
- Use memory/mock providers for unit tests
- Name test files \`*.test.ts\`

## Architecture

- Provider pattern for all infrastructure concerns
- See \`AGENTS.md\` for full architecture reference
- See \`docs/readiness.json\` for subsystem status
`,
    targetDir,
    opts
  )

  // ── Agent files ───────────────────────────────────────────────────
  const agents = {
    'api-designer': {
      title: 'API Designer',
      desc: `You are an API designer agent for ${name}. Design RESTful and tRPC endpoints following project conventions. Always validate input with Zod schemas. Write tests for all new endpoints.`,
    },
    'docs-writer': {
      title: 'Documentation Writer',
      desc: `You are a documentation agent for ${name}. Maintain readiness.json, ADRs, and inline documentation. Every code change must include corresponding doc updates. Run pnpm check:readiness after changes.`,
    },
    'security-reviewer': {
      title: 'Security Reviewer',
      desc: `You are a security review agent for ${name}. Check for OWASP top 10 vulnerabilities, review auth flows, validate input sanitization, and ensure secrets are not committed. Flag any use of \`any\` type.`,
    },
    'test-engineer': {
      title: 'Test Engineer',
      desc: `You are a test engineering agent for ${name}. Write comprehensive tests using Vitest. Ensure coverage meets tier thresholds. Use memory/mock providers for unit tests. Run the full test suite before marking work as done.`,
    },
  }

  for (const [slug, agent] of Object.entries(agents)) {
    writeFileExternal(
      join(targetDir, '.github', 'agents', `${slug}.agent.md`),
      `# ${agent.title} Agent

${agent.desc}

## Key References

- \`AGENTS.md\` — Architecture and conventions
- \`CLAUDE.md\` — Quality gates and commands
- \`docs/readiness.json\` — Subsystem status
- \`docs/error-taxonomy.json\` — Error codes
`,
      targetDir,
      opts
    )
  }

  // ── Instruction files ─────────────────────────────────────────────
  const instructions = {
    api: {
      title: 'API Development',
      content: `Follow REST/tRPC conventions. Validate all input with Zod. Return typed responses. Write integration tests for every endpoint.`,
    },
    database: {
      title: 'Database',
      content: `Use the repository pattern. Write migrations for schema changes. Use provider interfaces for database access. Test with in-memory providers or Testcontainers.`,
    },
    frontend: {
      title: 'Frontend',
      content: `Use TypeScript strict mode. Follow component naming conventions. Write unit tests for components. Ensure WCAG 2.1 AA accessibility compliance.`,
    },
    infrastructure: {
      title: 'Infrastructure',
      content: `Use Infrastructure as Code. All config in version control. Use provider pattern for cloud services. Test with local providers before deploying.`,
    },
    testing: {
      title: 'Testing',
      content: `Use Vitest. Follow risk-tiered coverage thresholds. Use memory/mock providers for unit tests. Integration tests use real services via containers. Run pnpm test before committing.`,
    },
  }

  for (const [slug, instruction] of Object.entries(instructions)) {
    writeFileExternal(
      join(targetDir, '.github', 'instructions', `${slug}.instructions.md`),
      `# ${instruction.title} Instructions

${instruction.content}

## References

- See \`AGENTS.md\` for full conventions
- See \`docs/readiness.json\` for subsystem status
`,
      targetDir,
      opts
    )
  }

  // ── Prompt templates ──────────────────────────────────────────────
  const prompts = {
    'add-feature': {
      title: 'Add Feature',
      content: `## Add Feature

### Context
Describe the feature you want to add to ${name}.

### Steps
1. Check \`docs/readiness.json\` for related subsystem status
2. Implement the feature following project conventions
3. Write tests (meet coverage thresholds)
4. Update \`docs/readiness.json\` if adding a new subsystem
5. Run \`pnpm verify\` before committing`,
    },
    'add-tests': {
      title: 'Add Tests',
      content: `## Add Tests

### Context
Add or improve test coverage for a specific module.

### Steps
1. Identify coverage gaps using \`pnpm test -- --coverage\`
2. Write tests using Vitest and memory/mock providers
3. Ensure coverage meets tier thresholds
4. Run \`pnpm test\` to verify all tests pass`,
    },
    'fix-bug': {
      title: 'Fix Bug',
      content: `## Fix Bug

### Context
Describe the bug and how to reproduce it.

### Steps
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Check for similar patterns elsewhere
5. Run \`pnpm verify\` before committing`,
    },
  }

  for (const [slug, prompt] of Object.entries(prompts)) {
    writeFileExternal(
      join(targetDir, '.github', 'prompts', `${slug}.prompt.md`),
      `# ${prompt.title}

${prompt.content}
`,
      targetDir,
      opts
    )
  }
}
