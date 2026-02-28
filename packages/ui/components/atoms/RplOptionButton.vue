<script setup lang="ts">
export interface RplOptionButtonOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RplOptionButtonProps {
  modelValue?: string
  label: string
  name: string
  options: RplOptionButtonOption[]
  required?: boolean
  disabled?: boolean
  error?: string
}

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<RplOptionButtonProps>(), {
  modelValue: '',
  required: false,
  disabled: false,
  error: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const groupId = `rpl-optbtn-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <fieldset
    :class="['rpl-option-button', { 'rpl-option-button--error': error, 'rpl-option-button--disabled': disabled }]"
    :aria-invalid="!!error"
    :aria-describedby="error ? `${groupId}-error` : undefined"
  >
    <legend class="rpl-option-button__legend">
      {{ label }}
      <span v-if="required" class="rpl-option-button__required" aria-hidden="true">*</span>
    </legend>
    <div class="rpl-option-button__options">
      <label
        v-for="option in options"
        :key="option.value"
        :for="`${groupId}-${option.value}`"
        :class="[
          'rpl-option-button__item',
          { 'rpl-option-button__item--selected': modelValue === option.value },
          { 'rpl-option-button__item--disabled': disabled || option.disabled }
        ]"
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
          class="rpl-option-button__input"
          @change="$emit('update:modelValue', option.value)"
        />
        {{ option.label }}
      </label>
    </div>
    <p v-if="error" :id="`${groupId}-error`" class="rpl-option-button__error" role="alert">
      {{ error }}
    </p>
  </fieldset>
</template>

<style scoped>
.rpl-option-button {
  margin-bottom: 1rem;
  border: none;
  padding: 0;
}

.rpl-option-button__legend {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
}

.rpl-option-button__required {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-option-button__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rpl-option-button__item {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
  background-color: var(--rpl-clr-background, #fff);
  border: 2px solid var(--rpl-clr-border, #ccc);
  border-radius: var(--rpl-border-radius, 4px);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.rpl-option-button__item:hover {
  border-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-option-button__item--selected {
  border-color: var(--rpl-clr-primary, #0052c2);
  background-color: rgba(0, 82, 194, 0.08);
  color: var(--rpl-clr-primary, #0052c2);
  font-weight: 600;
}

.rpl-option-button__item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-option-button__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.rpl-option-button__input:focus-visible + .rpl-option-button__item,
.rpl-option-button__item:has(.rpl-option-button__input:focus-visible) {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-option-button--error .rpl-option-button__item {
  border-color: var(--rpl-clr-error, #d0021b);
}

.rpl-option-button__error {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--rpl-clr-error, #d0021b);
}
</style>
