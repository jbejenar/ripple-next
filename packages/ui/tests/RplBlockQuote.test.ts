import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplBlockQuote from '../components/atoms/RplBlockQuote.vue'

describe('RplBlockQuote', () => {
  it('renders slot content as the quote', () => {
    const wrapper = mount(RplBlockQuote, {
      slots: { default: 'This is a quote.' }
    })
    expect(wrapper.find('.rpl-blockquote__quote').text()).toBe('This is a quote.')
  })

  it('renders author when provided', () => {
    const wrapper = mount(RplBlockQuote, {
      props: { author: 'John Doe' },
      slots: { default: 'A quote.' }
    })
    expect(wrapper.find('.rpl-blockquote__author').text()).toBe('John Doe')
  })

  it('renders author title when provided', () => {
    const wrapper = mount(RplBlockQuote, {
      props: { author: 'John Doe', authorTitle: 'Minister' },
      slots: { default: 'A quote.' }
    })
    expect(wrapper.find('.rpl-blockquote__author-title').text()).toBe('Minister')
  })

  it('does not render attribution when author is not provided', () => {
    const wrapper = mount(RplBlockQuote, {
      slots: { default: 'A quote.' }
    })
    expect(wrapper.find('.rpl-blockquote__attribution').exists()).toBe(false)
  })

  it('does not render author title when only author is provided', () => {
    const wrapper = mount(RplBlockQuote, {
      props: { author: 'Jane Smith' },
      slots: { default: 'A quote.' }
    })
    expect(wrapper.find('.rpl-blockquote__author-title').exists()).toBe(false)
  })

  it('uses figure element for semantic markup', () => {
    const wrapper = mount(RplBlockQuote, {
      slots: { default: 'A quote.' }
    })
    expect(wrapper.element.tagName).toBe('FIGURE')
  })

  it('uses blockquote element for the quote text', () => {
    const wrapper = mount(RplBlockQuote, {
      slots: { default: 'A quote.' }
    })
    expect(wrapper.find('.rpl-blockquote__quote').element.tagName).toBe('BLOCKQUOTE')
  })

  it('uses figcaption for attribution', () => {
    const wrapper = mount(RplBlockQuote, {
      props: { author: 'John Doe' },
      slots: { default: 'A quote.' }
    })
    expect(wrapper.find('.rpl-blockquote__attribution').element.tagName).toBe('FIGCAPTION')
  })

  it('has root class rpl-blockquote', () => {
    const wrapper = mount(RplBlockQuote, {
      slots: { default: 'A quote.' }
    })
    expect(wrapper.classes()).toContain('rpl-blockquote')
  })
})
