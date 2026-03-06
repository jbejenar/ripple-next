import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplMediaEmbed from '../components/molecules/RplMediaEmbed.vue'

describe('RplMediaEmbed', () => {
  it('has root class rpl-media-embed', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: { type: 'video', title: 'Test', src: 'https://example.com/video' }
    })
    expect(wrapper.classes()).toContain('rpl-media-embed')
  })

  it('renders video iframe when type="video"', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'My Video',
        src: 'https://www.youtube-nocookie.com/embed/abc123'
      }
    })
    const iframe = wrapper.find('iframe')
    expect(iframe.exists()).toBe(true)
    expect(iframe.attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123'
    )
    expect(wrapper.find('img.rpl-media-embed__image').exists()).toBe(false)
  })

  it('renders image when type="image"', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'image',
        title: 'My Image',
        src: '/photo.jpg',
        alt: 'A photo'
      }
    })
    const img = wrapper.find('img.rpl-media-embed__image')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/photo.jpg')
    expect(wrapper.find('iframe').exists()).toBe(false)
  })

  it('converts YouTube URL to embed URL', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'YT Video',
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    })
    expect(wrapper.find('iframe').attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    )
  })

  it('converts Vimeo URL to embed URL', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'Vimeo Video',
        src: 'https://vimeo.com/123456789'
      }
    })
    expect(wrapper.find('iframe').attributes('src')).toBe(
      'https://player.vimeo.com/video/123456789'
    )
  })

  it('shows title when showTitle is true', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'Visible Title',
        src: 'https://example.com/video',
        showTitle: true
      }
    })
    const heading = wrapper.find('.rpl-media-embed__title')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Visible Title')
  })

  it('hides title when showTitle is false (default)', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'Hidden Title',
        src: 'https://example.com/video'
      }
    })
    expect(wrapper.find('.rpl-media-embed__title').exists()).toBe(false)
  })

  it('renders caption', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'image',
        title: 'Captioned',
        src: '/photo.jpg',
        caption: 'A lovely sunset'
      }
    })
    const caption = wrapper.find('.rpl-media-embed__caption')
    expect(caption.exists()).toBe(true)
    expect(caption.text()).toBe('A lovely sunset')
  })

  it('renders source caption', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'image',
        title: 'Sourced',
        src: '/photo.jpg',
        sourceCaption: 'Photo by John'
      }
    })
    const source = wrapper.find('.rpl-media-embed__source-caption')
    expect(source.exists()).toBe(true)
    expect(source.text()).toBe('Photo by John')
  })

  it('renders transcript link when transcriptUrl provided', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'With Transcript',
        src: 'https://example.com/video',
        transcriptUrl: '/transcript.pdf'
      }
    })
    const link = wrapper.find('.rpl-media-embed__action-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/transcript.pdf')
    expect(link.text()).toBe('View transcript')
  })

  it('does not render transcript link when no transcriptUrl', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'No Transcript',
        src: 'https://example.com/video'
      }
    })
    const actions = wrapper.find('.rpl-media-embed__actions')
    expect(actions.exists()).toBe(false)
  })

  it('renders fullscreen button when allowFullscreen is true', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'image',
        title: 'Fullscreen Image',
        src: '/photo.jpg',
        allowFullscreen: true
      }
    })
    const btn = wrapper.find('button.rpl-media-embed__action-link')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('View fullscreen')
  })

  it('does not render fullscreen button when allowFullscreen is false (default)', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'image',
        title: 'No Fullscreen',
        src: '/photo.jpg'
      }
    })
    const btn = wrapper.find('button.rpl-media-embed__action-link')
    expect(btn.exists()).toBe(false)
  })

  it('emits view-transcript when transcript link clicked', async () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'Transcript Click',
        src: 'https://example.com/video',
        transcriptUrl: '/transcript.pdf'
      }
    })
    await wrapper.find('.rpl-media-embed__action-link').trigger('click')
    expect(wrapper.emitted('view-transcript')).toHaveLength(1)
  })

  it('applies image variant class', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'image',
        title: 'Portrait',
        src: '/photo.jpg',
        variant: 'portrait'
      }
    })
    expect(
      wrapper.find('.rpl-media-embed__image--portrait').exists()
    ).toBe(true)
  })

  it('image has correct alt text', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'image',
        title: 'Alt Test',
        src: '/photo.jpg',
        alt: 'Descriptive alt text'
      }
    })
    expect(wrapper.find('img').attributes('alt')).toBe('Descriptive alt text')
  })

  it('video iframe has correct title attribute', () => {
    const wrapper = mount(RplMediaEmbed, {
      props: {
        type: 'video',
        title: 'Accessible Video',
        src: 'https://example.com/embed/123'
      }
    })
    expect(wrapper.find('iframe').attributes('title')).toBe('Accessible Video')
  })
})
