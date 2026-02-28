import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplInPageNavigation from '../components/molecules/RplInPageNavigation.vue'

describe('RplInPageNavigation', () => {
  const items = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'how-to-apply', label: 'How to apply' }
  ]

  it('renders a nav element with default aria-label', () => {
    const wrapper = mount(RplInPageNavigation, { props: { items } })
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('On this page')
  })

  it('uses custom aria-label', () => {
    const wrapper = mount(RplInPageNavigation, {
      props: { items, ariaLabel: 'Page sections' }
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Page sections')
  })

  it('renders the default title', () => {
    const wrapper = mount(RplInPageNavigation, { props: { items } })
    expect(wrapper.find('.rpl-in-page-navigation__title').text()).toBe('On this page')
  })

  it('uses custom title', () => {
    const wrapper = mount(RplInPageNavigation, {
      props: { items, title: 'Contents' }
    })
    expect(wrapper.find('.rpl-in-page-navigation__title').text()).toBe('Contents')
  })

  it('renders all navigation items', () => {
    const wrapper = mount(RplInPageNavigation, { props: { items } })
    const listItems = wrapper.findAll('.rpl-in-page-navigation__item')
    expect(listItems).toHaveLength(3)
  })

  it('renders links with correct href anchors', () => {
    const wrapper = mount(RplInPageNavigation, { props: { items } })
    const links = wrapper.findAll('.rpl-in-page-navigation__link')
    expect(links[0].attributes('href')).toBe('#overview')
    expect(links[1].attributes('href')).toBe('#eligibility')
    expect(links[2].attributes('href')).toBe('#how-to-apply')
  })

  it('renders link labels', () => {
    const wrapper = mount(RplInPageNavigation, { props: { items } })
    const links = wrapper.findAll('.rpl-in-page-navigation__link')
    expect(links[0].text()).toBe('Overview')
    expect(links[1].text()).toBe('Eligibility')
    expect(links[2].text()).toBe('How to apply')
  })

  it('renders title as h2', () => {
    const wrapper = mount(RplInPageNavigation, { props: { items } })
    const heading = wrapper.find('.rpl-in-page-navigation__title')
    expect(heading.element.tagName).toBe('H2')
  })

  it('renders an unordered list', () => {
    const wrapper = mount(RplInPageNavigation, { props: { items } })
    expect(wrapper.find('ul.rpl-in-page-navigation__list').exists()).toBe(true)
  })
})
