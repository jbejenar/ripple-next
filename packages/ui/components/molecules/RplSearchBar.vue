<script setup lang="ts">
import { ref } from 'vue'

export interface RplSearchBarProps {
  /** Placeholder text for the search input */
  placeholder?: string
  /** Accessible label for the search input */
  ariaLabel?: string
  /** The current search value (v-model) */
  modelValue?: string
  /** Button text */
  buttonLabel?: string
}

withDefaults(defineProps<RplSearchBarProps>(), {
  placeholder: 'Search',
  ariaLabel: 'Search',
  modelValue: '',
  buttonLabel: 'Search'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function handleInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
}

function handleSubmit(): void {
  const value = inputRef.value?.value ?? ''
  emit('submit', value)
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="rpl-search-bar" role="search" :aria-label="ariaLabel">
    <input
      ref="inputRef"
      type="search"
      class="rpl-search-bar__input"
      :placeholder="placeholder"
      :value="modelValue"
      :aria-label="ariaLabel"
      @input="handleInput"
      @keydown="handleKeydown"
    />
    <button
      type="button"
      class="rpl-search-bar__button"
      @click="handleSubmit"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>

<style scoped>
.rpl-search-bar {
  display: flex;
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
  border: 2px solid var(--rpl-clr-border, #ccc);
  border-radius: var(--rpl-border-radius, 4px);
  overflow: hidden;
  transition: border-color 0.2s;
}

.rpl-search-bar:focus-within {
  border-color: var(--rpl-clr-primary, #0052c2);
}

.rpl-search-bar__input {
  flex: 1;
  padding: var(--rpl-sp-3, 0.75rem) var(--rpl-sp-4, 1rem);
  font: inherit;
  font-size: var(--rpl-type-size-base, 1rem);
  border: none;
  outline: none;
  color: var(--rpl-clr-text, #333);
  background-color: #fff;
  min-width: 0;
}

.rpl-search-bar__input::placeholder {
  color: var(--rpl-clr-text-light, #666);
}

.rpl-search-bar__button {
  flex-shrink: 0;
  padding: var(--rpl-sp-3, 0.75rem) var(--rpl-sp-5, 1.25rem);
  font: inherit;
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: 700;
  color: #fff;
  background-color: var(--rpl-clr-primary, #0052c2);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.rpl-search-bar__button:hover {
  background-color: var(--rpl-clr-primary-dark, #003e91);
}

.rpl-search-bar__button:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: -2px;
}
</style>
