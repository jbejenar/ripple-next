import type { Meta, StoryObj } from '@storybook/vue3'
import RplResultsListing from './RplResultsListing.vue'

const meta: Meta<typeof RplResultsListing> = {
  title: 'Molecules/RplResultsListing',
  component: RplResultsListing,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    totalResults: { control: 'number' },
    ariaLabel: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplResultsListing>

const sampleResults = [
  {
    title: 'Getting a drivers licence',
    href: '/transport/licence',
    description: 'How to apply for, renew, or replace a Victorian drivers licence, including learner permits and probationary licences.',
    topic: 'Transport',
    metadata: [
      { label: 'Updated', value: '15 Feb 2026' },
      { label: 'Type', value: 'Guide' }
    ]
  },
  {
    title: 'School enrolment process',
    href: '/education/enrolment',
    description: 'Step-by-step guide to enrolling your child in a Victorian government school.',
    topic: 'Education',
    metadata: [
      { label: 'Updated', value: '10 Jan 2026' },
      { label: 'Type', value: 'Service' }
    ]
  },
  {
    title: 'Health services directory',
    href: '/health/directory',
    description: 'Find health services near you, including hospitals, GPs, and community health centres.',
    topic: 'Health'
  }
]

export const Default: Story = {
  args: {
    title: 'Search results',
    totalResults: 42,
    results: sampleResults
  }
}

export const WithoutTitle: Story = {
  args: {
    totalResults: 3,
    results: sampleResults
  }
}

export const Empty: Story = {
  args: {
    title: 'Search results',
    totalResults: 0,
    results: []
  }
}

export const MinimalResults: Story = {
  args: {
    results: [
      { title: 'Contact us', href: '/contact' },
      { title: 'About the department', href: '/about' },
      { title: 'Privacy policy', href: '/privacy' }
    ]
  }
}
