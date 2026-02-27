import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplCardCollection from '../components/organisms/content/RplCardCollection.vue'
import RplCard from '../components/molecules/RplCard.vue'

const cards = [
  { title: 'Card 1', summary: 'Summary 1' },
  { title: 'Card 2', summary: 'Summary 2', link: { text: 'Read', url: '/page-2' } },
  { title: 'Card 3', summary: 'Summary 3', image: { src: '/img.jpg', alt: 'Photo' } }
]

describe('RplCardCollection', () => {
  it('renders all cards', () => {
    const wrapper = mount(RplCardCollection, {
      props: { cards },
      global: { components: { RplCard } }
    })
    expect(wrapper.findAllComponents(RplCard)).toHaveLength(3)
  })

  it('renders optional title', () => {
    const wrapper = mount(RplCardCollection, {
      props: { title: 'Featured', cards },
      global: { components: { RplCard } }
    })
    expect(wrapper.find('.rpl-card-collection__title').text()).toBe('Featured')
  })

  it('hides title when not provided', () => {
    const wrapper = mount(RplCardCollection, {
      props: { cards },
      global: { components: { RplCard } }
    })
    expect(wrapper.find('.rpl-card-collection__title').exists()).toBe(false)
  })

  it('uses grid layout', () => {
    const wrapper = mount(RplCardCollection, {
      props: { cards },
      global: { components: { RplCard } }
    })
    expect(wrapper.find('.rpl-card-collection__grid').exists()).toBe(true)
  })

  it('passes card props correctly', () => {
    const wrapper = mount(RplCardCollection, {
      props: { cards },
      global: { components: { RplCard } }
    })
    const firstCard = wrapper.findAllComponents(RplCard)[0]!
    expect(firstCard.props('title')).toBe('Card 1')
    expect(firstCard.props('description')).toBe('Summary 1')
  })
})
