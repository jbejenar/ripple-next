import type { Meta, StoryObj } from '@storybook/vue3'
import RplRelatedLinks from './RplRelatedLinks.vue'

const meta: Meta<typeof RplRelatedLinks> = {
  title: 'Molecules/RplRelatedLinks',
  component: RplRelatedLinks,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplRelatedLinks>

const sampleLinks = [
  { text: 'Apply for a grant', url: '#grants' },
  { text: 'Check eligibility requirements', url: '#eligibility' },
  { text: 'Contact your local office', url: '#contact' }
]

export const Default: Story = {
  args: {
    links: sampleLinks
  }
}

export const CustomTitle: Story = {
  args: {
    title: 'More information',
    links: sampleLinks
  }
}
