import type { Meta, StoryObj } from '@storybook/vue3'
import RplSkipLink from './RplSkipLink.vue'

const meta: Meta<typeof RplSkipLink> = {
  title: 'Atoms/RplSkipLink',
  component: RplSkipLink,
  tags: ['autodocs'],
  argTypes: {
    target: { control: 'text' },
    label: { control: 'text' }
  },
  parameters: {
    docs: {
      description: {
        component: 'Skip navigation link for keyboard and screen reader users. Becomes visible on focus. Required by WCAG 2.4.1.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof RplSkipLink>

export const Default: Story = {
  args: {
    target: '#main-content',
    label: 'Skip to main content'
  },
  render: (args) => ({
    components: { RplSkipLink },
    setup() {
      return { args }
    },
    template: `
      <div>
        <RplSkipLink v-bind="args" />
        <p style="margin-top: 2rem; color: #666;">Tab into this story to see the skip link appear.</p>
        <div id="main-content" style="margin-top: 1rem; padding: 1rem; border: 1px dashed #ccc;">
          <p>Main content area</p>
        </div>
      </div>
    `
  })
}

export const CustomTarget: Story = {
  args: {
    target: '#sidebar',
    label: 'Skip to sidebar'
  }
}
