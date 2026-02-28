import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplCallout from '../components/atoms/RplCallout.vue'

describe('RplCallout', () => {
  it('renders slot content', () => {
    const wrapper = mount(RplCallout, {
      slots: { default: 'Callout body text' }
    })
    expect(wrapper.find('.rpl-callout__content').text()).toBe('Callout body text')
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplCallout, {
      props: { title: 'Important' },
      slots: { default: 'Body' }
    })
    expect(wrapper.find('.rpl-callout__title').text()).toBe('Important')
  })

  it('does not render title when not provided', () => {
    const wrapper = mount(RplCallout, {
      slots: { default: 'Body' }
    })
    expect(wrapper.find('.rpl-callout__title').exists()).toBe(false)
  })

  it('applies neutral variant class by default', () => {
    const wrapper = mount(RplCallout, {
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-callout--neutral')
  })

  it('applies primary variant class', () => {
    const wrapper = mount(RplCallout, {
      props: { variant: 'primary' },
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-callout--primary')
  })

  it('applies success variant class', () => {
    const wrapper = mount(RplCallout, {
      props: { variant: 'success' },
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-callout--success')
  })

  it('applies warning variant class', () => {
    const wrapper = mount(RplCallout, {
      props: { variant: 'warning' },
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-callout--warning')
  })

  it('applies error variant class', () => {
    const wrapper = mount(RplCallout, {
      props: { variant: 'error' },
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-callout--error')
  })

  it('uses aside element for semantic markup', () => {
    const wrapper = mount(RplCallout, {
      slots: { default: 'Body' }
    })
    expect(wrapper.element.tagName).toBe('ASIDE')
  })

  it('has role="note"', () => {
    const wrapper = mount(RplCallout, {
      slots: { default: 'Body' }
    })
    expect(wrapper.attributes('role')).toBe('note')
  })

  it('has root class rpl-callout', () => {
    const wrapper = mount(RplCallout, {
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-callout')
  })
})
