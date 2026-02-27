import type { Meta, StoryObj } from '@storybook/vue3'
import RplCallToAction from './RplCallToAction.vue'

const meta: Meta<typeof RplCallToAction> = {
  title: 'Organisms/Content/RplCallToAction',
  component: RplCallToAction,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplCallToAction>

export const Default: Story = {
  args: {
    cta: {
      title: 'Apply for a Grant',
      summary: 'Community organisations can apply for funding to support local projects and initiatives. Applications close 30 June 2026.',
      link: { text: 'Start application', url: '#' }
    }
  }
}

export const WithImage: Story = {
  args: {
    cta: {
      title: 'Register for the Event',
      summary: 'Join us for the annual Victorian Community Summit. Network with leaders and explore new opportunities for your community.',
      link: { text: 'Register now', url: '#' },
      image: { src: 'https://placehold.co/400x300/0052c2/ffffff?text=Event', alt: 'Community summit event' }
    }
  }
}

export const ExternalLink: Story = {
  args: {
    cta: {
      title: 'Visit Service Victoria',
      summary: 'Access a wide range of government services online, including permits, registrations, and payments.',
      link: { text: 'Go to Service Victoria', url: 'https://service.vic.gov.au', external: true }
    }
  }
}
