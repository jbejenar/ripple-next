import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplProfile from '../components/molecules/RplProfile.vue'

describe('RplProfile', () => {
  it('renders the person name', () => {
    const wrapper = mount(RplProfile, { props: { name: 'Jane Smith' } })
    expect(wrapper.find('.rpl-profile__name').text()).toBe('Jane Smith')
  })

  it('renders role when provided', () => {
    const wrapper = mount(RplProfile, {
      props: { name: 'Jane Smith', role: 'Senior Advisor' }
    })
    expect(wrapper.find('.rpl-profile__role').text()).toBe('Senior Advisor')
  })

  it('does not render role element when not provided', () => {
    const wrapper = mount(RplProfile, { props: { name: 'Jane Smith' } })
    expect(wrapper.find('.rpl-profile__role').exists()).toBe(false)
  })

  it('renders organisation when provided', () => {
    const wrapper = mount(RplProfile, {
      props: { name: 'Jane Smith', organisation: 'Dept of Health' }
    })
    expect(wrapper.find('.rpl-profile__organisation').text()).toBe('Dept of Health')
  })

  it('does not render organisation element when not provided', () => {
    const wrapper = mount(RplProfile, { props: { name: 'Jane Smith' } })
    expect(wrapper.find('.rpl-profile__organisation').exists()).toBe(false)
  })

  it('renders profile image when provided', () => {
    const wrapper = mount(RplProfile, {
      props: {
        name: 'Jane Smith',
        image: { src: '/photo.jpg', alt: 'Jane Smith photo' }
      }
    })
    const img = wrapper.find('.rpl-profile__image')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/photo.jpg')
    expect(img.attributes('alt')).toBe('Jane Smith photo')
  })

  it('shows initials placeholder when no image provided', () => {
    const wrapper = mount(RplProfile, { props: { name: 'Jane Smith' } })
    expect(wrapper.find('.rpl-profile__image').exists()).toBe(false)
    expect(wrapper.find('.rpl-profile__initials').exists()).toBe(true)
    expect(wrapper.find('.rpl-profile__initials').text()).toBe('JS')
  })

  it('shows initials for single-word name', () => {
    const wrapper = mount(RplProfile, { props: { name: 'Madonna' } })
    expect(wrapper.find('.rpl-profile__initials').text()).toBe('M')
  })

  it('shows only first two initials for long names', () => {
    const wrapper = mount(RplProfile, { props: { name: 'John Michael Paul Smith' } })
    expect(wrapper.find('.rpl-profile__initials').text()).toBe('JM')
  })

  it('generates tel: link for phone number', () => {
    const wrapper = mount(RplProfile, {
      props: { name: 'Jane Smith', phone: '03 9000 0000' }
    })
    const link = wrapper.find('a[href^="tel:"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('tel:03 9000 0000')
    expect(link.text()).toBe('03 9000 0000')
  })

  it('generates mailto: link for email address', () => {
    const wrapper = mount(RplProfile, {
      props: { name: 'Jane Smith', email: 'jane@example.com' }
    })
    const link = wrapper.find('a[href^="mailto:"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('mailto:jane@example.com')
    expect(link.text()).toBe('jane@example.com')
  })

  it('sets aria-label on phone link', () => {
    const wrapper = mount(RplProfile, {
      props: { name: 'Jane Smith', phone: '03 9000 0000' }
    })
    const link = wrapper.find('a[href^="tel:"]')
    expect(link.attributes('aria-label')).toBe('Phone: 03 9000 0000')
  })

  it('sets aria-label on email link', () => {
    const wrapper = mount(RplProfile, {
      props: { name: 'Jane Smith', email: 'jane@example.com' }
    })
    const link = wrapper.find('a[href^="mailto:"]')
    expect(link.attributes('aria-label')).toBe('Email: jane@example.com')
  })

  it('renders additional links when provided', () => {
    const wrapper = mount(RplProfile, {
      props: {
        name: 'Jane Smith',
        links: [
          { label: 'View profile', url: '/profile' },
          { label: 'Department site', url: 'https://example.gov.au' }
        ]
      }
    })
    const links = wrapper.findAll('.rpl-profile__link')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('View profile')
    expect(links[0].attributes('href')).toBe('/profile')
    expect(links[1].text()).toBe('Department site')
  })

  it('does not render contact list when no contact info provided', () => {
    const wrapper = mount(RplProfile, { props: { name: 'Jane Smith' } })
    expect(wrapper.find('.rpl-profile__contact').exists()).toBe(false)
  })

  it('renders contact list when phone is provided', () => {
    const wrapper = mount(RplProfile, {
      props: { name: 'Jane Smith', phone: '03 9000 0000' }
    })
    expect(wrapper.find('.rpl-profile__contact').exists()).toBe(true)
  })

  it('has accessible name heading as h2', () => {
    const wrapper = mount(RplProfile, { props: { name: 'Jane Smith' } })
    const heading = wrapper.find('.rpl-profile__name')
    expect(heading.element.tagName).toBe('H2')
  })
})
