import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import RplMediaFullscreen from './RplMediaFullscreen.vue'

const meta: Meta<typeof RplMediaFullscreen> = {
  title: 'Molecules/RplMediaFullscreen',
  component: RplMediaFullscreen,
  tags: ['autodocs'],
  argTypes: {
    'onUpdate:open': { action: 'update:open' }
  }
}

export default meta
type Story = StoryObj<typeof RplMediaFullscreen>

export const Image: Story = {
  render: (args) => ({
    components: { RplMediaFullscreen },
    setup() {
      const isOpen = ref(true)
      return { args, isOpen }
    },
    template: `
      <div>
        <button type="button" @click="isOpen = true">Open Image Fullscreen</button>
        <RplMediaFullscreen v-bind="args" v-model:open="isOpen" />
      </div>
    `
  }),
  args: {
    media: {
      type: 'image',
      src: 'https://placehold.co/1200x800/0052c2/ffffff?text=Full+Resolution+Image',
      alt: 'Melbourne city skyline at dusk',
      caption: undefined
    },
    open: true
  }
}

export const Video: Story = {
  render: (args) => ({
    components: { RplMediaFullscreen },
    setup() {
      const isOpen = ref(true)
      return { args, isOpen }
    },
    template: `
      <div>
        <button type="button" @click="isOpen = true">Open Video Fullscreen</button>
        <RplMediaFullscreen v-bind="args" v-model:open="isOpen" />
      </div>
    `
  }),
  args: {
    media: {
      type: 'video',
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      alt: 'Sample embedded video',
      caption: undefined
    },
    open: true
  }
}

export const WithCaption: Story = {
  render: (args) => ({
    components: { RplMediaFullscreen },
    setup() {
      const isOpen = ref(true)
      return { args, isOpen }
    },
    template: `
      <div>
        <button type="button" @click="isOpen = true">Open with Caption</button>
        <RplMediaFullscreen v-bind="args" v-model:open="isOpen" />
      </div>
    `
  }),
  args: {
    media: {
      type: 'image',
      src: 'https://placehold.co/1200x800/003e91/ffffff?text=Image+with+Caption',
      alt: 'Victorian Parliament House on Spring Street',
      caption: 'The Victorian Parliament House on Spring Street, Melbourne, built in 1856.'
    },
    open: true
  }
}
