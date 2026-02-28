import type { Meta, StoryObj } from '@storybook/vue3'
import RplPagination from './RplPagination.vue'

const meta: Meta<typeof RplPagination> = {
  title: 'Molecules/RplPagination',
  component: RplPagination,
  tags: ['autodocs'],
  argTypes: {
    currentPage: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1 } },
    visiblePages: { control: { type: 'number', min: 3, max: 9 } },
    ariaLabel: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplPagination>

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10
  }
}

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10
  }
}

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10
  }
}

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3
  }
}

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1
  }
}
