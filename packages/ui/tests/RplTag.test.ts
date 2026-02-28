import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplTag from '../components/atoms/RplTag.vue'

describe('RplTag', () => {
  it('renders the label text', () => {
    const wrapper = mount(RplTag, {
      props: { label: 'Category' }
    })
    expect(wrapper.text()).toBe('Category')
  })

  it('renders as a span by default', () => {
    const wrapper = mount(RplTag, {
      props: { label: 'Category' }
    })
    expect(wrapper.element.tagName).toBe('SPAN')
  })

  it('renders as an anchor when href is provided', () => {
    const wrapper = mount(RplTag, {
      props: { label: 'Link', href: '/page' }
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/page')
  })

  it('applies default variant class', () => {
    const wrapper = mount(RplTag, {
      props: { label: 'Tag' }
    })
    expect(wrapper.classes()).toContain('rpl-tag--default')
  })

  it('applies specified variant class', () => {
    const wrapper = mount(RplTag, {
      props: { label: 'Tag', variant: 'success' }
    })
    expect(wrapper.classes()).toContain('rpl-tag--success')
  })

  it('applies all variant classes correctly', () => {
    const variants = ['default', 'info', 'success', 'warning', 'error'] as const
    for (const variant of variants) {
      const wrapper = mount(RplTag, {
        props: { label: 'Tag', variant }
      })
      expect(wrapper.classes()).toContain(`rpl-tag--${variant}`)
    }
  })

  it('has the base rpl-tag class', () => {
    const wrapper = mount(RplTag, {
      props: { label: 'Tag' }
    })
    expect(wrapper.classes()).toContain('rpl-tag')
  })

  it('does not render href attribute when no href provided', () => {
    const wrapper = mount(RplTag, {
      props: { label: 'Tag' }
    })
    expect(wrapper.attributes('href')).toBeUndefined()
  })
})
