import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplRadio from '../components/atoms/RplRadio.vue'

const defaultOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'post', label: 'Post' }
]

describe('RplRadio', () => {
  it('renders legend text', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact method', name: 'contact', options: defaultOptions }
    })
    expect(wrapper.find('.rpl-radio__legend').text()).toContain('Contact method')
  })

  it('renders all options', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact method', name: 'contact', options: defaultOptions }
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    expect(inputs).toHaveLength(3)
  })

  it('renders option labels', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact method', name: 'contact', options: defaultOptions }
    })
    const labels = wrapper.findAll('.rpl-radio__label')
    expect(labels[0].text()).toBe('Email')
    expect(labels[1].text()).toBe('Phone')
    expect(labels[2].text()).toBe('Post')
  })

  it('checks the option matching modelValue', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact', name: 'contact', options: defaultOptions, modelValue: 'phone' }
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    expect((inputs[1].element as HTMLInputElement).checked).toBe(true)
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact', name: 'contact', options: defaultOptions, modelValue: '' }
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    await inputs[0].setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['email'])
  })

  it('uses fieldset and legend for grouping', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact', name: 'contact', options: defaultOptions }
    })
    expect(wrapper.find('fieldset').exists()).toBe(true)
    expect(wrapper.find('legend').exists()).toBe(true)
  })

  it('sets same name attribute for all radios', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact', name: 'contact', options: defaultOptions }
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    inputs.forEach(input => {
      expect(input.attributes('name')).toBe('contact')
    })
  })

  it('renders required indicator when required', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact', name: 'contact', options: defaultOptions, required: true }
    })
    expect(wrapper.find('.rpl-radio__required').exists()).toBe(true)
  })

  it('renders error message when error prop is set', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact', name: 'contact', options: defaultOptions, error: 'Select one' }
    })
    expect(wrapper.find('.rpl-radio__error').text()).toBe('Select one')
    expect(wrapper.find('.rpl-radio__error').attributes('role')).toBe('alert')
  })

  it('sets aria-invalid on fieldset when error exists', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact', name: 'contact', options: defaultOptions, error: 'Required' }
    })
    expect(wrapper.find('fieldset').attributes('aria-invalid')).toBe('true')
  })

  it('disables individual option when option.disabled is true', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true }
    ]
    const wrapper = mount(RplRadio, {
      props: { label: 'Test', name: 'test', options }
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    expect(inputs[0].attributes('disabled')).toBeUndefined()
    expect(inputs[1].attributes('disabled')).toBeDefined()
  })

  it('disables all options when disabled prop is true', () => {
    const wrapper = mount(RplRadio, {
      props: { label: 'Contact', name: 'contact', options: defaultOptions, disabled: true }
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    inputs.forEach(input => {
      expect(input.attributes('disabled')).toBeDefined()
    })
  })
})
