<script setup lang="ts">
export interface RplDropdownOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RplDropdownProps {
  modelValue?: string
  label: string
  options: RplDropdownOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<RplDropdownProps>(), {
  modelValue: '',
  placeholder: 'Please select',
  required: false,
  disabled: false,
  error: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = `rpl-dropdown-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div :class="['rpl-dropdown', { 'rpl-dropdown--error': error, 'rpl-dropdown--disabled': disabled }]">
    <label :for="inputId" class="rpl-dropdown__label">
      {{ label }}
      <span v-if="required" class="rpl-dropdown__required" aria-hidden="true">*</span>
    </label>
    <select
      :id="inputId"
      v-bind="$attrs"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      class="rpl-dropdown__select"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" :id="`${inputId}-error`" class="rpl-dropdown__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.rpl-dropdown {
  margin-bottom: 1rem;
}

.rpl-dropdown__label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
}

.rpl-dropdown__required {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-dropdown__select {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid var(--rpl-clr-border, #ccc);
  border-radius: var(--rpl-border-radius, 4px);
  background-color: var(--rpl-clr-background, #fff);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23333' stroke-width='2' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.rpl-dropdown__select:focus {
  outline: none;
  border-color: var(--rpl-clr-primary, #0052c2);
  box-shadow: 0 0 0 2px rgba(0, 82, 194, 0.2);
}

.rpl-dropdown--error .rpl-dropdown__select {
  border-color: var(--rpl-clr-error, #d0021b);
}

.rpl-dropdown--disabled .rpl-dropdown__select {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-dropdown__error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--rpl-clr-error, #d0021b);
}
</style>
