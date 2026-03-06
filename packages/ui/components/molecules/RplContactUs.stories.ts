import type { Meta, StoryObj } from '@storybook/vue3'
import RplContactUs from './RplContactUs.vue'

const meta: Meta<typeof RplContactUs> = {
  title: 'Molecules/RplContactUs',
  component: RplContactUs,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplContactUs>

export const Default: Story = {
  args: {
    title: 'Contact us',
    address: {
      name: 'Jane Smith',
      department: 'Department of Premier and Cabinet',
      street: '1 Treasury Place, Melbourne VIC 3002'
    },
    items: [
      { label: 'Call 1300 000 000', url: 'tel:1300000000' },
      { label: 'info@example.vic.gov.au', url: 'mailto:info@example.vic.gov.au' }
    ]
  }
}

export const CustomTitle: Story = {
  args: {
    title: 'Get in touch with our team',
    items: [
      { label: 'Send us an email', url: 'mailto:team@example.vic.gov.au' }
    ]
  }
}

export const WithAddress: Story = {
  args: {
    address: {
      name: 'Department of Health',
      department: 'Public Health Division',
      street: '50 Lonsdale Street, Melbourne VIC 3000'
    }
  }
}

export const WithItems: Story = {
  args: {
    items: [
      { label: 'Phone: 03 9000 0000', url: 'tel:0390000000' },
      { label: 'Email: enquiries@health.vic.gov.au', url: 'mailto:enquiries@health.vic.gov.au' }
    ]
  }
}

export const NoTitle: Story = {
  args: {
    title: false,
    address: {
      name: 'Victorian Government',
      street: '1 Treasury Place, Melbourne VIC 3002'
    },
    items: [
      { label: 'Call 1300 000 000', url: 'tel:1300000000' }
    ]
  }
}

export const WithSlotContent: Story = {
  render: (args) => ({
    components: { RplContactUs },
    setup: () => ({ args }),
    template: `
      <RplContactUs v-bind="args">
        <p>For urgent enquiries, please call during business hours (9am - 5pm AEST).</p>
      </RplContactUs>
    `
  }),
  args: {
    title: 'Contact us',
    items: [
      { label: 'Call 1300 000 000', url: 'tel:1300000000' }
    ]
  }
}
