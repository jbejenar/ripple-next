import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplOptionButton from '../components/atoms/RplOptionButton.vue'

const defaultOptions = [
  { value: 'poor', label: 'Poor' },
  { value: 'fair', label: 'Fair' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' }
]

describe('RplOptionButton', () => {
  it('renders legend text', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions }
    })
    expect(wrapper.find('.rpl-option-button__legend').text()).toContain('Rating')
  })

  it('renders all options', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions }
    })
    const items = wrapper.findAll('.rpl-option-button__item')
    expect(items).toHaveLength(4)
  })

  it('renders option labels', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions }
    })
    const items = wrapper.findAll('.rpl-option-button__item')
    expect(items[0].text()).toContain('Poor')
    expect(items[3].text()).toContain('Excellent')
  })

  it('marks selected option with selected class', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions, modelValue: 'good' }
    })
    const items = wrapper.findAll('.rpl-option-button__item')
    expect(items[2].classes()).toContain('rpl-option-button__item--selected')
    expect(items[0].classes()).not.toContain('rpl-option-button__item--selected')
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions, modelValue: '' }
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    await inputs[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['fair'])
  })

  it('uses hidden radio inputs for accessibility', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions }
    })
    const inputs = wrapper.findAll('.rpl-option-button__input')
    expect(inputs).toHaveLength(4)
    inputs.forEach(input => {
      expect(input.attributes('type')).toBe('radio')
    })
  })

  it('uses fieldset and legend for grouping', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions }
    })
    expect(wrapper.find('fieldset').exists()).toBe(true)
    expect(wrapper.find('legend').exists()).toBe(true)
  })

  it('renders required indicator when required', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions, required: true }
    })
    expect(wrapper.find('.rpl-option-button__required').exists()).toBe(true)
  })

  it('renders error message when error prop is set', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions, error: 'Select one' }
    })
    expect(wrapper.find('.rpl-option-button__error').text()).toBe('Select one')
    expect(wrapper.find('.rpl-option-button__error').attributes('role')).toBe('alert')
  })

  it('sets aria-invalid on fieldset when error exists', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions, error: 'Required' }
    })
    expect(wrapper.find('fieldset').attributes('aria-invalid')).toBe('true')
  })

  it('disables individual option when option.disabled is true', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true }
    ]
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Test', name: 'test', options }
    })
    const items = wrapper.findAll('.rpl-option-button__item')
    expect(items[1].classes()).toContain('rpl-option-button__item--disabled')
  })

  it('disables all options when disabled prop is true', () => {
    const wrapper = mount(RplOptionButton, {
      props: { label: 'Rating', name: 'rating', options: defaultOptions, disabled: true }
    })
    const inputs = wrapper.findAll('input[type="radio"]')
    inputs.forEach(input => {
      expect(input.attributes('disabled')).toBeDefined()
    })
  })
})
