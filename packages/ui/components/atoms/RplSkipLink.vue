<script setup lang="ts">
export interface RplSkipLinkProps {
  target?: string
  label?: string
}

withDefaults(defineProps<RplSkipLinkProps>(), {
  target: '#main-content',
  label: 'Skip to main content'
})
</script>

<template>
  <a :href="target" class="rpl-skip-link">
    {{ label }}
  </a>
</template>

<style scoped>
.rpl-skip-link {
  position: absolute;
  top: -100%;
  left: var(--rpl-sp-4, 1rem);
  z-index: 10000;
  padding: var(--rpl-sp-3, 0.75rem) var(--rpl-sp-6, 1.5rem);
  background-color: var(--rpl-clr-primary, #0052c2);
  color: var(--rpl-clr-text-inverse, #ffffff);
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: 700;
  text-decoration: none;
  border-radius: 0 0 var(--rpl-border-radius, 4px) var(--rpl-border-radius, 4px);
  transition: top 0.2s;
}

.rpl-skip-link:focus {
  top: 0;
  outline: 3px solid var(--rpl-clr-primary-dark, #003e91);
  outline-offset: 2px;
}
</style>
