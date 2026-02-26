import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'apps/web/vitest.config.ts',
  {
    test: {
      name: 'ui',
      root: './packages/ui',
      environment: 'happy-dom',
      include: ['tests/**/*.test.ts']
    }
  },
  {
    test: {
      name: 'db',
      root: './packages/db',
      include: ['**/*.test.ts']
    }
  },
  {
    test: {
      name: 'queue',
      root: './packages/queue',
      include: ['tests/**/*.test.ts']
    }
  },
  {
    test: {
      name: 'auth',
      root: './packages/auth',
      include: ['tests/**/*.test.ts']
    }
  },
  {
    test: {
      name: 'events',
      root: './packages/events',
      include: ['**/*.test.ts']
    }
  },
  {
    test: {
      name: 'worker',
      root: './services/worker',
      include: ['tests/**/*.test.ts']
    }
  }
])
