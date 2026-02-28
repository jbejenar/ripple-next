<script setup lang="ts">
export interface RplTextareaProps {
  modelValue?: string
  label: string
  placeholder?: string
  rows?: number
  maxlength?: number
  required?: boolean
  disabled?: boolean
  error?: string
}

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<RplTextareaProps>(), {
  modelValue: '',
  placeholder: '',
  rows: 4,
  maxlength: 0,
  required: false,
  disabled: false,
  error: ''
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = `rpl-textarea-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div :class="['rpl-textarea', { 'rpl-textarea--error': error, 'rpl-textarea--disabled': disabled }]">
    <label :for="inputId" class="rpl-textarea__label">
      {{ label }}
      <span v-if="required" class="rpl-textarea__required" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="inputId"
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength || undefined"
      :required="required"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      class="rpl-textarea__input"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <div v-if="maxlength" class="rpl-textarea__counter">
      {{ modelValue.length }}/{{ maxlength }}
    </div>
    <p v-if="error" :id="`${inputId}-error`" class="rpl-textarea__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.rpl-textarea {
  margin-bottom: 1rem;
}

.rpl-textarea__label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
}

.rpl-textarea__required {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-textarea__input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  border: 2px solid var(--rpl-clr-border, #ccc);
  border-radius: var(--rpl-border-radius, 4px);
  resize: vertical;
  transition: border-color 0.2s;
}

.rpl-textarea__input:focus {
  outline: none;
  border-color: var(--rpl-clr-primary, #0052c2);
  box-shadow: 0 0 0 2px rgba(0, 82, 194, 0.2);
}

.rpl-textarea--error .rpl-textarea__input {
  border-color: var(--rpl-clr-error, #d0021b);
}

.rpl-textarea--disabled .rpl-textarea__input {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-textarea__counter {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--rpl-clr-text-light, #666);
  text-align: right;
}

.rpl-textarea__error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--rpl-clr-error, #d0021b);
}
</style>
