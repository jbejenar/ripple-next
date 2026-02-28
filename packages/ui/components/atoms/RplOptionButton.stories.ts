import type { Meta, StoryObj } from '@storybook/vue3'
import RplOptionButton from './RplOptionButton.vue'

const meta: Meta<typeof RplOptionButton> = {
  title: 'Atoms/RplOptionButton',
  component: RplOptionButton,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplOptionButton>

export const Default: Story = {
  args: {
    label: 'How would you rate this service?',
    name: 'rating',
    options: [
      { value: 'poor', label: 'Poor' },
      { value: 'fair', label: 'Fair' },
      { value: 'good', label: 'Good' },
      { value: 'excellent', label: 'Excellent' }
    ]
  }
}

export const WithSelection: Story = {
  args: {
    label: 'Appointment type',
    name: 'appointment',
    modelValue: 'in-person',
    options: [
      { value: 'in-person', label: 'In person' },
      { value: 'phone', label: 'Phone call' },
      { value: 'video', label: 'Video call' }
    ]
  }
}

export const Required: Story = {
  args: {
    label: 'Select your preference',
    name: 'preference',
    required: true,
    options: [
      { value: 'morning', label: 'Morning' },
      { value: 'afternoon', label: 'Afternoon' },
      { value: 'evening', label: 'Evening' }
    ]
  }
}

export const WithError: Story = {
  args: {
    label: 'Select a time slot',
    name: 'timeslot-error',
    error: 'Please select a time slot',
    required: true,
    options: [
      { value: '9am', label: '9:00 AM' },
      { value: '11am', label: '11:00 AM' },
      { value: '2pm', label: '2:00 PM' }
    ]
  }
}

export const WithDisabledOption: Story = {
  args: {
    label: 'Delivery method',
    name: 'delivery',
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'express', label: 'Express' },
      { value: 'same-day', label: 'Same day (sold out)', disabled: true }
    ]
  }
}
