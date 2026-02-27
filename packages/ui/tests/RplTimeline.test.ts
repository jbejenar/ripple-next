import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplTimeline from '../components/organisms/content/RplTimeline.vue'

const items = [
  { title: 'Step 1', body: '<p>First step</p>', date: 'January 2026' },
  { title: 'Step 2', subtitle: 'In progress', body: '<p>Second step</p>' }
]

describe('RplTimeline', () => {
  it('renders all timeline items', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    expect(wrapper.findAll('.rpl-timeline__item')).toHaveLength(2)
  })

  it('renders optional title', () => {
    const wrapper = mount(RplTimeline, {
      props: { title: 'Project Timeline', items }
    })
    expect(wrapper.find('.rpl-timeline__title').text()).toBe('Project Timeline')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    expect(wrapper.find('.rpl-timeline__title').exists()).toBe(false)
  })

  it('renders item titles', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    const titles = wrapper.findAll('.rpl-timeline__item-title')
    expect(titles[0]!.text()).toBe('Step 1')
    expect(titles[1]!.text()).toBe('Step 2')
  })

  it('renders date when provided', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    expect(wrapper.find('.rpl-timeline__date').text()).toBe('January 2026')
  })

  it('hides date when not provided', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    const secondItem = wrapper.findAll('.rpl-timeline__item')[1]!
    expect(secondItem.find('.rpl-timeline__date').exists()).toBe(false)
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    const secondItem = wrapper.findAll('.rpl-timeline__item')[1]!
    expect(secondItem.find('.rpl-timeline__subtitle').text()).toBe('In progress')
  })

  it('hides subtitle when not provided', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    const firstItem = wrapper.findAll('.rpl-timeline__item')[0]!
    expect(firstItem.find('.rpl-timeline__subtitle').exists()).toBe(false)
  })

  it('renders body HTML', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    expect(wrapper.find('.rpl-timeline__body').html()).toContain('<p>First step</p>')
  })

  it('renders timeline markers', () => {
    const wrapper = mount(RplTimeline, {
      props: { items }
    })
    expect(wrapper.findAll('.rpl-timeline__marker')).toHaveLength(2)
  })
})
