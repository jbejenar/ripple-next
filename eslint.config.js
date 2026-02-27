import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        ref: 'readonly',
        computed: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        useHead: 'readonly',
        useRoute: 'readonly',
        useRouter: 'readonly',
        useFetch: 'readonly',
        useState: 'readonly',
        navigateTo: 'readonly',
        definePageMeta: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        createError: 'readonly',
        showError: 'readonly',
        readonly: 'readonly'
      }
    },
    plugins: {
      vue: vue
    },
    rules: {
      ...vue.configs['flat/recommended'].rules,
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Promoted from warn → error: agents need hard pass/fail signals
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  },
  // Scripts that legitimately need console output
  {
    files: ['**/migrate.ts', '**/seed.ts', '**/handlers/index.ts', '**/*.handler.ts', 'scripts/**'],
    rules: {
      'no-console': 'off'
    }
  },
  // Tests are allowed to be looser
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**', '**/conformance/**'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.output/**',
      '**/.nuxt/**',
      '**/.sst/**',
      '**/coverage/**',
      'storybook-static/**',
      '**/*.d.ts',
      '**/*.d.ts.map'
    ]
  }
]
