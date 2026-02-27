import { defineWorkspace } from 'vitest/config'

/**
 * Coverage thresholds by risk tier:
 *   Tier 1 (critical — auth, db, queue): 60% minimum
 *   Tier 2 (infrastructure — email, storage, events): 40% minimum
 *   Tier 3 (UI, services): 20% minimum
 *
 * These thresholds ratchet up as test coverage improves.
 * Never lower a threshold — only raise it.
 */
const tier1Coverage = {
  provider: 'v8' as const,
  thresholds: { lines: 60, functions: 60, branches: 50, statements: 60 }
}
const tier2Coverage = {
  provider: 'v8' as const,
  thresholds: { lines: 40, functions: 40, branches: 30, statements: 40 }
}
const tier3Coverage = {
  provider: 'v8' as const,
  thresholds: { lines: 20, functions: 20, branches: 10, statements: 20 }
}

export default defineWorkspace([
  'apps/web/vitest.config.ts',
  'packages/ui/vitest.config.ts',
  {
    test: {
      name: 'db',
      root: './packages/db',
      include: ['**/*.test.ts'],
      coverage: tier1Coverage
    }
  },
  {
    test: {
      name: 'queue',
      root: './packages/queue',
      include: ['tests/**/*.test.ts'],
      coverage: tier1Coverage
    }
  },
  {
    test: {
      name: 'auth',
      root: './packages/auth',
      include: ['tests/**/*.test.ts'],
      coverage: tier1Coverage
    }
  },
  {
    test: {
      name: 'cms',
      root: './packages/cms',
      include: ['tests/**/*.test.ts'],
      coverage: tier2Coverage
    }
  },
  {
    test: {
      name: 'email',
      root: './packages/email',
      include: ['tests/**/*.test.ts'],
      coverage: tier2Coverage
    }
  },
  {
    test: {
      name: 'storage',
      root: './packages/storage',
      include: ['tests/**/*.test.ts'],
      coverage: tier2Coverage
    }
  },
  {
    test: {
      name: 'events',
      root: './packages/events',
      include: ['**/*.test.ts'],
      coverage: tier2Coverage
    }
  },
  {
    test: {
      name: 'worker',
      root: './services/worker',
      include: ['tests/**/*.test.ts'],
      coverage: tier3Coverage
    }
  }
])
