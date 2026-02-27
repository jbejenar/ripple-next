import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplIcon from '../components/atoms/RplIcon.vue'

describe('RplIcon', () => {
  it('renders an svg element', () => {
    const wrapper = mount(RplIcon, {
      props: { name: 'search' }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('uses icon name in href', () => {
    const wrapper = mount(RplIcon, {
      props: { name: 'arrow-right' }
    })
    expect(wrapper.find('use').attributes('href')).toBe('#rpl-icon-arrow-right')
  })

  it('applies size class', () => {
    const wrapper = mount(RplIcon, {
      props: { name: 'search', size: 'lg' }
    })
    expect(wrapper.find('svg').classes()).toContain('rpl-icon--lg')
  })

  it('defaults to md size', () => {
    const wrapper = mount(RplIcon, {
      props: { name: 'search' }
    })
    expect(wrapper.find('svg').classes()).toContain('rpl-icon--md')
    expect(wrapper.find('svg').attributes('width')).toBe('24')
    expect(wrapper.find('svg').attributes('height')).toBe('24')
  })

  it('sets dimensions based on size', () => {
    const wrapper = mount(RplIcon, {
      props: { name: 'search', size: 'xl' }
    })
    expect(wrapper.find('svg').attributes('width')).toBe('48')
    expect(wrapper.find('svg').attributes('height')).toBe('48')
  })

  it('applies custom color', () => {
    const wrapper = mount(RplIcon, {
      props: { name: 'search', color: '#ff0000' }
    })
    expect(wrapper.find('svg').attributes('fill')).toBe('#ff0000')
  })

  it('defaults to currentColor', () => {
    const wrapper = mount(RplIcon, {
      props: { name: 'search' }
    })
    expect(wrapper.find('svg').attributes('fill')).toBe('currentColor')
  })

  it('is hidden from assistive technology', () => {
    const wrapper = mount(RplIcon, {
      props: { name: 'search' }
    })
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })
})
