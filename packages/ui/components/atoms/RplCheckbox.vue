<script setup lang="ts">
export interface RplCheckboxProps {
  modelValue?: boolean
  label: string
  required?: boolean
  disabled?: boolean
  error?: string
}

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<RplCheckboxProps>(), {
  modelValue: false,
  required: false,
  disabled: false,
  error: ''
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const inputId = `rpl-checkbox-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div :class="['rpl-checkbox', { 'rpl-checkbox--error': error, 'rpl-checkbox--disabled': disabled }]">
    <div class="rpl-checkbox__control">
      <input
        :id="inputId"
        v-bind="$attrs"
        type="checkbox"
        :checked="modelValue"
        :required="required"
        :disabled="disabled"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        class="rpl-checkbox__input"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <label :for="inputId" class="rpl-checkbox__label">
        {{ label }}
        <span v-if="required" class="rpl-checkbox__required" aria-hidden="true">*</span>
      </label>
    </div>
    <p v-if="error" :id="`${inputId}-error`" class="rpl-checkbox__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.rpl-checkbox {
  margin-bottom: 1rem;
}

.rpl-checkbox__control {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.rpl-checkbox__input {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  accent-color: var(--rpl-clr-primary, #0052c2);
  cursor: pointer;
  flex-shrink: 0;
}

.rpl-checkbox__input:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-checkbox__label {
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
  cursor: pointer;
}

.rpl-checkbox__required {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-checkbox--disabled .rpl-checkbox__input,
.rpl-checkbox--disabled .rpl-checkbox__label {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-checkbox--error .rpl-checkbox__input {
  outline: 2px solid var(--rpl-clr-error, #d0021b);
  outline-offset: 1px;
}

.rpl-checkbox__error {
  margin-top: 0.25rem;
  margin-left: 1.75rem;
  font-size: 0.875rem;
  color: var(--rpl-clr-error, #d0021b);
}
</style>
