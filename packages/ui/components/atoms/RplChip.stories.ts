import type { Meta, StoryObj } from '@storybook/vue3'
import RplChip from './RplChip.vue'

const meta: Meta<typeof RplChip> = {
  title: 'Atoms/RplChip',
  component: RplChip,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    dismissible: { control: 'boolean' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplChip>

export const Default: Story = {
  args: {
    label: 'Filter'
  }
}

export const Active: Story = {
  args: {
    label: 'Selected filter',
    active: true
  }
}

export const Dismissible: Story = {
  args: {
    label: 'Removable',
    dismissible: true
  }
}

export const ActiveDismissible: Story = {
  args: {
    label: 'Active + removable',
    active: true,
    dismissible: true
  }
}

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true
  }
}
