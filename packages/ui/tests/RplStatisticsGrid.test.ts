import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplStatisticsGrid from '../components/molecules/RplStatisticsGrid.vue'

const statistics = [
  { value: '1,234', label: 'Total users', description: 'Active accounts' },
  { value: '98%', label: 'Uptime', description: 'Last 30 days' },
  { value: '42', label: 'Services', icon: '📊' }
]

describe('RplStatisticsGrid', () => {
  it('renders all statistics items', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    const items = wrapper.findAll('.rpl-statistics-grid__item')
    expect(items).toHaveLength(3)
  })

  it('renders statistic values', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    const values = wrapper.findAll('.rpl-statistics-grid__value')
    expect(values[0].text()).toBe('1,234')
    expect(values[1].text()).toBe('98%')
    expect(values[2].text()).toBe('42')
  })

  it('renders statistic labels', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    const labels = wrapper.findAll('.rpl-statistics-grid__label')
    expect(labels[0].text()).toBe('Total users')
  })

  it('renders descriptions when provided', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    const descriptions = wrapper.findAll('.rpl-statistics-grid__description')
    expect(descriptions).toHaveLength(2)
    expect(descriptions[0].text()).toBe('Active accounts')
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics, title: 'Key metrics' }
    })
    expect(wrapper.find('.rpl-statistics-grid__title').text()).toBe('Key metrics')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    expect(wrapper.find('.rpl-statistics-grid__title').exists()).toBe(false)
  })

  it('renders icons when provided', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    const icons = wrapper.findAll('.rpl-statistics-grid__icon')
    expect(icons).toHaveLength(1)
    expect(icons[0].attributes('aria-hidden')).toBe('true')
  })

  it('applies column class based on columns prop', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics, columns: 4 }
    })
    expect(wrapper.find('.rpl-statistics-grid__grid').classes()).toContain('rpl-statistics-grid__grid--cols-4')
  })

  it('defaults to 3 columns', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    expect(wrapper.find('.rpl-statistics-grid__grid').classes()).toContain('rpl-statistics-grid__grid--cols-3')
  })

  it('has accessible section label', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics, title: 'Key metrics' }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Key metrics')
  })

  it('uses default aria-label when no title', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Statistics')
  })

  it('uses role="list" for the grid container', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    expect(wrapper.find('.rpl-statistics-grid__grid').attributes('role')).toBe('list')
  })

  it('uses role="listitem" for each statistic', () => {
    const wrapper = mount(RplStatisticsGrid, {
      props: { statistics }
    })
    const items = wrapper.findAll('.rpl-statistics-grid__item')
    items.forEach((item) => {
      expect(item.attributes('role')).toBe('listitem')
    })
  })
})
