import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplContactUs from '../components/molecules/RplContactUs.vue'

describe('RplContactUs', () => {
  it('renders default title "Contact us"', () => {
    const wrapper = mount(RplContactUs)
    expect(wrapper.find('.rpl-contact-us__title').text()).toBe('Contact us')
  })

  it('renders custom title', () => {
    const wrapper = mount(RplContactUs, { props: { title: 'Get in touch' } })
    expect(wrapper.find('.rpl-contact-us__title').text()).toBe('Get in touch')
  })

  it('hides title when title is false', () => {
    const wrapper = mount(RplContactUs, { props: { title: false } })
    expect(wrapper.find('.rpl-contact-us__title').exists()).toBe(false)
  })

  it('renders slot content', () => {
    const wrapper = mount(RplContactUs, {
      slots: { default: '<p>Additional info</p>' }
    })
    expect(wrapper.find('.rpl-contact-us__body').text()).toBe('Additional info')
  })

  it('renders address name', () => {
    const wrapper = mount(RplContactUs, {
      props: { address: { name: 'John Smith' } }
    })
    expect(wrapper.find('.rpl-contact-us__address-name').text()).toBe('John Smith')
  })

  it('renders address department', () => {
    const wrapper = mount(RplContactUs, {
      props: { address: { department: 'Department of Health' } }
    })
    expect(wrapper.find('.rpl-contact-us__address-department').text()).toBe('Department of Health')
  })

  it('renders address street', () => {
    const wrapper = mount(RplContactUs, {
      props: { address: { street: '50 Lonsdale St, Melbourne' } }
    })
    expect(wrapper.find('.rpl-contact-us__address-street').text()).toBe('50 Lonsdale St, Melbourne')
  })

  it('renders contact items as links', () => {
    const wrapper = mount(RplContactUs, {
      props: {
        items: [
          { label: 'Call us', url: 'tel:1300000000' },
          { label: 'Email us', url: 'mailto:info@example.com' }
        ]
      }
    })
    const links = wrapper.findAll('.rpl-contact-us__link')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('Call us')
    expect(links[0].attributes('href')).toBe('tel:1300000000')
    expect(links[1].text()).toBe('Email us')
    expect(links[1].attributes('href')).toBe('mailto:info@example.com')
  })

  it('does not render address section when no address', () => {
    const wrapper = mount(RplContactUs)
    expect(wrapper.find('.rpl-contact-us__address').exists()).toBe(false)
  })

  it('does not render items list when empty', () => {
    const wrapper = mount(RplContactUs)
    expect(wrapper.find('.rpl-contact-us__items').exists()).toBe(false)
  })

  it('has root class rpl-contact-us', () => {
    const wrapper = mount(RplContactUs)
    expect(wrapper.classes()).toContain('rpl-contact-us')
  })
})
