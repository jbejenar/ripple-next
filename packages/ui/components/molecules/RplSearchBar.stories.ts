import type { Meta, StoryObj } from '@storybook/vue3'
import RplSearchBar from './RplSearchBar.vue'

const meta: Meta<typeof RplSearchBar> = {
  title: 'Molecules/RplSearchBar',
  component: RplSearchBar,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    ariaLabel: { control: 'text' },
    modelValue: { control: 'text' },
    buttonLabel: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplSearchBar>

export const Default: Story = {
  args: {
    placeholder: 'Search this site',
    modelValue: ''
  }
}

export const WithValue: Story = {
  args: {
    placeholder: 'Search this site',
    modelValue: 'government services'
  }
}

export const CustomLabels: Story = {
  args: {
    placeholder: 'Find a service...',
    ariaLabel: 'Find a service',
    buttonLabel: 'Go',
    modelValue: ''
  }
}
