import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplTabs from '../components/molecules/RplTabs.vue'

describe('RplTabs', () => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'how-to-apply', label: 'How to apply' }
  ]

  it('renders all tab buttons', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const tabButtons = wrapper.findAll('[role="tab"]')
    expect(tabButtons).toHaveLength(3)
  })

  it('renders tab labels', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const tabButtons = wrapper.findAll('[role="tab"]')
    expect(tabButtons[0].text()).toBe('Overview')
    expect(tabButtons[1].text()).toBe('Eligibility')
    expect(tabButtons[2].text()).toBe('How to apply')
  })

  it('renders a tablist container', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
  })

  it('renders tabpanel elements', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(3)
  })

  it('activates the first tab by default', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const firstTab = wrapper.findAll('[role="tab"]')[0]
    expect(firstTab.attributes('aria-selected')).toBe('true')
  })

  it('activates the specified modelValue tab', () => {
    const wrapper = mount(RplTabs, {
      props: { tabs, modelValue: 'eligibility' }
    })
    const tabButtons = wrapper.findAll('[role="tab"]')
    expect(tabButtons[1].attributes('aria-selected')).toBe('true')
    expect(tabButtons[0].attributes('aria-selected')).toBe('false')
  })

  it('emits update:modelValue when a tab is clicked', async () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['eligibility'])
  })

  it('sets correct aria-controls on tab buttons', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const tabButtons = wrapper.findAll('[role="tab"]')
    expect(tabButtons[0].attributes('aria-controls')).toBe('rpl-tabpanel-overview')
    expect(tabButtons[1].attributes('aria-controls')).toBe('rpl-tabpanel-eligibility')
  })

  it('sets correct aria-labelledby on tab panels', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels[0].attributes('aria-labelledby')).toBe('rpl-tab-overview')
    expect(panels[1].attributes('aria-labelledby')).toBe('rpl-tab-eligibility')
  })

  it('hides non-active panels', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels[0].attributes('hidden')).toBeUndefined()
    expect(panels[1].attributes('hidden')).toBeDefined()
    expect(panels[2].attributes('hidden')).toBeDefined()
  })

  it('sets tabindex 0 on active tab and -1 on others', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const tabButtons = wrapper.findAll('[role="tab"]')
    expect(tabButtons[0].attributes('tabindex')).toBe('0')
    expect(tabButtons[1].attributes('tabindex')).toBe('-1')
    expect(tabButtons[2].attributes('tabindex')).toBe('-1')
  })

  it('applies active class to selected tab', () => {
    const wrapper = mount(RplTabs, { props: { tabs } })
    const tabButtons = wrapper.findAll('[role="tab"]')
    expect(tabButtons[0].classes()).toContain('rpl-tabs__tab--active')
    expect(tabButtons[1].classes()).not.toContain('rpl-tabs__tab--active')
  })

  it('renders slot content for active tab', () => {
    const wrapper = mount(RplTabs, {
      props: { tabs },
      slots: {
        overview: '<p>Overview content</p>'
      }
    })
    expect(wrapper.text()).toContain('Overview content')
  })
})
