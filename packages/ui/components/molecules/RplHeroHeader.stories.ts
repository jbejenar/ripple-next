import type { Meta, StoryObj } from '@storybook/vue3'
import RplHeroHeader from './RplHeroHeader.vue'

const meta: Meta<typeof RplHeroHeader> = {
  title: 'Molecules/RplHeroHeader',
  component: RplHeroHeader,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplHeroHeader>

export const Default: Story = {
  args: {
    title: 'Welcome to Victoria',
    description: 'Information and services for the people of Victoria.'
  }
}

export const TitleOnly: Story = {
  args: {
    title: 'Page Title'
  }
}

export const WithSlotContent: Story = {
  args: {
    title: 'Find a service',
    description: 'Search for government services and information.'
  },
  render: (args) => ({
    components: { RplHeroHeader },
    setup() {
      return { args }
    },
    template: `
      <RplHeroHeader v-bind="args">
        <div style="margin-top: 1.5rem">
          <input
            type="search"
            placeholder="Search..."
            style="padding: 0.75rem 1rem; font-size: 1rem; border: none; border-radius: 4px; width: 100%; max-width: 400px;"
          />
        </div>
      </RplHeroHeader>
    `
  })
}
