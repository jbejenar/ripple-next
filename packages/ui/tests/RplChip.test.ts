import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplChip from '../components/atoms/RplChip.vue'

describe('RplChip', () => {
  it('renders the label text', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter' }
    })
    expect(wrapper.text()).toContain('Filter')
  })

  it('emits click event when label is clicked', async () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter' }
    })
    await wrapper.find('.rpl-chip__label').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('renders dismiss button when dismissible', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter', dismissible: true }
    })
    expect(wrapper.find('.rpl-chip__dismiss').exists()).toBe(true)
  })

  it('does not render dismiss button by default', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter' }
    })
    expect(wrapper.find('.rpl-chip__dismiss').exists()).toBe(false)
  })

  it('emits dismiss event when dismiss button is clicked', async () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter', dismissible: true }
    })
    await wrapper.find('.rpl-chip__dismiss').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('applies active class when active', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter', active: true }
    })
    expect(wrapper.classes()).toContain('rpl-chip--active')
  })

  it('does not apply active class by default', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter' }
    })
    expect(wrapper.classes()).not.toContain('rpl-chip--active')
  })

  it('sets aria-pressed on label button when active', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter', active: true }
    })
    expect(wrapper.find('.rpl-chip__label').attributes('aria-pressed')).toBe('true')
  })

  it('applies disabled class when disabled', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter', disabled: true }
    })
    expect(wrapper.classes()).toContain('rpl-chip--disabled')
  })

  it('disables buttons when disabled', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Filter', disabled: true, dismissible: true }
    })
    expect(wrapper.find('.rpl-chip__label').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.rpl-chip__dismiss').attributes('disabled')).toBeDefined()
  })

  it('has accessible dismiss button label', () => {
    const wrapper = mount(RplChip, {
      props: { label: 'Health', dismissible: true }
    })
    expect(wrapper.find('.rpl-chip__dismiss').attributes('aria-label')).toBe('Remove Health')
  })
})
