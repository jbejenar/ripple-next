import type { Meta, StoryObj } from '@storybook/vue3'
import RplKeyDates from './RplKeyDates.vue'

const meta: Meta<typeof RplKeyDates> = {
  title: 'Organisms/Content/RplKeyDates',
  component: RplKeyDates,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplKeyDates>

export const Default: Story = {
  args: {
    title: 'Important Dates',
    dates: [
      {
        title: 'Applications open',
        date: '1 March 2026',
        description: 'Online applications for the 2026–27 grant round will open.'
      },
      {
        title: 'Information session',
        date: '15 March 2026',
        description: 'Attend a free webinar to learn about eligibility and the application process.'
      },
      {
        title: 'Applications close',
        date: '30 June 2026',
        description: 'All applications must be submitted by 11:59 PM AEST.'
      },
      {
        title: 'Outcomes announced',
        date: '1 September 2026',
        description: 'Successful applicants will be notified by email.'
      }
    ]
  }
}

export const WithoutDescriptions: Story = {
  args: {
    title: 'Key Milestones',
    dates: [
      { title: 'Project kickoff', date: 'January 2026' },
      { title: 'Consultation period', date: 'March 2026' },
      { title: 'Construction starts', date: 'July 2026' },
      { title: 'Completion', date: 'December 2026' }
    ]
  }
}

export const WithoutTitle: Story = {
  args: {
    dates: [
      {
        title: 'Registration opens',
        date: '1 Feb 2026',
        description: 'Early bird registration available.'
      },
      {
        title: 'Event day',
        date: '15 Mar 2026',
        description: 'The main event at Melbourne Convention Centre.'
      }
    ]
  }
}
