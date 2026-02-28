<script setup lang="ts">
export interface RplFileUploadProps {
  label: string
  accept?: string
  multiple?: boolean
  required?: boolean
  disabled?: boolean
  error?: string
}

defineOptions({
  inheritAttrs: false
})

withDefaults(defineProps<RplFileUploadProps>(), {
  accept: '',
  multiple: false,
  required: false,
  disabled: false,
  error: ''
})

defineEmits<{
  change: [files: FileList | null]
}>()

const inputId = `rpl-file-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div :class="['rpl-file-upload', { 'rpl-file-upload--error': error, 'rpl-file-upload--disabled': disabled }]">
    <label :for="inputId" class="rpl-file-upload__label">
      {{ label }}
      <span v-if="required" class="rpl-file-upload__required" aria-hidden="true">*</span>
    </label>
    <div class="rpl-file-upload__dropzone">
      <input
        :id="inputId"
        v-bind="$attrs"
        type="file"
        :accept="accept || undefined"
        :multiple="multiple"
        :required="required"
        :disabled="disabled"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        class="rpl-file-upload__input"
        @change="$emit('change', ($event.target as HTMLInputElement).files)"
      />
      <div class="rpl-file-upload__prompt">
        <span class="rpl-file-upload__icon" aria-hidden="true">&#8593;</span>
        <span class="rpl-file-upload__text">Choose a file or drag it here</span>
        <span v-if="accept" class="rpl-file-upload__hint">Accepted: {{ accept }}</span>
      </div>
    </div>
    <p v-if="error" :id="`${inputId}-error`" class="rpl-file-upload__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.rpl-file-upload {
  margin-bottom: 1rem;
}

.rpl-file-upload__label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
}

.rpl-file-upload__required {
  color: var(--rpl-clr-error, #d0021b);
}

.rpl-file-upload__dropzone {
  position: relative;
  border: 2px dashed var(--rpl-clr-border, #ccc);
  border-radius: var(--rpl-border-radius, 4px);
  padding: 1.5rem;
  text-align: center;
  transition: border-color 0.2s, background-color 0.2s;
  cursor: pointer;
}

.rpl-file-upload__dropzone:hover {
  border-color: var(--rpl-clr-primary, #0052c2);
  background-color: rgba(0, 82, 194, 0.02);
}

.rpl-file-upload__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.rpl-file-upload__input:focus-visible + .rpl-file-upload__prompt {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-file-upload__prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  pointer-events: none;
}

.rpl-file-upload__icon {
  font-size: 1.5rem;
  color: var(--rpl-clr-primary, #0052c2);
}

.rpl-file-upload__text {
  font-size: 1rem;
  color: var(--rpl-clr-text, #333);
}

.rpl-file-upload__hint {
  font-size: 0.75rem;
  color: var(--rpl-clr-text-light, #666);
}

.rpl-file-upload--error .rpl-file-upload__dropzone {
  border-color: var(--rpl-clr-error, #d0021b);
}

.rpl-file-upload--disabled .rpl-file-upload__dropzone {
  opacity: 0.5;
  cursor: not-allowed;
}

.rpl-file-upload--disabled .rpl-file-upload__input {
  cursor: not-allowed;
}

.rpl-file-upload__error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--rpl-clr-error, #d0021b);
}
</style>
