import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Resolve workspace packages to source (not dist) for tests
      '@ripple-next/db': resolve(__dirname, '../../packages/db/index.ts'),
      '@ripple-next/auth': resolve(__dirname, '../../packages/auth/index.ts'),
      '@ripple-next/queue': resolve(__dirname, '../../packages/queue/index.ts'),
      '@ripple-next/email': resolve(__dirname, '../../packages/email/index.ts'),
      '@ripple-next/storage': resolve(__dirname, '../../packages/storage/index.ts'),
      '@ripple-next/events': resolve(__dirname, '../../packages/events/index.ts'),
      '@ripple-next/shared': resolve(__dirname, '../../packages/shared/index.ts'),
      '@ripple-next/validation': resolve(__dirname, '../../packages/validation/index.ts')
    }
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['components/**', 'composables/**', 'server/**', 'stores/**']
    }
  }
})
