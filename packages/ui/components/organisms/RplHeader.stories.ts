import type { Meta, StoryObj } from '@storybook/vue3'
import RplHeader from './RplHeader.vue'

const meta: Meta<typeof RplHeader> = {
  title: 'Organisms/RplHeader',
  component: RplHeader,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplHeader>

export const Default: Story = {
  args: {
    siteName: 'Victoria State Government'
  }
}

export const CustomSiteName: Story = {
  args: {
    siteName: 'Department of Education'
  }
}

export const WithNavigation: Story = {
  args: {
    siteName: 'Victoria State Government'
  },
  render: (args) => ({
    components: { RplHeader },
    setup() {
      return { args }
    },
    template: `
      <RplHeader v-bind="args">
        <a href="#" style="margin-left: 1rem; color: #0052c2; text-decoration: none;">Home</a>
        <a href="#" style="margin-left: 1rem; color: #0052c2; text-decoration: none;">Services</a>
        <a href="#" style="margin-left: 1rem; color: #0052c2; text-decoration: none;">About</a>
      </RplHeader>
    `
  })
}
