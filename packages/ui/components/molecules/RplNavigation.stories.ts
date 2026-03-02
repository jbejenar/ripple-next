import type { Meta, StoryObj } from '@storybook/vue3'
import RplNavigation from './RplNavigation.vue'

const meta: Meta<typeof RplNavigation> = {
  title: 'Molecules/RplNavigation',
  component: RplNavigation,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['horizontal', 'vertical'] },
    ariaLabel: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplNavigation>

const flatItems = [
  { id: 'home', label: 'Home', url: '/', children: [] },
  { id: 'about', label: 'About', url: '/about', children: [] },
  { id: 'services', label: 'Services', url: '/services', children: [] },
  { id: 'contact', label: 'Contact', url: '/contact', children: [] }
]

const nestedItems = [
  { id: 'home', label: 'Home', url: '/', children: [] },
  {
    id: 'about',
    label: 'About',
    url: '/about',
    children: [
      { id: 'about-team', label: 'Our Team', url: '/about/team', children: [] },
      { id: 'about-history', label: 'Our History', url: '/about/history', children: [] }
    ]
  },
  {
    id: 'services',
    label: 'Services',
    url: '/services',
    children: [
      { id: 'services-grants', label: 'Grants', url: '/services/grants', children: [] },
      { id: 'services-permits', label: 'Permits', url: '/services/permits', children: [] },
      { id: 'services-licences', label: 'Licences', url: '/services/licences', children: [] }
    ]
  },
  { id: 'contact', label: 'Contact', url: '/contact', children: [] }
]

export const Horizontal: Story = {
  args: {
    items: flatItems,
    variant: 'horizontal',
    ariaLabel: 'Main navigation'
  }
}

export const Vertical: Story = {
  args: {
    items: flatItems,
    variant: 'vertical',
    ariaLabel: 'Side navigation'
  }
}

export const NestedItems: Story = {
  args: {
    items: nestedItems,
    variant: 'horizontal',
    ariaLabel: 'Main navigation with sub-menus'
  }
}

export const VerticalNested: Story = {
  args: {
    items: nestedItems,
    variant: 'vertical',
    ariaLabel: 'Vertical navigation with sub-menus'
  }
}
