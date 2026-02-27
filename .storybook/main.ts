import type { StorybookConfig } from '@storybook/vue3-vite'
import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ['../packages/ui/**/*.stories.@(ts|tsx)', '../packages/ui/**/*.mdx'],
  addons: [],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  viteFinal(config) {
    config.plugins = config.plugins || []
    config.plugins.push(vue())
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      vue: resolve(__dirname, '../node_modules/vue/dist/vue.esm-bundler.js')
    }
    return config
  }
}

export default config
