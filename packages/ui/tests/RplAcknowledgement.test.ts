import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplAcknowledgement from '../components/atoms/RplAcknowledgement.vue'

describe('RplAcknowledgement', () => {
  it('renders slot content', () => {
    const wrapper = mount(RplAcknowledgement, {
      slots: { default: 'We acknowledge the Traditional Owners.' }
    })
    expect(wrapper.find('.rpl-acknowledgement__content').text()).toBe('We acknowledge the Traditional Owners.')
  })

  it('renders text prop when no slot provided', () => {
    const wrapper = mount(RplAcknowledgement, {
      props: { text: 'Acknowledgement text via prop' }
    })
    expect(wrapper.find('.rpl-acknowledgement__content').text()).toBe('Acknowledgement text via prop')
  })

  it('applies country type class by default', () => {
    const wrapper = mount(RplAcknowledgement, {
      slots: { default: 'Text' }
    })
    expect(wrapper.classes()).toContain('rpl-acknowledgement--country')
  })

  it('applies people type class', () => {
    const wrapper = mount(RplAcknowledgement, {
      props: { type: 'people' },
      slots: { default: 'Text' }
    })
    expect(wrapper.classes()).toContain('rpl-acknowledgement--people')
  })

  it('uses section element for semantic markup', () => {
    const wrapper = mount(RplAcknowledgement, {
      slots: { default: 'Text' }
    })
    expect(wrapper.element.tagName).toBe('SECTION')
  })

  it('has aria-label="Acknowledgement"', () => {
    const wrapper = mount(RplAcknowledgement, {
      slots: { default: 'Text' }
    })
    expect(wrapper.attributes('aria-label')).toBe('Acknowledgement')
  })

  it('renders icon with aria-hidden', () => {
    const wrapper = mount(RplAcknowledgement, {
      slots: { default: 'Text' }
    })
    expect(wrapper.find('.rpl-acknowledgement__icon').attributes('aria-hidden')).toBe('true')
  })

  it('has root class rpl-acknowledgement', () => {
    const wrapper = mount(RplAcknowledgement, {
      slots: { default: 'Text' }
    })
    expect(wrapper.classes()).toContain('rpl-acknowledgement')
  })

  it('renders SVG icon', () => {
    const wrapper = mount(RplAcknowledgement, {
      slots: { default: 'Text' }
    })
    expect(wrapper.find('.rpl-acknowledgement__icon svg').exists()).toBe(true)
  })
})
