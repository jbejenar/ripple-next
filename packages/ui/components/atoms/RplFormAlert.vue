<script setup lang="ts">
export interface RplFormAlertProps {
  variant: 'error' | 'success' | 'warning' | 'info'
  title?: string
  message: string
}

withDefaults(defineProps<RplFormAlertProps>(), {
  title: ''
})
</script>

<template>
  <div
    :class="['rpl-form-alert', `rpl-form-alert--${variant}`]"
    :role="variant === 'error' ? 'alert' : 'status'"
    :aria-live="variant === 'error' ? 'assertive' : 'polite'"
  >
    <span class="rpl-form-alert__icon" aria-hidden="true">
      <template v-if="variant === 'error'">&#10007;</template>
      <template v-else-if="variant === 'success'">&#10003;</template>
      <template v-else-if="variant === 'warning'">&#9888;</template>
      <template v-else>&#8505;</template>
    </span>
    <div class="rpl-form-alert__content">
      <strong v-if="title" class="rpl-form-alert__title">{{ title }}</strong>
      <p class="rpl-form-alert__message">{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
.rpl-form-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--rpl-border-radius, 4px);
  border-left: 4px solid;
  margin-bottom: 1rem;
}

.rpl-form-alert--error {
  border-color: var(--rpl-clr-error, #d0021b);
  background-color: #fef2f2;
}

.rpl-form-alert--success {
  border-color: var(--rpl-clr-success, #027a48);
  background-color: #f0fdf4;
}

.rpl-form-alert--warning {
  border-color: var(--rpl-clr-warning, #dc6803);
  background-color: #fffbeb;
}

.rpl-form-alert--info {
  border-color: var(--rpl-clr-primary, #0052c2);
  background-color: #eff6ff;
}

.rpl-form-alert__icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  line-height: 1;
}

.rpl-form-alert--error .rpl-form-alert__icon {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-form-alert--success .rpl-form-alert__icon {
  color: var(--rpl-clr-success, #027a48);
}

.rpl-form-alert--warning .rpl-form-alert__icon {
  color: var(--rpl-clr-warning, #dc6803);
}

.rpl-form-alert--info .rpl-form-alert__icon {
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-form-alert__content {
  flex: 1;
}

.rpl-form-alert__title {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
}

.rpl-form-alert__message {
  font-size: 0.875rem;
  color: var(--rpl-clr-text, #333);
  margin: 0;
}
</style>
