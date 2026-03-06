import type { Meta, StoryObj } from '@storybook/vue3'
import RplCampaignBanner from './RplCampaignBanner.vue'

const meta: Meta<typeof RplCampaignBanner> = {
  title: 'Molecules/RplCampaignBanner',
  component: RplCampaignBanner,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'secondary']
    }
  }
}

export default meta
type Story = StoryObj<typeof RplCampaignBanner>

export const Primary: Story = {
  args: {
    type: 'primary'
  },
  render: (args) => ({
    components: { RplCampaignBanner },
    setup() {
      return { args }
    },
    template: `
      <RplCampaignBanner v-bind="args">
        <template #media>
          <img src="https://via.placeholder.com/800x500" alt="Campaign hero image" />
        </template>
        <template #title>Together, we can make a difference</template>
        <p>Join the campaign to build a stronger, more connected community across Victoria.</p>
        <template #action>
          <button style="padding: 0.75rem 1.5rem; font-size: 1rem; background: #fff; color: #0052c2; border: none; border-radius: 4px; cursor: pointer; font-weight: 700;">Get involved</button>
        </template>
      </RplCampaignBanner>
    `
  })
}

export const Secondary: Story = {
  args: {
    type: 'secondary'
  },
  render: (args) => ({
    components: { RplCampaignBanner },
    setup() {
      return { args }
    },
    template: `
      <RplCampaignBanner v-bind="args">
        <template #title>Community update</template>
        <p>Read the latest updates on services and programs in your area.</p>
        <template #action>
          <button style="padding: 0.5rem 1rem; font-size: 0.875rem; background: #0052c2; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Read more</button>
        </template>
      </RplCampaignBanner>
    `
  })
}

export const WithMedia: Story = {
  args: {
    type: 'primary'
  },
  render: (args) => ({
    components: { RplCampaignBanner },
    setup() {
      return { args }
    },
    template: `
      <RplCampaignBanner v-bind="args">
        <template #media>
          <img src="https://via.placeholder.com/800x500" alt="Campaign image" />
        </template>
        <template #title>Supporting Victorian families</template>
        <p>New programs and services to help families thrive.</p>
      </RplCampaignBanner>
    `
  })
}

export const WithMeta: Story = {
  args: {
    type: 'primary'
  },
  render: (args) => ({
    components: { RplCampaignBanner },
    setup() {
      return { args }
    },
    template: `
      <RplCampaignBanner v-bind="args">
        <template #title>Climate action plan</template>
        <p>Victoria's roadmap to a sustainable future for all communities.</p>
        <template #action>
          <button style="padding: 0.75rem 1.5rem; font-size: 1rem; background: #fff; color: #0052c2; border: none; border-radius: 4px; cursor: pointer; font-weight: 700;">Learn more</button>
        </template>
        <template #meta>
          <span>Published 15 Feb 2026</span> &middot; <span>Environment</span>
        </template>
      </RplCampaignBanner>
    `
  })
}

export const NoMedia: Story = {
  args: {
    type: 'primary'
  },
  render: (args) => ({
    components: { RplCampaignBanner },
    setup() {
      return { args }
    },
    template: `
      <RplCampaignBanner v-bind="args">
        <template #title>Digital services update</template>
        <p>Improvements to online government services to make them faster and easier to use.</p>
        <template #action>
          <button style="padding: 0.75rem 1.5rem; font-size: 1rem; background: #fff; color: #0052c2; border: none; border-radius: 4px; cursor: pointer; font-weight: 700;">Explore services</button>
        </template>
      </RplCampaignBanner>
    `
  })
}
