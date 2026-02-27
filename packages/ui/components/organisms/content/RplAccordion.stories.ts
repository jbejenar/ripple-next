import type { Meta, StoryObj } from '@storybook/vue3'
import RplAccordion from './RplAccordion.vue'

const meta: Meta<typeof RplAccordion> = {
  title: 'Organisms/Content/RplAccordion',
  component: RplAccordion,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' }
  }
}

export default meta
type Story = StoryObj<typeof RplAccordion>

export const Default: Story = {
  args: {
    title: 'Frequently Asked Questions',
    items: [
      {
        title: 'How do I apply for a permit?',
        body: '<p>You can apply for a permit online through the Victorian Government website. Visit the permits section and follow the step-by-step application process.</p>'
      },
      {
        title: 'What documents do I need?',
        body: '<p>You will need to provide proof of identity, a completed application form, and any supporting documentation relevant to your permit type.</p>'
      },
      {
        title: 'How long does processing take?',
        body: '<p>Processing times vary depending on the type of permit. Standard applications are typically processed within 10–15 business days.</p>'
      }
    ]
  }
}

export const WithoutTitle: Story = {
  args: {
    items: [
      {
        title: 'First item',
        body: '<p>Content for the first accordion item.</p>'
      },
      {
        title: 'Second item',
        body: '<p>Content for the second accordion item.</p>'
      }
    ]
  }
}

export const SingleItem: Story = {
  args: {
    title: 'Single Accordion',
    items: [
      {
        title: 'Click to expand',
        body: '<p>This accordion has only one item. It can be used for collapsible content sections like disclaimers or additional details.</p>'
      }
    ]
  }
}

export const RichContent: Story = {
  args: {
    title: 'Detailed Information',
    items: [
      {
        title: 'Eligibility criteria',
        body: '<h3>Who is eligible?</h3><ul><li>Victorian residents aged 18+</li><li>Australian citizens or permanent residents</li><li>Applicants with valid identification</li></ul>'
      },
      {
        title: 'Fee schedule',
        body: '<p>Fees are structured as follows:</p><table><tr><th>Type</th><th>Fee</th></tr><tr><td>Standard</td><td>$50</td></tr><tr><td>Concession</td><td>$25</td></tr></table>'
      }
    ]
  }
}
