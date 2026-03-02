import type { Meta, StoryObj } from '@storybook/vue3'
import RplCarousel from './RplCarousel.vue'

const meta: Meta<typeof RplCarousel> = {
  title: 'Molecules/RplCarousel',
  component: RplCarousel,
  tags: ['autodocs'],
  argTypes: {
    autoplay: { control: 'boolean' },
    interval: { control: 'number' }
  }
}

export default meta
type Story = StoryObj<typeof RplCarousel>

const sampleItems = [
  {
    image: {
      src: 'https://placehold.co/1200x675/0052c2/ffffff?text=Slide+1',
      alt: 'Melbourne city skyline'
    },
    title: 'Welcome to Victoria',
    content: 'Discover the best of what Victoria has to offer.',
    link: { url: '#', label: 'Explore Victoria' }
  },
  {
    image: {
      src: 'https://placehold.co/1200x675/003e91/ffffff?text=Slide+2',
      alt: 'Victorian Parliament House'
    },
    title: 'Government Services',
    content: 'Access all Victorian government services in one place.',
    link: { url: '#', label: 'Find Services' }
  },
  {
    image: {
      src: 'https://placehold.co/1200x675/22c55e/ffffff?text=Slide+3',
      alt: 'Royal Botanic Gardens'
    },
    title: 'Parks & Nature',
    content: "Explore Victoria's stunning parks and natural landscapes.",
    link: { url: '#', label: 'Explore Parks' }
  }
]

export const Default: Story = {
  args: {
    items: sampleItems,
    autoplay: false,
    interval: 5000
  }
}

export const SingleItem: Story = {
  args: {
    items: sampleItems.slice(0, 1),
    autoplay: false
  }
}

export const Autoplay: Story = {
  args: {
    items: sampleItems,
    autoplay: true,
    interval: 3000
  }
}

export const ImageOnly: Story = {
  args: {
    items: sampleItems.map((item) => ({ image: item.image })),
    autoplay: false
  }
}
