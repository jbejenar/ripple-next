import type { Meta, StoryObj } from '@storybook/vue3'
import RplMediaEmbed from './RplMediaEmbed.vue'

const meta: Meta<typeof RplMediaEmbed> = {
  title: 'Molecules/RplMediaEmbed',
  component: RplMediaEmbed,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplMediaEmbed>

export const Video: Story = {
  args: {
    type: 'video',
    title: 'Introduction to Ripple',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
}

export const Image: Story = {
  args: {
    type: 'image',
    title: 'Landscape photograph',
    src: 'https://picsum.photos/seed/landscape/1200/675',
    alt: 'A scenic landscape photograph',
    variant: 'landscape'
  }
}

export const ImagePortrait: Story = {
  args: {
    type: 'image',
    title: 'Portrait photograph',
    src: 'https://picsum.photos/seed/portrait/600/800',
    alt: 'A portrait photograph',
    variant: 'portrait'
  }
}

export const ImageSquare: Story = {
  args: {
    type: 'image',
    title: 'Square photograph',
    src: 'https://picsum.photos/seed/square/600/600',
    alt: 'A square photograph',
    variant: 'square'
  }
}

export const WithCaption: Story = {
  args: {
    type: 'video',
    title: 'Community event highlights',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    caption: 'Highlights from the 2025 community event held in Melbourne.',
    sourceCaption: 'Source: Department of Premier and Cabinet'
  }
}

export const WithTranscript: Story = {
  args: {
    type: 'video',
    title: 'Minister address',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    transcriptUrl: '/transcripts/minister-address.pdf'
  }
}

export const ImageFullscreen: Story = {
  args: {
    type: 'image',
    title: 'High resolution image',
    src: 'https://picsum.photos/seed/fullscreen/1600/900',
    alt: 'A high resolution image that can be viewed fullscreen',
    variant: 'landscape',
    allowFullscreen: true
  }
}

export const WithTitle: Story = {
  args: {
    type: 'video',
    title: 'A visible title above the video',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    showTitle: true,
    caption: 'This story demonstrates a visible title.',
    sourceCaption: 'Source: Example'
  }
}
