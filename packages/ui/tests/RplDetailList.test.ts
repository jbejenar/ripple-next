import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplDetailList from '../components/molecules/RplDetailList.vue'

const details = [
  { term: 'Name', description: 'Department of Premier and Cabinet' },
  { term: 'Phone', description: '1300 366 356' },
  { term: 'Email', description: 'info@dpc.vic.gov.au' }
]

describe('RplDetailList', () => {
  it('renders all detail items', () => {
    const wrapper = mount(RplDetailList, {
      props: { details }
    })
    const items = wrapper.findAll('.rpl-detail-list__item')
    expect(items).toHaveLength(3)
  })

  it('renders terms correctly', () => {
    const wrapper = mount(RplDetailList, {
      props: { details }
    })
    const terms = wrapper.findAll('.rpl-detail-list__term')
    expect(terms[0].text()).toBe('Name')
    expect(terms[1].text()).toBe('Phone')
    expect(terms[2].text()).toBe('Email')
  })

  it('renders descriptions correctly', () => {
    const wrapper = mount(RplDetailList, {
      props: { details }
    })
    const descriptions = wrapper.findAll('.rpl-detail-list__description')
    expect(descriptions[0].text()).toBe('Department of Premier and Cabinet')
    expect(descriptions[1].text()).toBe('1300 366 356')
  })

  it('uses a definition list element', () => {
    const wrapper = mount(RplDetailList, {
      props: { details }
    })
    expect(wrapper.find('dl').exists()).toBe(true)
    expect(wrapper.findAll('dt')).toHaveLength(3)
    expect(wrapper.findAll('dd')).toHaveLength(3)
  })

  it('renders title when provided', () => {
    const wrapper = mount(RplDetailList, {
      props: { details, title: 'Contact information' }
    })
    expect(wrapper.find('.rpl-detail-list__title').text()).toBe('Contact information')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplDetailList, {
      props: { details }
    })
    expect(wrapper.find('.rpl-detail-list__title').exists()).toBe(false)
  })

  it('applies stacked variant class by default', () => {
    const wrapper = mount(RplDetailList, {
      props: { details }
    })
    expect(wrapper.find('.rpl-detail-list__list').classes()).toContain('rpl-detail-list__list--stacked')
  })

  it('applies inline variant class', () => {
    const wrapper = mount(RplDetailList, {
      props: { details, variant: 'inline' }
    })
    expect(wrapper.find('.rpl-detail-list__list').classes()).toContain('rpl-detail-list__list--inline')
  })

  it('applies grid variant class', () => {
    const wrapper = mount(RplDetailList, {
      props: { details, variant: 'grid' }
    })
    expect(wrapper.find('.rpl-detail-list__list').classes()).toContain('rpl-detail-list__list--grid')
  })

  it('has accessible section label from title', () => {
    const wrapper = mount(RplDetailList, {
      props: { details, title: 'Contact' }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Contact')
  })

  it('uses default aria-label when no title', () => {
    const wrapper = mount(RplDetailList, {
      props: { details }
    })
    expect(wrapper.find('section').attributes('aria-label')).toBe('Details')
  })
})
