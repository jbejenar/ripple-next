import type { Meta, StoryObj } from '@storybook/vue3'
import RplDropdown from './RplDropdown.vue'

const meta: Meta<typeof RplDropdown> = {
  title: 'Atoms/RplDropdown',
  component: RplDropdown,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplDropdown>

export const Default: Story = {
  args: {
    label: 'State or territory',
    options: [
      { value: 'vic', label: 'Victoria' },
      { value: 'nsw', label: 'New South Wales' },
      { value: 'qld', label: 'Queensland' },
      { value: 'sa', label: 'South Australia' },
      { value: 'wa', label: 'Western Australia' },
      { value: 'tas', label: 'Tasmania' },
      { value: 'nt', label: 'Northern Territory' },
      { value: 'act', label: 'Australian Capital Territory' }
    ]
  }
}

export const WithSelection: Story = {
  args: {
    label: 'State or territory',
    modelValue: 'vic',
    options: [
      { value: 'vic', label: 'Victoria' },
      { value: 'nsw', label: 'New South Wales' },
      { value: 'qld', label: 'Queensland' }
    ]
  }
}

export const Required: Story = {
  args: {
    label: 'Document type',
    required: true,
    placeholder: 'Select a document type',
    options: [
      { value: 'passport', label: 'Passport' },
      { value: 'licence', label: 'Driver licence' },
      { value: 'medicare', label: 'Medicare card' }
    ]
  }
}

export const WithError: Story = {
  args: {
    label: 'Document type',
    error: 'Please select a document type',
    required: true,
    options: [
      { value: 'passport', label: 'Passport' },
      { value: 'licence', label: 'Driver licence' }
    ]
  }
}

export const Disabled: Story = {
  args: {
    label: 'Category',
    modelValue: 'general',
    disabled: true,
    options: [
      { value: 'general', label: 'General enquiry' },
      { value: 'complaint', label: 'Complaint' }
    ]
  }
}
