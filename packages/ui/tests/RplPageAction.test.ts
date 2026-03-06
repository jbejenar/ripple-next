import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RplPageAction from '../components/molecules/RplPageAction.vue'

describe('RplPageAction', () => {
  it('renders default slot content', () => {
    const wrapper = mount(RplPageAction, {
      slots: { default: '<button>Print</button>' }
    })
    expect(wrapper.find('button').text()).toBe('Print')
  })

  it('renders upper slot content', () => {
    const wrapper = mount(RplPageAction, {
      slots: {
        upper: '<button>Share</button>',
        default: '<button>Print</button>'
      }
    })
    expect(wrapper.find('.rpl-page-action__upper button').text()).toBe('Share')
  })

  it('does not render upper container when no upper slot', () => {
    const wrapper = mount(RplPageAction, {
      slots: { default: '<button>Print</button>' }
    })
    expect(wrapper.find('.rpl-page-action__upper').exists()).toBe(false)
  })

  it('has root class rpl-page-action', () => {
    const wrapper = mount(RplPageAction, {
      slots: { default: '<button>Action</button>' }
    })
    expect(wrapper.classes()).toContain('rpl-page-action')
  })

  it('has role="complementary"', () => {
    const wrapper = mount(RplPageAction, {
      slots: { default: '<button>Action</button>' }
    })
    expect(wrapper.attributes('role')).toBe('complementary')
  })

  it('has default aria-label', () => {
    const wrapper = mount(RplPageAction, {
      slots: { default: '<button>Action</button>' }
    })
    expect(wrapper.attributes('aria-label')).toBe('Page actions')
  })

  it('renders custom aria-label', () => {
    const wrapper = mount(RplPageAction, {
      props: { ariaLabel: 'Document actions' },
      slots: { default: '<button>Action</button>' }
    })
    expect(wrapper.attributes('aria-label')).toBe('Document actions')
  })
})
