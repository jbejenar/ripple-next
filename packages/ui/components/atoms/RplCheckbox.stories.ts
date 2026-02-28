import type { Meta, StoryObj } from '@storybook/vue3'
import RplCheckbox from './RplCheckbox.vue'

const meta: Meta<typeof RplCheckbox> = {
  title: 'Atoms/RplCheckbox',
  component: RplCheckbox,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplCheckbox>

export const Default: Story = {
  args: {
    label: 'I agree to the terms and conditions'
  }
}

export const Checked: Story = {
  args: {
    label: 'Subscribe to newsletter',
    modelValue: true
  }
}

export const Required: Story = {
  args: {
    label: 'I accept the privacy policy',
    required: true
  }
}

export const WithError: Story = {
  args: {
    label: 'I agree to the terms and conditions',
    error: 'You must agree to continue',
    required: true
  }
}

export const Disabled: Story = {
  args: {
    label: 'This option is not available',
    disabled: true
  }
}
