import type { Meta, StoryObj } from '@storybook/vue3'
import RplBlockQuote from './RplBlockQuote.vue'

const meta: Meta<typeof RplBlockQuote> = {
  title: 'Atoms/RplBlockQuote',
  component: RplBlockQuote,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplBlockQuote>

export const WithAttribution: Story = {
  args: {
    author: 'The Hon. Premier of Victoria',
    authorTitle: 'Premier of Victoria'
  },
  render: (args) => ({
    components: { RplBlockQuote },
    setup() {
      return { args }
    },
    template: '<RplBlockQuote v-bind="args">Our government is committed to delivering better services for all Victorians through digital transformation and innovation.</RplBlockQuote>'
  })
}

export const AuthorOnly: Story = {
  args: {
    author: 'Department of Premier and Cabinet'
  },
  render: (args) => ({
    components: { RplBlockQuote },
    setup() {
      return { args }
    },
    template: '<RplBlockQuote v-bind="args">We are building a more connected, accessible, and efficient government for all Victorians.</RplBlockQuote>'
  })
}

export const WithoutAttribution: Story = {
  render: () => ({
    components: { RplBlockQuote },
    template: '<RplBlockQuote>Every Victorian deserves access to government services that are simple, clear, and easy to use.</RplBlockQuote>'
  })
}

export const LongQuote: Story = {
  args: {
    author: 'Minister for Government Services',
    authorTitle: 'Department of Government Services'
  },
  render: (args) => ({
    components: { RplBlockQuote },
    setup() {
      return { args }
    },
    template: `<RplBlockQuote v-bind="args">
      The Victorian Government is investing in digital infrastructure to ensure that all residents,
      regardless of where they live or their circumstances, can access the services they need.
      This includes improving online platforms, expanding digital literacy programs, and ensuring
      our digital services meet the highest accessibility standards.
    </RplBlockQuote>`
  })
}
