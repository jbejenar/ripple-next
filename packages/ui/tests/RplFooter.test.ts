import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplFooter from '../components/organisms/RplFooter.vue'

describe('RplFooter', () => {
  it('renders semantic footer element', () => {
    const wrapper = mount(RplFooter)
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('renders default site name in copyright', () => {
    const wrapper = mount(RplFooter)
    expect(wrapper.text()).toContain('Victoria State Government')
  })

  it('renders custom site name', () => {
    const wrapper = mount(RplFooter, {
      props: { siteName: 'My Agency' }
    })
    expect(wrapper.text()).toContain('My Agency')
  })

  it('renders copyright year', () => {
    const wrapper = mount(RplFooter, {
      props: { copyrightYear: 2026 }
    })
    expect(wrapper.text()).toContain('2026')
  })

  it('has accessible navigation landmark', () => {
    const wrapper = mount(RplFooter)
    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Footer navigation')
  })

  it('renders slot content in nav', () => {
    const wrapper = mount(RplFooter, {
      slots: { default: '<a href="/about">About</a>' }
    })
    expect(wrapper.find('nav a').text()).toBe('About')
  })
})
