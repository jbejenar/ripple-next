import type { Meta, StoryObj } from '@storybook/vue3'
import RplContentImage from './RplContentImage.vue'

const meta: Meta<typeof RplContentImage> = {
  title: 'Organisms/Content/RplContentImage',
  component: RplContentImage,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplContentImage>

export const Default: Story = {
  args: {
    image: {
      src: 'https://placehold.co/800x450/0052c2/ffffff?text=Content+Image',
      alt: 'A placeholder content image'
    }
  }
}

export const WithCaption: Story = {
  args: {
    image: {
      src: 'https://placehold.co/800x450/0052c2/ffffff?text=Captioned+Image',
      alt: 'Melbourne skyline at sunset'
    },
    caption: 'The Melbourne skyline as seen from Southbank. Photo: Department of Transport and Planning.'
  }
}

export const WithDimensions: Story = {
  args: {
    image: {
      src: 'https://placehold.co/1200x600/0052c2/ffffff?text=Full+Width',
      alt: 'A wide format image',
      title: 'Victoria State Government building',
      width: 1200,
      height: 600
    },
    caption: 'The new government services building in the CBD.'
  }
}
