import type { Meta, StoryObj } from '@storybook/vue3'
import RplProfile from './RplProfile.vue'

const meta: Meta<typeof RplProfile> = {
  title: 'Molecules/RplProfile',
  component: RplProfile,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    role: { control: 'text' },
    organisation: { control: 'text' },
    phone: { control: 'text' },
    email: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplProfile>

export const Default: Story = {
  args: {
    name: 'Jane Smith',
    role: 'Senior Policy Advisor',
    organisation: 'Department of Premier and Cabinet',
    email: 'jane.smith@vic.gov.au',
    phone: '03 9000 0000'
  }
}

export const NoImage: Story = {
  args: {
    name: 'John Doe',
    role: 'Communications Manager',
    organisation: 'Department of Health',
    email: 'john.doe@health.vic.gov.au',
    phone: '03 9123 4567'
  }
}

export const Minimal: Story = {
  args: {
    name: 'Alex Johnson'
  }
}

export const Full: Story = {
  args: {
    name: 'Dr. Sarah Williams',
    role: 'Chief Medical Officer',
    organisation: 'Department of Health',
    image: {
      src: 'https://via.placeholder.com/64x64',
      alt: 'Dr. Sarah Williams profile photo'
    },
    phone: '03 9456 7890',
    email: 's.williams@health.vic.gov.au',
    links: [
      { label: 'View profile', url: '/profiles/sarah-williams' },
      { label: 'Department website', url: 'https://www.health.vic.gov.au' }
    ]
  }
}
