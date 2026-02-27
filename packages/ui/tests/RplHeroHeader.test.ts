import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplHeroHeader from '../components/molecules/RplHeroHeader.vue'

describe('RplHeroHeader', () => {
  it('renders title as h1', () => {
    const wrapper = mount(RplHeroHeader, {
      props: { title: 'Welcome' }
    })
    expect(wrapper.find('h1').text()).toBe('Welcome')
  })

  it('renders description when provided', () => {
    const wrapper = mount(RplHeroHeader, {
      props: { title: 'Welcome', description: 'A government platform' }
    })
    expect(wrapper.find('.rpl-hero-header__description').text()).toBe('A government platform')
  })

  it('hides description when not provided', () => {
    const wrapper = mount(RplHeroHeader, {
      props: { title: 'Welcome' }
    })
    expect(wrapper.find('.rpl-hero-header__description').exists()).toBe(false)
  })

  it('applies background image style', () => {
    const wrapper = mount(RplHeroHeader, {
      props: { title: 'Welcome', backgroundImage: '/hero.jpg' }
    })
    const style = wrapper.find('.rpl-hero-header').attributes('style')
    expect(style).toMatch(/url\(["']?\/hero\.jpg["']?\)/)
  })

  it('does not set background style without image', () => {
    const wrapper = mount(RplHeroHeader, {
      props: { title: 'Welcome' }
    })
    const style = wrapper.find('.rpl-hero-header').attributes('style')
    expect(style).toBeUndefined()
  })

  it('renders as section element', () => {
    const wrapper = mount(RplHeroHeader, {
      props: { title: 'Welcome' }
    })
    expect(wrapper.find('section').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(RplHeroHeader, {
      props: { title: 'Welcome' },
      slots: { default: '<button>Get Started</button>' }
    })
    expect(wrapper.find('button').text()).toBe('Get Started')
  })
})
