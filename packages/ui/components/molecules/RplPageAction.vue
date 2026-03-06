<script setup lang="ts">
export interface RplPageActionProps {
  /** Accessible label for the actions region */
  ariaLabel?: string
}

withDefaults(defineProps<RplPageActionProps>(), {
  ariaLabel: 'Page actions'
})
</script>

<template>
  <aside
    :class="['rpl-page-action']"
    role="complementary"
    :aria-label="ariaLabel"
  >
    <div v-if="$slots.upper" class="rpl-page-action__upper">
      <slot name="upper" />
    </div>
    <slot />
  </aside>
</template>

<style scoped>
.rpl-page-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--rpl-sp-3, 0.75rem);
  position: fixed;
  bottom: var(--rpl-sp-6, 1.5rem);
  right: var(--rpl-sp-6, 1.5rem);
  z-index: var(--rpl-z-overlay, 100);
}

.rpl-page-action__upper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--rpl-sp-2, 0.5rem);
  margin-bottom: var(--rpl-sp-2, 0.5rem);
}

@media print {
  .rpl-page-action {
    display: none;
  }
}
</style>
