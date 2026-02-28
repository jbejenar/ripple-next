import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplCategoryGrid from '../components/molecules/RplCategoryGrid.vue'

const categories = [
  { title: 'Health', description: 'Health services', href: '/health', icon: '🏥', count: 12 },
  { title: 'Education', description: 'Schools and learning', href: '/education', count: 8 },
  { title: 'Transport', count: 5 }
]

describe('RplCategoryGrid', () => {
  it('renders all categories', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    const items = wrapper.findAll('.rpl-category-grid__item')
    expect(items).toHaveLength(3)
  })

  it('renders category titles', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    const titles = wrapper.findAll('.rpl-category-grid__item-title')
    expect(titles[0].text()).toBe('Health')
    expect(titles[1].text()).toBe('Education')
    expect(titles[2].text()).toBe('Transport')
  })

  it('renders as links when href is provided', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    const items = wrapper.findAll('.rpl-category-grid__item')
    expect(items[0].element.tagName).toBe('A')
    expect(items[0].attributes('href')).toBe('/health')
    expect(items[2].element.tagName).toBe('DIV')
  })

  it('applies link class when href is provided', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    const items = wrapper.findAll('.rpl-category-grid__item')
    expect(items[0].classes()).toContain('rpl-category-grid__item--link')
    expect(items[2].classes()).not.toContain('rpl-category-grid__item--link')
  })

  it('renders descriptions when provided', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    const descriptions = wrapper.findAll('.rpl-category-grid__description')
    expect(descriptions).toHaveLength(2)
    expect(descriptions[0].text()).toBe('Health services')
  })

  it('renders icons when provided', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    const icons = wrapper.findAll('.rpl-category-grid__icon')
    expect(icons).toHaveLength(1)
    expect(icons[0].attributes('aria-hidden')).toBe('true')
  })

  it('renders item counts', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    const counts = wrapper.findAll('.rpl-category-grid__count')
    expect(counts).toHaveLength(3)
    expect(counts[0].text()).toBe('12 items')
    expect(counts[2].text()).toBe('5 items')
  })

  it('uses singular "item" for count of 1', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories: [{ title: 'Test', count: 1 }] }
    })
    expect(wrapper.find('.rpl-category-grid__count').text()).toBe('1 item')
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories, title: 'Browse by topic' }
    })
    expect(wrapper.find('.rpl-category-grid__title').text()).toBe('Browse by topic')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    expect(wrapper.find('.rpl-category-grid__title').exists()).toBe(false)
  })

  it('applies column class based on columns prop', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories, columns: 4 }
    })
    expect(wrapper.find('.rpl-category-grid__grid').classes()).toContain('rpl-category-grid__grid--cols-4')
  })

  it('defaults to 3 columns', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    expect(wrapper.find('.rpl-category-grid__grid').classes()).toContain('rpl-category-grid__grid--cols-3')
  })

  it('has accessible section label', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories, title: 'Topics' }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Topics')
  })

  it('uses default aria-label when no title', () => {
    const wrapper = mount(RplCategoryGrid, {
      props: { categories }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Categories')
  })
})
