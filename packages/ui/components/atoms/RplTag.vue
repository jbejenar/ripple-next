<script setup lang="ts">
export interface RplTagProps {
  /** Display text for the tag */
  label: string
  /** Visual variant */
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
  /** Render as a link */
  href?: string
}

withDefaults(defineProps<RplTagProps>(), {
  variant: 'default',
  href: ''
})
</script>

<template>
  <component
    :is="href ? 'a' : 'span'"
    :href="href || undefined"
    :class="['rpl-tag', `rpl-tag--${variant}`]"
  >
    {{ label }}
  </component>
</template>

<style scoped>
.rpl-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--rpl-sp-1, 0.25rem) var(--rpl-sp-3, 0.75rem);
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  font-size: var(--rpl-type-size-xs, 0.75rem);
  font-weight: 600;
  line-height: 1.5;
  border-radius: 9999px;
  text-decoration: none;
  white-space: nowrap;
}

a.rpl-tag:hover {
  text-decoration: underline;
}

a.rpl-tag:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-tag--default {
  background-color: var(--rpl-clr-background-light, #f5f5f5);
  color: var(--rpl-clr-text, #333);
}

.rpl-tag--info {
  background-color: #eff6ff;
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-tag--success {
  background-color: #f0fdf4;
  color: var(--rpl-clr-success, #027a48);
}

.rpl-tag--warning {
  background-color: #fffbeb;
  color: var(--rpl-clr-warning, #dc6803);
}

.rpl-tag--error {
  background-color: #fef2f2;
  color: var(--rpl-clr-error, #d0021b);
}
</style>
