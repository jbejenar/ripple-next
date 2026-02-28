import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplFormAlert from '../components/atoms/RplFormAlert.vue'

describe('RplFormAlert', () => {
  it('renders message text', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'error', message: 'Something went wrong' }
    })
    expect(wrapper.find('.rpl-form-alert__message').text()).toBe('Something went wrong')
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'error', title: 'Error', message: 'Failed' }
    })
    expect(wrapper.find('.rpl-form-alert__title').text()).toBe('Error')
  })

  it('does not render title when not provided', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'info', message: 'Info message' }
    })
    expect(wrapper.find('.rpl-form-alert__title').exists()).toBe(false)
  })

  it('applies variant class', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'success', message: 'Done' }
    })
    expect(wrapper.find('.rpl-form-alert').classes()).toContain('rpl-form-alert--success')
  })

  it('applies error variant class', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'error', message: 'Failed' }
    })
    expect(wrapper.find('.rpl-form-alert').classes()).toContain('rpl-form-alert--error')
  })

  it('applies warning variant class', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'warning', message: 'Caution' }
    })
    expect(wrapper.find('.rpl-form-alert').classes()).toContain('rpl-form-alert--warning')
  })

  it('applies info variant class', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'info', message: 'Note' }
    })
    expect(wrapper.find('.rpl-form-alert').classes()).toContain('rpl-form-alert--info')
  })

  it('uses role="alert" for error variant', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'error', message: 'Error' }
    })
    expect(wrapper.find('.rpl-form-alert').attributes('role')).toBe('alert')
  })

  it('uses role="status" for non-error variants', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'success', message: 'Done' }
    })
    expect(wrapper.find('.rpl-form-alert').attributes('role')).toBe('status')
  })

  it('uses aria-live="assertive" for error variant', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'error', message: 'Error' }
    })
    expect(wrapper.find('.rpl-form-alert').attributes('aria-live')).toBe('assertive')
  })

  it('uses aria-live="polite" for non-error variants', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'info', message: 'Info' }
    })
    expect(wrapper.find('.rpl-form-alert').attributes('aria-live')).toBe('polite')
  })

  it('renders icon with aria-hidden', () => {
    const wrapper = mount(RplFormAlert, {
      props: { variant: 'error', message: 'Error' }
    })
    expect(wrapper.find('.rpl-form-alert__icon').attributes('aria-hidden')).toBe('true')
  })
})
