import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RplSocialShare from '../components/molecules/RplSocialShare.vue'

describe('RplSocialShare', () => {
  it('renders title', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: 'https://example.com' }
    })
    expect(wrapper.find('.rpl-social-share__title').text()).toBe('Share this page')
  })

  it('renders custom title', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: 'https://example.com', title: 'Share via' }
    })
    expect(wrapper.find('.rpl-social-share__title').text()).toBe('Share via')
  })

  it('renders default network links (Facebook, LinkedIn, X)', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: 'https://example.com' }
    })
    const links = wrapper.findAll('.rpl-social-share__link')
    expect(links).toHaveLength(3)
    expect(links[0].text()).toBe('Facebook')
    expect(links[1].text()).toBe('LinkedIn')
    expect(links[2].text()).toBe('X (formerly Twitter)')
  })

  it('renders correct share URLs with encoded page title and url', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: 'https://example.com/path?a=1' }
    })
    const links = wrapper.findAll('.rpl-social-share__link')
    const facebookHref = links[0].attributes('href')
    expect(facebookHref).toContain('https://www.facebook.com/sharer/sharer.php')
    expect(facebookHref).toContain(encodeURIComponent('https://example.com/path?a=1'))
    expect(facebookHref).toContain(encodeURIComponent('My Page'))

    const linkedinHref = links[1].attributes('href')
    expect(linkedinHref).toContain('https://www.linkedin.com/shareArticle')
    expect(linkedinHref).toContain(encodeURIComponent('https://example.com/path?a=1'))

    const xHref = links[2].attributes('href')
    expect(xHref).toContain('https://twitter.com/intent/tweet')
    expect(xHref).toContain(encodeURIComponent('My Page'))
    expect(xHref).toContain(encodeURIComponent('https://example.com/path?a=1'))
  })

  it('shows X label as "X (formerly Twitter)"', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: 'https://example.com', networks: ['X'] }
    })
    expect(wrapper.find('.rpl-social-share__link').text()).toBe('X (formerly Twitter)')
  })

  it('does not render if pageTitle is empty', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: '', url: 'https://example.com' }
    })
    expect(wrapper.find('.rpl-social-share').exists()).toBe(false)
  })

  it('does not render if url is empty', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: '' }
    })
    expect(wrapper.find('.rpl-social-share').exists()).toBe(false)
  })

  it('renders email link when email prop provided', () => {
    const wrapper = mount(RplSocialShare, {
      props: {
        pageTitle: 'My Page',
        url: 'https://example.com',
        email: { subject: 'Check this out', body: 'Have a look at this page' }
      }
    })
    const links = wrapper.findAll('.rpl-social-share__link')
    const emailLink = links[links.length - 1]
    expect(emailLink.text()).toBe('Email')
    expect(emailLink.attributes('href')).toContain('mailto:?subject=')
    expect(emailLink.attributes('href')).toContain(encodeURIComponent('Check this out'))
    expect(emailLink.attributes('href')).toContain(encodeURIComponent('Have a look at this page'))
    expect(emailLink.attributes('href')).toContain(encodeURIComponent('https://example.com'))
  })

  it('does not render email link when no email prop', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: 'https://example.com' }
    })
    const links = wrapper.findAll('.rpl-social-share__link')
    const emailLink = links.find((l) => l.text() === 'Email')
    expect(emailLink).toBeUndefined()
  })

  it('filters out invalid network names', () => {
    const wrapper = mount(RplSocialShare, {
      props: {
        pageTitle: 'My Page',
        url: 'https://example.com',
        networks: ['Facebook', 'MySpace', 'X']
      }
    })
    const links = wrapper.findAll('.rpl-social-share__link')
    expect(links).toHaveLength(2)
    expect(links[0].text()).toBe('Facebook')
    expect(links[1].text()).toBe('X (formerly Twitter)')
  })

  it('emits share event with network name on click', async () => {
    vi.stubGlobal('open', vi.fn())
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: 'https://example.com' }
    })
    const facebookLink = wrapper.findAll('.rpl-social-share__link')[0]
    await facebookLink.trigger('click')
    expect(wrapper.emitted('share')).toBeTruthy()
    expect(wrapper.emitted('share')![0]).toEqual(['Facebook'])
    vi.unstubAllGlobals()
  })

  it('has root class rpl-social-share', () => {
    const wrapper = mount(RplSocialShare, {
      props: { pageTitle: 'My Page', url: 'https://example.com' }
    })
    expect(wrapper.find('.rpl-social-share').exists()).toBe(true)
  })

  it('each link has correct aria-label', () => {
    const wrapper = mount(RplSocialShare, {
      props: {
        pageTitle: 'My Page',
        url: 'https://example.com',
        email: { subject: 'Hi', body: 'Check this' }
      }
    })
    const links = wrapper.findAll('.rpl-social-share__link')
    expect(links[0].attributes('aria-label')).toBe('Share this page on Facebook')
    expect(links[1].attributes('aria-label')).toBe('Share this page on LinkedIn')
    expect(links[2].attributes('aria-label')).toBe('Share this page on X (formerly Twitter)')
    expect(links[3].attributes('aria-label')).toBe('Share this page via email')
  })
})
