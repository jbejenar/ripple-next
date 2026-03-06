import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplImage from '../components/atoms/RplImage.vue'

describe('RplImage', () => {
  it('renders img element with src', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg' }
    })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.attributes('src')).toBe('https://example.com/image.jpg')
  })

  it('renders alt text', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', alt: 'A beautiful landscape' }
    })
    expect(wrapper.attributes('alt')).toBe('A beautiful landscape')
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', title: 'Photo credit' }
    })
    expect(wrapper.attributes('title')).toBe('Photo credit')
  })

  it('renders width and height', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', width: 800, height: 600 }
    })
    expect(wrapper.attributes('width')).toBe('800')
    expect(wrapper.attributes('height')).toBe('600')
  })

  it('applies circle class when circle=true', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', circle: true }
    })
    expect(wrapper.classes()).toContain('rpl-image--circle')
  })

  it('applies aspect ratio class', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', aspect: 'wide' }
    })
    expect(wrapper.classes()).toContain('rpl-image--aspect-wide')
  })

  it('applies fit class cover', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', fit: 'cover' }
    })
    expect(wrapper.classes()).toContain('rpl-image--cover')
  })

  it('applies fit class contain', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', fit: 'contain' }
    })
    expect(wrapper.classes()).toContain('rpl-image--contain')
  })

  it('applies fit class none', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', fit: 'none' }
    })
    expect(wrapper.classes()).toContain('rpl-image--none')
  })

  it('sets object-position from focalPoint', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', focalPoint: { x: 30, y: 70 } }
    })
    expect(wrapper.attributes('style')).toContain('object-position: 30% 70%')
  })

  it('does not set object-position without focalPoint', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg' }
    })
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  it('uses lazy loading by default', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg' }
    })
    expect(wrapper.attributes('loading')).toBe('lazy')
  })

  it('uses eager loading when priority="high"', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', priority: 'high' }
    })
    expect(wrapper.attributes('loading')).toBe('eager')
  })

  it('sets fetchpriority="high" when priority="high"', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', priority: 'high' }
    })
    expect(wrapper.attributes('fetchpriority')).toBe('high')
  })

  it('has root class rpl-image', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg' }
    })
    expect(wrapper.classes()).toContain('rpl-image')
  })

  it('applies square aspect when circle without explicit aspect', () => {
    const wrapper = mount(RplImage, {
      props: { src: 'https://example.com/image.jpg', circle: true }
    })
    expect(wrapper.classes()).toContain('rpl-image--aspect-square')
  })
})
