import type { Meta, StoryObj } from '@storybook/vue3'
import RplMediaGallery from './RplMediaGallery.vue'

const meta: Meta<typeof RplMediaGallery> = {
  title: 'Molecules/RplMediaGallery',
  component: RplMediaGallery,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [2, 3, 4]
    }
  }
}

export default meta
type Story = StoryObj<typeof RplMediaGallery>

const sampleItems = [
  {
    id: '1',
    src: 'https://placehold.co/800x600/0052c2/ffffff?text=Gallery+1',
    alt: 'Melbourne city skyline',
    title: 'Melbourne Skyline',
    caption: 'View of Melbourne CBD from Southbank promenade.'
  },
  {
    id: '2',
    src: 'https://placehold.co/800x600/003e91/ffffff?text=Gallery+2',
    alt: 'Victorian Parliament House',
    title: 'Parliament House',
    caption: 'The Victorian Parliament House on Spring Street.'
  },
  {
    id: '3',
    src: 'https://placehold.co/800x600/22c55e/ffffff?text=Gallery+3',
    alt: 'Royal Botanic Gardens',
    title: 'Botanic Gardens'
  },
  {
    id: '4',
    src: 'https://placehold.co/800x600/f59e0b/ffffff?text=Gallery+4',
    alt: 'Flinders Street Station',
    title: 'Flinders Street'
  },
  {
    id: '5',
    src: 'https://placehold.co/800x600/ef4444/ffffff?text=Gallery+5',
    alt: 'Great Ocean Road',
    title: 'Great Ocean Road'
  },
  {
    id: '6',
    src: 'https://placehold.co/800x600/6366f1/ffffff?text=Gallery+6',
    alt: 'Yarra Valley vineyards',
    title: 'Yarra Valley'
  }
]

export const Default: Story = {
  args: {
    items: sampleItems,
    columns: 3
  }
}

export const TwoColumns: Story = {
  args: {
    items: sampleItems.slice(0, 4),
    columns: 2
  }
}

export const FourColumns: Story = {
  args: {
    items: sampleItems,
    columns: 4
  }
}

export const MinimalItems: Story = {
  args: {
    items: sampleItems.slice(0, 2),
    columns: 2
  }
}
