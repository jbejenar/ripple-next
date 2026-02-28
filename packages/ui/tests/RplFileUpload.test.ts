import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplFileUpload from '../components/atoms/RplFileUpload.vue'

describe('RplFileUpload', () => {
  it('renders label text', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload document' }
    })
    expect(wrapper.find('.rpl-file-upload__label').text()).toContain('Upload document')
  })

  it('associates label with file input via id', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload' }
    })
    const label = wrapper.find('.rpl-file-upload__label')
    const input = wrapper.find('input[type="file"]')
    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('renders file input type', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload' }
    })
    expect(wrapper.find('input').attributes('type')).toBe('file')
  })

  it('sets accept attribute when provided', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', accept: '.pdf,.doc' }
    })
    expect(wrapper.find('input').attributes('accept')).toBe('.pdf,.doc')
  })

  it('renders accept hint when accept is set', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', accept: '.pdf,.jpg' }
    })
    expect(wrapper.find('.rpl-file-upload__hint').text()).toContain('.pdf,.jpg')
  })

  it('sets multiple attribute when multiple is true', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', multiple: true }
    })
    expect(wrapper.find('input').attributes('multiple')).toBeDefined()
  })

  it('renders prompt text', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload' }
    })
    expect(wrapper.find('.rpl-file-upload__text').text()).toBe('Choose a file or drag it here')
  })

  it('renders required indicator when required', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', required: true }
    })
    expect(wrapper.find('.rpl-file-upload__required').exists()).toBe(true)
    expect(wrapper.find('.rpl-file-upload__required').text()).toBe('*')
  })

  it('renders error message when error prop is set', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', error: 'File too large' }
    })
    expect(wrapper.find('.rpl-file-upload__error').text()).toBe('File too large')
    expect(wrapper.find('.rpl-file-upload__error').attributes('role')).toBe('alert')
  })

  it('sets aria-invalid when error exists', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', error: 'Required' }
    })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('sets aria-describedby linking to error message', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', error: 'Required' }
    })
    const input = wrapper.find('input')
    const errorId = wrapper.find('.rpl-file-upload__error').attributes('id')
    expect(input.attributes('aria-describedby')).toBe(errorId)
  })

  it('applies error class to container', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', error: 'Required' }
    })
    expect(wrapper.find('.rpl-file-upload').classes()).toContain('rpl-file-upload--error')
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(RplFileUpload, {
      props: { label: 'Upload', disabled: true }
    })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
})
