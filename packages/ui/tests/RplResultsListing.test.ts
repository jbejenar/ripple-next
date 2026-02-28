import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplResultsListing from '../components/molecules/RplResultsListing.vue'

const results = [
  {
    title: 'Getting a drivers licence',
    href: '/transport/licence',
    description: 'How to apply for a Victorian drivers licence.',
    topic: 'Transport',
    metadata: [
      { label: 'Updated', value: '15 Feb 2026' },
      { label: 'Type', value: 'Guide' }
    ]
  },
  {
    title: 'School enrolment',
    href: '/education/enrolment',
    description: 'Enrolling your child in a Victorian school.',
    topic: 'Education'
  },
  {
    title: 'Health services directory',
    href: '/health/directory'
  }
]

describe('RplResultsListing', () => {
  it('renders all result items', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results }
    })
    const items = wrapper.findAll('.rpl-results-listing__item')
    expect(items).toHaveLength(3)
  })

  it('renders result titles as links', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results }
    })
    const links = wrapper.findAll('.rpl-results-listing__link')
    expect(links[0].text()).toBe('Getting a drivers licence')
    expect(links[0].attributes('href')).toBe('/transport/licence')
  })

  it('renders descriptions when provided', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results }
    })
    const descriptions = wrapper.findAll('.rpl-results-listing__description')
    expect(descriptions).toHaveLength(2)
    expect(descriptions[0].text()).toBe('How to apply for a Victorian drivers licence.')
  })

  it('renders topic labels when provided', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results }
    })
    const topics = wrapper.findAll('.rpl-results-listing__topic')
    expect(topics).toHaveLength(2)
    expect(topics[0].text()).toBe('Transport')
  })

  it('renders metadata as definition list', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results }
    })
    const metaItems = wrapper.findAll('.rpl-results-listing__meta-item')
    expect(metaItems).toHaveLength(2)
    expect(wrapper.find('.rpl-results-listing__meta-label').text()).toBe('Updated:')
    expect(wrapper.find('.rpl-results-listing__meta-value').text()).toBe('15 Feb 2026')
  })

  it('renders section title when provided', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results, title: 'Search results' }
    })
    expect(wrapper.find('.rpl-results-listing__title').text()).toBe('Search results')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results }
    })
    expect(wrapper.find('.rpl-results-listing__title').exists()).toBe(false)
  })

  it('renders total results count', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results, totalResults: 150 }
    })
    expect(wrapper.find('.rpl-results-listing__count').text()).toBe('150 results')
  })

  it('uses singular "result" for count of 1', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results: [results[0]], totalResults: 1 }
    })
    expect(wrapper.find('.rpl-results-listing__count').text()).toBe('1 result')
  })

  it('renders empty state when no results', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results: [] }
    })
    expect(wrapper.find('.rpl-results-listing__empty').exists()).toBe(true)
    expect(wrapper.find('.rpl-results-listing__empty-text').text()).toBe('No results found')
  })

  it('uses ordered list for results', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results }
    })
    expect(wrapper.find('ol.rpl-results-listing__list').exists()).toBe(true)
  })

  it('has accessible section label', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results, ariaLabel: 'Documents matching your query' }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Documents matching your query')
  })

  it('uses default aria-label', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Search results')
  })

  it('does not render metadata section when no metadata', () => {
    const wrapper = mount(RplResultsListing, {
      props: { results: [{ title: 'Test', href: '/test' }] }
    })
    expect(wrapper.find('.rpl-results-listing__metadata').exists()).toBe(false)
  })
})
