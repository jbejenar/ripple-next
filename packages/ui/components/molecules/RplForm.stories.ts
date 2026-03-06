import type { Meta, StoryObj } from '@storybook/vue3'
import RplForm from './RplForm.vue'

const meta: Meta<typeof RplForm> = {
  title: 'Molecules/RplForm',
  component: RplForm,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    title: { control: 'text' },
    hideOnSuccess: { control: 'boolean' },
    submissionState: { control: 'object' }
  }
}

export default meta
type Story = StoryObj<typeof RplForm>

export const Default: Story = {
  render: (args) => ({
    components: { RplForm },
    setup: () => ({ args }),
    template: `
      <RplForm v-bind="args">
        <label>
          Name
          <input type="text" placeholder="Enter your name" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
        <label>
          Email
          <input type="email" placeholder="Enter your email" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
        <label>
          Message
          <textarea placeholder="Your message" rows="4" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem"></textarea>
        </label>
      </RplForm>
    `
  }),
  args: {
    id: 'default-form',
    submissionState: { status: 'idle' }
  }
}

export const Submitting: Story = {
  render: (args) => ({
    components: { RplForm },
    setup: () => ({ args }),
    template: `
      <RplForm v-bind="args">
        <label>
          Name
          <input type="text" value="John Doe" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
        <label>
          Email
          <input type="email" value="john@example.com" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
      </RplForm>
    `
  }),
  args: {
    id: 'submitting-form',
    submissionState: { status: 'submitting' }
  }
}

export const Success: Story = {
  render: (args) => ({
    components: { RplForm },
    setup: () => ({ args }),
    template: `
      <RplForm v-bind="args">
        <label>
          Name
          <input type="text" value="John Doe" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
      </RplForm>
    `
  }),
  args: {
    id: 'success-form',
    submissionState: {
      status: 'success',
      title: 'Thank you',
      message: 'Your form has been submitted successfully.'
    }
  }
}

export const Error: Story = {
  render: (args) => ({
    components: { RplForm },
    setup: () => ({ args }),
    template: `
      <RplForm v-bind="args">
        <label>
          Name
          <input type="text" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
      </RplForm>
    `
  }),
  args: {
    id: 'error-form',
    submissionState: {
      status: 'error',
      title: 'Submission failed',
      message: 'Please fix the errors below and try again.'
    }
  }
}

export const WithTitle: Story = {
  render: (args) => ({
    components: { RplForm },
    setup: () => ({ args }),
    template: `
      <RplForm v-bind="args">
        <label>
          Name
          <input type="text" placeholder="Enter your name" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
        <label>
          Email
          <input type="email" placeholder="Enter your email" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
      </RplForm>
    `
  }),
  args: {
    id: 'titled-form',
    title: 'Contact Us',
    submissionState: { status: 'idle' }
  }
}

export const HideOnSuccess: Story = {
  render: (args) => ({
    components: { RplForm },
    setup: () => ({ args }),
    template: `
      <RplForm v-bind="args">
        <label>
          Name
          <input type="text" style="display:block;width:100%;padding:0.5rem;margin-top:0.25rem" />
        </label>
      </RplForm>
    `
  }),
  args: {
    id: 'hide-on-success-form',
    hideOnSuccess: true,
    submissionState: {
      status: 'success',
      title: 'Thank you',
      message: 'Your submission has been received. The form is now hidden.'
    }
  }
}
