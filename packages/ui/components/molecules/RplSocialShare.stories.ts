import type { Meta, StoryObj } from '@storybook/vue3'
import RplSocialShare from './RplSocialShare.vue'

const meta: Meta<typeof RplSocialShare> = {
  title: 'Molecules/RplSocialShare',
  component: RplSocialShare,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    pageTitle: { control: 'text' },
    url: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplSocialShare>

export const Default: Story = {
  args: {
    pageTitle: 'Victorian Government - Home',
    url: 'https://www.vic.gov.au'
  }
}

export const WithEmail: Story = {
  args: {
    pageTitle: 'Victorian Government - Home',
    url: 'https://www.vic.gov.au',
    email: {
      subject: 'Check out this page',
      body: 'I thought you might find this interesting'
    }
  }
}

export const CustomNetworks: Story = {
  args: {
    pageTitle: 'Victorian Government - Home',
    url: 'https://www.vic.gov.au',
    networks: ['Facebook', 'LinkedIn', 'X', 'WhatsApp']
  }
}

export const CustomTitle: Story = {
  args: {
    title: 'Share this article',
    pageTitle: 'New policy announcement',
    url: 'https://www.vic.gov.au/news/policy-update'
  }
}
