<script setup lang="ts">
export interface RplCampaignBannerProps {
  /** Banner type — primary is hero-style, secondary is compact */
  type?: 'primary' | 'secondary'
}

withDefaults(defineProps<RplCampaignBannerProps>(), {
  type: 'primary'
})
</script>

<template>
  <div :class="['rpl-campaign-banner', `rpl-campaign-banner--${type}`]">
    <div class="rpl-campaign-banner__inner">
      <div v-if="$slots.media" class="rpl-campaign-banner__media">
        <slot name="media" />
      </div>
      <div class="rpl-campaign-banner__body">
        <div v-if="$slots.title" class="rpl-campaign-banner__title">
          <slot name="title" />
        </div>
        <div class="rpl-campaign-banner__content">
          <slot />
          <div v-if="$slots.action" class="rpl-campaign-banner__action">
            <slot name="action" />
          </div>
        </div>
        <div v-if="$slots.meta" class="rpl-campaign-banner__meta">
          <slot name="meta" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rpl-campaign-banner {
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  border-radius: var(--rpl-border-radius, 4px);
  overflow: hidden;
}

/* Primary variant — hero-style */
.rpl-campaign-banner--primary {
  background-color: var(--rpl-clr-primary, #0052c2);
  color: var(--rpl-clr-white, #fff);
}

.rpl-campaign-banner--primary .rpl-campaign-banner__inner {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .rpl-campaign-banner--primary .rpl-campaign-banner__inner {
    grid-template-columns: 1fr 1fr;
  }
}

.rpl-campaign-banner--primary .rpl-campaign-banner__body {
  padding: var(--rpl-sp-8, 2rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--rpl-sp-5, 1.25rem);
}

.rpl-campaign-banner--primary .rpl-campaign-banner__media {
  min-height: 12rem;
  overflow: hidden;
}

.rpl-campaign-banner--primary .rpl-campaign-banner__media :deep(img),
.rpl-campaign-banner--primary .rpl-campaign-banner__media :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.rpl-campaign-banner--primary .rpl-campaign-banner__title {
  font-size: var(--rpl-type-size-3xl, 2rem);
  font-weight: 700;
  line-height: 1.2;
}

/* Secondary variant — compact */
.rpl-campaign-banner--secondary {
  background-color: var(--rpl-clr-background-light, #f5f5f5);
  color: var(--rpl-clr-text, #333);
}

.rpl-campaign-banner--secondary .rpl-campaign-banner__inner {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.rpl-campaign-banner--secondary .rpl-campaign-banner__body {
  padding: var(--rpl-sp-5, 1.25rem) var(--rpl-sp-6, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--rpl-sp-3, 0.75rem);
  flex: 1;
  min-width: 0;
}

.rpl-campaign-banner--secondary .rpl-campaign-banner__media {
  flex-shrink: 0;
  width: 8rem;
  overflow: hidden;
}

.rpl-campaign-banner--secondary .rpl-campaign-banner__media :deep(img),
.rpl-campaign-banner--secondary .rpl-campaign-banner__media :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.rpl-campaign-banner--secondary .rpl-campaign-banner__title {
  font-size: var(--rpl-type-size-xl, 1.25rem);
  font-weight: 700;
  line-height: 1.3;
}

/* Shared styles */
.rpl-campaign-banner__content {
  font-size: var(--rpl-type-size-base, 1rem);
  line-height: 1.5;
}

.rpl-campaign-banner__action {
  margin-top: var(--rpl-sp-4, 1rem);
}

.rpl-campaign-banner__meta {
  font-size: var(--rpl-type-size-sm, 0.875rem);
  opacity: 0.85;
  margin-top: var(--rpl-sp-2, 0.5rem);
}
</style>
