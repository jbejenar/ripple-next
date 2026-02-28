<script setup lang="ts">
export interface RplChipProps {
  /** Display text for the chip */
  label: string
  /** Whether the chip can be dismissed */
  dismissible?: boolean
  /** Whether the chip is in an active/selected state */
  active?: boolean
  /** Whether the chip is disabled */
  disabled?: boolean
}

withDefaults(defineProps<RplChipProps>(), {
  dismissible: false,
  active: false,
  disabled: false
})

const emit = defineEmits<{
  dismiss: []
  click: [event: MouseEvent]
}>()
</script>

<template>
  <span
    :class="[
      'rpl-chip',
      { 'rpl-chip--active': active, 'rpl-chip--disabled': disabled }
    ]"
  >
    <button
      type="button"
      class="rpl-chip__label"
      :disabled="disabled"
      :aria-pressed="active"
      @click="emit('click', $event)"
    >
      {{ label }}
    </button>
    <button
      v-if="dismissible"
      type="button"
      class="rpl-chip__dismiss"
      :disabled="disabled"
      :aria-label="`Remove ${label}`"
      @click="emit('dismiss')"
    >
      &#10005;
    </button>
  </span>
</template>

<style scoped>
.rpl-chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--rpl-clr-border, #ccc);
  border-radius: 9999px;
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  font-size: var(--rpl-type-size-sm, 0.875rem);
  line-height: 1;
  background-color: #fff;
  transition: border-color 0.2s, background-color 0.2s;
}

.rpl-chip--active {
  background-color: var(--rpl-clr-primary, #0052c2);
  border-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-chip--active .rpl-chip__label {
  color: #fff;
}

.rpl-chip--disabled {
  opacity: 0.5;
}

.rpl-chip__label {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--rpl-sp-2, 0.5rem) var(--rpl-sp-3, 0.75rem);
  font: inherit;
  color: var(--rpl-clr-text, #333);
  line-height: 1;
}

.rpl-chip__label:disabled {
  cursor: not-allowed;
}

.rpl-chip__label:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: -2px;
  border-radius: 9999px;
}

.rpl-chip__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-left: 1px solid var(--rpl-clr-border, #ccc);
  cursor: pointer;
  padding: var(--rpl-sp-1, 0.25rem) var(--rpl-sp-2, 0.5rem);
  font-size: var(--rpl-type-size-xs, 0.75rem);
  color: var(--rpl-clr-text-light, #666);
  line-height: 1;
}

.rpl-chip--active .rpl-chip__dismiss {
  border-left-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.rpl-chip__dismiss:disabled {
  cursor: not-allowed;
}

.rpl-chip__dismiss:hover:not(:disabled) {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-chip__dismiss:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: -2px;
  border-radius: 0 9999px 9999px 0;
}
</style>
