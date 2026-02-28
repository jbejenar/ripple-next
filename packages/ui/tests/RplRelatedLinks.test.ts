import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplRelatedLinks from '../components/molecules/RplRelatedLinks.vue'

describe('RplRelatedLinks', () => {
  const links = [
    { text: 'Apply for a grant', url: '/grants' },
    { text: 'Check eligibility', url: '/eligibility' },
    { text: 'Contact us', url: '/contact' }
  ]

  it('renders a nav element', () => {
    const wrapper = mount(RplRelatedLinks, { props: { links } })
    expect(wrapper.find('nav').exists()).toBe(true)
  })

  it('renders default title', () => {
    const wrapper = mount(RplRelatedLinks, { props: { links } })
    expect(wrapper.find('.rpl-related-links__title').text()).toBe('Related links')
  })

  it('uses custom title', () => {
    const wrapper = mount(RplRelatedLinks, {
      props: { links, title: 'More information' }
    })
    expect(wrapper.find('.rpl-related-links__title').text()).toBe('More information')
  })

  it('has aria-label on nav', () => {
    const wrapper = mount(RplRelatedLinks, { props: { links } })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Related links')
  })

  it('uses custom title as aria-label', () => {
    const wrapper = mount(RplRelatedLinks, {
      props: { links, title: 'Resources' }
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Resources')
  })

  it('renders all links', () => {
    const wrapper = mount(RplRelatedLinks, { props: { links } })
    const items = wrapper.findAll('.rpl-related-links__item')
    expect(items).toHaveLength(3)
  })

  it('renders link text correctly', () => {
    const wrapper = mount(RplRelatedLinks, { props: { links } })
    const linkElements = wrapper.findAll('.rpl-related-links__link')
    expect(linkElements[0].text()).toBe('Apply for a grant')
    expect(linkElements[1].text()).toBe('Check eligibility')
    expect(linkElements[2].text()).toBe('Contact us')
  })

  it('renders link urls correctly', () => {
    const wrapper = mount(RplRelatedLinks, { props: { links } })
    const linkElements = wrapper.findAll('.rpl-related-links__link')
    expect(linkElements[0].attributes('href')).toBe('/grants')
    expect(linkElements[1].attributes('href')).toBe('/eligibility')
    expect(linkElements[2].attributes('href')).toBe('/contact')
  })

  it('renders title as h2', () => {
    const wrapper = mount(RplRelatedLinks, { props: { links } })
    const heading = wrapper.find('.rpl-related-links__title')
    expect(heading.element.tagName).toBe('H2')
  })

  it('renders an unordered list', () => {
    const wrapper = mount(RplRelatedLinks, { props: { links } })
    expect(wrapper.find('ul.rpl-related-links__list').exists()).toBe(true)
  })
})
