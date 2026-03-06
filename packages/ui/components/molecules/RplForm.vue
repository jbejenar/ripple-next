<script setup lang="ts">
export interface RplFormSubmissionState {
  /** Current status */
  status: 'idle' | 'submitting' | 'success' | 'error'
  /** Alert title shown on success/error */
  title?: string
  /** Alert message shown on success/error */
  message?: string
}

export interface RplFormProps {
  /** Form id attribute */
  id: string
  /** Optional form heading */
  title?: string
  /** Submission state for showing alerts */
  submissionState?: RplFormSubmissionState
  /** Whether to hide the form body on success */
  hideOnSuccess?: boolean
}

withDefaults(defineProps<RplFormProps>(), {
  title: undefined,
  submissionState: () => ({ status: 'idle' }),
  hideOnSuccess: false
})

const emit = defineEmits<{
  submit: [event: Event]
  reset: [event: Event]
}>()

function handleSubmit(event: Event): void {
  event.preventDefault()
  emit('submit', event)
}

function handleReset(event: Event): void {
  event.preventDefault()
  emit('reset', event)
}
</script>

<template>
  <form
    :id="id"
    class="rpl-form"
    novalidate
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <h2 v-if="title" class="rpl-form__title">{{ title }}</h2>

    <div
      v-if="submissionState.status === 'success' || submissionState.status === 'error'"
      class="rpl-form__alert"
    >
      <div
        :class="['rpl-form__alert-box', `rpl-form__alert-box--${submissionState.status}`]"
        :role="submissionState.status === 'error' ? 'alert' : 'status'"
        :aria-live="submissionState.status === 'error' ? 'assertive' : 'polite'"
      >
        <strong v-if="submissionState.title" class="rpl-form__alert-title">
          {{ submissionState.title }}
        </strong>
        <p v-if="submissionState.message" class="rpl-form__alert-message">
          {{ submissionState.message }}
        </p>
      </div>
    </div>

    <fieldset
      v-if="!(hideOnSuccess && submissionState.status === 'success')"
      class="rpl-form__body"
      :disabled="submissionState.status === 'submitting'"
    >
      <legend class="rpl-form__legend">
        {{ title || 'Form fields' }}
      </legend>
      <slot />
    </fieldset>

    <div
      v-if="!(hideOnSuccess && submissionState.status === 'success')"
      class="rpl-form__actions"
    >
      <slot name="actions">
        <button
          type="submit"
          class="rpl-form__submit"
          :disabled="submissionState.status === 'submitting'"
        >
          {{ submissionState.status === 'submitting' ? 'Submitting...' : 'Submit' }}
        </button>
      </slot>
    </div>
  </form>
</template>

<style scoped>
.rpl-form {
  max-width: 40rem;
  font-family: var(--rpl-type-font-family, 'VIC', Arial, sans-serif);
}

.rpl-form__title {
  font-size: var(--rpl-type-size-4, 1.5rem);
  font-weight: var(--rpl-type-weight-bold, 700);
  line-height: var(--rpl-type-lh-heading, 1.2);
  color: var(--rpl-clr-text, #333);
  margin: 0 0 var(--rpl-sp-5, 1.25rem);
}

.rpl-form__alert {
  margin-bottom: var(--rpl-sp-5, 1.25rem);
}

.rpl-form__alert-box {
  padding: var(--rpl-sp-4, 1rem) var(--rpl-sp-5, 1.25rem);
  border-left: 4px solid;
  border-radius: var(--rpl-border-radius, 4px);
}

.rpl-form__alert-box--success {
  border-left-color: var(--rpl-clr-success, #008a00);
  background-color: var(--rpl-clr-success-light, #e8f5e9);
}

.rpl-form__alert-box--error {
  border-left-color: var(--rpl-clr-error, #d50000);
  background-color: var(--rpl-clr-error-light, #fdecea);
}

.rpl-form__alert-title {
  display: block;
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: var(--rpl-type-weight-bold, 700);
  color: var(--rpl-clr-text, #333);
  margin-bottom: var(--rpl-sp-2, 0.5rem);
}

.rpl-form__alert-message {
  font-size: var(--rpl-type-size-base, 1rem);
  color: var(--rpl-clr-text, #333);
  margin: 0;
}

.rpl-form__legend {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.rpl-form__body {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rpl-sp-5, 1.25rem);
}

.rpl-form__body:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rpl-form__actions {
  display: flex;
  flex-direction: row;
  gap: var(--rpl-sp-4, 1rem);
  padding-top: var(--rpl-sp-6, 1.5rem);
}

.rpl-form__submit {
  padding: var(--rpl-sp-3, 0.75rem) var(--rpl-sp-6, 1.5rem);
  font: inherit;
  font-size: var(--rpl-type-size-base, 1rem);
  font-weight: var(--rpl-type-weight-bold, 700);
  color: #fff;
  background-color: var(--rpl-clr-primary, #0052c2);
  border: none;
  border-radius: var(--rpl-border-radius, 4px);
  cursor: pointer;
  transition: background-color 0.2s;
}

.rpl-form__submit:hover {
  background-color: var(--rpl-clr-primary-dark, #003e91);
}

.rpl-form__submit:focus-visible {
  outline: 2px solid var(--rpl-clr-primary, #0052c2);
  outline-offset: 2px;
}

.rpl-form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
