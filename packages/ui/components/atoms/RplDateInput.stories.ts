import type { Meta, StoryObj } from '@storybook/vue3'
import RplDateInput from './RplDateInput.vue'

const meta: Meta<typeof RplDateInput> = {
  title: 'Atoms/RplDateInput',
  component: RplDateInput,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplDateInput>

export const Default: Story = {
  args: {
    label: 'Date of birth'
  }
}

export const WithValue: Story = {
  args: {
    label: 'Start date',
    modelValue: '2026-03-01'
  }
}

export const WithRange: Story = {
  args: {
    label: 'Appointment date',
    min: '2026-03-01',
    max: '2026-12-31',
    required: true
  }
}

export const WithError: Story = {
  args: {
    label: 'Date of birth',
    error: 'Please enter a valid date',
    required: true
  }
}

export const Disabled: Story = {
  args: {
    label: 'Submission deadline',
    modelValue: '2026-06-30',
    disabled: true
  }
}
