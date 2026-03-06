import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplVerticalNav from '../components/molecules/RplVerticalNav.vue'
import type { RplVerticalNavItem } from '../components/molecules/RplVerticalNav.vue'

const items: RplVerticalNavItem[] = [
  { id: 'home', text: 'Home', url: '/' },
  {
    id: 'services',
    text: 'Services',
    url: '/services',
    items: [
      { id: 'grants', text: 'Grants', url: '/services/grants', active: true },
      { id: 'permits', text: 'Permits', url: '/services/permits' }
    ]
  },
  { id: 'about', text: 'About', url: '/about' }
]

describe('RplVerticalNav', () => {
  it('renders title when provided', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items, title: 'Section menu' }
    })
    expect(wrapper.find('.rpl-vertical-nav__heading').text()).toBe('Section menu')
  })

  it('does not render title when not provided', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    expect(wrapper.find('.rpl-vertical-nav__heading').exists()).toBe(false)
  })

  it('renders top-level items as links', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    const links = wrapper.findAll('.rpl-vertical-nav__list--level-1 > .rpl-vertical-nav__item > .rpl-vertical-nav__item-header > .rpl-vertical-nav__link')
    expect(links).toHaveLength(3)
    expect(links[0]!.text()).toBe('Home')
    expect(links[1]!.text()).toBe('Services')
    expect(links[2]!.text()).toBe('About')
  })

  it('renders correct href for each item', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    const links = wrapper.findAll('.rpl-vertical-nav__list--level-1 > .rpl-vertical-nav__item > .rpl-vertical-nav__item-header > .rpl-vertical-nav__link')
    expect(links[0]!.attributes('href')).toBe('/')
    expect(links[1]!.attributes('href')).toBe('/services')
    expect(links[2]!.attributes('href')).toBe('/about')
  })

  it('applies active class to active item', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    const activeLinks = wrapper.findAll('.rpl-vertical-nav__link--active')
    expect(activeLinks).toHaveLength(1)
    expect(activeLinks[0]!.text()).toBe('Grants')
  })

  it('renders nested items', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    // Services is auto-expanded because its child is active
    const level2 = wrapper.find('.rpl-vertical-nav__list--level-2')
    expect(level2.exists()).toBe(true)
    const childLinks = level2.findAll('.rpl-vertical-nav__link')
    expect(childLinks).toHaveLength(2)
    expect(childLinks[0]!.text()).toBe('Grants')
    expect(childLinks[1]!.text()).toBe('Permits')
  })

  it('toggle button exists for items with children', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    const toggles = wrapper.findAll('.rpl-vertical-nav__toggle')
    expect(toggles).toHaveLength(1)
    expect(toggles[0]!.attributes('aria-label')).toBe('Toggle Services')
  })

  it('clicking toggle shows and hides children', async () => {
    const noActiveItems: RplVerticalNavItem[] = [
      {
        id: 'parent',
        text: 'Parent',
        url: '/parent',
        items: [
          { id: 'child', text: 'Child', url: '/parent/child' }
        ]
      }
    ]
    const wrapper = mount(RplVerticalNav, {
      props: { items: noActiveItems }
    })

    // Initially collapsed (no active child to auto-expand)
    expect(wrapper.find('.rpl-vertical-nav__list--level-2').exists()).toBe(false)

    // Click toggle to expand
    await wrapper.find('.rpl-vertical-nav__toggle').trigger('click')
    expect(wrapper.find('.rpl-vertical-nav__list--level-2').exists()).toBe(true)

    // Click toggle to collapse
    await wrapper.find('.rpl-vertical-nav__toggle').trigger('click')
    expect(wrapper.find('.rpl-vertical-nav__list--level-2').exists()).toBe(false)
  })

  it('has root class rpl-vertical-nav', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    expect(wrapper.find('.rpl-vertical-nav').exists()).toBe(true)
  })

  it('has nav element with aria-label', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('Secondary navigation')
  })

  it('emits navigate event when link is clicked', async () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    const link = wrapper.find('.rpl-vertical-nav__link')
    await link.trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')![0]![0]).toEqual(items[0])
  })

  it('emits toggle event when toggle button is clicked', async () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    const toggle = wrapper.find('.rpl-vertical-nav__toggle')
    await toggle.trigger('click')
    const emitted = wrapper.emitted('toggle')
    expect(emitted).toBeTruthy()
    expect(emitted![0]![0]).toEqual(items[1])
    // Services was auto-expanded (active child), so clicking collapses it
    expect(emitted![0]![1]).toBe(false)
  })

  it('auto-expands parent of active item', () => {
    const wrapper = mount(RplVerticalNav, {
      props: { items }
    })
    // Services should be expanded because Grants (child) is active
    const toggle = wrapper.find('.rpl-vertical-nav__toggle')
    expect(toggle.attributes('aria-expanded')).toBe('true')
  })

  it('renders 3 levels of nesting', () => {
    const deepItems: RplVerticalNavItem[] = [
      {
        id: 'l1',
        text: 'Level 1',
        url: '/l1',
        items: [
          {
            id: 'l2',
            text: 'Level 2',
            url: '/l1/l2',
            items: [
              {
                id: 'l3',
                text: 'Level 3',
                url: '/l1/l2/l3',
                active: true
              }
            ]
          }
        ]
      }
    ]
    const wrapper = mount(RplVerticalNav, {
      props: { items: deepItems, toggleLevels: 2 }
    })
    const allLinks = wrapper.findAll('.rpl-vertical-nav__link')
    expect(allLinks).toHaveLength(3)
    expect(allLinks[0]!.text()).toBe('Level 1')
    expect(allLinks[1]!.text()).toBe('Level 2')
    expect(allLinks[2]!.text()).toBe('Level 3')
  })
})
