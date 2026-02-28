import { ref, computed } from 'vue'

export interface RplValidationRule {
  validate: (value: unknown) => boolean
  message: string
}

export interface RplFieldState {
  value: unknown
  error: string
  touched: boolean
}

export function useRplFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  rules: Partial<Record<keyof T, RplValidationRule[]>>
) {
  const fields = ref<Record<keyof T, RplFieldState>>(
    Object.fromEntries(
      Object.keys(initialValues).map(key => [
        key,
        { value: initialValues[key], error: '', touched: false }
      ])
    ) as Record<keyof T, RplFieldState>
  )

  function validateField(name: keyof T): boolean {
    const field = fields.value[name]
    const fieldRules = rules[name]
    if (!fieldRules) {
      field.error = ''
      return true
    }

    for (const rule of fieldRules) {
      if (!rule.validate(field.value)) {
        field.error = rule.message
        return false
      }
    }
    field.error = ''
    return true
  }

  function validateAll(): boolean {
    let valid = true
    for (const name of Object.keys(fields.value) as Array<keyof T>) {
      fields.value[name].touched = true
      if (!validateField(name)) {
        valid = false
      }
    }
    return valid
  }

  function setFieldValue(name: keyof T, value: unknown): void {
    fields.value[name].value = value
    fields.value[name].touched = true
    validateField(name)
  }

  function resetForm(): void {
    for (const key of Object.keys(initialValues) as Array<keyof T>) {
      fields.value[key].value = initialValues[key]
      fields.value[key].error = ''
      fields.value[key].touched = false
    }
  }

  function getFieldError(name: keyof T): string {
    const field = fields.value[name]
    return field.touched ? field.error : ''
  }

  function getFieldValue(name: keyof T): unknown {
    return fields.value[name].value
  }

  const isValid = computed(() =>
    (Object.keys(fields.value) as Array<keyof T>).every(name => {
      const fieldRules = rules[name]
      if (!fieldRules) return true
      return fieldRules.every(rule => rule.validate(fields.value[name].value))
    })
  )

  const errors = computed(() =>
    Object.fromEntries(
      (Object.keys(fields.value) as Array<keyof T>).map(name => [
        name,
        getFieldError(name)
      ])
    ) as Record<keyof T, string>
  )

  return {
    fields,
    isValid,
    errors,
    validateField,
    validateAll,
    setFieldValue,
    resetForm,
    getFieldError,
    getFieldValue
  }
}

// Common validation rules for government forms
export const rplValidationRules = {
  required(message = 'This field is required'): RplValidationRule {
    return {
      validate: (value: unknown) => {
        if (typeof value === 'string') return value.trim().length > 0
        if (typeof value === 'boolean') return value === true
        return value !== null && value !== undefined
      },
      message
    }
  },

  minLength(min: number, message?: string): RplValidationRule {
    return {
      validate: (value: unknown) => typeof value === 'string' && value.length >= min,
      message: message ?? `Must be at least ${min} characters`
    }
  },

  maxLength(max: number, message?: string): RplValidationRule {
    return {
      validate: (value: unknown) => typeof value === 'string' && value.length <= max,
      message: message ?? `Must be no more than ${max} characters`
    }
  },

  email(message = 'Please enter a valid email address'): RplValidationRule {
    return {
      validate: (value: unknown) =>
        typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message
    }
  },

  pattern(regex: RegExp, message: string): RplValidationRule {
    return {
      validate: (value: unknown) => typeof value === 'string' && regex.test(value),
      message
    }
  }
}
