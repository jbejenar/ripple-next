import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplSearchBar from '../components/molecules/RplSearchBar.vue'

describe('RplSearchBar', () => {
  it('renders a search input', () => {
    const wrapper = mount(RplSearchBar)
    const input = wrapper.find('input[type="search"]')
    expect(input.exists()).toBe(true)
  })

  it('renders a search button', () => {
    const wrapper = mount(RplSearchBar)
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Search')
  })

  it('uses custom button label', () => {
    const wrapper = mount(RplSearchBar, {
      props: { buttonLabel: 'Go' }
    })
    expect(wrapper.find('button').text()).toBe('Go')
  })

  it('applies placeholder text', () => {
    const wrapper = mount(RplSearchBar, {
      props: { placeholder: 'Find something' }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Find something')
  })

  it('has role="search" on container', () => {
    const wrapper = mount(RplSearchBar)
    expect(wrapper.find('[role="search"]').exists()).toBe(true)
  })

  it('has aria-label on container', () => {
    const wrapper = mount(RplSearchBar, {
      props: { ariaLabel: 'Site search' }
    })
    expect(wrapper.find('[role="search"]').attributes('aria-label')).toBe('Site search')
  })

  it('has aria-label on input', () => {
    const wrapper = mount(RplSearchBar, {
      props: { ariaLabel: 'Site search' }
    })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Site search')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(RplSearchBar)
    const input = wrapper.find('input')
    await input.setValue('test query')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test query'])
  })

  it('emits submit on button click', async () => {
    const wrapper = mount(RplSearchBar, {
      props: { modelValue: 'my query' }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('emits submit on Enter key', async () => {
    const wrapper = mount(RplSearchBar)
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('displays modelValue in input', () => {
    const wrapper = mount(RplSearchBar, {
      props: { modelValue: 'existing search' }
    })
    expect(wrapper.find('input').element.value).toBe('existing search')
  })
})
