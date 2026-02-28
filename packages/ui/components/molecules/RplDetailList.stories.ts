import type { Meta, StoryObj } from '@storybook/vue3'
import RplDetailList from './RplDetailList.vue'

const meta: Meta<typeof RplDetailList> = {
  title: 'Molecules/RplDetailList',
  component: RplDetailList,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['stacked', 'inline', 'grid'] },
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplDetailList>

const contactDetails = [
  { term: 'Organisation', description: 'Department of Premier and Cabinet' },
  { term: 'Phone', description: '1300 366 356' },
  { term: 'Email', description: 'info@dpc.vic.gov.au' },
  { term: 'Address', description: '1 Treasury Place, Melbourne VIC 3002' }
]

export const Stacked: Story = {
  args: {
    title: 'Contact information',
    details: contactDetails,
    variant: 'stacked'
  }
}

export const Inline: Story = {
  args: {
    title: 'Contact information',
    details: contactDetails,
    variant: 'inline'
  }
}

export const Grid: Story = {
  args: {
    title: 'Service details',
    details: [
      { term: 'Service type', description: 'Online application' },
      { term: 'Processing time', description: '5-10 business days' },
      { term: 'Fee', description: '$45.00' },
      { term: 'Eligibility', description: 'Victorian residents aged 18+' }
    ],
    variant: 'grid'
  }
}

export const WithoutTitle: Story = {
  args: {
    details: contactDetails,
    variant: 'stacked'
  }
}
