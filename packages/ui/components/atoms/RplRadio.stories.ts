import type { Meta, StoryObj } from '@storybook/vue3'
import RplRadio from './RplRadio.vue'

const meta: Meta<typeof RplRadio> = {
  title: 'Atoms/RplRadio',
  component: RplRadio,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplRadio>

export const Default: Story = {
  args: {
    label: 'Preferred contact method',
    name: 'contact-method',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'post', label: 'Post' }
    ]
  }
}

export const WithSelection: Story = {
  args: {
    label: 'Employment status',
    name: 'employment',
    modelValue: 'employed',
    options: [
      { value: 'employed', label: 'Employed' },
      { value: 'self-employed', label: 'Self-employed' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'retired', label: 'Retired' }
    ]
  }
}

export const Required: Story = {
  args: {
    label: 'Do you consent to data collection?',
    name: 'consent',
    required: true,
    options: [
      { value: 'yes', label: 'Yes, I consent' },
      { value: 'no', label: 'No, I do not consent' }
    ]
  }
}

export const WithError: Story = {
  args: {
    label: 'Preferred contact method',
    name: 'contact-error',
    error: 'Please select a contact method',
    required: true,
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' }
    ]
  }
}

export const WithDisabledOption: Story = {
  args: {
    label: 'Service type',
    name: 'service',
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'express', label: 'Express' },
      { value: 'premium', label: 'Premium (unavailable)', disabled: true }
    ]
  }
}
