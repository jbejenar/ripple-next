import type { Meta, StoryObj } from '@storybook/vue3'
import RplButton from './RplButton.vue'

const meta: Meta<typeof RplButton> = {
  title: 'Atoms/RplButton',
  component: RplButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outlined', 'text']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    disabled: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset']
    }
  }
}

export default meta
type Story = StoryObj<typeof RplButton>

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md'
  },
  render: (args) => ({
    components: { RplButton },
    setup() {
      return { args }
    },
    template: '<RplButton v-bind="args">Primary Button</RplButton>'
  })
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md'
  },
  render: (args) => ({
    components: { RplButton },
    setup() {
      return { args }
    },
    template: '<RplButton v-bind="args">Secondary Button</RplButton>'
  })
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    size: 'md'
  },
  render: (args) => ({
    components: { RplButton },
    setup() {
      return { args }
    },
    template: '<RplButton v-bind="args">Outlined Button</RplButton>'
  })
}

export const Text: Story = {
  args: {
    variant: 'text',
    size: 'md'
  },
  render: (args) => ({
    components: { RplButton },
    setup() {
      return { args }
    },
    template: '<RplButton v-bind="args">Text Button</RplButton>'
  })
}

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm'
  },
  render: (args) => ({
    components: { RplButton },
    setup() {
      return { args }
    },
    template: '<RplButton v-bind="args">Small Button</RplButton>'
  })
}

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg'
  },
  render: (args) => ({
    components: { RplButton },
    setup() {
      return { args }
    },
    template: '<RplButton v-bind="args">Large Button</RplButton>'
  })
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true
  },
  render: (args) => ({
    components: { RplButton },
    setup() {
      return { args }
    },
    template: '<RplButton v-bind="args">Disabled Button</RplButton>'
  })
}
