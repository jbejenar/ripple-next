<script setup lang="ts">
export interface RplCalloutProps {
  /** Visual variant */
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'error'
  /** Optional heading */
  title?: string
}

withDefaults(defineProps<RplCalloutProps>(), {
  variant: 'neutral',
  title: ''
})
</script>

<template>
  <aside
    :class="['rpl-callout', `rpl-callout--${variant}`]"
    role="note"
  >
    <strong v-if="title" class="rpl-callout__title">{{ title }}</strong>
    <div class="rpl-callout__content">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.rpl-callout {
  padding: var(--rpl-sp-5, 1.25rem) var(--rpl-sp-6, 1.5rem);
  border-left: 4px solid;
  border-radius: var(--rpl-border-radius, 4px);
  margin-bottom: var(--rpl-sp-6, 1.5rem);
}

.rpl-callout--neutral {
  border-color: var(--rpl-clr-border, #ccc);
  background-color: var(--rpl-clr-background-light, #f5f5f5);
}

.rpl-callout--primary {
  border-color: var(--rpl-clr-primary, #0052c2);
  background-color: #eff6ff;
}

.rpl-callout--success {
  border-color: var(--rpl-clr-success, #027a48);
  background-color: #f0fdf4;
}

.rpl-callout--warning {
  border-color: var(--rpl-clr-warning, #dc6803);
  background-color: #fffbeb;
}

.rpl-callout--error {
  border-color: var(--rpl-clr-error, #d0021b);
  background-color: #fef2f2;
}

.rpl-callout__title {
  display: block;
  margin-bottom: var(--rpl-sp-2, 0.5rem);
  font-size: var(--rpl-type-size-lg, 1.125rem);
  color: var(--rpl-clr-text, #333);
}

.rpl-callout__content {
  font-size: var(--rpl-type-size-base, 1rem);
  line-height: 1.6;
  color: var(--rpl-clr-text, #333);
}
</style>
