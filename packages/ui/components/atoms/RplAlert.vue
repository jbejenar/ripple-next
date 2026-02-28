<script setup lang="ts">
export interface RplAlertProps {
  /** Visual variant controlling colour and icon */
  variant: 'error' | 'success' | 'warning' | 'info'
  /** Optional heading displayed above the body */
  title?: string
  /** Whether the alert can be dismissed by the user */
  dismissible?: boolean
}

withDefaults(defineProps<RplAlertProps>(), {
  title: '',
  dismissible: false
})

const emit = defineEmits<{
  dismiss: []
}>()

const iconMap: Record<string, string> = {
  error: '\u2716',
  success: '\u2714',
  warning: '\u26A0',
  info: '\u2139'
}
</script>

<template>
  <div
    :class="['rpl-alert', `rpl-alert--${variant}`]"
    :role="variant === 'error' ? 'alert' : 'status'"
    :aria-live="variant === 'error' ? 'assertive' : 'polite'"
  >
    <span class="rpl-alert__icon" aria-hidden="true">{{ iconMap[variant] }}</span>
    <div class="rpl-alert__body">
      <strong v-if="title" class="rpl-alert__title">{{ title }}</strong>
      <div class="rpl-alert__content">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      class="rpl-alert__dismiss"
      type="button"
      aria-label="Dismiss alert"
      @click="emit('dismiss')"
    >
      &#10005;
    </button>
  </div>
</template>

<style scoped>
.rpl-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--rpl-sp-3, 0.75rem);
  padding: var(--rpl-sp-4, 1rem) var(--rpl-sp-5, 1.25rem);
  border-radius: var(--rpl-border-radius, 4px);
  border-left: 4px solid;
  margin-bottom: var(--rpl-sp-4, 1rem);
}

.rpl-alert--error {
  border-color: var(--rpl-clr-error, #d0021b);
  background-color: #fef2f2;
}

.rpl-alert--success {
  border-color: var(--rpl-clr-success, #027a48);
  background-color: #f0fdf4;
}

.rpl-alert--warning {
  border-color: var(--rpl-clr-warning, #dc6803);
  background-color: #fffbeb;
}

.rpl-alert--info {
  border-color: var(--rpl-clr-primary, #0052c2);
  background-color: #eff6ff;
}

.rpl-alert__icon {
  flex-shrink: 0;
  font-size: var(--rpl-type-size-xl, 1.25rem);
  line-height: 1;
}

.rpl-alert--error .rpl-alert__icon {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-alert--success .rpl-alert__icon {
  color: var(--rpl-clr-success, #027a48);
}

.rpl-alert--warning .rpl-alert__icon {
  color: var(--rpl-clr-warning, #dc6803);
}

.rpl-alert--info .rpl-alert__icon {
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-alert__body {
  flex: 1;
  min-width: 0;
}

.rpl-alert__title {
  display: block;
  margin-bottom: var(--rpl-sp-1, 0.25rem);
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text, #333);
}

.rpl-alert__content {
  font-size: var(--rpl-type-size-sm, 0.875rem);
  color: var(--rpl-clr-text, #333);
}

.rpl-alert__dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text-light, #666);
  padding: var(--rpl-sp-1, 0.25rem);
  line-height: 1;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-alert__dismiss:hover {
  color: var(--rpl-clr-text, #333);
}

.rpl-alert__dismiss:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}
</style>
