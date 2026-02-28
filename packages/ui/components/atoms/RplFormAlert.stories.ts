import type { Meta, StoryObj } from '@storybook/vue3'
import RplFormAlert from './RplFormAlert.vue'

const meta: Meta<typeof RplFormAlert> = {
  title: 'Atoms/RplFormAlert',
  component: RplFormAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'success', 'warning', 'info']
    }
  }
}

export default meta
type Story = StoryObj<typeof RplFormAlert>

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Form submission failed',
    message: 'Please correct the errors below and try again.'
  }
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Form submitted',
    message: 'Your application has been received. You will receive a confirmation email shortly.'
  }
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Unsaved changes',
    message: 'You have unsaved changes that will be lost if you leave this page.'
  }
}

export const Info: Story = {
  args: {
    variant: 'info',
    message: 'Fields marked with an asterisk (*) are required.'
  }
}

export const MessageOnly: Story = {
  args: {
    variant: 'error',
    message: 'An unexpected error occurred. Please try again later.'
  }
}
