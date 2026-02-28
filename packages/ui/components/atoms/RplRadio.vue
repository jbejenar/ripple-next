<script setup lang="ts">
export interface RplRadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RplRadioProps {
  modelValue?: string
  label: string
  name: string
  options: RplRadioOption[]
  required?: boolean
  disabled?: boolean
  error?: string
}

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<RplRadioProps>(), {
  modelValue: '',
  required: false,
  disabled: false,
  error: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const groupId = `rpl-radio-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <fieldset
    :class="['rpl-radio', { 'rpl-radio--error': error, 'rpl-radio--disabled': disabled }]"
    :aria-invalid="!!error"
    :aria-describedby="error ? `${groupId}-error` : undefined"
  >
    <legend class="rpl-radio__legend">
      {{ label }}
      <span v-if="required" class="rpl-radio__required" aria-hidden="true">*</span>
    </legend>
    <div class="rpl-radio__options">
      <div
        v-for="option in options"
        :key="option.value"
        class="rpl-radio__option"
      >
        <input
          :id="`${groupId}-${option.value}`"
          v-bind="$attrs"
          type="radio"
          :name="name"
          :value="option.value"
          :checked="modelValue === option.value"
          :required="required"
          :disabled="disabled || option.disabled"
          class="rpl-radio__input"
          @change="$emit('update:modelValue', option.value)"
        />
        <label :for="`${groupId}-${option.value}`" class="rpl-radio__label">
          {{ option.label }}
        </label>
      </div>
    </div>
    <p v-if="error" :id="`${groupId}-error`" class="rpl-radio__error" role="alert">
      {{ error }}
    </p>
  </fieldset>
</template>

<style scoped>
.rpl-radio {
  margin-bottom: 1rem;
  border: none;
  padding: 0;
}

.rpl-radio__legend {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
}

.rpl-radio__required {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-radio__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rpl-radio__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rpl-radio__input {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--rpl-clr-primary, #0052c2);
  cursor: pointer;
  flex-shrink: 0;
}

.rpl-radio__input:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-radio__label {
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
  cursor: pointer;
}

.rpl-radio--disabled .rpl-radio__input,
.rpl-radio--disabled .rpl-radio__label {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-radio__input:disabled + .rpl-radio__label {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-radio--error .rpl-radio__input {
  outline: 2px solid var(--rpl-clr-error, #d0021b);
  outline-offset: 1px;
}

.rpl-radio__error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--rpl-clr-error, #d0021b);
}
</style>
