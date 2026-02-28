import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplDateInput from '../components/atoms/RplDateInput.vue'

describe('RplDateInput', () => {
  it('renders label text', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date of birth' }
    })
    expect(wrapper.find('.rpl-date-input__label').text()).toContain('Date of birth')
  })

  it('associates label with input via id', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date' }
    })
    const label = wrapper.find('label')
    const input = wrapper.find('input')
    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('renders as date input type', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date' }
    })
    expect(wrapper.find('input').attributes('type')).toBe('date')
  })

  it('sets value from modelValue', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', modelValue: '2026-03-01' }
    })
    expect(wrapper.find('input').element.value).toBe('2026-03-01')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', modelValue: '' }
    })
    const input = wrapper.find('input')
    await input.setValue('2026-06-15')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('sets min attribute when provided', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', min: '2026-01-01' }
    })
    expect(wrapper.find('input').attributes('min')).toBe('2026-01-01')
  })

  it('sets max attribute when provided', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', max: '2026-12-31' }
    })
    expect(wrapper.find('input').attributes('max')).toBe('2026-12-31')
  })

  it('renders required indicator when required', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', required: true }
    })
    expect(wrapper.find('.rpl-date-input__required').exists()).toBe(true)
    expect(wrapper.find('.rpl-date-input__required').text()).toBe('*')
  })

  it('renders error message when error prop is set', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', error: 'Invalid date' }
    })
    expect(wrapper.find('.rpl-date-input__error').text()).toBe('Invalid date')
    expect(wrapper.find('.rpl-date-input__error').attributes('role')).toBe('alert')
  })

  it('sets aria-invalid when error exists', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', error: 'Required' }
    })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-describedby linking to error message', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', error: 'Required' }
    })
    const input = wrapper.find('input')
    const errorId = wrapper.find('.rpl-date-input__error').attributes('id')
    expect(input.attributes('aria-describedby')).toBe(errorId)
  })

  it('applies error class to container', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', error: 'Required' }
    })
    expect(wrapper.find('.rpl-date-input').classes()).toContain('rpl-date-input--error')
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(RplDateInput, {
      props: { label: 'Date', disabled: true }
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
})
