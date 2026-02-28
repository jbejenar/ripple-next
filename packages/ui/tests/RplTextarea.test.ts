import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplTextarea from '../components/atoms/RplTextarea.vue'

describe('RplTextarea', () => {
  it('renders label text', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments' }
    })
    expect(wrapper.find('.rpl-textarea__label').text()).toContain('Comments')
  })

  it('associates label with textarea via id', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments' }
    })
    const label = wrapper.find('label')
    const textarea = wrapper.find('textarea')
    expect(label.attributes('for')).toBe(textarea.attributes('id'))
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', modelValue: '' }
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Hello')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('renders placeholder text', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', placeholder: 'Enter comments...' }
    })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Enter comments...')
  })

  it('sets rows attribute', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', rows: 8 }
    })
    expect(wrapper.find('textarea').attributes('rows')).toBe('8')
  })

  it('defaults to 4 rows', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments' }
    })
    expect(wrapper.find('textarea').attributes('rows')).toBe('4')
  })

  it('renders character counter when maxlength is set', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', maxlength: 500, modelValue: 'Hello' }
    })
    expect(wrapper.find('.rpl-textarea__counter').text()).toBe('5/500')
  })

  it('does not render character counter when maxlength is not set', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments' }
    })
    expect(wrapper.find('.rpl-textarea__counter').exists()).toBe(false)
  })

  it('renders required indicator when required', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', required: true }
    })
    expect(wrapper.find('.rpl-textarea__required').exists()).toBe(true)
    expect(wrapper.find('.rpl-textarea__required').text()).toBe('*')
  })

  it('renders error message when error prop is set', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', error: 'Required field' }
    })
    expect(wrapper.find('.rpl-textarea__error').text()).toBe('Required field')
    expect(wrapper.find('.rpl-textarea__error').attributes('role')).toBe('alert')
  })

  it('sets aria-invalid when error exists', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', error: 'Required' }
    })
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-describedby linking to error message', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', error: 'Required' }
    })
    const textarea = wrapper.find('textarea')
    const errorId = wrapper.find('.rpl-textarea__error').attributes('id')
    expect(textarea.attributes('aria-describedby')).toBe(errorId)
  })

  it('applies error class to container', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', error: 'Required' }
    })
    expect(wrapper.find('.rpl-textarea').classes()).toContain('rpl-textarea--error')
  })

  it('disables textarea when disabled prop is true', () => {
    const wrapper = mount(RplTextarea, {
      props: { label: 'Comments', disabled: true }
    })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
  })
})
