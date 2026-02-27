import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplHeader from '../components/organisms/RplHeader.vue'

describe('RplHeader', () => {
  it('renders site name by default', () => {
    const wrapper = mount(RplHeader)
    expect(wrapper.find('.rpl-header__site-name').text()).toBe('Victoria State Government')
  })

  it('renders custom site name', () => {
    const wrapper = mount(RplHeader, {
      props: { siteName: 'My Agency' }
    })
    expect(wrapper.find('.rpl-header__site-name').text()).toBe('My Agency')
  })

  it('renders logo image when logoUrl is provided', () => {
    const wrapper = mount(RplHeader, {
      props: { siteName: 'My Agency', logoUrl: '/logo.svg' }
    })
    const img = wrapper.find('.rpl-header__logo-img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/logo.svg')
    expect(img.attributes('alt')).toBe('My Agency')
  })

  it('hides text name when logo is shown', () => {
    const wrapper = mount(RplHeader, {
      props: { logoUrl: '/logo.svg' }
    })
    expect(wrapper.find('.rpl-header__site-name').exists()).toBe(false)
  })

  it('renders semantic header element', () => {
    const wrapper = mount(RplHeader)
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('has accessible navigation landmark', () => {
    const wrapper = mount(RplHeader)
    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Primary navigation')
  })

  it('renders slot content in nav', () => {
    const wrapper = mount(RplHeader, {
      slots: { default: '<a href="/">Home</a>' }
    })
    expect(wrapper.find('nav a').text()).toBe('Home')
  })
})
