import type { Meta, StoryObj } from '@storybook/vue3'
import RplIcon from './RplIcon.vue'

const meta: Meta<typeof RplIcon> = {
  title: 'Atoms/RplIcon',
  component: RplIcon,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl']
    },
    color: { control: 'color' }
  }
}

export default meta
type Story = StoryObj<typeof RplIcon>

export const Default: Story = {
  args: {
    name: 'arrow-right',
    size: 'md'
  }
}

export const Small: Story = {
  args: {
    name: 'arrow-right',
    size: 'sm'
  }
}

export const Large: Story = {
  args: {
    name: 'arrow-right',
    size: 'lg'
  }
}

export const ExtraLarge: Story = {
  args: {
    name: 'arrow-right',
    size: 'xl'
  }
}

export const Colored: Story = {
  args: {
    name: 'arrow-right',
    size: 'md',
    color: '#0052c2'
  }
}
