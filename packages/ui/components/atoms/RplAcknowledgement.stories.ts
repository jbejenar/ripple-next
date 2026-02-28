import type { Meta, StoryObj } from '@storybook/vue3'
import RplAcknowledgement from './RplAcknowledgement.vue'

const meta: Meta<typeof RplAcknowledgement> = {
  title: 'Atoms/RplAcknowledgement',
  component: RplAcknowledgement,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['country', 'people']
    }
  }
}

export default meta
type Story = StoryObj<typeof RplAcknowledgement>

export const AcknowledgementOfCountry: Story = {
  args: {
    type: 'country'
  },
  render: (args) => ({
    components: { RplAcknowledgement },
    setup() {
      return { args }
    },
    template: '<RplAcknowledgement v-bind="args">The Victorian Government acknowledges Aboriginal and Torres Strait Islander people as the Traditional Custodians of the land and acknowledges and pays respect to their Elders, past and present.</RplAcknowledgement>'
  })
}

export const AcknowledgementOfPeople: Story = {
  args: {
    type: 'people'
  },
  render: (args) => ({
    components: { RplAcknowledgement },
    setup() {
      return { args }
    },
    template: '<RplAcknowledgement v-bind="args">We acknowledge the Traditional Owners of Country throughout Victoria and pay our respects to the ongoing living cultures of First Peoples.</RplAcknowledgement>'
  })
}

export const WithTextProp: Story = {
  args: {
    type: 'country',
    text: 'The Victorian Government acknowledges Aboriginal and Torres Strait Islander people as the Traditional Custodians of the land.'
  }
}
