import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplContentWysiwyg from '../components/organisms/content/RplContentWysiwyg.vue'

describe('RplContentWysiwyg', () => {
  it('renders HTML content', () => {
    const wrapper = mount(RplContentWysiwyg, {
      props: { html: '<p>Hello world</p>' }
    })
    expect(wrapper.find('.rpl-content-wysiwyg').html()).toContain('<p>Hello world</p>')
  })

  it('renders headings', () => {
    const wrapper = mount(RplContentWysiwyg, {
      props: { html: '<h2>Section Title</h2><p>Body text</p>' }
    })
    expect(wrapper.find('h2').text()).toBe('Section Title')
  })

  it('renders links', () => {
    const wrapper = mount(RplContentWysiwyg, {
      props: { html: '<a href="/page">Click here</a>' }
    })
    expect(wrapper.find('a').attributes('href')).toBe('/page')
  })

  it('renders lists', () => {
    const wrapper = mount(RplContentWysiwyg, {
      props: { html: '<ul><li>Item 1</li><li>Item 2</li></ul>' }
    })
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('applies wysiwyg wrapper class', () => {
    const wrapper = mount(RplContentWysiwyg, {
      props: { html: '<p>Content</p>' }
    })
    expect(wrapper.find('.rpl-content-wysiwyg').exists()).toBe(true)
  })
})
