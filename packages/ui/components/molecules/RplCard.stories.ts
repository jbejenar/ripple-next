import type { Meta, StoryObj } from '@storybook/vue3'
import RplCard from './RplCard.vue'

const meta: Meta<typeof RplCard> = {
  title: 'Molecules/RplCard',
  component: RplCard,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplCard>

export const Default: Story = {
  args: {
    title: 'Card Title',
    description: 'This is a description of the card content that provides context.'
  }
}

export const AsLink: Story = {
  args: {
    title: 'Linked Card',
    description: 'Click this card to navigate somewhere.',
    href: '#'
  }
}

export const WithSlotContent: Story = {
  args: {
    title: 'Custom Content'
  },
  render: (args) => ({
    components: { RplCard },
    setup() {
      return { args }
    },
    template: `
      <RplCard v-bind="args">
        <p style="margin: 0; color: #666;">Custom slot content goes here.</p>
      </RplCard>
    `
  })
}
