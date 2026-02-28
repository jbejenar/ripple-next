import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplAlert from '../components/atoms/RplAlert.vue'

describe('RplAlert', () => {
  it('renders slot content', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info' },
      slots: { default: 'Alert body text' }
    })
    expect(wrapper.find('.rpl-alert__content').text()).toBe('Alert body text')
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'error', title: 'Error occurred' },
      slots: { default: 'Details here' }
    })
    expect(wrapper.find('.rpl-alert__title').text()).toBe('Error occurred')
  })

  it('does not render title when not provided', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info' },
      slots: { default: 'Info text' }
    })
    expect(wrapper.find('.rpl-alert__title').exists()).toBe(false)
  })

  it('applies error variant class', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'error' },
      slots: { default: 'Error' }
    })
    expect(wrapper.classes()).toContain('rpl-alert--error')
  })

  it('applies success variant class', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'success' },
      slots: { default: 'Success' }
    })
    expect(wrapper.classes()).toContain('rpl-alert--success')
  })

  it('applies warning variant class', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'warning' },
      slots: { default: 'Warning' }
    })
    expect(wrapper.classes()).toContain('rpl-alert--warning')
  })

  it('applies info variant class', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info' },
      slots: { default: 'Info' }
    })
    expect(wrapper.classes()).toContain('rpl-alert--info')
  })

  it('uses role="alert" for error variant', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'error' },
      slots: { default: 'Error' }
    })
    expect(wrapper.attributes('role')).toBe('alert')
  })

  it('uses role="status" for non-error variants', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'success' },
      slots: { default: 'Done' }
    })
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('uses aria-live="assertive" for error variant', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'error' },
      slots: { default: 'Error' }
    })
    expect(wrapper.attributes('aria-live')).toBe('assertive')
  })

  it('uses aria-live="polite" for non-error variants', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info' },
      slots: { default: 'Info' }
    })
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('renders icon with aria-hidden', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'error' },
      slots: { default: 'Error' }
    })
    expect(wrapper.find('.rpl-alert__icon').attributes('aria-hidden')).toBe('true')
  })

  it('does not render dismiss button by default', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info' },
      slots: { default: 'Info' }
    })
    expect(wrapper.find('.rpl-alert__dismiss').exists()).toBe(false)
  })

  it('renders dismiss button when dismissible', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info', dismissible: true },
      slots: { default: 'Info' }
    })
    expect(wrapper.find('.rpl-alert__dismiss').exists()).toBe(true)
  })

  it('emits dismiss event when dismiss button is clicked', async () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info', dismissible: true },
      slots: { default: 'Info' }
    })
    await wrapper.find('.rpl-alert__dismiss').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('dismiss button has accessible label', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info', dismissible: true },
      slots: { default: 'Info' }
    })
    expect(wrapper.find('.rpl-alert__dismiss').attributes('aria-label')).toBe('Dismiss alert')
  })

  it('has root class rpl-alert', () => {
    const wrapper = mount(RplAlert, {
      props: { variant: 'info' },
      slots: { default: 'Info' }
    })
    expect(wrapper.classes()).toContain('rpl-alert')
  })
})
