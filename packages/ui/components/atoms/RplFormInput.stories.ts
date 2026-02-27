import type { Meta, StoryObj } from '@storybook/vue3'
import RplFormInput from './RplFormInput.vue'

const meta: Meta<typeof RplFormInput> = {
  title: 'Atoms/RplFormInput',
  component: RplFormInput,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url']
    },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplFormInput>

export const Default: Story = {
  args: {
    label: 'Full name',
    placeholder: 'Enter your full name'
  }
}

export const Required: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
    required: true
  }
}

export const WithError: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    modelValue: 'invalid-email',
    error: 'Please enter a valid email address',
    required: true
  }
}

export const Disabled: Story = {
  args: {
    label: 'Username',
    modelValue: 'locked-user',
    disabled: true
  }
}

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true
  }
}
