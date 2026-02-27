import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplFormInput from '../components/atoms/RplFormInput.vue'

describe('RplFormInput', () => {
  it('renders label text', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Email address' }
    })
    expect(wrapper.find('.rpl-form-input__label').text()).toContain('Email address')
  })

  it('associates label with input via id', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Name' }
    })
    const label = wrapper.find('label')
    const input = wrapper.find('input')
    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Name', modelValue: '' }
    })
    const input = wrapper.find('input')
    await input.setValue('John')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('renders required indicator when required', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Email', required: true }
    })
    expect(wrapper.find('.rpl-form-input__required').exists()).toBe(true)
    expect(wrapper.find('.rpl-form-input__required').text()).toBe('*')
  })

  it('does not render required indicator by default', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Email' }
    })
    expect(wrapper.find('.rpl-form-input__required').exists()).toBe(false)
  })

  it('sets input type attribute', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Password', type: 'password' }
    })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('defaults to text type', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Name' }
    })
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('renders error message when error prop is set', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Email', error: 'Invalid email' }
    })
    expect(wrapper.find('.rpl-form-input__error').text()).toBe('Invalid email')
    expect(wrapper.find('.rpl-form-input__error').attributes('role')).toBe('alert')
  })

  it('sets aria-invalid when error exists', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Email', error: 'Required' }
    })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-describedby linking to error message', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Email', error: 'Required' }
    })
    const input = wrapper.find('input')
    const errorId = wrapper.find('.rpl-form-input__error').attributes('id')
    expect(input.attributes('aria-describedby')).toBe(errorId)
  })

  it('applies error class to container', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Email', error: 'Required' }
    })
    expect(wrapper.find('.rpl-form-input').classes()).toContain('rpl-form-input--error')
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Name', disabled: true }
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('renders placeholder text', () => {
    const wrapper = mount(RplFormInput, {
      props: { label: 'Search', placeholder: 'Type here...' }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Type here...')
  })
})
