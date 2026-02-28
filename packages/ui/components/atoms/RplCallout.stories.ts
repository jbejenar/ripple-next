import type { Meta, StoryObj } from '@storybook/vue3'
import RplCallout from './RplCallout.vue'

const meta: Meta<typeof RplCallout> = {
  title: 'Atoms/RplCallout',
  component: RplCallout,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'error']
    }
  }
}

export default meta
type Story = StoryObj<typeof RplCallout>

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    title: 'Important information'
  },
  render: (args) => ({
    components: { RplCallout },
    setup() {
      return { args }
    },
    template: '<RplCallout v-bind="args">This service is available to all Victorian residents aged 18 and over.</RplCallout>'
  })
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    title: 'Did you know?'
  },
  render: (args) => ({
    components: { RplCallout },
    setup() {
      return { args }
    },
    template: '<RplCallout v-bind="args">You can apply for this service online and track your application status in real time.</RplCallout>'
  })
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Eligibility confirmed'
  },
  render: (args) => ({
    components: { RplCallout },
    setup() {
      return { args }
    },
    template: '<RplCallout v-bind="args">Based on the information provided, you are eligible for this concession.</RplCallout>'
  })
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Deadline approaching'
  },
  render: (args) => ({
    components: { RplCallout },
    setup() {
      return { args }
    },
    template: '<RplCallout v-bind="args">Applications for the 2026 grant round close on 30 June 2026.</RplCallout>'
  })
}

export const WithoutTitle: Story = {
  args: {
    variant: 'primary'
  },
  render: (args) => ({
    components: { RplCallout },
    setup() {
      return { args }
    },
    template: '<RplCallout v-bind="args">For more information, contact Service Victoria on 1300 366 356.</RplCallout>'
  })
}
