import type { Meta, StoryObj } from '@storybook/vue3'
import RplVerticalNav from './RplVerticalNav.vue'
import type { RplVerticalNavItem } from './RplVerticalNav.vue'

const meta: Meta<typeof RplVerticalNav> = {
  title: 'Molecules/RplVerticalNav',
  component: RplVerticalNav,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    toggleLevels: { control: { type: 'number', min: 0, max: 3 } }
  }
}

export default meta
type Story = StoryObj<typeof RplVerticalNav>

const twoLevelItems: RplVerticalNavItem[] = [
  { id: 'overview', text: 'Overview', url: '/overview' },
  {
    id: 'services',
    text: 'Services',
    url: '/services',
    items: [
      { id: 'grants', text: 'Grants', url: '/services/grants', active: true },
      { id: 'permits', text: 'Permits', url: '/services/permits' },
      { id: 'licences', text: 'Licences', url: '/services/licences' }
    ]
  },
  {
    id: 'about',
    text: 'About us',
    url: '/about',
    items: [
      { id: 'team', text: 'Our team', url: '/about/team' },
      { id: 'history', text: 'History', url: '/about/history' }
    ]
  },
  { id: 'contact', text: 'Contact', url: '/contact' }
]

const deepItems: RplVerticalNavItem[] = [
  {
    id: 'dept',
    text: 'Department',
    url: '/dept',
    items: [
      {
        id: 'division',
        text: 'Division',
        url: '/dept/division',
        items: [
          { id: 'branch-a', text: 'Branch A', url: '/dept/division/branch-a', active: true },
          { id: 'branch-b', text: 'Branch B', url: '/dept/division/branch-b' }
        ]
      },
      {
        id: 'other-division',
        text: 'Other Division',
        url: '/dept/other-division',
        items: [
          { id: 'branch-c', text: 'Branch C', url: '/dept/other-division/branch-c' }
        ]
      }
    ]
  },
  { id: 'resources', text: 'Resources', url: '/resources' }
]

const flatItems: RplVerticalNavItem[] = [
  { id: 'page-1', text: 'Getting started', url: '/getting-started' },
  { id: 'page-2', text: 'Installation', url: '/installation' },
  { id: 'page-3', text: 'Configuration', url: '/configuration' },
  { id: 'page-4', text: 'Deployment', url: '/deployment' }
]

export const Default: Story = {
  args: {
    items: twoLevelItems,
    toggleLevels: 1
  }
}

export const WithTitle: Story = {
  args: {
    title: 'Section navigation',
    items: twoLevelItems,
    toggleLevels: 1
  }
}

export const DeepNesting: Story = {
  args: {
    items: deepItems,
    toggleLevels: 2
  }
}

export const NoActiveItem: Story = {
  args: {
    items: twoLevelItems.map((item) => ({
      ...item,
      items: item.items?.map((child) => ({ ...child, active: false }))
    })),
    toggleLevels: 1
  }
}

export const SingleLevel: Story = {
  args: {
    items: flatItems,
    toggleLevels: 1
  }
}
