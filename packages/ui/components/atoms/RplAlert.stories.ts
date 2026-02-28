import type { Meta, StoryObj } from '@storybook/vue3'
import RplAlert from './RplAlert.vue'

const meta: Meta<typeof RplAlert> = {
  title: 'Atoms/RplAlert',
  component: RplAlert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'success', 'warning', 'info']
    },
    dismissible: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplAlert>

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Service unavailable',
    dismissible: false
  },
  render: (args) => ({
    components: { RplAlert },
    setup() {
      return { args }
    },
    template: '<RplAlert v-bind="args">This service is temporarily unavailable. Please try again later.</RplAlert>'
  })
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Application submitted'
  },
  render: (args) => ({
    components: { RplAlert },
    setup() {
      return { args }
    },
    template: '<RplAlert v-bind="args">Your application has been successfully submitted. You will receive a confirmation email within 24 hours.</RplAlert>'
  })
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Scheduled maintenance'
  },
  render: (args) => ({
    components: { RplAlert },
    setup() {
      return { args }
    },
    template: '<RplAlert v-bind="args">This service will be unavailable on Saturday 15 March from 10pm to 2am for scheduled maintenance.</RplAlert>'
  })
}

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'COVID-19 update'
  },
  render: (args) => ({
    components: { RplAlert },
    setup() {
      return { args }
    },
    template: '<RplAlert v-bind="args">For the latest COVID-19 information and advice, visit the Department of Health website.</RplAlert>'
  })
}

export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'New feature available',
    dismissible: true
  },
  render: (args) => ({
    components: { RplAlert },
    setup() {
      return { args }
    },
    template: '<RplAlert v-bind="args">You can now save your progress and return to this form later.</RplAlert>'
  })
}
