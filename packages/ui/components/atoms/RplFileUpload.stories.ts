import type { Meta, StoryObj } from '@storybook/vue3'
import RplFileUpload from './RplFileUpload.vue'

const meta: Meta<typeof RplFileUpload> = {
  title: 'Atoms/RplFileUpload',
  component: RplFileUpload,
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplFileUpload>

export const Default: Story = {
  args: {
    label: 'Upload document'
  }
}

export const WithAcceptFilter: Story = {
  args: {
    label: 'Upload photo',
    accept: '.jpg,.jpeg,.png,.webp'
  }
}

export const MultipleFiles: Story = {
  args: {
    label: 'Upload supporting documents',
    multiple: true,
    accept: '.pdf,.doc,.docx'
  }
}

export const Required: Story = {
  args: {
    label: 'Proof of identity',
    required: true,
    accept: '.pdf,.jpg,.png'
  }
}

export const WithError: Story = {
  args: {
    label: 'Upload document',
    error: 'File size must be under 10MB',
    required: true
  }
}

export const Disabled: Story = {
  args: {
    label: 'Upload document',
    disabled: true
  }
}
