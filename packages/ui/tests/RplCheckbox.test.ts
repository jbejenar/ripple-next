import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplCheckbox from '../components/atoms/RplCheckbox.vue'

describe('RplCheckbox', () => {
  it('renders label text', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'I agree to the terms' }
    })
    expect(wrapper.find('.rpl-checkbox__label').text()).toContain('I agree to the terms')
  })

  it('associates label with input via id', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept' }
    })
    const label = wrapper.find('label')
    const input = wrapper.find('input')
    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', modelValue: false }
    })
    const input = wrapper.find('input')
    await input.setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('renders as checked when modelValue is true', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', modelValue: true }
    })
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })

  it('renders required indicator when required', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', required: true }
    })
    expect(wrapper.find('.rpl-checkbox__required').exists()).toBe(true)
    expect(wrapper.find('.rpl-checkbox__required').text()).toBe('*')
  })

  it('does not render required indicator by default', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept' }
    })
    expect(wrapper.find('.rpl-checkbox__required').exists()).toBe(false)
  })

  it('renders error message when error prop is set', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', error: 'You must accept' }
    })
    expect(wrapper.find('.rpl-checkbox__error').text()).toBe('You must accept')
    expect(wrapper.find('.rpl-checkbox__error').attributes('role')).toBe('alert')
  })

  it('sets aria-invalid when error exists', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', error: 'Required' }
    })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-describedby linking to error message', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', error: 'Required' }
    })
    const input = wrapper.find('input')
    const errorId = wrapper.find('.rpl-checkbox__error').attributes('id')
    expect(input.attributes('aria-describedby')).toBe(errorId)
  })

  it('applies error class to container', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', error: 'Required' }
    })
    expect(wrapper.find('.rpl-checkbox').classes()).toContain('rpl-checkbox--error')
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', disabled: true }
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('applies disabled class to container', () => {
    const wrapper = mount(RplCheckbox, {
      props: { label: 'Accept', disabled: true }
    })
    expect(wrapper.find('.rpl-checkbox').classes()).toContain('rpl-checkbox--disabled')
  })
})
