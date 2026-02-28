<script setup lang="ts">
export interface RplAcknowledgementProps {
  /** Type of acknowledgement */
  type?: 'country' | 'people'
  /** The text content of the acknowledgement (alternative to slot) */
  text?: string
}

withDefaults(defineProps<RplAcknowledgementProps>(), {
  type: 'country',
  text: ''
})
</script>

<template>
  <section
    :class="['rpl-acknowledgement', `rpl-acknowledgement--${type}`]"
    aria-label="Acknowledgement"
  >
    <div class="rpl-acknowledgement__icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2C12 2 8 8 8 12s4 10 4 10" />
        <path d="M12 2C12 2 16 8 16 12s-4 10-4 10" />
        <path d="M2 12h20" />
      </svg>
    </div>
    <div class="rpl-acknowledgement__content">
      <slot>{{ text }}</slot>
    </div>
  </section>
</template>

<style scoped>
.rpl-acknowledgement {
  display: flex;
  align-items: flex-start;
  gap: var(--rpl-sp-4, 1rem);
  padding: var(--rpl-sp-6, 1.5rem);
  border-radius: var(--rpl-border-radius, 4px);
  margin-bottom: var(--rpl-sp-6, 1.5rem);
  background-color: var(--rpl-clr-background-light, #f5f5f5);
  border: 1px solid var(--rpl-clr-border-light, #e0e0e0);
}

.rpl-acknowledgement--country {
  border-left: 4px solid var(--rpl-clr-secondary, #333);
}

.rpl-acknowledgement--people {
  border-left: 4px solid var(--rpl-clr-primary, #0052c2);
}

.rpl-acknowledgement__icon {
  flex-shrink: 0;
  color: var(--rpl-clr-text-light, #666);
}

.rpl-acknowledgement__content {
  flex: 1;
  font-size: var(--rpl-type-size-base, 1rem);
  line-height: 1.6;
  color: var(--rpl-clr-text, #333);
}
</style>
