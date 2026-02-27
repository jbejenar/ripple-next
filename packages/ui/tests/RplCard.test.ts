import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplCard from '../components/molecules/RplCard.vue'

describe('RplCard', () => {
  it('renders title', () => {
    const wrapper = mount(RplCard, {
      props: { title: 'Card Title' }
    })
    expect(wrapper.find('.rpl-card__title').text()).toBe('Card Title')
  })

  it('renders description', () => {
    const wrapper = mount(RplCard, {
      props: { description: 'A short summary' }
    })
    expect(wrapper.find('.rpl-card__description').text()).toBe('A short summary')
  })

  it('renders as a link when href is provided', () => {
    const wrapper = mount(RplCard, {
      props: { title: 'Link Card', href: '/page' }
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/page')
    expect(wrapper.classes()).toContain('rpl-card--link')
  })

  it('renders as a div when no href', () => {
    const wrapper = mount(RplCard, {
      props: { title: 'Static Card' }
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).not.toContain('rpl-card--link')
  })

  it('renders image when provided', () => {
    const wrapper = mount(RplCard, {
      props: { image: '/photo.jpg', imageAlt: 'A photo' }
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/photo.jpg')
    expect(img.attributes('alt')).toBe('A photo')
  })

  it('hides image section when no image', () => {
    const wrapper = mount(RplCard, {
      props: { title: 'No Image' }
    })
    expect(wrapper.find('.rpl-card__image').exists()).toBe(false)
  })

  it('renders slot content', () => {
    const wrapper = mount(RplCard, {
      slots: { default: '<span class="extra">Extra</span>' }
    })
    expect(wrapper.find('.extra').exists()).toBe(true)
  })

  it('sets lazy loading on image', () => {
    const wrapper = mount(RplCard, {
      props: { image: '/photo.jpg' }
    })
    expect(wrapper.find('img').attributes('loading')).toBe('lazy')
  })
})
