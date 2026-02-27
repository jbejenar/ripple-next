import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplCallToAction from '../components/organisms/content/RplCallToAction.vue'
import RplButton from '../components/atoms/RplButton.vue'

const baseCta = {
  title: 'Get Involved',
  summary: 'Join our community program.',
  link: { text: 'Sign Up', url: '/signup' }
}

describe('RplCallToAction', () => {
  it('renders title', () => {
    const wrapper = mount(RplCallToAction, {
      props: { cta: baseCta },
      global: { components: { RplButton } }
    })
    expect(wrapper.find('.rpl-call-to-action__title').text()).toBe('Get Involved')
  })

  it('renders summary', () => {
    const wrapper = mount(RplCallToAction, {
      props: { cta: baseCta },
      global: { components: { RplButton } }
    })
    expect(wrapper.find('.rpl-call-to-action__summary').text()).toBe('Join our community program.')
  })

  it('renders action button with link text', () => {
    const wrapper = mount(RplCallToAction, {
      props: { cta: baseCta },
      global: { components: { RplButton } }
    })
    expect(wrapper.findComponent(RplButton).text()).toBe('Sign Up')
  })

  it('applies with-image class when image provided', () => {
    const wrapper = mount(RplCallToAction, {
      props: {
        cta: { ...baseCta, image: { src: '/cta.jpg', alt: 'CTA image' } }
      },
      global: { components: { RplButton } }
    })
    expect(wrapper.find('.rpl-call-to-action').classes()).toContain('rpl-call-to-action--with-image')
  })

  it('renders image when provided', () => {
    const wrapper = mount(RplCallToAction, {
      props: {
        cta: { ...baseCta, image: { src: '/cta.jpg', alt: 'CTA image' } }
      },
      global: { components: { RplButton } }
    })
    const img = wrapper.find('.rpl-call-to-action__image img')
    expect(img.attributes('src')).toBe('/cta.jpg')
    expect(img.attributes('alt')).toBe('CTA image')
  })

  it('hides image section when no image', () => {
    const wrapper = mount(RplCallToAction, {
      props: { cta: baseCta },
      global: { components: { RplButton } }
    })
    expect(wrapper.find('.rpl-call-to-action__image').exists()).toBe(false)
  })
})
