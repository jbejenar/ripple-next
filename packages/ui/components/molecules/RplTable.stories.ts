import type { Meta, StoryObj } from '@storybook/vue3'
import RplTable from './RplTable.vue'

const meta: Meta<typeof RplTable> = {
  title: 'Molecules/RplTable',
  component: RplTable,
  tags: ['autodocs'],
  argTypes: {
    striped: { control: 'boolean' },
    caption: { control: 'text' },
    sortBy: { control: 'text' },
    sortDirection: { control: 'select', options: ['asc', 'desc'] }
  }
}

export default meta
type Story = StoryObj<typeof RplTable>

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' }
]

const rows = [
  { name: 'Alice Johnson', department: 'Health', role: 'Director', status: 'Active' },
  { name: 'Bob Smith', department: 'Education', role: 'Manager', status: 'Active' },
  { name: 'Carol White', department: 'Transport', role: 'Analyst', status: 'On leave' },
  { name: 'David Brown', department: 'Health', role: 'Officer', status: 'Active' },
  { name: 'Eve Davis', department: 'Education', role: 'Coordinator', status: 'Active' }
]

export const Default: Story = {
  args: {
    columns,
    rows,
    caption: 'Department staff listing'
  }
}

export const Striped: Story = {
  args: {
    columns,
    rows,
    caption: 'Department staff listing',
    striped: true
  }
}

export const Sorted: Story = {
  args: {
    columns,
    rows,
    caption: 'Sorted by name',
    sortBy: 'name',
    sortDirection: 'asc'
  }
}

export const RightAligned: Story = {
  args: {
    columns: [
      { key: 'item', label: 'Item' },
      { key: 'quantity', label: 'Quantity', align: 'center' as const },
      { key: 'cost', label: 'Cost ($)', align: 'right' as const }
    ],
    rows: [
      { item: 'Office supplies', quantity: '120', cost: '2,450.00' },
      { item: 'IT equipment', quantity: '15', cost: '45,000.00' },
      { item: 'Training materials', quantity: '50', cost: '8,750.00' }
    ],
    caption: 'Budget breakdown'
  }
}

export const Empty: Story = {
  args: {
    columns,
    rows: [],
    caption: 'No records found'
  }
}
