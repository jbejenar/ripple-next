import type { Meta, StoryObj } from '@storybook/vue3'
import RplStatisticsGrid from './RplStatisticsGrid.vue'

const meta: Meta<typeof RplStatisticsGrid> = {
  title: 'Molecules/RplStatisticsGrid',
  component: RplStatisticsGrid,
  tags: ['autodocs'],
  argTypes: {
    columns: { control: 'select', options: [2, 3, 4] },
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplStatisticsGrid>

export const Default: Story = {
  args: {
    title: 'Key metrics',
    statistics: [
      { value: '2.4M', label: 'Website visits', description: 'Last 12 months' },
      { value: '98.5%', label: 'Service uptime', description: 'Annual average' },
      { value: '15,234', label: 'Applications processed' }
    ]
  }
}

export const FourColumns: Story = {
  args: {
    title: 'Department overview',
    columns: 4,
    statistics: [
      { value: '42', label: 'Services' },
      { value: '1,500+', label: 'Staff' },
      { value: '12', label: 'Offices' },
      { value: '$2.1B', label: 'Annual budget' }
    ]
  }
}

export const TwoColumns: Story = {
  args: {
    columns: 2,
    statistics: [
      { value: '87%', label: 'Satisfaction rate', description: 'Based on 5,000 responses' },
      { value: '4.2 days', label: 'Average response time', description: 'Down from 6.1 days' }
    ]
  }
}

export const WithoutTitle: Story = {
  args: {
    statistics: [
      { value: '100+', label: 'Partners' },
      { value: '50', label: 'Programs' },
      { value: '3', label: 'Regions' }
    ]
  }
}
