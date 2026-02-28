import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplPagination from '../components/molecules/RplPagination.vue'

describe('RplPagination', () => {
  it('renders a nav element with default aria-label', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 1, totalPages: 5 }
    })
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.attributes('aria-label')).toBe('Pagination')
  })

  it('uses custom aria-label', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 1, totalPages: 5, ariaLabel: 'Results pages' }
    })
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Results pages')
  })

  it('renders all pages when total is within visible limit', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 1, totalPages: 5 }
    })
    const pageButtons = wrapper.findAll('.rpl-pagination__button--page')
    expect(pageButtons).toHaveLength(5)
  })

  it('marks current page with aria-current', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 3, totalPages: 5 }
    })
    const activeButton = wrapper.find('.rpl-pagination__button--active')
    expect(activeButton.exists()).toBe(true)
    expect(activeButton.attributes('aria-current')).toBe('page')
    expect(activeButton.text()).toBe('3')
  })

  it('disables previous button on first page', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 1, totalPages: 5 }
    })
    const prevButton = wrapper.find('.rpl-pagination__button--prev')
    expect(prevButton.attributes('disabled')).toBeDefined()
  })

  it('disables next button on last page', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 5, totalPages: 5 }
    })
    const nextButton = wrapper.find('.rpl-pagination__button--next')
    expect(nextButton.attributes('disabled')).toBeDefined()
  })

  it('enables both buttons on middle pages', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 3, totalPages: 5 }
    })
    const prevButton = wrapper.find('.rpl-pagination__button--prev')
    const nextButton = wrapper.find('.rpl-pagination__button--next')
    expect(prevButton.attributes('disabled')).toBeUndefined()
    expect(nextButton.attributes('disabled')).toBeUndefined()
  })

  it('emits update:currentPage when clicking a page button', async () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 1, totalPages: 5 }
    })
    const pageButtons = wrapper.findAll('.rpl-pagination__button--page')
    await pageButtons[2].trigger('click')
    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    expect(wrapper.emitted('update:currentPage')![0]).toEqual([3])
  })

  it('emits update:currentPage when clicking previous', async () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 3, totalPages: 5 }
    })
    const prevButton = wrapper.find('.rpl-pagination__button--prev')
    await prevButton.trigger('click')
    expect(wrapper.emitted('update:currentPage')![0]).toEqual([2])
  })

  it('emits update:currentPage when clicking next', async () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 3, totalPages: 5 }
    })
    const nextButton = wrapper.find('.rpl-pagination__button--next')
    await nextButton.trigger('click')
    expect(wrapper.emitted('update:currentPage')![0]).toEqual([4])
  })

  it('does not emit when clicking the current page', async () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 2, totalPages: 5 }
    })
    const activeButton = wrapper.find('.rpl-pagination__button--active')
    await activeButton.trigger('click')
    expect(wrapper.emitted('update:currentPage')).toBeFalsy()
  })

  it('shows ellipsis for many pages', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 5, totalPages: 20 }
    })
    const ellipses = wrapper.findAll('.rpl-pagination__ellipsis')
    expect(ellipses.length).toBeGreaterThan(0)
    ellipses.forEach((el) => {
      expect(el.attributes('aria-hidden')).toBe('true')
    })
  })

  it('renders correctly with single page', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 1, totalPages: 1 }
    })
    const pageButtons = wrapper.findAll('.rpl-pagination__button--page')
    expect(pageButtons).toHaveLength(1)
    expect(wrapper.find('.rpl-pagination__button--prev').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.rpl-pagination__button--next').attributes('disabled')).toBeDefined()
  })

  it('has accessible labels on prev/next buttons', () => {
    const wrapper = mount(RplPagination, {
      props: { currentPage: 3, totalPages: 5 }
    })
    const prevButton = wrapper.find('.rpl-pagination__button--prev')
    const nextButton = wrapper.find('.rpl-pagination__button--next')
    expect(prevButton.attributes('aria-label')).toContain('previous')
    expect(nextButton.attributes('aria-label')).toContain('next')
  })
})
