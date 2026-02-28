import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplDropdown from '../components/atoms/RplDropdown.vue'

const defaultOptions = [
  { value: 'vic', label: 'Victoria' },
  { value: 'nsw', label: 'New South Wales' },
  { value: 'qld', label: 'Queensland' }
]

describe('RplDropdown', () => {
  it('renders label text', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions }
    })
    expect(wrapper.find('.rpl-dropdown__label').text()).toContain('State')
  })

  it('associates label with select via id', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions }
    })
    const label = wrapper.find('label')
    const select = wrapper.find('select')
    expect(label.attributes('for')).toBe(select.attributes('id'))
  })

  it('renders all options', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions }
    })
    const options = wrapper.findAll('option')
    // +1 for placeholder option
    expect(options).toHaveLength(4)
  })

  it('renders placeholder option', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, placeholder: 'Choose one' }
    })
    const placeholder = wrapper.find('option[disabled]')
    expect(placeholder.text()).toBe('Choose one')
  })

  it('selects option matching modelValue', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, modelValue: 'nsw' }
    })
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('nsw')
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, modelValue: '' }
    })
    await wrapper.find('select').setValue('vic')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['vic'])
  })

  it('renders required indicator when required', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, required: true }
    })
    expect(wrapper.find('.rpl-dropdown__required').exists()).toBe(true)
    expect(wrapper.find('.rpl-dropdown__required').text()).toBe('*')
  })

  it('renders error message when error prop is set', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, error: 'Selection required' }
    })
    expect(wrapper.find('.rpl-dropdown__error').text()).toBe('Selection required')
    expect(wrapper.find('.rpl-dropdown__error').attributes('role')).toBe('alert')
  })

  it('sets aria-invalid when error exists', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, error: 'Required' }
    })
    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-describedby linking to error message', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, error: 'Required' }
    })
    const select = wrapper.find('select')
    const errorId = wrapper.find('.rpl-dropdown__error').attributes('id')
    expect(select.attributes('aria-describedby')).toBe(errorId)
  })

  it('applies error class to container', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, error: 'Required' }
    })
    expect(wrapper.find('.rpl-dropdown').classes()).toContain('rpl-dropdown--error')
  })

  it('disables select when disabled prop is true', () => {
    const wrapper = mount(RplDropdown, {
      props: { label: 'State', options: defaultOptions, disabled: true }
    })
    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })

  it('disables individual option when option.disabled is true', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true }
    ]
    const wrapper = mount(RplDropdown, {
      props: { label: 'Test', options }
    })
    const allOptions = wrapper.findAll('option')
    // Skip placeholder option (index 0)
    expect(allOptions[2].attributes('disabled')).toBeDefined()
  })
})
