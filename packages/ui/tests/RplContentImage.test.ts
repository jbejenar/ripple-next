import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplContentImage from '../components/organisms/content/RplContentImage.vue'

describe('RplContentImage', () => {
  const baseImage = { src: '/photo.jpg', alt: 'A photo' }

  it('renders image with src and alt', () => {
    const wrapper = mount(RplContentImage, {
      props: { image: baseImage }
    })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('/photo.jpg')
    expect(img.attributes('alt')).toBe('A photo')
  })

  it('renders as figure element', () => {
    const wrapper = mount(RplContentImage, {
      props: { image: baseImage }
    })
    expect(wrapper.find('figure').exists()).toBe(true)
  })

  it('renders caption when provided', () => {
    const wrapper = mount(RplContentImage, {
      props: { image: baseImage, caption: 'Photo credit: Gov' }
    })
    expect(wrapper.find('figcaption').text()).toBe('Photo credit: Gov')
  })

  it('hides caption when not provided', () => {
    const wrapper = mount(RplContentImage, {
      props: { image: baseImage }
    })
    expect(wrapper.find('figcaption').exists()).toBe(false)
  })

  it('sets lazy loading', () => {
    const wrapper = mount(RplContentImage, {
      props: { image: baseImage }
    })
    expect(wrapper.find('img').attributes('loading')).toBe('lazy')
  })

  it('passes width and height attributes', () => {
    const wrapper = mount(RplContentImage, {
      props: { image: { ...baseImage, width: 800, height: 600 } }
    })
    expect(wrapper.find('img').attributes('width')).toBe('800')
    expect(wrapper.find('img').attributes('height')).toBe('600')
  })

  it('passes title attribute', () => {
    const wrapper = mount(RplContentImage, {
      props: { image: { ...baseImage, title: 'Hover text' } }
    })
    expect(wrapper.find('img').attributes('title')).toBe('Hover text')
  })
})
