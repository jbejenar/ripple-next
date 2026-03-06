import { describe, it, expect } from 'vitest'
import { slugify, truncate, formatDate, objectKeys, sleep } from '../utils/index'

describe('slugify', () => {
  it('converts text to lowercase kebab-case', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello, World! @#$%')).toBe('hello-world-')
  })

  it('replaces underscores with hyphens', () => {
    expect(slugify('hello_world')).toBe('hello-world')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world')
  })

  it('trims whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles strings with only special characters', () => {
    expect(slugify('!@#$%')).toBe('')
  })

  it('handles multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })
})

describe('truncate', () => {
  it('returns string unchanged if within maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('returns string unchanged if exactly maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates and adds ellipsis when exceeding maxLength', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
  })

  it('handles very short maxLength', () => {
    expect(truncate('hello', 3)).toBe('...')
  })

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('')
  })
})

describe('formatDate', () => {
  it('formats a Date object in Australian locale', () => {
    const date = new Date('2025-03-15T00:00:00Z')
    const formatted = formatDate(date)
    // en-AU format: "15 March 2025"
    expect(formatted).toContain('March')
    expect(formatted).toContain('2025')
  })

  it('accepts a date string', () => {
    const formatted = formatDate('2025-01-01T00:00:00Z')
    expect(formatted).toContain('January')
    expect(formatted).toContain('2025')
  })

  it('accepts custom format options', () => {
    const formatted = formatDate(new Date('2025-06-15T00:00:00Z'), {
      year: 'numeric',
      month: 'short',
    })
    expect(formatted).toContain('Jun')
    expect(formatted).toContain('2025')
  })
})

describe('objectKeys', () => {
  it('returns typed keys of an object', () => {
    const obj = { a: 1, b: 'two', c: true }
    const keys = objectKeys(obj)
    expect(keys).toEqual(['a', 'b', 'c'])
  })

  it('returns empty array for empty object', () => {
    const keys = objectKeys({})
    expect(keys).toEqual([])
  })
})

describe('sleep', () => {
  it('resolves after specified milliseconds', async () => {
    const start = Date.now()
    await sleep(50)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(40) // allow small timing variance
  })

  it('returns a Promise<void>', async () => {
    const result = await sleep(1)
    expect(result).toBeUndefined()
  })
})
