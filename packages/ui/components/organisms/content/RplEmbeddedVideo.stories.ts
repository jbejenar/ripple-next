import type { Meta, StoryObj } from '@storybook/vue3'
import RplEmbeddedVideo from './RplEmbeddedVideo.vue'

const meta: Meta<typeof RplEmbeddedVideo> = {
  title: 'Organisms/Content/RplEmbeddedVideo',
  component: RplEmbeddedVideo,
  tags: ['autodocs'],
  argTypes: {
    url: { control: 'text' },
    title: { control: 'text' },
    transcript: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplEmbeddedVideo>

export const YouTube: Story = {
  args: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Victorian Government Services Overview'
  }
}

export const Vimeo: Story = {
  args: {
    url: 'https://vimeo.com/76979871',
    title: 'Community Engagement Session'
  }
}

export const WithTranscript: Story = {
  args: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Accessible Video with Transcript',
    transcript: 'Welcome to the Victorian Government services overview. In this video, we will walk you through the key services available to all Victorians, including education, health, transport, and community support programs. Our goal is to make government services accessible and easy to use for everyone.'
  }
}

export const DirectEmbed: Story = {
  args: {
    url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    title: 'Pre-formatted embed URL'
  }
}
