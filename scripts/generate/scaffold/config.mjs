/**
 * Scaffold: Config files.
 *
 * Generates .env.example, .nvmrc, eslint.config.js,
 * .changeset/config.json, and .gitignore.
 */
import { join } from 'node:path'
import { writeFileExternal, copyFileFromSource } from '../lib.mjs'

export function scaffoldConfig(targetDir, config, options = {}) {
  const { name } = config
  const opts = { dryRun: options.dryRun, force: options.force }

  console.log('\n  Config Files')
  console.log('  ' + '─'.repeat(30))

  // ── .env.example ──────────────────────────────────────────────────
  writeFileExternal(
    join(targetDir, '.env.example'),
    `# ${name} — Environment Variables
# Copy this file to .env and fill in values.
# See scripts/validate-env.mjs for validation rules.

# Required
NODE_ENV=development

# Database (if applicable)
# DATABASE_URL=postgresql://user:pass@localhost:5432/${name.replace(/-/g, '_')}

# Redis (if applicable)
# REDIS_URL=redis://localhost:6379

# Auth (if applicable)
# OIDC_ISSUER=
# OIDC_CLIENT_ID=
# OIDC_CLIENT_SECRET=
`,
    targetDir,
    opts
  )

  // ── .nvmrc (literal copy from ripple-next source) ─────────────────
  copyFileFromSource('.nvmrc', '.nvmrc', targetDir, opts)

  // ── eslint.config.js ──────────────────────────────────────────────
  writeFileExternal(
    join(targetDir, 'eslint.config.js'),
    `import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Strict rules — aligned with ripple-next golden path
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Exempt test files and scripts from no-console
    files: ['**/*.test.ts', '**/*.test.tsx', 'scripts/**'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.nuxt/', '.output/', 'coverage/'],
  },
]
`,
    targetDir,
    opts
  )

  // ── .changeset/config.json ────────────────────────────────────────
  writeFileExternal(
    join(targetDir, '.changeset', 'config.json'),
    JSON.stringify(
      {
        $schema: 'https://unpkg.com/@changesets/config@3.1.1/schema.json',
        changelog: '@changesets/changelog-github',
        commit: false,
        fixed: [],
        linked: [],
        access: 'restricted',
        baseBranch: 'main',
        updateInternalDependencies: 'patch',
        ignore: [],
      },
      null,
      2
    ) + '\n',
    targetDir,
    opts
  )

  // ── .gitignore ────────────────────────────────────────────────────
  writeFileExternal(
    join(targetDir, '.gitignore'),
    `# Dependencies
node_modules/

# Build output
dist/
.output/
.nuxt/
.nitro/
.cache/

# Environment
.env
.env.local
.env.*.local

# Test coverage
coverage/
test-results/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Turbo
.turbo/
`,
    targetDir,
    opts
  )
}
