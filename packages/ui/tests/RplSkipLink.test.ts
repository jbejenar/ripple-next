import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplSkipLink from '../components/atoms/RplSkipLink.vue'

describe('RplSkipLink', () => {
  it('renders with default props', () => {
    const wrapper = mount(RplSkipLink)
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('#main-content')
    expect(link.text()).toBe('Skip to main content')
  })

  it('uses custom target', () => {
    const wrapper = mount(RplSkipLink, {
      props: { target: '#sidebar' }
    })
    expect(wrapper.find('a').attributes('href')).toBe('#sidebar')
  })

  it('uses custom label', () => {
    const wrapper = mount(RplSkipLink, {
      props: { label: 'Skip to navigation' }
    })
    expect(wrapper.find('a').text()).toBe('Skip to navigation')
  })

  it('has the rpl-skip-link class', () => {
    const wrapper = mount(RplSkipLink)
    expect(wrapper.find('a').classes()).toContain('rpl-skip-link')
  })

  it('renders as an anchor element', () => {
    const wrapper = mount(RplSkipLink)
    expect(wrapper.element.tagName).toBe('A')
  })
})
