import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplNavigation from '../components/molecules/RplNavigation.vue'

const items = [
  { id: '1', label: 'Home', url: '/', children: [] },
  {
    id: '2',
    label: 'Services',
    url: '/services',
    children: [
      { id: '2a', label: 'Health', url: '/services/health', children: [] },
      { id: '2b', label: 'Education', url: '/services/education', children: [] }
    ]
  },
  { id: '3', label: 'About', url: '/about', children: [] }
]

describe('RplNavigation', () => {
  it('renders all top-level items', () => {
    const wrapper = mount(RplNavigation, {
      props: { items }
    })
    expect(wrapper.findAll('.rpl-navigation__item')).toHaveLength(3)
  })

  it('renders links with correct href', () => {
    const wrapper = mount(RplNavigation, {
      props: { items }
    })
    const links = wrapper.findAll('.rpl-navigation__link')
    expect(links[0]!.attributes('href')).toBe('/')
    expect(links[1]!.attributes('href')).toBe('/services')
    expect(links[2]!.attributes('href')).toBe('/about')
  })

  it('renders link labels', () => {
    const wrapper = mount(RplNavigation, {
      props: { items }
    })
    const links = wrapper.findAll('.rpl-navigation__link')
    expect(links[0]!.text()).toBe('Home')
    expect(links[1]!.text()).toBe('Services')
  })

  it('renders nested children as submenu', () => {
    const wrapper = mount(RplNavigation, {
      props: { items }
    })
    const submenu = wrapper.find('.rpl-navigation__submenu')
    expect(submenu.exists()).toBe(true)
    expect(submenu.findAll('.rpl-navigation__subitem')).toHaveLength(2)
  })

  it('renders child links correctly', () => {
    const wrapper = mount(RplNavigation, {
      props: { items }
    })
    const sublinks = wrapper.findAll('.rpl-navigation__sublink')
    expect(sublinks[0]!.text()).toBe('Health')
    expect(sublinks[0]!.attributes('href')).toBe('/services/health')
  })

  it('does not render submenu for items without children', () => {
    const wrapper = mount(RplNavigation, {
      props: { items: [{ id: '1', label: 'Home', url: '/', children: [] }] }
    })
    expect(wrapper.find('.rpl-navigation__submenu').exists()).toBe(false)
  })

  it('marks items with children', () => {
    const wrapper = mount(RplNavigation, {
      props: { items }
    })
    const itemsWithChildren = wrapper.findAll('.rpl-navigation__item--has-children')
    expect(itemsWithChildren).toHaveLength(1)
  })

  it('applies horizontal variant by default', () => {
    const wrapper = mount(RplNavigation, {
      props: { items }
    })
    expect(wrapper.find('nav').classes()).toContain('rpl-navigation--horizontal')
  })

  it('applies vertical variant', () => {
    const wrapper = mount(RplNavigation, {
      props: { items, variant: 'vertical' }
    })
    expect(wrapper.find('nav').classes()).toContain('rpl-navigation--vertical')
  })

  it('has accessible aria-label', () => {
    const wrapper = mount(RplNavigation, {
      props: { items, ariaLabel: 'Main menu' }
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Main menu')
  })

  it('uses default aria-label', () => {
    const wrapper = mount(RplNavigation, {
      props: { items }
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Navigation')
  })
})
