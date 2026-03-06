import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplForm from '../components/molecules/RplForm.vue'

describe('RplForm', () => {
  it('renders form element with id', () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' }
    })
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
    expect(form.attributes('id')).toBe('my-form')
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form', title: 'Contact Us' }
    })
    expect(wrapper.find('.rpl-form__title').text()).toBe('Contact Us')
  })

  it('does not render title when not provided', () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' }
    })
    expect(wrapper.find('.rpl-form__title').exists()).toBe(false)
  })

  it('renders default slot content', () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' },
      slots: {
        default: '<input type="text" class="test-input" />'
      }
    })
    expect(wrapper.find('.test-input').exists()).toBe(true)
  })

  it('renders actions slot', () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' },
      slots: {
        actions: '<button type="submit" class="custom-btn">Send</button>'
      }
    })
    expect(wrapper.find('.custom-btn').text()).toBe('Send')
  })

  it('renders default submit button when no actions slot', () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' }
    })
    expect(wrapper.find('.rpl-form__submit').exists()).toBe(true)
    expect(wrapper.find('.rpl-form__submit').text()).toBe('Submit')
  })

  it('shows success alert when submissionState.status is success', () => {
    const wrapper = mount(RplForm, {
      props: {
        id: 'my-form',
        submissionState: {
          status: 'success',
          title: 'Success',
          message: 'Form submitted'
        }
      }
    })
    expect(wrapper.find('.rpl-form__alert-box--success').exists()).toBe(true)
    expect(wrapper.find('.rpl-form__alert-title').text()).toBe('Success')
    expect(wrapper.find('.rpl-form__alert-message').text()).toBe('Form submitted')
  })

  it('shows error alert when submissionState.status is error', () => {
    const wrapper = mount(RplForm, {
      props: {
        id: 'my-form',
        submissionState: {
          status: 'error',
          title: 'Error',
          message: 'Something went wrong'
        }
      }
    })
    expect(wrapper.find('.rpl-form__alert-box--error').exists()).toBe(true)
    expect(wrapper.find('.rpl-form__alert-title').text()).toBe('Error')
    expect(wrapper.find('.rpl-form__alert-message').text()).toBe('Something went wrong')
  })

  it('does not show alert when status is idle', () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' }
    })
    expect(wrapper.find('.rpl-form__alert').exists()).toBe(false)
  })

  it('hides form body when hideOnSuccess and status is success', () => {
    const wrapper = mount(RplForm, {
      props: {
        id: 'my-form',
        hideOnSuccess: true,
        submissionState: { status: 'success', message: 'Done' }
      }
    })
    expect(wrapper.find('.rpl-form__body').exists()).toBe(false)
    expect(wrapper.find('.rpl-form__actions').exists()).toBe(false)
  })

  it('disables fieldset when submitting', () => {
    const wrapper = mount(RplForm, {
      props: {
        id: 'my-form',
        submissionState: { status: 'submitting' }
      }
    })
    const fieldset = wrapper.find('.rpl-form__body')
    expect(fieldset.attributes('disabled')).toBeDefined()
  })

  it('submit button shows "Submitting..." when submitting', () => {
    const wrapper = mount(RplForm, {
      props: {
        id: 'my-form',
        submissionState: { status: 'submitting' }
      }
    })
    expect(wrapper.find('.rpl-form__submit').text()).toBe('Submitting...')
  })

  it('emits submit event on form submit', async () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' }
    })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('emits reset event on form reset', async () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' }
    })
    await wrapper.find('form').trigger('reset')
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })

  it('error alert has role="alert"', () => {
    const wrapper = mount(RplForm, {
      props: {
        id: 'my-form',
        submissionState: { status: 'error', message: 'Failed' }
      }
    })
    expect(wrapper.find('.rpl-form__alert-box').attributes('role')).toBe('alert')
  })

  it('success alert has role="status"', () => {
    const wrapper = mount(RplForm, {
      props: {
        id: 'my-form',
        submissionState: { status: 'success', message: 'Done' }
      }
    })
    expect(wrapper.find('.rpl-form__alert-box').attributes('role')).toBe('status')
  })

  it('has root class rpl-form', () => {
    const wrapper = mount(RplForm, {
      props: { id: 'my-form' }
    })
    expect(wrapper.find('.rpl-form').exists()).toBe(true)
  })
})
