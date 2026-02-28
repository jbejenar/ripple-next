import type { Meta, StoryObj } from '@storybook/vue3'
import RplTextarea from './RplTextarea.vue'

const meta: Meta<typeof RplTextarea> = {
  title: 'Atoms/RplTextarea',
  component: RplTextarea,
  tags: ['autodocs'],
  argTypes: {
    rows: { control: 'number' },
    maxlength: { control: 'number' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplTextarea>

export const Default: Story = {
  args: {
    label: 'Additional comments',
    placeholder: 'Enter your comments here...'
  }
}

export const WithCharacterCount: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Tell us what you think...',
    maxlength: 500,
    modelValue: 'Great service!'
  }
}

export const Required: Story = {
  args: {
    label: 'Reason for application',
    required: true,
    rows: 6,
    placeholder: 'Please provide your reason...'
  }
}

export const WithError: Story = {
  args: {
    label: 'Description',
    error: 'Description is required',
    required: true
  }
}

export const Disabled: Story = {
  args: {
    label: 'Submitted feedback',
    modelValue: 'This feedback has already been submitted and cannot be edited.',
    disabled: true
  }
}
