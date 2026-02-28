import type { Meta, StoryObj } from '@storybook/vue3'
import RplTag from './RplTag.vue'

const meta: Meta<typeof RplTag> = {
  title: 'Atoms/RplTag',
  component: RplTag,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'error']
    },
    label: { control: 'text' },
    href: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplTag>

export const Default: Story = {
  args: {
    label: 'Category',
    variant: 'default'
  }
}

export const Info: Story = {
  args: {
    label: 'Information',
    variant: 'info'
  }
}

export const Success: Story = {
  args: {
    label: 'Approved',
    variant: 'success'
  }
}

export const Warning: Story = {
  args: {
    label: 'Pending review',
    variant: 'warning'
  }
}

export const Error: Story = {
  args: {
    label: 'Rejected',
    variant: 'error'
  }
}

export const AsLink: Story = {
  args: {
    label: 'View all',
    variant: 'info',
    href: '#'
  }
}
