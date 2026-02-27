import type { Meta, StoryObj } from '@storybook/vue3'
import RplFooter from './RplFooter.vue'

const meta: Meta<typeof RplFooter> = {
  title: 'Organisms/RplFooter',
  component: RplFooter,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof RplFooter>

export const Default: Story = {
  args: {
    siteName: 'Victoria State Government',
    copyrightYear: 2026
  }
}

export const WithNavigation: Story = {
  args: {
    siteName: 'Victoria State Government',
    copyrightYear: 2026
  },
  render: (args) => ({
    components: { RplFooter },
    setup() {
      return { args }
    },
    template: `
      <RplFooter v-bind="args">
        <a href="#" style="color: #fff; text-decoration: none; margin-right: 1.5rem;">Privacy</a>
        <a href="#" style="color: #fff; text-decoration: none; margin-right: 1.5rem;">Disclaimer</a>
        <a href="#" style="color: #fff; text-decoration: none; margin-right: 1.5rem;">Accessibility</a>
        <a href="#" style="color: #fff; text-decoration: none;">Contact us</a>
      </RplFooter>
    `
  })
}

export const CustomBranding: Story = {
  args: {
    siteName: 'Department of Health',
    copyrightYear: 2026
  }
}
