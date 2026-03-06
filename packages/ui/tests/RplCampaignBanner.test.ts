import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplCampaignBanner from '../components/molecules/RplCampaignBanner.vue'

describe('RplCampaignBanner', () => {
  it('renders default slot content', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { default: 'Banner body text' }
    })
    expect(wrapper.find('.rpl-campaign-banner__content').text()).toBe('Banner body text')
  })

  it('renders title slot', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { title: 'Campaign Title' }
    })
    expect(wrapper.find('.rpl-campaign-banner__title').text()).toBe('Campaign Title')
  })

  it('renders media slot', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { media: '<img src="/hero.jpg" alt="Hero" />' }
    })
    expect(wrapper.find('.rpl-campaign-banner__media').exists()).toBe(true)
    expect(wrapper.find('.rpl-campaign-banner__media img').exists()).toBe(true)
  })

  it('renders action slot', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { action: '<button>Learn more</button>' }
    })
    expect(wrapper.find('.rpl-campaign-banner__action').exists()).toBe(true)
    expect(wrapper.find('.rpl-campaign-banner__action button').text()).toBe('Learn more')
  })

  it('renders meta slot', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { meta: 'Published 1 Jan 2026' }
    })
    expect(wrapper.find('.rpl-campaign-banner__meta').text()).toBe('Published 1 Jan 2026')
  })

  it('applies primary variant class by default', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-campaign-banner--primary')
  })

  it('applies secondary variant class', () => {
    const wrapper = mount(RplCampaignBanner, {
      props: { type: 'secondary' },
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-campaign-banner--secondary')
  })

  it('does not render media container when no media slot', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { default: 'Body' }
    })
    expect(wrapper.find('.rpl-campaign-banner__media').exists()).toBe(false)
  })

  it('does not render meta container when no meta slot', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { default: 'Body' }
    })
    expect(wrapper.find('.rpl-campaign-banner__meta').exists()).toBe(false)
  })

  it('has root class rpl-campaign-banner', () => {
    const wrapper = mount(RplCampaignBanner, {
      slots: { default: 'Body' }
    })
    expect(wrapper.classes()).toContain('rpl-campaign-banner')
  })
})
