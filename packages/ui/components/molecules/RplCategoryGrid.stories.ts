import type { Meta, StoryObj } from '@storybook/vue3'
import RplCategoryGrid from './RplCategoryGrid.vue'

const meta: Meta<typeof RplCategoryGrid> = {
  title: 'Molecules/RplCategoryGrid',
  component: RplCategoryGrid,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'select', options: [2, 3, 4] },
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplCategoryGrid>

export const Default: Story = {
  args: {
    title: 'Browse by topic',
    categories: [
      { title: 'Health', description: 'Health services and wellbeing', href: '/health', count: 42 },
      { title: 'Education', description: 'Schools, training, and learning', href: '/education', count: 35 },
      { title: 'Transport', description: 'Roads, public transport, and licensing', href: '/transport', count: 28 },
      { title: 'Housing', description: 'Renting, buying, and building', href: '/housing', count: 19 },
      { title: 'Environment', description: 'Parks, wildlife, and climate', href: '/environment', count: 24 },
      { title: 'Business', description: 'Starting and running a business', href: '/business', count: 31 }
    ]
  }
}

export const FourColumns: Story = {
  args: {
    title: 'Service categories',
    columns: 4,
    categories: [
      { title: 'Permits', href: '/permits', count: 15 },
      { title: 'Licences', href: '/licences', count: 22 },
      { title: 'Grants', href: '/grants', count: 8 },
      { title: 'Registrations', href: '/registrations', count: 11 }
    ]
  }
}

export const WithoutLinks: Story = {
  args: {
    title: 'Topics',
    categories: [
      { title: 'Community safety', description: 'Emergency services and crime prevention', count: 18 },
      { title: 'Arts and culture', description: 'Events, venues, and funding', count: 12 },
      { title: 'Sport and recreation', description: 'Facilities, clubs, and programs', count: 9 }
    ]
  }
}

export const TwoColumns: Story = {
  args: {
    columns: 2,
    categories: [
      { title: 'For individuals', description: 'Services for Victorian residents', href: '/individuals', count: 85 },
      { title: 'For businesses', description: 'Services for Victorian businesses', href: '/businesses', count: 62 }
    ]
  }
}
