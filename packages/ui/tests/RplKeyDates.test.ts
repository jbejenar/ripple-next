import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplKeyDates from '../components/organisms/content/RplKeyDates.vue'

const dates = [
  { title: 'Applications open', date: '1 March 2026', description: 'Submit your form online.' },
  { title: 'Applications close', date: '31 March 2026' }
]

describe('RplKeyDates', () => {
  it('renders all date items', () => {
    const wrapper = mount(RplKeyDates, {
      props: { dates }
    })
    expect(wrapper.findAll('.rpl-key-dates__item')).toHaveLength(2)
  })

  it('renders optional title', () => {
    const wrapper = mount(RplKeyDates, {
      props: { title: 'Important Dates', dates }
    })
    expect(wrapper.find('.rpl-key-dates__title').text()).toBe('Important Dates')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplKeyDates, {
      props: { dates }
    })
    expect(wrapper.find('.rpl-key-dates__title').exists()).toBe(false)
  })

  it('renders date text', () => {
    const wrapper = mount(RplKeyDates, {
      props: { dates }
    })
    expect(wrapper.find('.rpl-key-dates__date').text()).toBe('1 March 2026')
  })

  it('renders item title', () => {
    const wrapper = mount(RplKeyDates, {
      props: { dates }
    })
    expect(wrapper.find('.rpl-key-dates__item-title').text()).toBe('Applications open')
  })

  it('renders description when provided', () => {
    const wrapper = mount(RplKeyDates, {
      props: { dates }
    })
    expect(wrapper.find('.rpl-key-dates__description').text()).toBe('Submit your form online.')
  })

  it('hides description when not provided', () => {
    const wrapper = mount(RplKeyDates, {
      props: { dates }
    })
    const items = wrapper.findAll('.rpl-key-dates__item')
    expect(items[1]!.find('.rpl-key-dates__description').exists()).toBe(false)
  })
})
