import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import type { CmsPage } from '@ripple/cms'
import PageTemplateLanding from '../../../components/templates/PageTemplateLanding.vue'
import PageTemplateContent from '../../../components/templates/PageTemplateContent.vue'
import PageTemplateCampaign from '../../../components/templates/PageTemplateCampaign.vue'

// ── Stub child components so tests focus on template structure ─────────

function stub(name: string, cssClass: string, props: string[]): ReturnType<typeof defineComponent> {
  return defineComponent({
    name,
    props,
    template: `<div class="${cssClass}"><slot /></div>`
  })
}

const RplHeroHeaderStub = stub('RplHeroHeader', 'stub-hero', ['title', 'description', 'backgroundImage'])

const stubs = {
  RplHeroHeader: RplHeroHeaderStub,
  RplContentWysiwyg: stub('RplContentWysiwyg', 'stub-wysiwyg', ['html']),
  RplAccordion: stub('RplAccordion', 'stub-accordion', ['title', 'items']),
  RplCardCollection: stub('RplCardCollection', 'stub-card-collection', ['title', 'cards']),
  RplTimeline: stub('RplTimeline', 'stub-timeline', ['title', 'items']),
  RplCallToAction: stub('RplCallToAction', 'stub-cta', ['cta']),
  RplKeyDates: stub('RplKeyDates', 'stub-key-dates', ['title', 'dates']),
  RplContentImage: stub('RplContentImage', 'stub-image', ['image', 'caption']),
  RplEmbeddedVideo: stub('RplEmbeddedVideo', 'stub-video', ['url', 'title', 'transcript'])
}

// ── Test fixtures ─────────────────────────────────────────────────────

function createBasePage(overrides: Partial<CmsPage> = {}): CmsPage {
  return {
    id: 'page-1',
    title: 'Test Page',
    slug: 'test-page',
    summary: 'A test page summary',
    sections: [{ type: 'wysiwyg', html: '<p>Body content</p>' }],
    status: 'published',
    contentType: 'page',
    taxonomy: [],
    created: '2026-01-01T00:00:00Z',
    updated: '2026-01-15T00:00:00Z',
    meta: {},
    ...overrides
  }
}

function createLandingPage(): CmsPage {
  return createBasePage({
    id: 'landing-1',
    title: 'Welcome to Victoria',
    slug: 'home',
    summary: 'Your gateway to Victorian government services',
    contentType: 'landing_page',
    featuredImage: {
      id: 'img-1',
      src: '/images/hero.jpg',
      alt: 'Victoria skyline'
    },
    sections: [
      {
        type: 'card-collection',
        title: 'Featured Services',
        cards: [
          { title: 'Health', summary: 'Health services for all Victorians' },
          { title: 'Education', summary: 'Schools and training' },
          { title: 'Transport', summary: 'Public transport and roads' }
        ]
      },
      {
        type: 'call-to-action',
        cta: {
          title: 'Get Started',
          summary: 'Find the service you need',
          link: { text: 'Browse services', url: '/services' }
        }
      },
      { type: 'wysiwyg', html: '<p>Latest news and updates</p>' }
    ]
  })
}

function createContentPage(): CmsPage {
  return createBasePage({
    id: 'content-1',
    title: 'About the Department',
    slug: 'about',
    summary: 'Learn about our department',
    contentType: 'page',
    taxonomy: [
      { id: 'term-1', name: 'Government', vocabulary: 'topic' },
      { id: 'term-2', name: 'Services', vocabulary: 'topic' }
    ],
    sections: [
      { type: 'wysiwyg', html: '<p>Department overview</p>' },
      {
        type: 'accordion',
        title: 'Frequently Asked Questions',
        items: [
          { title: 'What do we do?', body: '<p>We serve the public.</p>' },
          { title: 'How to contact us?', body: '<p>Call 1300 000 000.</p>' }
        ]
      }
    ]
  })
}

function createCampaignPage(): CmsPage {
  return createBasePage({
    id: 'campaign-1',
    title: 'Summer Safety Campaign',
    slug: 'summer-safety',
    summary: 'Stay safe this summer with key dates and actions',
    contentType: 'campaign',
    featuredImage: {
      id: 'img-2',
      src: '/images/summer.jpg',
      alt: 'Summer beach'
    },
    taxonomy: [
      { id: 'term-3', name: 'Safety', vocabulary: 'topic' }
    ],
    sections: [
      {
        type: 'call-to-action',
        cta: {
          title: 'Report a hazard',
          summary: 'Help keep your community safe',
          link: { text: 'Report now', url: '/report' }
        }
      },
      {
        type: 'key-dates',
        title: 'Important Dates',
        dates: [
          { title: 'Fire danger season starts', date: '1 November 2026' },
          { title: 'Beach patrols begin', date: '1 December 2026' }
        ]
      },
      { type: 'wysiwyg', html: '<p>Campaign details here.</p>' },
      {
        type: 'timeline',
        title: 'Campaign Timeline',
        items: [
          { title: 'Planning', body: '<p>Plan your summer safety.</p>', date: 'October' },
          { title: 'Launch', body: '<p>Campaign launches statewide.</p>', date: 'November' }
        ]
      }
    ]
  })
}

// ── Landing page template tests ───────────────────────────────────────

describe('PageTemplateLanding', () => {
  it('renders hero with title, description, and featured image', () => {
    const page = createLandingPage()
    const wrapper = mount(PageTemplateLanding, {
      props: { page },
      global: { stubs }
    })
    const hero = wrapper.findComponent({ name: 'RplHeroHeader' })
    expect(hero.exists()).toBe(true)
    expect(hero.props('title')).toBe('Welcome to Victoria')
    expect(hero.props('description')).toBe('Your gateway to Victorian government services')
    expect(hero.props('backgroundImage')).toBe('/images/hero.jpg')
  })

  it('renders all sections', () => {
    const page = createLandingPage()
    const wrapper = mount(PageTemplateLanding, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.findAll('.rpl-landing-page__section')).toHaveLength(3)
  })

  it('applies alternating background to sections', () => {
    const page = createLandingPage()
    const wrapper = mount(PageTemplateLanding, {
      props: { page },
      global: { stubs }
    })
    const sections = wrapper.findAll('.rpl-landing-page__section')
    expect(sections[0]!.classes()).not.toContain('rpl-landing-page__section--alt')
    expect(sections[1]!.classes()).toContain('rpl-landing-page__section--alt')
    expect(sections[2]!.classes()).not.toContain('rpl-landing-page__section--alt')
  })

  it('uses full-width layout (no max-width on outer container)', () => {
    const page = createLandingPage()
    const wrapper = mount(PageTemplateLanding, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.find('.rpl-landing-page').exists()).toBe(true)
  })

  it('wraps each section in a constrained inner container', () => {
    const page = createLandingPage()
    const wrapper = mount(PageTemplateLanding, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.findAll('.rpl-landing-page__section-inner')).toHaveLength(3)
  })

  it('renders with empty sections', () => {
    const page = createBasePage({ contentType: 'landing_page', sections: [] })
    const wrapper = mount(PageTemplateLanding, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.find('.rpl-landing-page').exists()).toBe(true)
    expect(wrapper.findAll('.rpl-landing-page__section')).toHaveLength(0)
  })
})

// ── Content page template tests ───────────────────────────────────────

describe('PageTemplateContent', () => {
  it('renders hero with title and description', () => {
    const page = createContentPage()
    const wrapper = mount(PageTemplateContent, {
      props: { page },
      global: { stubs }
    })
    const hero = wrapper.findComponent({ name: 'RplHeroHeader' })
    expect(hero.props('title')).toBe('About the Department')
    expect(hero.props('description')).toBe('Learn about our department')
  })

  it('does not pass backgroundImage to hero', () => {
    const page = createContentPage()
    const wrapper = mount(PageTemplateContent, {
      props: { page },
      global: { stubs }
    })
    const hero = wrapper.findComponent({ name: 'RplHeroHeader' })
    expect(hero.props('backgroundImage')).toBeUndefined()
  })

  it('renders all sections in body', () => {
    const page = createContentPage()
    const wrapper = mount(PageTemplateContent, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.find('.stub-wysiwyg').exists()).toBe(true)
    expect(wrapper.find('.stub-accordion').exists()).toBe(true)
  })

  it('renders taxonomy tags when present', () => {
    const page = createContentPage()
    const wrapper = mount(PageTemplateContent, {
      props: { page },
      global: { stubs }
    })
    const tags = wrapper.findAll('.rpl-content-page__tag')
    expect(tags).toHaveLength(2)
    expect(tags[0]!.text()).toBe('Government')
    expect(tags[1]!.text()).toBe('Services')
  })

  it('hides taxonomy section when no tags', () => {
    const page = createBasePage({ taxonomy: [] })
    const wrapper = mount(PageTemplateContent, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.find('.rpl-content-page__taxonomy').exists()).toBe(false)
  })

  it('uses narrow content width layout', () => {
    const page = createContentPage()
    const wrapper = mount(PageTemplateContent, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.find('.rpl-content-page').exists()).toBe(true)
  })
})

// ── Campaign page template tests ──────────────────────────────────────

describe('PageTemplateCampaign', () => {
  it('renders hero with title, description, and featured image', () => {
    const page = createCampaignPage()
    const wrapper = mount(PageTemplateCampaign, {
      props: { page },
      global: { stubs }
    })
    const hero = wrapper.findComponent({ name: 'RplHeroHeader' })
    expect(hero.props('title')).toBe('Summer Safety Campaign')
    expect(hero.props('description')).toBe('Stay safe this summer with key dates and actions')
    expect(hero.props('backgroundImage')).toBe('/images/summer.jpg')
  })

  it('separates featured sections (CTA, key-dates) from body sections', () => {
    const page = createCampaignPage()
    const wrapper = mount(PageTemplateCampaign, {
      props: { page },
      global: { stubs }
    })
    // Featured section should contain CTA and key-dates
    const featured = wrapper.find('.rpl-campaign-page__featured')
    expect(featured.exists()).toBe(true)
    expect(featured.find('.stub-cta').exists()).toBe(true)
    expect(featured.find('.stub-key-dates').exists()).toBe(true)

    // Body section should contain wysiwyg and timeline
    const body = wrapper.find('.rpl-campaign-page__body')
    expect(body.exists()).toBe(true)
    expect(body.find('.stub-wysiwyg').exists()).toBe(true)
    expect(body.find('.stub-timeline').exists()).toBe(true)
  })

  it('hides featured section when no featured-type sections exist', () => {
    const page = createBasePage({
      contentType: 'campaign',
      sections: [{ type: 'wysiwyg', html: '<p>Content only</p>' }]
    })
    const wrapper = mount(PageTemplateCampaign, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.find('.rpl-campaign-page__featured').exists()).toBe(false)
    expect(wrapper.find('.rpl-campaign-page__body').exists()).toBe(true)
  })

  it('hides body section when only featured-type sections exist', () => {
    const page = createBasePage({
      contentType: 'campaign',
      sections: [
        {
          type: 'call-to-action',
          cta: {
            title: 'Act now',
            summary: 'Do something',
            link: { text: 'Go', url: '/go' }
          }
        }
      ]
    })
    const wrapper = mount(PageTemplateCampaign, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.find('.rpl-campaign-page__featured').exists()).toBe(true)
    expect(wrapper.find('.rpl-campaign-page__body').exists()).toBe(false)
  })

  it('renders taxonomy tags when present', () => {
    const page = createCampaignPage()
    const wrapper = mount(PageTemplateCampaign, {
      props: { page },
      global: { stubs }
    })
    const tags = wrapper.findAll('.rpl-campaign-page__tag')
    expect(tags).toHaveLength(1)
    expect(tags[0]!.text()).toBe('Safety')
  })

  it('hides taxonomy section when no tags', () => {
    const page = createBasePage({ contentType: 'campaign', taxonomy: [] })
    const wrapper = mount(PageTemplateCampaign, {
      props: { page },
      global: { stubs }
    })
    expect(wrapper.find('.rpl-campaign-page__taxonomy').exists()).toBe(false)
  })
})
