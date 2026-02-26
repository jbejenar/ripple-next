import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplButton from '../components/atoms/RplButton.vue'

describe('RplButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(RplButton, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(RplButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('applies variant class', () => {
    const wrapper = mount(RplButton, {
      props: { variant: 'secondary' }
    })
    expect(wrapper.classes()).toContain('rpl-button--secondary')
  })

  it('applies size class', () => {
    const wrapper = mount(RplButton, {
      props: { size: 'lg' }
    })
    expect(wrapper.classes()).toContain('rpl-button--lg')
  })

  it('disables when disabled prop is true', () => {
    const wrapper = mount(RplButton, {
      props: { disabled: true }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(RplButton, {
      props: { disabled: true }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('renders with default type button', () => {
    const wrapper = mount(RplButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('accepts submit type', () => {
    const wrapper = mount(RplButton, {
      props: { type: 'submit' }
    })
    expect(wrapper.attributes('type')).toBe('submit')
  })
})
