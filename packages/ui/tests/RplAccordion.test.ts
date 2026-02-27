import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplAccordion from '../components/organisms/content/RplAccordion.vue'

const items = [
  { title: 'Section 1', body: '<p>Content 1</p>' },
  { title: 'Section 2', body: '<p>Content 2</p>' }
]

describe('RplAccordion', () => {
  it('renders all items', () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    expect(wrapper.findAll('.rpl-accordion__item')).toHaveLength(2)
  })

  it('renders optional title', () => {
    const wrapper = mount(RplAccordion, {
      props: { title: 'FAQ', items }
    })
    expect(wrapper.find('.rpl-accordion__title').text()).toBe('FAQ')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    expect(wrapper.find('.rpl-accordion__title').exists()).toBe(false)
  })

  it('starts with all items collapsed', () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    const panels = wrapper.findAll('.rpl-accordion__content')
    for (const panel of panels) {
      expect(panel.attributes('style')).toContain('display: none')
    }
  })

  it('expands item on click', async () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    const buttons = wrapper.findAll('.rpl-accordion__header')
    await buttons[0]!.trigger('click')
    const panels = wrapper.findAll('.rpl-accordion__content')
    expect(panels[0]!.attributes('style') ?? '').not.toContain('display: none')
    expect(panels[1]!.attributes('style')).toContain('display: none')
  })

  it('collapses item on second click', async () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    const button = wrapper.findAll('.rpl-accordion__header')[0]!
    await button.trigger('click')
    await button.trigger('click')
    expect(wrapper.findAll('.rpl-accordion__content')[0]!.attributes('style')).toContain('display: none')
  })

  it('sets aria-expanded correctly', async () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    const button = wrapper.findAll('.rpl-accordion__header')[0]!
    expect(button.attributes('aria-expanded')).toBe('false')
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
  })

  it('sets aria-controls linking to panel', () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    const button = wrapper.findAll('.rpl-accordion__header')[0]!
    expect(button.attributes('aria-controls')).toBe('rpl-accordion-panel-0')
  })

  it('renders body HTML content', async () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    await wrapper.findAll('.rpl-accordion__header')[0]!.trigger('click')
    expect(wrapper.findAll('.rpl-accordion__content')[0]!.html()).toContain('<p>Content 1</p>')
  })

  it('renders item titles in buttons', () => {
    const wrapper = mount(RplAccordion, {
      props: { items }
    })
    const buttons = wrapper.findAll('.rpl-accordion__header-text')
    expect(buttons[0]!.text()).toBe('Section 1')
    expect(buttons[1]!.text()).toBe('Section 2')
  })
})
