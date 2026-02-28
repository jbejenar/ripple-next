import { describe, it, expect } from 'vitest'
import { useRplFormValidation, rplValidationRules } from '../composables/useRplFormValidation'

describe('useRplFormValidation', () => {
  it('initialises with provided values', () => {
    const { getFieldValue } = useRplFormValidation(
      { name: 'John', email: '' },
      {}
    )
    expect(getFieldValue('name')).toBe('John')
    expect(getFieldValue('email')).toBe('')
  })

  it('validates required fields', () => {
    const { validateAll, errors } = useRplFormValidation(
      { name: '' },
      { name: [rplValidationRules.required()] }
    )
    const valid = validateAll()
    expect(valid).toBe(false)
    expect(errors.value.name).toBe('This field is required')
  })

  it('passes validation for valid fields', () => {
    const { setFieldValue, validateAll, errors } = useRplFormValidation(
      { name: '' },
      { name: [rplValidationRules.required()] }
    )
    setFieldValue('name', 'John')
    const valid = validateAll()
    expect(valid).toBe(true)
    expect(errors.value.name).toBe('')
  })

  it('validates email format', () => {
    const { setFieldValue, validateAll, errors } = useRplFormValidation(
      { email: '' },
      { email: [rplValidationRules.required(), rplValidationRules.email()] }
    )
    setFieldValue('email', 'not-an-email')
    validateAll()
    expect(errors.value.email).toBe('Please enter a valid email address')
  })

  it('passes email validation for valid email', () => {
    const { setFieldValue, validateAll, errors } = useRplFormValidation(
      { email: '' },
      { email: [rplValidationRules.email()] }
    )
    setFieldValue('email', 'test@example.com')
    validateAll()
    expect(errors.value.email).toBe('')
  })

  it('validates minimum length', () => {
    const { setFieldValue, validateAll, errors } = useRplFormValidation(
      { password: '' },
      { password: [rplValidationRules.minLength(8)] }
    )
    setFieldValue('password', 'short')
    validateAll()
    expect(errors.value.password).toBe('Must be at least 8 characters')
  })

  it('validates maximum length', () => {
    const { setFieldValue, validateAll, errors } = useRplFormValidation(
      { bio: '' },
      { bio: [rplValidationRules.maxLength(10)] }
    )
    setFieldValue('bio', 'This is way too long for the limit')
    validateAll()
    expect(errors.value.bio).toBe('Must be no more than 10 characters')
  })

  it('validates custom pattern', () => {
    const { setFieldValue, validateAll, errors } = useRplFormValidation(
      { phone: '' },
      { phone: [rplValidationRules.pattern(/^\d{10}$/, 'Must be 10 digits')] }
    )
    setFieldValue('phone', '123')
    validateAll()
    expect(errors.value.phone).toBe('Must be 10 digits')
  })

  it('computes isValid correctly', () => {
    const { isValid, setFieldValue } = useRplFormValidation(
      { name: '' },
      { name: [rplValidationRules.required()] }
    )
    expect(isValid.value).toBe(false)
    setFieldValue('name', 'John')
    expect(isValid.value).toBe(true)
  })

  it('resets form to initial values', () => {
    const { setFieldValue, resetForm, getFieldValue, getFieldError } = useRplFormValidation(
      { name: 'initial' },
      { name: [rplValidationRules.required()] }
    )
    setFieldValue('name', 'changed')
    expect(getFieldValue('name')).toBe('changed')
    resetForm()
    expect(getFieldValue('name')).toBe('initial')
    expect(getFieldError('name')).toBe('')
  })

  it('only shows errors for touched fields', () => {
    const { getFieldError } = useRplFormValidation(
      { name: '' },
      { name: [rplValidationRules.required()] }
    )
    // Field not touched yet, so error should be empty
    expect(getFieldError('name')).toBe('')
  })

  it('validates boolean required for checkbox-like fields', () => {
    const { validateAll, errors } = useRplFormValidation(
      { accepted: false },
      { accepted: [rplValidationRules.required('You must accept')] }
    )
    validateAll()
    expect(errors.value.accepted).toBe('You must accept')
  })

  it('runs multiple rules in order and stops at first failure', () => {
    const { setFieldValue, validateAll, errors } = useRplFormValidation(
      { email: '' },
      { email: [rplValidationRules.required('Email is required'), rplValidationRules.email()] }
    )
    setFieldValue('email', '')
    validateAll()
    // Should fail on required first
    expect(errors.value.email).toBe('Email is required')
  })

  it('handles fields with no rules', () => {
    const { validateAll, errors } = useRplFormValidation(
      { name: '', optional: '' },
      { name: [rplValidationRules.required()] }
    )
    validateAll()
    expect(errors.value.optional).toBe('')
  })
})
