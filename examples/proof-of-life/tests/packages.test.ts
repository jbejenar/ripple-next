import { describe, it, expect } from 'vitest'

describe('downstream package consumption', () => {
  it('imports @ripple-next/shared successfully', async () => {
    const shared = await import('@ripple-next/shared')
    expect(shared).toBeDefined()
    expect(typeof shared.formatDate).toBe('function')
  })

  it('imports @ripple-next/validation successfully', async () => {
    const validation = await import('@ripple-next/validation')
    expect(validation).toBeDefined()
    expect(validation.createUserSchema).toBeDefined()
  })

  it('validates user input with @ripple-next/validation', async () => {
    const { createUserSchema } = await import('@ripple-next/validation')
    const validResult = createUserSchema.safeParse({
      email: 'test@example.gov.au',
      name: 'Test User',
    })
    expect(validResult.success).toBe(true)

    const invalidResult = createUserSchema.safeParse({
      email: 'not-an-email',
      name: '',
    })
    expect(invalidResult.success).toBe(false)
  })
})
