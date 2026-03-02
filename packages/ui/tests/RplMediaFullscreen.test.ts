import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RplMediaFullscreen from '../components/molecules/RplMediaFullscreen.vue'

const imageMedia = {
  type: 'image' as const,
  src: '/test-image.jpg',
  alt: 'Test image alt text',
  caption: 'Test caption'
}

const videoMedia = {
  type: 'video' as const,
  src: '/test-video.mp4',
  alt: 'Test video'
}

const embedVideoMedia = {
  type: 'video' as const,
  src: 'https://www.youtube.com/embed/abc123',
  alt: 'Embedded video'
}

afterEach(() => {
  document.body.style.overflow = ''
})

describe('RplMediaFullscreen', () => {
  it('does not render overlay when open is false', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: false },
      attachTo: document.body
    })
    expect(wrapper.find('.rpl-media-fullscreen').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders overlay when open is true', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    expect(wrapper.find('.rpl-media-fullscreen').exists()).toBe(true)
    wrapper.unmount()
  })

  it('emits update:open with false when close button is clicked', async () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    await wrapper.find('.rpl-media-fullscreen__close').trigger('click')
    expect(wrapper.emitted('update:open')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('emits update:open with false when Escape key is pressed', async () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    await wrapper.find('.rpl-media-fullscreen').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:open')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('renders image element in image mode', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    const img = wrapper.find('.rpl-media-fullscreen__img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/test-image.jpg')
    expect(img.attributes('alt')).toBe('Test image alt text')
    wrapper.unmount()
  })

  it('renders native video element for non-embed video src', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: videoMedia, open: true },
      attachTo: document.body
    })
    expect(wrapper.find('.rpl-media-fullscreen__video').exists()).toBe(true)
    expect(wrapper.find('.rpl-media-fullscreen__iframe').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders iframe for embedded video URLs', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: embedVideoMedia, open: true },
      attachTo: document.body
    })
    expect(wrapper.find('.rpl-media-fullscreen__iframe').exists()).toBe(true)
    expect(wrapper.find('.rpl-media-fullscreen__video').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders caption when provided', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    const caption = wrapper.find('.rpl-media-fullscreen__caption')
    expect(caption.exists()).toBe(true)
    expect(caption.text()).toBe('Test caption')
    wrapper.unmount()
  })

  it('does not render caption when not provided', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: { type: 'image', src: '/img.jpg', alt: 'Alt' }, open: true },
      attachTo: document.body
    })
    expect(wrapper.find('.rpl-media-fullscreen__caption').exists()).toBe(false)
    wrapper.unmount()
  })

  it('has role="dialog" on the overlay', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    const dialog = wrapper.find('.rpl-media-fullscreen')
    expect(dialog.attributes('role')).toBe('dialog')
    wrapper.unmount()
  })

  it('has aria-modal="true" on the overlay', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    const dialog = wrapper.find('.rpl-media-fullscreen')
    expect(dialog.attributes('aria-modal')).toBe('true')
    wrapper.unmount()
  })

  it('has aria-label on the dialog', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    const dialog = wrapper.find('.rpl-media-fullscreen')
    expect(dialog.attributes('aria-label')).toBe('Test image alt text')
    wrapper.unmount()
  })

  it('has accessible label on close button', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    const closeBtn = wrapper.find('.rpl-media-fullscreen__close')
    expect(closeBtn.attributes('aria-label')).toBe('Close fullscreen viewer')
    wrapper.unmount()
  })

  it('close button has type="button"', () => {
    const wrapper = mount(RplMediaFullscreen, {
      props: { media: imageMedia, open: true },
      attachTo: document.body
    })
    const closeBtn = wrapper.find('.rpl-media-fullscreen__close')
    expect(closeBtn.attributes('type')).toBe('button')
    wrapper.unmount()
  })
})
