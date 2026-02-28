import type { Meta, StoryObj } from '@storybook/vue3'
import RplTabs from './RplTabs.vue'

const meta: Meta<typeof RplTabs> = {
  title: 'Molecules/RplTabs',
  component: RplTabs,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplTabs>

const defaultTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'how-to-apply', label: 'How to apply' }
]

export const Default: Story = {
  args: {
    tabs: defaultTabs
  },
  render: (args) => ({
    components: { RplTabs },
    setup() {
      return { args }
    },
    template: `
      <RplTabs v-bind="args">
        <template #overview><p>Overview content goes here.</p></template>
        <template #eligibility><p>Eligibility criteria and requirements.</p></template>
        <template #how-to-apply><p>Steps to submit your application.</p></template>
      </RplTabs>
    `
  })
}

export const WithActiveTab: Story = {
  args: {
    tabs: defaultTabs,
    modelValue: 'eligibility'
  },
  render: (args) => ({
    components: { RplTabs },
    setup() {
      return { args }
    },
    template: `
      <RplTabs v-bind="args">
        <template #overview><p>Overview content goes here.</p></template>
        <template #eligibility><p>Eligibility criteria and requirements.</p></template>
        <template #how-to-apply><p>Steps to submit your application.</p></template>
      </RplTabs>
    `
  })
}
