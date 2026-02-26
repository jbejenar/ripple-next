<script setup lang="ts">
export interface RplButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<RplButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button'
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :class="[
      'rpl-button',
      `rpl-button--${variant}`,
      `rpl-button--${size}`
    ]"
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.rpl-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  font-weight: 700;
  border: 2px solid transparent;
  border-radius: var(--rpl-border-radius, 4px);
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.rpl-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-button--sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.rpl-button--md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.rpl-button--lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.rpl-button--primary {
  background-color: var(--rpl-clr-primary, #0052c2);
  color: #fff;
  border-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-button--primary:hover:not(:disabled) {
  background-color: var(--rpl-clr-primary-dark, #003e91);
}

.rpl-button--secondary {
  background-color: var(--rpl-clr-secondary, #333);
  color: #fff;
  border-color: var(--rpl-clr-secondary, #333);
}

.rpl-button--outlined {
  background-color: transparent;
  color: var(--rpl-clr-primary, #0052c2);
  border-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-button--text {
  background-color: transparent;
  color: var(--rpl-clr-primary, #0052c2);
  border-color: transparent;
}
</style>
