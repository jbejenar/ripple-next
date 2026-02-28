import type { Meta, StoryObj } from '@storybook/vue3'
import RplBreadcrumb from './RplBreadcrumb.vue'

const meta: Meta<typeof RplBreadcrumb> = {
  title: 'Atoms/RplBreadcrumb',
  component: RplBreadcrumb,
  tags: ['autodocs'],
  argTypes: {
    ariaLabel: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplBreadcrumb>

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', url: '/' },
      { label: 'Services', url: '/services' },
      { label: 'Health', url: '/services/health' },
      { label: 'Mental health support' }
    ]
  }
}

export const TwoLevels: Story = {
  args: {
    items: [
      { label: 'Home', url: '/' },
      { label: 'Current page' }
    ]
  }
}

export const SingleItem: Story = {
  args: {
    items: [
      { label: 'Home' }
    ]
  }
}
