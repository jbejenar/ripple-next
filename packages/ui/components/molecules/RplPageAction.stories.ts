import type { Meta, StoryObj } from '@storybook/vue3'
import RplPageAction from './RplPageAction.vue'

const meta: Meta<typeof RplPageAction> = {
  title: 'Molecules/RplPageAction',
  component: RplPageAction,
  tags: ['autodocs'],
  argTypes: {
    ariaLabel: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplPageAction>

export const Default: Story = {
  render: (args) => ({
    components: { RplPageAction },
    setup() {
      return { args }
    },
    template: `
      <RplPageAction v-bind="args">
        <button type="button" style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #ccc; background: #fff; cursor: pointer;">Action 1</button>
        <button type="button" style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #ccc; background: #fff; cursor: pointer;">Action 2</button>
      </RplPageAction>
    `
  })
}

export const WithUpperSlot: Story = {
  render: (args) => ({
    components: { RplPageAction },
    setup() {
      return { args }
    },
    template: `
      <RplPageAction v-bind="args">
        <template #upper>
          <button type="button" style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #ccc; background: #f5f5f5; cursor: pointer;">Secondary action</button>
        </template>
        <button type="button" style="padding: 0.5rem 1rem; border-radius: 4px; border: none; background: #0052c2; color: #fff; cursor: pointer;">Primary action</button>
      </RplPageAction>
    `
  })
}

export const PrintButton: Story = {
  args: {
    ariaLabel: 'Print actions'
  },
  render: (args) => ({
    components: { RplPageAction },
    setup() {
      return { args }
    },
    template: `
      <RplPageAction v-bind="args">
        <button type="button" style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #ccc; background: #fff; cursor: pointer;">Print this page</button>
      </RplPageAction>
    `
  })
}

export const BackToTop: Story = {
  args: {
    ariaLabel: 'Navigation actions'
  },
  render: (args) => ({
    components: { RplPageAction },
    setup() {
      return { args }
    },
    template: `
      <RplPageAction v-bind="args">
        <button type="button" style="padding: 0.5rem 1rem; border-radius: 50%; border: 1px solid #ccc; background: #fff; cursor: pointer; width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center;">&uarr;</button>
      </RplPageAction>
    `
  })
}
