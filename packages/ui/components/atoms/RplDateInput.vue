<script setup lang="ts">
export interface RplDateInputProps {
  modelValue?: string
  label: string
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<RplDateInputProps>(), {
  modelValue: '',
  min: '',
  max: '',
  required: false,
  disabled: false,
  error: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = `rpl-date-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div :class="['rpl-date-input', { 'rpl-date-input--error': error, 'rpl-date-input--disabled': disabled }]">
    <label :for="inputId" class="rpl-date-input__label">
      {{ label }}
      <span v-if="required" class="rpl-date-input__required" aria-hidden="true">*</span>
    </label>
    <input
      :id="inputId"
      v-bind="$attrs"
      type="date"
      :value="modelValue"
      :min="min || undefined"
      :max="max || undefined"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      class="rpl-date-input__input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="`${inputId}-error`" class="rpl-date-input__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.rpl-date-input {
  margin-bottom: 1rem;
}

.rpl-date-input__label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
}

.rpl-date-input__required {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-date-input__input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid var(--rpl-clr-border, #ccc);
  border-radius: var(--rpl-border-radius, 4px);
  transition: border-color 0.2s;
}

.rpl-date-input__input:focus {
  outline: none;
  border-color: var(--rpl-clr-primary, #0052c2);
  box-shadow: 0 0 0 2px rgba(0, 82, 194, 0.2);
}

.rpl-date-input--error .rpl-date-input__input {
  border-color: var(--rpl-clr-error, #d0021b);
}

.rpl-date-input--disabled .rpl-date-input__input {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-date-input__error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--rpl-clr-error, #d0021b);
}
</style>
