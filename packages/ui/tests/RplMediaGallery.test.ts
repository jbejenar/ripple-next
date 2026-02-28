import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplMediaGallery from '../components/molecules/RplMediaGallery.vue'

const galleryItems = [
  { id: '1', src: '/img1.jpg', alt: 'First image', title: 'Photo 1', caption: 'Caption for photo 1' },
  { id: '2', src: '/img2.jpg', alt: 'Second image', title: 'Photo 2' },
  { id: '3', src: '/img3.jpg', alt: 'Third image', thumbnail: '/thumb3.jpg' }
]

describe('RplMediaGallery', () => {
  it('renders all gallery items', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    const items = wrapper.findAll('.rpl-media-gallery__item')
    expect(items).toHaveLength(3)
  })

  it('renders thumbnails for each item', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    const images = wrapper.findAll('.rpl-media-gallery__thumbnail')
    expect(images).toHaveLength(3)
    expect(images[0].attributes('src')).toBe('/img1.jpg')
    expect(images[0].attributes('alt')).toBe('First image')
  })

  it('uses thumbnail src when available', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    const images = wrapper.findAll('.rpl-media-gallery__thumbnail')
    expect(images[2].attributes('src')).toBe('/thumb3.jpg')
  })

  it('renders item title when provided', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    const titles = wrapper.findAll('.rpl-media-gallery__item-title')
    expect(titles).toHaveLength(2)
    expect(titles[0].text()).toBe('Photo 1')
  })

  it('applies correct grid columns class', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems, columns: 4 }
    })
    expect(wrapper.find('.rpl-media-gallery__grid--cols-4').exists()).toBe(true)
  })

  it('defaults to 3 columns', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    expect(wrapper.find('.rpl-media-gallery__grid--cols-3').exists()).toBe(true)
  })

  it('uses role="list" on grid', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    expect(wrapper.find('.rpl-media-gallery__grid').attributes('role')).toBe('list')
  })

  it('uses role="listitem" on items', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    const items = wrapper.findAll('[role="listitem"]')
    expect(items).toHaveLength(3)
  })

  it('has accessible aria-label on gallery items', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    const firstItem = wrapper.find('.rpl-media-gallery__item')
    expect(firstItem.attributes('aria-label')).toBe('View First image')
  })

  it('emits select event when item clicked', async () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    await wrapper.findAll('.rpl-media-gallery__item')[1].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    const emitted = wrapper.emitted('select')
    expect(emitted).toBeTruthy()
    if (emitted) {
      expect((emitted[0][0] as { id: string }).id).toBe('2')
      expect(emitted[0][1]).toBe(1)
    }
  })

  it('sets lazy loading on thumbnails', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    const images = wrapper.findAll('.rpl-media-gallery__thumbnail')
    for (const img of images) {
      expect(img.attributes('loading')).toBe('lazy')
    }
  })

  it('renders gallery items as buttons for keyboard access', () => {
    const wrapper = mount(RplMediaGallery, {
      props: { items: galleryItems }
    })
    const buttons = wrapper.findAll('.rpl-media-gallery__item')
    for (const btn of buttons) {
      expect(btn.element.tagName).toBe('BUTTON')
      expect(btn.attributes('type')).toBe('button')
    }
  })
})
