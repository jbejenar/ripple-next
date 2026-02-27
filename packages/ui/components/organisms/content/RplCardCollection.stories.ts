import type { Meta, StoryObj } from '@storybook/vue3'
import RplCardCollection from './RplCardCollection.vue'

const meta: Meta<typeof RplCardCollection> = {
  title: 'Organisms/Content/RplCardCollection',
  component: RplCardCollection,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplCardCollection>

export const Default: Story = {
  args: {
    title: 'Government Services',
    cards: [
      {
        title: 'Education',
        summary: 'Find information about schools, universities, and vocational training in Victoria.',
        link: { text: 'Learn more', url: '#' }
      },
      {
        title: 'Health',
        summary: 'Access health services, hospital information, and public health resources.',
        link: { text: 'Learn more', url: '#' }
      },
      {
        title: 'Transport',
        summary: 'Public transport information, road safety, and vehicle registration services.',
        link: { text: 'Learn more', url: '#' }
      }
    ]
  }
}

export const WithoutTitle: Story = {
  args: {
    cards: [
      {
        title: 'First Card',
        summary: 'Description for the first card.'
      },
      {
        title: 'Second Card',
        summary: 'Description for the second card.'
      }
    ]
  }
}

export const WithImages: Story = {
  args: {
    title: 'Featured Programs',
    cards: [
      {
        title: 'Community Grants',
        summary: 'Apply for community development grants to support local initiatives.',
        link: { text: 'Apply now', url: '#' },
        image: { src: 'https://placehold.co/600x400/0052c2/ffffff?text=Grants', alt: 'Community grants' }
      },
      {
        title: 'Youth Programs',
        summary: 'Discover programs designed for young Victorians aged 12–25.',
        link: { text: 'Explore', url: '#' },
        image: { src: 'https://placehold.co/600x400/0052c2/ffffff?text=Youth', alt: 'Youth programs' }
      },
      {
        title: 'Senior Services',
        summary: 'Support services and resources for older Victorians.',
        link: { text: 'Find out more', url: '#' },
        image: { src: 'https://placehold.co/600x400/0052c2/ffffff?text=Seniors', alt: 'Senior services' }
      }
    ]
  }
}

export const ManyCards: Story = {
  args: {
    title: 'All Departments',
    cards: Array.from({ length: 6 }, (_, i) => ({
      title: `Department ${i + 1}`,
      summary: `Information about department ${i + 1} and the services it provides to Victorians.`,
      link: { text: 'Visit', url: '#' }
    }))
  }
}
