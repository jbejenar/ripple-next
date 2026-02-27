import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplEmbeddedVideo from '../components/organisms/content/RplEmbeddedVideo.vue'

describe('RplEmbeddedVideo', () => {
  it('converts YouTube watch URL to embed URL', () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://www.youtube.com/watch?v=abc123' }
    })
    expect(wrapper.find('iframe').attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/abc123'
    )
  })

  it('converts youtu.be short URL to embed URL', () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://youtu.be/xyz789' }
    })
    expect(wrapper.find('iframe').attributes('src')).toBe(
      'https://www.youtube-nocookie.com/embed/xyz789'
    )
  })

  it('converts Vimeo URL to embed URL', () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://vimeo.com/123456789' }
    })
    expect(wrapper.find('iframe').attributes('src')).toBe(
      'https://player.vimeo.com/video/123456789'
    )
  })

  it('passes through unrecognised URLs unchanged', () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://example.com/video.mp4' }
    })
    expect(wrapper.find('iframe').attributes('src')).toBe('https://example.com/video.mp4')
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://youtu.be/abc', title: 'My Video' }
    })
    expect(wrapper.find('.rpl-embedded-video__title').text()).toBe('My Video')
    expect(wrapper.find('iframe').attributes('title')).toBe('My Video')
  })

  it('uses default iframe title when not provided', () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://youtu.be/abc' }
    })
    expect(wrapper.find('iframe').attributes('title')).toBe('Embedded video')
  })

  it('hides transcript toggle when no transcript', () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://youtu.be/abc' }
    })
    expect(wrapper.find('.rpl-embedded-video__transcript').exists()).toBe(false)
  })

  it('shows transcript toggle when transcript provided', () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://youtu.be/abc', transcript: 'Full text here.' }
    })
    expect(wrapper.find('.rpl-embedded-video__transcript-toggle').exists()).toBe(true)
  })

  it('toggles transcript visibility on click', async () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://youtu.be/abc', transcript: 'Full text here.' }
    })
    const toggleBtn = wrapper.find('.rpl-embedded-video__transcript-toggle')
    expect(wrapper.find('.rpl-embedded-video__transcript-content').attributes('style')).toContain('display: none')

    await toggleBtn.trigger('click')
    expect(wrapper.find('.rpl-embedded-video__transcript-content').attributes('style') ?? '').not.toContain('display: none')
    expect(toggleBtn.text()).toBe('Hide transcript')

    await toggleBtn.trigger('click')
    expect(wrapper.find('.rpl-embedded-video__transcript-content').attributes('style')).toContain('display: none')
    expect(toggleBtn.text()).toBe('Show transcript')
  })

  it('sets aria-expanded on transcript toggle', async () => {
    const wrapper = mount(RplEmbeddedVideo, {
      props: { url: 'https://youtu.be/abc', transcript: 'Text' }
    })
    const toggleBtn = wrapper.find('.rpl-embedded-video__transcript-toggle')
    expect(toggleBtn.attributes('aria-expanded')).toBe('false')
    await toggleBtn.trigger('click')
    expect(toggleBtn.attributes('aria-expanded')).toBe('true')
  })
})
