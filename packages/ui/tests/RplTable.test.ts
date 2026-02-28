import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplTable from '../components/molecules/RplTable.vue'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' }
]

const rows = [
  { name: 'Alice Johnson', role: 'Manager', status: 'Active' },
  { name: 'Bob Smith', role: 'Developer', status: 'Active' },
  { name: 'Carol White', role: 'Designer', status: 'On leave' }
]

describe('RplTable', () => {
  it('renders column headers', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows }
    })
    const headers = wrapper.findAll('.rpl-table__header')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toContain('Name')
    expect(headers[1].text()).toContain('Role')
    expect(headers[2].text()).toContain('Status')
  })

  it('renders all rows', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows }
    })
    const tableRows = wrapper.findAll('.rpl-table__row')
    expect(tableRows).toHaveLength(3)
  })

  it('renders cell data correctly', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows }
    })
    const cells = wrapper.findAll('.rpl-table__cell')
    expect(cells[0].text()).toBe('Alice Johnson')
    expect(cells[1].text()).toBe('Manager')
    expect(cells[2].text()).toBe('Active')
  })

  it('renders caption when provided', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows, caption: 'Team members' }
    })
    expect(wrapper.find('.rpl-table__caption').text()).toBe('Team members')
  })

  it('hides caption when not provided', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows }
    })
    expect(wrapper.find('.rpl-table__caption').exists()).toBe(false)
  })

  it('applies striped class when striped prop is true', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows, striped: true }
    })
    expect(wrapper.find('.rpl-table').classes()).toContain('rpl-table--striped')
  })

  it('does not apply striped class by default', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows }
    })
    expect(wrapper.find('.rpl-table').classes()).not.toContain('rpl-table--striped')
  })

  it('renders empty state when no rows', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows: [] }
    })
    expect(wrapper.find('.rpl-table__row--empty').exists()).toBe(true)
    expect(wrapper.find('.rpl-table__cell--empty').text()).toBe('No data available')
  })

  it('emits sort event when sortable header is clicked', async () => {
    const sortableColumns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'role', label: 'Role' }
    ]
    const wrapper = mount(RplTable, {
      props: { columns: sortableColumns, rows }
    })
    await wrapper.find('.rpl-table__header--sortable').trigger('click')
    expect(wrapper.emitted('sort')).toHaveLength(1)
    expect(wrapper.emitted('sort')![0]).toEqual(['name', 'asc'])
  })

  it('toggles sort direction when same column is clicked again', async () => {
    const sortableColumns = [
      { key: 'name', label: 'Name', sortable: true }
    ]
    const wrapper = mount(RplTable, {
      props: { columns: sortableColumns, rows, sortBy: 'name', sortDirection: 'asc' }
    })
    await wrapper.find('.rpl-table__header--sortable').trigger('click')
    expect(wrapper.emitted('sort')![0]).toEqual(['name', 'desc'])
  })

  it('sets aria-sort attribute on sorted column', () => {
    const sortableColumns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'role', label: 'Role', sortable: true }
    ]
    const wrapper = mount(RplTable, {
      props: { columns: sortableColumns, rows, sortBy: 'name', sortDirection: 'asc' }
    })
    const headers = wrapper.findAll('.rpl-table__header')
    expect(headers[0].attributes('aria-sort')).toBe('ascending')
    expect(headers[1].attributes('aria-sort')).toBeUndefined()
  })

  it('applies alignment classes to headers and cells', () => {
    const alignedColumns = [
      { key: 'name', label: 'Name', align: 'left' as const },
      { key: 'amount', label: 'Amount', align: 'right' as const }
    ]
    const wrapper = mount(RplTable, {
      props: { columns: alignedColumns, rows: [{ name: 'Test', amount: '100' }] }
    })
    expect(wrapper.findAll('.rpl-table__header')[1].classes()).toContain('rpl-table__header--right')
    expect(wrapper.findAll('.rpl-table__cell')[1].classes()).toContain('rpl-table__cell--right')
  })

  it('renders scope="col" on all headers', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows }
    })
    const headers = wrapper.findAll('.rpl-table__header')
    headers.forEach((h) => {
      expect(h.attributes('scope')).toBe('col')
    })
  })

  it('handles null and undefined cell values gracefully', () => {
    const wrapper = mount(RplTable, {
      props: {
        columns: [{ key: 'a', label: 'A' }],
        rows: [{ a: null }, { a: undefined }, {}]
      }
    })
    const cells = wrapper.findAll('.rpl-table__cell')
    expect(cells[0].text()).toBe('')
    expect(cells[1].text()).toBe('')
    expect(cells[2].text()).toBe('')
  })

  it('does not emit sort for non-sortable columns', async () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows }
    })
    await wrapper.findAll('.rpl-table__header')[0].trigger('click')
    expect(wrapper.emitted('sort')).toBeUndefined()
  })

  it('wraps table in scrollable container', () => {
    const wrapper = mount(RplTable, {
      props: { columns, rows }
    })
    expect(wrapper.find('.rpl-table-wrapper').exists()).toBe(true)
  })

  it('sets tabindex="0" on sortable headers for keyboard access', () => {
    const sortableColumns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'role', label: 'Role' }
    ]
    const wrapper = mount(RplTable, {
      props: { columns: sortableColumns, rows }
    })
    const headers = wrapper.findAll('.rpl-table__header')
    expect(headers[0].attributes('tabindex')).toBe('0')
    expect(headers[1].attributes('tabindex')).toBeUndefined()
  })
})
