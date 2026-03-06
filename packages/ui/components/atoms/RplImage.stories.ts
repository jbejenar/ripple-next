import type { Meta, StoryObj } from '@storybook/vue3'
import RplImage from './RplImage.vue'

const meta: Meta<typeof RplImage> = {
  title: 'Atoms/RplImage',
  component: RplImage,
  tags: ['autodocs'],
  argTypes: {
    aspect: {
      control: 'select',
      options: ['square', 'full', 'wide', 'ultrawide', 'panorama', 'portrait']
    },
    fit: {
      control: 'select',
      options: ['none', 'contain', 'cover']
    },
    priority: {
      control: 'select',
      options: ['auto', 'low', 'high']
    },
    circle: { control: 'boolean' }
  }
}

export default meta
type Story = StoryObj<typeof RplImage>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'A placeholder image'
  }
}

export const WithAspectRatio: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Wide aspect ratio image',
    aspect: 'wide'
  }
}

export const Portrait: Story = {
  args: {
    src: 'https://picsum.photos/600/800',
    alt: 'Portrait image',
    aspect: 'portrait'
  }
}

export const Square: Story = {
  args: {
    src: 'https://picsum.photos/800/800',
    alt: 'Square image',
    aspect: 'square'
  }
}

export const Circle: Story = {
  args: {
    src: 'https://picsum.photos/800/800',
    alt: 'Circle image',
    circle: true
  }
}

export const WithFocalPoint: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Image with focal point',
    aspect: 'wide',
    focalPoint: { x: 25, y: 75 }
  }
}

export const HighPriority: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'High priority image',
    priority: 'high'
  }
}

export const Contain: Story = {
  args: {
    src: 'https://picsum.photos/800/600',
    alt: 'Contained image',
    aspect: 'square',
    fit: 'contain'
  }
}
