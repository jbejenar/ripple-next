import type { Meta, StoryObj } from '@storybook/vue3'
import RplTimeline from './RplTimeline.vue'

const meta: Meta<typeof RplTimeline> = {
  title: 'Organisms/Content/RplTimeline',
  component: RplTimeline,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplTimeline>

export const Default: Story = {
  args: {
    title: 'Project Timeline',
    items: [
      {
        title: 'Planning Phase',
        date: 'January 2026',
        body: '<p>Initial planning and stakeholder consultation completed.</p>'
      },
      {
        title: 'Design Phase',
        date: 'March 2026',
        subtitle: 'Community engagement',
        body: '<p>Design concepts developed with community input and feedback sessions.</p>'
      },
      {
        title: 'Construction',
        date: 'June 2026',
        body: '<p>Construction begins on the new community facility.</p>'
      },
      {
        title: 'Completion',
        date: 'December 2026',
        subtitle: 'Grand opening',
        body: '<p>Facility opens to the public with a community celebration event.</p>'
      }
    ]
  }
}

export const WithoutTitle: Story = {
  args: {
    items: [
      {
        title: 'Step 1',
        body: '<p>Submit your application online.</p>'
      },
      {
        title: 'Step 2',
        body: '<p>Receive confirmation within 5 business days.</p>'
      },
      {
        title: 'Step 3',
        body: '<p>Attend scheduled assessment.</p>'
      }
    ]
  }
}

export const WithSubtitles: Story = {
  args: {
    title: 'Policy Changes',
    items: [
      {
        title: 'Draft Released',
        date: 'Q1 2026',
        subtitle: 'Public comment period opens',
        body: '<p>The draft policy was released for public consultation, with a 60-day comment period.</p>'
      },
      {
        title: 'Review Complete',
        date: 'Q2 2026',
        subtitle: 'Feedback incorporated',
        body: '<p>All submissions reviewed and key changes incorporated into the final draft.</p>'
      },
      {
        title: 'Policy Enacted',
        date: 'Q3 2026',
        subtitle: 'Effective immediately',
        body: '<p>The updated policy takes effect across all Victorian government departments.</p>'
      }
    ]
  }
}
