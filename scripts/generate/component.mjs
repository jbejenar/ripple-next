#!/usr/bin/env node
/**
 * Component Generator — scaffolds a Vue SFC, test, story, and index export.
 *
 * Usage:
 *   pnpm generate:component <name> [--tier=atoms|molecules|organisms] [--dry-run]
 *
 * Examples:
 *   pnpm generate:component Checkbox                  # default tier: atoms
 *   pnpm generate:component Pagination --tier=molecules
 *   pnpm generate:component DataTable --tier=organisms --dry-run
 *
 * Output files:
 *   packages/ui/components/{tier}/Rpl{Name}.vue
 *   packages/ui/components/{tier}/Rpl{Name}.stories.ts
 *   packages/ui/tests/Rpl{Name}.test.ts
 *   packages/ui/index.ts (export appended)
 */
import { join } from 'node:path'
import { ROOT, toPascalCase, toKebabCase, writeFile, appendToFile, parseArgs } from './lib.mjs'

const VALID_TIERS = ['atoms', 'molecules', 'organisms']

export function generateComponent(name, options = {}) {
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(name)) {
    throw new Error('Component name must be alphanumeric with optional hyphens')
  }
  const pascal = toPascalCase(name)
  const componentName = pascal.startsWith('Rpl') ? pascal : `Rpl${pascal}`
  const displayName = componentName.replace(/^Rpl/, '')
  const kebab = toKebabCase(displayName)
  const tier = options.tier || 'atoms'
  const dryRun = options.dryRun || false

  if (!VALID_TIERS.includes(tier)) {
    console.error(`Error: Invalid tier "${tier}". Must be one of: ${VALID_TIERS.join(', ')}`)
    process.exit(1)
  }

  const tierTitle = tier.charAt(0).toUpperCase() + tier.slice(1)
  const compDir = join(ROOT, 'packages/ui/components', tier)
  const testDir = join(ROOT, 'packages/ui/tests')
  const indexFile = join(ROOT, 'packages/ui/index.ts')

  console.log(`\nGenerating component: ${componentName} (${tier})`)
  console.log('─'.repeat(40))

  // 1. Vue SFC
  writeFile(
    join(compDir, `${componentName}.vue`),
    `<script setup lang="ts">
export interface ${componentName}Props {
  /** TODO: Define component props */
}

withDefaults(defineProps<${componentName}Props>(), {})

defineEmits<{
  /** TODO: Define component events */
}>()
</script>

<template>
  <div class="rpl-${kebab}">
    <slot />
  </div>
</template>

<style scoped>
.rpl-${kebab} {
  /* TODO: Add component styles using --rpl-* design tokens */
}
</style>
`,
    dryRun
  )

  // 2. Storybook story
  writeFile(
    join(compDir, `${componentName}.stories.ts`),
    `import type { Meta, StoryObj } from '@storybook/vue3'
import ${componentName} from './${componentName}.vue'

const meta: Meta<typeof ${componentName}> = {
  title: '${tierTitle}/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
  argTypes: {
    // TODO: Add argTypes for each prop
  }
}

export default meta
type Story = StoryObj<typeof ${componentName}>

export const Default: Story = {
  args: {},
  render: (args) => ({
    components: { ${componentName} },
    setup() {
      return { args }
    },
    template: '<${componentName} v-bind="args">${displayName}</${componentName}>'
  })
}
`,
    dryRun
  )

  // 3. Test file
  writeFile(
    join(testDir, `${componentName}.test.ts`),
    `import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ${componentName} from '../components/${tier}/${componentName}.vue'

describe('${componentName}', () => {
  it('renders slot content', () => {
    const wrapper = mount(${componentName}, {
      slots: { default: 'Test content' }
    })
    expect(wrapper.text()).toBe('Test content')
  })

  it('applies root class', () => {
    const wrapper = mount(${componentName})
    expect(wrapper.classes()).toContain('rpl-${kebab}')
  })

  // TODO: Add prop and event tests
})
`,
    dryRun
  )

  // 4. Append export to index.ts
  const tierComment = tier === 'atoms' ? 'Atoms' : tier === 'molecules' ? 'Molecules' : 'Organisms'
  const exportLine = `export { default as ${componentName} } from './components/${tier}/${componentName}.vue'`
  appendToFile(indexFile, exportLine, dryRun)

  console.log()
  console.log(`Done! Next steps:`)
  console.log(`  1. Edit the SFC: packages/ui/components/${tier}/${componentName}.vue`)
  console.log(`  2. Add props, events, and styles`)
  console.log(`  3. Update the test and story`)
  console.log(`  4. Run: pnpm test && pnpm lint && pnpm typecheck`)
}

// CLI entrypoint
if (process.argv[1]?.endsWith('component.mjs')) {
  const { positional, flags } = parseArgs(process.argv)
  const name = positional[0]
  const tierArg = [...flags].find((f) => f.startsWith('--tier='))
  const tier = tierArg ? tierArg.split('=')[1] : 'atoms'
  const dryRun = flags.has('--dry-run')

  if (!name) {
    console.error('Usage: pnpm generate:component <name> [--tier=atoms|molecules|organisms] [--dry-run]')
    process.exit(1)
  }

  generateComponent(name, { tier, dryRun })
}
