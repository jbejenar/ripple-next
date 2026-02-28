import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplBreadcrumb from '../components/atoms/RplBreadcrumb.vue'

describe('RplBreadcrumb', () => {
  const items = [
    { label: 'Home', url: '/' },
    { label: 'Services', url: '/services' },
    { label: 'Current page' }
  ]

  it('renders all breadcrumb items', () => {
    const wrapper = mount(RplBreadcrumb, { props: { items } })
    const listItems = wrapper.findAll('.rpl-breadcrumb__item')
    expect(listItems).toHaveLength(3)
  })

  it('renders links for non-final items with urls', () => {
    const wrapper = mount(RplBreadcrumb, { props: { items } })
    const links = wrapper.findAll('.rpl-breadcrumb__link')
    expect(links).toHaveLength(2)
    expect(links[0].attributes('href')).toBe('/')
    expect(links[0].text()).toBe('Home')
    expect(links[1].attributes('href')).toBe('/services')
    expect(links[1].text()).toBe('Services')
  })

  it('renders the last item as text without a link', () => {
    const wrapper = mount(RplBreadcrumb, { props: { items } })
    const lastItem = wrapper.findAll('.rpl-breadcrumb__item').at(2)
    expect(lastItem?.find('.rpl-breadcrumb__link').exists()).toBe(false)
    expect(lastItem?.find('.rpl-breadcrumb__text').text()).toBe('Current page')
  })

  it('sets aria-current="page" on the last item', () => {
    const wrapper = mount(RplBreadcrumb, { props: { items } })
    const lastText = wrapper.findAll('.rpl-breadcrumb__text').at(-1)
    expect(lastText?.attributes('aria-current')).toBe('page')
  })

  it('does not set aria-current on non-last text items', () => {
    const noUrlItems = [
      { label: 'Home' },
      { label: 'Services' },
      { label: 'Current' }
    ]
    const wrapper = mount(RplBreadcrumb, { props: { items: noUrlItems } })
    const textElements = wrapper.findAll('.rpl-breadcrumb__text')
    expect(textElements[0].attributes('aria-current')).toBeUndefined()
    expect(textElements[1].attributes('aria-current')).toBeUndefined()
    expect(textElements[2].attributes('aria-current')).toBe('page')
  })

  it('renders separator between items but not after the last', () => {
    const wrapper = mount(RplBreadcrumb, { props: { items } })
    const separators = wrapper.findAll('.rpl-breadcrumb__separator')
    expect(separators).toHaveLength(2)
    separators.forEach((sep) => {
      expect(sep.attributes('aria-hidden')).toBe('true')
    })
  })

  it('renders a nav element with default aria-label', () => {
    const wrapper = mount(RplBreadcrumb, { props: { items } })
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('Breadcrumb')
  })

  it('uses custom aria-label when provided', () => {
    const wrapper = mount(RplBreadcrumb, {
      props: { items, ariaLabel: 'Page trail' }
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Page trail')
  })

  it('renders an ordered list', () => {
    const wrapper = mount(RplBreadcrumb, { props: { items } })
    expect(wrapper.find('ol.rpl-breadcrumb__list').exists()).toBe(true)
  })

  it('handles single item', () => {
    const wrapper = mount(RplBreadcrumb, {
      props: { items: [{ label: 'Home' }] }
    })
    expect(wrapper.findAll('.rpl-breadcrumb__item')).toHaveLength(1)
    expect(wrapper.findAll('.rpl-breadcrumb__separator')).toHaveLength(0)
    expect(wrapper.find('.rpl-breadcrumb__text').attributes('aria-current')).toBe('page')
  })
})
