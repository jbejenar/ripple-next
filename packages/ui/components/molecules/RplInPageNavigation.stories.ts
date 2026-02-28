import type { Meta, StoryObj } from '@storybook/vue3'
import RplInPageNavigation from './RplInPageNavigation.vue'

const meta: Meta<typeof RplInPageNavigation> = {
  title: 'Molecules/RplInPageNavigation',
  component: RplInPageNavigation,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    ariaLabel: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplInPageNavigation>

export const Default: Story = {
  args: {
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'eligibility', label: 'Eligibility' },
      { id: 'how-to-apply', label: 'How to apply' },
      { id: 'contact', label: 'Contact us' }
    ]
  }
}

export const CustomTitle: Story = {
  args: {
    title: 'Page contents',
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'requirements', label: 'Requirements' },
      { id: 'next-steps', label: 'Next steps' }
    ]
  }
}

export const ManyItems: Story = {
  args: {
    items: [
      { id: 'section-1', label: 'About this program' },
      { id: 'section-2', label: 'Who can apply' },
      { id: 'section-3', label: 'What you need' },
      { id: 'section-4', label: 'How to apply' },
      { id: 'section-5', label: 'After you apply' },
      { id: 'section-6', label: 'Support and resources' },
      { id: 'section-7', label: 'Contact details' }
    ]
  }
}
